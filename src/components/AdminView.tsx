import React, { useState } from 'react';
import { Order, Technician, TechnicianApplicant, ApplicantStatus, Article, AdminTab, CrowdsourcingConfig, AreaPriorityRule } from '../types';
import { INITIAL_APPLICANTS } from '../data/initialData';
import { TechnicianApplicantsSection } from './TechnicianApplicantsSection';
import { ArticleCmsSection } from './ArticleCmsSection';
import { TechnicianReportsSection } from './TechnicianReportsSection';
import { CommissionSettingsSection } from './CommissionSettingsSection';
import { AreaPrioritySection } from './AreaPrioritySection';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderChatModal } from './OrderChatModal';
import { 
  getSavedAreaPriorityRules, 
  saveAreaPriorityRules, 
  matchOrderToPriorityRule 
} from '../services/priorityRoutingService';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Plus, 
  Filter, 
  UserCheck, 
  Search, 
  Star, 
  DollarSign, 
  PieChart as PieChartIcon, 
  MapPin, 
  Wrench, 
  Layers,
  Briefcase,
  UserPlus,
  FileText,
  BookOpen,
  Percent,
  BarChart3,
  Sliders,
  Compass,
  Navigation,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface AdminViewProps {
  orders?: Order[];
  technicians?: Technician[];
  articles?: Article[];
  activeTab?: AdminTab;
  setActiveTab?: (tab: AdminTab) => void;
  onRefreshArticles?: () => Promise<void>;
  onAssignTechnician: (orderId: string, techName: string) => void;
  onAddNewOrder: (newOrder: Partial<Order>) => void;
  onToast: (msg: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  orders = [],
  technicians = [],
  articles = [],
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
  onRefreshArticles,
  onAssignTechnician,
  onAddNewOrder,
  onToast
}) => {
  const [internalTab, setInternalTab] = useState<AdminTab>('orders');
  const adminTab = controlledTab ?? internalTab;
  const setAdminTab = setControlledTab ?? setInternalTab;

  const [applicants, setApplicants] = useState<TechnicianApplicant[]>(INITIAL_APPLICANTS);
  const [areaRules, setAreaRules] = useState<AreaPriorityRule[]>(() => getSavedAreaPriorityRules());
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [chatModalOrder, setChatModalOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Crowdsourcing Commission Configuration (10% - 30%)
  const [commissionConfig, setCommissionConfig] = useState<CrowdsourcingConfig>({
    defaultFeePercent: 20,
    cuciAcFeePercent: 20,
    perbaikanAcFeePercent: 18,
    isiFreonFeePercent: 20,
    bongkarPasangFeePercent: 22,
    autoDeductEnabled: true,
    instantEscrowEnabled: true,
    guaranteeReservePercent: 2,
    insuranceFeeNominal: 2500,
    taxPph21Percent: 0.5
  });

  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeApplicants = Array.isArray(applicants) ? applicants : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTechnicians = Array.isArray(technicians) ? technicians : [];

  const pendingApplicantsCount = safeApplicants.filter(a => a.status === 'pending').length;
  const draftArticlesCount = safeArticles.filter(a => a.status === 'draft').length;

  const handleUpdateApplicantStatus = (applicantId: string, newStatus: ApplicantStatus) => {
    setApplicants(prev => prev.map(app => 
      app.id === applicantId ? { ...app, status: newStatus } : app
    ));
  };

  const handleAddApplicant = (newApplicant: TechnicianApplicant) => {
    setApplicants(prev => [newApplicant, ...prev]);
  };

  // New manual order state
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualService, setManualService] = useState('Cuci AC');
  const [manualAddress, setManualAddress] = useState('');

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomer || !manualPhone) {
      onToast('Mohon lengkapi nama dan no telp customer');
      return;
    }
    const newId = `AC00${orders.length + 1}`;
    onAddNewOrder({
      id: newId,
      customerName: manualCustomer,
      customerPhone: manualPhone,
      serviceName: manualService,
      unitCount: 1,
      fullAddress: manualAddress || 'Area Jakarta / Bekasi',
      date: 'Hari ini',
      timeSlot: '13:00–15:00',
      totalPrice: 75000,
      status: 'baru',
      createdAt: 'Baru saja'
    });
    setShowManualModal(false);
    setManualCustomer('');
    setManualPhone('');
    setManualAddress('');
    onToast(`Order manual #${newId} berhasil ditambahkan!`);
  };

  const filteredOrders = orders.filter((ord) => {
    const matchSearch = ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' ? true : ord.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalOmzet = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  // 1. Data Diagram Pie Chart - Layanan
  const serviceCounts: { [key: string]: number } = {
    'Cuci AC': 0,
    'Perbaikan AC': 0,
    'Isi Freon': 0,
    'Bongkar Pasang': 0,
    'Perawatan Berkala': 0,
  };

  orders.forEach((o) => {
    const s = (o.serviceName || '').toLowerCase();
    if (s.includes('cuci')) serviceCounts['Cuci AC'] += o.unitCount || 1;
    else if (s.includes('perbaikan') || s.includes('rusak') || s.includes('bocor')) serviceCounts['Perbaikan AC'] += o.unitCount || 1;
    else if (s.includes('freon')) serviceCounts['Isi Freon'] += o.unitCount || 1;
    else if (s.includes('bongkar') || s.includes('pasang')) serviceCounts['Bongkar Pasang'] += o.unitCount || 1;
    else serviceCounts['Perawatan Berkala'] += o.unitCount || 1;
  });

  const rawServiceData = [
    { name: 'Cuci AC', value: serviceCounts['Cuci AC'] + 54, color: '#0284c7' }, // Sky 600
    { name: 'Isi / Tambah Freon', value: serviceCounts['Isi Freon'] + 28, color: '#06b6d4' }, // Cyan 500
    { name: 'Perbaikan AC', value: serviceCounts['Perbaikan AC'] + 18, color: '#f59e0b' }, // Amber 500
    { name: 'Bongkar / Pasang', value: serviceCounts['Bongkar Pasang'] + 12, color: '#6366f1' }, // Indigo 500
    { name: 'Perawatan Berkala', value: serviceCounts['Perawatan Berkala'] + 8, color: '#10b981' }, // Emerald 500
  ];
  const totalServiceOrders = rawServiceData.reduce((sum, item) => sum + item.value, 0);
  const servicePieData = rawServiceData.map(item => ({
    ...item,
    percentage: Math.round((item.value / totalServiceOrders) * 100)
  }));

  // 2. Data Diagram Pie Chart - Area Operasional
  const areaCounts: { [key: string]: number } = {
    'Bekasi Selatan & Barat': 0,
    'Jakarta Timur': 0,
    'Bekasi Timur & Utara': 0,
    'Jakarta Selatan': 0,
    'Depok & Sekitarnya': 0,
  };

  orders.forEach((o) => {
    const addr = (o.fullAddress || '').toLowerCase();
    if (addr.includes('selatan') && addr.includes('bekasi')) areaCounts['Bekasi Selatan & Barat'] += 1;
    else if (addr.includes('bekasi')) areaCounts['Bekasi Timur & Utara'] += 1;
    else if (addr.includes('timur') && addr.includes('jakarta')) areaCounts['Jakarta Timur'] += 1;
    else if (addr.includes('jakarta')) areaCounts['Jakarta Selatan'] += 1;
    else areaCounts['Depok & Sekitarnya'] += 1;
  });

  const rawAreaData = [
    { name: 'Bekasi Selatan & Barat', value: areaCounts['Bekasi Selatan & Barat'] + 48, color: '#0284c7' }, // Sky 600
    { name: 'Jakarta Timur', value: areaCounts['Jakarta Timur'] + 32, color: '#3b82f6' }, // Blue 500
    { name: 'Bekasi Timur & Utara', value: areaCounts['Bekasi Timur & Utara'] + 22, color: '#06b6d4' }, // Cyan 500
    { name: 'Jakarta Selatan', value: areaCounts['Jakarta Selatan'] + 14, color: '#8b5cf6' }, // Purple 500
    { name: 'Depok & Sekitarnya', value: areaCounts['Depok & Sekitarnya'] + 8, color: '#10b981' }, // Emerald 500
  ];
  const totalAreaOrders = rawAreaData.reduce((sum, item) => sum + item.value, 0);
  const areaPieData = rawAreaData.map(item => ({
    ...item,
    percentage: Math.round((item.value / totalAreaOrders) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Top Admin Navigation Tabs */}
      <div className="p-1.5 bg-slate-200/80 rounded-2xl flex flex-wrap sm:flex-nowrap items-stretch gap-1.5 shadow-2xs">
        <button
          onClick={() => setAdminTab('orders')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            adminTab === 'orders'
              ? 'bg-white text-sky-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Pesanan</span>
        </button>

        <button
          onClick={() => setAdminTab('technician_reports')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            adminTab === 'technician_reports'
              ? 'bg-white text-sky-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-sky-600" />
          <span>Laporan Teknisi</span>
        </button>

        <button
          onClick={() => setAdminTab('commission')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            adminTab === 'commission'
              ? 'bg-white text-sky-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
          }`}
        >
          <Percent className="w-4 h-4 text-sky-600" />
          <span>Komisi & Finansial</span>
          <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
            {commissionConfig.defaultFeePercent}%
          </span>
        </button>

        <button
          onClick={() => setAdminTab('area_priority')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            adminTab === 'area_priority'
              ? 'bg-white text-sky-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Prioritas Area</span>
          <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
            {areaRules.filter(r => r.isActive).length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('applicants')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            adminTab === 'applicants'
              ? 'bg-white text-sky-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
          }`}
        >
          <Briefcase className="w-4 h-4 text-sky-600" />
          <span>Pelamar</span>
          {pendingApplicantsCount > 0 && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
              {pendingApplicantsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('articles')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            adminTab === 'articles'
              ? 'bg-white text-sky-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span>CMS Blog</span>
        </button>
      </div>

      {/* Tab Contents */}
      {adminTab === 'technician_reports' ? (
        <TechnicianReportsSection
          technicians={safeTechnicians}
          orders={safeOrders}
          commissionConfig={commissionConfig}
          onToast={onToast}
          onOpenOrderDetail={(ord) => setSelectedDetailOrder(ord)}
        />
      ) : adminTab === 'commission' ? (
        <CommissionSettingsSection
          orders={safeOrders}
          technicians={safeTechnicians}
          config={commissionConfig}
          onUpdateConfig={(newCfg) => setCommissionConfig(newCfg)}
          onToast={onToast}
          onOpenOrderDetail={(ord) => setSelectedDetailOrder(ord)}
        />
      ) : adminTab === 'area_priority' ? (
        <AreaPrioritySection
          rules={areaRules}
          technicians={safeTechnicians}
          orders={safeOrders}
          onSaveRules={(updated) => {
            setAreaRules(updated);
            saveAreaPriorityRules(updated);
          }}
          onAssignTechnician={onAssignTechnician}
          onToast={onToast}
        />
      ) : adminTab === 'articles' ? (
        <ArticleCmsSection
          articles={articles}
          onRefreshArticles={onRefreshArticles}
          onToast={onToast}
        />
      ) : adminTab === 'applicants' ? (
        <TechnicianApplicantsSection
          applicants={applicants}
          onUpdateApplicantStatus={handleUpdateApplicantStatus}
          onAddApplicant={handleAddApplicant}
          onToast={onToast}
        />
      ) : (
        <>
          {/* Header Admin */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-sky-600 rounded-full inline-block"></span>
                Dashboard Operasional Admin
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring pesanan masuk, penugasan teknisi, dan performa harian
              </p>
            </div>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5 w-fit cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Order Manual</span>
            </button>
          </div>

      {/* KPI Cards in Crisp Blue Aesthetic */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Total Order Hari Ini</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{orders.length + 20}</div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            +14% dibanding kemarin
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Sedang Proses</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {orders.filter(o => o.status === 'menuju' || o.status === 'baru').length + 5}
          </div>
          <span className="text-[11px] text-amber-700">Perlu monitoring dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Order Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {orders.filter(o => o.status === 'selesai').length + 15}
          </div>
          <span className="text-[11px] text-emerald-700">Tingkat sukses 98.4%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Omzet Harian</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700">
            Rp{(totalOmzet + 2150000).toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] font-bold text-sky-600">+8.5% target bulanan</span>
        </div>
      </div>

      {/* 2 Diagram Pie Chart (1. Layanan & 2. Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagram 1: Distribusi Layanan */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold shadow-2xs">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  1. Distribusi Layanan AC
                </h3>
                <p className="text-[11px] text-slate-400">Persentase & volume order berdasarkan jenis servis</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {totalServiceOrders} Order
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 pt-1">
            {/* Pie Chart Visual */}
            <div className="sm:col-span-6 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700/50 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: data.payload.color }}></span>
                              <span>{data.name}</span>
                            </div>
                            <div className="text-slate-300 font-mono text-[11px]">
                              Total: <span className="font-bold text-white">{data.value} Order</span> ({data.payload.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={servicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {servicePieData.map((entry, index) => (
                      <Cell key={`cell-service-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-none">{servicePieData[0].percentage}%</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">Top: Cuci</span>
              </div>
            </div>

            {/* Custom Detailed Legend List */}
            <div className="sm:col-span-6 space-y-2">
              {servicePieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono">
                    <span className="text-slate-400 text-[11px]">({item.value})</span>
                    <span className="font-black text-slate-900">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagram 2: Distribusi Area */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold shadow-2xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  2. Distribusi Area Operasional
                </h3>
                <p className="text-[11px] text-slate-400">Sebaran lokasi permintaan servis & jangkauan teknisi</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              {totalAreaOrders} Order
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 pt-1">
            {/* Pie Chart Visual */}
            <div className="sm:col-span-6 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700/50 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: data.payload.color }}></span>
                              <span>{data.name}</span>
                            </div>
                            <div className="text-slate-300 font-mono text-[11px]">
                              Total: <span className="font-bold text-white">{data.value} Order</span> ({data.payload.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={areaPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {areaPieData.map((entry, index) => (
                      <Cell key={`cell-area-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-none">{areaPieData[0].percentage}%</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">Top: Bekasi</span>
              </div>
            </div>

            {/* Custom Detailed Legend List */}
            <div className="sm:col-span-6 space-y-2">
              {areaPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono">
                    <span className="text-slate-400 text-[11px]">({item.value})</span>
                    <span className="font-black text-slate-900">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Management Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-base text-slate-900">
            Daftar Antrean & Status Order
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari order / customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-sky-500 outline-none w-44 sm:w-56"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 font-semibold outline-none bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="baru">Baru</option>
              <option value="menuju">Menuju Lokasi</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Order & Invoice</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Layanan</th>
                <th className="py-3 px-3">Jadwal</th>
                <th className="py-3 px-3">Teknisi</th>
                <th className="py-3 px-3">Status Servis</th>
                <th className="py-3 px-3">Pembayaran (Midtrans)</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => {
                const matchResult = matchOrderToPriorityRule(ord, areaRules);
                const isPriorityMatched = !!matchResult.matchedRule;
                const priorityTechName = matchResult.matchedRule?.primaryTechnicianName || 'Andi Pratama';
                const isAssignedToPriority = ord.technicianName && matchResult.matchedRule && (
                  ord.technicianName.toLowerCase() === matchResult.matchedRule.primaryTechnicianName.toLowerCase()
                );

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => setSelectedDetailOrder(ord)}
                        className="font-extrabold text-slate-900 hover:text-sky-700 font-mono text-xs flex items-center gap-1 cursor-pointer group"
                        title="Klik untuk melihat detail lengkap order"
                      >
                        <span>#{ord.id}</span>
                        <span className="text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                      </button>
                      {ord.invoiceNumber && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {ord.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.customerPhone}</div>
                      {ord.fullAddress && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px] flex items-center gap-1 mt-0.5" title={ord.fullAddress}>
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{ord.fullAddress}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      <div>{ord.serviceName}</div>
                      <div className="text-[11px] font-extrabold text-sky-700 mt-0.5">
                        Rp{ord.totalPrice.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <div>{ord.date}</div>
                      <div className="text-[11px] text-slate-400">{ord.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      {ord.technicianName ? (
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setAdminTab('technician_reports')}
                            className="inline-flex items-center gap-1 font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 hover:bg-sky-100 cursor-pointer"
                            title="Buka Laporan Teknisi"
                          >
                            <UserCheck className="w-3 h-3 text-sky-600" />
                            {ord.technicianName}
                          </button>
                          {isAssignedToPriority && (
                            <div className="text-[9px] font-bold text-amber-700 flex items-center gap-0.5">
                              <span>⭐ Prioritas Area</span>
                            </div>
                          )}
                        </div>
                      ) : isPriorityMatched ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300 inline-flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            Prioritas: {matchResult.matchedRule?.primaryTechnicianName}
                          </span>
                          <div className="text-[9px] text-slate-400 font-medium">
                            Area {matchResult.matchedRule?.district}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Belum Ditugaskan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ord.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'menuju'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status === 'selesai' ? 'Selesai' : ord.status === 'menuju' ? 'Menuju' : 'Baru'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          ord.paymentStatus === 'settlement' || ord.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.paymentMethod === 'midtrans'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {ord.paymentStatus === 'settlement' || ord.paymentStatus === 'paid'
                            ? '✓ LUNAS'
                            : ord.paymentMethod === 'midtrans'
                            ? '⏳ PENDING'
                            : '💵 COD'}
                        </span>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {ord.paymentMethod === 'midtrans' 
                            ? `Midtrans (${(ord.paymentChannel || 'Snap').toUpperCase()})` 
                            : 'Tunai di Tempat'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => setSelectedDetailOrder(ord)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-slate-700 font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1"
                          title="Buka Detail Order & Invoice"
                        >
                          <FileText className="w-3 h-3 text-sky-600" />
                          <span>Invoice</span>
                        </button>
                        {!ord.technicianName && (
                          <button
                            onClick={() => {
                              onAssignTechnician(ord.id, priorityTechName);
                              onToast(
                                isPriorityMatched
                                  ? `⭐ Order #${ord.id} berhasil ditugaskan ke Teknisi Prioritas Wilayah: ${priorityTechName}`
                                  : `Auto-assign: ${priorityTechName} ditugaskan ke #${ord.id}`
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shadow-xs cursor-pointer flex items-center gap-1 ${
                              isPriorityMatched
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                            }`}
                          >
                            {isPriorityMatched && <Sparkles className="w-3 h-3" />}
                            <span>{isPriorityMatched ? `Tugaskan Prioritas` : 'Auto-Assign'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ringkasan Operasional Teknisi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setAdminTab('technician_reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Teknisi Online</span>
            <span className="text-[10px] text-sky-600 font-bold group-hover:underline">Lihat Laporan ↗</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {technicians.filter(t => t.isOnline).length + 10} / {technicians.length + 12}
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 mt-3 overflow-hidden">
            <div className="h-full bg-sky-600 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">75% armada aktif siap tugas</div>
        </div>

        <div 
          onClick={() => setAdminTab('technician_reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Kepuasan Pelanggan</span>
            <span className="text-[10px] text-amber-600 font-bold group-hover:underline">Audit Rating ↗</span>
          </div>
          <div className="text-xl font-extrabold text-amber-500 flex items-center gap-1">
            4.88 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Berdasarkan 432 review terverifikasi</p>
        </div>

        <div 
          onClick={() => setAdminTab('commission')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Potongan Komisi Crowdsourcing</span>
            <span className="text-[10px] text-sky-600 font-bold group-hover:underline">Atur ({commissionConfig.defaultFeePercent}%) ↗</span>
          </div>
          <div className="text-xl font-extrabold text-sky-700">{commissionConfig.defaultFeePercent}% Platform Fee</div>
          <p className="text-[11px] text-slate-400 mt-2">Potongan otomatis dari komisi teknisi</p>
        </div>
      </div>

      {/* Modal Manual Order */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Tambah Order Manual (Admin)</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateManualOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Customer</label>
                <input
                  type="text"
                  required
                  value={manualCustomer}
                  onChange={(e) => setManualCustomer(e.target.value)}
                  placeholder="Contoh: Ibu Rina"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  required
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Layanan</label>
                <select
                  value={manualService}
                  onChange={(e) => setManualService(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none bg-white font-semibold"
                >
                  <option value="Cuci AC × 1">Cuci AC — Rp75.000</option>
                  <option value="Cuci AC × 2">Cuci AC × 2 — Rp150.000</option>
                  <option value="Perbaikan AC">Perbaikan AC — Mulai Rp100.000</option>
                  <option value="Isi / Tambah Freon">Isi Freon — Mulai Rp150.000</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Singkat</label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Contoh: Pondok Indah Blok C2"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-sky-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer"
                >
                  Simpan Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Comprehensive Order Detail & Invoice Modal */}
      {selectedDetailOrder && (
        <OrderDetailModal
          isOpen={!!selectedDetailOrder}
          order={selectedDetailOrder}
          currentRole="admin"
          onClose={() => setSelectedDetailOrder(null)}
          onOpenChat={(ord) => setChatModalOrder(ord)}
          onToast={onToast}
        />
      )}

      {/* Live Chat Modal */}
      {chatModalOrder && (
        <OrderChatModal
          isOpen={!!chatModalOrder}
          onClose={() => setChatModalOrder(null)}
          order={chatModalOrder}
          currentRole="admin"
          onToast={onToast}
        />
      )}
    </div>
  );
};
