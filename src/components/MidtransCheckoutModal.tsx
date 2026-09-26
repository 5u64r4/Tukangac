import React, { useState, useEffect } from 'react';
import { Order, PaymentChannel } from '../types';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Building2, 
  Store, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ReceiptText,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { midtransService } from '../services/midtransService';

interface MidtransCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentSuccess: (orderId: string, paymentData: {
    transactionId: string;
    paymentChannel: string;
    paymentType: string;
    paidAt: string;
    vaNumber?: string;
    bank?: string;
  }) => void;
  onToast: (msg: string) => void;
}

export const MidtransCheckoutModal: React.FC<MidtransCheckoutModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
  onToast
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('qris');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [snapToken, setSnapToken] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes
  const [paymentStep, setPaymentStep] = useState<'select' | 'pay' | 'success'>('select');
  const [vaNumber, setVaNumber] = useState<string>('');
  const [billKey, setBillKey] = useState<string>('');

  // Generate or fetch Midtrans token when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setPaymentStep('select');
      setSelectedChannel('qris');
      setCountdown(900);
      initMidtransToken();
    }
  }, [isOpen, order?.id]);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (isOpen && paymentStep === 'pay' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, paymentStep, countdown]);

  const initMidtransToken = async () => {
    if (!order) return;
    setIsLoadingToken(true);
    try {
      // Pre-load script in background
      midtransService.loadSnapScript().catch(() => {});

      const result = await midtransService.createSnapToken({
        orderId: order.id,
        grossAmount: order.totalPrice,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        serviceName: order.serviceName,
        unitCount: order.unitCount || 1,
      });

      setSnapToken(result.token);
      setRedirectUrl(result.redirectUrl);
      
      // Generate VA number for sandbox bank transfers
      const randomVa = '8274' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
      setVaNumber(randomVa);
      setBillKey(Math.floor(10000000 + Math.random() * 90000000).toString());
    } catch (err: any) {
      console.error('Failed to init Midtrans token:', err);
      onToast('Menggunakan mode simulasi Midtrans Sandbox.');
    } finally {
      setIsLoadingToken(false);
    }
  };

  if (!isOpen || !order) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    onToast(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLaunchNativeSnap = () => {
    if (typeof window !== 'undefined' && window.snap && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: (result: any) => {
          finalizePayment(result.payment_type || 'qris', result.transaction_id || `TRX-MID-${Date.now()}`);
        },
        onPending: (result: any) => {
          onToast('Pembayaran pending, silakan selesaikan transaksi Anda.');
        },
        onError: (err: any) => {
          onToast('Pembayaran gagal atau dibatalkan.');
        },
        onClose: () => {
          onToast('Jendela pembayaran Snap ditutup.');
        }
      });
    } else {
      // Go to embedded visual pay step
      setPaymentStep('pay');
    }
  };

  const finalizePayment = async (channel: string = selectedChannel, customTrxId?: string) => {
    setIsProcessing(true);
    try {
      const nowStr = new Date().toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }) + ' WIB';

      const trxId = customTrxId || `TRX-MID-${Date.now()}`;

      // Notify backend simulator/webhook
      await midtransService.simulatePayment(order.id, channel, 'settlement');

      // Update local state
      onPaymentSuccess(order.id, {
        transactionId: trxId,
        paymentChannel: channel,
        paymentType: channel.toUpperCase(),
        paidAt: nowStr,
        vaNumber: channel.includes('va') ? vaNumber : undefined,
        bank: channel.includes('bca') ? 'BCA' : channel.includes('bni') ? 'BNI' : channel.includes('bri') ? 'BRI' : channel.includes('mandiri') ? 'Mandiri' : undefined
      });

      setPaymentStep('success');
      onToast('🎉 Pembayaran Midtrans berhasil diverifikasi!');
    } catch (e: any) {
      console.error(e);
      onToast('Gagal memverifikasi pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative my-auto"
        >
          {/* Header Midtrans Branding */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-800 via-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
                {/* Midtrans emblem */}
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center text-white font-black text-xs tracking-tighter">
                  M
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    Midtrans Snap Payment
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/30 text-sky-200 border border-sky-400/30">
                    Official Gateway
                  </span>
                </div>
                <p className="text-xs text-sky-200 flex items-center gap-1.5 mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit SSL Enkripsi Bank Indonesia</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Pembayaran:</span>
              <span className="text-lg sm:text-xl font-black text-slate-900">
                Rp{order.totalPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-mono block">Order #{order.id}</span>
              <span className="text-xs font-bold text-sky-700">{order.serviceName}</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* STEP 1: Select Payment Method */}
            {paymentStep === 'select' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Pilih Saluran Pembayaran Midtrans:</span>
                  <span className="text-[10px] font-semibold text-slate-400">Instan & Terverifikasi</span>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: QRIS (GoPay, ShopeePay, Semua Bank) */}
                  <label 
                    onClick={() => setSelectedChannel('qris')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedChannel === 'qris'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                          <span>QRIS (GoPay, ShopeePay, DANA, BCA Mobile)</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Rekomendasi</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Scan otomatis dari semua aplikasi e-wallet & m-Banking</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="channel" 
                      checked={selectedChannel === 'qris'} 
                      onChange={() => setSelectedChannel('qris')} 
                      className="w-4 h-4 text-sky-600 accent-sky-600"
                    />
                  </label>

                  {/* Option 2: BCA Virtual Account */}
                  <label 
                    onClick={() => setSelectedChannel('bca_va')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedChannel === 'bca_va'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs shrink-0 font-black text-xs">
                        BCA
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">BCA Virtual Account</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Verifikasi otomatis tanpa bukti transfer (BCA Mobile/KlikBCA/ATM)</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="channel" 
                      checked={selectedChannel === 'bca_va'} 
                      onChange={() => setSelectedChannel('bca_va')} 
                      className="w-4 h-4 text-sky-600 accent-sky-600"
                    />
                  </label>

                  {/* Option 3: Mandiri Bill Payment */}
                  <label 
                    onClick={() => setSelectedChannel('mandiri_va')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedChannel === 'mandiri_va'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0 font-black text-xs">
                        MDR
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">Mandiri Bill Payment (Livin' by Mandiri)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Kode Perusahaan 70012 + Nomor Pembayaran</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="channel" 
                      checked={selectedChannel === 'mandiri_va'} 
                      onChange={() => setSelectedChannel('mandiri_va')} 
                      className="w-4 h-4 text-sky-600 accent-sky-600"
                    />
                  </label>

                  {/* Option 4: BNI / BRI Virtual Account */}
                  <label 
                    onClick={() => setSelectedChannel('bni_va')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedChannel === 'bni_va'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 font-black text-xs">
                        BNI
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">BNI & BRI Virtual Account</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Transfer via ATM, Mobile Banking BNI, BRImo</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="channel" 
                      checked={selectedChannel === 'bni_va'} 
                      onChange={() => setSelectedChannel('bni_va')} 
                      className="w-4 h-4 text-sky-600 accent-sky-600"
                    />
                  </label>

                  {/* Option 5: Kartu Kredit / Debit Visa & Mastercard */}
                  <label 
                    onClick={() => setSelectedChannel('credit_card')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedChannel === 'credit_card'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">Kartu Kredit / Debit Online (3D Secure)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Visa, Mastercard, JCB, American Express</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="channel" 
                      checked={selectedChannel === 'credit_card'} 
                      onChange={() => setSelectedChannel('credit_card')} 
                      className="w-4 h-4 text-sky-600 accent-sky-600"
                    />
                  </label>

                  {/* Option 6: Minimarket (Indomaret / Alfamart) */}
                  <label 
                    onClick={() => setSelectedChannel('cstore')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedChannel === 'cstore'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">Indomaret & Alfamart</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Bayar di kasir gerai terdekat dengan kode pembayaran</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="channel" 
                      checked={selectedChannel === 'cstore'} 
                      onChange={() => setSelectedChannel('cstore')} 
                      className="w-4 h-4 text-sky-600 accent-sky-600"
                    />
                  </label>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setPaymentStep('pay')}
                    disabled={isLoadingToken}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchNativeSnap}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                    <span>Buka Pop-up Resmi Midtrans Snap</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Instruction & Live Pay Mock/QRIS */}
            {paymentStep === 'pay' && (
              <div className="space-y-4">
                {/* Timer Banner */}
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span className="font-bold">Selesaikan dalam:</span>
                  </div>
                  <span className="font-mono font-black text-sm text-amber-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                    {formatCountdown(countdown)}
                  </span>
                </div>

                {/* QRIS View */}
                {selectedChannel === 'qris' && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QRIS Nasional Terverifikasi</span>
                    </div>

                    {/* QR Graphic */}
                    <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md flex flex-col items-center justify-center relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://app.midtrans.com/snap/v2/vtweb/${order.id}`}
                        alt="QRIS Midtrans"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-md p-1 flex items-center justify-center border border-slate-200">
                          <span className="text-[10px] font-black text-sky-700">AC</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      Buka GoPay, ShopeePay, DANA, OVO, BCA Mobile, atau Livin Mandiri lalu pindai kode QR di atas.
                    </div>
                  </div>
                )}

                {/* Virtual Account View */}
                {(selectedChannel === 'bca_va' || selectedChannel === 'bni_va') && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700">
                        {selectedChannel === 'bca_va' ? 'Nomor Virtual Account BCA' : 'Nomor Virtual Account BNI'}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Otomatis
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                        {vaNumber || '8274 0812 3456 7890'}
                      </span>
                      <button
                        onClick={() => handleCopy(vaNumber || '8274081234567890', 'Nomor Virtual Account')}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedText === 'Nomor Virtual Account' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="font-bold text-slate-700">Panduan Pembayaran:</div>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Buka aplikasi Mobile Banking atau kunjungi ATM terdekat.</li>
                        <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                        <li>Masukkan nomor VA di atas dan pastikan nominal sesuai: <strong>Rp{order.totalPrice.toLocaleString('id-ID')}</strong>.</li>
                        <li>Konfirmasi transaksi dan status akan otomatis terverifikasi lunas.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Mandiri Bill Payment View */}
                {selectedChannel === 'mandiri_va' && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                      Mandiri Bill Payment Details
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Kode Perusahaan</span>
                        <span className="font-mono font-black text-slate-900 text-sm">70012</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Kode Pembayaran</span>
                        <span className="font-mono font-black text-slate-900 text-sm">{billKey}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Credit Card Simulation View */}
                {selectedChannel === 'credit_card' && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-700">
                      Rincian Kartu Kredit / Debit
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Nomor Kartu (16 Digit)</label>
                        <input 
                          type="text" 
                          placeholder="4811 0000 1234 5678"
                          defaultValue="4811 2345 6789 0123"
                          className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Masa Berlaku</label>
                          <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">CVV / CVV2</label>
                          <input type="password" placeholder="123" defaultValue="888" className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Minimarket View */}
                {selectedChannel === 'cstore' && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-700">
                      Kode Pembayaran Kasir Indomaret / Alfamart
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <span className="font-mono text-base font-black text-emerald-900 tracking-wider">
                        TKG-{order.id.replace('AC', '')}
                      </span>
                      <button
                        onClick={() => handleCopy(`TKG-${order.id.replace('AC', '')}`, 'Kode Minimarket')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedText === 'Kode Minimarket' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action CTA Button */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => finalizePayment()}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Status Midtrans...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>SAYA SUDAH MEMBAYAR / SIMULASI LUNAS</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentStep('select')}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Ganti Metode Pembayaran Lain
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Success / Settled */}
            {paymentStep === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                  ✓
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    Pembayaran Midtrans Berhasil!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Dana senilai <strong>Rp{order.totalPrice.toLocaleString('id-ID')}</strong> telah aman tersimpan di sistem Escrow Tukang AC Online.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-mono font-bold text-slate-900">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode:</span>
                    <span className="font-bold text-sky-700 uppercase">{selectedChannel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Pembayaran:</span>
                    <span className="font-black text-emerald-600">SETTLEMENT / LUNAS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice:</span>
                    <span className="font-mono text-slate-800">INV/{order.id}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs cursor-pointer shadow-md transition-all"
                >
                  Tutup & Lihat Status Pesanan
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
