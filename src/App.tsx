import React, { useState, useEffect } from 'react';
import { UserRole, CustomerTab, TechnicianTab, AdminTab, Order, Technician, Article } from './types';
import { INITIAL_ORDERS, TECHNICIANS } from './data/initialData';
import { ARTICLES_DATA } from './data/articlesData';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { CustomerView } from './components/CustomerView';
import { AdminView } from './components/AdminView';
import { TechnicianView } from './components/TechnicianView';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';
import { initializeDatabaseIfEmpty } from './services/databaseInit';
import { createBookingOrder, subscribeCustomerOrders } from './services/customerService';
import { updateAdminOrderStatus, subscribeAdminOrders, logAuditEvent } from './services/adminService';
import { updateTechnicianOrderStatus, subscribeTechnicians, subscribeTechnicianOrders } from './services/technicianService';
import { subscribeArticles, getAllArticles } from './services/articleService';
import { 
  getCurrentUserProfile, 
  onAuthStateChange, 
  signOutUser, 
  updateUserProfileRole, 
  UserProfile,
  isSuperadminEmail,
  SUPERADMIN_EMAIL
} from './services/authService';

export default function App() {
  // 1. Core Authentication & Screen State (Single Source of Truth)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authenticatedProfile, setAuthenticatedProfile] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  // 2. Tab Navigation States
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('beranda');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');

  // 3. Application Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>(TECHNICIANS);
  const [articles, setArticles] = useState<Article[]>(ARTICLES_DATA);

  // 4. Modals and Notifications (Defaulted to false)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDatabaseInspectorOpen, setIsDatabaseInspectorOpen] = useState(false);

  // 5. Explicit Route Architecture:
  // "/" = Public Home/Landing Page (when unauthenticated) or Role Dashboard (when authenticated)
  // "/login" = Supabase Auth Login/Register Screen
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login'>('home');

  // Synchronize route with browser URL on load, popstate, or hashchange
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#/', '').replace('#', '');
      
      if (pathname === '/login' || hash === 'login') {
        if (isAuthenticated && authenticatedProfile) {
          // If already authenticated, never show login; redirect to home
          setCurrentRoute('home');
          try {
            window.history.replaceState(null, '', '/');
          } catch (_) {}
        } else {
          setCurrentRoute('login');
        }
      } else {
        setCurrentRoute('home');
      }
    };

    syncRouteFromLocation();
    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, [isAuthenticated, authenticatedProfile]);

  const navigateTo = (route: 'home' | 'login', path: string = '/') => {
    setCurrentRoute(route);
    try {
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Debugging log for state monitoring
  useEffect(() => {
    console.log('AUTH & ROUTING STATE:', {
      isLoading,
      isAuthenticated,
      user: authenticatedProfile?.email || null,
      role: currentRole
    });
  }, [isLoading, isAuthenticated, authenticatedProfile, currentRole]);

  // Initial Auth Check and Supabase Realtime synchronization
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeTechs: (() => void) | null = null;
    let unsubscribeArticles: (() => void) | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    const bootstrapApplication = async () => {
      try {
        // Step 1: Check existing Supabase authentication session
        const profile = await getCurrentUserProfile();
        if (profile) {
          setAuthenticatedProfile(profile);
          setIsAuthenticated(true);
          setCurrentRole(profile.role);
        } else {
          setAuthenticatedProfile(null);
          setIsAuthenticated(false);
          setCurrentRole(null);
        }

        // Step 2: Listen for Supabase Auth state changes
        unsubscribeAuth = onAuthStateChange((updatedProfile) => {
          if (updatedProfile) {
            setAuthenticatedProfile(updatedProfile);
            setIsAuthenticated(true);
            setCurrentRole(updatedProfile.role);
          } else {
            setAuthenticatedProfile(null);
            setIsAuthenticated(false);
            setCurrentRole(null);
          }
        });

        // Step 3: Initialize database if empty
        await initializeDatabaseIfEmpty();

        // Step 4: Realtime subscriptions (Techs and articles)
        unsubscribeTechs = subscribeTechnicians((liveTechs) => {
          if (liveTechs && liveTechs.length > 0) {
            setTechnicians(liveTechs);
          }
        });

        unsubscribeArticles = subscribeArticles((liveArticles) => {
          if (liveArticles && liveArticles.length > 0) {
            setArticles(liveArticles);
          }
        });
      } catch (err) {
        console.warn('Bootstrap initialization notice:', err);
      } finally {
        // Brief smooth splash display before presenting single active screen
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    bootstrapApplication();

    return () => {
      if (unsubscribeTechs) unsubscribeTechs();
      if (unsubscribeArticles) unsubscribeArticles();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // Synchronize orders strictly based on Supabase Auth session and user role
  useEffect(() => {
    // If not logged in, user is strictly guest: NEVER load or query private orders
    if (!isAuthenticated || !authenticatedProfile) {
      setOrders([]);
      return;
    }

    let unsub: (() => void) | null = null;
    const role = authenticatedProfile.role;

    if (role === 'customer') {
      unsub = subscribeCustomerOrders(
        authenticatedProfile.id,
        authenticatedProfile.phone,
        (liveOrders) => {
          setOrders(liveOrders || []);
        }
      );
    } else if (role === 'technician') {
      unsub = subscribeTechnicianOrders(
        authenticatedProfile.id,
        authenticatedProfile.fullName,
        (liveOrders) => {
          setOrders(liveOrders || []);
        }
      );
    } else if (role === 'admin' || role === 'superadmin') {
      unsub = subscribeAdminOrders((liveOrders) => {
        setOrders(liveOrders || []);
      });
    }

    return () => {
      if (unsub) unsub();
    };
  }, [
    isAuthenticated,
    authenticatedProfile?.id,
    authenticatedProfile?.role,
    authenticatedProfile?.phone,
    authenticatedProfile?.fullName
  ]);

  const handleRefreshArticles = async () => {
    try {
      const refreshed = await getAllArticles();
      setArticles(refreshed);
    } catch (e) {
      console.warn('Error refreshing articles:', e);
    }
  };

  // Defensive showToast: filters out undefined / corrupted messages
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

  // Auth Success Handler: redirects to root and dashboard role
  const handleAuthSuccess = (profile: UserProfile) => {
    setAuthenticatedProfile(profile);
    setIsAuthenticated(true);
    setCurrentRole(profile.role);
    navigateTo('home', '/');
  };

  // Direct URL route inspection & authorization enforcement
  useEffect(() => {
    const checkDirectUrlRoute = () => {
      if (!isAuthenticated || !authenticatedProfile) return;

      const hash = window.location.hash.toLowerCase().replace('#/', '').replace('#', '');
      const searchParams = new URLSearchParams(window.location.search);
      const requestedRole = (hash || searchParams.get('role') || searchParams.get('view'))?.toLowerCase();

      if (!requestedRole) return;

      const isSuper = isSuperadminEmail(authenticatedProfile.email) || authenticatedProfile.role === 'superadmin';
      const isAdm = authenticatedProfile.role === 'admin';

      if (requestedRole === 'superadmin' && !isSuper) {
        showToast('ACCESS DENIED: Akses ditolak. Hanya Superadmin yang memiliki izin.');
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_) {}
        return;
      }

      if (requestedRole === 'admin' && !isAdm && !isSuper) {
        showToast('ACCESS DENIED: Akses ditolak. Halaman ini memerlukan hak akses Administrator.');
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_) {}
        return;
      }

      if (requestedRole === 'technician' && authenticatedProfile.role === 'customer') {
        showToast('ACCESS DENIED: Akses ditolak. Akun Anda belum disetujui sebagai Teknisi.');
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_) {}
        return;
      }

      // Enforce: role strictly follows database profile role
      if (['customer', 'technician', 'admin', 'superadmin'].includes(requestedRole)) {
        if (requestedRole !== authenticatedProfile.role && !isSuper) {
          showToast('ACCESS DENIED: Peran terkunci sesuai profil database Anda.');
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch (_) {}
        }
      }
    };

    checkDirectUrlRoute();
    window.addEventListener('hashchange', checkDirectUrlRoute);
    return () => window.removeEventListener('hashchange', checkDirectUrlRoute);
  }, [isAuthenticated, authenticatedProfile]);

  // Full Logout Flow
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Error during sign out:', err);
    }
    setAuthenticatedProfile(null);
    setIsAuthenticated(false);
    setCurrentRole(null);
    setCustomerTab('home');
    setTechnicianTab('beranda');
    setAdminTab('orders');
    navigateTo('home', '/');
    showToast('Anda telah berhasil keluar dari akun.');
  };

  const handleAddNewOrder = async (newOrderData: Partial<Order>) => {
    const fullOrder: Order = {
      ...newOrderData,
      id: newOrderData.id || `AC2608${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: authenticatedProfile?.id || newOrderData.customerId,
      customerName: newOrderData.customerName || (authenticatedProfile?.fullName || 'Pelanggan'),
      customerPhone: newOrderData.customerPhone || (authenticatedProfile?.phone || ''),
      serviceName: newOrderData.serviceName || 'Cuci AC',
      unitCount: newOrderData.unitCount || 1,
      complaint: newOrderData.complaint || '',
      addressLabel: newOrderData.addressLabel || 'Rumah',
      fullAddress: newOrderData.fullAddress || 'Bekasi Selatan',
      date: newOrderData.date || '28 Agu 2026',
      timeSlot: newOrderData.timeSlot || '10:00–12:00',
      totalPrice: newOrderData.totalPrice || 75000,
      status: 'baru',
      createdAt: newOrderData.createdAt || 'Baru saja'
    };

    if (newOrderData.technicianName) {
      fullOrder.technicianName = newOrderData.technicianName;
    }
    if (newOrderData.technicianId) {
      fullOrder.technicianId = newOrderData.technicianId;
    }

    // Optimistic UI update
    setOrders((prev) => [fullOrder, ...prev]);

    // Persist to Supabase Database
    try {
      await createBookingOrder(fullOrder);
      await logAuditEvent(
        'CREATE_BOOKING',
        currentRole || 'customer',
        `Order: ${fullOrder.id}`,
        `Order baru: ${fullOrder.serviceName} (${fullOrder.customerName})`
      );
    } catch (err) {
      console.warn('Could not write order directly to Supabase:', err);
    }
  };

  const handleAssignTechnician = async (orderId: string, techNameOrId: string) => {
    const tech = technicians.find((t) => t.id === techNameOrId || t.name === techNameOrId);
    const resolvedId = tech?.id;
    const resolvedName = tech?.name || techNameOrId;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              technicianId: resolvedId,
              technicianName: resolvedName,
              status: 'menuju',
              estimatedArrival: '09:15',
              technicianRating: tech?.rating || 4.9,
              technicianDistance: tech?.distance || '1,8 km'
            }
          : ord
      )
    );

    try {
      await updateAdminOrderStatus(orderId, 'menuju', resolvedName, resolvedId);
    } catch (err) {
      console.warn('Could not update order status in Supabase:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    try {
      await updateTechnicianOrderStatus(orderId, newStatus);
      await logAuditEvent(
        'UPDATE_STATUS_TECH',
        'technician',
        `Order: ${orderId}`,
        `Status pengerjaan diubah ke: ${newStatus}`
      );
    } catch (err) {
      console.warn('Could not update technician order status in Supabase:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    showToast('Membuka WhatsApp CS Tukang AC Online: +62 812-3456-7890 (Respon Cepat 24 Jam)');
  };

  // ============================================================================
  // CONDITIONAL RENDERING: SINGLE ACTIVE SCREEN ARCHITECTURE
  // ============================================================================

  // 1. Initial Loading Screen
  if (isLoading) {
    return <SplashScreen />;
  }

  // 2. Explicit Authentication Screen (Only when on /login and unauthenticated)
  if (currentRoute === 'login' && !isAuthenticated) {
    return (
      <>
        <AuthScreen 
          onLoginSuccess={handleAuthSuccess} 
          onToast={showToast} 
          onBackToHome={() => navigateTo('home', '/')}
        />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </>
    );
  }

  // 3. Main Application (Root "/" = Public Landing Page when unauthenticated, or Role Dashboard when authenticated)
  const activeRole: UserRole = authenticatedProfile?.role || currentRole || 'customer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100/95 to-slate-200/80 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar with Current Role Info, Hamburger ☰ Menu, and Login Access */}
      <Navbar
        currentRole={activeRole}
        userProfile={authenticatedProfile}
        isAuthenticated={isAuthenticated}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenDatabaseInspector={() => setIsDatabaseInspectorOpen(true)}
        onLogout={handleLogout}
        onOpenAuth={() => navigateTo('login', '/login')}
        onNavigateHome={() => {
          setCustomerTab('home');
          navigateTo('home', '/');
        }}
        onNavigateCustomerTab={(tab) => {
          setCustomerTab(tab);
          navigateTo('home', '/');
        }}
        onNavigateTechnicianTab={(tab) => {
          setTechnicianTab(tab);
          navigateTo('home', '/');
        }}
        onNavigateAdminTab={(tab) => {
          setAdminTab(tab);
          navigateTo('home', '/');
        }}
      />

      {/* Main Content Area: Renders CustomerView for public / customer, or TechnicianView / AdminView for role */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-24">
        {(!isAuthenticated || activeRole === 'customer') && (
          <CustomerView
            activeTab={customerTab}
            setActiveTab={setCustomerTab}
            orders={isAuthenticated ? orders : []}
            articles={articles}
            onAddNewOrder={handleAddNewOrder}
            onToast={showToast}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            onOpenAuth={() => navigateTo('login', '/login')}
            userProfile={authenticatedProfile}
          />
        )}

        {isAuthenticated && activeRole === 'technician' && (
          <TechnicianView
            orders={orders}
            activeTab={technicianTab}
            setActiveTab={setTechnicianTab}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToast={showToast}
          />
        )}

        {isAuthenticated && (activeRole === 'admin' || activeRole === 'superadmin') && (
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
      </main>

      {/* Database Inspector Modal (Restricted to Admin / Superadmin in Navbar) */}
      {isAuthenticated && (activeRole === 'admin' || activeRole === 'superadmin') && (
        <DatabaseInspectorModal
          isOpen={isDatabaseInspectorOpen}
          onClose={() => setIsDatabaseInspectorOpen(false)}
          onToast={showToast}
        />
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Bottom Floating Navigation: Untuk semua role (Customer / Public, Teknisi, Admin, Superadmin) */}
      <BottomNav
        currentRole={isAuthenticated ? activeRole : 'customer'}
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
