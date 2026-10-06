import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  FileText,
  Send,
  Camera
} from 'lucide-react';
import { TechnicianApplicant, ApplicantStatus } from '../types';
import { UserProfile } from '../services/authService';
import { saveApplicant } from '../services/adminService';

interface TechnicianRegistrationModalProps {
  userProfile: UserProfile | null;
  existingApplicant?: TechnicianApplicant | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (applicant: TechnicianApplicant) => void;
  onToast: (msg: string) => void;
}

const COMMON_SKILLS = [
  'Cuci AC Split Wall',
  'Isi & Tambah Freon R32/R410A',
  'Troubleshooting AC Tidak Dingin',
  'Bongkar Pasang AC Baru/Pindahan',
  'Perbaikan PCB & Modul Inverter',
  'Perbaikan Kebocoran Air / Pipa',
  'Penggantian Kompresor',
  'Instalasi Kelistrikan AC'
];

export const TechnicianRegistrationModal: React.FC<TechnicianRegistrationModalProps> = ({
  userProfile,
  existingApplicant,
  isOpen,
  onClose,
  onSuccess,
  onToast
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(existingApplicant?.name || userProfile?.fullName || '');
  const [email, setEmail] = useState(existingApplicant?.email || userProfile?.email || '');
  const [phone, setPhone] = useState(existingApplicant?.phone || userProfile?.phone || '');
  const [nik, setNik] = useState(existingApplicant?.nik || '');
  const [domicile, setDomicile] = useState(existingApplicant?.domicile || 'Bekasi Selatan');
  const [ktpAddress, setKtpAddress] = useState(existingApplicant?.ktpAddress || '');
  const [experienceYears, setExperienceYears] = useState(existingApplicant?.experienceYears || '3 tahun');
  const [education, setEducation] = useState(existingApplicant?.education || 'SMK Teknik Pendingin / Tata Udara');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    existingApplicant?.skills && existingApplicant.skills.length > 0 
      ? existingApplicant.skills 
      : ['Cuci AC Split Wall', 'Isi & Tambah Freon R32/R410A']
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    existingApplicant?.emergencyContactName || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    existingApplicant?.emergencyContactPhone || ''
  );
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(
    existingApplicant?.emergencyContactRelation || 'Keluarga'
  );
  const [notes, setNotes] = useState(existingApplicant?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      onToast('Mohon lengkapi Nama, Email, dan Nomor HP.');
      return;
    }

    if (selectedSkills.length === 0) {
      onToast('Pilih minimal satu keahlian teknisi AC.');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicantId = existingApplicant?.id || `APL-${Date.now().toString().slice(-6)}`;
      const applicantObj: TechnicianApplicant = {
        id: applicantId,
        name: name.trim(),
        avatar: name.trim().charAt(0).toUpperCase(),
        photoUrl: existingApplicant?.photoUrl || `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80`,
        phone: phone.trim(),
        email: email.trim(),
        domicile: domicile.trim(),
        experienceYears,
        education,
        certifications: existingApplicant?.certifications || ['Sertifikat BNSP Teknisi Pendingin'],
        skills: selectedSkills,
        appliedDate: existingApplicant?.appliedDate || 'Hari ini',
        status: 'pending' as ApplicantStatus,
        notes: notes.trim(),
        expectedSalary: 'Bagi Hasil 80% Komisi',

        nik: nik.trim(),
        ktpNumber: nik.trim(),
        ktpImage: existingApplicant?.ktpImage || '',
        birthPlace: 'Bekasi',
        birthDate: '1995-05-15',
        gender: 'Laki-laki',
        religion: 'Islam',
        maritalStatus: 'Kawin',
        citizenship: 'WNI',

        ktpAddress: ktpAddress.trim() || domicile.trim(),
        rtRw: '002/005',
        subdistrictKecamatan: domicile.trim(),
        cityKabupaten: 'Kota Bekasi',
        postalCode: '17141',
        isDomicileSameAsKtp: true,
        domicileAddress: ktpAddress.trim() || domicile.trim(),

        emergencyContact: {
          name: emergencyContactName.trim() || 'Keluarga',
          relation: emergencyContactRelation,
          phone: emergencyContactPhone.trim() || phone.trim()
        },
        emergencyContactName: emergencyContactName.trim() || 'Keluarga',
        emergencyContactRelation,
        emergencyContactPhone: emergencyContactPhone.trim() || phone.trim()
      };

      await saveApplicant(applicantObj);
      onSuccess(applicantObj);
      onToast('Pengajuan kemitraan teknisi berhasil dikirim! Status Anda saat ini MENUNGGU VERIFIKASI Admin/Superadmin.');
      onClose();
    } catch (err) {
      console.error('Error submitting technician application:', err);
      onToast('Terjadi kendala saat mengirim pengajuan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shadow-2xs border border-teal-200">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {existingApplicant ? 'Perbarui Pengajuan Kemitraan Teknisi' : 'Formulir Pendaftaran Mitra Teknisi AC'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Langkah 1: Isi Data & Keahlian → Langkah 2: Verifikasi Berkas oleh Admin Pusat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Flow Info Box */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 text-[11px] text-sky-900 space-y-1.5">
          <div className="flex items-center gap-2 font-black text-sky-950">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Alur Resmi Kemitraan Teknisi Tukang AC Online</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Pendaftaran kemitraan teknisi memerlukan verifikasi dari tim <strong>Admin / Superadmin</strong>. Setelah pengajuan disetujui, akun Anda akan otomatis beralih ke <strong>Role Teknisi</strong> dengan akses penugasan order dan komisi. Selama proses verifikasi, akun Anda tetap dapat digunakan sebagai <strong>Customer</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* I. Identitas Diri */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>I. Data Identitas Pemohon</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Sesuai KTP *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">NIK (Nomor Induk Kependudukan)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="16 digit NIK KTP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nomor WhatsApp Aktif *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alamat Email Terdaftar *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-600 outline-none"
                  readOnly={!!userProfile?.email}
                />
              </div>
            </div>
          </div>

          {/* II. Alamat & Wilayah */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>II. Wilayah Operasional & Domisili</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Area / Kecamatan Domisili *</label>
                <select
                  value={domicile}
                  onChange={(e) => setDomicile(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium"
                >
                  <option value="Bekasi Selatan">Bekasi Selatan (Galaxy, Pekayon)</option>
                  <option value="Bekasi Barat">Bekasi Barat (Kranji, Bintara)</option>
                  <option value="Bekasi Timur">Bekasi Timur (Margahayu)</option>
                  <option value="Bekasi Utara">Bekasi Utara (Harapan Indah)</option>
                  <option value="Rawalumbu">Rawalumbu / Kemang Pratama</option>
                  <option value="Pondok Gede">Pondok Gede / Jatiwaringin</option>
                  <option value="Jakarta Timur">Jakarta Timur (Duren Sawit, Cakung)</option>
                  <option value="Jakarta Selatan">Jakarta Selatan (Tebet, Pancoran)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alamat Lengkap Tinggal</label>
                <input
                  type="text"
                  value={ktpAddress}
                  onChange={(e) => setKtpAddress(e.target.value)}
                  placeholder="Jl. Mawar No. 12, RT 02/05"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* III. Pengalaman & Keahlian AC */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              <span>III. Pengalaman Kerja & Keahlian Servis AC</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Pengalaman di Bidang AC</label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="1-2 tahun">1 – 2 Tahun (Teknisi Junior)</option>
                  <option value="3-5 tahun">3 – 5 Tahun (Teknisi Madya)</option>
                  <option value="5+ tahun">5+ Tahun (Teknisi Senior)</option>
                  <option value="10+ tahun">10+ Tahun (Master / Ahli)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Latar Belakang Pendidikan / Kursus</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="SMK Pendingin / BLK / Kursus AC"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Keahlian yang Dikuasai (Pilih yang sesuai):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      selectedSkills.includes(skill)
                        ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      selectedSkills.includes(skill) ? 'bg-teal-600 text-white' : 'border border-slate-300'
                    }`}>
                      {selectedSkills.includes(skill) && '✓'}
                    </div>
                    <span className="text-[11px]">{skill}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* IV. Kontak Darurat */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>IV. Kontak Darurat (Keluarga)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Kontak Darurat</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Nama kerabat"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hubungan</label>
                <select
                  value={emergencyContactRelation}
                  onChange={(e) => setEmergencyContactRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="Istri / Suami">Istri / Suami</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Saudara Kandung">Saudara Kandung</option>
                  <option value="Kerabat">Kerabat / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">No. HP Kontak Darurat</label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan untuk Tim Verifikator</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sebutkan sertifikasi tambahan, peralatan kerja yang dimiliki (manifold gauge, vakum, tangga), atau kendaraan..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Verifikasi dokumen membutuhkan waktu maks. 1x24 jam</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Mengirim Pengajuan...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pengajuan Kemitraan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
