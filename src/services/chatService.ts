import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import db from '../lib/firebase';
import { OrderChatMessage, ChatSenderRole } from '../types';
import { logAuditEvent } from './adminService';
import { sanitizeFirestoreData } from '../lib/firebaseUtils';

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

/**
 * Real-time listener for order messages in Firestore
 */
export function subscribeOrderMessages(
  orderId: string, 
  callback: (messages: OrderChatMessage[]) => void
): () => void {
  try {
    const messagesCol = collection(db, 'orders', orderId, 'messages');
    
    return onSnapshot(messagesCol, (snapshot) => {
      if (!snapshot.empty) {
        const msgs: OrderChatMessage[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            orderId: data.orderId || orderId,
            senderRole: (data.senderRole || 'customer') as ChatSenderRole,
            senderName: data.senderName || 'Pengguna',
            senderAvatar: data.senderAvatar,
            text: data.text || '',
            timestamp: data.timestamp || formatChatTime(),
            createdAt: data.createdAt || new Date().toISOString(),
            isRead: data.isRead ?? true
          };
        });

        // Sort by createdAt ascending (oldest to newest)
        msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(msgs);
      } else {
        callback([]);
      }
    }, (error) => {
      console.warn(`[Firestore] Order ${orderId} chat snapshot warning:`, error);
      callback([]);
    });
  } catch (err) {
    console.error(`Error subscribing to order ${orderId} messages:`, err);
    callback([]);
    return () => {};
  }
}

/**
 * Send a chat message to Firestore under /orders/{orderId}/messages/{messageId}
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
    const msgRef = doc(db, 'orders', orderId, 'messages', messageId);
    await setDoc(msgRef, sanitizeFirestoreData(newMessage));

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
  customerName: string = 'Budi Santoso',
  technicianName: string = 'Andi Pratama'
): Promise<void> {
  try {
    const messagesCol = collection(db, 'orders', orderId, 'messages');
    const snap = await getDocs(messagesCol);
    if (!snap.empty) return;

    const batch = writeBatch(db);
    const now = Date.now();

    const sampleMessages: OrderChatMessage[] = [
      {
        id: `msg_sys_${now - 300000}`,
        orderId,
        senderRole: 'system',
        senderName: 'Sistem Tukang AC Online',
        text: `Pesanan #${orderId} telah terkonfirmasi. Teknisi ${technicianName} telah ditugaskan. Fitur chat terenkripsi aktif untuk koordinasi.`,
        timestamp: formatChatTime(new Date(now - 300000)),
        createdAt: new Date(now - 300000).toISOString(),
        isRead: true
      },
      {
        id: `msg_tech_${now - 180000}`,
        orderId,
        senderRole: 'technician',
        senderName: technicianName,
        senderAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80',
        text: `Halo Pak/Bu ${customerName}, saya ${technicianName} dari Tukang AC Online. Saya sedang dalam perjalanan menuju lokasi Anda (est. 10-15 menit).`,
        timestamp: formatChatTime(new Date(now - 180000)),
        createdAt: new Date(now - 180000).toISOString(),
        isRead: true
      },
      {
        id: `msg_cust_${now - 120000}`,
        orderId,
        senderRole: 'customer',
        senderName: customerName,
        text: `Halo Mas ${technicianName}, baik ditunggu ya. Rumah saya pagar warna hitam no 12 samping pos satpam.`,
        timestamp: formatChatTime(new Date(now - 120000)),
        createdAt: new Date(now - 120000).toISOString(),
        isRead: true
      }
    ];

    for (const msg of sampleMessages) {
      const msgRef = doc(db, 'orders', orderId, 'messages', msg.id);
      batch.set(msgRef, sanitizeFirestoreData(msg));
    }

    await batch.commit();
  } catch (err) {
    console.warn(`Could not seed initial chat for order ${orderId}:`, err);
  }
}
