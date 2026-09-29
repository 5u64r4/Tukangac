import { supabase } from '../lib/supabase';
import { INITIAL_ORDERS, TECHNICIANS, INITIAL_APPLICANTS } from '../data/initialData';
import { ARTICLES_DATA } from '../data/articlesData';
import { CustomerRecord, AdminSetting, AdminAuditLog } from '../types';
import { mapOrderToRow } from './customerService';

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
    target: 'Supabase PostgreSQL Database',
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
 * Inisialisasi awal database Supabase hanya jika database benar-benar kosong.
 * TIDAK menulis ulang data jika sudah ada isi.
 */
export async function initializeDatabaseIfEmpty(): Promise<{ seeded: boolean; message: string }> {
  try {
    const { data: existingOrders } = await supabase.from('orders').select('id').limit(1);
    const { data: existingTechs } = await supabase.from('technician_profiles').select('id').limit(1);

    if (existingOrders && existingOrders.length > 0 && existingTechs && existingTechs.length > 0) {
      return { seeded: false, message: 'Database Supabase aktif dan terhubung.' };
    }

    // 1. Seed Customer Profiles
    const customerRows = INITIAL_CUSTOMERS.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      default_address: c.defaultAddress,
      address_label: c.addressLabel,
      total_orders: c.totalOrders,
      points: c.points,
      joined_date: c.joinedDate,
      status: c.status
    }));
    await supabase.from('customer_profiles').upsert(customerRows);

    // 2. Seed Orders
    const orderRows = INITIAL_ORDERS.map(mapOrderToRow);
    await supabase.from('orders').upsert(orderRows);

    // 3. Seed Technicians
    const techRows = TECHNICIANS.map(t => ({
      id: t.id,
      name: t.name,
      code: t.code || null,
      avatar: t.avatar,
      photo_url: t.photoUrl || t.avatar,
      email: t.email || null,
      rating: t.rating,
      review_count: t.reviewCount,
      phone: t.phone,
      is_online: t.isOnline,
      active_orders: t.activeOrders,
      distance: t.distance,
      role_title: t.roleTitle || null,
      vehicle_plate: t.vehiclePlate || null,
      experience_years: t.experienceYears || null,
      domicile: t.domicile || null,
      custom_fee_percent: t.customFeePercent || null,
      custom_fee_enabled: t.customFeeEnabled || false,
      assigned_priority_areas: t.assignedPriorityAreas || [],
      is_priority_technician: t.isPriorityTechnician || false
    }));
    await supabase.from('technician_profiles').upsert(techRows);

    // 4. Seed Applicants
    const applicantRows = INITIAL_APPLICANTS.map(a => ({
      id: a.id,
      name: a.name,
      avatar: a.avatar || null,
      photo_url: a.photoUrl || a.avatar || null,
      phone: a.phone,
      email: a.email,
      domicile: a.domicile,
      experience_years: a.experienceYears,
      education: a.education,
      certifications: a.certifications,
      skills: a.skills,
      applied_date: a.appliedDate,
      status: a.status,
      notes: a.notes || null,
      expected_salary: a.expectedSalary || null,
      nik: a.nik || a.ktpNumber || null,
      ktp_number: a.ktpNumber || a.nik || null,
      ktp_image: a.ktpImage || null,
      birth_place: a.birthPlace || null,
      birth_date: a.birthDate || null,
      gender: a.gender || null,
      religion: a.religion || null,
      marital_status: a.maritalStatus || null,
      citizenship: a.citizenship || 'WNI',
      ktp_address: a.ktpAddress || null,
      rt_rw: a.rtRw || null,
      subdistrict_kecamatan: a.subdistrictKecamatan || null,
      city_kabupaten: a.cityKabupaten || null,
      postal_code: a.postalCode || null,
      is_domicile_same_as_ktp: a.isDomicileSameAsKtp ?? true,
      domicile_address: a.domicileAddress || null,
      emergency_contact: a.emergencyContact || null,
      emergency_contact_name: a.emergencyContactName || null,
      emergency_contact_relation: a.emergencyContactRelation || null,
      emergency_contact_phone: a.emergencyContactPhone || null
    }));
    await supabase.from('technician_applicants').upsert(applicantRows);

    // 5. Seed Admin Settings
    const settingRows = INITIAL_SETTINGS.map(s => ({
      id: s.id,
      key: s.key,
      value: s.value,
      category: s.category,
      description: s.description,
      last_updated: s.lastUpdated
    }));
    await supabase.from('admin_settings').upsert(settingRows);

    // 6. Seed Audit Logs
    await supabase.from('admin_audit_logs').upsert(INITIAL_LOGS);

    // 7. Seed Articles
    const articleRows = ARTICLES_DATA.map(art => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      category: art.category,
      category_color: art.categoryColor,
      status: 'published',
      read_time: art.readTime,
      date: art.date,
      author: art.author,
      image: art.image,
      badge: art.badge || null,
      summary: art.summary,
      content: art.content,
      tags: art.tags || [],
      views: Math.floor(120 + Math.random() * 450),
      featured: art.id === 'art-1'
    }));
    await supabase.from('articles').upsert(articleRows);

    return { 
      seeded: true, 
      message: 'Database Supabase berhasil diisi data inisial terpisah untuk Customer, Admin, Teknisi, dan CMS Artikel Blog.' 
    };
  } catch (err) {
    console.warn('Supabase initialization notice:', err);
    return { seeded: false, message: 'Supabase initialization operating in local/cached mode.' };
  }
}

/**
 * Mereset database backend ke data default bawaan (khusus admin / debug)
 */
export async function forceResetDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Re-seed all tables
    const customerRows = INITIAL_CUSTOMERS.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      default_address: c.defaultAddress,
      address_label: c.addressLabel,
      total_orders: c.totalOrders,
      points: c.points,
      joined_date: c.joinedDate,
      status: c.status
    }));
    await supabase.from('customer_profiles').upsert(customerRows);

    const orderRows = INITIAL_ORDERS.map(mapOrderToRow);
    await supabase.from('orders').upsert(orderRows);

    const techRows = TECHNICIANS.map(t => ({
      id: t.id,
      name: t.name,
      code: t.code || null,
      avatar: t.avatar,
      photo_url: t.photoUrl || t.avatar,
      email: t.email || null,
      rating: t.rating,
      review_count: t.reviewCount,
      phone: t.phone,
      is_online: t.isOnline,
      active_orders: t.activeOrders,
      distance: t.distance,
      role_title: t.roleTitle || null,
      vehicle_plate: t.vehiclePlate || null,
      experience_years: t.experienceYears || null,
      domicile: t.domicile || null,
      custom_fee_percent: t.customFeePercent || null,
      custom_fee_enabled: t.customFeeEnabled || false,
      assigned_priority_areas: t.assignedPriorityAreas || [],
      is_priority_technician: t.isPriorityTechnician || false
    }));
    await supabase.from('technician_profiles').upsert(techRows);

    return { success: true, message: 'Database Supabase berhasil direset ke konfigurasi awal.' };
  } catch (err) {
    console.error('Error resetting database in Supabase:', err);
    throw err;
  }
}
