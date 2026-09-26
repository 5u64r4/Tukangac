export type UserRole = 'customer' | 'admin' | 'technician';

export type CustomerTab = 
  | 'home'
  | 'booking'
  | 'booking2'
  | 'booking3'
  | 'booking4'
  | 'success'
  | 'tracking'
  | 'orders'
  | 'profile';

export type TechnicianTab = 
  | 'beranda'
  | 'jadwal'
  | 'pendapatan'
  | 'pelamar'
  | 'profil';

export type AdminTab = 
  | 'orders'
  | 'technician_reports'
  | 'commission'
  | 'area_priority'
  | 'applicants'
  | 'articles';

export interface DetectedLocation {
  city: string; // e.g., 'Kota Bekasi', 'Jakarta Selatan', 'Kota Depok'
  district: string; // e.g., 'Bekasi Selatan', 'Kebayoran Baru', 'Margonda / Beji'
  neighborhood?: string; // e.g., 'Galaxy', 'Pekayon', 'Kemang Pratama'
  latitude?: number;
  longitude?: number;
  isGpsDetected?: boolean;
  detectedAt?: string;
  source?: 'gps' | 'address_input' | 'preset' | 'default';
}

export interface LiveSocialProofItem {
  id: number | string;
  name: string;
  city: string;
  district: string; // Kecamatan
  neighborhood: string; // Kelurahan / Area
  locationFormatted: string; // e.g. 'Galaxy, Bekasi Selatan, Kota Bekasi'
  service: string;
  units?: number;
  timeAgo: string;
  avatarBg: string;
  avatarText: string;
  tag?: string;
  rating?: number;
  estimatedDistanceKm?: number;
}

export interface TechnicianCustomFee {
  technicianId: string;
  technicianName: string;
  technicianAvatar?: string;
  customFeePercent: number; // e.g., 10% or 12% (overrides standard 20%)
  cuciAcFeePercent?: number;
  perbaikanAcFeePercent?: number;
  isiFreonFeePercent?: number;
  bongkarPasangFeePercent?: number;
  subsidyPerOrderNominal?: number; // e.g., Rp 10.000 bonus/order
  reasonCategory: 'top_performer' | 'senior_partner' | 'area_promoter' | 'specialist' | 'custom';
  notes?: string;
  isEnabled: boolean;
  effectiveDate?: string;
  updatedAt?: string;
}

export interface AreaPriorityRule {
  id: string;
  areaName: string; // e.g., 'Bekasi Selatan (Galaxy, Pekayon, Kemang Pratama)'
  city: string; // e.g., 'Kota Bekasi'
  district: string; // e.g., 'Bekasi Selatan'
  subdistricts?: string[]; // e.g., ['Galaxy', 'Pekayon', 'Kemang Pratama', 'Jaka Setia']
  primaryTechnicianId: string;
  primaryTechnicianName: string;
  primaryTechnicianPhone?: string;
  backupTechnicianId?: string;
  backupTechnicianName?: string;
  priorityLevel: 'exclusive' | 'preferred' | 'first_responder';
  autoAssignNewOrders: boolean;
  notes?: string;
  isActive: boolean;
  matchedOrdersCount?: number;
  updatedAt?: string;
}

export interface CrowdsourcingConfig {
  defaultFeePercent: number; // 10 - 30%
  cuciAcFeePercent: number; // 10 - 30%
  perbaikanAcFeePercent: number; // 10 - 30%
  isiFreonFeePercent: number; // 10 - 30%
  bongkarPasangFeePercent: number; // 10 - 30%
  autoDeductEnabled: boolean;
  instantEscrowEnabled: boolean;
  guaranteeReservePercent: number; // 0 - 5%
  insuranceFeeNominal: number;
  taxPph21Percent: number;
  technicianCustomFees?: TechnicianCustomFee[];
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceFormatted: string;
  unit: string;
  iconName: string;
  description: string;
  badge?: string;
  popular?: boolean;
}

export type OrderStatus = 
  | 'baru'
  | 'menuju'
  | 'service'
  | 'selesai'
  | 'batal';

export type PaymentMethod = 'midtrans' | 'cash' | 'transfer' | 'qris';
export type PaymentStatus = 'pending' | 'settlement' | 'paid' | 'expire' | 'cancel' | 'deny' | 'refund';
export type PaymentChannel = 
  | 'qris' 
  | 'gopay' 
  | 'shopeepay' 
  | 'bca_va' 
  | 'bni_va' 
  | 'bri_va' 
  | 'mandiri_va' 
  | 'permata_va' 
  | 'credit_card' 
  | 'cstore_indomaret' 
  | 'cstore_alfamart' 
  | 'cash';

export interface MidtransTransactionData {
  token?: string;
  redirectUrl?: string;
  transactionId?: string;
  orderId: string;
  grossAmount: number;
  paymentType?: string;
  transactionStatus?: string;
  fraudStatus?: string;
  transactionTime?: string;
  settlementTime?: string;
  vaNumber?: string;
  bank?: string;
  billKey?: string;
  billerCode?: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  unitCount: number;
  complaint?: string;
  addressLabel: string;
  fullAddress: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: OrderStatus;
  technicianName?: string;
  technicianRating?: number;
  technicianDistance?: string;
  createdAt: string;
  estimatedArrival?: string;
  // Midtrans Payment & Invoice Fields
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel | string;
  paymentStatus?: PaymentStatus;
  midtransSnapToken?: string;
  midtransRedirectUrl?: string;
  midtransTransactionId?: string;
  midtransPaymentType?: string;
  midtransPaidAt?: string;
  midtransVaNumber?: string;
  midtransBank?: string;
  midtransBillKey?: string;
  midtransBillerCode?: string;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
}

export interface Technician {
  id: string;
  name: string;
  code?: string;
  avatar: string;
  photoUrl?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  phone: string;
  isOnline: boolean;
  activeOrders: number;
  distance: string;
  roleTitle?: string;
  vehiclePlate?: string;
  experienceYears?: string;
  domicile?: string;
  customFeePercent?: number;
  customFeeEnabled?: boolean;
  assignedPriorityAreas?: string[];
  isPriorityTechnician?: boolean;
}

export type ApplicantStatus = 'pending' | 'diterima' | 'ditolak';

export interface EmergencyContact {
  name: string;
  relation: string; // Hubungan Keluarga: Orang Tua, Suami/Istri, Saudara Kandung, dll.
  phone: string;
}

export interface TechnicianApplicant {
  id: string;
  name: string;
  avatar?: string;
  photoUrl?: string; // V. Upload Foto Profil
  phone: string;
  email: string;
  domicile: string;
  experienceYears: string;
  education: string;
  certifications: string[];
  skills: string[];
  appliedDate: string;
  status: ApplicantStatus;
  notes?: string;
  expectedSalary?: string;

  // I. IDENTITAS DIRI
  nik?: string; // Nomor Induk Kependudukan (16 digit)
  ktpNumber?: string; // alias for nik
  ktpImage?: string; // * Upload KTP (data URL / image preview)
  birthPlace?: string; // Tempat Lahir
  birthDate?: string; // Tanggal Lahir
  gender?: 'Laki-laki' | 'Perempuan' | string;
  religion?: string; // Islam, Kristen Protestan, Katolik, Hindu, Buddha, Konghucu, Lainnya
  maritalStatus?: 'Belum Kawin' | 'Kawin' | 'Cerai' | string;
  citizenship?: string; // Kewarganegaraan: WNI / WNA

  // II. KONTAK DAN ALAMAT
  ktpAddress?: string; // Alamat KTP
  rtRw?: string; // RT / RW
  subdistrictKecamatan?: string; // Kelurahan / Kecamatan
  cityKabupaten?: string; // Kota / Kabupaten
  postalCode?: string; // Kode Pos
  isDomicileSameAsKtp?: boolean;
  domicileAddress?: string; // Alamat Domisili (Saat Ini jika berbeda dengan ktp)

  // IV. KONTAK DARURAT (Emergency Contact)
  emergencyContact?: EmergencyContact;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  defaultAddress: string;
  addressLabel: string;
  totalOrders: number;
  points: number;
  joinedDate: string;
  status: 'active' | 'vip' | 'inactive';
}

export interface AdminAuditLog {
  id: string;
  action: string;
  role: 'customer' | 'admin' | 'technician' | 'system';
  target: string;
  details: string;
  timestamp: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: string | number | boolean;
  category: 'pricing' | 'operational' | 'notification' | 'security';
  description: string;
  lastUpdated: string;
}

export type ArticleCategory = 'Tips & Hemat' | 'Perawatan AC' | 'Troubleshooting' | 'Standar Layanan';
export type ArticleStatus = 'published' | 'draft' | 'archived';

export interface ArticleContentSection {
  heading: string;
  body: string;
}

export interface ArticleFAQ {
  q: string;
  a: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  categoryColor?: {
    bg: string;
    text: string;
    border: string;
  };
  status?: ArticleStatus;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
  };
  image: string;
  badge?: string;
  summary: string;
  content: {
    intro: string;
    sections: ArticleContentSection[];
    proTip?: string;
    faqs?: ArticleFAQ[];
    conclusion: string;
  };
  tags: string[];
  views?: number;
  featured?: boolean;
  relatedServiceName?: string;
  relatedServicePrice?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ChatSenderRole = 'customer' | 'technician' | 'system';

export interface OrderChatMessage {
  id: string;
  orderId: string;
  senderRole: ChatSenderRole;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // e.g. "14:20"
  createdAt: string; // ISO String
  isRead?: boolean;
}


