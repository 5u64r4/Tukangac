import React, { useState } from 'react';
import { Order, TechnicianTab, TechnicianApplicant } from '../types';
import { OrderChatModal } from './OrderChatModal';
import { InlineOrderChat } from './InlineOrderChat';
import { OrderDetailModal } from './OrderDetailModal';
import { TechnicianSocialProofSection } from './TechnicianSocialProofSection';
import { FloatingTechnicianSocialProof } from './FloatingTechnicianSocialProof';
import { 
  Check, 
  MapPin, 
  Phone, 
  Navigation, 
  DollarSign, 
  Award, 
  Calendar, 
  AlertTriangle,
  Clock,
  ShieldAlert,
  Mail,
  User,
  Camera,
  Copy,
  BadgeCheck,
  ShieldCheck,
  X,
  Sparkles,
  QrCode,
  CheckCircle2,
  MessageSquare,
  FileText,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Building,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Truck,
  Users,
  Wrench,
  Zap
} from 'lucide-react';

interface TechnicianViewProps {
  orders: Order[];
  activeTab?: TechnicianTab;
  setActiveTab?: (tab: TechnicianTab) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onAddApplicant?: (applicant: TechnicianApplicant) => void;
  onToast: (msg: string) => void;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({
  orders,
  activeTab = 'beranda',
  setActiveTab,
  onUpdateOrderStatus,
  onAddApplicant,
  onToast
}) => {
  const [internalTab, setInternalTab] = useState<TechnicianTab>('beranda');
  const currentTab = activeTab || internalTab;
  const switchTab = (tab: TechnicianTab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const [isOnline, setIsOnline] = useState(true);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<'menuju' | 'tiba' | 'service' | 'selesai'>('menuju');
  const [showDetailProfileModal, setShowDetailProfileModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500000');
  const [withdrawBank, setWithdrawBank] = useState<string>('BCA');
  const [withdrawAccountNum, setWithdrawAccountNum] = useState<string>('827-091-4421');
  const [chatModalOrder, setChatModalOrder] = useState<Order | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Filter states for Jadwal
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('today');
  const [scheduleSearch, setScheduleSearch] = useState('');

  // Filter states for Pendapatan
  const [earningsFilter, setEarningsFilter] = useState<'all' | 'order' | 'withdraw' | 'bonus'>('all');

  // Technician Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(1450000);
  const [transactions, setTransactions] = useState([
    {
      id: 'TRX-9901',
      date: 'Hari ini, 14:00 WIB',
      title: 'Komisi Order #AC260827003',
      subtitle: 'Tambah Freon R32 · Deni Prasetyo',
      type: 'order',
      amount: 150000,
      paymentMethod: 'QRIS',
      status: 'success'
    },
    {
      id: 'TRX-9902',
      date: 'Hari ini, 09:30 WIB',
      title: 'Komisi Order #AC260827002',
      subtitle: 'Cuci AC Inverter 1 PK · Sari Rahayu',
      type: 'order',
      amount: 75000,
      paymentMethod: 'Cash COD',
      status: 'success'
    },
    {
      id: 'TRX-9889',
      date: 'Kemarin, 18:00 WIB',
      title: 'Penarikan Saldo ke BCA ****4421',
      subtitle: 'Transfer Otomatis Sukses',
      type: 'withdraw',
      amount: -1000000,
      paymentMethod: 'Bank Transfer',
      status: 'success'
    },
    {
      id: 'TRX-9870',
      date: '28 Agu 2026, 17:30 WIB',
      title: 'Bonus Performa Bintang 5 (Mingguan)',
      subtitle: 'Target 20 Unit Selesai Tanpa Komplain',
      type: 'bonus',
      amount: 250000,
      paymentMethod: 'Insentif App',
      status: 'success'
    }
  ]);

  const [technicianProfile, setTechnicianProfile] = useState({
    name: 'Andi Pratama',
    code: 'TEK-BKS-01',
    roleTitle: 'Teknisi Master (Level 3)',
    phone: '0813-8899-2211',
    email: 'andi.pratama@accare.id',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80',
    area: 'Tukang AC Online Wilayah Bekasi & Sekitarnya',
    domicile: 'Jalan Cut Mutia No. 45, Bekasi Timur',
    vehiclePlate: 'B 4821 KFA (Honda Vario 160)',
    rating: 4.9,
    reviewCount: 184,
    experienceYears: '6+ Tahun Pengalaman',
    certification: 'BNSP Teknisi Refrigerasi & Tata Udara No. REG-AC-2024-9182',
    joinDate: 'Januari 2021',
    bankName: 'BCA (Bank Central Asia)',
    bankAccount: '827-091-4421',
    bankOwner: 'ANDI PRATAMA',
    toolsStatus: 'Lengkap & Terkalibrasi (Manifold, Vacuum Pump, Steam Jet)'
  });

  const incomingOrder = orders.find(o => o.status === 'baru' || o.status === 'menuju') || orders[0];

  const handleAcceptJob = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'menuju');
    setActiveWorkflowStep('menuju');
    onToast(`Pekerjaan order #${orderId} diterima! Silakan navigasi ke lokasi.`);
  };

  const handleNextStep = (orderId: string) => {
    if (activeWorkflowStep === 'menuju') {
      setActiveWorkflowStep('tiba');
      onToast('Status diperbarui: Tiba di lokasi pelanggan');
    } else if (activeWorkflowStep === 'tiba') {
      setActiveWorkflowStep('service');
      onUpdateOrderStatus(orderId, 'service');
      onToast('Status diperbarui: Sedang melakukan pengerjaan service AC');
    } else if (activeWorkflowStep === 'service') {
      setActiveWorkflowStep('selesai');
      onUpdateOrderStatus(orderId, 'selesai');
      onToast('Selamat! Order berhasil diselesaikan.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTechnicianProfile(prev => ({
            ...prev,
            photoUrl: event.target?.result as string
          }));
          onToast('Foto profil teknisi berhasil diperbarui!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount, 10);
    if (isNaN(amountNum) || amountNum < 50000) {
      onToast('Jumlah penarikan minimal Rp50.000');
      return;
    }
    if (amountNum > walletBalance) {
      onToast('Saldo tidak mencukupi untuk penarikan ini!');
      return;
    }

    setWalletBalance(prev => prev - amountNum);
    const newTx = {
      id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Baru Saja',
      title: `Penarikan Saldo ke ${withdrawBank} ****${withdrawAccountNum.slice(-4)}`,
      subtitle: 'Sedang diproses transfer instan',
      type: 'withdraw',
      amount: -amountNum,
      paymentMethod: 'Bank Transfer',
      status: 'success'
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowWithdrawModal(false);
    onToast(`Permintaan penarikan Rp${amountNum.toLocaleString('id-ID')} berhasil diajukan!`);
  };

  // Filtered orders for Schedule
  const filteredScheduleOrders = orders.filter(ord => {
    if (scheduleSearch.trim()) {
      const q = scheduleSearch.toLowerCase();
      const matchName = ord.customerName.toLowerCase().includes(q);
      const matchId = ord.id.toLowerCase().includes(q);
      const matchService = ord.serviceName.toLowerCase().includes(q);
      const matchAddress = ord.fullAddress.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchService && !matchAddress) return false;
    }
    if (scheduleFilter === 'today') {
      return ord.status === 'baru' || ord.status === 'menuju' || ord.status === 'service' || ord.date.includes('Hari ini') || ord.date.includes('27') || ord.date.includes('31');
    }
    if (scheduleFilter === 'tomorrow') {
      return ord.date.includes('Besok') || ord.date.includes('28') || ord.date.includes('01');
    }
    return true;
  });

  // Filtered transactions for Earnings
  const filteredTransactions = transactions.filter(tx => {
    if (earningsFilter === 'all') return true;
    return tx.type === earningsFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Segmented Tabs Switcher */}
      <div className="p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => switchTab('beranda')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentTab === 'beranda'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => switchTab('jadwal')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentTab === 'jadwal'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${currentTab === 'jadwal' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => switchTab('pendapatan')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentTab === 'pendapatan'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Pendapatan</span>
        </button>

        <button
          onClick={() => switchTab('pelamar')}
          className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentTab === 'pelamar'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-amber-500" />
          <span>Info Pelamar</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${currentTab === 'pelamar' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
            180+
          </span>
        </button>

        <button
          onClick={() => switchTab('profil')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentTab === 'profil'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profil</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BERANDA / TUGAS AKTIF                                              */}
      {/* ========================================================================= */}
      {currentTab === 'beranda' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Profile Card with Photo, Code, Phone, Email */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white via-white to-slate-50 border border-slate-200/90 shadow-md shadow-slate-200/70 space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-stretch gap-3.5">
                {/* Foto Profil Potrait with Online indicator */}
                <div 
                  className="relative group cursor-pointer shrink-0 self-stretch flex items-stretch" 
                  onClick={() => setShowDetailProfileModal(true)}
                  title="Klik untuk lihat profil lengkap"
                >
                  <img
                    src={technicianProfile.photoUrl}
                    alt={technicianProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-24 sm:w-28 h-full min-h-[160px] rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-900/10 group-hover:ring-2 group-hover:ring-sky-400 transition-all bg-sky-100"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-1.5 min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                      <span>Halo, {technicianProfile.name}</span>
                      <BadgeCheck className="w-4 h-4 text-sky-600 inline shrink-0" />
                    </h2>
                  </div>

                  {/* Role Title */}
                  <div className="flex items-center">
                    <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 shadow-xs inline-block">
                      {technicianProfile.roleTitle}
                    </span>
                  </div>

                  {/* Kode Teknisi Badge */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(technicianProfile.code);
                        onToast(`Kode teknisi disalin: ${technicianProfile.code}`);
                      }}
                      className="text-[10px] sm:text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-50 hover:border-sky-300 text-slate-700 hover:text-sky-700 border border-slate-300 cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      title="Klik untuk salin kode teknisi"
                    >
                      <span>KODE: {technicianProfile.code}</span>
                      <Copy className="w-2.5 h-2.5 text-slate-500" />
                    </button>
                  </div>

                  {/* No Telp & Email Links */}
                  <div className="flex flex-col gap-1 text-xs text-slate-600">
                    <a 
                      href={`tel:${technicianProfile.phone}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToast(`No Telp: ${technicianProfile.phone}`);
                      }}
                      className="flex items-center gap-1.5 text-slate-700 hover:text-sky-600 font-semibold transition-colors group cursor-pointer"
                      title="Telepon Teknisi"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>{technicianProfile.phone}</span>
                    </a>
                    <a 
                      href={`mailto:${technicianProfile.email}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToast(`Email: ${technicianProfile.email}`);
                      }}
                      className="flex items-center gap-1.5 text-slate-700 hover:text-sky-600 font-semibold transition-colors group cursor-pointer truncate"
                      title="Kirim Email"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{technicianProfile.email}</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{technicianProfile.area}</p>
                </div>
              </div>

              {/* Right Action: Online/Offline Button & View Full Profile */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setShowDetailProfileModal(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  title="Buka Kartu ID & Sertifikat Teknisi"
                >
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span className="whitespace-nowrap">ID Card</span>
                </button>

                <button
                  onClick={() => {
                    setIsOnline(!isOnline);
                    onToast(isOnline ? 'Status: OFFLINE (Istirahat)' : 'Status: ONLINE (Siap Terima Job)');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isOnline 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Technician Stats (Interactive click to navigate) */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => switchTab('pendapatan')}
              className="p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-md shadow-slate-200/60 text-center hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer active:scale-95 text-left block group"
              title="Buka Rincian Pendapatan"
            >
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center justify-between">
                <span>Pendapatan Hari Ini</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-lg sm:text-xl font-black text-sky-700">Rp450.000</div>
              <span className="text-[10px] text-emerald-600 font-bold">3 order selesai</span>
            </button>

            <button 
              onClick={() => switchTab('jadwal')}
              className="p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-md shadow-slate-200/60 text-center hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer active:scale-95 text-left block group"
              title="Buka Jadwal Layanan"
            >
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center justify-between">
                <span>Job Aktif</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900">
                {incomingOrder ? '1 Order' : '0 Order'}
              </div>
              <span className="text-[10px] text-sky-600 font-bold">Siap dikerjakan</span>
            </button>

            <button 
              onClick={() => setShowDetailProfileModal(true)}
              className="p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-md shadow-slate-200/60 text-center hover:border-amber-300 hover:bg-amber-50/40 transition-all cursor-pointer active:scale-95 text-left block group"
              title="Lihat Rating & Sertifikasi"
            >
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center justify-between">
                <span>Rating Kepuasan</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-500">4.9 ⭐</div>
              <span className="text-[10px] text-slate-400 font-medium">184 ulasan</span>
            </button>
          </div>

          {/* Incoming / Active Order Card */}
          {incomingOrder && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 via-white to-blue-50/50 border-2 border-sky-300 shadow-lg shadow-sky-500/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">Tugas Aktif #{incomingOrder.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
                      {incomingOrder.technicianDistance || '1,8 km'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-800">{incomingOrder.customerName}</strong> ({incomingOrder.customerPhone})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-sky-700">
                    Rp{incomingOrder.totalPrice.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-slate-400">Bayar Cash/QRIS</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{incomingOrder.fullAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{incomingOrder.date} · {incomingOrder.timeSlot}</span>
                </div>
                {incomingOrder.complaint && (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                    <strong>Catatan Pelanggan:</strong> {incomingOrder.complaint}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDetailOrder(incomingOrder)}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-sky-300 text-sky-700 hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                  title="Lihat Rincian Lengkap Order & Alamat"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Detail Order</span>
                </button>
                <button
                  onClick={() => setChatModalOrder(incomingOrder)}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Pelanggan</span>
                </button>
                <button
                  onClick={() => onToast('Membuka rute Google Maps navigasi turn-by-turn...')}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Rute</span>
                </button>
                <button
                  onClick={() => onToast(`Menghubungi ${incomingOrder.customerName} via Telepon / WhatsApp (${incomingOrder.customerPhone})...`)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>WA</span>
                </button>
              </div>

              {/* Interactive Chat between Technician & Customer */}
              <InlineOrderChat
                order={incomingOrder}
                currentRole="technician"
                onExpandModal={() => setChatModalOrder(incomingOrder)}
                onToast={onToast}
              />

              {/* Workflow Step Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Status: <strong className="text-sky-700 uppercase">{activeWorkflowStep}</strong>
                </span>
                <button
                  onClick={() => handleNextStep(incomingOrder.id)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  {activeWorkflowStep === 'menuju' && 'Update: Tiba di Lokasi →'}
                  {activeWorkflowStep === 'tiba' && 'Update: Mulai Cuci/Service →'}
                  {activeWorkflowStep === 'service' && 'Update: Selesai Pengerjaan ✓'}
                  {activeWorkflowStep === 'selesai' && 'Pekerjaan Selesai'}
                </button>
              </div>
            </div>
          )}

          {/* Riwayat Order Selesai Hari Ini */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Riwayat Pekerjaan Selesai Hari Ini
              </h3>
              <button 
                onClick={() => switchTab('pendapatan')} 
                className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
              >
                Lihat Komisi →
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">#AC260827002 · Cuci AC × 1</div>
                  <div className="text-[11px] text-slate-400">Sari Rahayu · Apartemen Kamala Lagoon</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-600">+Rp75.000</div>
                  <div className="text-[10px] text-slate-400">09:30 WIB · Selesai</div>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">#AC260827003 · Tambah Freon R32</div>
                  <div className="text-[11px] text-slate-400">Deni Prasetyo · Kemang Pratama</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-600">+Rp150.000</div>
                  <div className="text-[10px] text-slate-400">14:00 WIB · Selesai</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof & Kemitraan Recruitment Quick Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">Social Proof Kemitraan</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">180+ Mitra Aktif</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                  Bagi Hasil 80%–90%, Order Melimpah &amp; Pencairan Harian
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Lihat testimoni nyata teknisi, simulasi komisi harian, atau daftarkan rekan teknisi Anda.
                </p>
              </div>
            </div>
            <button
              onClick={() => switchTab('pelamar')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <span>Buka Info Pelamar &amp; Bukti</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: JADWAL & AGENDA LAYANAN                                            */}
      {/* ========================================================================= */}
      {currentTab === 'jadwal' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header & Quick Action */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-sky-100 text-xs font-extrabold mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Agenda Layanan & Kunjungan</span>
              </div>
              <h2 className="text-xl font-black">Jadwal Tugas Teknisi</h2>
              <p className="text-xs text-sky-100 mt-1">
                Kelola slot waktu kunjungan, rute navigasi, dan koordinasi dengan pelanggan.
              </p>
            </div>
            <button
              onClick={() => onToast('Jadwal berhasil disinkronkan dengan Google Calendar')}
              className="px-4 py-2.5 rounded-xl bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4 text-sky-600" />
              <span>Sinkron Google Calendar</span>
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setScheduleFilter('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    scheduleFilter === 'today'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Hari Ini ({orders.filter(o => o.status !== 'batal').length})
                </button>
                <button
                  onClick={() => setScheduleFilter('tomorrow')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    scheduleFilter === 'tomorrow'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Besok (2)
                </button>
                <button
                  onClick={() => setScheduleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    scheduleFilter === 'all'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Jadwal ({orders.length + 2})
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari order / customer..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            {filteredScheduleOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Tidak ada jadwal pada filter ini</h4>
                <p className="text-xs text-slate-400">Silakan pilih tab 'Semua Jadwal' untuk melihat penugasan lain.</p>
                <button
                  onClick={() => {
                    setScheduleFilter('all');
                    setScheduleSearch('');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs cursor-pointer hover:bg-sky-100"
                >
                  Tampilkan Semua Jadwal
                </button>
              </div>
            ) : (
              filteredScheduleOrders.map((ord) => {
                const isCurrentActive = ord.id === incomingOrder?.id;
                return (
                  <div
                    key={`sched-${ord.id}`}
                    className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all ${
                      isCurrentActive
                        ? 'border-sky-300 shadow-md ring-2 ring-sky-100'
                        : 'border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 font-mono font-bold text-xs flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-xs text-sky-700">#{ord.id}</span>
                            <span className="font-bold text-sm text-slate-900">{ord.serviceName}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              ord.status === 'selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'menuju' || ord.status === 'service'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status === 'selesai' ? '✓ Selesai' : ord.status === 'menuju' ? '🚗 Menuju' : ord.status === 'service' ? '⚙️ Dikerjakan' : '⏳ Terjadwal'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Slot: <strong className="text-slate-800">{ord.date} ({ord.timeSlot})</strong> · {ord.unitCount} Unit
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="font-mono font-black text-sm text-slate-900">
                          Rp{ord.totalPrice.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400">Komisi Teknisi: ~Rp{(ord.totalPrice * 0.7).toLocaleString('id-ID')}</div>
                      </div>
                    </div>

                    <div className="py-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{ord.customerName}</span>
                        <span>· {ord.customerPhone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{ord.fullAddress}</span>
                      </div>
                      {ord.complaint && (
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-900 text-[11px] border border-amber-200/70 mt-1">
                          <strong>Catatan:</strong> {ord.complaint}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedDetailOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Buka Rincian Order"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>Detail Order</span>
                      </button>

                      <button
                        onClick={() => setChatModalOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Pelanggan</span>
                      </button>

                      <button
                        onClick={() => onToast(`Membuka navigasi rute ke ${ord.fullAddress}...`)}
                        className="px-3 py-1.5 rounded-xl border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Rute Maps</span>
                      </button>

                      {ord.status === 'baru' && (
                        <button
                          onClick={() => handleAcceptJob(ord.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mulai Kunjungan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PENDAPATAN & KOMISI                                                */}
      {/* ========================================================================= */}
      {currentTab === 'pendapatan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dompet & Saldo Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                <Wallet className="w-4 h-4" />
                <span>Dompet Digital Teknisi Tukang AC Online</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/10">
                {technicianProfile.code}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
              <div>
                <div className="text-xs text-sky-200/80 font-medium">Saldo Siap Ditarik</div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  Rp{walletBalance.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+Rp450.000 komisi masuk hari ini</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Tarik Saldo Instan</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-sky-200/70">
              <span>Rekening Terhubung: <strong>{technicianProfile.bankName} - {technicianProfile.bankAccount}</strong></span>
              <span className="text-[11px] text-emerald-300 font-semibold">Bebas Biaya Admin</span>
            </div>
          </div>

          {/* Performance & Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Pendapatan Minggu Ini</div>
              <div className="text-xl font-black text-slate-900">Rp2.850.000</div>
              <div className="text-[11px] text-emerald-600 font-bold">18 Unit AC Selesai</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Pendapatan Bulan Ini</div>
              <div className="text-xl font-black text-sky-700">Rp11.200.000</div>
              <div className="text-[11px] text-sky-600 font-bold">72 Pekerjaan Selesai</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Target Bonus Harian</div>
              <div className="text-xl font-black text-amber-600">3 / 5 Order</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="text-[10px] text-slate-400">2 lagi untuk bonus +Rp50.000</div>
            </div>
          </div>

          {/* Transaction History & Filter */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Riwayat Transaksi & Komisi</h3>
                <p className="text-xs text-slate-500">Daftar penerimaan komisi order dan riwayat penarikan dana.</p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEarningsFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    earningsFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setEarningsFilter('order')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    earningsFilter === 'order' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Order
                </button>
                <button
                  onClick={() => setEarningsFilter('withdraw')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    earningsFilter === 'withdraw' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tarik Saldo
                </button>
                <button
                  onClick={() => setEarningsFilter('bonus')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    earningsFilter === 'bonus' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bonus
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.amount > 0 ? <DollarSign className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{tx.title}</div>
                      <div className="text-[11px] text-slate-500">{tx.subtitle} · {tx.paymentMethod}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tx.date} · <span className="font-mono">{tx.id}</span></div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-black text-sm ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.amount > 0 ? `+Rp${tx.amount.toLocaleString('id-ID')}` : `-Rp${Math.abs(tx.amount).toLocaleString('id-ID')}`}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Sukses
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROFIL & SERTIFIKASI TEKNISI                                       */}
      {/* ========================================================================= */}
      {currentTab === 'profil' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Profile Info */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative group">
                <img
                  src={technicianProfile.photoUrl}
                  alt={technicianProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-sky-500 shadow-md bg-sky-100"
                />
                <label 
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-colors"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900">{technicianProfile.name}</h2>
                  <BadgeCheck className="w-5 h-5 text-sky-600" />
                </div>
                <div className="text-xs font-bold text-sky-700">{technicianProfile.roleTitle}</div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    ID: {technicianProfile.code}
                  </span>
                  <span className="text-xs text-amber-500 font-bold">⭐ {technicianProfile.rating} (184 ulasan)</span>
                  <span className="text-xs text-slate-400">· Bergabung {technicianProfile.joinDate}</span>
                </div>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <button
                    onClick={() => setShowDetailProfileModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Lihat ID Card Resmi & QR</span>
                  </button>
                  <button
                    onClick={() => onToast('Link portfolio & ulasan publik disalin')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Info Profil</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Profile Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onToast('Data profil teknisi berhasil disimpan dan diperbarui!');
              }}
              className="space-y-4 pt-4 border-t border-slate-100 text-xs"
            >
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-sky-600" />
                <span>Informasi Data Diri & Kontak</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={technicianProfile.name}
                    onChange={(e) => setTechnicianProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="text"
                    value={technicianProfile.phone}
                    onChange={(e) => setTechnicianProfile(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={technicianProfile.email}
                    onChange={(e) => setTechnicianProfile(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Domisili Pangkalan</label>
                  <input
                    type="text"
                    value={technicianProfile.domicile}
                    onChange={(e) => setTechnicianProfile(p => ({ ...p, domicile: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kendaraan Operasional & Plat</label>
                  <input
                    type="text"
                    value={technicianProfile.vehiclePlate}
                    onChange={(e) => setTechnicianProfile(p => ({ ...p, vehiclePlate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pengalaman Kerja</label>
                  <input
                    type="text"
                    value={technicianProfile.experienceYears}
                    onChange={(e) => setTechnicianProfile(p => ({ ...p, experienceYears: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bank Withdrawal Setting */}
              <div className="pt-3">
                <h4 className="font-extrabold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rekening Pencairan Saldo (Withdrawal)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Nama Bank / E-Wallet</label>
                    <input
                      type="text"
                      value={technicianProfile.bankName}
                      onChange={(e) => setTechnicianProfile(p => ({ ...p, bankName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={technicianProfile.bankAccount}
                      onChange={(e) => setTechnicianProfile(p => ({ ...p, bankAccount: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={technicianProfile.bankOwner}
                      onChange={(e) => setTechnicianProfile(p => ({ ...p, bankOwner: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Certification & Tools */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Sertifikasi BNSP & Standar Peralatan</span>
                </div>
                <p className="text-sky-800 text-[11px] leading-relaxed">
                  {technicianProfile.certification}
                </p>
                <div className="text-[11px] text-slate-600">
                  <strong>Peralatan Kerja:</strong> {technicianProfile.toolsStatus}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer active:scale-95 transition-all"
                >
                  Simpan Perubahan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PELAMAR & SOCIAL PROOF KEMITRAAN TEKNISI                           */}
      {/* ========================================================================= */}
      {currentTab === 'pelamar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <TechnicianSocialProofSection
            onAddApplicant={onAddApplicant}
            onToast={onToast}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TARIK SALDO / WITHDRAWAL                                           */}
      {/* ========================================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-sky-200" />
                <h3 className="font-black text-sm">Tarik Saldo Dompet Teknisi</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex justify-between items-center">
                <span className="text-slate-600">Saldo Tersedia:</span>
                <span className="text-base font-black text-sky-700 font-mono">
                  Rp{walletBalance.toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  min="50000"
                  step="50000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
                <div className="flex gap-1.5 mt-2">
                  {['100000', '250000', '500000', `${walletBalance}`].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 text-[11px] font-bold border border-slate-200 cursor-pointer"
                    >
                      {amt === `${walletBalance}` ? 'Semua' : `Rp${parseInt(amt).toLocaleString('id-ID')}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rekening Tujuan</label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{technicianProfile.bankName}</div>
                  <div className="font-mono text-slate-600">{technicianProfile.bankAccount}</div>
                  <div className="text-[11px] text-slate-400">a.n. {technicianProfile.bankOwner}</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-600/20 active:scale-95 transition-all"
                >
                  Konfirmasi Tarik Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL PROFIL & ID CARD TEKNISI                                     */}
      {/* ========================================================================= */}
      {showDetailProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-200" />
                <h3 className="font-black text-sm">Kartu ID Resmi Teknisi Tukang AC Online</h3>
              </div>
              <button
                onClick={() => setShowDetailProfileModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Photo & Main Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="relative">
                  <img
                    src={technicianProfile.photoUrl}
                    alt={technicianProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500 shadow-md"
                  />
                  <label 
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-colors"
                    title="Ganti Foto Profil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-base text-slate-900">{technicianProfile.name}</h4>
                    <BadgeCheck className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-xs font-bold text-sky-700">{technicianProfile.roleTitle}</div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-extrabold text-[11px] border border-slate-300">
                    ID: {technicianProfile.code}
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> No. Telepon
                  </span>
                  <span className="font-bold text-slate-900">{technicianProfile.phone}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" /> Email Resmi
                  </span>
                  <span className="font-bold text-slate-900">{technicianProfile.email}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Wilayah Operasional
                  </span>
                  <span className="font-bold text-slate-900">Bekasi & Sekitarnya</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Pengalaman
                  </span>
                  <span className="font-bold text-slate-900">{technicianProfile.experienceYears}</span>
                </div>
              </div>

              {/* Certification Badge */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-sky-900">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Sertifikasi Kompetensi Resmi</span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  {technicianProfile.certification}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`Teknisi Tukang AC Online: ${technicianProfile.name} (Kode: ${technicianProfile.code}, Telp: ${technicianProfile.phone}, Email: ${technicianProfile.email})`);
                  onToast('Kartu identitas teknisi berhasil disalin ke clipboard!');
                }}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Data ID</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Order Chat Modal with Customer */}
      {chatModalOrder && (
        <OrderChatModal
          isOpen={!!chatModalOrder}
          onClose={() => setChatModalOrder(null)}
          order={chatModalOrder}
          currentRole="technician"
          onToast={onToast}
        />
      )}

      {/* Comprehensive Order Detail & Service Specs Modal */}
      {selectedDetailOrder && (
        <OrderDetailModal
          isOpen={!!selectedDetailOrder}
          order={selectedDetailOrder}
          currentRole="technician"
          onClose={() => setSelectedDetailOrder(null)}
          onOpenChat={(ord) => setChatModalOrder(ord)}
          onToast={onToast}
        />
      )}

      {/* Floating Social Proof specifically for Technician Applicants & Partners */}
      <FloatingTechnicianSocialProof 
        onSelectTab={switchTab}
        onOpenApplyModal={() => switchTab('pelamar')}
      />
    </div>
  );
};

