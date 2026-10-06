import { supabase } from '../lib/supabase';
import { OrderChatMessage, ChatSenderRole } from '../types';
import { logAuditEvent } from './adminService';

const MESSAGES_TABLE = 'order_messages';

// Default canned responses / quick replies
export const CUSTOMER_QUICK_REPLIES = [
  '📍 Rumah saya pagar hitam / dekat pos satpam ya mas',
  '❄️ Tolong sekalian cek tekanan freon dan pipa luar ya',
  '⏱️ Kira-kira sampai berapa menit lagi mas?',
  '👍 Baik mas, saya sudah di rumah menunggu kedatangan',
  '⭐ Terima kasih mas, hasilnya dingin maksimal!'
];

export const TECHNICIAN_QUICK_REPLIES = [
  '🚗 Halo Bu/Pak, saya sedang dalam perjalanan menuju lokasi Anda (est. 10-15 menit).',
  '📍 Saya sudah sampai di depan rumah/lokasi pengerjaan ya.',
  '🔧 Pengerjaan cuci AC dan pemeriksaan unit indoor/outdoor sudah dimulai.',
  '✅ AC selesai dikerjakan, tekanan freon normal dan hembusan dingin segar.',
  '🙏 Terima kasih banyak atas kepercayaannya pada Tukang AC Online.'
];

/**
 * Format time string e.g. "14:20"
 */
export function formatChatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
}

function mapMessageRow(row: any, defaultOrderId: string): OrderChatMessage {
  return {
    id: row.id,
    orderId: row.order_id || row.orderId || defaultOrderId,
    senderRole: (row.sender_role || row.senderRole || 'customer') as ChatSenderRole,
    senderName: row.sender_name || row.senderName || 'Pengguna',
    senderAvatar: row.sender_avatar || row.senderAvatar,
    text: row.message || row.text || '',
    timestamp: row.timestamp || formatChatTime(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    isRead: row.is_read ?? row.isRead ?? true
  };
}

/**
 * Fetch all messages for a specific order
 */
export async function getOrderMessages(orderId: string): Promise<OrderChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from(MESSAGES_TABLE)
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn(`Error fetching messages for order ${orderId}:`, error);
      return [];
    }

    return (data || []).map(row => mapMessageRow(row, orderId));
  } catch (err) {
    console.error(`Error fetching order messages:`, err);
    return [];
  }
}

/**
 * Real-time listener for order messages via Supabase Realtime
 */
export function subscribeOrderMessages(
  orderId: string, 
  callback: (messages: OrderChatMessage[]) => void
): () => void {
  // 1. Initial query
  getOrderMessages(orderId).then(callback);

  // 2. Realtime channel subscription with auto-cleanup on unmount
  const channel = supabase
    .channel(`order_chat_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: MESSAGES_TABLE,
        filter: `order_id=eq.${orderId}`
      },
      () => {
        // Refetch latest sorted messages
        getOrderMessages(orderId).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}

/**
 * Send a chat message to Supabase order_messages table
 */
export async function sendOrderMessage(
  orderId: string,
  payload: {
    senderRole: ChatSenderRole;
    senderName: string;
    senderAvatar?: string;
    text: string;
  }
): Promise<OrderChatMessage> {
  const messageId = `msg_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const timestamp = formatChatTime(now);
  const createdAt = now.toISOString();

  const newMessage: OrderChatMessage = {
    id: messageId,
    orderId,
    senderRole: payload.senderRole,
    senderName: payload.senderName,
    senderAvatar: payload.senderAvatar,
    text: payload.text.trim(),
    timestamp,
    createdAt,
    isRead: false
  };

  try {
    const rowPayload = {
      id: messageId,
      order_id: orderId,
      sender_role: payload.senderRole,
      sender_name: payload.senderName,
      sender_avatar: payload.senderAvatar || null,
      message: payload.text.trim(),
      timestamp,
      is_read: false,
      created_at: createdAt
    };

    const { error } = await supabase
      .from(MESSAGES_TABLE)
      .insert(rowPayload);

    if (error) {
      throw error;
    }

    // Optional audit log for tracing
    logAuditEvent(
      'ORDER_CHAT_MESSAGE',
      payload.senderRole,
      `Order: #${orderId}`,
      `${payload.senderName} (${payload.senderRole}): "${payload.text.substring(0, 40)}..."`
    ).catch(() => {});

    return newMessage;
  } catch (err) {
    console.error(`Error sending message in order ${orderId}:`, err);
    throw err;
  }
}

/**
 * Seed initial sample messages for realistic instant demonstration if empty
 */
export async function seedInitialOrderChatIfEmpty(
  orderId: string,
  customerName: string = 'Pelanggan',
  technicianName: string = 'Teknisi'
): Promise<void> {
  try {
    const existing = await getOrderMessages(orderId);
    if (existing.length > 0) return;

    const now = Date.now();
    const sampleMessages = [
      {
        id: `msg_sys_${now - 300000}`,
        order_id: orderId,
        sender_role: 'system',
        sender_name: 'Sistem Tukang AC Online',
        message: `Pesanan #${orderId} telah terkonfirmasi. Teknisi ${technicianName} telah ditugaskan. Fitur chat terenkripsi aktif untuk koordinasi.`,
        timestamp: formatChatTime(new Date(now - 300000)),
        is_read: true,
        created_at: new Date(now - 300000).toISOString()
      },
      {
        id: `msg_tech_${now - 180000}`,
        order_id: orderId,
        sender_role: 'technician',
        sender_name: technicianName,
        sender_avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80',
        message: `Halo Pak/Bu ${customerName}, saya ${technicianName} dari Tukang AC Online. Saya sedang dalam perjalanan menuju lokasi Anda (est. 10-15 menit).`,
        timestamp: formatChatTime(new Date(now - 180000)),
        is_read: true,
        created_at: new Date(now - 180000).toISOString()
      },
      {
        id: `msg_cust_${now - 120000}`,
        order_id: orderId,
        sender_role: 'customer',
        sender_name: customerName,
        message: `Halo Mas ${technicianName}, baik ditunggu ya. Rumah saya pagar warna hitam no 12 samping pos satpam.`,
        timestamp: formatChatTime(new Date(now - 120000)),
        is_read: true,
        created_at: new Date(now - 120000).toISOString()
      }
    ];

    await supabase.from(MESSAGES_TABLE).insert(sampleMessages);
  } catch (err) {
    console.warn(`Could not seed initial chat for order ${orderId}:`, err);
  }
}
