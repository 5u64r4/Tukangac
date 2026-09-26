import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  Snowflake, 
  ShieldCheck, 
  PhoneCall, 
  Menu, 
  X, 
  User, 
  Shield, 
  Wrench, 
  Check, 
  Sparkles,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenWhatsApp: () => void;
  onOpenDatabaseInspector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenWhatsApp,
  onOpenDatabaseInspector
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

  const roles = [
    {
      id: 'customer' as UserRole,
      label: 'Customer',
      subtitle: 'Booking, Tracking & Artikel AC',
      icon: <User className="w-5 h-5 text-sky-600" />,
      badge: 'Mode Pelanggan',
      color: 'border-sky-500 bg-sky-50/70 text-sky-700'
    },
    {
      id: 'admin' as UserRole,
      label: 'Admin',
      subtitle: 'Kelola Order, Teknisi & Keuangan',
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      badge: 'Dashboard Admin',
      color: 'border-indigo-500 bg-indigo-50/70 text-indigo-700'
    },
    {
      id: 'technician' as UserRole,
      label: 'Teknisi',
      subtitle: 'Tugas Masuk, Navigasi & Selesai',
      icon: <Wrench className="w-5 h-5 text-teal-600" />,
      badge: 'Aplikasi Teknisi',
      color: 'border-teal-500 bg-teal-50/70 text-teal-700'
    }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md shadow-slate-900/6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
          onClick={() => onRoleChange('customer')}
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

        {/* Center / Right: Current Role Badge, Database Inspector & 3-Line Menu */}
        <div className="flex items-center gap-2 sm:gap-3 relative" ref={menuRef}>
          {/* Quick Database Inspector Button */}
          <button
            onClick={onOpenDatabaseInspector}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 text-sky-400 hover:bg-slate-800 font-bold text-xs border border-slate-700 shadow-xs transition-colors cursor-pointer"
            title="Buka Database Backend (Customer, Admin, Teknisi)"
          >
            <Database className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="hidden sm:inline">Database Cloud</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">3 Role</span>
          </button>

          {/* Quick WA button for desktop */}
          <button
            onClick={onOpenWhatsApp}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast Respon</span>
          </button>

          {/* Current Role Tag Badge */}
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="capitalize font-bold text-slate-800">{currentRoleObj.label}</span>
          </div>

          {/* 3-Line (Hamburger) Menu Button */}
          <button
            id="role-menu-trigger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Buka Menu Role"
            className={`p-2.5 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              isMenuOpen
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/25 scale-95'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-xs'
            }`}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            <span className="hidden sm:inline text-xs font-bold">
              {isMenuOpen ? 'Tutup' : 'Menu'}
            </span>
          </button>

          {/* Dropdown Menu when 3-Line is clicked */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-13 sm:top-14 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 z-50 overflow-hidden"
              >
                {/* Database Quick Access in Dropdown */}
                <div className="mb-2.5 p-2.5 rounded-xl bg-slate-900 text-white border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-sky-400">
                      <Database className="w-3.5 h-3.5" />
                      <span>Database Firestore</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Terpisah 3 Role
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2 leading-tight">
                    Pemeriksaan data live: 1. Customer, 2. Admin, 3. Teknisi
                  </p>
                  <button
                    onClick={() => {
                      onOpenDatabaseInspector();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3 h-3" />
                    <span>Buka Database Explorer</span>
                  </button>
                </div>

                {/* Header info */}
                <div className="px-2 pb-2.5 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      Pilih Mode Tampilan
                    </h4>
                    <p className="text-[11px] text-slate-400">Ganti tampilan peran pengguna</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    3 Role
                  </span>
                </div>


                {/* Role Switch Options */}
                <div className="space-y-1.5">
                  {roles.map((r) => {
                    const isSelected = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          onRoleChange(r.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-300 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-white shadow-xs' : 'bg-slate-100 group-hover:bg-white'
                          }`}>
                            {r.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-extrabold ${
                                isSelected ? 'text-sky-900' : 'text-slate-800'
                              }`}>
                                {r.label}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-600 text-white">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {r.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-sky-400 transition-colors shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick WhatsApp / Help Footer in Dropdown */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onOpenWhatsApp();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hubungi CS WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

