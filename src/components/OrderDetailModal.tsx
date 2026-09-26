import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  Navigation, 
  MessageSquare, 
  Copy, 
  Check, 
  FileText, 
  Printer, 
  Share2, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Truck,
  Zap,
  CreditCard,
  QrCode,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  currentRole?: 'customer' | 'admin' | 'technician';
  onOpenChat?: (order: Order) => void;
  onNavigateTracking?: (order: Order) => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onOpenMidtransCheckout?: (order: Order) => void;
  onToast: (msg: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  currentRole = 'customer',
  onOpenChat,
  onNavigateTracking,
  onUpdateStatus,
  onOpenMidtransCheckout,
  onToast
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'invoice' | 'garansi'>('detail');
  const [isVerifyingMidtrans, setIsVerifyingMidtrans] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    onToast(`Order ID #${order.id} berhasil disalin!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'baru':
        return {
          label: 'Pesanan Baru (Menunggu Teknisi)',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500 animate-ping',
          icon: Clock
        };
      case 'menuju':
        return {
          label: 'Teknisi Menuju Lokasi',
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
          dotClass: 'bg-sky-500 animate-pulse',
          icon: Truck
        };
      case 'service':
        return {
          label: 'Sedang Dikerjakan',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dotClass: 'bg-indigo-500 animate-pulse',
          icon: Wrench
        };
      case 'selesai':
        return {
          label: 'Selesai & Bergaransi 30 Hari',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'batal':
        return {
          label: 'Pesanan Dibatalkan',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          dotClass: 'bg-rose-500',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          badgeClass: 'bg-slate-50 text-slate-800 border-slate-200',
          dotClass: 'bg-slate-500',
          icon: Clock
        };
    }
  };

  const statusInfo = getStatusBadge(order.status);
  const StatusIcon = statusInfo.icon;

  // Calculation estimates
  const estimatedUnitPrice = Math.round((order.totalPrice || 90000) / (order.unitCount || 1));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <FileText className="w-5 h-5 text-sky-200" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg tracking-tight truncate">
                    Detail Pesanan
                  </h3>
                  <button
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-mono text-[11px] font-bold border border-white/25 cursor-pointer transition-colors"
                    title="Salin Order ID"
                  >
                    <span>#{order.id}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-sky-200" />}
                  </button>
                </div>
                <p className="text-xs text-sky-200 mt-0.5 flex items-center gap-1.5 truncate">
                  <span>Dibuat: {order.createdAt || 'Hari ini'}</span>
                  <span>·</span>
                  <span>{order.date}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('detail')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                activeTab === 'detail'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rincian Layanan
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'invoice'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Invoice Digital</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">Resmi</span>
            </button>
            <button
              onClick={() => setActiveTab('garansi')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'garansi'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garansi 30 Hari</span>
            </button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-gradient-to-b from-slate-50/50 to-white text-xs sm:text-sm text-slate-700">
            
            {/* Status Highlight Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${statusInfo.badgeClass}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <StatusIcon className="w-5 h-5 text-current" />
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${statusInfo.dotClass}`}></span>
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 leading-tight">
                    {statusInfo.label}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                    Jadwal Kunjungan: {order.date} pukul {order.timeSlot}
                  </div>
                </div>
              </div>

              {onNavigateTracking && order.status !== 'selesai' && order.status !== 'batal' && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTracking(order);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-xs active:scale-95 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Pelacakan Live</span>
                </button>
              )}
            </div>

            {/* TAB 1: RINCIAN DETAIL */}
            {activeTab === 'detail' && (
              <div className="space-y-4">
                {/* Service Card Summary */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Paket & Jumlah Unit
                    </span>
                    <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      {order.unitCount || 1} Unit AC
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-snug">
                        {order.serviceName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Pemeriksaan komprehensif, cuci evaporator indoor, pembersihan kondensor outdoor, dan uji temperatur dingin.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-base text-slate-900">
                        Rp{order.totalPrice.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-400">Termasuk PPN & Jasa</div>
                    </div>
                  </div>

                  {order.complaint && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Keluhan / Catatan:</strong> {order.complaint}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Time Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-2">
                    Lokasi & Jadwal Kunjungan
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800">{order.addressLabel}</div>
                        <div className="text-slate-500 text-[11px] leading-relaxed mt-0.5 break-words">
                          {order.fullAddress}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{order.date}</div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>Slot Waktu: {order.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Assigned Technician */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Customer Info */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Pelanggan
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-xs">
                        {order.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 truncate">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Technician Info */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>Teknisi Bertugas</span>
                      {order.technicianRating && (
                        <span className="text-amber-600 font-bold">★ {order.technicianRating}</span>
                      )}
                    </div>
                    {order.technicianName ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {order.technicianName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs text-slate-900 truncate">
                              {order.technicianName}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Terverifikasi BNSP</span>
                            </div>
                          </div>
                        </div>

                        {onOpenChat && (
                          <button
                            onClick={() => onOpenChat(order)}
                            className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
                            title="Chat Teknisi"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic py-1">
                        Sistem sedang mengalokasikan teknisi terdekat...
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Progress Steps */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Alur Pengerjaan Pesanan
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className={`p-2 rounded-xl border ${
                      order.status !== 'batal' ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                      <div className="text-[10px] font-black">1. Terkonfirmasi</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      order.status === 'menuju' || order.status === 'service' || order.status === 'selesai'
                        ? 'bg-sky-50 border-sky-200 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <Truck className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                      <div className="text-[10px] font-black">2. Menuju Lokasi</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      order.status === 'service' || order.status === 'selesai'
                        ? 'bg-sky-50 border-sky-200 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <Wrench className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                      <div className="text-[10px] font-black">3. Pengerjaan</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      order.status === 'selesai'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <div className="text-[10px] font-black">4. Garansi 30 Hari</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INVOICE DIGITAL */}
            {activeTab === 'invoice' && (
              <div className="space-y-4">
                <div id="printable-invoice-content" className="p-5 rounded-3xl bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 shadow-sm relative overflow-hidden space-y-4">
                  {/* Watermark/Stamp */}
                  <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full border-4 border-emerald-500/10 flex items-center justify-center pointer-events-none rotate-12">
                    <span className="text-[10px] font-black text-emerald-600/30 uppercase tracking-widest text-center">
                      OFFICIAL INVOICE<br/>TUKANG AC ONLINE<br/>MIDTRANS SECURED
                    </span>
                  </div>

                  {/* Invoice Header */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-sky-800 font-black text-base tracking-tight">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <span>Tukang AC Online</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Layanan Resmi Perawatan & Servis AC Berstandar BNSP
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900 font-mono">
                        {order.invoiceNumber || `INV/${order.date.replace(/ /g, '')}/${order.id}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {order.invoiceIssuedAt || `${order.date}, ${order.createdAt || '08:00'} WIB`}
                      </div>
                    </div>
                  </div>

                  {/* Customer & Payment Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/70">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Ditujukan Kepada:</div>
                      <div className="font-extrabold text-slate-800 mt-0.5">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{order.fullAddress}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran:</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-extrabold text-slate-900">
                          {order.paymentMethod === 'midtrans' 
                            ? `Midtrans Snap (${(order.paymentChannel || 'QRIS / VA').toUpperCase()})`
                            : order.paymentMethod === 'cash' 
                              ? 'Bayar di Tempat (COD / Tunai)'
                              : 'Midtrans Online / QRIS'}
                        </span>
                      </div>

                      {order.midtransTransactionId && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID Transaksi: <strong className="text-slate-700">{order.midtransTransactionId}</strong>
                        </div>
                      )}

                      {order.midtransPaidAt && (
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Lunas pada: {order.midtransPaidAt}</span>
                        </div>
                      )}

                      {order.midtransVaNumber && (
                        <div className="text-[10px] text-sky-700 font-mono">
                          VA {order.midtransBank || 'BCA'}: <strong>{order.midtransVaNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 pb-1.5">
                      <span>Item / Layanan</span>
                      <span>Qty</span>
                      <span>Subtotal</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800">{order.serviceName}</div>
                        <div className="text-[10px] text-slate-400">Jasa Teknisi Profesional + Peralatan Higienis</div>
                      </div>
                      <div className="font-bold text-slate-700 px-3">{order.unitCount || 1} unit</div>
                      <div className="font-extrabold text-slate-900 shrink-0">
                        Rp{order.totalPrice.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 text-slate-500">
                      <span>Garansi Kerja 30 Hari</span>
                      <span className="font-bold text-emerald-600">Gratis / Termasuk</span>
                    </div>

                    <div className="flex items-center justify-between py-1 text-slate-500">
                      <span>Biaya Transaksi Payment Gateway</span>
                      <span className="font-bold text-sky-600">Rp0 (Ditanggung Platform)</span>
                    </div>
                  </div>

                  {/* Total & Summary Status */}
                  <div className="border-t-2 border-dashed border-slate-300 pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Tagihan:</div>
                      <div className="text-lg sm:text-xl font-black text-sky-800">
                        Rp{order.totalPrice.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                        order.paymentStatus === 'settlement' || order.paymentStatus === 'paid' || order.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {order.paymentStatus === 'settlement' || order.paymentStatus === 'paid' || order.status === 'selesai'
                          ? 'LUNAS (SETTLEMENT)'
                          : 'MENUNGGU PEMBAYARAN'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Midtrans Actions for Admin & Customer */}
                <div className="space-y-2">
                  {order.paymentStatus !== 'settlement' && order.paymentStatus !== 'paid' && onOpenMidtransCheckout && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMidtransCheckout(order);
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar via Midtrans Snap (QRIS / Virtual Account)</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        window.print();
                        onToast('Dokumen invoice digital siap dicetak!');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Invoice</span>
                    </button>

                    <button
                      onClick={async () => {
                        setIsVerifyingMidtrans(true);
                        try {
                          const res = await fetch(`/api/midtrans/status/${order.id}`);
                          const data = await res.json();
                          onToast(`Status Midtrans #${order.id}: ${data.status || 'Pending'}`);
                        } catch (e) {
                          onToast('Sinkronisasi status Midtrans selesai');
                        } finally {
                          setIsVerifyingMidtrans(false);
                        }
                      }}
                      disabled={isVerifyingMidtrans}
                      className="px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingMidtrans ? 'animate-spin text-sky-600' : ''}`} />
                      <span>Cek Midtrans</span>
                    </button>

                    <button
                      onClick={() => onToast(`Tautan invoice INV/${order.id} telah disalin untuk dikirim via WhatsApp`)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Kirim WA</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SERTIFIKAT GARANSI 30 HARI */}
            {activeTab === 'garansi' && (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white shadow-xl relative overflow-hidden space-y-4 border border-emerald-700">
                  {/* Decorative badge */}
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      <div>
                        <div className="font-black text-sm tracking-wide uppercase">Sertifikat Garansi Resmi</div>
                        <div className="text-[10px] text-emerald-200">Tukang AC Online Customer Protection</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-emerald-700 text-emerald-100 border border-emerald-500/40">
                      30 HARI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-emerald-100 leading-relaxed">
                    <p>
                      Pesanan dengan ID <strong className="text-white font-mono">#{order.id}</strong> dilindungi garansi servis selama 30 hari kalender sejak tanggal pengerjaan selesai.
                    </p>
                    <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-700/40 space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Gratis kunjungan ulang jika AC tidak dingin kembali</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Jaminan pengerjaan rapi & bebas kebocoran air indoor</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Klaim garansi instan via WhatsApp Customer Service</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-300 border-t border-emerald-700/40">
                    <div>Status: <span className="text-white font-bold">{order.status === 'selesai' ? 'Aktif (Berlaku)' : 'Aktif setelah pengerjaan selesai'}</span></div>
                    <div className="font-mono text-[10px]">ID: {order.id}</div>
                  </div>
                </div>

                <button
                  onClick={() => onToast('Membuka layanan klaim garansi via WhatsApp resmi...')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Klaim Garansi / Hubungi CS</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] text-slate-500 font-medium truncate">
              Order ID: <strong className="text-slate-800 font-mono">#{order.id}</strong>
            </div>

            <div className="flex items-center gap-2">
              {onOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(order);
                  }}
                  className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat {currentRole === 'technician' ? 'Customer' : 'Teknisi'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
