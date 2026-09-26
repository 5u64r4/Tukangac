import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import db from '../lib/firebase';
import { Technician, Order, OrderStatus } from '../types';

const TECHNICIANS_COLLECTION = 'technicians';
const ORDERS_COLLECTION = 'orders';

/**
 * Mengambil semua data teknisi aktif & status online
 */
export async function getAllTechnicians(): Promise<Technician[]> {
  try {
    const snapshot = await getDocs(collection(db, TECHNICIANS_COLLECTION));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Technician));
  } catch (err) {
    console.error('Error fetching technicians:', err);
    return [];
  }
}

/**
 * Mengambil data teknisi spesifik berdasarkan ID
 */
export async function getTechnicianById(techId: string): Promise<Technician | null> {
  try {
    const docRef = doc(db, TECHNICIANS_COLLECTION, techId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Technician;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching technician ${techId}:`, err);
    return null;
  }
}

/**
 * Mengubah status Online / Offline teknisi
 */
export async function updateTechnicianOnlineStatus(techId: string, isOnline: boolean): Promise<void> {
  try {
    const docRef = doc(db, TECHNICIANS_COLLECTION, techId);
    await updateDoc(docRef, { isOnline });
  } catch (err) {
    console.error(`Error updating online status for ${techId}:`, err);
    throw err;
  }
}

/**
 * Mengambil daftar tugas service yang ditugaskan ke teknisi tertentu
 */
export async function getOrdersForTechnician(technicianName: string): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), where('technicianName', '==', technicianName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Order));
  } catch (err) {
    console.error(`Error fetching orders for technician ${technicianName}:`, err);
    return [];
  }
}

/**
 * Memperbarui status pengerjaan pesanan oleh teknisi (menuju, service, selesai)
 */
export async function updateTechnicianOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error(`Error updating order ${orderId} by technician:`, err);
    throw err;
  }
}

/**
 * Real-time listener untuk daftar teknisi
 */
export function subscribeTechnicians(callback: (techs: Technician[]) => void) {
  return onSnapshot(collection(db, TECHNICIANS_COLLECTION), (snapshot) => {
    const techs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Technician));
    callback(techs);
  }, (err) => {
    if (err.code === 'unavailable' || err.message.includes('offline')) {
      console.info('Technicians listener operating in offline/cached mode.');
    } else {
      console.warn('Technicians subscription notice:', err.message);
    }
  });
}
