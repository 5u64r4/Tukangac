import React, { useState, useEffect } from 'react';
import { UserRole, CustomerTab, TechnicianTab, AdminTab, Order, Technician, Article } from './types';
import { INITIAL_ORDERS, TECHNICIANS } from './data/initialData';
import { ARTICLES_DATA } from './data/articlesData';
import { Navbar } from './components/Navbar';
import { CustomerView } from './components/CustomerView';
import { AdminView } from './components/AdminView';
import { TechnicianView } from './components/TechnicianView';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';
import { initializeDatabaseIfEmpty } from './services/databaseInit';
import { createBookingOrder } from './services/customerService';
import { updateAdminOrderStatus, subscribeAdminOrders, logAuditEvent } from './services/adminService';
import { updateTechnicianOrderStatus, subscribeTechnicians } from './services/technicianService';
import { subscribeArticles, getAllArticles } from './services/articleService';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('beranda');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [technicians, setTechnicians] = useState<Technician[]>(TECHNICIANS);
  const [articles, setArticles] = useState<Article[]>(ARTICLES_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDatabaseInspectorOpen, setIsDatabaseInspectorOpen] = useState(false);

  // Initialize and synchronize Firebase Firestore on startup
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeTechs: (() => void) | null = null;
    let unsubscribeArticles: (() => void) | null = null;

    const setupBackendDatabase = async () => {
      try {
        await initializeDatabaseIfEmpty();

        // Subscribe to real-time orders collection
        unsubscribeOrders = subscribeAdminOrders((liveOrders) => {
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          }
        });

        // Subscribe to real-time technicians collection
        unsubscribeTechs = subscribeTechnicians((liveTechs) => {
          if (liveTechs && liveTechs.length > 0) {
            setTechnicians(liveTechs);
          }
        });

        // Subscribe to real-time articles collection
        unsubscribeArticles = subscribeArticles((liveArticles) => {
          if (liveArticles && liveArticles.length > 0) {
            setArticles(liveArticles);
          }
        });
      } catch (err) {
        console.warn('Firebase initialization notice:', err);
      }
    };

    setupBackendDatabase();

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeTechs) unsubscribeTechs();
      if (unsubscribeArticles) unsubscribeArticles();
    };
  }, []);

  const handleRefreshArticles = async () => {
    try {
      const refreshed = await getAllArticles();
      setArticles(refreshed);
    } catch (e) {
      console.warn('Error refreshing articles:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleAddNewOrder = async (newOrderData: Partial<Order>) => {
    const fullOrder: Order = {
      ...newOrderData,
      id: newOrderData.id || `AC2608${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOrderData.customerName || 'Budi Santoso',
      customerPhone: newOrderData.customerPhone || '0812-3456-7890',
      serviceName: newOrderData.serviceName || 'Cuci AC',
      unitCount: newOrderData.unitCount || 1,
      complaint: newOrderData.complaint || '',
      addressLabel: newOrderData.addressLabel || 'Rumah',
      fullAddress: newOrderData.fullAddress || 'Bekasi Selatan',
      date: newOrderData.date || '28 Agu 2026',
      timeSlot: newOrderData.timeSlot || '10:00–12:00',
      totalPrice: newOrderData.totalPrice || 75000,
      status: newOrderData.status || 'baru',
      createdAt: newOrderData.createdAt || 'Baru saja'
    };

    if (newOrderData.technicianName) {
      fullOrder.technicianName = newOrderData.technicianName;
    }

    // Optimistic UI update
    setOrders((prev) => [fullOrder, ...prev]);

    // Persist to Cloud Firestore Database
    try {
      await createBookingOrder(fullOrder);
      await logAuditEvent('CREATE_BOOKING', currentRole, `Order: ${fullOrder.id}`, `Order baru: ${fullOrder.serviceName} (${fullOrder.customerName})`);
    } catch (err) {
      console.warn('Could not write order directly to Firestore:', err);
    }
  };

  const handleAssignTechnician = async (orderId: string, techName: string) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              technicianName: techName,
              status: 'menuju',
              estimatedArrival: '09:15',
              technicianRating: 4.9,
              technicianDistance: '1,8 km'
            }
          : ord
      )
    );

    // Persist to Firestore Admin Database
    try {
      await updateAdminOrderStatus(orderId, 'menuju', techName);
    } catch (err) {
      console.warn('Could not update order status in Firestore:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    // Persist to Firestore Technician Database
    try {
      await updateTechnicianOrderStatus(orderId, newStatus);
      await logAuditEvent('UPDATE_STATUS_TECH', 'technician', `Order: ${orderId}`, `Status pengerjaan diubah ke: ${newStatus}`);
    } catch (err) {
      console.warn('Could not update technician order status in Firestore:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    showToast('Membuka WhatsApp CS Tukang AC Online: +62 812-3456-7890 (Respon Cepat 24 Jam)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100/95 to-slate-200/80 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar in Sky Blue Theme with Database Inspector button */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenDatabaseInspector={() => setIsDatabaseInspectorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-24">
        {currentRole === 'customer' && (
          <CustomerView
            activeTab={customerTab}
            setActiveTab={setCustomerTab}
            orders={orders}
            articles={articles}
            onAddNewOrder={handleAddNewOrder}
            onToast={showToast}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            orders={orders}
            technicians={technicians}
            articles={articles}
            activeTab={adminTab}
            setActiveTab={setAdminTab}
            onRefreshArticles={handleRefreshArticles}
            onAssignTechnician={handleAssignTechnician}
            onAddNewOrder={handleAddNewOrder}
            onToast={showToast}
          />
        )}

        {currentRole === 'technician' && (
          <TechnicianView
            orders={orders}
            activeTab={technicianTab}
            setActiveTab={setTechnicianTab}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToast={showToast}
          />
        )}
      </main>

      {/* Database Inspector Modal (Separated Customer, Admin, Technician) */}
      <DatabaseInspectorModal
        isOpen={isDatabaseInspectorOpen}
        onClose={() => setIsDatabaseInspectorOpen(false)}
        onToast={showToast}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Bottom Floating Navigation for Mobile & Quick Tabs */}
      <BottomNav
        currentRole={currentRole}
        customerTab={customerTab}
        setCustomerTab={(tab) => {
          setCustomerTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        technicianTab={technicianTab}
        setTechnicianTab={(tab) => {
          setTechnicianTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        adminTab={adminTab}
        setAdminTab={(tab) => {
          setAdminTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToast={showToast}
      />
    </div>
  );
}

