import React from 'react';
import { UserRole, CustomerTab, TechnicianTab, AdminTab } from '../types';
import { 
  Home, 
  PlusCircle, 
  Navigation, 
  Clock, 
  User, 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3,
  Percent,
  Calendar,
  Wallet,
  Sparkles,
  Wrench
} from 'lucide-react';

interface BottomNavProps {
  currentRole: UserRole;
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  technicianTab?: TechnicianTab;
  setTechnicianTab?: (tab: TechnicianTab) => void;
  adminTab?: AdminTab;
  setAdminTab?: (tab: AdminTab) => void;
  onToast: (msg: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRole,
  customerTab,
  setCustomerTab,
  technicianTab = 'beranda',
  setTechnicianTab,
  adminTab = 'orders',
  setAdminTab,
  onToast
}) => {
  return (
    <nav className="fixed bottom-2.5 sm:bottom-4 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none">
      {/* Neumorphic Floating Dock Container */}
      <div className="max-w-md mx-auto pointer-events-auto bg-[#edf2f7] rounded-3xl p-2 sm:p-2.5 border border-white/60 shadow-[-6px_-6px_14px_rgba(255,255,255,0.95),_6px_8px_18px_rgba(160,175,198,0.45)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {currentRole === 'customer' && (
            <>
              {/* Beranda */}
              <button
                onClick={() => setCustomerTab('home')}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  customerTab === 'home'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${customerTab === 'home' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Beranda</span>
              </button>

              {/* Booking */}
              <button
                onClick={() => setCustomerTab('booking')}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  customerTab.startsWith('booking')
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${customerTab.startsWith('booking') ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Booking</span>
              </button>

              {/* Tracking */}
              <button
                onClick={() => setCustomerTab('tracking')}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  customerTab === 'tracking'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${customerTab === 'tracking' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Tracking</span>
              </button>

              {/* Pesanan */}
              <button
                onClick={() => setCustomerTab('orders')}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  customerTab === 'orders'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${customerTab === 'orders' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Pesanan</span>
              </button>

              {/* Profil */}
              <button
                onClick={() => setCustomerTab('profile')}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  customerTab === 'profile'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${customerTab === 'profile' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Profil</span>
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => {
                  setAdminTab?.('orders');
                  onToast('Buka Pesanan & Analitik');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  adminTab === 'orders'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${adminTab === 'orders' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Orders</span>
              </button>

              <button
                onClick={() => {
                  setAdminTab?.('technician_reports');
                  onToast('Buka Laporan Kinerja Teknisi');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  adminTab === 'technician_reports'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${adminTab === 'technician_reports' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Lap. Teknisi</span>
              </button>

              <button
                onClick={() => {
                  setAdminTab?.('commission');
                  onToast('Buka Pengaturan Komisi (10%-30%) & Laporan');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  adminTab === 'commission'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${adminTab === 'commission' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Komisi</span>
              </button>

              <button
                onClick={() => {
                  setAdminTab?.('applicants');
                  onToast('Buka Daftar Pelamar Mitra');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  adminTab === 'applicants'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${adminTab === 'applicants' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Pelamar</span>
              </button>
            </>
          )}

          {currentRole === 'technician' && (
            <>
              {/* Beranda */}
              <button
                onClick={() => {
                  setTechnicianTab?.('beranda');
                  onToast('Beralih ke Tugas & Beranda Teknisi');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  technicianTab === 'beranda'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${technicianTab === 'beranda' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Beranda</span>
              </button>

              {/* Jadwal */}
              <button
                onClick={() => {
                  setTechnicianTab?.('jadwal');
                  onToast('Membuka Jadwal & Agenda Kunjungan');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  technicianTab === 'jadwal'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${technicianTab === 'jadwal' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Jadwal</span>
              </button>

              {/* Pendapatan */}
              <button
                onClick={() => {
                  setTechnicianTab?.('pendapatan');
                  onToast('Membuka Dompet & Laporan Komisi');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  technicianTab === 'pendapatan'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${technicianTab === 'pendapatan' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Pendapatan</span>
              </button>

              {/* Pelamar & Social Proof */}
              <button
                onClick={() => {
                  setTechnicianTab?.('pelamar');
                  onToast('Membuka Info Pelamar & Social Proof Kemitraan');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  technicianTab === 'pelamar'
                    ? 'bg-[#e2ebf4] text-amber-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${technicianTab === 'pelamar' ? 'text-amber-600 scale-105' : 'text-slate-500'}`}>
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Pelamar</span>
              </button>

              {/* Profil */}
              <button
                onClick={() => {
                  setTechnicianTab?.('profil');
                  onToast('Membuka Profil & Sertifikasi Teknisi');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  technicianTab === 'profil'
                    ? 'bg-[#e2ebf4] text-sky-600 font-extrabold shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.95),_inset_3px_3px_6px_rgba(160,175,198,0.5)]'
                    : 'bg-[#edf2f7] text-slate-500 hover:text-slate-800 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.35)] hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),_2px_2px_5px_rgba(160,175,198,0.4)]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${technicianTab === 'profil' ? 'text-sky-600 scale-105' : 'text-slate-500'}`}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Profil</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
