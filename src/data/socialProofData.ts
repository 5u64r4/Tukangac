import { LiveSocialProofItem, DetectedLocation } from '../types';

export const SOCIAL_PROOF_DATABASE: LiveSocialProofItem[] = [
  // ==================== KOTA BEKASI ====================
  // Kecamatan: Bekasi Selatan
  {
    id: 'bks-sel-1',
    name: 'Ibu Ratna Dewi',
    city: 'Kota Bekasi',
    district: 'Bekasi Selatan',
    neighborhood: 'Galaxy',
    locationFormatted: 'Grand Galaxy City, Bekasi Selatan',
    service: 'Service AC + Tambah Freon R32',
    units: 2,
    timeAgo: 'Baru saja (30 dtk)',
    avatarBg: 'bg-sky-500',
    avatarText: 'RD',
    tag: 'Teknisi Menuju Lokasi',
    rating: 5,
    estimatedDistanceKm: 0.8
  },
  {
    id: 'bks-sel-2',
    name: 'Bpk. Hendra Wijaya',
    city: 'Kota Bekasi',
    district: 'Bekasi Selatan',
    neighborhood: 'Pekayon Jaya',
    locationFormatted: 'Pekayon Jaya, Bekasi Selatan',
    service: 'Cuci AC Inverter 1 PK',
    units: 3,
    timeAgo: '2 menit lalu',
    avatarBg: 'bg-emerald-500',
    avatarText: 'HW',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.2
  },
  {
    id: 'bks-sel-3',
    name: 'dr. Sarah Amelia',
    city: 'Kota Bekasi',
    district: 'Bekasi Selatan',
    neighborhood: 'Kemang Pratama',
    locationFormatted: 'Kemang Pratama 2, Bekasi Selatan',
    service: 'Perbaikan AC Netes Bocor Air',
    units: 1,
    timeAgo: '4 menit lalu',
    avatarBg: 'bg-indigo-500',
    avatarText: 'SA',
    tag: 'Order Selesai',
    rating: 5,
    estimatedDistanceKm: 1.5
  },
  {
    id: 'bks-sel-4',
    name: 'Bpk. Ridwan Hakim',
    city: 'Kota Bekasi',
    district: 'Bekasi Selatan',
    neighborhood: 'Kayuringin Jaya',
    locationFormatted: 'Kayuringin Jaya, Bekasi Selatan',
    service: 'Bongkar Pasang AC Split',
    units: 1,
    timeAgo: '6 menit lalu',
    avatarBg: 'bg-amber-500',
    avatarText: 'RH',
    tag: 'Teknisi Bersertifikat',
    rating: 5,
    estimatedDistanceKm: 1.9
  },
  {
    id: 'bks-sel-5',
    name: 'Ibu Maya Santoso',
    city: 'Kota Bekasi',
    district: 'Bekasi Selatan',
    neighborhood: 'Jaka Setia',
    locationFormatted: 'Boulevard Jaka Setia, Bekasi Selatan',
    service: 'Cuci AC & Disinfeksi Evaporator',
    units: 4,
    timeAgo: '8 menit lalu',
    avatarBg: 'bg-rose-500',
    avatarText: 'MS',
    tag: 'Promo Diskon Sesi Malam',
    rating: 5,
    estimatedDistanceKm: 1.1
  },

  // Kecamatan: Bekasi Timur
  {
    id: 'bks-tim-1',
    name: 'Bpk. Dimas Nugroho',
    city: 'Kota Bekasi',
    district: 'Bekasi Timur',
    neighborhood: 'Grand Wisata',
    locationFormatted: 'Grand Wisata, Bekasi Timur',
    service: 'Bongkar Pasang AC Split 1 PK',
    units: 2,
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-teal-500',
    avatarText: 'DN',
    tag: 'Promo Diskon',
    rating: 5,
    estimatedDistanceKm: 1.4
  },
  {
    id: 'bks-tim-2',
    name: 'Ibu Kartika Putri',
    city: 'Kota Bekasi',
    district: 'Bekasi Timur',
    neighborhood: 'Aren Jaya',
    locationFormatted: 'Aren Jaya, Bekasi Timur',
    service: 'Isi Freon R410A & Cek Tekanan',
    units: 1,
    timeAgo: '7 menit lalu',
    avatarBg: 'bg-blue-600',
    avatarText: 'KP',
    tag: 'Teknisi Menuju Lokasi',
    rating: 5,
    estimatedDistanceKm: 1.7
  },
  {
    id: 'bks-tim-3',
    name: 'Bpk. Tri Wahyudi',
    city: 'Kota Bekasi',
    district: 'Bekasi Timur',
    neighborhood: 'Duren Jaya',
    locationFormatted: 'Duren Jaya, Bekasi Timur',
    service: 'Cuci AC Jet Clean',
    units: 3,
    timeAgo: '11 menit lalu',
    avatarBg: 'bg-cyan-600',
    avatarText: 'TW',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 2.1
  },

  // Kecamatan: Bekasi Barat
  {
    id: 'bks-bar-1',
    name: 'Bpk. Fajar Ramadhan',
    city: 'Kota Bekasi',
    district: 'Bekasi Barat',
    neighborhood: 'Kranji',
    locationFormatted: 'Kranji, Bekasi Barat',
    service: 'Cuci AC Hemat',
    units: 2,
    timeAgo: '4 menit lalu',
    avatarBg: 'bg-violet-600',
    avatarText: 'FR',
    tag: 'Order Terkonfirmasi',
    rating: 5,
    estimatedDistanceKm: 1.3
  },
  {
    id: 'bks-bar-2',
    name: 'Ibu Cindy Claudia',
    city: 'Kota Bekasi',
    district: 'Bekasi Barat',
    neighborhood: 'Bintara Jaya',
    locationFormatted: 'Bintara Jaya, Bekasi Barat',
    service: 'Perbaikan Kompresor Berisik',
    units: 1,
    timeAgo: '9 menit lalu',
    avatarBg: 'bg-pink-600',
    avatarText: 'CC',
    tag: 'Teknisi Sedang Service',
    rating: 5,
    estimatedDistanceKm: 1.8
  },

  // Kecamatan: Bekasi Utara
  {
    id: 'bks-ut-1',
    name: 'Bpk. Danang Prasetyo',
    city: 'Kota Bekasi',
    district: 'Bekasi Utara',
    neighborhood: 'Summarecon Bekasi',
    locationFormatted: 'Summarecon Crown Gading, Bekasi Utara',
    service: 'Cuci AC Inverter + Vakum',
    units: 3,
    timeAgo: '2 menit lalu',
    avatarBg: 'bg-emerald-600',
    avatarText: 'DP',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 0.9
  },
  {
    id: 'bks-ut-2',
    name: 'Ibu Nurlaila',
    city: 'Kota Bekasi',
    district: 'Bekasi Utara',
    neighborhood: 'Harapan Baru',
    locationFormatted: 'Harapan Baru Regency, Bekasi Utara',
    service: 'Service AC Tidak Dingin',
    units: 1,
    timeAgo: '6 menit lalu',
    avatarBg: 'bg-sky-600',
    avatarText: 'NL',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.6
  },

  // Kecamatan: Pondok Gede
  {
    id: 'bks-pg-1',
    name: 'Bpk. Kevin Siregar',
    city: 'Kota Bekasi',
    district: 'Pondok Gede',
    neighborhood: 'Jatiwaringin',
    locationFormatted: 'Jatiwaringin Asri, Pondok Gede',
    service: 'Cuci AC & Tambah Freon R32',
    units: 2,
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-orange-500',
    avatarText: 'KS',
    tag: 'Bayar via Midtrans QRIS',
    rating: 5,
    estimatedDistanceKm: 1.1
  },

  // ==================== JAKARTA SELATAN ====================
  // Kecamatan: Kebayoran Baru
  {
    id: 'jkt-sel-1',
    name: 'Bpk. Ahmad Fauzi',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    neighborhood: 'Senopati',
    locationFormatted: 'Jl. Senopati Raya, Kebayoran Baru',
    service: 'Cuci AC Cassette & Split',
    units: 4,
    timeAgo: 'Baru saja',
    avatarBg: 'bg-blue-600',
    avatarText: 'AF',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 0.7
  },
  {
    id: 'jkt-sel-2',
    name: 'Ibu Dian Sastro',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    neighborhood: 'Gandaria',
    locationFormatted: 'Gandaria Utara, Kebayoran Baru',
    service: 'Cuci AC Inverter Premium',
    units: 2,
    timeAgo: '2 menit lalu',
    avatarBg: 'bg-emerald-600',
    avatarText: 'DS',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.2
  },
  {
    id: 'jkt-sel-3',
    name: 'Bpk. William Tan',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    neighborhood: 'Melawai',
    locationFormatted: 'Kawasan Melawai, Kebayoran Baru',
    service: 'Perbaikan PCB Modul AC',
    units: 1,
    timeAgo: '5 menit lalu',
    avatarBg: 'bg-purple-600',
    avatarText: 'WT',
    tag: 'Teknisi Ahli Elektronik',
    rating: 5,
    estimatedDistanceKm: 1.5
  },

  // Kecamatan: Cilandak
  {
    id: 'jkt-cil-1',
    name: 'dr. Kevin Pratama',
    city: 'Jakarta Selatan',
    district: 'Cilandak',
    neighborhood: 'Fatmawati',
    locationFormatted: 'Fatmawati Raya, Cilandak',
    service: 'Cuci AC & Perawatan Rutin',
    units: 3,
    timeAgo: '1 menit lalu',
    avatarBg: 'bg-indigo-500',
    avatarText: 'KP',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 0.9
  },
  {
    id: 'jkt-cil-2',
    name: 'Ibu Michelle Wijaya',
    city: 'Jakarta Selatan',
    district: 'Cilandak',
    neighborhood: 'Lebak Bulus',
    locationFormatted: 'Lebak Bulus Regency, Cilandak',
    service: 'Isi Freon R32 Ramah Lingkungan',
    units: 2,
    timeAgo: '4 menit lalu',
    avatarBg: 'bg-teal-600',
    avatarText: 'MW',
    tag: 'Order Selesai',
    rating: 5,
    estimatedDistanceKm: 1.4
  },

  // Kecamatan: Kebayoran Lama / Pondok Indah
  {
    id: 'jkt-kl-1',
    name: 'Bpk. Robert Gunawan',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Lama',
    neighborhood: 'Pondok Indah',
    locationFormatted: 'Bukit Golf Pondok Indah, Kebayoran Lama',
    service: 'Cuci AC Multi-Split 5 Unit',
    units: 5,
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-amber-600',
    avatarText: 'RG',
    tag: 'VIP Client Service',
    rating: 5,
    estimatedDistanceKm: 1.0
  },

  // Kecamatan: Tebet
  {
    id: 'jkt-teb-1',
    name: 'Ibu Annisa Rahma',
    city: 'Jakarta Selatan',
    district: 'Tebet',
    neighborhood: 'Tebet Barat',
    locationFormatted: 'Tebet Barat Dalam, Tebet',
    service: 'Cuci AC + Tambah Freon',
    units: 2,
    timeAgo: '5 menit lalu',
    avatarBg: 'bg-rose-500',
    avatarText: 'AR',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 1.3
  },

  // ==================== JAKARTA UTARA ====================
  // Kecamatan: Kelapa Gading
  {
    id: 'jkt-ut-1',
    name: 'Bpk. Steven Kurniawan',
    city: 'Jakarta Utara',
    district: 'Kelapa Gading',
    neighborhood: 'Boulevard Kelapa Gading',
    locationFormatted: 'Boulevard Timur, Kelapa Gading',
    service: 'Cuci AC Inverter & Steam Evaporator',
    units: 3,
    timeAgo: 'Baru saja',
    avatarBg: 'bg-indigo-600',
    avatarText: 'SK',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 0.8
  },
  {
    id: 'jkt-ut-2',
    name: 'Ibu Jessica Suwandi',
    city: 'Jakarta Utara',
    district: 'Kelapa Gading',
    neighborhood: 'Pegangsaan Dua',
    locationFormatted: 'Pegangsaan Dua, Kelapa Gading',
    service: 'Bongkar Pasang AC 2 PK',
    units: 1,
    timeAgo: '4 menit lalu',
    avatarBg: 'bg-pink-500',
    avatarText: 'JS',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.5
  },

  // Kecamatan: Penjaringan (PIK / Pluit)
  {
    id: 'jkt-pj-1',
    name: 'Bpk. Erick Hartono',
    city: 'Jakarta Utara',
    district: 'Penjaringan',
    neighborhood: 'Pantai Indah Kapuk',
    locationFormatted: 'PIK Bukit Golf Mediterania, Penjaringan',
    service: 'Service AC Standing Floor & Split',
    units: 4,
    timeAgo: '2 menit lalu',
    avatarBg: 'bg-sky-600',
    avatarText: 'EH',
    tag: 'Bayar via Midtrans VA BCA',
    rating: 5,
    estimatedDistanceKm: 1.1
  },

  // ==================== JAKARTA BARAT ====================
  // Kecamatan: Kembangan / Puri
  {
    id: 'jkt-kmb-1',
    name: 'Ibu Felicia Lim',
    city: 'Jakarta Barat',
    district: 'Kembangan',
    neighborhood: 'Puri Indah',
    locationFormatted: 'Puri Indah Blok A, Kembangan',
    service: 'Cuci AC Jet Clean',
    units: 2,
    timeAgo: '2 menit lalu',
    avatarBg: 'bg-teal-500',
    avatarText: 'FL',
    tag: 'Teknisi Menuju Lokasi',
    rating: 5,
    estimatedDistanceKm: 0.9
  },
  // Kecamatan: Kebon Jeruk
  {
    id: 'jkt-kj-1',
    name: 'Bpk. Bagus Santoso',
    city: 'Jakarta Barat',
    district: 'Kebon Jeruk',
    neighborhood: 'Kedoya',
    locationFormatted: 'Kedoya Baru, Kebon Jeruk',
    service: 'Isi Freon R410A & Cek Kebocoran',
    units: 2,
    timeAgo: '6 menit lalu',
    avatarBg: 'bg-amber-500',
    avatarText: 'BS',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.6
  },

  // ==================== JAKARTA PUSAT ====================
  // Kecamatan: Menteng
  {
    id: 'jkt-pus-1',
    name: 'Bpk. Irfan Bachdim',
    city: 'Jakarta Pusat',
    district: 'Menteng',
    neighborhood: 'Cikini',
    locationFormatted: 'Jl. Teuku Cik Ditiro, Menteng',
    service: 'Cuci AC & Disinfeksi Antibakteri',
    units: 3,
    timeAgo: '1 menit lalu',
    avatarBg: 'bg-blue-600',
    avatarText: 'IB',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 0.8
  },
  // Kecamatan: Tanah Abang (Benhil)
  {
    id: 'jkt-ta-1',
    name: 'Ibu Melisa Wardani',
    city: 'Jakarta Pusat',
    district: 'Tanah Abang',
    neighborhood: 'Bendungan Hilir',
    locationFormatted: 'Benhil Raya, Tanah Abang',
    service: 'Perbaikan Pipa AC Bocor',
    units: 1,
    timeAgo: '5 menit lalu',
    avatarBg: 'bg-emerald-600',
    avatarText: 'MW',
    tag: 'Order Selesai',
    rating: 5,
    estimatedDistanceKm: 1.4
  },

  // ==================== JAKARTA TIMUR ====================
  // Kecamatan: Duren Sawit
  {
    id: 'jkt-ds-1',
    name: 'Bpk. Surya Saputra',
    city: 'Jakarta Timur',
    district: 'Duren Sawit',
    neighborhood: 'Pondok Kelapa',
    locationFormatted: 'Pondok Kelapa Indah, Duren Sawit',
    service: 'Cuci AC Hemat 2 Unit',
    units: 2,
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-indigo-500',
    avatarText: 'SS',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 1.2
  },

  // ==================== KOTA TANGERANG SELATAN ====================
  // Kecamatan: Pondok Aren / Bintaro
  {
    id: 'tang-sel-1',
    name: 'Ibu Maya Santoso',
    city: 'Kota Tangerang Selatan',
    district: 'Pondok Aren',
    neighborhood: 'Bintaro Jaya',
    locationFormatted: 'Bintaro Jaya Sektor 7, Pondok Aren',
    service: 'Perbaikan AC Netes & Bocor Air',
    units: 1,
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-amber-500',
    avatarText: 'MS',
    tag: 'Order Selesai',
    rating: 5,
    estimatedDistanceKm: 0.9
  },
  {
    id: 'tang-sel-2',
    name: 'Bpk. Adrian Kusuma',
    city: 'Kota Tangerang Selatan',
    district: 'Pondok Aren',
    neighborhood: 'Bintaro Sektor 9',
    locationFormatted: 'Emerald Bintaro, Pondok Aren',
    service: 'Cuci AC Inverter & Tambah Freon',
    units: 3,
    timeAgo: '6 menit lalu',
    avatarBg: 'bg-emerald-500',
    avatarText: 'AK',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.3
  },
  // Kecamatan: Serpong (BSD)
  {
    id: 'tang-srp-1',
    name: 'Bpk. Michael Chen',
    city: 'Kota Tangerang Selatan',
    district: 'Serpong',
    neighborhood: 'BSD City',
    locationFormatted: 'The Mozia BSD City, Serpong',
    service: 'Bongkar Pasang AC Daikin Inverter',
    units: 2,
    timeAgo: '2 menit lalu',
    avatarBg: 'bg-sky-600',
    avatarText: 'MC',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 1.1
  },

  // ==================== KOTA DEPOK ====================
  // Kecamatan: Beji / Margonda
  {
    id: 'dpk-bj-1',
    name: 'Ibu Siska Amelia',
    city: 'Kota Depok',
    district: 'Beji',
    neighborhood: 'Margonda',
    locationFormatted: 'Margonda Raya, Beji',
    service: 'Cuci AC Hemat Mahasiswa & Keluarga',
    units: 2,
    timeAgo: '4 menit lalu',
    avatarBg: 'bg-rose-500',
    avatarText: 'SA',
    tag: 'Teknisi Bersertifikat',
    rating: 5,
    estimatedDistanceKm: 0.8
  },
  // Kecamatan: Cinere
  {
    id: 'dpk-cnr-1',
    name: 'Bpk. Raymond Lucas',
    city: 'Kota Depok',
    district: 'Cinere',
    neighborhood: 'Cinere Raya',
    locationFormatted: 'Bukit Cinere Indah, Cinere',
    service: 'Isi Freon R32 & Cuci Evaporator',
    units: 2,
    timeAgo: '7 menit lalu',
    avatarBg: 'bg-teal-600',
    avatarText: 'RL',
    tag: 'Garansi 30 Hari',
    rating: 5,
    estimatedDistanceKm: 1.4
  },

  // ==================== KOTA TANGERANG ====================
  // Kecamatan: Karawaci
  {
    id: 'tgr-krw-1',
    name: 'Ibu Veronica Hartono',
    city: 'Kota Tangerang',
    district: 'Karawaci',
    neighborhood: 'Lippo Karawaci',
    locationFormatted: 'Lippo Village, Karawaci',
    service: 'Cuci AC Jet Clean & Steam',
    units: 3,
    timeAgo: '3 menit lalu',
    avatarBg: 'bg-purple-600',
    avatarText: 'VH',
    tag: 'Bayar via Midtrans QRIS',
    rating: 5,
    estimatedDistanceKm: 1.0
  },

  // ==================== KOTA BOGOR ====================
  // Kecamatan: Bogor Tengah
  {
    id: 'bgr-tgh-1',
    name: 'Bpk. Dedi Sukardi',
    city: 'Kota Bogor',
    district: 'Bogor Tengah',
    neighborhood: 'Pajajaran',
    locationFormatted: 'Jl. Pajajaran Raya, Bogor Tengah',
    service: 'Cuci AC & Cek Kompresor',
    units: 2,
    timeAgo: '5 menit lalu',
    avatarBg: 'bg-emerald-600',
    avatarText: 'DS',
    tag: 'Teknisi Sedang Menuju',
    rating: 5,
    estimatedDistanceKm: 1.2
  }
];

/**
 * Filter and sort social proof items based on customer's detected location.
 * Priority rules:
 * 1. Exact Match: Same City AND Same District (Kecamatan) -> Top priority
 * 2. Secondary: Same City -> Fill up if exact district items are fewer than 3
 * 3. Fallback: Full list if no location is detected yet
 */
export function getLocalizedSocialProof(detectedLocation?: DetectedLocation | null): {
  items: LiveSocialProofItem[];
  matchLevel: 'exact_district' | 'same_city' | 'general';
  matchedDistrict?: string;
  matchedCity?: string;
} {
  if (!detectedLocation || (!detectedLocation.district && !detectedLocation.city)) {
    return {
      items: SOCIAL_PROOF_DATABASE,
      matchLevel: 'general'
    };
  }

  const targetCity = detectedLocation.city?.toLowerCase().trim() || '';
  const targetDistrict = detectedLocation.district?.toLowerCase().trim() || '';

  // Clean strings for fuzzy matching (remove 'kota', 'kabupaten', 'kecamatan')
  const cleanCity = targetCity.replace(/kota|kabupaten|kab\.|dki/g, '').trim();
  const cleanDistrict = targetDistrict.replace(/kecamatan|kec\./g, '').trim();

  // 1. Find EXACT matches (Same City AND Same District/Kecamatan)
  const exactMatches = SOCIAL_PROOF_DATABASE.filter((item) => {
    const itemCity = item.city.toLowerCase().replace(/kota|kabupaten|kab\.|dki/g, '').trim();
    const itemDistrict = item.district.toLowerCase().replace(/kecamatan|kec\./g, '').trim();
    const itemLocation = item.locationFormatted.toLowerCase();

    const cityMatches = itemCity.includes(cleanCity) || cleanCity.includes(itemCity);
    const districtMatches = 
      itemDistrict.includes(cleanDistrict) || 
      cleanDistrict.includes(itemDistrict) ||
      itemLocation.includes(cleanDistrict);

    return cityMatches && districtMatches;
  });

  if (exactMatches.length > 0) {
    // If exact matches exist, also include other close neighborhoods from same city to keep rotation rich if < 3
    if (exactMatches.length < 3 && cleanCity) {
      const cityMatches = SOCIAL_PROOF_DATABASE.filter((item) => {
        const itemCity = item.city.toLowerCase().replace(/kota|kabupaten|kab\.|dki/g, '').trim();
        return (itemCity.includes(cleanCity) || cleanCity.includes(itemCity)) && !exactMatches.some(e => e.id === item.id);
      });
      return {
        items: [...exactMatches, ...cityMatches],
        matchLevel: 'exact_district',
        matchedDistrict: detectedLocation.district,
        matchedCity: detectedLocation.city
      };
    }

    return {
      items: exactMatches,
      matchLevel: 'exact_district',
      matchedDistrict: detectedLocation.district,
      matchedCity: detectedLocation.city
    };
  }

  // 2. Find SAME CITY matches if exact district doesn't have records
  if (cleanCity) {
    const sameCityMatches = SOCIAL_PROOF_DATABASE.filter((item) => {
      const itemCity = item.city.toLowerCase().replace(/kota|kabupaten|kab\.|dki/g, '').trim();
      return itemCity.includes(cleanCity) || cleanCity.includes(itemCity);
    });

    if (sameCityMatches.length > 0) {
      return {
        items: sameCityMatches,
        matchLevel: 'same_city',
        matchedCity: detectedLocation.city
      };
    }
  }

  return {
    items: SOCIAL_PROOF_DATABASE,
    matchLevel: 'general'
  };
}
