import React, { useState, useEffect } from 'react';
import { 
  User, 
  Wrench, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  LogOut,
  ShieldCheck, 
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { UserRole, TechnicianApplicant, ApplicantStatus } from '../types';
import { UserProfile, isSuperadminEmail, SUPERADMIN_EMAIL } from '../services/authService';
import { getApplicantByEmail } from '../services/adminService';
import { TechnicianRegistrationModal } from './TechnicianRegistrationModal';

interface RoleSelectionScreenProps {
  userProfile: UserProfile | null;
  onSelectRole: (role: UserRole) => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  userProfile,
  onSelectRole,
  onLogout,
  onToast
}) => {
  const [applicant, setApplicant] = useState<TechnicianApplicant | null>(null);
  const [isCheckingApplicant, setIsCheckingApplicant] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Check if current user is Superadmin or Admin
  const isSuperadmin = isSuperadminEmail(userProfile?.email) || userProfile?.role === 'superadmin';
  const hasAdminAccess = isSuperadmin || userProfile?.role === 'admin';

  // Fetch applicant status if user is customer
  useEffect(() => {
    let isMounted = true;
    const loadApplicantStatus = async () => {
      if (!userProfile?.email) return;
      setIsCheckingApplicant(true);
      try {
        const app = await getApplicantByEmail(userProfile.email);
        if (isMounted) {
          setApplicant(app);
        }
      } catch (err) {
        console.warn('Could not load applicant status:', err);
      } finally {
        if (isMounted) setIsCheckingApplicant(false);
      }
    };

    loadApplicantStatus();
    return () => {
      isMounted = false;
    };
  }, [userProfile?.email]);

  const isTechnicianApproved = userProfile?.role === 'technician' || applicant?.status === 'diterima' || hasAdminAccess;
  const isApplicantPending = !isTechnicianApproved && applicant?.status === 'pending';
  const isApplicantRevision = !isTechnicianApproved && applicant?.status === 'diperbaiki';
  const isApplicantRejected = !isTechnicianApproved && applicant?.status === 'ditolak';

  const handleTechnicianCardClick = () => {
    if (isTechnicianApproved) {
      onToast('Membuka antarmuka Mitra Teknisi AC...');
      onSelectRole('technician');
    } else if (isApplicantPending) {
      setShowStatusModal(true);
    } else if (isApplicantRevision) {
      onToast('Silakan periksa dan perbaiki berkas pengajuan Anda.');
      setShowApplyModal(true);
    } else if (isApplicantRejected) {
      setShowStatusModal(true);
    } else {
      // Not yet applied: open onboarding application modal
      setShowApplyModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-900/60 border border-sky-700/60 text-sky-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tentukan Mode Antarmuka Aplikasi</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Pilih Peran Tampilan Aplikasi
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          {userProfile
            ? `Halo, ${userProfile.fullName}! Silakan pilih mode tampilan aplikasi yang ingin Anda buka.`
            : 'Pilih mode tampilan peran yang sesuai untuk melanjutkan ke sistem.'}
        </p>

        {/* Superadmin Quick Access Notice if user has privilege */}
        {hasAdminAccess && (
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Akun Terverifikasi Superadmin: Anda memiliki akses ke seluruh dashboard (Customer, Teknisi, & Admin Pusat).</span>
          </div>
        )}
      </div>

      {/* Role Selection Cards: Customer & Teknisi */}
      <div className="max-w-3xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-auto">
        {/* CARD 1: CUSTOMER */}
        <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200 transition-all flex flex-col justify-between hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Aplikasi Pelanggan
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Customer (Pelanggan)
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-3">
              Booking Layanan & Perawatan AC
            </p>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Pesan servis cuci AC, isi freon, perbaikan kerusakan, live tracking kedatangan teknisi, dan baca panduan edukasi AC.
            </p>

            <div className="space-y-2 mb-6 border-t border-slate-100 pt-3">
              {[
                'Booking jadwal servis instan & fleksibel',
                'Live tracking estimasi kedatangan teknisi',
                'Pembayaran online Midtrans (QRIS, VA)',
                'Live chat langsung dengan teknisi pesanan'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onToast('Membuka mode Customer (Pelanggan)...');
              onSelectRole('customer');
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25 active:scale-95"
          >
            <span>Masuk Mode CUSTOMER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 2: MITRA TEKNISI AC */}
        <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200 transition-all flex flex-col justify-between hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20">
          <div>
            <div className="flex items-center justify-between mb-4">
              {isTechnicianApproved ? (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Mitra Teknisi Aktif
                </span>
              ) : isApplicantPending ? (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Menunggu Verifikasi
                </span>
              ) : isApplicantRevision ? (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-blue-600" />
                  Perlu Perbaikan Data
                </span>
              ) : isApplicantRejected ? (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  Belum Disetujui
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Pendaftaran Mitra Teknisi
                </span>
              )}

              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Mitra Teknisi AC
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-3">
              {isTechnicianApproved 
                ? 'Tugas Lapangan & Pekerjaan Servis'
                : 'Formulir Kemitraan & Verifikasi Tim Admin'}
            </p>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {isTechnicianApproved
                ? 'Terima penugasan servis baru, update status pengerjaan (menuju, service, selesai), navigasi alamat, dan pencatatan komisi.'
                : 'Daftar sebagai mitra teknisi resmi AC Care. Isi data keahlian, kirim pengajuan, dan tunggu verifikasi tim verifikator.'}
            </p>

            <div className="space-y-2 mb-6 border-t border-slate-100 pt-3">
              {[
                'Daftar tugas order servis real-time',
                'Navigasi rute alamat pelanggan via GPS',
                'Update status pengerjaan sekali klik',
                'Kalkulasi bagi hasil & komisi transparan'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button based on state */}
          {isTechnicianApproved ? (
            <button
              type="button"
              onClick={handleTechnicianCardClick}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25 active:scale-95"
            >
              <span>Masuk Mode TEKNISI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : isApplicantPending ? (
            <button
              type="button"
              onClick={handleTechnicianCardClick}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>Status: Menunggu Verifikasi Admin</span>
            </button>
          ) : isApplicantRevision ? (
            <button
              type="button"
              onClick={handleTechnicianCardClick}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-95"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Status: Perbaiki Berkas Pengajuan</span>
            </button>
          ) : isApplicantRejected ? (
            <button
              type="button"
              onClick={handleTechnicianCardClick}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 active:scale-95"
            >
              <XCircle className="w-4 h-4" />
              <span>Belum Disetujui (Ajukan Ulang)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTechnicianCardClick}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25 active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Daftar Mitra Teknisi (Ajukan Kemitraan)</span>
            </button>
          )}
        </div>
      </div>

      {/* Extra Card for Superadmin / Admin if applicable */}
      {hasAdminAccess && (
        <div className="max-w-3xl w-full mx-auto mt-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Mode Administrator Pusat & Superadmin</p>
                <p className="text-slate-400 text-[11px]">Kelola order, verifikasi teknisi pelamar, komisi, area prioritas, dan CMS artikel.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onToast('Membuka Dashboard Administrator Pusat...');
                onSelectRole('admin');
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Buka Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer / Logout action */}
      <div className="max-w-4xl w-full mx-auto mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sistem Tukang AC Online terverifikasi aman & berizin</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      {/* Modal Pendaftaran / Formulir Data Teknisi */}
      <TechnicianRegistrationModal
        userProfile={userProfile}
        existingApplicant={applicant}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={(newApp) => {
          setApplicant(newApp);
        }}
        onToast={onToast}
      />

      {/* Modal Status Verifikasi Teknisi */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
                  isApplicantPending ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {isApplicantPending ? <Clock className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Status Pengajuan Kemitraan
                  </h3>
                  <p className="text-[11px] text-slate-500">ID Berkas: #{applicant?.id || 'APL-TERBARU'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              {isApplicantPending ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="font-black text-amber-950 flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Sedang Ditinjau Admin (1x24 Jam)</span>
                  </div>
                  <p>
                    Halo <strong>{userProfile?.fullName || applicant?.name}</strong>, berkas pengajuan pendaftaran teknisi Anda sedang dalam tahap verifikasi oleh tim <strong>Admin & Superadmin</strong>.
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Setelah disetujui, akun Anda akan otomatis aktif menjadi <strong>Mitra Teknisi</strong>. Untuk saat ini, Anda tetap dapat menggunakan seluruh layanan sebagai <strong>Customer</strong>.
                  </p>
                </div>
              ) : isApplicantRejected ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="font-black text-rose-950 flex items-center gap-1.5 text-sm">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Pengajuan Belum Disetujui</span>
                  </div>
                  <p>
                    Mohon maaf, pengajuan kemitraan teknisi Anda saat ini belum memenuhi kualifikasi standar verifikasi.
                  </p>
                  {applicant?.notes && (
                    <p className="text-[11px] bg-white/70 p-2 rounded-xl border border-rose-200 text-slate-700">
                      <strong>Catatan Admin:</strong> {applicant.notes}
                    </p>
                  )}
                  <p className="text-[11px] text-rose-800">
                    Anda tetap dapat menggunakan layanan pemesanan servis sebagai <strong>Customer</strong> atau mengajukan kembali dengan melengkapi berkas.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              {isApplicantRejected && (
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setShowApplyModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Ajukan Ulang
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  onToast('Melanjutkan ke antarmuka Customer...');
                  onSelectRole('customer');
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Lanjut Sebagai Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
