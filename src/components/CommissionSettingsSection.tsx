import React, { useState } from 'react';
import { Order, Technician, CrowdsourcingConfig, TechnicianCustomFee } from '../types';
import { 
  Percent, 
  Sliders, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  Save, 
  RotateCcw, 
  Layers, 
  Download, 
  FileText, 
  HelpCircle, 
  Calendar, 
  ArrowRight, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  XCircle,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderDetailModal } from './OrderDetailModal';
import { 
  getSavedTechnicianCustomFees, 
  saveTechnicianCustomFees, 
  calculateOrderFeeBreakdown 
} from '../services/priorityRoutingService';

interface CommissionSettingsSectionProps {
  orders: Order[];
  technicians: Technician[];
  config: CrowdsourcingConfig;
  onUpdateConfig: (newConfig: CrowdsourcingConfig) => void;
  onToast: (msg: string) => void;
  onOpenOrderDetail?: (order: Order) => void;
}

export const CommissionSettingsSection: React.FC<CommissionSettingsSectionProps> = ({
  orders = [],
  technicians = [],
  config,
  onUpdateConfig,
  onToast,
  onOpenOrderDetail
}) => {
  // Local state for editable global settings
  const [defaultFee, setDefaultFee] = useState<number>(config?.defaultFeePercent ?? 20);
  const [cuciFee, setCuciFee] = useState<number>(config?.cuciAcFeePercent ?? 20);
  const [perbaikanFee, setPerbaikanFee] = useState<number>(config?.perbaikanAcFeePercent ?? 18);
  const [freonFee, setFreonFee] = useState<number>(config?.isiFreonFeePercent ?? 20);
  const [bongkarFee, setBongkarFee] = useState<number>(config?.bongkarPasangFeePercent ?? 22);
  const [autoDeduct, setAutoDeduct] = useState<boolean>(config?.autoDeductEnabled ?? true);
  const [instantEscrow, setInstantEscrow] = useState<boolean>(config?.instantEscrowEnabled ?? true);
  const [guaranteeReserve, setGuaranteeReserve] = useState<number>(config?.guaranteeReservePercent ?? 2);
  const [insuranceFee, setInsuranceFee] = useState<number>(config?.insuranceFeeNominal ?? 2500);

  // Custom Fees per technician state
  const [customFees, setCustomFees] = useState<TechnicianCustomFee[]>(() => {
    return config?.technicianCustomFees?.length 
      ? config.technicianCustomFees 
      : getSavedTechnicianCustomFees();
  });

  // Active view tab inside commission module
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'custom_tech' | 'ledger' | 'simulator'>('ledger');
  
  // Custom Fee Modal state
  const [isCustomFeeModalOpen, setIsCustomFeeModalOpen] = useState(false);
  const [selectedTechForFee, setSelectedTechForFee] = useState<Technician | null>(null);
  const [formCustomRate, setFormCustomRate] = useState<number>(12);
  const [formCustomCuci, setFormCustomCuci] = useState<number>(12);
  const [formCustomPerbaikan, setFormCustomPerbaikan] = useState<number>(10);
  const [formCustomFreon, setFormCustomFreon] = useState<number>(12);
  const [formCustomBongkar, setFormCustomBongkar] = useState<number>(14);
  const [formCustomSubsidy, setFormCustomSubsidy] = useState<number>(10000);
  const [formReasonCategory, setFormReasonCategory] = useState<'top_performer' | 'senior_partner' | 'area_promoter' | 'specialist' | 'custom'>('top_performer');
  const [formCustomNotes, setFormCustomNotes] = useState<string>('');

  // Ledger search & filters
  const [searchLedger, setSearchLedger] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Simulator test amount
  const [simOrderAmount, setSimOrderAmount] = useState<number>(150000);
  const [simServiceCategory, setSimServiceCategory] = useState<string>('cuci');
  const [simSelectedTechId, setSimSelectedTechId] = useState<string>('default');

  // Handle open custom fee modal for specific technician
  const handleOpenCustomFeeModal = (tech: Technician) => {
    setSelectedTechForFee(tech);
    const existing = customFees.find(cf => cf.technicianId === tech.id || cf.technicianName.toLowerCase() === tech.name.toLowerCase());
    if (existing) {
      setFormCustomRate(existing.customFeePercent);
      setFormCustomCuci(existing.cuciAcFeePercent ?? existing.customFeePercent);
      setFormCustomPerbaikan(existing.perbaikanAcFeePercent ?? existing.customFeePercent);
      setFormCustomFreon(existing.isiFreonFeePercent ?? existing.customFeePercent);
      setFormCustomBongkar(existing.bongkarPasangFeePercent ?? existing.customFeePercent);
      setFormCustomSubsidy(existing.subsidyPerOrderNominal ?? 0);
      setFormReasonCategory(existing.reasonCategory);
      setFormCustomNotes(existing.notes || '');
    } else {
      setFormCustomRate(12);
      setFormCustomCuci(12);
      setFormCustomPerbaikan(10);
      setFormCustomFreon(12);
      setFormCustomBongkar(14);
      setFormCustomSubsidy(10000);
      setFormReasonCategory('top_performer');
      setFormCustomNotes(`Mitra ${tech.name} dengan performa tinggi.`);
    }
    setIsCustomFeeModalOpen(true);
  };

  // Save custom fee for technician
  const handleSaveCustomFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechForFee) return;

    const newFeeItem: TechnicianCustomFee = {
      technicianId: selectedTechForFee.id,
      technicianName: selectedTechForFee.name,
      technicianAvatar: selectedTechForFee.avatar,
      customFeePercent: formCustomRate,
      cuciAcFeePercent: formCustomCuci,
      perbaikanAcFeePercent: formCustomPerbaikan,
      isiFreonFeePercent: formCustomFreon,
      bongkarPasangFeePercent: formCustomBongkar,
      subsidyPerOrderNominal: formCustomSubsidy,
      reasonCategory: formReasonCategory,
      notes: formCustomNotes.trim() || undefined,
      isEnabled: true,
      effectiveDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = customFees.findIndex(
      cf => cf.technicianId === selectedTechForFee.id || cf.technicianName.toLowerCase() === selectedTechForFee.name.toLowerCase()
    );

    let updatedFees: TechnicianCustomFee[];
    if (existingIndex >= 0) {
      updatedFees = [...customFees];
      updatedFees[existingIndex] = newFeeItem;
    } else {
      updatedFees = [newFeeItem, ...customFees];
    }

    setCustomFees(updatedFees);
    saveTechnicianCustomFees(updatedFees);
    
    // Also sync to global config
    const updatedConfig: CrowdsourcingConfig = {
      ...config,
      defaultFeePercent: defaultFee,
      cuciAcFeePercent: cuciFee,
      perbaikanAcFeePercent: perbaikanFee,
      isiFreonFeePercent: freonFee,
      bongkarPasangFeePercent: bongkarFee,
      technicianCustomFees: updatedFees
    };
    onUpdateConfig(updatedConfig);

    setIsCustomFeeModalOpen(false);
    onToast(`Potongan khusus ${formCustomRate}% untuk ${selectedTechForFee.name} berhasil diterapkan!`);
  };

  const handleToggleCustomFee = (techId: string, techName: string) => {
    const updated = customFees.map(cf => {
      if (cf.technicianId === techId || cf.technicianName.toLowerCase() === techName.toLowerCase()) {
        const nextState = !cf.isEnabled;
        onToast(`Potongan khusus ${cf.technicianName} ${nextState ? 'diaktifkan' : 'dinonaktifkan (kembali ke 20% standar)'}`);
        return { ...cf, isEnabled: nextState };
      }
      return cf;
    });
    setCustomFees(updated);
    saveTechnicianCustomFees(updated);
  };

  const handleDeleteCustomFee = (techId: string, techName: string) => {
    if (window.confirm(`Hapus aturan potongan khusus untuk ${techName}? Teknisi akan kembali mengikuti potongan standar platform (${defaultFee}%).`)) {
      const updated = customFees.filter(
        cf => cf.technicianId !== techId && cf.technicianName.toLowerCase() !== techName.toLowerCase()
      );
      setCustomFees(updated);
      saveTechnicianCustomFees(updated);
      onToast(`Potongan khusus ${techName} berhasil dihapus.`);
    }
  };

  // Financial calculations from orders using custom rates
  const totalGrossRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) + 4850000;
  
  const ledgerItems = orders.map((ord) => {
    const breakdown = calculateOrderFeeBreakdown(
      ord, 
      {
        defaultFeePercent: defaultFee,
        cuciAcFeePercent: cuciFee,
        perbaikanAcFeePercent: perbaikanFee,
        isiFreonFeePercent: freonFee,
        bongkarPasangFeePercent: bongkarFee,
        autoDeductEnabled: autoDeduct,
        instantEscrowEnabled: instantEscrow,
        guaranteeReservePercent: guaranteeReserve,
        insuranceFeeNominal: insuranceFee,
        taxPph21Percent: 0.5
      },
      customFees
    );

    return {
      ...ord,
      feePercent: breakdown.feePercent,
      platformCut: breakdown.platformCut,
      netTechnician: breakdown.netTechnician,
      isCustomFee: breakdown.isCustomFeeApplied,
      subsidyBonus: breakdown.subsidyBonus,
      customRule: breakdown.customFeeRule,
      settlementStatus: ord.status === 'selesai' ? 'Sudah Dipotong' : 'Escrow Tertahan'
    };
  });

  const totalPlatformCut = ledgerItems.reduce((sum, item) => sum + item.platformCut, 0) + Math.round(4850000 * (defaultFee / 100));
  const totalTechnicianNet = totalGrossRevenue - totalPlatformCut;
  const effectiveTakeRate = ((totalPlatformCut / (totalGrossRevenue || 1)) * 100).toFixed(1);

  const filteredLedger = ledgerItems.filter((item) => {
    const matchSearch = item.id.toLowerCase().includes(searchLedger.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchLedger.toLowerCase()) ||
      (item.technicianName && item.technicianName.toLowerCase().includes(searchLedger.toLowerCase()));
    const matchService = filterService === 'all' ? true : item.serviceName.toLowerCase().includes(filterService);
    return matchSearch && matchService;
  });

  const handleSaveSettings = () => {
    const updated: CrowdsourcingConfig = {
      defaultFeePercent: defaultFee,
      cuciAcFeePercent: cuciFee,
      perbaikanAcFeePercent: perbaikanFee,
      isiFreonFeePercent: freonFee,
      bongkarPasangFeePercent: bongkarFee,
      autoDeductEnabled: autoDeduct,
      instantEscrowEnabled: instantEscrow,
      guaranteeReservePercent: guaranteeReserve,
      insuranceFeeNominal: insuranceFee,
      taxPph21Percent: 0.5,
      technicianCustomFees: customFees
    };
    onUpdateConfig(updated);
    onToast(`Pengaturan komisi crowdsourcing (${defaultFee}%) berhasil disimpan!`);
  };

  const handleResetDefaults = () => {
    setDefaultFee(20);
    setCuciFee(20);
    setPerbaikanFee(18);
    setFreonFee(20);
    setBongkarFee(22);
    setAutoDeduct(true);
    setInstantEscrow(true);
    setGuaranteeReserve(2);
    setInsuranceFee(2500);
    onToast('Pengaturan komisi dikembalikan ke standar rekomendasi 20%');
  };

  const handleExportLedgerCSV = () => {
    const csvRows = [
      ['Order ID', 'Tanggal', 'Customer', 'Layanan', 'Teknisi Mitra', 'Tipe Potongan', 'Total Order (Rp)', 'Potongan Platform (%)', 'Fee Platform (Rp)', 'Komisi Teknisi (Rp)', 'Status Bagi Hasil'],
      ...filteredLedger.map(i => [
        `#${i.id}`,
        i.date,
        i.customerName,
        i.serviceName,
        i.technicianName || 'Auto-Dispatch',
        i.isCustomFee ? 'Potongan Khusus Teknisi' : 'Standar Global',
        i.totalPrice.toString(),
        `${i.feePercent}%`,
        i.platformCut.toString(),
        i.netTechnician.toString(),
        i.settlementStatus
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Bagi_Hasil_Crowdsourcing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('Laporan ledger bagi hasil crowdsourcing berhasil diexport ke CSV!');
  };

  // Simulator calculation with custom tech support
  let simFeePercent = simServiceCategory === 'perbaikan' ? perbaikanFee : simServiceCategory === 'freon' ? freonFee : simServiceCategory === 'bongkar' ? bongkarFee : cuciFee;
  let simSubsidy = 0;
  let isSimCustom = false;

  if (simSelectedTechId !== 'default') {
    const customRule = customFees.find(cf => cf.technicianId === simSelectedTechId && cf.isEnabled);
    if (customRule) {
      isSimCustom = true;
      simSubsidy = customRule.subsidyPerOrderNominal || 0;
      if (simServiceCategory === 'cuci') simFeePercent = customRule.cuciAcFeePercent ?? customRule.customFeePercent;
      else if (simServiceCategory === 'perbaikan') simFeePercent = customRule.perbaikanAcFeePercent ?? customRule.customFeePercent;
      else if (simServiceCategory === 'freon') simFeePercent = customRule.isiFreonFeePercent ?? customRule.customFeePercent;
      else if (simServiceCategory === 'bongkar') simFeePercent = customRule.bongkarPasangFeePercent ?? customRule.customFeePercent;
      else simFeePercent = customRule.customFeePercent;
    }
  }

  const simPlatformCut = Math.round(simOrderAmount * (simFeePercent / 100));
  const simTechNet = simOrderAmount - simPlatformCut + simSubsidy;

  const activeCustomFeesCount = customFees.filter(cf => cf.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-sky-600 rounded-full inline-block"></span>
            Pengaturan Komisi Crowdsourcing & Potongan Teknisi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola persentase potongan platform standar (10%–30%), potongan custom khusus mitra tertentu, dan escrow ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-200/80 rounded-xl flex items-center gap-1 text-xs flex-wrap">
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'ledger' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              📊 Laporan Keuangan
            </button>
            <button
              onClick={() => setActiveSubTab('custom_tech')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'custom_tech' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Potongan Khusus Teknisi</span>
              {activeCustomFeesCount > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                  {activeCustomFeesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'settings' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              ⚙️ Pengaturan Standar
            </button>
            <button
              onClick={() => setActiveSubTab('simulator')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'simulator' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              🧮 Simulator
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Financial Platform */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Total Transaksi Pelanggan (GMV)</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            Rp{totalGrossRevenue.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            +18% Pertumbuhan Bulan Ini
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Pendapatan Platform ({effectiveTakeRate}%)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            Rp{totalPlatformCut.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Crowdsourcing Take-Rate Bersih
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Net Hak Komisi Teknisi</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700">
            Rp{totalTechnicianNet.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">
            Disalurkan ke saldo dompet mitra
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Mitra Potongan Khusus</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {activeCustomFeesCount} Teknisi
          </div>
          <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            Tarif Spesial {customFees.length > 0 ? `${Math.min(...customFees.map(c => c.customFeePercent))}% - ${Math.max(...customFees.map(c => c.customFeePercent))}%` : 'Standard'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB TAB: POTONGAN KHUSUS TEKNISI (CUSTOM COMMISSIONS)                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'custom_tech' && (
        <div className="space-y-6">
          {/* Banner Explanation */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-900 via-amber-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Insentif & Subsidi Mitra Spesial
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Pengaturan Potongan Custom Khusus untuk Teknisi Tertentu
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-2xl">
                  Berikan potongan platform lebih rendah (misal 10% - 15% alih-alih 20% standar) atau subsidi bonus untuk teknisi berprestasi, mitra senior, spesialis AC rumit, atau promotor wilayah.
                </p>
              </div>

              <div className="shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white/10 text-amber-200 border border-white/20 text-xs font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{activeCustomFeesCount} dari {technicians.length} Mitra Aktif Khusus</span>
                </span>
              </div>
            </div>
          </div>

          {/* Technicians List with Custom Rate Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => {
              const customRule = customFees.find(
                cf => cf.technicianId === tech.id || cf.technicianName.toLowerCase() === tech.name.toLowerCase()
              );
              const isCustomActive = customRule && customRule.isEnabled;

              return (
                <div
                  key={tech.id}
                  className={`p-5 rounded-3xl bg-white border transition-all duration-200 flex flex-col justify-between gap-4 shadow-2xs relative ${
                    isCustomActive
                      ? 'border-amber-300 bg-gradient-to-b from-amber-50/30 to-white hover:shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header Technician Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                          isCustomActive ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-sky-600 text-white'
                        }`}>
                          {tech.avatar || tech.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-slate-900">{tech.name}</h4>
                            {isCustomActive && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                                ⭐ KHUSUS
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="text-amber-500 font-bold">★ {tech.rating}</span>
                            <span>• {tech.experienceYears || '3+ Thn'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle if custom exists */}
                      {customRule && (
                        <button
                          onClick={() => handleToggleCustomFee(tech.id, tech.name)}
                          className={`p-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isCustomActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                          }`}
                          title={isCustomActive ? 'Nonaktifkan potongan khusus' : 'Aktifkan potongan khusus'}
                        >
                          {isCustomActive ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                        </button>
                      )}
                    </div>

                    {/* Commission Rate Badge */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Potongan Platform:</span>
                        <div className="flex items-center gap-1.5">
                          {isCustomActive ? (
                            <>
                              <span className="text-slate-400 line-through text-[11px]">{defaultFee}%</span>
                              <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-mono font-black text-xs shadow-2xs">
                                {customRule.customFeePercent}%
                              </span>
                            </>
                          ) : (
                            <span className="font-mono font-bold text-slate-800">
                              {defaultFee}% (Standar)
                            </span>
                          )}
                        </div>
                      </div>

                      {isCustomActive && customRule.subsidyPerOrderNominal ? (
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                          <span className="text-emerald-700 font-medium">Subsidi / Bonus Order:</span>
                          <span className="font-mono font-black text-emerald-700 text-xs">
                            +Rp{customRule.subsidyPerOrderNominal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ) : null}

                      {/* Reason Tag */}
                      {isCustomActive && customRule.reasonCategory && (
                        <div className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-1 rounded-lg">
                          Alasan: {
                            customRule.reasonCategory === 'top_performer' ? '⭐ Mitra Teladan (Top Performer)' :
                            customRule.reasonCategory === 'senior_partner' ? 'Senior Partner' :
                            customRule.reasonCategory === 'specialist' ? 'Spesialis AC Komersial/VRV' :
                            customRule.reasonCategory === 'area_promoter' ? 'Promotor Wilayah' : 'Kustom'
                          }
                        </div>
                      )}

                      {isCustomActive && customRule.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                          "{customRule.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenCustomFeeModal(tech)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                        isCustomActive
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isCustomActive ? 'Ubah Potongan Khusus' : 'Atur Potongan Khusus'}</span>
                    </button>

                    {customRule && (
                      <button
                        onClick={() => handleDeleteCustomFee(tech.id, tech.name)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Hapus Pengaturan Khusus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: PENGATURAN STANDAR KOMISI (10% - 30%)                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-sky-600" />
                  Konfigurasi Potongan Komisi Standar Platform (10% - 30%)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap order masuk yang dikerjakan oleh teknisi mitra akan dipotong secara otomatis sebesar persentase yang ditentukan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default (20%)</span>
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </div>

            {/* Slider 1: Default Global Fee */}
            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    Potongan Standar Crowdsourcing (Default Fee)
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
                      Rekomendasi 20%
                    </span>
                  </label>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Berlaku untuk semua jenis order yang tidak memiliki pengaturan khusus
                  </p>
                </div>
                <div className="text-2xl font-mono font-black text-sky-700 bg-white px-3 py-1 rounded-xl border border-sky-200 shadow-2xs">
                  {defaultFee}%
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={defaultFee}
                onChange={(e) => setDefaultFee(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                <span>10% (Insentif Maksimal)</span>
                <span>15%</span>
                <span className="text-sky-700">20% (Standar Industri)</span>
                <span>25%</span>
                <span>30% (Margin Maksimal)</span>
              </div>
            </div>

            {/* Category Tier Specific Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Cuci AC & Pembersihan Ringan</span>
                  <span className="font-mono font-black text-sky-700">{cuciFee}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={cuciFee}
                  onChange={(e) => setCuciFee(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Perbaikan AC & Troubleshooting Berat</span>
                  <span className="font-mono font-black text-sky-700">{perbaikanFee}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={perbaikanFee}
                  onChange={(e) => setPerbaikanFee(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Isi / Tambah Freon (R32 / R410A)</span>
                  <span className="font-mono font-black text-sky-700">{freonFee}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={freonFee}
                  onChange={(e) => setFreonFee(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Bongkar Pasang & Instalasi Unit</span>
                  <span className="font-mono font-black text-sky-700">{bongkarFee}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={bongkarFee}
                  onChange={(e) => setBongkarFee(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Automation Toggles */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Auto-Deduct Escrow Otomatis</div>
                  <div className="text-[11px] text-slate-500">Potong langsung fee platform saat status pesanan menjadi Selesai</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDeduct}
                  onChange={(e) => setAutoDeduct(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Dana Proteksi Garansi 30 Hari ({guaranteeReserve}%)</div>
                  <div className="text-[11px] text-slate-500">Cadangan kompensasi klaim garansi untuk menjamin kepuasan pelanggan</div>
                </div>
                <input
                  type="checkbox"
                  checked={instantEscrow}
                  onChange={(e) => setInstantEscrow(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: LAPORAN KEUANGAN & LEDGER                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter & Export Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchLedger}
                onChange={(e) => setSearchLedger(e.target.value)}
                placeholder="Cari Order ID, customer, atau teknisi..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden"
              >
                <option value="all">Semua Layanan</option>
                <option value="cuci">Cuci AC</option>
                <option value="perbaikan">Perbaikan AC</option>
                <option value="freon">Isi Freon</option>
                <option value="bongkar">Bongkar Pasang</option>
              </select>

              <button
                onClick={handleExportLedgerCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Order ID & Tanggal</th>
                    <th className="py-3 px-3">Customer & Layanan</th>
                    <th className="py-3 px-3">Teknisi & Tipe Potongan</th>
                    <th className="py-3 px-3 text-right">Nilai Transaksi</th>
                    <th className="py-3 px-3 text-center">Rate Fee</th>
                    <th className="py-3 px-3 text-right">Fee Platform</th>
                    <th className="py-3 px-3 text-right">Hak Bersih Teknisi</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedger.map((item) => (
                    <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => {
                            if (onOpenOrderDetail) onOpenOrderDetail(item);
                            else setSelectedDetailOrder(item);
                          }}
                          className="font-mono font-extrabold text-sky-700 hover:underline cursor-pointer"
                        >
                          #{item.id}
                        </button>
                        <div className="text-[10px] text-slate-400">{item.date}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{item.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{item.serviceName}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-700">
                          {item.technicianName || (
                            <span className="text-amber-600 font-medium">Auto-Dispatch</span>
                          )}
                        </div>
                        {item.isCustomFee ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Potongan Khusus ({item.feePercent}%)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Standar Platform</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rp{item.totalPrice.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${
                          item.isCustomFee 
                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {item.feePercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-extrabold text-amber-600">
                        Rp{item.platformCut.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-600">
                        Rp{item.netTechnician.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status === 'selesai' ? 'Tercairkan' : 'Escrow'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            if (onOpenOrderDetail) onOpenOrderDetail(item);
                            else setSelectedDetailOrder(item);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: SIMULATOR BAGI HASIL CROWDSOURCING                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'simulator' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              🧮 Kalkulator & Simulator Pembagian Hasil Crowdsourcing
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Uji coba simulasi potongan pendapatan platform (10%–30%) dan komisi bersih teknisi reguler maupun khusus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Mitra Teknisi (Standar vs Khusus)
                </label>
                <select
                  value={simSelectedTechId}
                  onChange={(e) => setSimSelectedTechId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-semibold outline-hidden bg-white"
                >
                  <option value="default">-- Standar Platform (Semua Teknisi) --</option>
                  {technicians.map((t) => {
                    const cf = customFees.find(c => c.technicianId === t.id && c.isEnabled);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} {cf ? `⭐ (Potongan Khusus ${cf.customFeePercent}%)` : '(Standar 20%)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Kategori Layanan
                </label>
                <select
                  value={simServiceCategory}
                  onChange={(e) => setSimServiceCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-semibold outline-hidden bg-white"
                >
                  <option value="cuci">Cuci AC</option>
                  <option value="perbaikan">Perbaikan AC</option>
                  <option value="freon">Isi / Tambah Freon</option>
                  <option value="bongkar">Bongkar Pasang</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Pembayaran Pelanggan (Rp)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={simOrderAmount}
                  onChange={(e) => setSimOrderAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 outline-hidden focus:border-sky-500 bg-white"
                />
              </div>

              <div className="flex gap-2">
                {[75000, 150000, 225000, 300000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSimOrderAmount(amt)}
                    className="flex-1 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-700 bg-white cursor-pointer"
                  >
                    Rp{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Result Visual Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 text-white flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-sky-300 font-bold">Hasil Pembagian Komisi Transaksi</div>
                  {isSimCustom && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
                      ⭐ Tarif Khusus Aktif
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  Rp{simOrderAmount.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-sky-200/80">Tagihan Gross Customer</div>
              </div>

              <div className="space-y-2 py-2 border-y border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Potongan Platform ({simFeePercent}%):</span>
                  <span className="font-mono font-bold text-amber-400">
                    -Rp{simPlatformCut.toLocaleString('id-ID')}
                  </span>
                </div>
                {simSubsidy > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300">Subsidi Insentif Order:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +Rp{simSubsidy.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Biaya Proteksi & Garansi:</span>
                  <span className="font-mono font-semibold text-sky-300">
                    Termasuk (Free)
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                    Hak Bersih Teknisi ({100 - simFeePercent}%)
                  </div>
                  <div className="text-2xl font-mono font-black text-emerald-400">
                    Rp{simTechNet.toLocaleString('id-ID')}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Siap Cair
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Atur Potongan Khusus Teknisi */}
      <AnimatePresence>
        {isCustomFeeModalOpen && selectedTechForFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center">
                    {selectedTechForFee.avatar || selectedTechForFee.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Potongan Custom: {selectedTechForFee.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Atur persentase potongan khusus (10%–30%) dan subsidi insentif
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomFeeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCustomFee} className="space-y-4">
                {/* Main slider */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-950">
                      Potongan Platform Spesial (Default: 20%)
                    </label>
                    <span className="text-xl font-mono font-black text-amber-900 bg-white px-3 py-0.5 rounded-xl border border-amber-300">
                      {formCustomRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={formCustomRate}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setFormCustomRate(v);
                      setFormCustomCuci(v);
                      setFormCustomPerbaikan(Math.max(10, v - 2));
                      setFormCustomFreon(v);
                      setFormCustomBongkar(Math.min(30, v + 2));
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-amber-800 font-bold">
                    <span>10% (Hemat 10%)</span>
                    <span>15%</span>
                    <span>20% (Standar)</span>
                    <span>25%</span>
                    <span>30%</span>
                  </div>
                </div>

                {/* Reason category */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Kategori / Alasan Potongan Khusus *
                  </label>
                  <select
                    value={formReasonCategory}
                    onChange={(e) => setFormReasonCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="top_performer">⭐ Mitra Teladan (Top Performer Rating 4.8+)</option>
                    <option value="senior_partner">Mitra Senior (Loyalitas 2+ Tahun)</option>
                    <option value="specialist">Spesialis Khusus (AC Inverter, VRV & Komersial)</option>
                    <option value="area_promoter">Promotor Wilayah Baru</option>
                    <option value="custom">Kategori Kustom Lainnya</option>
                  </select>
                </div>

                {/* Subsidy per order */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Bonus / Subsidi Nominal per Order Selesai (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      step={5000}
                      value={formCustomSubsidy}
                      onChange={(e) => setFormCustomSubsidy(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Subsidi ini ditambahkan ke hak bersih teknisi dan ditanggung oleh platform.
                  </span>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Catatan Internal Admin (Opsional)
                  </label>
                  <textarea
                    value={formCustomNotes}
                    onChange={(e) => setFormCustomNotes(e.target.value)}
                    placeholder="Alasan persetujuan potongan spesial..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCustomFeeModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                  >
                    Terapkan Potongan Khusus
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
