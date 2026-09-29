import { supabase } from '../lib/supabase';
import { 
  Order, 
  OrderStatus, 
  TechnicianApplicant, 
  ApplicantStatus, 
  AdminAuditLog, 
  AdminSetting 
} from '../types';
import { mapOrderRow, mapOrderToRow } from './customerService';

const ORDERS_TABLE = 'orders';
const APPLICANTS_TABLE = 'technician_applicants';
const AUDIT_LOGS_TABLE = 'admin_audit_logs';
const SETTINGS_TABLE = 'admin_settings';

// Helper for mapping applicant row to TypeScript model
function mapApplicantRow(row: any): TechnicianApplicant {
  return {
    id: row.id,
    name: row.name || '',
    avatar: row.avatar || '',
    photoUrl: row.photo_url || row.photoUrl || row.avatar || '',
    phone: row.phone || '',
    email: row.email || '',
    domicile: row.domicile || '',
    experienceYears: row.experience_years || row.experienceYears || '3 tahun',
    education: row.education || 'SMK Teknik Pendingin & Tata Udara',
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    appliedDate: row.applied_date || row.appliedDate || 'Baru',
    status: (row.status || 'pending') as ApplicantStatus,
    notes: row.notes || '',
    expectedSalary: row.expected_salary || row.expectedSalary || '',

    // I. IDENTITAS DIRI
    nik: row.nik || row.ktp_number || row.ktpNumber || '',
    ktpNumber: row.ktp_number || row.ktpNumber || row.nik || '',
    ktpImage: row.ktp_image || row.ktpImage || '',
    birthPlace: row.birth_place || row.birthPlace || '',
    birthDate: row.birth_date || row.birthDate || '',
    gender: row.gender || 'Laki-laki',
    religion: row.religion || 'Islam',
    maritalStatus: row.marital_status || row.maritalStatus || 'Belum Kawin',
    citizenship: row.citizenship || 'WNI',

    // II. KONTAK DAN ALAMAT
    ktpAddress: row.ktp_address || row.ktpAddress || '',
    rtRw: row.rt_rw || row.rtRw || '',
    subdistrictKecamatan: row.subdistrict_kecamatan || row.subdistrictKecamatan || '',
    cityKabupaten: row.city_kabupaten || row.cityKabupaten || '',
    postalCode: row.postal_code || row.postalCode || '',
    isDomicileSameAsKtp: row.is_domicile_same_as_ktp ?? row.isDomicileSameAsKtp ?? true,
    domicileAddress: row.domicile_address || row.domicileAddress || '',

    // IV. KONTAK DARURAT
    emergencyContact: row.emergency_contact || row.emergencyContact,
    emergencyContactName: row.emergency_contact_name || row.emergencyContactName || (row.emergency_contact?.name || ''),
    emergencyContactRelation: row.emergency_contact_relation || row.emergencyContactRelation || (row.emergency_contact?.relation || ''),
    emergencyContactPhone: row.emergency_contact_phone || row.emergencyContactPhone || (row.emergency_contact?.phone || '')
  };
}

function mapApplicantToRow(app: TechnicianApplicant): any {
  return {
    id: app.id,
    name: app.name,
    avatar: app.avatar || null,
    photo_url: app.photoUrl || app.avatar || null,
    phone: app.phone,
    email: app.email,
    domicile: app.domicile,
    experience_years: app.experienceYears,
    education: app.education,
    certifications: app.certifications,
    skills: app.skills,
    applied_date: app.appliedDate,
    status: app.status,
    notes: app.notes || null,
    expected_salary: app.expectedSalary || null,
    
    // I. IDENTITAS DIRI
    nik: app.nik || app.ktpNumber || null,
    ktp_number: app.ktpNumber || app.nik || null,
    ktp_image: app.ktpImage || null,
    birth_place: app.birthPlace || null,
    birth_date: app.birthDate || null,
    gender: app.gender || null,
    religion: app.religion || null,
    marital_status: app.maritalStatus || null,
    citizenship: app.citizenship || 'WNI',

    // II. KONTAK DAN ALAMAT
    ktp_address: app.ktpAddress || null,
    rt_rw: app.rtRw || null,
    subdistrict_kecamatan: app.subdistrictKecamatan || null,
    city_kabupaten: app.cityKabupaten || null,
    postal_code: app.postalCode || null,
    is_domicile_same_as_ktp: app.isDomicileSameAsKtp ?? true,
    domicile_address: app.domicileAddress || null,

    // IV. KONTAK DARURAT
    emergency_contact: app.emergencyContact || null,
    emergency_contact_name: app.emergencyContactName || app.emergencyContact?.name || null,
    emergency_contact_relation: app.emergencyContactRelation || app.emergencyContact?.relation || null,
    emergency_contact_phone: app.emergencyContactPhone || app.emergencyContact?.phone || null,

    updated_at: new Date().toISOString()
  };
}

/**
 * Mengambil semua pesanan dalam sistem untuk admin dari Supabase
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getAllOrders error:', error);
      return [];
    }

    return (data || []).map(mapOrderRow);
  } catch (err) {
    console.error('Error fetching all orders for admin:', err);
    return [];
  }
}

/**
 * Memperbarui status pesanan oleh admin
 */
export async function updateAdminOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  technicianName?: string
): Promise<void> {
  try {
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString()
    };
    if (technicianName) {
      updatePayload.technician_name = technicianName;
    }

    const { error } = await supabase
      .from(ORDERS_TABLE)
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      throw error;
    }
    
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
    const { data, error } = await supabase
      .from(APPLICANTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching applicants:', error);
      return [];
    }

    return (data || []).map(mapApplicantRow);
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
    const row = mapApplicantToRow(applicant);
    const { error } = await supabase
      .from(APPLICANTS_TABLE)
      .upsert(row);

    if (error) {
      throw error;
    }

    await logAuditEvent('ADD_APPLICANT', 'admin', `Applicant: ${applicant.name}`, `Pelamar baru ditambahkan (${applicant.id})`);
  } catch (err) {
    console.error('Error saving applicant in Supabase:', err);
    throw err;
  }
}

/**
 * Memperbarui status pelamar teknisi (pending, diterima, ditolak)
 */
export async function updateApplicantStatus(applicantId: string, status: ApplicantStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from(APPLICANTS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicantId);

    if (error) {
      throw error;
    }

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
    const { error } = await supabase
      .from(APPLICANTS_TABLE)
      .delete()
      .eq('id', applicantId);

    if (error) {
      throw error;
    }

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
    const { data, error } = await supabase
      .from(AUDIT_LOGS_TABLE)
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('Error fetching audit logs:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      action: row.action,
      role: row.role,
      target: row.target,
      details: row.details,
      timestamp: row.timestamp || new Date().toISOString()
    }));
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}

/**
 * Mencatat aktivitas audit di database admin Supabase
 */
export async function logAuditEvent(
  action: string, 
  role: 'customer' | 'admin' | 'technician' | 'system', 
  target: string, 
  details: string
): Promise<void> {
  try {
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const logData = {
      id: logId,
      action,
      role,
      target,
      details,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from(AUDIT_LOGS_TABLE)
      .insert(logData);

    if (error) {
      console.warn('Could not write audit log to Supabase:', error);
    }
  } catch (err) {
    console.warn('Could not write audit log to database:', err);
  }
}

/**
 * Mengambil pengaturan sistem operasional admin
 */
export async function getAdminSettings(): Promise<AdminSetting[]> {
  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*');

    if (error) {
      console.warn('Error fetching admin settings:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      key: row.key,
      value: row.value,
      category: row.category,
      description: row.description || '',
      lastUpdated: row.last_updated || 'Terbaru'
    }));
  } catch (err) {
    console.error('Error fetching admin settings:', err);
    return [];
  }
}

/**
 * Real-time listener untuk semua pesanan admin via Supabase Realtime
 */
export function subscribeAdminOrders(callback: (orders: Order[]) => void): () => void {
  // 1. Initial fetch
  getAllOrders().then(callback);

  // 2. Realtime subscription
  const channel = supabase
    .channel('admin_orders_all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ORDERS_TABLE
      },
      () => {
        getAllOrders().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}

/**
 * Real-time listener untuk log audit admin via Supabase Realtime
 */
export function subscribeAuditLogs(callback: (logs: AdminAuditLog[]) => void): () => void {
  getAuditLogs().then(callback);

  const channel = supabase
    .channel('admin_audit_logs_realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: AUDIT_LOGS_TABLE
      },
      () => {
        getAuditLogs().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}
