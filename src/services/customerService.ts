import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import db from '../lib/firebase';
import { CustomerRecord, Order } from '../types';
import { sanitizeFirestoreData } from '../lib/firebaseUtils';

const CUSTOMERS_COLLECTION = 'customers';
const ORDERS_COLLECTION = 'orders';

/**
 * Mendapatkan semua data customer terdaftar dari database
 */
export async function getAllCustomers(): Promise<CustomerRecord[]> {
  try {
    const q = query(collection(db, CUSTOMERS_COLLECTION), orderBy('joinedDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CustomerRecord));
  } catch (err) {
    console.error('Error fetching all customers:', err);
    return [];
  }
}

/**
 * Mendapatkan profil data customer berdasarkan ID atau No Telepon
 */
export async function getCustomerById(customerId: string): Promise<CustomerRecord | null> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CustomerRecord;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching customer ${customerId}:`, err);
    return null;
  }
}

/**
 * Menyimpan / memperbarui profil customer
 */
export async function saveCustomer(customer: CustomerRecord): Promise<void> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, customer.id);
    const sanitized = sanitizeFirestoreData(customer);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error(`Error saving customer ${customer.id}:`, err);
    throw err;
  }
}

/**
 * Mengambil daftar pesanan customer berdasarkan nomor telepon
 */
export async function getOrdersByCustomerPhone(phone: string): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), where('customerPhone', '==', phone));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Order));
  } catch (err) {
    console.error(`Error fetching orders for customer ${phone}:`, err);
    return [];
  }
}

/**
 * Membuat pesanan service baru oleh customer
 */
export async function createBookingOrder(orderData: Order): Promise<string> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderData.id);
    const sanitized = sanitizeFirestoreData(orderData);
    await setDoc(docRef, sanitized);
    return orderData.id;
  } catch (err) {
    console.error('Error creating booking order:', err);
    throw err;
  }
}

/**
 * Real-time listener pesanan untuk customer
 */
export function subscribeCustomerOrders(phone: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, ORDERS_COLLECTION), where('customerPhone', '==', phone));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  }, (err) => {
    if (err.code === 'unavailable' || err.message.includes('offline')) {
      console.info('Customer orders listener operating in offline/cached mode.');
    } else {
      console.warn('Customer orders subscription notice:', err.message);
    }
  });
}

/**
 * Memperbarui status pembayaran pesanan di Firestore
 */
export async function updateOrderPayment(
  orderId: string, 
  paymentData: Partial<Order>
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const sanitized = sanitizeFirestoreData(paymentData);
    await updateDoc(docRef, sanitized);
  } catch (err) {
    console.warn(`Could not update order payment in Firestore for ${orderId}:`, err);
  }
}

