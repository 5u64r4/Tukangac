import React, { useState } from 'react';
import { 
  Snowflake, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Wrench,
  Shield
} from 'lucide-react';
import { UserRole } from '../types';
import { signInUser, signUpUser, UserProfile } from '../services/authService';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onToast: (msg: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onToast }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'technician'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan isi email dan password Anda.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Silakan isi nama lengkap.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password minimal terdiri dari 6 karakter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const profile = await signInUser(email.trim(), password);
        if (profile) {
          const roleDisplayName = profile.role === 'superadmin' ? 'Superadmin' : profile.role === 'admin' ? 'Admin' : profile.role === 'technician' ? 'Teknisi' : 'Pelanggan';
          onToast(`Selamat datang kembali, ${profile.fullName} (${roleDisplayName})!`);
          onLoginSuccess(profile);
        } else {
          setErrorMessage('Akun tidak ditemukan atau password salah.');
        }
      } else {
        // Public registration is strictly restricted to customer or technician
        const safeRegistrationRole: 'customer' | 'technician' = selectedRole === 'technician' ? 'technician' : 'customer';

        const { profile } = await signUpUser({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          role: safeRegistrationRole
        });

        if (profile) {
          const roleLabel = profile.role === 'superadmin' ? 'Superadmin' : profile.role === 'admin' ? 'Admin' : profile.role === 'technician' ? 'Teknisi' : 'Pelanggan';
          onToast(`Pendaftaran berhasil! Selamat datang, ${profile.fullName} (${roleLabel}).`);
          onLoginSuccess(profile);
        } else {
          onToast('Pendaftaran akun berhasil dibuat. Silakan masuk.');
          setMode('login');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err?.message || 'Terjadi kendala autentikasi. Silakan periksa kredensial Anda.';
      setErrorMessage(msg);
      onToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 text-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Authentication Container */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl shadow-sky-950/50 border border-slate-200/80 overflow-hidden relative z-10">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 p-6 text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/30">
              <Snowflake className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Tukang AC <span className="text-sky-200">Online</span>
            </h2>
            <p className="text-xs text-sky-100 mt-1 font-medium">
              Platform Resmi Servis, Perawatan, & Pemeliharaan AC
            </p>
          </div>
        </div>

        {/* Tab Toggle: Masuk vs Daftar */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 m-4 mb-2 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daftar Sebagai Peran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'customer' as UserRole, label: 'Customer (Pelanggan)', icon: User },
                      { role: 'technician' as UserRole, label: 'Mitra Teknisi', icon: Wrench }
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSelectedRole(item.role)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                          selectedRole === item.role
                            ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold ring-1 ring-sky-500'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-[11px] font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 italic">
                    * Pendaftaran terbuka untuk Pelanggan dan Mitra Teknisi AC. Akses Administrator dikelola terpusat.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan ulang kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Aplikasi' : 'Daftarkan Akun Sekarang'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Koneksi terenkripsi & tersinkronisasi aman dengan Supabase</span>
        </div>
      </div>
    </div>
  );
};
