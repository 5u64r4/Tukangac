import React, { useState } from 'react';
import { AreaPriorityRule, Order, Technician } from '../types';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Sparkles, 
  Zap, 
  Check, 
  Clock, 
  Phone, 
  AlertCircle,
  Radio,
  ArrowRight,
  RotateCcw,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { matchOrderToPriorityRule } from '../services/priorityRoutingService';

interface AreaPrioritySectionProps {
  rules: AreaPriorityRule[];
  technicians: Technician[];
  orders: Order[];
  onSaveRules: (rules: AreaPriorityRule[]) => void;
  onAssignTechnician?: (orderId: string, techName: string) => void;
  onToast: (msg: string) => void;
}

export const AreaPrioritySection: React.FC<AreaPrioritySectionProps> = ({
  rules,
  technicians = [],
  orders = [],
  onSaveRules,
  onAssignTechnician,
  onToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form State for Adding / Editing Rule
  const [formAreaName, setFormAreaName] = useState('');
  const [formCity, setFormCity] = useState('Kota Bekasi');
  const [formDistrict, setFormDistrict] = useState('');
  const [formSubdistricts, setFormSubdistricts] = useState('');
  const [formPrimaryTechId, setFormPrimaryTechId] = useState(technicians[0]?.id || 'tech-1');
  const [formBackupTechId, setFormBackupTechId] = useState(technicians[1]?.id || 'tech-2');
  const [formPriorityLevel, setFormPriorityLevel] = useState<'exclusive' | 'preferred' | 'first_responder'>('exclusive');
  const [formAutoAssign, setFormAutoAssign] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Live Simulator state
  const [simAddress, setSimAddress] = useState('Jl. Grand Galaxy City Blok RRG 5, Bekasi Selatan');
  const [simResult, setSimResult] = useState(() => matchOrderToPriorityRule({ fullAddress: 'Jl. Grand Galaxy City Blok RRG 5, Bekasi Selatan' }, rules));

  const handleRunSimulator = () => {
    const res = matchOrderToPriorityRule({ fullAddress: simAddress }, rules);
    setSimResult(res);
  };

  const handleOpenAdd = () => {
    setEditingRuleId(null);
    setFormAreaName('');
    setFormCity('Kota Bekasi');
    setFormDistrict('');
    setFormSubdistricts('');
    setFormPrimaryTechId(technicians[0]?.id || 'tech-1');
    setFormBackupTechId(technicians[1]?.id || 'tech-2');
    setFormPriorityLevel('exclusive');
    setFormAutoAssign(true);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (rule: AreaPriorityRule) => {
    setEditingRuleId(rule.id);
    setFormAreaName(rule.areaName);
    setFormCity(rule.city);
    setFormDistrict(rule.district);
    setFormSubdistricts(rule.subdistricts?.join(', ') || '');
    setFormPrimaryTechId(rule.primaryTechnicianId);
    setFormBackupTechId(rule.backupTechnicianId || '');
    setFormPriorityLevel(rule.priorityLevel);
    setFormAutoAssign(rule.autoAssignNewOrders);
    setFormNotes(rule.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDistrict || !formPrimaryTechId) {
      onToast('Mohon isi nama kecamatan dan pilih teknisi prioritas.');
      return;
    }

    const primaryTech = technicians.find(t => t.id === formPrimaryTechId);
    const backupTech = technicians.find(t => t.id === formBackupTechId);

    const subdistList = formSubdistricts
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const ruleData: AreaPriorityRule = {
      id: editingRuleId || `rule-${Date.now()}`,
      areaName: formAreaName.trim() || `${formDistrict} (${formCity})`,
      city: formCity,
      district: formDistrict.trim(),
      subdistricts: subdistList.length > 0 ? subdistList : [formDistrict.trim()],
      primaryTechnicianId: formPrimaryTechId,
      primaryTechnicianName: primaryTech?.name || 'Teknisi Utama',
      primaryTechnicianPhone: primaryTech?.phone || '',
      backupTechnicianId: formBackupTechId || undefined,
      backupTechnicianName: backupTech?.name || undefined,
      priorityLevel: formPriorityLevel,
      autoAssignNewOrders: formAutoAssign,
      notes: formNotes.trim() || undefined,
      isActive: true,
      matchedOrdersCount: editingRuleId ? rules.find(r => r.id === editingRuleId)?.matchedOrdersCount || 0 : 0,
      updatedAt: new Date().toISOString()
    };

    let updatedRules: AreaPriorityRule[];
    if (editingRuleId) {
      updatedRules = rules.map(r => r.id === editingRuleId ? ruleData : r);
      onToast(`Aturan prioritas area ${ruleData.district} berhasil diperbarui!`);
    } else {
      updatedRules = [ruleData, ...rules];
      onToast(`Aturan prioritas baru untuk ${ruleData.district} berhasil ditambahkan!`);
    }

    onSaveRules(updatedRules);
    setIsAddModalOpen(false);
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        const nextState = !r.isActive;
        onToast(`Aturan area ${r.district} ${nextState ? 'diaktifkan' : 'dinonaktifkan'}`);
        return { ...r, isActive: nextState };
      }
      return r;
    });
    onSaveRules(updated);
  };

  const handleDeleteRule = (id: string, name: string) => {
    if (window.confirm(`Hapus aturan prioritas area untuk ${name}?`)) {
      const updated = rules.filter(r => r.id !== id);
      onSaveRules(updated);
      onToast(`Aturan area ${name} berhasil dihapus.`);
    }
  };

  // Filter rules
  const filteredRules = rules.filter(r => {
    const matchSearch = 
      r.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.primaryTechnicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.subdistricts && r.subdistricts.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchCity = filterCity === 'all' ? true : r.city.toLowerCase() === filterCity.toLowerCase();
    return matchSearch && matchCity;
  });

  const activeRulesCount = rules.filter(r => r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Navigation className="w-36 h-36" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Smart Dispatch & Area Routing
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Order Prioritas Wilayah & Penugasan Teknisi
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-xl">
              Atur teknisi prioritas khusus untuk setiap kota & kecamatan. Pesanan customer baru di wilayah tersebut akan otomatis diprioritaskan ke teknisi pilihan utama.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Prioritas Area</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sky-200/70 font-semibold">Total Aturan Area</div>
              <div className="text-lg font-black text-white">{rules.length} Wilayah ({activeRulesCount} Aktif)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sky-200/70 font-semibold">Teknisi Terpetakan</div>
              <div className="text-lg font-black text-white">{technicians.length} Mitra Siaga</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sky-200/70 font-semibold">Dispatch Otomatis</div>
              <div className="text-lg font-black text-emerald-300">Fast-Routing Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Routing Simulator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-black">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Live Area Routing Simulator</h3>
              <p className="text-xs text-slate-500">Uji coba deteksi alamat customer dan penugasan teknisi prioritas</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Realtime Matcher
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={simAddress}
              onChange={(e) => setSimAddress(e.target.value)}
              placeholder="Masukkan contoh alamat customer (cth: Grand Galaxy City, Bekasi Selatan)"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
            />
          </div>
          <button
            onClick={handleRunSimulator}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Cek Rute Prioritas</span>
          </button>
        </div>

        {/* Simulation Output Card */}
        {simResult && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {simResult.matchedRule ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      Rute Cocok: {simResult.matchedRule.areaName}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Skor Match: {simResult.matchScore} pts
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Teknisi Prioritas: <strong className="text-sky-700">{simResult.matchedRule.primaryTechnicianName}</strong> {simResult.matchedRule.primaryTechnicianPhone && `(${simResult.matchedRule.primaryTechnicianPhone})`}
                    {simResult.matchedRule.backupTechnicianName && (
                      <span className="text-slate-400 ml-1.5">• Backup: {simResult.matchedRule.backupTechnicianName}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 italic mt-0.5">{simResult.matchReason}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900">Belum Ada Aturan Khusus Terpetakan</div>
                  <div className="text-xs text-slate-600">Alamat ini akan menggunakan auto-dispatch berbasis jarak teknisi terdekat standar.</div>
                </div>
              </div>
            )}

            {simResult.matchedRule && (
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                  Level: {simResult.matchedRule.priorityLevel === 'exclusive' ? '⭐ Eksklusif' : 'Prioritas Preferred'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules List Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari wilayah, kecamatan, atau nama teknisi..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden"
          >
            <option value="all">Semua Kota</option>
            <option value="Kota Bekasi">Kota Bekasi</option>
            <option value="Jakarta Selatan">Jakarta Selatan</option>
            <option value="Jakarta Timur">Jakarta Timur</option>
            <option value="Jakarta Utara">Jakarta Utara</option>
            <option value="Kota Depok">Kota Depok</option>
            <option value="Kota Tangerang Selatan">Kota Tangerang Selatan</option>
          </select>

          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {filteredRules.length} Aturan Ditampilkan
          </span>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => {
          const primaryTech = technicians.find(t => t.id === rule.primaryTechnicianId);
          const backupTech = technicians.find(t => t.id === rule.backupTechnicianId);

          return (
            <div
              key={rule.id}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between gap-4 shadow-2xs relative overflow-hidden ${
                rule.isActive ? 'border-sky-200 hover:border-sky-400 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Top Accent Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-black uppercase">
                      {rule.city}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      rule.priorityLevel === 'exclusive' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {rule.priorityLevel === 'exclusive' ? '⭐ Prioritas Eksklusif' : 'Prioritas Preferred'}
                    </span>
                    {rule.autoAssignNewOrders && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                        ⚡ Auto-Dispatch
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{rule.areaName}</span>
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    Kecamatan: <span className="font-bold text-slate-700">{rule.district}</span>
                  </div>
                </div>

                {/* Status Toggle Switch */}
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`p-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                    rule.isActive
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                  }`}
                  title={rule.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                >
                  {rule.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px]">Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px]">Nonaktif</span>
                    </>
                  )}
                </button>
              </div>

              {/* Subdistricts / Coverage Tags */}
              {rule.subdistricts && rule.subdistricts.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Cakupan:</span>
                  {rule.subdistricts.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/80"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}

              {/* Assigned Technicians Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                {/* Primary Technician */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {primaryTech?.avatar || rule.primaryTechnicianName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase text-sky-700">Teknisi Utama (Prioritas 1)</span>
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {rule.primaryTechnicianName}
                      </div>
                    </div>
                  </div>
                  {rule.primaryTechnicianPhone && (
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {rule.primaryTechnicianPhone}
                    </span>
                  )}
                </div>

                {/* Backup Technician if exists */}
                {rule.backupTechnicianName && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Cadangan (Prioritas 2): <strong className="text-slate-800">{rule.backupTechnicianName}</strong></span>
                    </div>
                    <span className="text-[10px] text-slate-400">Siaga jika utama sibuk</span>
                  </div>
                )}
              </div>

              {/* Notes if any */}
              {rule.notes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  "{rule.notes}"
                </p>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400">
                  {rule.matchedOrdersCount ? `${rule.matchedOrdersCount} Order Diteruskan` : 'Siap terima order'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id, rule.areaName)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Hapus Aturan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Rule Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {editingRuleId ? 'Edit Aturan Prioritas Area' : 'Tambah Order Prioritas Area Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tentukan teknisi mana yang akan diprioritaskan saat pesanan masuk di wilayah ini
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Kota / Wilayah *
                    </label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                      required
                    >
                      <option value="Kota Bekasi">Kota Bekasi</option>
                      <option value="Jakarta Selatan">Jakarta Selatan</option>
                      <option value="Jakarta Timur">Jakarta Timur</option>
                      <option value="Jakarta Utara">Jakarta Utara</option>
                      <option value="Jakarta Barat">Jakarta Barat</option>
                      <option value="Jakarta Pusat">Jakarta Pusat</option>
                      <option value="Kota Depok">Kota Depok</option>
                      <option value="Kota Tangerang Selatan">Kota Tangerang Selatan</option>
                      <option value="Kota Bogor">Kota Bogor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Nama Kecamatan *
                    </label>
                    <input
                      type="text"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      placeholder="Cth: Bekasi Selatan, Kebayoran Baru"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Label Nama Area (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formAreaName}
                    onChange={(e) => setFormAreaName(e.target.value)}
                    placeholder="Cth: Bekasi Selatan (Galaxy, Pekayon, Kemang Pratama)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Kelurahan / Kawasan Spesifik (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formSubdistricts}
                    onChange={(e) => setFormSubdistricts(e.target.value)}
                    placeholder="Cth: Galaxy, Pekayon Jaya, Kemang Pratama, Jaka Setia"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Sistem akan memvalidasi kata kunci ini dari alamat customer yang memesan.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      ⭐ Teknisi Prioritas Utama (Wajib)
                    </label>
                    <select
                      value={formPrimaryTechId}
                      onChange={(e) => setFormPrimaryTechId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-sky-50 border border-sky-300 text-xs font-bold text-sky-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                      required
                    >
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (★{t.rating}) - {t.roleTitle || 'Teknisi'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Teknisi Cadangan / Backup (Opsional)
                    </label>
                    <select
                      value={formBackupTechId}
                      onChange={(e) => setFormBackupTechId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    >
                      <option value="">-- Tanpa Cadangan --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Tingkat Prioritas
                    </label>
                    <select
                      value={formPriorityLevel}
                      onChange={(e) => setFormPriorityLevel(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                    >
                      <option value="exclusive">⭐ Eksklusif (100% Ditugaskan ke Mitra Ini)</option>
                      <option value="preferred">Preferred (Direkomendasikan Paling Atas)</option>
                      <option value="first_responder">First-Responder (Siaga Cepat)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="autoAssignCheck"
                      checked={formAutoAssign}
                      onChange={(e) => setFormAutoAssign(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <label htmlFor="autoAssignCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Otomatis Assign saat Order Baru Masuk
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Catatan Operasional Wilayah (Opsional)
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Cth: Wilayah perumahan padat, teknisi memiliki unit motor boks untuk angkut tangga..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md shadow-sky-600/30 cursor-pointer transition-all active:scale-95"
                  >
                    {editingRuleId ? 'Simpan Perubahan' : 'Simpan Aturan Prioritas'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
