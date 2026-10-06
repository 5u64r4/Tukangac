import React, { useState } from 'react';
import { TechnicianApplicant, ApplicantStatus } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Plus, 
  Eye, 
  FileText, 
  UserCheck, 
  UserX, 
  ChevronRight, 
  Calendar,
  X,
  CreditCard,
  AlertCircle,
  User,
  Shield,
  HeartHandshake,
  Upload,
  Maximize2,
  ExternalLink,
  Building2,
  Check,
  Camera,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TechnicianApplicantsSectionProps {
  applicants?: TechnicianApplicant[];
  onUpdateApplicantStatus: (applicantId: string, newStatus: ApplicantStatus) => void;
  onAddApplicant: (newApplicant: TechnicianApplicant) => void;
  onToast: (msg: string) => void;
}

export const TechnicianApplicantsSection: React.FC<TechnicianApplicantsSectionProps> = ({
  applicants = [],
  onUpdateApplicantStatus,
  onAddApplicant,
  onToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<TechnicianApplicant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'pribadi' | 'kontak' | 'kualifikasi'>('pribadi');

  // Lightbox preview for KTP or Profile Photo
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Form state for adding new applicant (FORMULIR DATA PRIBADI)
  // I. IDENTITAS DIRI
  const [newName, setNewName] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newKtpImage, setNewKtpImage] = useState('');
  const [newBirthPlace, setNewBirthPlace] = useState('Bekasi');
  const [newBirthDate, setNewBirthDate] = useState('1997-08-15');
  const [newGender, setNewGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [newReligion, setNewReligion] = useState('Islam');
  const [newMaritalStatus, setNewMaritalStatus] = useState<'Belum Kawin' | 'Kawin' | 'Cerai'>('Belum Kawin');
  const [newCitizenship, setNewCitizenship] = useState('WNI');

  // II. KONTAK DAN ALAMAT
  const [newKtpAddress, setNewKtpAddress] = useState('');
  const [newRtRw, setNewRtRw] = useState('003 / 005');
  const [newSubdistrictKecamatan, setNewSubdistrictKecamatan] = useState('Bekasi Selatan');
  const [newCityKabupaten, setNewCityKabupaten] = useState('Kota Bekasi');
  const [newPostalCode, setNewPostalCode] = useState('17148');
  const [newIsDomicileSameAsKtp, setNewIsDomicileSameAsKtp] = useState(true);
  const [newDomicileAddress, setNewDomicileAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // IV. KONTAK DARURAT
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('Orang Tua');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');

  // V. FOTO PROFIL
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Kualifikasi & Catatan
  const [newExperience, setNewExperience] = useState('3 Tahun');
  const [newEducation, setNewEducation] = useState('SMK Teknik Pendingin & Tata Udara');
  const [newSkills, setNewSkills] = useState('Cuci AC Presisi Steam Jet, Bongkar Pasang AC Split, Isi Freon R32/R410A');
  const [newCertifications, setNewCertifications] = useState('Sertifikasi BNSP Teknisi Level 2');
  const [newNotes, setNewNotes] = useState('');

  // File upload helper
  const handleKtpUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewKtpImage(reader.result as string);
      onToast('✓ Foto KTP berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewPhotoUrl(reader.result as string);
      onToast('✓ Foto profil pelamar berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  const safeApplicants = Array.isArray(applicants) ? applicants : [];

  // Stats calculation
  const totalApplicants = safeApplicants.length;
  const pendingCount = safeApplicants.filter(a => a.status === 'pending').length;
  const acceptedCount = safeApplicants.filter(a => a.status === 'diterima').length;
  const rejectedCount = safeApplicants.filter(a => a.status === 'ditolak').length;

  const filteredApplicants = safeApplicants.filter(app => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      app.name.toLowerCase().includes(query) ||
      app.domicile.toLowerCase().includes(query) ||
      (app.nik && app.nik.toLowerCase().includes(query)) ||
      (app.ktpNumber && app.ktpNumber.toLowerCase().includes(query)) ||
      app.id.toLowerCase().includes(query) ||
      (app.skills && app.skills.some(s => s.toLowerCase().includes(query))) ||
      (app.education && app.education.toLowerCase().includes(query));
    
    const matchStatus = filterStatus === 'all' ? true : app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      onToast('Mohon isi nama lengkap dan no. telepon pelamar');
      return;
    }

    if (newNik.trim() && newNik.trim().length !== 16) {
      onToast('Nomor Induk Kependudukan (NIK) harus 16 digit angka');
      return;
    }

    const newId = `APL-2026-00${applicants.length + 1}`;
    const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TK';

    const calculatedDomicile = newCityKabupaten.trim() || newSubdistrictKecamatan.trim() || 'Bekasi / Jakarta';

    const applicantObj: TechnicianApplicant = {
      id: newId,
      name: newName.trim(),
      avatar: initials,
      photoUrl: newPhotoUrl.trim() || (newGender === 'Perempuan' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      domicile: calculatedDomicile,
      experienceYears: newExperience.trim(),
      education: newEducation.trim(),
      certifications: newCertifications ? newCertifications.split(',').map(s => s.trim()).filter(Boolean) : [],
      skills: newSkills ? newSkills.split(',').map(s => s.trim()).filter(Boolean) : ['Servis AC Standar'],
      appliedDate: 'Hari ini',
      status: 'pending',
      notes: newNotes.trim() || 'Pendaftaran pelamar baru melalui formulir data pribadi admin.',
      
      // I. IDENTITAS DIRI
      nik: newNik.trim() || `3275${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      ktpNumber: newNik.trim() || `3275${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      ktpImage: newKtpImage || '',
      birthPlace: newBirthPlace.trim(),
      birthDate: newBirthDate.trim(),
      gender: newGender,
      religion: newReligion.trim(),
      maritalStatus: newMaritalStatus,
      citizenship: newCitizenship.trim(),

      // II. KONTAK DAN ALAMAT
      ktpAddress: newKtpAddress.trim() || `Jl. Raya Utama No. ${Math.floor(10 + Math.random() * 90)}`,
      rtRw: newRtRw.trim(),
      subdistrictKecamatan: newSubdistrictKecamatan.trim(),
      cityKabupaten: newCityKabupaten.trim(),
      postalCode: newPostalCode.trim(),
      isDomicileSameAsKtp: newIsDomicileSameAsKtp,
      domicileAddress: newIsDomicileSameAsKtp ? (newKtpAddress.trim() || 'Sama dengan KTP') : (newDomicileAddress.trim() || newKtpAddress.trim()),

      // IV. KONTAK DARURAT
      emergencyContact: {
        name: newEmergencyName.trim() || 'Kontak Darurat Keluarga',
        relation: newEmergencyRelation.trim(),
        phone: newEmergencyPhone.trim() || newPhone.trim()
      },
      emergencyContactName: newEmergencyName.trim(),
      emergencyContactRelation: newEmergencyRelation.trim(),
      emergencyContactPhone: newEmergencyPhone.trim()
    };

    onAddApplicant(applicantObj);
    setShowAddModal(false);

    // Reset form
    setNewName('');
    setNewNik('');
    setNewKtpImage('');
    setNewPhotoUrl('');
    setNewPhone('');
    setNewEmail('');
    setNewKtpAddress('');
    setNewDomicileAddress('');
    setNewEmergencyName('');
    setNewEmergencyPhone('');
    setNewNotes('');
    onToast(`Pelamar baru ${applicantObj.name} (#${newId}) dengan data pribadi lengkap berhasil didaftarkan!`);
  };

  const getStatusBadge = (status: ApplicantStatus) => {
    switch (status) {
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Diterima (Lolos)
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Ditolak
          </span>
        );
      case 'diperbaiki':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            Perlu Perbaikan
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending (Review)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Perekrutan & Pelamar Teknisi
              </h2>
              <p className="text-xs text-slate-500">
                Kelola seleksi profil teknisi baru, kualifikasi sertifikasi, dan status penerimaan kerja
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelamar</span>
        </button>
      </div>

      {/* Summary KPI Cards for Applicants */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Pelamar */}
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filterStatus === 'all' ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Pelamar</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalApplicants}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Semua berkas masuk</div>
        </div>

        {/* Pending Review */}
        <div 
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filterStatus === 'pending' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">Perlu diverifikasi</div>
        </div>

        {/* Diterima / Lolos */}
        <div 
          onClick={() => setFilterStatus('diterima')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filterStatus === 'diterima' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Diterima (Lolos)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{acceptedCount}</div>
          <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">Siap bergabung armada</div>
        </div>

        {/* Ditolak */}
        <div 
          onClick={() => setFilterStatus('ditolak')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filterStatus === 'ditolak' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Ditolak</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{rejectedCount}</div>
          <div className="text-[11px] text-rose-600/80 font-medium mt-0.5">Tidak memenuhi syarat</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pelamar, keahlian, domisili, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 outline-none bg-slate-50/50 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({totalApplicants})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('diterima')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'diterima'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Diterima ({acceptedCount})
          </button>
          <button
            onClick={() => setFilterStatus('ditolak')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'ditolak'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Ditolak ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Applicant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApplicants.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700 text-sm">Tidak ada pelamar ditemukan</div>
            <p className="text-xs text-slate-400">Coba sesuaikan kata kunci pencarian atau ganti filter status.</p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={applicant.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Header card with photo and info */}
              <div className="flex items-start gap-3.5">
                {applicant.photoUrl ? (
                  <img
                    src={applicant.photoUrl}
                    alt={applicant.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl object-cover border border-sky-100 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0 select-none">
                    {applicant.avatar || applicant.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                      {applicant.name}
                    </h3>
                    {getStatusBadge(applicant.status)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{applicant.domicile}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Pengalaman: <strong>{applicant.experienceYears}</strong></span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>Melamar: {applicant.appliedDate} · ID: {applicant.id}</span>
                  </div>
                </div>
              </div>

              {/* Skills and Certifications Badges */}
              <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Keahlian Teknis:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {applicant.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {skill}
                      </span>
                    ))}
                    {applicant.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-500">
                        +{applicant.skills.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {applicant.certifications && applicant.certifications.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{applicant.certifications[0]}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: View Profile, Accept, Reject, Pending */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedApplicant(applicant)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-sky-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profil Lengkap</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {applicant.status !== 'diterima' && (
                    <button
                      onClick={() => {
                        onUpdateApplicantStatus(applicant.id, 'diterima');
                        onToast(`Pelamar ${applicant.name} DITERIMA! Berkas diteruskan ke tim HR.`);
                      }}
                      title="Terima Pelamar"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Terima</span>
                    </button>
                  )}

                  {applicant.status !== 'diperbaiki' && (
                    <button
                      onClick={() => {
                        onUpdateApplicantStatus(applicant.id, 'diperbaiki');
                        onToast(`Status pelamar ${applicant.name} diubah ke PERLU PERBAIKAN.`);
                      }}
                      title="Minta Perbaikan Berkas"
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Revisi</span>
                    </button>
                  )}

                  {applicant.status !== 'ditolak' && (
                    <button
                      onClick={() => {
                        onUpdateApplicantStatus(applicant.id, 'ditolak');
                        onToast(`Pelamar ${applicant.name} berstatus DITOLAK.`);
                      }}
                      title="Tolak Pelamar"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  )}

                  {applicant.status !== 'pending' && (
                    <button
                      onClick={() => {
                        onUpdateApplicantStatus(applicant.id, 'pending');
                        onToast(`Status pelamar ${applicant.name} dikembalikan ke PENDING.`);
                      }}
                      title="Kembalikan ke Pending"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Detail Profil Lengkap Pelamar (FORMULIR DATA PRIBADI) */}
      <AnimatePresence>
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-6 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header with Profile Photo, Name, Status */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative group shrink-0">
                    {selectedApplicant.photoUrl ? (
                      <img
                        src={selectedApplicant.photoUrl}
                        alt={selectedApplicant.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 rounded-2xl object-cover border-2 border-sky-200 shadow-md cursor-pointer group-hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImage({ url: selectedApplicant.photoUrl!, title: `Foto Profil: ${selectedApplicant.name}` })}
                      />
                    ) : (
                      <div className="w-16 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md select-none">
                        {selectedApplicant.avatar || selectedApplicant.name.charAt(0)}
                      </div>
                    )}
                    {selectedApplicant.photoUrl && (
                      <button
                        onClick={() => setPreviewImage({ url: selectedApplicant.photoUrl!, title: `Foto Profil: ${selectedApplicant.name}` })}
                        title="Perbesar Foto"
                        className="absolute bottom-1 right-1 p-1 rounded-md bg-slate-900/70 text-white hover:bg-slate-900 transition-colors shadow-xs cursor-pointer"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {selectedApplicant.name}
                      </h3>
                      {getStatusBadge(selectedApplicant.status)}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>No. Registrasi: <strong className="text-sky-700 font-mono">{selectedApplicant.id}</strong></span>
                      <span className="hidden sm:inline text-slate-300">·</span>
                      <span className="text-slate-400">Melamar: {selectedApplicant.appliedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selectedApplicant.gender || 'Laki-laki'} ({selectedApplicant.citizenship || 'WNI'})
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedApplicant.maritalStatus || 'Belum Kawin'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub Navigation Tabs inside Modal */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setDetailTab('pribadi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    detailTab === 'pribadi'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  I. Identitas Diri
                </button>
                <button
                  onClick={() => setDetailTab('kontak')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    detailTab === 'kontak'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  II & IV. Kontak, Alamat & Darurat
                </button>
                <button
                  onClick={() => setDetailTab('kualifikasi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    detailTab === 'kualifikasi'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Keahlian & Catatan HR
                </button>
              </div>

              {/* Tab 1: I. IDENTITAS DIRI */}
              {detailTab === 'pribadi' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2 font-black text-slate-800 text-xs uppercase tracking-wide">
                        <Shield className="w-4 h-4 text-sky-600" />
                        <span>I. IDENTITAS DIRI PELAMAR</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Verifikasi Resmi</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</span>
                        <div className="font-extrabold text-slate-900 text-sm">{selectedApplicant.name}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Nomor Induk Kependudukan (NIK)</span>
                        <div className="font-mono font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                          <span>{selectedApplicant.nik || selectedApplicant.ktpNumber || '3275xxxxxxxxxxxx'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tempat / Tanggal Lahir</span>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedApplicant.birthPlace || 'Bekasi'}, {selectedApplicant.birthDate || '15 Agustus 1997'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</span>
                        <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            selectedApplicant.gender === 'Laki-laki' || !selectedApplicant.gender
                              ? 'bg-sky-100 text-sky-800 border-sky-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            [ {selectedApplicant.gender === 'Laki-laki' || !selectedApplicant.gender ? '✓' : ' '} ] Laki-laki
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            selectedApplicant.gender === 'Perempuan'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            [ {selectedApplicant.gender === 'Perempuan' ? '✓' : ' '} ] Perempuan
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Agama</span>
                        <div className="font-bold text-slate-800 mt-0.5">{selectedApplicant.religion || 'Islam'}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status Pernikahan</span>
                        <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            selectedApplicant.maritalStatus === 'Belum Kawin' || !selectedApplicant.maritalStatus
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            [ {selectedApplicant.maritalStatus === 'Belum Kawin' || !selectedApplicant.maritalStatus ? '✓' : ' '} ] Belum Kawin
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            selectedApplicant.maritalStatus === 'Kawin'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            [ {selectedApplicant.maritalStatus === 'Kawin' ? '✓' : ' '} ] Kawin
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            selectedApplicant.maritalStatus === 'Cerai'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            [ {selectedApplicant.maritalStatus === 'Cerai' ? '✓' : ' '} ] Cerai
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Kewarganegaraan</span>
                        <div className="font-extrabold text-slate-800 mt-0.5">{selectedApplicant.citizenship || 'WNI (Warga Negara Indonesia)'}</div>
                      </div>
                    </div>

                    {/* Berkas KTP Upload Card */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Berkas KTP Pelamar (* Upload KTP)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Dokumen Kependudukan Sah
                        </span>
                      </div>

                      {selectedApplicant.ktpImage ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-50/50 p-2.5 flex items-center justify-between gap-3 group">
                          <img
                            src={selectedApplicant.ktpImage}
                            alt={`KTP ${selectedApplicant.name}`}
                            referrerPolicy="no-referrer"
                            className="h-16 sm:h-20 rounded-xl object-cover border border-emerald-200 shadow-2xs cursor-pointer group-hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImage({ url: selectedApplicant.ktpImage!, title: `KTP: ${selectedApplicant.name} (${selectedApplicant.nik || selectedApplicant.ktpNumber})` })}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-xs">File KTP Terlampir</div>
                            <div className="text-[11px] text-slate-500 truncate">NIK: {selectedApplicant.nik || selectedApplicant.ktpNumber}</div>
                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ Format gambar valid & dapat diverifikasi</div>
                          </div>
                          <button
                            onClick={() => setPreviewImage({ url: selectedApplicant.ktpImage!, title: `KTP: ${selectedApplicant.name} (${selectedApplicant.nik || selectedApplicant.ktpNumber})` })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat KTP</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-xs">KTP Terverifikasi (Data Digital)</div>
                              <div className="text-[10px] text-slate-500 font-mono">NIK: {selectedApplicant.nik || selectedApplicant.ktpNumber || '3275xxxxxxxxxxxx'}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg">
                            Digital Verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: II. KONTAK DAN ALAMAT & IV. KONTAK DARURAT */}
              {detailTab === 'kontak' && (
                <div className="space-y-4 text-xs">
                  {/* II. KONTAK DAN ALAMAT */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2 font-black text-slate-800 text-xs uppercase tracking-wide">
                        <MapPin className="w-4 h-4 text-sky-600" />
                        <span>II. KONTAK DAN ALAMAT</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Domisili Jabodetabek</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Alamat Sesuai KTP</span>
                        <div className="font-bold text-slate-800 mt-0.5 leading-relaxed">
                          {selectedApplicant.ktpAddress || selectedApplicant.domicile || 'Jl. Raya Utama No. 42'}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">RT / RW:</span>
                            <strong className="text-slate-700">{selectedApplicant.rtRw || '003 / 005'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Kelurahan/Kecamatan:</span>
                            <strong className="text-slate-700">{selectedApplicant.subdistrictKecamatan || 'Bekasi Selatan'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Kota / Kabupaten:</span>
                            <strong className="text-slate-700">{selectedApplicant.cityKabupaten || selectedApplicant.domicile}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Kode Pos:</span>
                            <strong className="text-slate-700">{selectedApplicant.postalCode || '17148'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Alamat Domisili Saat Ini</span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                            {selectedApplicant.isDomicileSameAsKtp ? '✓ Sama dengan KTP' : 'Lokasi Saat Ini'}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 leading-relaxed">
                          {selectedApplicant.domicileAddress || selectedApplicant.ktpAddress || selectedApplicant.domicile}
                        </div>
                      </div>

                      {/* Direct Phone & Email Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <a
                          href={`tel:${selectedApplicant.phone}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToast(`Menghubungi nomor WhatsApp/Telp: ${selectedApplicant.phone}`);
                          }}
                          className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-all flex items-center justify-between gap-2 text-emerald-900 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] text-emerald-700 font-bold uppercase">Nomor Telepon / HP</div>
                              <div className="font-black text-slate-900 truncate text-xs">{selectedApplicant.phone}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">Panggil ↗</span>
                        </a>

                        <a
                          href={`mailto:${selectedApplicant.email}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToast(`Mengirim email ke: ${selectedApplicant.email}`);
                          }}
                          className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 transition-all flex items-center justify-between gap-2 text-sky-900 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] text-sky-700 font-bold uppercase">Alamat E-mail</div>
                              <div className="font-black text-slate-900 truncate text-xs">{selectedApplicant.email}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-sky-700 group-hover:underline">Kirim ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* IV. KONTAK DARURAT (Emergency Contact) */}
                  <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                      <div className="flex items-center gap-2 font-black text-amber-900 text-xs uppercase tracking-wide">
                        <HeartHandshake className="w-4 h-4 text-amber-700" />
                        <span>IV. KONTAK DARURAT (EMERGENCY CONTACT)</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Wajib untuk K3 & Operasional
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Kontak</span>
                        <div className="font-extrabold text-slate-900 mt-0.5">
                          {selectedApplicant.emergencyContact?.name || selectedApplicant.emergencyContactName || 'Ibu Siti Rahmawati'}
                        </div>
                      </div>

                      <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Hubungan Keluarga</span>
                        <div className="font-extrabold text-amber-800 mt-0.5">
                          {selectedApplicant.emergencyContact?.relation || selectedApplicant.emergencyContactRelation || 'Orang Tua (Ibu)'}
                        </div>
                      </div>

                      <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Nomor HP Darurat</span>
                          <div className="font-mono font-extrabold text-slate-900 mt-0.5">
                            {selectedApplicant.emergencyContact?.phone || selectedApplicant.emergencyContactPhone || '0812-9988-7711'}
                          </div>
                        </div>
                        <a
                          href={`tel:${selectedApplicant.emergencyContact?.phone || selectedApplicant.emergencyContactPhone || '081299887711'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToast('Menghubungi nomor kontak darurat...');
                          }}
                          className="p-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all cursor-pointer"
                          title="Hubungi Kontak Darurat"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: KUALIFIKASI TEKNIS, SERTIFIKASI & CATATAN HR */}
              {detailTab === 'kualifikasi' && (
                <div className="space-y-4 text-xs">
                  {/* Education & Experience Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Pendidikan Terakhir</div>
                        <div className="font-bold text-slate-800 mt-0.5">{selectedApplicant.education}</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Pengalaman Kerja di Bidang AC</div>
                        <div className="font-bold text-slate-800 mt-0.5">{selectedApplicant.experienceYears}</div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Sertifikasi Resmi BNSP & Vendor
                      </h4>
                    </div>
                    {selectedApplicant.certifications && selectedApplicant.certifications.length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedApplicant.certifications.map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-500 italic border border-slate-200">
                        Belum menyertakan sertifikat resmi BNSP/Brand.
                      </div>
                    )}
                  </div>

                  {/* Technical Skills Badges */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Keahlian Teknis Terverifikasi
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApplicant.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          🛠️ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* HR Notes */}
                  {selectedApplicant.notes && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                        <FileText className="w-4 h-4" />
                        <span>Catatan Tim Rekrutmen & Uji Praktik:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{selectedApplicant.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Actions to Change Status */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                  <span>Keputusan Rekrutmen:</span>
                  <span className="font-bold text-slate-800 uppercase">({selectedApplicant.status})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateApplicantStatus(selectedApplicant.id, 'diterima');
                      setSelectedApplicant({ ...selectedApplicant, status: 'diterima' });
                      onToast(`Pelamar ${selectedApplicant.name} DITERIMA! Berkas diteruskan ke tim HR.`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedApplicant.status === 'diterima'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                    }`}
                  >
                    ✓ Diterima (Lolos)
                  </button>

                  <button
                    onClick={() => {
                      onUpdateApplicantStatus(selectedApplicant.id, 'diperbaiki');
                      setSelectedApplicant({ ...selectedApplicant, status: 'diperbaiki' });
                      onToast(`Status ${selectedApplicant.name} diubah menjadi PERLU PERBAIKAN.`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedApplicant.status === 'diperbaiki'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300'
                    }`}
                  >
                    📝 Minta Perbaikan
                  </button>

                  <button
                    onClick={() => {
                      onUpdateApplicantStatus(selectedApplicant.id, 'ditolak');
                      setSelectedApplicant({ ...selectedApplicant, status: 'ditolak' });
                      onToast(`Pelamar ${selectedApplicant.name} DITOLAK.`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedApplicant.status === 'ditolak'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300'
                    }`}
                  >
                    ✕ Ditolak
                  </button>

                  <button
                    onClick={() => {
                      onUpdateApplicantStatus(selectedApplicant.id, 'pending');
                      setSelectedApplicant({ ...selectedApplicant, status: 'pending' });
                      onToast(`Status ${selectedApplicant.name} dijadikan PENDING.`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedApplicant.status === 'pending'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                    }`}
                  >
                    ⏳ Pending
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Pelamar Baru (FORMULIR DATA PRIBADI LENGKAP) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-6 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shadow-2xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Tambah Berkas Pelamar Teknisi
                    </h3>
                    <p className="text-[11px] text-slate-400">Formulir Data Pribadi & Verifikasi KTP</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                {/* V. UPLOAD FOTO PROFIL */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                  <div className="relative shrink-0">
                    {newPhotoUrl ? (
                      <img
                        src={newPhotoUrl}
                        alt="Preview Foto"
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 rounded-xl object-cover border-2 border-sky-300 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-16 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <Camera className="w-5 h-5 mb-0.5" />
                        <span className="text-[9px] font-bold">Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block font-black text-slate-800 mb-0.5">V. Upload Foto Profil</label>
                    <p className="text-[11px] text-slate-500 mb-2">Unggah pas foto formal pelamar (format JPG/PNG)</p>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs">
                        <Upload className="w-3 h-3" />
                        <span>Pilih Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handlePhotoUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {newPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setNewPhotoUrl('')}
                          className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* I. IDENTITAS DIRI */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                    <Shield className="w-4 h-4 text-sky-600" />
                    <span>I. IDENTITAS DIRI</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Contoh: Dimas Aditya Pratama"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK) *</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        value={newNik}
                        onChange={(e) => setNewNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="16 digit angka NIK"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-mono font-medium bg-white"
                      />
                    </div>

                    {/* Upload KTP */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">* Upload KTP</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 p-2 rounded-xl border border-dashed border-sky-400 bg-sky-50/50 hover:bg-sky-50 text-sky-700 font-bold text-center cursor-pointer flex items-center justify-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{newKtpImage ? 'Ganti Berkas KTP' : 'Unggah File KTP'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleKtpUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {newKtpImage && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200">
                            ✓ Terunggah
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={newBirthPlace}
                        onChange={(e) => setNewBirthPlace(e.target.value)}
                        placeholder="Bekasi"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={newBirthDate}
                        onChange={(e) => setNewBirthDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Laki-laki', 'Perempuan'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setNewGender(g)}
                            className={`p-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                              newGender === g
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            [ {newGender === g ? '✓' : ' '} ] {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Agama</label>
                      <select
                        value={newReligion}
                        onChange={(e) => setNewReligion(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status Pernikahan</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Belum Kawin', 'Kawin', 'Cerai'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewMaritalStatus(s)}
                            className={`p-1.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                              newMaritalStatus === s
                                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kewarganegaraan</label>
                      <input
                        type="text"
                        value={newCitizenship}
                        onChange={(e) => setNewCitizenship(e.target.value)}
                        placeholder="WNI"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* II. KONTAK DAN ALAMAT */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>II. KONTAK DAN ALAMAT</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alamat KTP *</label>
                    <input
                      type="text"
                      required
                      value={newKtpAddress}
                      onChange={(e) => setNewKtpAddress(e.target.value)}
                      placeholder="Contoh: Jl. Kemakmuran No. 15"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">RT / RW</label>
                      <input
                        type="text"
                        value={newRtRw}
                        onChange={(e) => setNewRtRw(e.target.value)}
                        placeholder="003 / 005"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kelurahan / Kec.</label>
                      <input
                        type="text"
                        value={newSubdistrictKecamatan}
                        onChange={(e) => setNewSubdistrictKecamatan(e.target.value)}
                        placeholder="Bekasi Selatan"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kota / Kab.</label>
                      <input
                        type="text"
                        value={newCityKabupaten}
                        onChange={(e) => setNewCityKabupaten(e.target.value)}
                        placeholder="Kota Bekasi"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                        placeholder="17148"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Domisili Checkbox & Input */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newIsDomicileSameAsKtp}
                        onChange={(e) => setNewIsDomicileSameAsKtp(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded border-slate-300"
                      />
                      <span className="font-bold text-slate-700">Alamat domisili saat ini sama dengan alamat KTP</span>
                    </label>

                    {!newIsDomicileSameAsKtp && (
                      <div className="mt-2">
                        <label className="block font-bold text-slate-700 mb-1">Alamat Domisili Saat Ini (Jika berbeda dengan KTP)</label>
                        <input
                          type="text"
                          value={newDomicileAddress}
                          onChange={(e) => setNewDomicileAddress(e.target.value)}
                          placeholder="Alamat tempat tinggal saat ini"
                          className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / HP (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Alamat E-mail</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="dimas@gmail.com"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* IV. KONTAK DARURAT (Emergency Contact) */}
                <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/40 space-y-3">
                  <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs uppercase tracking-wide border-b border-amber-200/80 pb-2">
                    <HeartHandshake className="w-4 h-4 text-amber-700" />
                    <span>IV. KONTAK DARURAT (EMERGENCY CONTACT)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Kontak</label>
                      <input
                        type="text"
                        value={newEmergencyName}
                        onChange={(e) => setNewEmergencyName(e.target.value)}
                        placeholder="Ibu Siti Rahmawati"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hubungan Keluarga</label>
                      <input
                        type="text"
                        value={newEmergencyRelation}
                        onChange={(e) => setNewEmergencyRelation(e.target.value)}
                        placeholder="Orang Tua / Istri / Kakak"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor HP</label>
                      <input
                        type="tel"
                        value={newEmergencyPhone}
                        onChange={(e) => setNewEmergencyPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Kualifikasi & Catatan HR */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <span>KUALIFIKASI TEKNIS & CATATAN REKRUTMEN</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pengalaman Kerja</label>
                      <select
                        value={newExperience}
                        onChange={(e) => setNewExperience(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-semibold"
                      >
                        <option value="1 Tahun">1 Tahun Pengalaman</option>
                        <option value="2 Tahun">2 Tahun Pengalaman</option>
                        <option value="3 Tahun">3 Tahun Pengalaman</option>
                        <option value="4 Tahun">4 Tahun Pengalaman</option>
                        <option value="5+ Tahun">5+ Tahun Pengalaman (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                      <input
                        type="text"
                        value={newEducation}
                        onChange={(e) => setNewEducation(e.target.value)}
                        placeholder="Contoh: SMK Teknik Pendingin / D3 Teknik Mesin"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keahlian Teknis (Pisahkan koma)</label>
                    <input
                      type="text"
                      value={newSkills}
                      onChange={(e) => setNewSkills(e.target.value)}
                      placeholder="Cuci AC Presisi Steam Jet, Bongkar Pasang AC Split, Isi Freon R32"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sertifikasi Resmi (Opsional)</label>
                    <input
                      type="text"
                      value={newCertifications}
                      onChange={(e) => setNewCertifications(e.target.value)}
                      placeholder="Sertifikasi BNSP Teknisi Level 2, Daikin Certified"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan HR / Hasil Wawancara</label>
                    <textarea
                      rows={2}
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Catatan wawancara, jadwal tes praktik, atau kelayakan operasional..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-sky-500 font-medium resize-none bg-white"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Simpan Formulir Pelamar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox / Zoom Modal for KTP & Foto Profil */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl border border-slate-700 overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-sm text-slate-900 truncate pr-2">
                  {previewImage.title}
                </span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-[75vh]">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
