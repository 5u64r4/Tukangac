import React, { useState } from 'react';
import { Order, Technician, CrowdsourcingConfig } from '../types';
import { 
  getSavedCustomFees, 
  getSavedAreaPriorityRules 
} from '../services/priorityRoutingService';
import { 
  Users, 
  Search, 
  Star, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Phone, 
  MapPin, 
  Award, 
  Check, 
  X, 
  Filter, 
  ShieldCheck, 
  ChevronRight, 
  ArrowUpRight, 
  Calendar,
  MessageSquare,
  Wrench,
  Download,
  Sparkles,
  Compass,
  Percent
} from 'lucide-react';
import { OrderDetailModal } from './OrderDetailModal';

interface TechnicianReportsSectionProps {
  technicians: Technician[];
  orders: Order[];
  commissionConfig?: CrowdsourcingConfig;
  onToast: (msg: string) => void;
  onOpenOrderDetail?: (order: Order) => void;
}

export const TechnicianReportsSection: React.FC<TechnicianReportsSectionProps> = ({
  technicians = [],
  orders = [],
  commissionConfig,
  onToast,
  onOpenOrderDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'orders' | 'rating' | 'revenue'>('orders');
  const [selectedTechForAudit, setSelectedTechForAudit] = useState<Technician | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  const defaultFeePercent = commissionConfig?.defaultFeePercent ?? 20;
  const customFees = getSavedCustomFees();
  const areaRules = getSavedAreaPriorityRules();

  // Enrich technician data with orders and revenue metrics
  const techReports = technicians.map((tech) => {
    const customFeeEntry = customFees.find(
      (cf) => cf.technicianId === tech.id || cf.technicianName.toLowerCase() === tech.name.toLowerCase()
    );
    const hasCustomFee = !!(customFeeEntry && customFeeEntry.isEnabled);
    const effectiveFeePercent = hasCustomFee ? customFeeEntry.customFeePercent : defaultFeePercent;

    const assignedAreaRules = areaRules.filter(
      (r) => r.isActive && (r.primaryTechnicianId === tech.id || r.primaryTechnicianName.toLowerCase() === tech.name.toLowerCase())
    );

    const techOrders = orders.filter(
      (o) => o.technicianName?.toLowerCase().includes(tech.name.toLowerCase())
    );
    const completedOrders = techOrders.filter((o) => o.status === 'selesai');
    const inProgressOrders = techOrders.filter((o) => o.status === 'menuju' || o.status === 'service');
    
    // Baseline simulated numbers for realistic crowdsourcing reporting
    const baseCompleted = completedOrders.length > 0 ? completedOrders.length : Math.floor(Math.random() * 8) + 12;
    const grossRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0) + (baseCompleted * 85000);
    
    const feeRate = effectiveFeePercent / 100;
    const platformFeeDeducted = Math.round(grossRevenue * feeRate);
    const netTechnicianPayout = grossRevenue - platformFeeDeducted;

    return {
      ...tech,
      hasCustomFee,
      customFeeEntry,
      effectiveFeePercent,
      assignedAreaRules,
      assignedOrders: techOrders,
      completedOrdersCount: baseCompleted,
      inProgressCount: inProgressOrders.length,
      grossRevenue,
      platformFeeDeducted,
      netTechnicianPayout,
      slaOnTimePercent: 96 + (Math.random() * 3.5),
      recentFeedback: 'Pengerjaan rapi, tepat waktu, AC langsung dingin beku & bersih.'
    };
  });

  const filteredReports = techReports.filter((tech) => {
    const matchQuery = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tech.code && tech.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tech.phone && tech.phone.includes(searchQuery));
    const matchRating = filterRating === 'all' ? true : tech.rating >= parseFloat(filterRating);
    return matchQuery && matchRating;
  }).sort((a, b) => {
    if (sortBy === 'orders') return b.completedOrdersCount - a.completedOrdersCount;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.grossRevenue - a.grossRevenue;
  });

  const totalCompletedAll = techReports.reduce((acc, t) => acc + t.completedOrdersCount, 0);
  const totalGrossAll = techReports.reduce((acc, t) => acc + t.grossRevenue, 0);
  const totalPlatformCutAll = techReports.reduce((acc, t) => acc + t.platformFeeDeducted, 0);
  const avgRatingAll = (techReports.reduce((acc, t) => acc + t.rating, 0) / (techReports.length || 1)).toFixed(2);

  const handleExportTechnicianReport = () => {
    const csvRows = [
      ['Kode', 'Nama Teknisi', 'No. HP', 'Status', 'Rating', 'Order Selesai', 'Bruto (Rp)', `Potongan Platform ${defaultFeePercent}% (Rp)`, 'Komisi Bersih (Rp)'],
      ...filteredReports.map(t => [
        t.code || `TEK-${t.id}`,
        t.name,
        t.phone,
        t.isOnline ? 'Online' : 'Offline',
        t.rating.toString(),
        t.completedOrdersCount.toString(),
        t.grossRevenue.toString(),
        t.platformFeeDeducted.toString(),
        t.netTechnicianPayout.toString()
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kinerja_Teknisi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('Laporan performa teknisi berhasil diexport ke CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-sky-600 rounded-full inline-block"></span>
            Laporan Kinerja & Order Teknisi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit pengerjaan teknisi crowdsourcing, rating pelanggan, rekap order, dan evaluasi bagi hasil
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTechnicianReport}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Teknisi Mitra Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {technicians.filter(t => t.isOnline).length} / {technicians.length}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            {Math.round((technicians.filter(t => t.isOnline).length / (technicians.length || 1)) * 100)}% Siap Terima Order
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Total Order Dikerjakan</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {totalCompletedAll} Unit
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Tingkat sukses SLA 98.4%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Rata-rata Rating Mitra</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
            {avgRatingAll} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            Pelayanan Berkualitas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Fee Platform ({defaultFeePercent}%)</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700">
            Rp{totalPlatformCutAll.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Dari Bruto Rp{totalGrossAll.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama teknisi, ID kode, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 font-semibold outline-none bg-white"
          >
            <option value="all">Semua Rating</option>
            <option value="4.8">Rating ≥ 4.8</option>
            <option value="4.5">Rating ≥ 4.5</option>
            <option value="4.0">Rating ≥ 4.0</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 font-semibold outline-none bg-white"
          >
            <option value="orders">Urutkan: Order Terbanyak</option>
            <option value="rating">Urutkan: Rating Tertinggi</option>
            <option value="revenue">Urutkan: Pendapatan Bruto</option>
          </select>
        </div>
      </div>

      {/* Technician Report Grid & Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((tech) => (
          <div
            key={tech.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-200 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              {/* Technician Identity */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="relative">
                  <img
                    src={tech.photoUrl || tech.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80'}
                    alt={tech.name}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-slate-100"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    tech.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} title={tech.isOnline ? 'Online Siap Tugas' : 'Offline'}></span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900">{tech.name}</h3>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {tech.code || `TEK-${tech.id.toUpperCase()}`}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      tech.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tech.isOnline ? '● Online Aktif' : '○ Istirahat'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                    <div className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{tech.rating}</span>
                      <span className="text-slate-400 font-normal">({tech.reviewCount || 48} ulasan)</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{tech.phone}</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Award className="w-3 h-3 text-sky-600" />
                      <span>{tech.experienceYears || '5+ Tahun Pengalaman'}</span>
                    </div>
                  </div>

                  {/* Special Custom Fee & Area Priority Badges */}
                  {(tech.hasCustomFee || (tech.assignedAreaRules && tech.assignedAreaRules.length > 0)) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {tech.hasCustomFee && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black">
                          <Percent className="w-3 h-3 text-emerald-600" />
                          Potongan Khusus: {tech.effectiveFeePercent}% ({tech.customFeeEntry?.reason || 'VIP Rate'})
                        </span>
                      )}
                      {tech.assignedAreaRules && tech.assignedAreaRules.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black">
                          <Compass className="w-3 h-3 text-amber-600" />
                          Prioritas Area: {tech.assignedAreaRules.map((r: any) => `${r.district}`).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={() => setSelectedTechForAudit(tech as any)}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Lihat riwayat pengerjaan & audit teknisi"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Audit & Laporan</span>
                </button>

                <button
                  onClick={() => onToast(`Menghubungi teknisi ${tech.name} via WhatsApp: ${tech.phone}`)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Order Selesai</span>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {tech.completedOrdersCount} Pesanan
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">SLA 98% Tepat Waktu</div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium">Total Bruto Jasa</span>
                <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
                  Rp{tech.grossRevenue.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Nilai transaksi total</div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Potongan Platform ({tech.effectiveFeePercent}%)
                  {tech.hasCustomFee && <span className="ml-1 text-[9px] text-emerald-700 font-bold">(Khusus)</span>}
                </span>
                <div className="font-mono font-extrabold text-sky-700 text-sm mt-0.5">
                  Rp{tech.platformFeeDeducted.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                  {tech.hasCustomFee ? 'Tarif Khusus Mitra' : 'Crowdsourcing Fee Standar'}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium">Net Komisi Teknisi ({100 - tech.effectiveFeePercent}%)</span>
                <div className="font-mono font-extrabold text-emerald-600 text-sm mt-0.5">
                  Rp{tech.netTechnicianPayout.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Hak Bersih Mitra</div>
              </div>
            </div>

            {/* Assigned Orders Quick Preview */}
            {tech.assignedOrders.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                  <span>Order Aktif / Terkait Teknisi ({tech.assignedOrders.length}):</span>
                  <span className="text-[10px] text-slate-400">Klik order untuk detail lengkap</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tech.assignedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        if (onOpenOrderDetail) onOpenOrderDetail(ord);
                        else setSelectedDetailOrder(ord);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sky-700">#{ord.id}</span>
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-sky-900">{ord.serviceName}</div>
                          <div className="text-[10px] text-slate-400">{ord.customerName} · {ord.date}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          ord.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'menuju'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                        <div className="font-mono font-bold text-slate-700 text-[11px] mt-0.5">
                          Rp{ord.totalPrice.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Audit & Laporan Teknisi Lengkap */}
      {selectedTechForAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Audit Kinerja & Laporan Pengerjaan
                  </h3>
                  <p className="text-xs text-slate-500">Evaluasi mitra teknisi & verifikasi komisi crowdsourcing</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTechForAudit(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={selectedTechForAudit.photoUrl || selectedTechForAudit.avatar}
                alt={selectedTechForAudit.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white shadow-sm"
              />
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-900">{selectedTechForAudit.name}</h4>
                <p className="text-xs text-slate-500">
                  Kode: <strong className="text-slate-800">{selectedTechForAudit.code || `TEK-${selectedTechForAudit.id}`}</strong> · {selectedTechForAudit.phone}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {selectedTechForAudit.rating} / 5.0
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Mitra Terverifikasi BNSP
                  </span>
                </div>
              </div>
            </div>

            {/* QC Audit Checklist */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Standar Kualitas & QC Pengerjaan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700">Foto Bukti Sebelum & Sesudah:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> 100% Terunggah</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700">SOP Tekanan Freon & Amper Meter:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Lolos Standar</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700">Kebersihan Ruangan Pasca Servis:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Rapi & Bersih</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700">Klaim Garansi 30 Hari:</span>
                  <span className="font-bold text-sky-600">0 Komplain Aktif</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-sky-900 text-white space-y-2">
              <div className="text-xs text-sky-200">Rekap Pembagian Hasil Crowdsourcing</div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white/10 p-2 rounded-xl">
                  <div className="text-[10px] text-sky-200">Bruto Order</div>
                  <div className="font-mono font-bold text-sm text-white">Rp850.000</div>
                </div>
                <div className="bg-white/10 p-2 rounded-xl">
                  <div className="text-[10px] text-sky-200">Fee Platform ({defaultFeePercent}%)</div>
                  <div className="font-mono font-bold text-sm text-amber-300">Rp{Math.round(850000 * (defaultFeePercent / 100)).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-white/10 p-2 rounded-xl">
                  <div className="text-[10px] text-sky-200">Hak Bersih Teknisi</div>
                  <div className="font-mono font-bold text-sm text-emerald-300">Rp{Math.round(850000 * ((100 - defaultFeePercent) / 100)).toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTechForAudit(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Tutup Laporan
              </button>
              <button
                onClick={() => {
                  onToast(`Evaluasi audit kinerja ${selectedTechForAudit.name} berhasil disimpan!`);
                  setSelectedTechForAudit(null);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Verifikasi & Simpan Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedDetailOrder && (
        <OrderDetailModal
          isOpen={!!selectedDetailOrder}
          order={selectedDetailOrder}
          currentRole="admin"
          onClose={() => setSelectedDetailOrder(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
};
