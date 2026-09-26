import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import db from '../lib/firebase';
import { Order, OrderStatus, Technician, TechnicianApplicant, ApplicantStatus, AdminAuditLog, AdminSetting } from '../types';
import { sanitizeFirestoreData } from '../lib/firebaseUtils';

const ORDERS_COLLECTION = 'orders';
const TECHNICIANS_COLLECTION = 'technicians';
const APPLICANTS_COLLECTION = 'technician_applicants';
const AUDIT_LOGS_COLLECTION = 'admin_audit_logs';
const SETTINGS_COLLECTION = 'admin_settings';

/**
 * Mengambil semua pesanan dalam sistem untuk admin
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Order));
  } catch (err) {
    console.error('Error fetching all orders for admin:', err);
    return [];
  }
}

/**
 * Memperbarui status pesanan oleh admin
 */
export async function updateAdminOrderStatus(orderId: string, status: OrderStatus, technicianName?: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Partial<Order> = { status };
    if (technicianName) {
      updateData.technicianName = technicianName;
    }
    await updateDoc(docRef, sanitizeFirestoreData(updateData));
    
    // Log audit event
    await logAuditEvent('UPDATE_ORDER_STATUS', 'admin', `Order: ${orderId}`, `Status diubah menjadi: ${status}`);
  } catch (err) {
    console.error(`Error updating order ${orderId} by admin:`, err);
    throw err;
  }
}

/**
 * Mengambil semua pelamar teknisi
 */
export async function getAllApplicants(): Promise<TechnicianApplicant[]> {
  try {
    const snapshot = await getDocs(collection(db, APPLICANTS_COLLECTION));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as TechnicianApplicant));
  } catch (err) {
    console.error('Error fetching applicants:', err);
    return [];
  }
}

/**
 * Menambahkan pelamar teknisi baru
 */
export async function saveApplicant(applicant: TechnicianApplicant): Promise<void> {
  try {
    const docRef = doc(db, APPLICANTS_COLLECTION, applicant.id);
    await setDoc(docRef, sanitizeFirestoreData(applicant));
    await logAuditEvent('ADD_APPLICANT', 'admin', `Applicant: ${applicant.name}`, `Pelamar baru ditambahkan (${applicant.id})`);
  } catch (err) {
    console.error('Error saving applicant:', err);
    throw err;
  }
}

/**
 * Memperbarui status pelamar teknisi (pending, diterima, ditolak)
 */
export async function updateApplicantStatus(applicantId: string, status: ApplicantStatus): Promise<void> {
  try {
    const docRef = doc(db, APPLICANTS_COLLECTION, applicantId);
    await updateDoc(docRef, { status });
    await logAuditEvent('UPDATE_APPLICANT_STATUS', 'admin', `Applicant: ${applicantId}`, `Status diubah menjadi: ${status}`);
  } catch (err) {
    console.error(`Error updating applicant ${applicantId}:`, err);
    throw err;
  }
}

/**
 * Menghapus pelamar teknisi
 */
export async function deleteApplicant(applicantId: string): Promise<void> {
  try {
    const docRef = doc(db, APPLICANTS_COLLECTION, applicantId);
    await deleteDoc(docRef);
    await logAuditEvent('DELETE_APPLICANT', 'admin', `Applicant: ${applicantId}`, 'Pelamar dihapus dari database');
  } catch (err) {
    console.error(`Error deleting applicant ${applicantId}:`, err);
    throw err;
  }
}

/**
 * Mengambil log audit admin
 */
export async function getAuditLogs(): Promise<AdminAuditLog[]> {
  try {
    const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as AdminAuditLog));
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}

/**
 * Mencatat aktivitas audit di database admin
 */
export async function logAuditEvent(action: string, role: 'customer' | 'admin' | 'technician' | 'system', target: string, details: string): Promise<void> {
  try {
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, logId);
    const logData: AdminAuditLog = {
      id: logId,
      action,
      role,
      target,
      details,
      timestamp: new Date().toISOString()
    };
    await setDoc(docRef, sanitizeFirestoreData(logData));
  } catch (err) {
    // Non-blocking log error
    console.warn('Could not write audit log to database:', err);
  }
}

/**
 * Mengambil pengaturan sistem operasional admin
 */
export async function getAdminSettings(): Promise<AdminSetting[]> {
  try {
    const snapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as AdminSetting));
  } catch (err) {
    console.error('Error fetching admin settings:', err);
    return [];
  }
}

/**
 * Real-time listener untuk semua pesanan admin
 */
export function subscribeAdminOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(collection(db, ORDERS_COLLECTION), (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  }, (err) => {
    if (err.code === 'unavailable' || err.message.includes('offline')) {
      console.info('Admin orders listener operating in offline/cached mode.');
    } else {
      console.warn('Admin orders subscription notice:', err.message);
    }
  });
}

/**
 * Real-time listener untuk log audit admin
 */
export function subscribeAuditLogs(callback: (logs: AdminAuditLog[]) => void) {
  const q = query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdminAuditLog));
    callback(logs);
  }, (err) => {
    if (err.code === 'unavailable' || err.message.includes('offline')) {
      console.info('Audit logs listener operating in offline/cached mode.');
    } else {
      console.warn('Audit logs subscription notice:', err.message);
    }
  });
}
