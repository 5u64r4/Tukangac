import { supabase } from '../lib/supabase';
import { Technician, Order, OrderStatus } from '../types';
import { mapOrderRow } from './customerService';

const TECHNICIANS_TABLE = 'technician_profiles';
const ORDERS_TABLE = 'orders';

function mapTechnicianRow(row: any): Technician {
  return {
    id: row.id,
    name: row.name || '',
    code: row.code || '',
    avatar: row.avatar || row.photo_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80',
    photoUrl: row.photo_url || row.photoUrl || row.avatar,
    email: row.email || '',
    rating: Number(row.rating ?? 4.9),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    phone: row.phone || '',
    isOnline: Boolean(row.is_online ?? row.isOnline ?? true),
    activeOrders: Number(row.active_orders ?? row.activeOrders ?? 0),
    distance: row.distance || '1.2 km',
    roleTitle: row.role_title || row.roleTitle || 'Teknisi Senior',
    vehiclePlate: row.vehicle_plate || row.vehiclePlate || 'B 4123 KBC',
    experienceYears: row.experience_years || row.experienceYears || '5+ tahun',
    domicile: row.domicile || 'Bekasi Selatan',
    customFeePercent: row.custom_fee_percent != null ? Number(row.custom_fee_percent) : undefined,
    customFeeEnabled: Boolean(row.custom_fee_enabled ?? false),
    assignedPriorityAreas: Array.isArray(row.assigned_priority_areas) ? row.assigned_priority_areas : [],
    isPriorityTechnician: Boolean(row.is_priority_technician ?? false)
  };
}

function mapTechnicianToRow(tech: Technician): any {
  return {
    id: tech.id,
    name: tech.name,
    code: tech.code || null,
    avatar: tech.avatar,
    photo_url: tech.photoUrl || tech.avatar,
    email: tech.email || null,
    rating: tech.rating,
    review_count: tech.reviewCount,
    phone: tech.phone,
    is_online: tech.isOnline,
    active_orders: tech.activeOrders,
    distance: tech.distance,
    role_title: tech.roleTitle || null,
    vehicle_plate: tech.vehiclePlate || null,
    experience_years: tech.experienceYears || null,
    domicile: tech.domicile || null,
    custom_fee_percent: tech.customFeePercent || null,
    custom_fee_enabled: tech.customFeeEnabled || false,
    assigned_priority_areas: tech.assignedPriorityAreas || [],
    is_priority_technician: tech.isPriorityTechnician || false,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mengambil semua data teknisi aktif & status online dari Supabase
 */
export async function getAllTechnicians(): Promise<Technician[]> {
  try {
    const { data, error } = await supabase
      .from(TECHNICIANS_TABLE)
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.warn('Supabase getAllTechnicians notice:', error);
      return [];
    }

    return (data || []).map(mapTechnicianRow);
  } catch (err) {
    console.error('Error fetching technicians from Supabase:', err);
    return [];
  }
}

/**
 * Mengambil data teknisi spesifik berdasarkan ID
 */
export async function getTechnicianById(techId: string): Promise<Technician | null> {
  try {
    const { data, error } = await supabase
      .from(TECHNICIANS_TABLE)
      .select('*')
      .eq('id', techId)
      .single();

    if (error || !data) {
      return null;
    }

    return mapTechnicianRow(data);
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
    const { error } = await supabase
      .from(TECHNICIANS_TABLE)
      .update({ is_online: isOnline, updated_at: new Date().toISOString() })
      .eq('id', techId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error(`Error updating online status for ${techId}:`, err);
    throw err;
  }
}

/**
 * Mengambil daftar tugas service yang ditugaskan ke teknisi tertentu (berdasarkan ID dan/atau Nama)
 */
export async function getOrdersForTechnician(technicianIdOrName: string, technicianName?: string): Promise<Order[]> {
  try {
    if (!technicianIdOrName && !technicianName) return [];

    let query = supabase.from(ORDERS_TABLE).select('*');
    if (technicianIdOrName && technicianName) {
      query = query.or(`technician_id.eq.${technicianIdOrName},technician_name.eq.${technicianName}`);
    } else if (technicianIdOrName) {
      query = query.or(`technician_id.eq.${technicianIdOrName},technician_name.eq.${technicianIdOrName}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders for technician:', error);
      return [];
    }

    return (data || []).map(mapOrderRow);
  } catch (err) {
    console.error(`Error fetching orders for technician:`, err);
    return [];
  }
}

/**
 * Real-time listener pesanan khusus teknisi yang ditugaskan
 */
export function subscribeTechnicianOrders(
  technicianId: string,
  technicianName: string,
  callback: (orders: Order[]) => void
): () => void {
  getOrdersForTechnician(technicianId, technicianName).then(callback);

  const channel = supabase
    .channel(`technician_orders_${technicianId || technicianName}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ORDERS_TABLE
      },
      () => {
        getOrdersForTechnician(technicianId, technicianName).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}

/**
 * Memperbarui status pengerjaan pesanan oleh teknisi (menuju, service, selesai)
 */
export async function updateTechnicianOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from(ORDERS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error(`Error updating order ${orderId} by technician:`, err);
    throw err;
  }
}

/**
 * Real-time listener untuk daftar teknisi via Supabase Realtime
 */
export function subscribeTechnicians(callback: (techs: Technician[]) => void): () => void {
  getAllTechnicians().then(callback);

  const channel = supabase
    .channel('technicians_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TECHNICIANS_TABLE
      },
      () => {
        getAllTechnicians().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}
