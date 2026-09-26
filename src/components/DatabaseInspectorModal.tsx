import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  Shield, 
  Wrench, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Search, 
  Clock, 
  HardDrive, 
  Server, 
  Layers, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  Activity,
  Zap,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerRecord, Order, Technician, TechnicianApplicant, AdminAuditLog, AdminSetting } from '../types';
import { getAllCustomers } from '../services/customerService';
import { getAllOrders, getAllApplicants, getAuditLogs, getAdminSettings } from '../services/adminService';
import { getAllTechnicians } from '../services/technicianService';
import { forceResetDatabase, initializeDatabaseIfEmpty } from '../services/databaseInit';

interface DatabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type DatabaseTab = 'customer' | 'admin' | 'technician';

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({
  isOpen,
  onClose,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('customer');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data state
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [applicants, setApplicants] = useState<TechnicianApplicant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const loadAllDatabaseData = async () => {
    setLoading(true);
    try {
      await initializeDatabaseIfEmpty();
      const [custData, orderData, techData, aplData, logsData, setsData] = await Promise.all([
        getAllCustomers(),
        getAllOrders(),
        getAllTechnicians(),
        getAllApplicants(),
        getAuditLogs(),
        getAdminSettings()
      ]);

      setCustomers(Array.isArray(custData) ? custData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setTechnicians(Array.isArray(techData) ? techData : []);
      setApplicants(Array.isArray(aplData) ? aplData : []);
      setAuditLogs(Array.isArray(logsData) ? logsData : []);
      setSettings(Array.isArray(setsData) ? setsData : []);
    } catch (err) {
      console.error('Error loading database inspector data:', err);
      onToast('Gagal memuat data database: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllDatabaseData();
    }
  }, [isOpen]);

  const handleResetData = async () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data backend database ke nilai bawaan?')) {
      setLoading(true);
      try {
        await forceResetDatabase();
        await loadAllDatabaseData();
        onToast('Database backend berhasil diatur ulang ke default!');
      } catch (err) {
        onToast('Gagal mereset database: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-5xl h-[92vh] sm:h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Backend Database Explorer</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud Firestore Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Pemeriksaan dan verifikasi data terpisah untuk Customer, Admin, dan Teknisi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllDatabaseData}
              disabled={loading}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={handleResetData}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Database Role Selection Bar (Neumorphic Tabs) */}
        <div className="bg-[#edf2f7] p-2.5 sm:p-3 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
            {/* Tab 1: Customer */}
            <button
              onClick={() => { setActiveTab('customer'); setSelectedRecord(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-white text-sky-700 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.4)] border border-sky-100'
                  : 'text-slate-600 hover:text-slate-900 bg-[#edf2f7]'
              }`}
            >
              <Users className="w-4 h-4 text-sky-600" />
              <span>1. Database Customer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-700 font-extrabold">{customers.length}</span>
            </button>

            {/* Tab 2: Admin */}
            <button
              onClick={() => { setActiveTab('admin'); setSelectedRecord(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.4)] border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 bg-[#edf2f7]'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>2. Database Admin</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">{orders.length}</span>
            </button>

            {/* Tab 3: Teknisi */}
            <button
              onClick={() => { setActiveTab('technician'); setSelectedRecord(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'technician'
                  ? 'bg-white text-emerald-700 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),_3px_3px_7px_rgba(160,175,198,0.4)] border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900 bg-[#edf2f7]'
              }`}
            >
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>3. Database Teknisi</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">{technicians.length}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* SEARCH BAR */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Cari data dalam Database ${activeTab.toUpperCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: CUSTOMER DATABASE */}
          {/* ========================================================================= */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              {/* Stat Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Total Customer Terdaftar</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{customers.length} Akun</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">Collection: <code>/customers</code></div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Pesanan Customer Aktif</div>
                  <div className="text-2xl font-black text-sky-600 mt-1">
                    {orders.filter(o => o.status !== 'selesai' && o.status !== 'batal').length} Berjalan
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">Collection: <code>/orders</code></div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Loyalty Points Customer</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {customers.reduce((acc, c) => acc + (c.points || 0), 0)} Poin
                  </div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-1">Reward System Terhubung</div>
                </div>
              </div>

              {/* Customer Documents List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    <h3 className="font-extrabold text-sm text-slate-800">Daftar Dokumen Akun Customer (/customers)</h3>
                  </div>
                  <span className="text-xs text-slate-500">{customers.length} records</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {customers
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
                    .map((cust) => (
                      <div key={cust.id} className="p-4 hover:bg-sky-50/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{cust.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cust.status === 'vip' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {cust.status.toUpperCase()}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">ID: {cust.id}</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {cust.phone}</span>
                              {cust.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {cust.email}</span>}
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {cust.defaultAddress}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-800">{cust.totalOrders} Pesanan</div>
                              <div className="text-[11px] text-amber-600 font-bold">{cust.points} Poin</div>
                            </div>
                            <button
                              onClick={() => setSelectedRecord(cust)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 transition-colors cursor-pointer"
                            >
                              JSON
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Customer Orders Snapshot */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <h3 className="font-extrabold text-sm text-slate-800">Riwayat Transaksi & Booking Customer (/orders)</h3>
                  </div>
                  <span className="text-xs text-slate-500">{orders.length} transaksi</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{ord.id}</span>
                          <span className="font-semibold text-slate-700">{ord.customerName}</span>
                          <span className="text-slate-400">({ord.customerPhone})</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {ord.serviceName} · {ord.date} ({ord.timeSlot}) · {ord.fullAddress}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">Rp{ord.totalPrice.toLocaleString('id-ID')}</div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ADMIN DATABASE */}
          {/* ========================================================================= */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Admin Stat Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Total Transaksi Selesai</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    Rp{orders.filter(o => o.status === 'selesai').reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">Omset Berhasil Ditutup</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Log Audit Sistem</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{auditLogs.length} Events</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">Collection: <code>/admin_audit_logs</code></div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Pengaturan Operasional</div>
                  <div className="text-2xl font-black text-slate-800 mt-1">{settings.length} Konfigurasi</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">Collection: <code>/admin_settings</code></div>
                </div>
              </div>

              {/* Admin System Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-extrabold text-sm text-slate-800">Parameter & Konfigurasi Sistem (/admin_settings)</h3>
                  </div>
                  <span className="text-xs text-slate-500">{settings.length} config</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {settings.map((st) => (
                    <div key={st.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{st.key}</code>
                          <span className="text-slate-600 font-medium">{st.description}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Kategori: {st.category} · Update: {st.lastUpdated}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {String(st.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Audit Logs */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-extrabold text-sm text-slate-800">Audit Trail & Security Logs (/admin_audit_logs)</h3>
                  </div>
                  <span className="text-xs text-slate-500">{auditLogs.length} entries</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto font-mono text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{log.action}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-sans">{log.role}</span>
                          <span className="text-slate-500 font-sans">{log.target}</span>
                        </div>
                        <div className="text-slate-600 text-[11px] font-sans mt-0.5">{log.details}</div>
                      </div>
                      <div className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TECHNICIAN DATABASE */}
          {/* ========================================================================= */}
          {activeTab === 'technician' && (
            <div className="space-y-6">
              {/* Tech Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Teknisi Aktif Mitra</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{technicians.length} Personil</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {technicians.filter(t => t.isOnline).length} Sedang Online Siap Tugas
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Pelamar Calon Teknisi</div>
                  <div className="text-2xl font-black text-sky-600 mt-1">{applicants.length} Berkas</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">Collection: <code>/technician_applicants</code></div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase">Rata-rata Rating Teknisi</div>
                  <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-1">
                    ★ {(technicians.reduce((acc, t) => acc + t.rating, 0) / (technicians.length || 1)).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-1">Standar Mutu Pelayanan Tinggi</div>
                </div>
              </div>

              {/* Technicians List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-slate-800">Master Data Teknisi Aktif (/technicians)</h3>
                  </div>
                  <span className="text-xs text-slate-500">{technicians.length} teknisi</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {technicians.map((tech) => (
                    <div key={tech.id} className="p-4 hover:bg-emerald-50/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={tech.photoUrl} alt={tech.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{tech.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tech.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tech.isOnline ? 'ONLINE' : 'OFFLINE'}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">{tech.code}</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-3">
                              <span>{tech.roleTitle}</span>
                              <span>·</span>
                              <span>{tech.phone}</span>
                              <span>·</span>
                              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                ★ {tech.rating} ({tech.reviewCount} ulasan)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            {tech.activeOrders} Order Aktif
                          </span>
                          <button
                            onClick={() => setSelectedRecord(tech)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-700 transition-colors cursor-pointer"
                          >
                            JSON
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Applicants Snapshot */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-slate-800">Pipeline Rekrutmen & Pelamar Teknisi (/technician_applicants)</h3>
                  </div>
                  <span className="text-xs text-slate-500">{applicants.length} pelamar</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {applicants.map((apl) => (
                    <div key={apl.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{apl.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{apl.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            apl.status === 'diterima' ? 'bg-emerald-100 text-emerald-800' :
                            apl.status === 'ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {apl.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {apl.domicile} · {apl.experienceYears} · {apl.education}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedRecord(apl)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        JSON
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RAW JSON RECORD VIEWER MODAL */}
          <AnimatePresence>
            {selectedRecord && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Raw Firestore Document Data</span>
                  </div>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Tutup Viewer
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto text-emerald-400 border border-slate-800 max-h-56">
                  {JSON.stringify(selectedRecord, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Database Backend Terpisah: <strong>Customer</strong> (/customers), <strong>Admin</strong> (/admin_*), <strong>Teknisi</strong> (/technicians)</span>
          </div>
          <div>
            <span>Target: <strong>ai-studio-accarepwaservice-...</strong></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
