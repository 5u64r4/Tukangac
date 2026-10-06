import { supabase } from '../lib/supabase';
import { CustomerRecord, Order } from '../types';

const CUSTOMERS_TABLE = 'customer_profiles';
const ORDERS_TABLE = 'orders';

// Helper mapper for customer record
function mapCustomerRow(row: any): CustomerRecord {
  return {
    id: row.id,
    name: row.name || row.full_name || '',
    phone: row.phone || '',
    email: row.email || '',
    defaultAddress: row.default_address || row.defaultAddress || '',
    addressLabel: row.address_label || row.addressLabel || 'Rumah',
    totalOrders: Number(row.total_orders ?? row.totalOrders ?? 0),
    points: Number(row.points ?? 0),
    joinedDate: row.joined_date || row.joinedDate || 'Baru',
    status: row.status || 'active'
  };
}

function mapCustomerToRow(customer: CustomerRecord): any {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email || null,
    default_address: customer.defaultAddress,
    address_label: customer.addressLabel,
    total_orders: customer.totalOrders,
    points: customer.points,
    joined_date: customer.joinedDate,
    status: customer.status,
    updated_at: new Date().toISOString()
  };
}

// Helper mapper for order record
export function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    customerId: row.customer_id || row.customerId || undefined,
    technicianId: row.technician_id || row.technicianId || undefined,
    customerName: row.customer_name || row.customerName || '',
    customerPhone: row.customer_phone || row.customerPhone || '',
    serviceName: row.service_name || row.serviceName || '',
    unitCount: Number(row.unit_count ?? row.unitCount ?? 1),
    complaint: row.complaint || '',
    addressLabel: row.address_label || row.addressLabel || 'Rumah',
    fullAddress: row.full_address || row.fullAddress || '',
    date: row.date || '',
    timeSlot: row.time_slot || row.timeSlot || '',
    totalPrice: Number(row.total_price ?? row.totalPrice ?? 0),
    status: row.status || 'baru',
    technicianName: row.technician_name || row.technicianName,
    technicianRating: row.technician_rating != null ? Number(row.technician_rating) : (row.technicianRating != null ? Number(row.technicianRating) : undefined),
    technicianDistance: row.technician_distance || row.technicianDistance,
    createdAt: row.created_at || row.createdAt || 'Baru saja',
    estimatedArrival: row.estimated_arrival || row.estimatedArrival,
    paymentMethod: row.payment_method || row.paymentMethod,
    paymentChannel: row.payment_channel || row.paymentChannel,
    paymentStatus: row.payment_status || row.paymentStatus,
    midtransSnapToken: row.midtrans_snap_token || row.midtransSnapToken,
    midtransRedirectUrl: row.midtrans_redirect_url || row.midtransRedirectUrl,
    midtransTransactionId: row.midtrans_transaction_id || row.midtransTransactionId,
    midtransPaymentType: row.midtrans_payment_type || row.midtransPaymentType,
    midtransPaidAt: row.midtrans_paid_at || row.midtransPaidAt,
    midtransVaNumber: row.midtrans_va_number || row.midtransVaNumber,
    midtransBank: row.midtrans_bank || row.midtransBank,
    midtransBillKey: row.midtrans_bill_key || row.midtransBillKey,
    midtransBillerCode: row.midtrans_biller_code || row.midtransBillerCode,
    invoiceNumber: row.invoice_number || row.invoiceNumber,
    invoiceIssuedAt: row.invoice_issued_at || row.invoiceIssuedAt
  };
}

export function mapOrderToRow(order: Order): any {
  return {
    id: order.id,
    customer_id: order.customerId || null,
    technician_id: order.technicianId || null,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    service_name: order.serviceName,
    unit_count: order.unitCount,
    complaint: order.complaint || '',
    address_label: order.addressLabel,
    full_address: order.fullAddress,
    date: order.date,
    time_slot: order.timeSlot,
    total_price: order.totalPrice,
    status: order.status,
    technician_name: order.technicianName || null,
    technician_rating: order.technicianRating || null,
    technician_distance: order.technicianDistance || null,
    estimated_arrival: order.estimatedArrival || null,
    created_at: order.createdAt,
    payment_method: order.paymentMethod || null,
    payment_channel: order.paymentChannel || null,
    payment_status: order.paymentStatus || null,
    midtrans_snap_token: order.midtransSnapToken || null,
    midtrans_redirect_url: order.midtransRedirectUrl || null,
    midtrans_transaction_id: order.midtransTransactionId || null,
    midtrans_payment_type: order.midtransPaymentType || null,
    midtrans_paid_at: order.midtransPaidAt || null,
    midtrans_va_number: order.midtransVaNumber || null,
    midtrans_bank: order.midtransBank || null,
    midtrans_bill_key: order.midtransBillKey || null,
    midtrans_biller_code: order.midtransBillerCode || null,
    invoice_number: order.invoiceNumber || null,
    invoice_issued_at: order.invoiceIssuedAt || null,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mendapatkan semua data customer terdaftar dari database Supabase
 */
export async function getAllCustomers(): Promise<CustomerRecord[]> {
  try {
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getAllCustomers error, using fallback:', error);
      return [];
    }

    return (data || []).map(mapCustomerRow);
  } catch (err) {
    console.error('Error fetching all customers from Supabase:', err);
    return [];
  }
}

/**
 * Mendapatkan profil data customer berdasarkan ID atau No Telepon
 */
export async function getCustomerById(customerId: string): Promise<CustomerRecord | null> {
  try {
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .eq('id', customerId)
      .single();

    if (error || !data) {
      return null;
    }

    return mapCustomerRow(data);
  } catch (err) {
    console.error(`Error fetching customer ${customerId}:`, err);
    return null;
  }
}

/**
 * Menyimpan / memperbarui profil customer di Supabase
 */
export async function saveCustomer(customer: CustomerRecord): Promise<void> {
  try {
    const row = mapCustomerToRow(customer);
    const { error } = await supabase
      .from(CUSTOMERS_TABLE)
      .upsert(row);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error(`Error saving customer ${customer.id}:`, err);
    throw err;
  }
}

/**
 * Mengambil daftar pesanan customer berdasarkan ID pengguna / nomor telepon
 */
export async function getOrdersForCustomer(userId?: string | null, phone?: string | null): Promise<Order[]> {
  try {
    if (!userId && !phone) return [];

    let query = supabase.from(ORDERS_TABLE).select('*');
    if (userId && phone) {
      query = query.or(`customer_id.eq.${userId},customer_phone.eq.${phone}`);
    } else if (userId) {
      query = query.eq('customer_id', userId);
    } else if (phone) {
      query = query.eq('customer_phone', phone);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders for customer:', error);
      return [];
    }

    return (data || []).map(mapOrderRow);
  } catch (err) {
    console.error('Error fetching orders for customer:', err);
    return [];
  }
}

/**
 * Mengambil daftar pesanan customer berdasarkan nomor telepon
 */
export async function getOrdersByCustomerPhone(phone: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders by phone:', error);
      return [];
    }

    return (data || []).map(mapOrderRow);
  } catch (err) {
    console.error(`Error fetching orders for customer ${phone}:`, err);
    return [];
  }
}

/**
 * Membuat pesanan service baru oleh customer di Supabase
 */
export async function createBookingOrder(orderData: Order): Promise<string> {
  try {
    const row = mapOrderToRow(orderData);
    const { error } = await supabase
      .from(ORDERS_TABLE)
      .insert(row);

    if (error) {
      throw error;
    }

    return orderData.id;
  } catch (err) {
    console.error('Error creating booking order in Supabase:', err);
    throw err;
  }
}

/**
 * Real-time listener pesanan untuk customer via Supabase Realtime
 */
export function subscribeCustomerOrders(
  userId?: string,
  phone?: string,
  callback?: (orders: Order[]) => void
): () => void {
  if (!callback) return () => {};

  if (!userId && !phone) {
    callback([]);
    return () => {};
  }

  // 1. Fetch initial orders
  getOrdersForCustomer(userId, phone).then(initialOrders => {
    callback(initialOrders);
  });

  // 2. Realtime subscription on orders table
  const channelKey = userId || phone || 'customer_orders';
  const channel = supabase
    .channel(`customer_orders_${channelKey}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ORDERS_TABLE
      },
      () => {
        // Refresh customer orders when table changes
        getOrdersForCustomer(userId, phone).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}

/**
 * Memperbarui status pembayaran pesanan di Supabase
 */
export async function updateOrderPayment(
  orderId: string, 
  paymentData: Partial<Order>
): Promise<void> {
  try {
    const updatePayload: any = {};
    if (paymentData.paymentStatus !== undefined) updatePayload.payment_status = paymentData.paymentStatus;
    if (paymentData.paymentMethod !== undefined) updatePayload.payment_method = paymentData.paymentMethod;
    if (paymentData.paymentChannel !== undefined) updatePayload.payment_channel = paymentData.paymentChannel;
    if (paymentData.midtransPaidAt !== undefined) updatePayload.midtrans_paid_at = paymentData.midtransPaidAt;
    if (paymentData.midtransTransactionId !== undefined) updatePayload.midtrans_transaction_id = paymentData.midtransTransactionId;
    if (paymentData.midtransVaNumber !== undefined) updatePayload.midtrans_va_number = paymentData.midtransVaNumber;
    if (paymentData.midtransBank !== undefined) updatePayload.midtrans_bank = paymentData.midtransBank;
    if (paymentData.midtransSnapToken !== undefined) updatePayload.midtrans_snap_token = paymentData.midtransSnapToken;
    if (paymentData.midtransRedirectUrl !== undefined) updatePayload.midtrans_redirect_url = paymentData.midtransRedirectUrl;
    if (paymentData.invoiceNumber !== undefined) updatePayload.invoice_number = paymentData.invoiceNumber;
    if (paymentData.invoiceIssuedAt !== undefined) updatePayload.invoice_issued_at = paymentData.invoiceIssuedAt;
    updatePayload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(ORDERS_TABLE)
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.warn(`Could not update order payment in Supabase for ${orderId}:`, error);
    }
  } catch (err) {
    console.warn(`Could not update order payment in Supabase for ${orderId}:`, err);
  }
}
