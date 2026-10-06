import React, { useState, useRef, useEffect } from 'react';
import { UserRole, CustomerTab, TechnicianTab, AdminTab } from '../types';
import { UserProfile, isSuperadminEmail } from '../services/authService';
import { 
  Snowflake, 
  ShieldCheck, 
  PhoneCall, 
  Menu, 
  X, 
  User, 
  Shield, 
  Wrench, 
  LogOut,
  Sparkles,
  Database,
  Home,
  LogIn,
  PlusCircle,
  Navigation,
  Clock,
  Calendar,
  Wallet,
  BarChart3,
  Percent,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentRole: UserRole;
  userProfile?: UserProfile | null;
  isAuthenticated: boolean;
  onOpenWhatsApp: () => void;
  onOpenDatabaseInspector: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onNavigateHome: () => void;
  onNavigateCustomerTab?: (tab: CustomerTab) => void;
  onNavigateTechnicianTab?: (tab: TechnicianTab) => void;
  onNavigateAdminTab?: (tab: AdminTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  userProfile,
  isAuthenticated,
  onOpenWhatsApp,
  onOpenDatabaseInspector,
  onLogout,
  onOpenAuth,
  onNavigateHome,
  onNavigateCustomerTab,
  onNavigateTechnicianTab,
  onNavigateAdminTab
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const isSuperadmin = isSuperadminEmail(userProfile?.email) || currentRole === 'superadmin' || userProfile?.role === 'superadmin';

  const roleDetails: Record<UserRole, { label: string; badge: string; color: string; icon: React.ReactNode }> = {
    customer: {
      label: 'Pelanggan',
      badge: 'Pelanggan',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <User className="w-4 h-4 text-sky-600" />
    },
    technician: {
      label: 'Teknisi',
      badge: 'Teknisi',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: <Wrench className="w-4 h-4 text-teal-600" />
    },
    admin: {
      label: 'Admin',
      badge: 'Admin',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <Shield className="w-4 h-4 text-indigo-600" />
    },
    superadmin: {
      label: 'Superadmin',
      badge: 'Superadmin',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Shield className="w-4 h-4 text-purple-600" />
    }
  };

  const currentRoleInfo = roleDetails[currentRole] || roleDetails.customer;
  const isAdmin = currentRole === 'admin' || currentRole === 'superadmin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md shadow-slate-900/6 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Brand Logo (Clicks to return to Home) */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
          title="Kembali ke Beranda"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900">
                Tukang AC <span className="text-sky-600">Online</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                Resmi & Bergaransi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
              Solusi Service & Perawatan AC Terpercaya
            </p>
          </div>
        </div>

        {/* Center / Right: Current Role Badge, Admin DB, WA Button & Menu */}
        <div className="flex items-center gap-2 sm:gap-3 relative" ref={menuRef}>
          {/* Quick Database Inspector Button: RESTRICTED TO ADMIN ONLY */}
          {isAuthenticated && isAdmin && (
            <button
              onClick={onOpenDatabaseInspector}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 text-sky-400 hover:bg-slate-800 font-bold text-xs border border-slate-700 shadow-xs transition-colors cursor-pointer"
              title="Buka Database Supabase (Admin Only)"
            >
              <Database className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="hidden sm:inline">Supabase DB</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">Admin</span>
            </button>
          )}

          {/* Quick WA button */}
          <button
            onClick={onOpenWhatsApp}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer"
            title="Hubungi CS WhatsApp Siaga"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast Respon</span>
          </button>

          {/* Current Role Tag Badge (Only displayed when logged in) */}
          {isAuthenticated && (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="capitalize font-bold text-slate-800">{currentRoleInfo.label}</span>
            </div>
          )}

          {/* Hamburger (☰) Menu Trigger */}
          <button
            id="role-menu-trigger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Buka Menu Navigasi"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              isMenuOpen
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/25 scale-95'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-xs'
            }`}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-current" />
            ) : (
              <Menu className="w-5 h-5 text-current" />
            )}
            <span className="hidden sm:inline text-xs font-bold">
              {isMenuOpen ? 'Tutup' : isAuthenticated ? 'Akun' : 'Menu'}
            </span>
          </button>

          {/* Dropdown Menu when clicked */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-13 sm:top-14 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 overflow-hidden"
              >
                {!isAuthenticated ? (
                  /* ============================================================ */
                  /* PUBLIC / GUEST MENU (When user is NOT logged in)              */
                  /* Items: Beranda, Masuk / Daftar, Booking, Tracking, Pesanan, Profil */
                  /* ============================================================ */
                  <>
                    <div className="pb-3 border-b border-slate-100 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          Menu Navigasi
                        </span>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          Tukang AC Online
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Beranda */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (onNavigateCustomerTab) {
                            onNavigateCustomerTab('home');
                          } else {
                            onNavigateHome();
                          }
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                          <Home className="w-4 h-4" />
                        </div>
                        <span>Beranda</span>
                      </button>

                      {/* Masuk / Daftar (Paling Menonjol) */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-between shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-white/20 text-white">
                            <LogIn className="w-4 h-4" />
                          </div>
                          <span>Masuk / Daftar</span>
                        </div>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                          Akun
                        </span>
                      </button>

                      {/* Booking */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigateCustomerTab?.('booking');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                            <PlusCircle className="w-4 h-4" />
                          </div>
                          <span>Booking</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                          Login diperlukan
                        </span>
                      </button>

                      {/* Tracking */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigateCustomerTab?.('tracking');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                            <Navigation className="w-4 h-4" />
                          </div>
                          <span>Tracking</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                          Login diperlukan
                        </span>
                      </button>

                      {/* Pesanan */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigateCustomerTab?.('orders');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span>Pesanan</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                          Login diperlukan
                        </span>
                      </button>

                      {/* Profil */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigateCustomerTab?.('profile');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                            <User className="w-4 h-4" />
                          </div>
                          <span>Profil</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                          Login diperlukan
                        </span>
                      </button>

                      {/* Divider */}
                      <div className="pt-2 border-t border-slate-100 my-1" />

                      {/* Bantuan CS WhatsApp */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenWhatsApp();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-3 transition-colors cursor-pointer border border-emerald-100/60"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <span>Bantuan CS WhatsApp</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* ============================================================ */
                  /* AUTHENTICATED USER MENU (According to Supabase Profile Role) */
                  /* ============================================================ */
                  <>
                    {/* User Profile Summary */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {userProfile?.fullName || 'Pengguna Terverifikasi'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {userProfile?.email || 'Akun Aktif'}
                        </p>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full border ${currentRoleInfo.color}`}>
                          {currentRoleInfo.badge}
                        </span>
                      </div>
                    </div>

                    {/* Role Navigation Items: Customer */}
                    {currentRole === 'customer' && (
                      <div className="space-y-1 mb-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateCustomerTab?.('home');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Home className="w-4 h-4 text-sky-600" />
                          <span>Beranda</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateCustomerTab?.('booking');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-sky-600" />
                          <span>Booking Servis</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateCustomerTab?.('tracking');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-4 h-4 text-sky-600" />
                          <span>Tracking Teknisi</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateCustomerTab?.('orders');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-sky-600" />
                          <span>Pesanan Saya</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateCustomerTab?.('profile');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-sky-600" />
                          <span>Profil Akun</span>
                        </button>
                      </div>
                    )}

                    {/* Role Navigation Items: Technician */}
                    {currentRole === 'technician' && (
                      <div className="space-y-1 mb-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateTechnicianTab?.('beranda');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Home className="w-4 h-4 text-teal-600" />
                          <span>Beranda & Tugas</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateTechnicianTab?.('jadwal');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-teal-600" />
                          <span>Jadwal Kunjungan</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateTechnicianTab?.('pendapatan');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Wallet className="w-4 h-4 text-teal-600" />
                          <span>Pendapatan & Komisi</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateTechnicianTab?.('pelamar');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Wrench className="w-4 h-4 text-amber-600" />
                          <span>Kemitraan Teknisi</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateTechnicianTab?.('profil');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-teal-600" />
                          <span>Profil & Sertifikasi</span>
                        </button>
                      </div>
                    )}

                    {/* Role Navigation Items: Admin & Superadmin */}
                    {(currentRole === 'admin' || currentRole === 'superadmin') && (
                      <div className="space-y-1 mb-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateAdminTab?.('orders');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span>Orders & Analitik</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateAdminTab?.('technician_reports');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                          <span>Laporan Teknisi</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateAdminTab?.('commission');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Percent className="w-4 h-4 text-indigo-600" />
                          <span>Pengaturan Komisi</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateAdminTab?.('applicants');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>Daftar Pelamar Mitra</span>
                        </button>
                      </div>
                    )}

                    {/* Database Quick Access (Admin Only) */}
                    {isAdmin && (
                      <div className="mb-2 p-2.5 rounded-xl bg-slate-900 text-white border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                            <Database className="w-3.5 h-3.5" />
                            <span>Supabase Database</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            Admin Only
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onOpenDatabaseInspector();
                            setIsMenuOpen(false);
                          }}
                          className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Database className="w-3 h-3" />
                          <span>Buka Supabase Explorer</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* CS WhatsApp Support */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenWhatsApp();
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 transition-all flex items-center gap-2.5 group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-white">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">
                        Bantuan CS WhatsApp
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        Respon cepat 24 jam siaga
                      </p>
                    </div>
                  </button>
                </div>

                {/* Logout Button (Only if authenticated) */}
                {isAuthenticated && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Keluar dari Akun (Logout)</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
