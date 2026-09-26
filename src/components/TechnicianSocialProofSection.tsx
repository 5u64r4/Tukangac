import React, { useState, useRef } from 'react';
import { 
  Users, 
  Wrench, 
  Wallet, 
  ShieldCheck, 
  Award, 
  Star, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Building, 
  ChevronRight, 
  Zap, 
  Send,
  HelpCircle,
  FileCheck,
  Check,
  Percent,
  Sliders,
  DollarSign,
  CreditCard,
  Camera,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  Heart,
  AlertCircle,
  X,
  Eye,
  FileText
} from 'lucide-react';
import { 
  TECHNICIAN_SOCIAL_PROOF_DATABASE, 
  TECHNICIAN_TESTIMONIALS, 
  PARTNER_BENEFITS, 
  LiveTechnicianSocialProofItem 
} from '../data/technicianSocialProofData';
import { TechnicianApplicant } from '../types';

interface TechnicianSocialProofSectionProps {
  onAddApplicant?: (applicant: TechnicianApplicant) => void;
  onToast: (msg: string) => void;
}

export const TechnicianSocialProofSection: React.FC<TechnicianSocialProofSectionProps> = ({
  onAddApplicant,
  onToast
}) => {
  // Application Form State - FORMULIR DATA PRIBADI
  // V. Upload Foto Profil
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);

  // I. IDENTITAS DIRI
  const [applicantName, setApplicantName] = useState('');
  const [applicantNik, setApplicantNik] = useState('');
  const [ktpImage, setKtpImage] = useState<string>('');
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const [isKtpDragging, setIsKtpDragging] = useState(false);
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [religion, setReligion] = useState('Islam');
  const [maritalStatus, setMaritalStatus] = useState<'Belum Kawin' | 'Kawin' | 'Cerai'>('Belum Kawin');
  const [citizenship, setCitizenship] = useState('WNI');

  // II. KONTAK DAN ALAMAT
  const [ktpAddress, setKtpAddress] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [subdistrictKecamatan, setSubdistrictKecamatan] = useState('');
  const [applicantCity, setApplicantCity] = useState('Kota Bekasi');
  const [postalCode, setPostalCode] = useState('');
  const [isDomicileSameAsKtp, setIsDomicileSameAsKtp] = useState(true);
  const [domicileAddress, setDomicileAddress] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  // IV. KONTAK DARURAT (Emergency Contact)
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Orang Tua');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Kualifikasi Teknis
  const [applicantDistrict, setApplicantDistrict] = useState('Bekasi Selatan');
  const [applicantExperience, setApplicantExperience] = useState('3 - 5 Tahun');
  const [applicantEducation, setApplicantEducation] = useState('SMK Teknik Pendingin & Tata Udara');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Cuci AC Presisi Steam Jet',
    'Isi / Tambah Freon R32 & R410A',
    'Bongkar Pasang AC Split'
  ]);
  const [applicantBnsp, setApplicantBnsp] = useState(true);
  const [hasOwnTools, setHasOwnTools] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  // File Upload Handlers
  const handleKtpFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setKtpImage(reader.result as string);
      onToast('✓ Berkas KTP berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePhotoFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      onToast('✓ Foto profil pelamar berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  // Income Calculator Simulator
  const [dailyUnits, setDailyUnits] = useState(4);
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState(25);
  const [avgFeePerUnit] = useState(85000); // average order value per unit
  const [platformCutPercent] = useState(15); // average 15% platform cut

  const estimatedMonthlyGross = dailyUnits * avgFeePerUnit * workDaysPerMonth;
  const estimatedPlatformFee = Math.round(estimatedMonthlyGross * (platformCutPercent / 100));
  const estimatedNetPayout = estimatedMonthlyGross - estimatedPlatformFee;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      onToast('Mohon lengkapi Nama Lengkap dan Nomor WhatsApp pelamar');
      return;
    }

    if (applicantNik.trim() && applicantNik.trim().length !== 16) {
      onToast('Nomor Induk Kependudukan (NIK) harus 16 digit angka');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newId = `APL-2026-${Math.floor(100 + Math.random() * 900)}`;
      const initials = applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TK';

      const finalDomicile = isDomicileSameAsKtp 
        ? (subdistrictKecamatan ? `${subdistrictKecamatan}, ${applicantCity}` : `${applicantDistrict}, ${applicantCity}`)
        : (domicileAddress || `${applicantDistrict}, ${applicantCity}`);

      const newApplicantObj: TechnicianApplicant = {
        id: newId,
        name: applicantName.trim(),
        avatar: initials,
        photoUrl: photoUrl || undefined,
        phone: applicantPhone.trim(),
        email: applicantEmail.trim() || `${applicantName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        domicile: finalDomicile,
        experienceYears: applicantExperience,
        education: applicantEducation,
        certifications: applicantBnsp ? ['Sertifikasi BNSP Teknisi Pendingin', 'K3 Listrik'] : ['Pelatihan Mandiri'],
        skills: selectedSkills,
        appliedDate: 'Hari ini',
        status: 'pending',
        expectedSalary: `Rp${(estimatedNetPayout * 0.9).toLocaleString('id-ID')} / bln`,
        notes: hasOwnTools ? 'Memiliki peralatan manifold, pompa vakum, dan steam jet mandiri.' : 'Membutuhkan opsi sewa/cicil alat.',

        // I. IDENTITAS DIRI
        nik: applicantNik.trim() || '3275019284710002',
        ktpNumber: applicantNik.trim() || '3275019284710002',
        ktpImage: ktpImage || undefined,
        birthPlace: birthPlace.trim() || 'Bekasi',
        birthDate: birthDate || '1995-05-20',
        gender: gender,
        religion: religion,
        maritalStatus: maritalStatus,
        citizenship: citizenship,

        // II. KONTAK DAN ALAMAT
        ktpAddress: ktpAddress.trim() || 'Jl. Inpres No. 12',
        rtRw: rtRw.trim() || '004 / 006',
        subdistrictKecamatan: subdistrictKecamatan.trim() || applicantDistrict,
        cityKabupaten: applicantCity,
        postalCode: postalCode.trim() || '17148',
        isDomicileSameAsKtp: isDomicileSameAsKtp,
        domicileAddress: isDomicileSameAsKtp ? ktpAddress : domicileAddress,

        // IV. KONTAK DARURAT
        emergencyContact: {
          name: emergencyContactName.trim() || 'Keluarga Pelamar',
          relation: emergencyContactRelation,
          phone: emergencyContactPhone.trim() || applicantPhone
        },
        emergencyContactName: emergencyContactName.trim() || 'Keluarga Pelamar',
        emergencyContactRelation: emergencyContactRelation,
        emergencyContactPhone: emergencyContactPhone.trim() || applicantPhone
      };

      if (onAddApplicant) {
        onAddApplicant(newApplicantObj);
      }

      setIsSubmitting(false);
      setIsSuccessSubmitted(true);
      onToast(`🎉 Formulir Data Pribadi ${applicantName} berhasil dikirim!`);
    }, 900);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================================= */}
      {/* 1. HERO SOCIAL PROOF & PARTNER STATS                                     */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 border border-sky-500/30 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Kemitraan & Social Proof Pelamar Teknisi</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Bergabung Bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-emerald-400">180+ Mitra Teknisi Profesional</span> se-Jabodetabek
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Tingkatkan penghasilan bulanan Anda dengan sistem order prioritas wilayah otomatis, potongan komisi rendah 10%–20%, dan pencairan saldo instan setiap hari.
            </p>
          </div>

          {/* Social Proof Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-semibold">Mitra Aktif</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">180+ Mitra</div>
              <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+24 Pelamar bulan ini</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-semibold">Rata-rata Pendapatan</span>
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">Rp7,5 - 14 Jt</div>
              <div className="text-[10px] text-slate-300 font-medium">Bawa pulang bersih/bulan</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-semibold">Pencairan Komisi</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">&lt; 2 Menit</div>
              <div className="text-[10px] text-emerald-300 font-medium">Instan ke semua Bank</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-semibold">Verifikasi Pelamar</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">&lt; 24 Jam</div>
              <div className="text-[10px] text-sky-300 font-medium">Proses cepat & transparan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME ACTIVITY FEED TICKER FOR APPLICANTS & PARTNERS              */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Aktivitas Kemitraan & Pencairan Real-Time
              </h2>
              <p className="text-xs text-slate-500">
                Bukti nyata pelamar diterima, pencairan komisi mitra, dan penugasan area kerja.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Feed Jabodetabek
          </span>
        </div>

        {/* Live Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TECHNICIAN_SOCIAL_PROOF_DATABASE.slice(0, 6).map((item) => (
            <div 
              key={item.id}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 hover:border-sky-400/80 hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-full ${item.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                    {item.avatarText}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 text-xs truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.district}, {item.city}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 shrink-0">{item.timeAgo}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-100/80 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-black text-sky-900">{item.headline}</span>
                  {item.amountFormatted && (
                    <span className="text-[11px] font-black text-emerald-700 font-mono">{item.amountFormatted}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-600 leading-tight line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {item.highlightBadge}
                </span>
                {item.experience && (
                  <span className="text-slate-500 font-medium">{item.experience}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE INCOME CALCULATOR SIMULATOR FOR APPLICANTS                */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-sky-900 via-sky-950 to-slate-950 text-white border border-sky-400/30 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Simulasi Pendapatan Transparan</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              Hitung Potensi Penghasilan Bersih Anda per Bulan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Sesuaikan target kerja harian Anda dan lihat estimasi komisi yang Anda bawa pulang setelah potongan platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliders Control */}
          <div className="lg:col-span-7 space-y-5 bg-white/5 p-5 rounded-2xl border border-white/10">
            {/* Slider 1: Unit per Day */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">Target Pengerjaan AC per Hari:</span>
                <span className="font-mono font-black text-amber-300 text-base">{dailyUnits} Unit / Hari</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="8" 
                step="1" 
                value={dailyUnits}
                onChange={(e) => setDailyUnits(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Unit (Santai)</span>
                <span>4 Unit (Standar)</span>
                <span>8 Unit (Maksimal)</span>
              </div>
            </div>

            {/* Slider 2: Working Days per Month */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">Hari Kerja per Bulan:</span>
                <span className="font-mono font-black text-sky-300 text-base">{workDaysPerMonth} Hari</span>
              </div>
              <input 
                type="range" 
                min="15" 
                max="28" 
                step="1" 
                value={workDaysPerMonth}
                onChange={(e) => setWorkDaysPerMonth(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>15 Hari (Paruh Waktu)</span>
                <span>25 Hari (Penuh Waktu)</span>
                <span>28 Hari (Super Aktif)</span>
              </div>
            </div>

            {/* Platform Rate Notes */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Bagi Hasil: 85% untuk Teknisi · 15% Platform
              </span>
              <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Bebas PPN Tambahan</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-amber-400/40 text-center space-y-3 shadow-xl">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Estimasi Komisi Bersih Teknisi</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
              Rp{estimatedNetPayout.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-300">
              Total omzet kotor: <strong className="text-white">Rp{estimatedMonthlyGross.toLocaleString('id-ID')}</strong> ({dailyUnits * workDaysPerMonth} unit AC/bln)
            </p>
            <div className="pt-2 border-t border-white/10 text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Bisa dicairkan harian ke rekening Anda</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. AUTHENTIC PARTNER TESTIMONIALS & SUCCESS STORIES                      */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Kisah Nyata Mitra yang Telah Bergabung</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pengalaman langsung para teknisi yang beralih ke ekosistem kemitraan AC Care.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TECHNICIAN_TESTIMONIALS.map((testi) => (
            <div 
              key={testi.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              <div className="space-y-3">
                {/* Top Profile Header */}
                <div className="flex items-center gap-3">
                  <img 
                    src={testi.photoUrl} 
                    alt={testi.name} 
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-sky-500 shadow-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-black text-slate-900 text-sm truncate">{testi.name}</h4>
                      {testi.verifiedBnsp && (
                        <span title="Tersertifikasi BNSP">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-sky-700 font-bold">{testi.role}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-rose-500" />
                      <span>{testi.area}</span>
                    </div>
                  </div>
                </div>

                {/* Income Badge Box */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-sky-50 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pendapatan Rata-rata</span>
                    <span className="text-xs font-black text-amber-900 font-mono">{testi.monthlyIncomeFormatted}</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    {testi.incomeGrowth}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{testi.quote}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Spesialisasi:</span>
                <span className="font-extrabold text-slate-800 text-right truncate max-w-[170px]">{testi.specialization}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FAST-TRACK APPLICANT REGISTRATION FORM (FORMULIR DATA PRIBADI)        */}
      {/* ========================================================================= */}
      <div id="form-pendaftaran-mitra" className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-sky-300 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase tracking-wider mb-0.5">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                <span>Dokumen Resmi Rekrutmen</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                FORMULIR DATA PRIBADI
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi seluruh rincian identitas diri, kontak, dan kontak darurat untuk verifikasi berkas kemitraan teknisi.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-slate-400 block">Status Berkas:</span>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              ✓ Terenkripsi Aman
            </span>
          </div>
        </div>

        {isSuccessSubmitted ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-emerald-900">
              Formulir Data Pribadi Berhasil Dikirim!
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
              Terima kasih <strong>{applicantName}</strong> (NIK: {applicantNik || 'Terlampir'}). Berkas identitas, kontak, dan kualifikasi Anda telah tercatat di basis data pelamar teknisi prioritas. Tim HRD &amp; Tim Kemitraan wilayah <strong>{applicantCity}</strong> akan menghubungi via WhatsApp ke nomor <strong>{applicantPhone}</strong>.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessSubmitted(false);
                  setApplicantName('');
                  setApplicantPhone('');
                  setApplicantNik('');
                  setKtpImage('');
                  setPhotoUrl('');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                Isi Formulir Pelamar Baru
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">

            {/* V. UPLOAD FOTO PROFIL */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    V
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    Upload Foto Profil
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Foto setengah badan / rapi</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Photo Preview */}
                <div className="relative group shrink-0">
                  {photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt="Foto Profil Pelamar"
                        referrerPolicy="no-referrer"
                        className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl object-cover border-2 border-sky-500 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        title="Hapus foto"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-8 h-8 mb-1 text-slate-400" />
                      <span className="text-[10px] font-bold text-center px-1">Belum Ada Foto</span>
                    </div>
                  )}
                </div>

                {/* Upload Zone & Button */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsPhotoDragging(true);
                  }}
                  onDragLeave={() => setIsPhotoDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPhotoDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProfilePhotoFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`flex-1 w-full p-4 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                    isPhotoDragging ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 bg-white hover:border-sky-400'
                  }`}
                >
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProfilePhotoFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-5 h-5 text-sky-600" />
                  <div className="text-xs font-bold text-slate-700">
                    Tarik foto ke sini atau <button type="button" onClick={() => photoInputRef.current?.click()} className="text-sky-600 underline font-extrabold hover:text-sky-800">klik untuk memilih</button>
                  </div>
                  <div className="text-[10px] text-slate-400">Format JPG, PNG, atau WebP (Maksimal 5 MB)</div>
                </div>
              </div>
            </div>

            {/* I. IDENTITAS DIRI */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs">
                  I
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  IDENTITAS DIRI
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap sesuai KTP"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Nomor Induk Kependudukan (NIK) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold text-xs">
                      Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono ${applicantNik.length === 16 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      {applicantNik.length}/16 Digit
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Contoh: 3275012408920003"
                    value={applicantNik}
                    onChange={(e) => setApplicantNik(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Upload KTP */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                    <span>* Upload KTP (Kartu Tanda Penduduk)</span>
                  </label>
                  {ktpImage && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> KTP Terunggah
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {ktpImage ? (
                    <div className="relative group shrink-0">
                      <img
                        src={ktpImage}
                        alt="KTP Preview"
                        referrerPolicy="no-referrer"
                        className="w-40 h-24 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setKtpImage('')}
                        title="Hapus KTP"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow hover:bg-rose-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsKtpDragging(true);
                    }}
                    onDragLeave={() => setIsKtpDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsKtpDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleKtpFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`flex-1 w-full p-3 rounded-xl border-2 border-dashed transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                      isKtpDragging ? 'border-sky-500 bg-sky-50/60' : 'border-slate-300 bg-white hover:border-sky-400'
                    }`}
                    onClick={() => ktpInputRef.current?.click()}
                  >
                    <input
                      ref={ktpInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleKtpFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="text-xs text-slate-600 font-semibold">
                      {ktpImage ? 'Ganti Berkas KTP' : 'Klik atau Tarik Berkas Foto KTP ke sini'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta / Bekasi"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Jenis Kelamin, Agama, Status Pernikahan, Kewarganegaraan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5">
                    Jenis Kelamin:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Laki-laki', 'Perempuan'] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setGender(item)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          gender === item 
                            ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-2xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${gender === item ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'}`}>
                          {gender === item && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>[ {item} ]</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agama */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5">
                    Agama
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Status Pernikahan */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5">
                    Status Pernikahan:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Belum Kawin', 'Kawin', 'Cerai'] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setMaritalStatus(item)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                          maritalStatus === item 
                            ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-2xs font-extrabold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        [ {item} ]
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kewarganegaraan */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5">
                    Kewarganegaraan:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['WNI', 'WNA'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCitizenship(item)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          citizenship === item 
                            ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-2xs font-extrabold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        [ {item} ]
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* II. KONTAK DAN ALAMAT */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs">
                  II
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  KONTAK DAN ALAMAT
                </h3>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">
                  Alamat KTP
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat lengkap jalan, nomor rumah / blok sesuai KTP"
                  value={ktpAddress}
                  onChange={(e) => setKtpAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* RT / RW */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    RT / RW
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 003 / 008"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Kelurahan / Kecamatan */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Kelurahan / Kecamatan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kranji, Bekasi Barat"
                    value={subdistrictKecamatan}
                    onChange={(e) => setSubdistrictKecamatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Kota / Kabupaten */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Kota / Kabupaten
                  </label>
                  <select
                    value={applicantCity}
                    onChange={(e) => setApplicantCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Kota Bekasi">Kota Bekasi</option>
                    <option value="Kabupaten Bekasi">Kabupaten Bekasi</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Jakarta Timur">Jakarta Timur</option>
                    <option value="Jakarta Barat">Jakarta Barat</option>
                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                    <option value="Jakarta Utara">Jakarta Utara</option>
                    <option value="Kota Depok">Kota Depok</option>
                    <option value="Kota Tangerang">Kota Tangerang</option>
                    <option value="Tangerang Selatan">Tangerang Selatan</option>
                    <option value="Kota Bogor">Kota Bogor</option>
                    <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                  </select>
                </div>

                {/* Kode Pos */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="Contoh: 17135"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Alamat Domisili Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDomicileSameAsKtp}
                    onChange={(e) => setIsDomicileSameAsKtp(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Alamat Domisili (Saat Ini) sama dengan Alamat KTP
                  </span>
                </label>

                {!isDomicileSameAsKtp && (
                  <div className="pt-1 animate-in fade-in">
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Alamat Domisili (Saat Ini jika berbeda dengan ktp):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Masukkan alamat tempat tinggal / kos / kontrakan saat ini"
                      value={domicileAddress}
                      onChange={(e) => setDomicileAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Nomor Telepon / HP & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Nomor Telepon / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 0812-3456-7890"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Alamat E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: pelamar@gmail.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* IV. KONTAK DARURAT (Emergency Contact) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                  IV
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    KONTAK DARURAT (Emergency Contact)
                  </h3>
                  <span className="text-[10px] text-slate-400">Dihubungi untuk situasi darurat operasional atau kecelakaan kerja</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Nama Kontak */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Nama Kontak
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rahmat Subagyo"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Hubungan Keluarga */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Hubungan Keluarga
                  </label>
                  <select
                    value={emergencyContactRelation}
                    onChange={(e) => setEmergencyContactRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Orang Tua">Orang Tua (Ayah / Ibu)</option>
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Saudara Kandung">Saudara Kandung (Kakak / Adik)</option>
                    <option value="Anak">Anak</option>
                    <option value="Paman / Bibi">Paman / Bibi</option>
                    <option value="Kerabat / Rekan">Kerabat / Rekan Kerja</option>
                  </select>
                </div>

                {/* Nomor HP Kontak Darurat */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Nomor HP
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 0813-9988-7766"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Kualifikasi Teknis & Perlengkapan */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                <span>Kualifikasi Teknis &amp; Peralatan Kerja</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">Pengalaman di Bidang AC</label>
                  <select
                    value={applicantExperience}
                    onChange={(e) => setApplicantExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="1 - 2 Tahun">1 - 2 Tahun (Junior)</option>
                    <option value="3 - 5 Tahun">3 - 5 Tahun (Senior)</option>
                    <option value="6 - 10 Tahun">6 - 10 Tahun (Master / Spesialis)</option>
                    <option value="> 10 Tahun">&gt; 10 Tahun (Expert / Vendor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">Pendidikan Terakhir</label>
                  <select
                    value={applicantEducation}
                    onChange={(e) => setApplicantEducation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="SMK Teknik Pendingin & Tata Udara">SMK Teknik Pendingin &amp; Tata Udara</option>
                    <option value="SMK Teknik Ketenagalistrikan / Elektro">SMK Teknik Ketenagalistrikan / Elektro</option>
                    <option value="SMA / Sederajat (OJT Bengkel AC)">SMA / Sederajat (OJT Bengkel AC)</option>
                    <option value="D3 / S1 Teknik Refrigerasi / Mesin">D3 / S1 Teknik Refrigerasi / Mesin</option>
                  </select>
                </div>
              </div>

              {/* Skills Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="block text-slate-700 font-bold text-xs">
                  Keahlian &amp; Jenis Pekerjaan yang Dikuasai:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Cuci AC Presisi Steam Jet',
                    'Isi / Tambah Freon R32 & R410A',
                    'Bongkar Pasang AC Split',
                    'Troubleshooting Inverter PCB',
                    'Perbaikan Bocor Pipa / Brazing',
                    'Instalasi Cassette & Ducting'
                  ].map((skill) => {
                    const isChecked = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                          isChecked
                            ? 'bg-sky-50 text-sky-900 border-sky-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${isChecked ? 'bg-sky-600 text-white' : 'border border-slate-300'}`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Equipment & BNSP Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={applicantBnsp}
                    onChange={(e) => setApplicantBnsp(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      <span>Memiliki Sertifikasi BNSP / Principal</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Lencana mitra prioritas &amp; prioritas order komersial</div>
                  </div>
                </label>

                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={hasOwnTools}
                    onChange={(e) => setHasOwnTools(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      <span>Memiliki Peralatan Servis Lengkap Mandiri</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Pompa steam jet, manifold gauge, vacuum pump, dll.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Data pribadi Anda dijaga kerahasiaannya dan hanya digunakan untuk proses seleksi mitra.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Berkas...' : 'Kirim Formulir Data Pribadi & Pendaftaran'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. BENEFIT COMPARISON                                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PARTNER_BENEFITS.map((benefit, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
              {idx + 1}
            </div>
            <h4 className="font-black text-slate-900 text-xs">{benefit.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
