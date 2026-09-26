import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import db from '../lib/firebase';
import { INITIAL_ORDERS, TECHNICIANS, INITIAL_APPLICANTS } from '../data/initialData';
import { ARTICLES_DATA } from '../data/articlesData';
import { CustomerRecord, AdminSetting, AdminAuditLog } from '../types';
import { sanitizeFirestoreData } from '../lib/firebaseUtils';

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'CUST-081234567890',
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    email: 'budi.santoso@gmail.com',
    defaultAddress: 'Jl. Boulevard Raya Blok A4 No. 12, Bekasi Selatan',
    addressLabel: 'Rumah',
    totalOrders: 3,
    points: 350,
    joinedDate: '10 Agu 2026',
    status: 'vip'
  },
  {
    id: 'CUST-085798765432',
    name: 'Sari Rahayu',
    phone: '0857-9876-5432',
    email: 'sari.rahayu@yahoo.com',
    defaultAddress: 'Tower Grand Kamala Lagoon Lt. 15 No. 8, Bekasi',
    addressLabel: 'Apartemen',
    totalOrders: 1,
    points: 100,
    joinedDate: '28 Agu 2026',
    status: 'active'
  },
  {
    id: 'CUST-081399887766',
    name: 'dr. Kevin Pratama',
    phone: '0813-9988-7766',
    email: 'kevin.pratama@medikacare.id',
    defaultAddress: 'Jl. Boulevard Barat Blok LA No. 18, Kelapa Gading, Jakarta Utara',
    addressLabel: 'Klinik / Kantor',
    totalOrders: 5,
    points: 620,
    joinedDate: '01 Jul 2026',
    status: 'vip'
  }
];

const INITIAL_SETTINGS: AdminSetting[] = [
  {
    id: 'SET-PRICING-01',
    key: 'BASE_SERVICE_DISCOUNT',
    value: 15,
    category: 'pricing',
    description: 'Diskon promo cuci AC reguler (%)',
    lastUpdated: '28 Agu 2026'
  },
  {
    id: 'SET-OP-01',
    key: 'MAX_DAILY_ORDERS_PER_TECH',
    value: 6,
    category: 'operational',
    description: 'Batas maksimum order harian per teknisi aktif',
    lastUpdated: '25 Agu 2026'
  },
  {
    id: 'SET-SEC-01',
    key: 'WARRANTY_DURATION_DAYS',
    value: 30,
    category: 'security',
    description: 'Durasi garansi servis resmi pengerjaan teknisi (hari)',
    lastUpdated: '20 Agu 2026'
  }
];

const INITIAL_LOGS: AdminAuditLog[] = [
  {
    id: 'LOG-SYS-001',
    action: 'SYSTEM_BOOTSTRAP',
    role: 'system',
    target: 'Cloud Firestore Database',
    details: 'Database backend Tukang AC Online berhasil diinisialisasi untuk Customer, Admin, dan Teknisi.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'LOG-ORD-002',
    action: 'ORDER_ASSIGNMENT',
    role: 'admin',
    target: 'Order AC260827001',
    details: 'Order ditugaskan ke Teknisi Andi Pratama (Status: Menuju Lokasi)',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

/**
 * Inisialisasi awal database Firestore jika collection masih kosong
 */
export async function initializeDatabaseIfEmpty(): Promise<{ seeded: boolean; message: string }> {
  try {
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const techSnap = await getDocs(collection(db, 'technicians'));
    const custSnap = await getDocs(collection(db, 'customers'));

    // If data already exists, don't overwrite
    if (!ordersSnap.empty && !techSnap.empty && !custSnap.empty) {
      return { seeded: false, message: 'Database telah aktif dan terhubung.' };
    }

    const batch = writeBatch(db);

    // 1. Seed Customer Database
    for (const cust of INITIAL_CUSTOMERS) {
      const ref = doc(db, 'customers', cust.id);
      batch.set(ref, sanitizeFirestoreData(cust));
    }

    // 2. Seed Orders Database
    for (const ord of INITIAL_ORDERS) {
      const ref = doc(db, 'orders', ord.id);
      batch.set(ref, sanitizeFirestoreData(ord));
    }

    // 3. Seed Technician Database
    for (const tech of TECHNICIANS) {
      const ref = doc(db, 'technicians', tech.id);
      batch.set(ref, sanitizeFirestoreData(tech));
    }

    // 4. Seed Technician Applicants Database
    for (const apl of INITIAL_APPLICANTS) {
      const ref = doc(db, 'technician_applicants', apl.id);
      batch.set(ref, sanitizeFirestoreData(apl));
    }

    // 5. Seed Admin Database
    for (const set of INITIAL_SETTINGS) {
      const ref = doc(db, 'admin_settings', set.id);
      batch.set(ref, sanitizeFirestoreData(set));
    }

    for (const log of INITIAL_LOGS) {
      const ref = doc(db, 'admin_audit_logs', log.id);
      batch.set(ref, sanitizeFirestoreData(log));
    }

    // 6. Seed Blog Articles CMS Database
    for (const art of ARTICLES_DATA) {
      const ref = doc(db, 'articles', art.id);
      batch.set(ref, sanitizeFirestoreData({
        ...art,
        status: 'published',
        views: Math.floor(140 + Math.random() * 320),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }

    await batch.commit();
    return { seeded: true, message: 'Database Firestore berhasil diisi data inisial terpisah untuk Customer, Admin, Teknisi, dan CMS Artikel Blog.' };
  } catch (err: any) {
    if (err?.code === 'unavailable' || (err?.message && err.message.includes('offline'))) {
      console.info('Cloud Firestore backend is currently establishing connection. Operating smoothly with local cache.');
    } else {
      console.warn('Database initialization note:', err);
    }
    return { seeded: false, message: `Status koneksi: ${err?.message || 'offline'}` };
  }
}

/**
 * Reset demo database ke default
 */
export async function forceResetDatabase(): Promise<void> {
  const batch = writeBatch(db);

  for (const cust of INITIAL_CUSTOMERS) {
    batch.set(doc(db, 'customers', cust.id), sanitizeFirestoreData(cust));
  }
  for (const ord of INITIAL_ORDERS) {
    batch.set(doc(db, 'orders', ord.id), sanitizeFirestoreData(ord));
  }
  for (const tech of TECHNICIANS) {
    batch.set(doc(db, 'technicians', tech.id), sanitizeFirestoreData(tech));
  }
  for (const apl of INITIAL_APPLICANTS) {
    batch.set(doc(db, 'technician_applicants', apl.id), sanitizeFirestoreData(apl));
  }
  for (const set of INITIAL_SETTINGS) {
    batch.set(doc(db, 'admin_settings', set.id), sanitizeFirestoreData(set));
  }
  for (const log of INITIAL_LOGS) {
    batch.set(doc(db, 'admin_audit_logs', log.id), sanitizeFirestoreData(log));
  }
  for (const art of ARTICLES_DATA) {
    batch.set(doc(db, 'articles', art.id), sanitizeFirestoreData({
      ...art,
      status: 'published',
      views: Math.floor(140 + Math.random() * 320),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  await batch.commit();
}
