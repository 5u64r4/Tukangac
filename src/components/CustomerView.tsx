import React, { useState } from 'react';
import { 
  CustomerTab, 
  ServiceItem, 
  Order,
  PaymentMethod,
  PaymentChannel,
  PaymentStatus
} from '../types';
import { SERVICES, VALUE_PROPOSITIONS } from '../data/initialData';
import { 
  Snowflake, 
  Wrench, 
  Wind, 
  Settings, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MapPin, 
  Clock, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Navigation, 
  AlertCircle, 
  Sparkles, 
  BadgePercent,
  ThumbsUp,
  User,
  History,
  Tag,
  Home,
  CheckCircle2,
  Maximize2,
  X,
  Share2,
  Download,
  ClipboardList,
  Gauge,
  Award,
  CircleDollarSign,
  Zap,
  Megaphone,
  Moon,
  Sun,
  Info,
  ChevronRight,
  Mail,
  Camera,
  FileText,
  ExternalLink,
  CreditCard,
  QrCode,
  Lock,
  ReceiptText,
  LocateFixed,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FloatingSocialProof } from './FloatingSocialProof';
import { FreonTankIcon } from './FreonTankIcon';
import { AcWashIcon } from './AcWashIcon';
import { AcRepairIcon } from './AcRepairIcon';
import { AcInstallIcon } from './AcInstallIcon';
import { ArticleBlogSection } from './ArticleBlogSection';
import { ArticleDetailModal } from './ArticleDetailModal';
import { AllArticlesModal } from './AllArticlesModal';
import { OrderChatModal } from './OrderChatModal';
import { InlineOrderChat } from './InlineOrderChat';
import { OrderDetailModal } from './OrderDetailModal';
import { MidtransCheckoutModal } from './MidtransCheckoutModal';
import { Article } from '../data/articlesData';
import { updateOrderPayment } from '../services/customerService';
import { logAuditEvent } from '../services/adminService';
import { 
  getSavedCustomerLocation, 
  saveCustomerLocation, 
  detectBrowserGeolocation, 
  parseLocationFromAddressText,
  POPULAR_LOCATIONS 
} from '../services/locationService';
import heroBannerImg from '../assets/images/ac_hero_banner_widescreen_1787976334630.jpg';
import officialFlyerImg from '../assets/images/ac_care_official_flyer_1787976311544.jpg';
import technicianImg from '../assets/images/ac_technician_clean_1787975735267.jpg';

interface CustomerViewProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  orders: Order[];
  articles?: Article[];
  onAddNewOrder: (newOrder: Partial<Order>) => void;
  onToast: (msg: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  activeTab,
  setActiveTab,
  orders = [],
  articles,
  onAddNewOrder,
  onToast
}) => {
  // Booking Form State
  const [selectedService, setSelectedService] = useState<string>('Cuci AC');
  const [unitCount, setUnitCount] = useState<number>(2);
  const [complaint, setComplaint] = useState<string>('');
  const [addressName, setAddressName] = useState<string>('Rumah');
  const [fullAddress, setFullAddress] = useState<string>('Jl. Boulevard Raya Blok A4 No. 12, Bekasi Selatan');
  const [selectedDate, setSelectedDate] = useState<string>('28 Agu 2026');
  const [selectedTime, setSelectedTime] = useState<string>('10:00–12:00');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('midtrans');
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<PaymentChannel>('qris');
  const [latestCreatedOrderId, setLatestCreatedOrderId] = useState<string>('');
  const [showFlyerModal, setShowFlyerModal] = useState<boolean>(false);
  const [selectedArticleForDetail, setSelectedArticleForDetail] = useState<Article | null>(null);
  const [showAllArticlesModal, setShowAllArticlesModal] = useState<boolean>(false);
  const [chatModalOrder, setChatModalOrder] = useState<Order | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState<string>('');
  const [isMidtransModalOpen, setIsMidtransModalOpen] = useState<boolean>(false);
  const [checkoutTargetOrder, setCheckoutTargetOrder] = useState<Order | null>(null);
  const customerName = 'Budi Santoso';
  const customerInitials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'B';

  const handleCustomerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomerPhotoUrl(event.target.result as string);
          onToast('Foto profil berhasil diperbarui!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate pricing (Base service price + 20% surcharge for night slots starting 18.00)
  const currentServiceObj = SERVICES.find(s => s.name.toLowerCase().includes(selectedService.toLowerCase().split(' ')[0])) || SERVICES[0];
  const isNightSlot = selectedTime.startsWith('18:') || selectedTime.startsWith('20:');
  const baseServicePrice = currentServiceObj.price * unitCount;
  const nightSurcharge = isNightSlot ? Math.round(baseServicePrice * 0.2) : 0;
  const calculatedTotal = baseServicePrice + nightSurcharge;

  const handleQuickBook = (serviceName: string) => {
    setSelectedService(serviceName);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteBooking = () => {
    const newId = `AC2608${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const invoiceNo = `INV/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${newId}`;
    const invoiceDateStr = `${selectedDate}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    const newOrder: Order = {
      id: newId,
      customerName: 'Budi Santoso',
      customerPhone: '0812-3456-7890',
      serviceName: `${selectedService} × ${unitCount}`,
      unitCount,
      complaint: complaint || 'Pengecekan dan pembersihan rutin',
      addressLabel: addressName,
      fullAddress,
      date: selectedDate,
      timeSlot: selectedTime,
      totalPrice: calculatedTotal,
      status: 'baru',
      createdAt: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: selectedPaymentMethod,
      paymentChannel: selectedPaymentChannel,
      paymentStatus: selectedPaymentMethod === 'midtrans' ? 'pending' : 'settlement',
      invoiceNumber: invoiceNo,
      invoiceIssuedAt: invoiceDateStr,
      midtransPaymentType: selectedPaymentMethod === 'midtrans' ? selectedPaymentChannel : 'cash'
    };

    onAddNewOrder(newOrder);
    setLatestCreatedOrderId(newId);
    setSelectedTrackingOrderId(newId);
    setActiveTab('success');

    if (selectedPaymentMethod === 'midtrans') {
      setCheckoutTargetOrder(newOrder);
      setIsMidtransModalOpen(true);
      onToast('Pesanan dibuat! Membuka gerbang pembayaran Midtrans Snap...');
    } else {
      onToast('Pesanan berhasil dibuat! Bayar langsung di tempat (COD).');
    }
  };

  const handleMidtransPaymentSuccess = (orderId: string, paymentData: any) => {
    const target = orders.find(o => o.id === orderId);
    const updatePayload: Partial<Order> = {
      paymentStatus: 'settlement',
      midtransTransactionId: paymentData.transactionId || `TRX-${Date.now()}`,
      midtransPaidAt: paymentData.paidAt || new Date().toISOString(),
      paymentChannel: paymentData.paymentChannel || 'qris',
      midtransBank: paymentData.bank || 'BCA',
      midtransVaNumber: paymentData.vaNumber
    };

    if (target) {
      target.paymentStatus = 'settlement';
      target.midtransTransactionId = updatePayload.midtransTransactionId;
      target.midtransPaidAt = updatePayload.midtransPaidAt;
      target.paymentChannel = updatePayload.paymentChannel;
      target.midtransBank = updatePayload.midtransBank;
      target.midtransVaNumber = updatePayload.midtransVaNumber;
    }

    // Persist payment record to Cloud Firestore
    updateOrderPayment(orderId, updatePayload).catch(err => {
      console.warn('Could not persist payment status update to Firestore:', err);
    });

    logAuditEvent('PAYMENT_SETTLEMENT', 'customer', `Order: #${orderId}`, `Pembayaran Midtrans berhasil: ${updatePayload.paymentChannel?.toUpperCase()} (Rp${target?.totalPrice.toLocaleString('id-ID') || '0'})`).catch(() => {});
  };

  const handleOpenMidtransFromAnywhere = (order: Order) => {
    setCheckoutTargetOrder(order);
    setIsMidtransModalOpen(true);
  };

  const activeOrder = (selectedTrackingOrderId ? orders.find(o => o.id === selectedTrackingOrderId) : null) || 
    orders.find(o => o.status === 'menuju' || o.status === 'baru' || o.status === 'service') || 
    orders[0];

  const getServiceIcon = (iconName: string, customClass: string = 'w-6 h-6 text-sky-600 group-hover:text-white transition-colors') => {
    switch (iconName) {
      case 'Wind':
      case 'AcWashIcon':
      case 'Cuci AC': return <AcWashIcon className={customClass} />;
      case 'Wrench':
      case 'AcRepairIcon':
      case 'Perbaikan AC': return <AcRepairIcon className={customClass} />;
      case 'Freon':
      case 'FreonTankIcon':
      case 'Snowflake': return <FreonTankIcon className={customClass} />;
      case 'Settings':
      case 'AcInstallIcon':
      case 'Bongkar Pasang':
      case 'Bongkar / Pasang': return <AcInstallIcon className={customClass} />;
      case 'ShieldCheck': return <ShieldCheck className={customClass} />;
      default: return <AcWashIcon className={customClass} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================== TAB: HOME ===================== */}
      {activeTab === 'home' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Hero Promotional Banner Container - Perfectly proportional and uncropped */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg shadow-sky-950/10 border border-sky-100 bg-white">
            {/* 16:9 Full Graphic Banner */}
            <div className="w-full relative bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700">
              <img 
                src={heroBannerImg} 
                alt="Tukang AC Online - Tenang, Kami Siap Mendinginkan Hari Anda!" 
                referrerPolicy="no-referrer"
                className="w-full h-auto block object-contain"
              />
            </div>

            {/* Quick Action & Value Bar Below Banner */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 text-white flex flex-col gap-4">
              {/* Promo Header - Logo Discount Lebih Besar dengan Icon di Kiri dan Tulisan di Kanan */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 max-w-full">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                    <BadgePercent className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider leading-tight">
                    PROMO SERVICE AC TERPERCAYA & BERGARANSI
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-white leading-tight tracking-tight">
                  AC Bermasalah? Teknisi Datang Cepat ke Rumah Anda
                </h2>

                {/* 3 Keunggulan Fitur: Icon Besar di Atas, Tulisan di Bawah, 1 Baris Sejajar (Grid Cols 3) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                  {[
                    {
                      title: 'Booking Cepat 1 Menit',
                      desc: 'Praktis & Instan',
                      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />,
                      bg: 'from-amber-400/15 to-amber-500/5',
                      border: 'border-amber-400/30'
                    },
                    {
                      title: 'Teknisi Profesional',
                      desc: 'Bersertifikat Resmi',
                      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />,
                      bg: 'from-sky-400/15 to-blue-500/5',
                      border: 'border-sky-400/30'
                    },
                    {
                      title: 'Garansi Sejuk Optimal',
                      desc: 'Pasti Dingin & Rapi',
                      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />,
                      bg: 'from-emerald-400/15 to-teal-500/5',
                      border: 'border-emerald-400/30'
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b ${item.bg} border ${item.border} flex flex-col items-center justify-center text-center shadow-xs`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center mb-1 shadow-inner">
                        {item.icon}
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-white leading-tight block text-center">
                        {item.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-sky-200/80 font-medium leading-tight mt-0.5 hidden xs:block text-center">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: 1 Baris Horizontal, Ukuran Proporsional & Pas Tanpa Terpotong */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                <button
                  onClick={() => setActiveTab('booking')}
                  className="py-2.5 px-3 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300 group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Calendar className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <span className="text-[11px] xs:text-xs sm:text-sm font-black tracking-tight whitespace-nowrap text-slate-950">
                    BOOKING SEKARANG
                  </span>
                </button>

                <button
                  onClick={() => onToast('Menghubungi Customer Service WhatsApp...')}
                  className="py-2.5 px-3 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30 group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-200" />
                  </div>
                  <span className="text-[11px] xs:text-xs sm:text-sm font-black tracking-tight whitespace-nowrap text-white">
                    CHAT CS
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Keunggulan / Value Proposition (Seperti di gambar flyer) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VALUE_PROPOSITIONS.map((val, idx) => (
              <div 
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-md shadow-slate-200/60 hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-xl ${val.color} flex items-center justify-center shadow-xs text-sm font-bold`}>
                    {idx === 0 && <Clock className="w-4 h-4" />}
                    {idx === 1 && <ShieldCheck className="w-4 h-4" />}
                    {idx === 2 && <BadgePercent className="w-4 h-4" />}
                    {idx === 3 && <Sparkles className="w-4 h-4" />}
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                    {val.title}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Layanan Kami / Layanan Populer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-sky-600 rounded-full inline-block"></span>
                  Layanan Service & Perawatan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih layanan terbaik untuk AC Split, Inverter, & Cassette Anda
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('booking')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                Booking Form <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white via-white to-slate-50/70 border border-slate-200/90 shadow-md shadow-slate-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-xs">
                          {getServiceIcon(srv.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors">
                              {srv.name}
                            </h3>
                            {srv.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                {srv.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">{srv.category}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative z-10">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Biaya Layanan</div>
                      <div className="text-sm sm:text-base font-black text-sky-700">
                        {srv.priceFormatted} <span className="text-[11px] font-normal text-slate-500">{srv.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickBook(srv.name)}
                      className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white flex items-center justify-center font-bold text-lg shadow-xs hover:shadow-md transition-all active:scale-90 cursor-pointer"
                      title="Pesan layanan ini"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pesanan Aktif Card (Bila ada) */}
          {activeOrder && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/95 via-blue-50/60 to-white border-2 border-sky-300/90 shadow-lg shadow-sky-500/15 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-500/30">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">Pesanan Aktif #{activeOrder.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 uppercase shadow-xs">
                        {activeOrder.status === 'menuju' ? '🚗 TEKNISI MENUJU LOKASI' : activeOrder.status === 'baru' ? '🔎 Mencari Teknisi' : '🔧 Sedang Dikerjakan'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {activeOrder.serviceName} · {activeOrder.fullAddress.split(',')[1] || activeOrder.addressLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('tracking')}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-sky-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Lacak Teknisi</span>
                  </button>
                  <button
                    onClick={() => onToast('Menghubungi teknisi via WhatsApp...')}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>Teknisi: <strong className="text-slate-900">{activeOrder.technicianName || 'Andi Pratama'}</strong></span>
                <span>Estimasi Tiba: <strong className="text-sky-700 font-bold">{activeOrder.estimatedArrival || '09:15 WIB'}</strong></span>
              </div>
            </div>
          )}

          {/* Article & Blog Section - Interactive Carousel & Education Hub */}
          <ArticleBlogSection 
            articles={articles}
            onSelectArticle={(article) => setSelectedArticleForDetail(article)}
            onOpenAllArticles={() => setShowAllArticlesModal(true)}
            onSelectService={(serviceName) => {
              handleQuickBook(serviceName);
            }}
          />

          {/* Official Promo Flyer Showcase Card */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sky-900 via-slate-900 to-blue-950 p-5 sm:p-7 text-white shadow-xl border border-sky-800/60 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              {/* Flyer Preview Image with Click to Zoom and Animated Hand Effect */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div 
                  onClick={() => setShowFlyerModal(true)}
                  className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 hover:border-amber-400 transition-all duration-300 transform hover:scale-[1.02] max-w-[280px] sm:max-w-[320px]"
                >
                  <img 
                    src={officialFlyerImg} 
                    alt="Brosur Resmi Tukang AC Online Service" 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto block object-cover"
                  />

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
                      <Maximize2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase text-amber-300">
                      Klik untuk Perbesar Brosur
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <button 
                    onClick={() => setShowFlyerModal(true)}
                    className="text-xs text-sky-300 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Lihat Ukuran Penuh</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => onToast('Brosur resmi Tukang AC Online telah disalin untuk dibagikan!')}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-bold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan Promo</span>
                  </button>
                </div>
              </div>

              {/* Flyer Details & Direct Booking Actions */}
              <div className="lg:col-span-7 space-y-4">
                {/* Promo Resmi & Garansi Sejuk - Lebih Besar, Rata Kiri Kanan dengan Speaker Icon di Kiri */}
                <div className="w-full p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-between gap-3 border border-amber-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                      <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider block text-slate-950 leading-tight">
                        PROMO RESMI & GARANSI SEJUK
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                        Jaminan Dingin Maksimal & Teknisi Profesional
                      </span>
                    </div>
                  </div>
                  <div className="hidden xs:flex items-center px-2.5 py-1 rounded-lg bg-slate-950/10 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 border border-slate-950/15">
                    Official
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-white">
                  AC Bermasalah? Tenang, Kami Siap Mendinginkan Hari Anda!
                </h2>

                <p className="text-xs sm:text-sm text-sky-200 leading-relaxed">
                  Servis AC Cepat, Teknisi Profesional Berpengalaman, dan Harga Transparan Bersahabat. Nikmati udara bersih, sehat, dan sejuk optimal setiap hari.
                </p>

                {/* 5 Layanan dari Brosur - Vertikal 1 Kolom (5 Baris Kebawah) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>LAYANAN KAMI (DARI BROSUR):</span>
                    </span>
                    <span className="text-[11px] text-sky-200">Klik untuk langsung pilih</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                    {[
                      { 
                        name: 'Cuci AC', 
                        price: 'Rp75.000', 
                        desc: 'Pembersihan evaporator, blower & filter higienis',
                        icon: <AcWashIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-sky-400 to-blue-600',
                        shadow: 'shadow-sky-500/30'
                      },
                      { 
                        name: 'Perbaikan AC', 
                        price: 'Rp125.000', 
                        desc: 'Atasi AC bocor, berisik, bau atau tidak dingin',
                        icon: <AcRepairIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-emerald-400 to-teal-600',
                        shadow: 'shadow-emerald-500/30'
                      },
                      { 
                        name: 'Isi Freon', 
                        price: 'Rp150.000', 
                        desc: 'Pengisian refrigerant R32 / R410A / R22 murni',
                        icon: <FreonTankIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-cyan-400 to-blue-600',
                        shadow: 'shadow-cyan-500/30'
                      },
                      { 
                        name: 'Bongkar Pasang', 
                        price: 'Rp250.000', 
                        desc: 'Instalasi & relokasi unit AC rapi dan aman',
                        icon: <AcInstallIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-amber-400 to-orange-600',
                        shadow: 'shadow-amber-500/30'
                      },
                      { 
                        name: 'Perawatan Berkala', 
                        price: 'Rp65.000', 
                        desc: 'Maintenance rutin agar AC awet & hemat listrik',
                        icon: <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-purple-400 to-indigo-600',
                        shadow: 'shadow-purple-500/30'
                      }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickBook(item.name)}
                        className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/15 hover:border-amber-400/70 transition-all duration-200 group flex items-center justify-between gap-3 text-left cursor-pointer shadow-sm"
                      >
                        {/* Kiri: Icon Besar */}
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-gradient-to-br ${item.bg} text-white flex items-center justify-center shadow-md ${item.shadow} group-hover:scale-105 transition-transform duration-200`}>
                            {item.icon}
                          </div>

                          {/* Kanan: Tulisan Nama & Deskripsi Layanan */}
                          <div className="min-w-0">
                            <div className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors leading-tight">
                              {item.name}
                            </div>
                            <div className="text-[11px] sm:text-xs text-sky-200 line-clamp-1 mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </div>

                        {/* Ujung Kanan: Harga & Tombol Panah */}
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <div className="text-right">
                            <span className="text-[10px] text-sky-300 block uppercase font-medium">Mulai</span>
                            <span className="text-xs sm:text-sm font-black text-amber-300 whitespace-nowrap">
                              {item.price}
                            </span>
                          </div>
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 text-white flex items-center justify-center transition-colors">
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Keunggulan Utama dari Brosur (1 Baris Horizontal, Icon Besar di Atas, Teks Rata Tengah di Bawah) */}
                <div className="pt-2">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                    {[
                      {
                        title: 'Respon Cepat',
                        subtitle: 'Tepat Waktu',
                        icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-emerald-400 to-teal-600',
                        border: 'border-emerald-500/40',
                        glow: 'shadow-emerald-500/20'
                      },
                      {
                        title: 'Teknisi Ahli',
                        subtitle: 'Berpengalaman',
                        icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-sky-400 to-blue-600',
                        border: 'border-sky-500/40',
                        glow: 'shadow-sky-500/20'
                      },
                      {
                        title: 'Harga Transparan',
                        subtitle: 'Tanpa Biaya Gaib',
                        icon: <CircleDollarSign className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-amber-400 to-orange-500',
                        border: 'border-amber-500/40',
                        glow: 'shadow-amber-500/20'
                      },
                      {
                        title: 'Garansi Service',
                        subtitle: 'Pasti Dingin',
                        icon: <Award className="w-6 h-6 sm:w-7 sm:h-7" />,
                        bg: 'from-purple-400 to-indigo-600',
                        border: 'border-purple-500/40',
                        glow: 'shadow-purple-500/20'
                      }
                    ].map((badge, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border ${badge.border} flex flex-col items-center justify-center text-center transition-all duration-200 group shadow-sm`}
                      >
                        {/* Icon Logo Besar di Atas */}
                        <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br ${badge.bg} text-white flex items-center justify-center shadow-md ${badge.glow} group-hover:scale-110 transition-transform duration-200 mb-1.5`}>
                          {badge.icon}
                        </div>

                        {/* Tulisan di Bawah Rata Tengah */}
                        <span className="text-[10px] sm:text-xs font-black text-white group-hover:text-amber-300 leading-tight block text-center">
                          {badge.title}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-sky-200/80 font-medium leading-tight mt-0.5 hidden xs:block text-center">
                          {badge.subtitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tombol Aksi - Tersusun Vertikal (1 Kolom Penuh), Icon Logo di Kiri & Tulisan di Kanan */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center justify-between transition-all cursor-pointer border border-amber-300 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm sm:text-base font-black tracking-wide leading-tight">
                          PESAN SERVICE SEKARANG
                        </span>
                        <span className="block text-[11px] sm:text-xs text-slate-800 font-semibold mt-0.5">
                          Booking online cepat 1 menit tanpa antre
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-950/10 flex items-center justify-center text-slate-950 group-hover:translate-x-1 transition-transform shrink-0">
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
                    </div>
                  </button>

                  <button
                    onClick={() => onToast('Membuka konsultasi WhatsApp...')}
                    className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-bold shadow-md shadow-emerald-500/20 flex items-center justify-between transition-all cursor-pointer border border-emerald-400/40 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs sm:text-sm font-extrabold tracking-wide leading-tight">
                          KONSULTASI WHATSAPP
                        </span>
                        <span className="block text-[10px] sm:text-[11px] text-emerald-100 font-medium mt-0.5">
                          Tanya keluhan teknisi & estimasi harga gratis
                        </span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA Banner */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-sky-700 via-blue-800 to-sky-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                <Phone className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-sky-200 font-extrabold">
                  HUBUNGI KAMI SEKARANG!
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-300">
                  AC SEJUK, HIDUP LEBIH NYAMAN
                </div>
                <div className="text-xs text-sky-100 flex items-center justify-center sm:justify-start gap-3 mt-1">
                  <span>🛡️ Nyaman</span>
                  <span>🌿 Sehat</span>
                  <span>💰 Hemat Listrik</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onToast('Membuka WhatsApp Direct CS: 0812-3456-7890')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>KONSULTASI WHATSAPP</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: BOOKING WIZARD (Step 1: Layanan) ===================== */}
      {activeTab === 'booking' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Form Booking Service</h2>
              <p className="text-xs text-slate-500">Langkah 1 dari 4: Pilih Jenis Layanan</p>
            </div>
            <button 
              onClick={() => setActiveTab('home')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              Batal
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between px-2 py-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Layanan</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">2</span>
              <span>Lokasi</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">3</span>
              <span>Jadwal</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">4</span>
              <span>Konfirmasi</span>
            </div>
          </div>

          {/* Step 1 Card Content */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Paket Layanan
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm font-semibold bg-white outline-none"
              >
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} — {s.priceFormatted} {s.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah Unit AC
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-lg flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={unitCount}
                  onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center font-bold text-base p-2 rounded-xl border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setUnitCount(unitCount + 1)}
                  className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-bold text-lg flex items-center justify-center"
                >
                  +
                </button>
                <span className="text-xs text-slate-500 font-medium">Unit AC</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Keluhan / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Contoh: AC kurang dingin, outdoor bunyi bergetar, dan pipa bocor air di kamar tidur."
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs text-slate-800 outline-none"
              />
            </div>

            {/* Estimated Price Pill */}
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-sky-800 font-medium">Estimasi Biaya:</div>
                <div className="text-base font-extrabold text-sky-700">
                  Rp{calculatedTotal.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                {unitCount} unit × {currentServiceObj.name}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveTab('home')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => setActiveTab('booking2')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5"
              >
                <span>Lanjut ke Lokasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: BOOKING WIZARD (Step 2: Lokasi) ===================== */}
      {activeTab === 'booking2' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Lokasi Layanan</h2>
              <p className="text-xs text-slate-500">Langkah 2 dari 4: Tentukan Alamat Kedatangan Teknisi</p>
            </div>
            <button 
              onClick={() => setActiveTab('booking')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              Kembali
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between px-2 py-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
              <span>Layanan</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-sky-500"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Lokasi</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">3</span>
              <span>Jadwal</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">4</span>
              <span>Konfirmasi</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Label Alamat
              </label>
              <div className="flex gap-2">
                {['Rumah', 'Kantor', 'Apartemen', 'Ruko'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddressName(lbl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      addressName === lbl
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Lengkap & Patokan
              </label>
              <textarea
                rows={3}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Nama jalan, nomor rumah/blok, RT/RW, kelurahan, dan patokan dekat lokasi..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs text-slate-800 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setFullAddress('Jl. Boulevard Raya Blok A4 No. 12, Bekasi Selatan (GPS Pinpoint)');
                onToast('Lokasi GPS saat ini berhasil diterapkan');
              }}
              className="w-full p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Gunakan Lokasi GPS Saya</span>
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveTab('booking')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                onClick={() => setActiveTab('booking3')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5"
              >
                <span>Pilih Jadwal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: BOOKING WIZARD (Step 3: Jadwal) ===================== */}
      {activeTab === 'booking3' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Pilih Jadwal Kedatangan</h2>
              <p className="text-xs text-slate-500">Langkah 3 dari 4: Waktu yang fleksibel untuk Anda</p>
            </div>
            <button 
              onClick={() => setActiveTab('booking2')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              Kembali
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between px-2 py-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
              <span>Layanan</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-sky-500"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
              <span>Lokasi</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-sky-500"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
              <span>Jadwal</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">4</span>
              <span>Konfirmasi</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                Tanggal Kunjungan
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {['28 Agu 2026', '29 Agu 2026', '30 Agu 2026'].map((dt) => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setSelectedDate(dt)}
                    className={`p-3 rounded-xl text-center border font-bold text-xs transition-all ${
                      selectedDate === dt
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">{dt.split(' ')[1]}</div>
                    <div className="text-sm">{dt.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sesi Jam Pagi & Siang (Reguler) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Sesi Reguler (Pagi & Siang)</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400">Tarif Standar</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  '08:00–10:00',
                  '10:00–12:00',
                  '13:00–15:00',
                  '15:00–17:00'
                ].map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setSelectedTime(tm)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center whitespace-nowrap cursor-pointer ${
                      selectedTime === tm
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30 ring-2 ring-sky-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {tm} WIB
                  </button>
                ))}
              </div>
            </div>

            {/* Sesi Jam Malam (Mulai Pukul 18.00 sampai dengan 22.00) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Sesi Jam Malam Mulai Pukul 18.00 sampai dengan 22.00</span>
                </label>
              </div>

              {/* Catatan Box Sesi Malam */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 shadow-xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-bold text-amber-950">Catatan Tambahan Biaya 20%:</strong> Sesi malam mulai pukul 18.00 WIB dikenakan biaya tambahan sebesar <strong className="font-bold text-amber-950">20% (+Rp{Math.round(baseServicePrice * 0.2).toLocaleString('id-ID')})</strong> untuk kompensasi operasional teknisi lembur malam.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  '18:00–20:00',
                  '20:00–22:00'
                ].map((tm) => {
                  const isSelected = selectedTime === tm;
                  return (
                    <button
                      key={tm}
                      type="button"
                      onClick={() => setSelectedTime(tm)}
                      className={`py-2.5 px-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-300'
                          : 'bg-indigo-50/50 text-slate-800 border-indigo-200/90 hover:bg-indigo-100/60 hover:border-indigo-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold whitespace-nowrap">
                        <Moon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-indigo-600'}`} />
                        <span>{tm} WIB</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center tracking-tight ${
                        isSelected 
                          ? 'bg-indigo-500 text-amber-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        +20% Biaya Malam
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveTab('booking2')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                onClick={() => setActiveTab('booking4')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ringkasan Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: BOOKING WIZARD (Step 4: Konfirmasi) ===================== */}
      {activeTab === 'booking4' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Konfirmasi Pemesanan</h2>
              <p className="text-xs text-slate-500">Langkah 4 dari 4: Periksa Detail Pesanan Anda</p>
            </div>
            <button 
              onClick={() => setActiveTab('booking3')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Kembali
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between px-2 py-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
              <span>Layanan</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-sky-500"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
              <span>Lokasi</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-sky-500"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
              <span>Jadwal</span>
            </div>
            <div className="h-0.5 w-8 sm:w-12 bg-sky-500"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">4</span>
              <span>Konfirmasi</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-3 divide-y divide-slate-100">
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Layanan</span>
                <span className="text-xs font-bold text-slate-900">{selectedService} ({unitCount} Unit)</span>
              </div>
              <div className="flex justify-between items-start pt-3">
                <span className="text-xs text-slate-500">Alamat ({addressName})</span>
                <span className="text-xs font-bold text-slate-900 text-right max-w-xs">{fullAddress}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs text-slate-500">Jadwal Kunjungan</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{selectedDate} · {selectedTime} WIB</span>
                  {isNightSlot && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-0.5">
                      <Moon className="w-2.5 h-2.5 text-indigo-600" /> Sesi Malam
                    </span>
                  )}
                </div>
              </div>
              {complaint && (
                <div className="flex justify-between items-start pt-3">
                  <span className="text-xs text-slate-500">Keluhan</span>
                  <span className="text-xs text-slate-700 italic text-right max-w-xs">{complaint}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Pilih Metode Pembayaran:</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Garansi Escrow
                  </span>
                </div>

                {/* Radio Option 1: Midtrans Snap Payment */}
                <label 
                  onClick={() => setSelectedPaymentMethod('midtrans')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedPaymentMethod === 'midtrans'
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                      M
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Bayar Online via Midtrans Snap</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-extrabold">Direkomendasikan</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        QRIS (GoPay/ShopeePay/DANA), Transfer VA (BCA, Mandiri, BNI, BRI), Kartu Kredit, Indomaret & Alfamart.
                      </p>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="booking_payment" 
                    checked={selectedPaymentMethod === 'midtrans'} 
                    onChange={() => setSelectedPaymentMethod('midtrans')}
                    className="w-4 h-4 text-sky-600 accent-sky-600 shrink-0" 
                  />
                </label>

                {/* Radio Option 2: Cash / COD */}
                <label 
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedPaymentMethod === 'cash'
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                      COD
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Bayar di Tempat (Tunai ke Teknisi)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Pembayaran diserahkan secara tunai setelah seluruh pekerjaan selesai diperiksa.
                      </p>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="booking_payment" 
                    checked={selectedPaymentMethod === 'cash'} 
                    onChange={() => setSelectedPaymentMethod('cash')}
                    className="w-4 h-4 text-sky-600 accent-sky-600 shrink-0" 
                  />
                </label>
              </div>
            </div>

            {/* Rincian Rincian Biaya */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Biaya Layanan ({unitCount} × Rp{currentServiceObj.price.toLocaleString('id-ID')})</span>
                <span className="font-semibold text-slate-800">Rp{baseServicePrice.toLocaleString('id-ID')}</span>
              </div>
              {isNightSlot && (
                <div className="flex justify-between items-center text-indigo-900 bg-indigo-50/90 -mx-1 px-2 py-1.5 rounded-lg border border-indigo-200/80">
                  <span className="flex items-center gap-1 font-bold">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tambahan Sesi Malam (+20%)</span>
                  </span>
                  <span className="font-extrabold text-indigo-700">+Rp{nightSurcharge.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-800">Garansi Layanan</span>
                <span className="text-emerald-600 font-bold">30 Hari (Gratis)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex justify-between items-center">
              <div>
                <div className="text-xs text-sky-900 font-bold">Total Tagihan Invoice</div>
                <div className="text-[11px] text-sky-700">
                  {selectedPaymentMethod === 'midtrans' ? 'Checkout Midtrans Snap aman bergaransi' : 'Bayar tunai setelah servis'}
                </div>
              </div>
              <div className="text-lg sm:text-xl font-black text-sky-800">
                Rp{calculatedTotal.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCompleteBooking}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-5 h-5" />
                <span>{selectedPaymentMethod === 'midtrans' ? 'LANJUT KE MIDTRANS SNAP' : 'KONFIRMASI BOOKING (COD)'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: BOOKING SUCCESS ===================== */}
      {activeTab === 'success' && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-md text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Booking Berhasil Dibuat!</h2>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
              <span>Order</span>
              <button
                onClick={() => {
                  const targetOrd = orders.find(o => o.id === latestCreatedOrderId) || orders[0];
                  setSelectedDetailOrder(targetOrd);
                }}
                className="font-mono font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200 cursor-pointer inline-flex items-center gap-1"
                title="Buka Rincian Order"
              >
                <span>#{latestCreatedOrderId || 'AC260827002'}</span>
                <ChevronRight className="w-3 h-3 text-sky-500" />
              </button>
              <span>sedang diproses.</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
            <span>Mencari teknisi terdekat di area Anda</span>
          </div>

          {/* Timeline Simulation */}
          <div className="text-left space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Booking Terdaftar</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">2</span>
              <span>Teknisi Ditugaskan</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">3</span>
              <span>Teknisi Menuju Lokasi</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">4</span>
              <span>Pengerjaan Selesai & Garansi Aktif</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                const targetOrd = orders.find(o => o.id === latestCreatedOrderId) || orders[0];
                setSelectedDetailOrder(targetOrd);
              }}
              className="w-full py-2.5 rounded-xl bg-white border border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Lihat Detail Order & Invoice</span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Lihat Status Tracking</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: LIVE TRACKING ===================== */}
      {activeTab === 'tracking' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">Lacak Status Teknisi</h2>
                <button
                  onClick={() => setSelectedDetailOrder(activeOrder)}
                  className="px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 font-mono font-bold text-[11px] border border-sky-200 flex items-center gap-1 cursor-pointer"
                  title="Buka Rincian Order & Invoice"
                >
                  <span>#{activeOrder.id}</span>
                  <ExternalLink className="w-3 h-3 text-sky-500" />
                </button>
              </div>
              <p className="text-xs text-slate-500">{activeOrder.serviceName} · {activeOrder.date}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDetailOrder(activeOrder)}
                className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Rincian & Invoice</span>
              </button>
              <button 
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
              >
                ← Beranda
              </button>
            </div>
          </div>

          {/* Multiple Orders Selector Chip */}
          {orders.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-400 font-bold shrink-0">Pilih Order:</span>
              {orders.map((ord) => (
                <button
                  key={`track-select-${ord.id}`}
                  onClick={() => setSelectedTrackingOrderId(ord.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeOrder.id === ord.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>#{ord.id}</span>
                  <span className="text-[10px] opacity-80">({ord.status})</span>
                </button>
              ))}
            </div>
          )}

          {/* Interactive Map Canvas Simulation in Blue Accent */}
          <div className="relative h-56 rounded-2xl bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 overflow-hidden border border-sky-200 shadow-inner flex items-center justify-center">
            {/* Grid Map Lines */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute inset-x-8 top-1/2 h-1 bg-sky-400/50 rounded-full border-dashed border-sky-500"></div>

            {/* Destination Pin */}
            <div className="absolute top-1/3 left-1/4 text-center transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg mx-auto">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded shadow mt-1 inline-block">
                Rumah Anda
              </span>
            </div>

            {/* Moving Technician Pin */}
            <div className="absolute top-1/2 left-2/3 text-center transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg mx-auto border-2 border-white">
                🚗
              </div>
              <span className="text-[10px] font-bold text-sky-900 bg-white px-2 py-0.5 rounded-full shadow mt-1 inline-block">
                Teknisi {activeOrder.technicianName || 'Andi'} ({activeOrder.technicianDistance || '1,8 km'})
              </span>
            </div>
          </div>

          {/* Technician Info Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80" 
                alt="Andi Pratama" 
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-sky-300 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-slate-900">{activeOrder.technicianName || 'Andi Pratama'}</h4>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    TEK-BKS-01
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-amber-500 font-bold">⭐ {activeOrder.technicianRating || 4.9} (184 ulasan)</span>
                  <span>· 0813-8899-2211</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
              <button
                onClick={() => setChatModalOrder(activeOrder)}
                className="px-3 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                title="Buka Chat Langsung dengan Teknisi"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Teknisi</span>
              </button>
              <button
                onClick={() => onToast('Membuka rute Google Maps navigasi...')}
                className="px-3 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Buka Navigasi"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Rute</span>
              </button>
              <button
                onClick={() => onToast('Menghubungi Teknisi via Telepon / WhatsApp (0813-8899-2211)...')}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Chat WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WA</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Chat with Technician (Firebase Firestore) */}
          <InlineOrderChat
            order={activeOrder}
            currentRole="customer"
            onExpandModal={() => setChatModalOrder(activeOrder)}
            onToast={onToast}
          />

          {/* Order Progress Timeline */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tahapan Pekerjaan
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Pesanan Dikonfirmasi</div>
                  <div className="text-[11px] text-slate-500">Pukul {activeOrder.createdAt || '08:42'} WIB</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 animate-pulse">
                  🚗
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-700">Teknisi Sedang Menuju Lokasi</div>
                  <div className="text-[11px] text-slate-500">Estimasi tiba pukul {activeOrder.estimatedArrival || '09:15'} WIB</div>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  🔧
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Pengerjaan Service & Cuci AC</div>
                  <div className="text-[11px] text-slate-500">Pengecekan freon & pembersihan blower</div>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Selesai & Penerbitan Garansi</div>
                  <div className="text-[11px] text-slate-500">Garansi 30 hari resmi Tukang AC Online</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: ORDERS (Riwayat) ===================== */}
      {activeTab === 'orders' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Pesanan Saya</h2>
            <span className="text-xs text-slate-500 font-medium">{orders.length} total pesanan</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div 
                key={ord.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedDetailOrder(ord)}
                        className="font-extrabold text-sm text-slate-900 hover:text-sky-700 flex items-center gap-1 cursor-pointer font-mono group"
                        title="Klik untuk melihat detail lengkap order"
                      >
                        <span>#{ord.id}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        ord.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'menuju'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status === 'selesai' ? '✓ Selesai' : ord.status === 'menuju' ? '🚗 Menuju' : '⏳ Diproses'}
                      </span>

                      {/* Midtrans Payment Badge */}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        ord.paymentStatus === 'settlement' || ord.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ord.paymentMethod === 'midtrans'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {ord.paymentStatus === 'settlement' || ord.paymentStatus === 'paid'
                          ? '✓ LUNAS (Midtrans)'
                          : ord.paymentMethod === 'midtrans'
                          ? '💳 Menunggu Midtrans'
                          : '💵 Bayar COD'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {ord.serviceName} · {ord.date} ({ord.timeSlot})
                    </p>
                    <p className="text-[11px] text-slate-400">{ord.fullAddress}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-sky-700">
                      Rp{ord.totalPrice.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {ord.paymentMethod === 'midtrans' ? 'Midtrans Online' : 'Bayar di Tempat'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  {ord.paymentMethod === 'midtrans' && ord.paymentStatus !== 'settlement' && ord.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => handleOpenMidtransFromAnywhere(ord)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar via Midtrans</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedDetailOrder(ord)}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    title="Buka Rincian Lengkap Order"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Detail Order</span>
                  </button>
                  <button
                    onClick={() => setChatModalOrder(ord)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                    title="Buka Chat Teknisi"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Teknisi</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTrackingOrderId(ord.id);
                      setActiveTab('tracking');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3 text-sky-600" />
                    <span>Lacak</span>
                  </button>
                  <button
                    onClick={() => setSelectedDetailOrder(ord)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                  >
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: PROFILE ===================== */}
      {activeTab === 'profile' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-stretch gap-4">
            {/* Customer Portrait Avatar (Photo or Name Initial B) */}
            <div className="relative group shrink-0 flex items-stretch self-stretch">
              {customerPhotoUrl ? (
                <img
                  src={customerPhotoUrl}
                  alt={customerName}
                  referrerPolicy="no-referrer"
                  className="w-24 sm:w-28 h-full min-h-[140px] rounded-2xl object-cover border-2 border-sky-100 shadow-md bg-sky-50"
                />
              ) : (
                <div className="w-24 sm:w-28 h-full min-h-[140px] rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md shadow-sky-500/25 border-2 border-white select-none">
                  {customerInitials}
                </div>
              )}

              {/* Upload/Change Photo Button */}
              <label 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95"
                title="Unggah Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCustomerPhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Customer Info (Name, Badge, Phone, Email, Booking Count) */}
            <div className="space-y-1.5 min-w-0 flex-1 flex flex-col justify-between py-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">{customerName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                  ⭐ Member Gold
                </span>
              </div>

              {/* No Telp Terdaftar with Icon */}
              <div className="flex flex-col gap-1 text-xs text-slate-600 pt-0.5">
                <a 
                  href="tel:081234567890"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToast('No Telepon Customer: 0812-3456-7890');
                  }}
                  className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-sky-600 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>0812-3456-7890</span>
                </a>

                {/* Email Terdaftar with Icon */}
                <a 
                  href="mailto:budi.santoso@gmail.com"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToast('Email Customer: budi.santoso@gmail.com');
                  }}
                  className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-sky-600 transition-colors cursor-pointer truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">budi.santoso@gmail.com</span>
                </a>
              </div>

              {/* Booking Selesai Badge (Batas Bawah) */}
              <div className="flex items-center">
                <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                  <span>✨ 4x Booking Selesai</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Profil Cards with Large Icon on Left and Text on Right */}
          <div className="space-y-3">
            {/* Alamat Tersimpan */}
            <div 
              onClick={() => onToast('Membuka daftar alamat tersimpan: Jl. Boulevard Raya Blok A4 No. 12, Bekasi')}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex items-center justify-between gap-4 cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-sky-100/80 transition-all">
                  <Home className="w-7 h-7" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                    Alamat Tersimpan
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Rumah & Apartemen (2 Lokasi Tersimpan)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-sky-600 hidden sm:inline">Lihat</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>

            {/* Unit AC Terdaftar */}
            <div 
              onClick={() => onToast('Membuka daftar 2 unit AC terdaftar: Daikin 1 PK & Panasonic 0.5 PK')}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex items-center justify-between gap-4 cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-cyan-100/80 transition-all">
                  <Snowflake className="w-7 h-7" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                    Unit AC Terdaftar
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    2 Unit Terdaftar (Daikin 1 PK & Panasonic 0.5 PK)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-sky-600 hidden sm:inline">Kelola</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>

            {/* Voucher Saya */}
            <div 
              onClick={() => onToast('Voucher Aktif: Diskon Rp20.000 berlaku s/d akhir bulan')}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between gap-4 cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-amber-100/80 transition-all">
                  <Tag className="w-7 h-7" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Voucher Saya
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      1 Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Diskon Potongan Langsung Rp20.000
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-amber-600 hidden sm:inline">Pakai</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== FULL FLYER LIGHTBOX MODAL ===================== */}
      <AnimatePresence>
        {showFlyerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full max-h-[92vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-sky-500/30"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white leading-tight">Brosur Resmi Tukang AC Online</h3>
                    <p className="text-[11px] text-sky-300">Garansi Dingin & Servis Profesional</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToast('Tautan brosur berhasil disalin!')}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Bagikan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowFlyerModal(false)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable / Full Image View */}
              <div className="overflow-y-auto flex-1 p-2 sm:p-4 flex items-center justify-center bg-slate-950">
                <img 
                  src={officialFlyerImg} 
                  alt="Brosur Tukang AC Online Penuh" 
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-800"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300 text-center sm:text-left">
                  <span className="font-bold text-amber-300">Layanan Siaga 24 Jam:</span> 0812-3456-7890
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setShowFlyerModal(false);
                      setActiveTab('booking');
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>BOOKING DARI BROSUR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Article Detail Modal */}
      <ArticleDetailModal
        article={selectedArticleForDetail}
        onClose={() => setSelectedArticleForDetail(null)}
        onSelectService={(srv) => {
          handleQuickBook(srv);
        }}
        onToast={onToast}
      />

      {/* All Articles Catalog Modal */}
      <AllArticlesModal
        isOpen={showAllArticlesModal}
        articles={articles}
        onClose={() => setShowAllArticlesModal(false)}
        onSelectArticle={(art) => setSelectedArticleForDetail(art)}
      />

      {/* Real-time Order Chat Modal with Technician */}
      {chatModalOrder && (
        <OrderChatModal
          isOpen={!!chatModalOrder}
          onClose={() => setChatModalOrder(null)}
          order={chatModalOrder}
          currentRole="customer"
          onToast={onToast}
        />
      )}

      {/* Comprehensive Order Detail & Digital Invoice Modal */}
      {selectedDetailOrder && (
        <OrderDetailModal
          isOpen={!!selectedDetailOrder}
          order={selectedDetailOrder}
          currentRole="customer"
          onClose={() => setSelectedDetailOrder(null)}
          onOpenChat={(ord) => setChatModalOrder(ord)}
          onOpenMidtransCheckout={(ord) => handleOpenMidtransFromAnywhere(ord)}
          onNavigateTracking={(ord) => {
            setSelectedTrackingOrderId(ord.id);
            setActiveTab('tracking');
          }}
          onToast={onToast}
        />
      )}

      {/* Midtrans Snap Checkout Modal & Gateway Integration */}
      <MidtransCheckoutModal
        isOpen={isMidtransModalOpen}
        order={checkoutTargetOrder}
        onClose={() => setIsMidtransModalOpen(false)}
        onPaymentSuccess={(orderId, paymentData) => {
          handleMidtransPaymentSuccess(orderId, paymentData);
          onToast(`Pembayaran #${orderId} berhasil via Midtrans!`);
        }}
        onToast={onToast}
      />

      {/* Floating Social Proof / Live Order Notification */}
      <FloatingSocialProof onSelectBooking={setActiveTab} />
    </div>
  );
};
