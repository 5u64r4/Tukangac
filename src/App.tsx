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
import { getCurrentUserProfile, onAuthStateChange, UserProfile } from './services/authService';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [authenticatedProfile, setAuthenticatedProfile] = useState<UserProfile | null>(null);
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('beranda');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [technicians, setTechnicians] = useState<Technician[]>(TECHNICIANS);
  const [articles, setArticles] = useState<Article[]>(ARTICLES_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDatabaseInspectorOpen, setIsDatabaseInspectorOpen] = useState(false);

  // Development/Demo Mode Flag:
  // When an authenticated user is logged in, their role comes directly from profiles.role
  const isDemoMode = !authenticatedProfile;

  // Initialize and synchronize Supabase Realtime backend on startup
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeTechs: (() => void) | null = null;
    let unsubscribeArticles: (() => void) | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    const setupBackendDatabase = async () => {
      try {
        // Initial auth check
        const profile = await getCurrentUserProfile();
        if (profile) {
          setAuthenticatedProfile(profile);
          setCurrentRole(profile.role);
        }

        // Listen for Supabase Auth state changes
        unsubscribeAuth = onAuthStateChange((updatedProfile) => {
          setAuthenticatedProfile(updatedProfile);
          if (updatedProfile) {
            setCurrentRole(updatedProfile.role);
          }
        });

        // Initialize Supabase tables if empty
        await initializeDatabaseIfEmpty();

        // Subscribe to real-time orders via Supabase Realtime
        unsubscribeOrders = subscribeAdminOrders((liveOrders) => {
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          }
        });

        // Subscribe to real-time technicians via Supabase Realtime
        unsubscribeTechs = subscribeTechnicians((liveTechs) => {
          if (liveTechs && liveTechs.length > 0) {
            setTechnicians(liveTechs);
          }
        });

        // Subscribe to real-time articles via Supabase Realtime
        unsubscribeArticles = subscribeArticles((liveArticles) => {
          if (liveArticles && liveArticles.length > 0) {
            setArticles(liveArticles);
          }
        });
      } catch (err) {
        console.warn('Supabase initialization notice:', err);
      }
    };

    setupBackendDatabase();

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeTechs) unsubscribeTechs();
      if (unsubscribeArticles) unsubscribeArticles();
      if (unsubscribeAuth) unsubscribeAuth();
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

  // Defensive showToast: never displays undefined, null, or corrupted string templates
  const showToast = (msg: unknown) => {
    if (!msg || typeof msg !== 'string') return;
    const clean = msg.trim();
    if (
      !clean ||
      clean.includes('undefined') ||
      clean.includes('null') ||
      clean.includes('[object Object]')
    ) {
      return;
    }

    setToastMessage(clean);
    setTimeout(() => {
      setToastMessage((prev) => (prev === clean ? null : prev));
    }, 3200);
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

    // Persist to Supabase Database
    try {
      await createBookingOrder(fullOrder);
      await logAuditEvent('CREATE_BOOKING', currentRole, `Order: ${fullOrder.id}`, `Order baru: ${fullOrder.serviceName} (${fullOrder.customerName})`);
    } catch (err) {
      console.warn('Could not write order directly to Supabase:', err);
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

    // Persist to Supabase Orders Table
    try {
      await updateAdminOrderStatus(orderId, 'menuju', techName);
    } catch (err) {
      console.warn('Could not update order status in Supabase:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    // Persist to Supabase Orders Table
    try {
      await updateTechnicianOrderStatus(orderId, newStatus);
      await logAuditEvent('UPDATE_STATUS_TECH', 'technician', `Order: ${orderId}`, `Status pengerjaan diubah ke: ${newStatus}`);
    } catch (err) {
      console.warn('Could not update technician order status in Supabase:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    showToast('Membuka WhatsApp CS Tukang AC Online: +62 812-3456-7890 (Respon Cepat 24 Jam)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100/95 to-slate-200/80 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar with Supabase Database Explorer access for Admin */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          // If user is authenticated in production, they cannot switch to admin unless their profile.role is admin
          if (authenticatedProfile && role === 'admin' && authenticatedProfile.role !== 'admin') {
            showToast('Akses ditolak: Akun Anda tidak memiliki peran Admin');
            return;
          }
          setCurrentRole(role);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenDatabaseInspector={() => setIsDatabaseInspectorOpen(true)}
        isDemoMode={isDemoMode}
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

      {/* Database Inspector Modal (Restricted to Admin in Navbar) */}
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
