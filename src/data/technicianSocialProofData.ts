import { ApplicantStatus } from '../types';

export interface LiveTechnicianSocialProofItem {
  id: string;
  type: 'applicant_applied' | 'applicant_accepted' | 'payout_success' | 'bonus_earned' | 'certification_verified' | 'priority_assigned';
  name: string;
  city: string;
  district: string;
  timeAgo: string;
  avatarBg: string;
  avatarText: string;
  headline: string;
  description: string;
  amountFormatted?: string;
  highlightBadge: string;
  experience?: string;
  rating?: number;
}

export interface TechnicianTestimonial {
  id: string;
  name: string;
  role: string;
  area: string;
  photoUrl: string;
  rating: number;
  completedOrdersCount: number;
  monthlyIncomeFormatted: string;
  incomeGrowth: string;
  joinedYear: string;
  quote: string;
  specialization: string;
  verifiedBnsp: boolean;
}

export const TECHNICIAN_SOCIAL_PROOF_DATABASE: LiveTechnicianSocialProofItem[] = [
  {
    id: 'tsp-1',
    type: 'applicant_accepted',
    name: 'Hendra Gunawan',
    city: 'Kota Bekasi',
    district: 'Bekasi Barat',
    timeAgo: 'Baru saja (1 mnt lalu)',
    avatarBg: 'bg-emerald-600',
    avatarText: 'HG',
    headline: 'Pelamar Diterima & Aktif',
    description: 'Lolos verifikasi teknisi level 3 & sertifikasi BNSP. Wilayah penugasan Bekasi Barat.',
    highlightBadge: '✓ Resmi Jadi Mitra',
    experience: '5 Tahun Pengalaman',
    rating: 5.0
  },
  {
    id: 'tsp-2',
    type: 'payout_success',
    name: 'Andi Pratama',
    city: 'Kota Bekasi',
    district: 'Bekasi Selatan',
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-sky-600',
    avatarText: 'AP',
    headline: 'Pencairan Komisi Instan',
    description: 'Tarik saldo komisi bersih ke Rekening BCA ****4421 berhasil dalam 2 menit.',
    amountFormatted: 'Rp1.250.000',
    highlightBadge: '⚡ Cair Real-Time',
    experience: 'Level 3 Master'
  },
  {
    id: 'tsp-3',
    type: 'applicant_applied',
    name: 'Bambang Sutrisno',
    city: 'Kota Depok',
    district: 'Margonda / Beji',
    timeAgo: '5 menit lalu',
    avatarBg: 'bg-indigo-600',
    avatarText: 'BS',
    headline: 'Pendaftaran Pelamar Baru',
    description: 'Mengajukan kemitraan teknisi spesialis AC Inverter & VRV. Sedang review berkas.',
    highlightBadge: '📋 Dokumen Lengkap',
    experience: '4 Tahun Pengalaman'
  },
  {
    id: 'tsp-4',
    type: 'bonus_earned',
    name: 'Dedi Kurniawan',
    city: 'Kota Bekasi',
    district: 'Rawalumbu',
    timeAgo: '7 menit lalu',
    avatarBg: 'bg-amber-600',
    avatarText: 'DK',
    headline: 'Bonus Kinerja Bintang 5',
    description: 'Meraih insentif mingguan 20 order selesai tanpa komplain pelanggan bintang 5.',
    amountFormatted: 'Rp350.000',
    highlightBadge: '🏆 Insentif Bintang 5',
    rating: 4.95
  },
  {
    id: 'tsp-5',
    type: 'priority_assigned',
    name: 'Rizal Fahmi',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    timeAgo: '9 menit lalu',
    avatarBg: 'bg-teal-600',
    avatarText: 'RF',
    headline: 'Mitra Prioritas Area',
    description: 'Mendapatkan hak prioritas order exclusive untuk distrik Gandaria & Kebayoran Baru.',
    highlightBadge: '⭐ Order Prioritas',
    experience: '6 Tahun Pengalaman'
  },
  {
    id: 'tsp-6',
    type: 'applicant_accepted',
    name: 'Fajar Ramadhan',
    city: 'Jakarta Timur',
    district: 'Duren Sawit',
    timeAgo: '12 menit lalu',
    avatarBg: 'bg-emerald-600',
    avatarText: 'FR',
    headline: 'Pelamar Lolos Onboarding',
    description: 'Selesai pelatihan SOP SOP K3 & siap melayani customer AC Care di Jakarta Timur.',
    highlightBadge: '✓ Siaga 24 Jam',
    experience: '3 Tahun Pengalaman'
  },
  {
    id: 'tsp-7',
    type: 'payout_success',
    name: 'Agus Setiawan',
    city: 'Tangerang Selatan',
    district: 'BSD Serpong',
    timeAgo: '15 menit lalu',
    avatarBg: 'bg-sky-600',
    avatarText: 'AS',
    headline: 'Pencairan Komisi Harian',
    description: 'Transfer otomatis saldo komisi 4 order cuci AC ke Bank Mandiri berhasil.',
    amountFormatted: 'Rp640.000',
    highlightBadge: '⚡ Bebas Biaya Admin'
  },
  {
    id: 'tsp-8',
    type: 'certification_verified',
    name: 'Wahyu Hidayat',
    city: 'Kota Depok',
    district: 'Cinere',
    timeAgo: '18 menit lalu',
    avatarBg: 'bg-violet-600',
    avatarText: 'WH',
    headline: 'Sertifikasi BNSP Terverifikasi',
    description: 'Sertifikasi BNSP Teknisi Tata Udara Level 2 terbit & profil mitra naik level.',
    highlightBadge: '🛡️ BNSP Terverifikasi'
  },
  {
    id: 'tsp-9',
    type: 'applicant_applied',
    name: 'Eko Prasetyo',
    city: 'Kota Bekasi',
    district: 'Mustika Jaya',
    timeAgo: '22 menit lalu',
    avatarBg: 'bg-rose-600',
    avatarText: 'EP',
    headline: 'Pendaftaran Mitra Baru',
    description: 'Mendaftar via jalur rekomendasi mitra. Memiliki sertifikat Daikin Pro Installer.',
    highlightBadge: '📋 Portofolio AC Daikin',
    experience: '7 Tahun Pengalaman'
  }
];

export const TECHNICIAN_TESTIMONIALS: TechnicianTestimonial[] = [
  {
    id: 'testi-1',
    name: 'Andi Pratama',
    role: 'Mitra Master Teknisi (Bergabung 2021)',
    area: 'Bekasi Selatan & Sekitarnya',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=320&q=80',
    rating: 4.95,
    completedOrdersCount: 620,
    monthlyIncomeFormatted: 'Rp11.800.000 / bln',
    incomeGrowth: '+180% vs Bengkel Biasa',
    joinedYear: '2021',
    quote: 'Dulu cari order keliling sepi, kadang dibayar telat. Di AC Care order masuk otomatis sesuai radius rumah, komisi transparan bisa langsung ditarik ke BCA hari itu juga!',
    specialization: 'Troubleshooting PCB Inverter & Pasang VRV',
    verifiedBnsp: true
  },
  {
    id: 'testi-2',
    name: 'Dedi Kurniawan',
    role: 'Mitra Senior (Bergabung 2023)',
    area: 'Bekasi Timur & Tambun',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80',
    rating: 4.88,
    completedOrdersCount: 410,
    monthlyIncomeFormatted: 'Rp9.400.000 / bln',
    incomeGrowth: '+140% Pendapatan Bersih',
    joinedYear: '2023',
    quote: 'Sistemnya adil banget, potongan platform jelas dan ada insentif bonus kalau dapat bintang 5 beruntun. CS adminnya juga selalu sigap bantu kalau ada kendala di lapangan.',
    specialization: 'Cuci Presisi Steam Jet & Isi Freon R32/R410A',
    verifiedBnsp: true
  },
  {
    id: 'testi-3',
    name: 'Rizal Fahmi',
    role: 'Spesialis AC Komersial (Bergabung 2022)',
    area: 'Jakarta Selatan & Depok',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    rating: 4.92,
    completedOrdersCount: 530,
    monthlyIncomeFormatted: 'Rp13.200.000 / bln',
    incomeGrowth: 'Prioritas Order Wilayah',
    joinedYear: '2022',
    quote: 'Dengan fitur Order Prioritas Wilayah, saya fokus di area Kebayoran dan Gandaria tanpa buang bensin jauh-jauh. Dalam sebulan rata-rata pegang 40-50 unit AC gedung & perumahan.',
    specialization: 'Bongkar Pasang Split Duct & Central',
    verifiedBnsp: true
  }
];

export const PARTNER_BENEFITS = [
  {
    title: 'Order Harian Melimpah',
    desc: 'Algoritma cerdas mencocokkan pesanan customer terdekat dengan lokasi domisili Anda secara real-time.'
  },
  {
    title: 'Pencairan Komisi Instan 24 Jam',
    desc: 'Tarik penghasilan kapan saja ke semua rekening bank dan e-wallet tanpa biaya admin tersembunyi.'
  },
  {
    title: 'Bagi Hasil Transparan 80%–90%',
    desc: 'Potongan platform terendah di kelasnya mulai 10%–20%, hak bersih mitra dijamin aman dan jelas.'
  },
  {
    title: 'Sponsorship Sertifikasi BNSP',
    desc: 'Pelatihan rutin SOP kerja berstandar industri dan bantuan uji sertifikasi profesi resmi BNSP.'
  }
];
