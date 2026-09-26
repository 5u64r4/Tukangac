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
  Send, 
  MessageSquare, 
  Maximize2, 
  ShieldCheck, 
  CheckCheck, 
  Clock, 
  Zap, 
  User, 
  Sparkles,
  Bot
} from 'lucide-react';

interface InlineOrderChatProps {
  order: Order;
  currentRole: 'customer' | 'technician';
  onExpandModal: () => void;
  onToast: (msg: string) => void;
}

export const InlineOrderChat: React.FC<InlineOrderChatProps> = ({
  order,
  currentRole,
  onExpandModal,
  onToast
}) => {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const senderRole: ChatSenderRole = currentRole;
  const senderName = currentRole === 'technician' 
    ? (order.technicianName || 'Andi Pratama') 
    : (order.customerName || 'Budi Santoso');

  const interlocutorName = currentRole === 'technician'
    ? (order.customerName || 'Budi Santoso')
    : (order.technicianName || 'Andi Pratama');

  useEffect(() => {
    if (!order?.id) return;
    let isMounted = true;

    // Seed default messages if empty
    seedInitialOrderChatIfEmpty(
      order.id,
      order.customerName || 'Budi Santoso',
      order.technicianName || 'Andi Pratama'
    );

    const unsubscribe = subscribeOrderMessages(order.id, (liveMessages) => {
      if (!isMounted) return;
      setMessages(liveMessages);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [order?.id, order?.customerName, order?.technicianName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || !order?.id || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      await sendOrderMessage(order.id, {
        senderRole,
        senderName,
        text
      });
    } catch (err) {
      console.error('Error sending message:', err);
      onToast('Gagal mengirim pesan chat.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = currentRole === 'technician' 
    ? TECHNICIAN_QUICK_REPLIES.slice(0, 3) 
    : CUSTOMER_QUICK_REPLIES.slice(0, 3);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Chat Card Header */}
      <div className="p-3 bg-gradient-to-r from-sky-50 via-slate-50 to-sky-50/60 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-slate-900">
                Chat Langsung Order #{order.id}
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-500">
              Koordinasi dengan <strong className="text-sky-700">{interlocutorName}</strong> ({currentRole === 'customer' ? 'Teknisi' : 'Pelanggan'})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExpandModal}
          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-white border border-slate-200/60 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          title="Buka Chat Layar Penuh"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px]">Perbesar</span>
        </button>
      </div>

      {/* Messages List Container */}
      <div className="p-3 max-h-56 overflow-y-auto space-y-2.5 bg-gradient-to-b from-slate-50/60 to-white text-xs">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs space-y-1">
            <MessageSquare className="w-5 h-5 mx-auto text-slate-300" />
            <p>Mulai percakapan dengan {interlocutorName}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === senderRole;
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-1">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[10px] font-medium border border-sky-100 shadow-2xs">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center font-black text-[9px] shrink-0">
                    {msg.senderName.charAt(0)}
                  </div>
                )}

                <div className={`max-w-[80%] space-y-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-2.5 rounded-xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-sky-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {!isMe && (
                      <div className="text-[9px] font-bold text-sky-700 mb-0.5">
                        {msg.senderName}
                      </div>
                    )}
                    <p className="break-words">{msg.text}</p>
                  </div>

                  <div className={`flex items-center gap-1 text-[9px] text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-2.5 h-2.5 text-sky-500" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-2.5 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[9px] font-black text-slate-400 uppercase shrink-0 flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5 text-amber-500" /> Cepat:
        </span>
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(reply)}
            className="px-2 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-800 border border-slate-200 text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors shrink-0 shadow-2xs"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Pesan untuk ${interlocutorName}...`}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
          disabled={isSending}
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white cursor-pointer active:scale-95 shadow-xs transition-all shrink-0"
          title="Kirim Pesan"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
