import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderChatMessage, ChatSenderRole } from '../types';
import { 
  subscribeOrderMessages, 
  sendOrderMessage, 
  seedInitialOrderChatIfEmpty,
  CUSTOMER_QUICK_REPLIES,
  TECHNICIAN_QUICK_REPLIES
} from '../services/chatService';
import { 
  X, 
  Send, 
  MessageSquare, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  CheckCheck, 
  Check, 
  Clock, 
  Zap, 
  User, 
  RefreshCw,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  currentRole: 'customer' | 'technician' | 'admin';
  onToast: (msg: string) => void;
}

export const OrderChatModal: React.FC<OrderChatModalProps> = ({
  isOpen,
  onClose,
  order,
  currentRole,
  onToast
}) => {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const senderRole: ChatSenderRole = currentRole === 'technician' ? 'technician' : 'customer';
  const senderName = currentRole === 'technician' 
    ? (order.technicianName || 'Andi Pratama (Teknisi)') 
    : (order.customerName || 'Budi Santoso (Pelanggan)');

  const recipientName = currentRole === 'technician'
    ? (order.customerName || 'Pelanggan')
    : (order.technicianName || 'Teknisi Andi');

  const recipientAvatar = currentRole === 'technician'
    ? null
    : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80';

  // Seed default chat and subscribe to Firestore updates
  useEffect(() => {
    if (!isOpen || !order?.id) return;

    let isMounted = true;

    // Seed initial message if order chat is empty
    seedInitialOrderChatIfEmpty(
      order.id,
      order.customerName || 'Budi Santoso',
      order.technicianName || 'Andi Pratama'
    );

    // Subscribe to real-time Firestore message stream
    const unsubscribe = subscribeOrderMessages(order.id, (liveMessages) => {
      if (!isMounted) return;
      setMessages(liveMessages);
      setIsConnected(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, order?.id, order?.customerName, order?.technicianName]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !order?.id || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      await sendOrderMessage(order.id, {
        senderRole,
        senderName,
        senderAvatar: currentRole === 'technician' ? (recipientAvatar || undefined) : undefined,
        text
      });
    } catch (err) {
      console.error('Error sending message:', err);
      onToast('Gagal mengirim pesan. Cek koneksi Anda.');
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = currentRole === 'technician' 
    ? TECHNICIAN_QUICK_REPLIES 
    : CUSTOMER_QUICK_REPLIES;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full h-[620px] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {recipientAvatar ? (
                <div className="relative shrink-0">
                  <img
                    src={recipientAvatar}
                    alt={recipientName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover border-2 border-white/80 shadow-xs bg-sky-900"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-sky-800 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  </span>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white font-extrabold text-base shadow-xs shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base truncate leading-tight">
                    {recipientName}
                  </h3>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/20 text-white border border-white/20 shrink-0">
                    {currentRole === 'technician' ? 'PELANGGAN' : 'TEKNISI'}
                  </span>
                </div>
                <div className="text-[11px] text-sky-200 flex items-center gap-2 mt-0.5 truncate">
                  <span>Order #{order.id}</span>
                  <span>·</span>
                  <span className="truncate">{order.serviceName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Firestore Live</span>
              </span>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Banner: Order Context */}
          <div className="px-4 py-2 bg-sky-50 border-b border-sky-100 text-xs text-slate-600 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate text-[11px] font-semibold text-slate-700">
                {order.addressLabel}: {order.fullAddress}
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded shrink-0">
              {order.status === 'selesai' ? 'SELESAI' : order.status === 'service' ? 'DALAM PENGERJAAN' : 'MENUJU LOKASI'}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50 to-white/90">
            {/* System Security Notice */}
            <div className="text-center my-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 border border-slate-300/60 text-[10px] font-bold text-slate-600 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                <span>Chat Terenkripsi & Terhubung Langsung ke Firestore Realtime</span>
              </div>
            </div>

            {messages.length === 0 && (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 animate-bounce" />
                <p className="text-xs">Belum ada pesan di order ini.</p>
                <p className="text-[11px] text-slate-400">Gunakan tombol pesan instan di bawah untuk memulai obrolan.</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderRole === senderRole;
              const isSystem = msg.senderRole === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="max-w-[85%] px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] text-center font-medium shadow-2xs leading-relaxed">
                      <span className="font-bold text-sky-700">Info: </span>
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-sky-200 mb-1">
                      {msg.senderName.charAt(0)}
                    </div>
                  )}

                  <div className={`max-w-[78%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-br-xs shadow-sky-600/20'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      {!isMe && (
                        <div className="text-[10px] font-extrabold text-sky-700 mb-1 flex items-center gap-1">
                          <span>{msg.senderName}</span>
                          <span className="text-slate-400 font-normal">({msg.senderRole === 'technician' ? 'Teknisi' : 'Pelanggan'})</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>

                    <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <Clock className="w-2.5 h-2.5" />
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-sky-500 ml-0.5" />}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Carousel */}
          <div className="px-3 py-2 bg-slate-50/95 border-t border-slate-200/80 shrink-0">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Balas Cepat (1-Klik)</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(reply)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 text-[11px] font-medium whitespace-nowrap cursor-pointer transition-all shadow-2xs active:scale-95 shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentRole === 'technician'
                    ? 'Ketik pesan untuk pelanggan...'
                    : 'Ketik pesan untuk teknisi...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                disabled={isSending}
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30 cursor-pointer active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
