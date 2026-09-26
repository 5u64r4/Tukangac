export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'Tips & Hemat' | 'Perawatan AC' | 'Troubleshooting' | 'Standar Layanan';
  categoryColor: {
    bg: string;
    text: string;
    border: string;
  };
  status?: 'published' | 'draft' | 'archived';
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
    sections: {
      heading: string;
      body: string;
    }[];
    proTip?: string;
    faqs?: {
      q: string;
      a: string;
    }[];
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

import technicianImg from '../assets/images/ac_technician_clean_1787975735267.jpg';
import bannerLandscapeImg from '../assets/images/ac_banner_landscape_1787976115488.jpg';
import heroBannerImg from '../assets/images/ac_hero_banner_widescreen_1787976334630.jpg';
import bannerBlueImg from '../assets/images/ac_banner_blue_1787975721114.jpg';

export const ARTICLES_DATA: Article[] = [
  {
    id: 'art-1',
    title: 'Standar Pengerjaan Higienis: Cuci AC Bertekanan & Bebas Becek di Rumah',
    slug: 'standar-cuci-ac-higienis-bebas-becek',
    category: 'Standar Layanan',
    categoryColor: {
      bg: 'bg-sky-50 text-sky-700',
      text: 'text-sky-700',
      border: 'border-sky-200'
    },
    readTime: '3 mnt baca',
    date: '28 Agu 2026',
    author: {
      name: 'Tim Teknisi Master Tukang AC Online',
      role: 'SOP Quality Assurance'
    },
    image: technicianImg,
    badge: 'Populer',
    summary: 'Bagaimana Tukang AC Online menjamin rumah tetap bersih, menggunakan terpal pelindung anti-bocor, dan sanitasi evaporator hingga tuntas.',
    content: {
      intro: 'Banyak pemilik rumah khawatir lantai atau dinding mereka menjadi kotor dan becek saat teknisi mencuci AC. Di Tukang AC Online, kami menerapkan protokol sanitasi ketat untuk kenyamanan Anda.',
      sections: [
        {
          heading: '1. Pemasangan Terpal Pelindung & Corong Air Khusus',
          body: 'Sebelum pengerjaan dimulai, teknisi kami memasang selubung terpal plastik kedap air di sekeliling unit indoor dan mengalirkan air kotor langsung ke ember penampung melalui selang corong steril.'
        },
        {
          heading: '2. Pompa Steam Air Bertekanan Presisi',
          body: 'Tekanan air disetel tepat untuk merontokkan debu lendir dan jamur di kisi-kisi evaporator tanpa merusak atau membengkokkan sirip aluminium pendingin.'
        },
        {
          heading: '3. Pembersihan Filter & Saluran Pembuangan (Drainase)',
          body: 'Pipa buangan ditembak hingga lancar untuk mencegah risiko air menetes atau rembes ke dalam kamar setelah AC kembali dinyalakan.'
        }
      ],
      proTip: 'Mintalah teknisi menunjukkan air hasil kurasan pertama untuk mengetahui seberapa kotor lendir atau lumut yang telah berhasil dibersihkan.',
      faqs: [
        {
          q: 'Apakah proses cuci AC menimbulkan bau menyengat?',
          a: 'Tidak, kami tidak menggunakan bahan kimia korosif berbahaya. Kami fokus pada semprotan air bersih dan pembersih ramah lingkungan.'
        },
        {
          q: 'Berapa lama waktu yang dibutuhkan untuk 1 unit AC?',
          a: 'Rata-rata 35 - 50 menit per unit untuk pencucian indoor dan outdoor secara menyeluruh.'
        }
      ],
      conclusion: 'Pencucian berkala yang higienis tidak hanya menjaga kebersihan rumah, namun juga mengembalikan efisiensi pendinginan dan kualitas udara yang Anda hirup.'
    },
    tags: ['Cuci AC', 'Higienis', 'Evaporator', 'Tips Rumah'],
    relatedServiceName: 'Cuci AC',
    relatedServicePrice: 'Rp75.000'
  },
  {
    id: 'art-2',
    title: '5 Tanda Freon AC Mulai Habis atau Mengalami Kebocoran Pipa',
    slug: '5-tanda-freon-ac-habis-atau-bocor',
    category: 'Troubleshooting',
    categoryColor: {
      bg: 'bg-rose-50 text-rose-700',
      text: 'text-rose-700',
      border: 'border-rose-200'
    },
    readTime: '4 mnt baca',
    date: '26 Agu 2026',
    author: {
      name: 'Ir. Budi Santoso',
      role: 'HVAC Specialist'
    },
    image: heroBannerImg,
    badge: 'Wajib Tahu',
    summary: 'Kenali gejala awal freon berkurang sebelum kompresor AC Anda mengalami overheat dan kerusakan permanen yang mahal.',
    content: {
      intro: 'Freon (refrigerant) pada sistem sirkulasi AC tidak akan habis kecuali terjadi kebocoran pada pipa tembaga, sambungan nepel, atau evaporator.',
      sections: [
        {
          heading: '1. Angin Keluar Namun Ruangan Tidak Terasa Dingin',
          body: 'Blower indoor tetap berputar kencang, namun hembusan udara terasa seperti kipas angin biasa meski suhu remote sudah disetel 16°C.'
        },
        {
          heading: '2. Timbul Bunga Es atau Salju pada Pipa Outdoor',
          body: 'Periksa pipa tembaga kecil pada unit outdoor di luar rumah. Jika terlihat lapisan es putih membeku, itu indikasi kuat tekanan freon turun drastis.'
        },
        {
          heading: '3. Terdengar Suara Desisan Halus (*Hissing*)',
          body: 'Kebocoran pada sambungan nepel atau kisi evaporator sering kali menimbulkan suara desis mirip ban kempes yang berlangsung terus-menerus.'
        },
        {
          heading: '4. Tagihan Listrik Melonjak Signifikan',
          body: 'Karena suhu target tak kunjung tercapai, kompresor dipaksa bekerja non-stop 100% tanpa jeda, mengonsumsi watt listrik jauh lebih tinggi.'
        }
      ],
      proTip: 'Jangan hanya meminta teknisi menambah freon jika ada kebocoran; pastikan titik bocor di-flaring atau dilas terlebih dahulu agar freon baru tidak terbuang sia-sia.',
      conclusion: 'Deteksi dini kebocoran freon akan menyelamatkan kompresor Anda dari resiko macet (*jammed*) dan menghemat biaya servis jangka panjang.'
    },
    tags: ['Freon AC', 'AC Bocor', 'Outdoor AC', 'Troubleshooting'],
    relatedServiceName: 'Tambah Freon (R32 / R410A)',
    relatedServicePrice: 'Rp150.000'
  },
  {
    id: 'art-3',
    title: 'Cara Mengatur Remote AC Supaya Cepat Dingin & Tagihan Listrik Hemat 30%',
    slug: 'cara-setting-remote-ac-hemat-listrik',
    category: 'Tips & Hemat',
    categoryColor: {
      bg: 'bg-emerald-50 text-emerald-700',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    },
    readTime: '3 mnt baca',
    date: '24 Agu 2026',
    author: {
      name: 'Rian Pratama',
      role: 'Konsultan Efisiensi Energi'
    },
    image: bannerLandscapeImg,
    badge: 'Tips Hemat',
    summary: 'Panduan setelan mode Cool, fan speed, suhu ideal 24-25°C, dan pemanfaatan timer tidur yang terbukti memangkas pemborosan listrik.',
    content: {
      intro: 'Banyak orang langsung menyetel AC ke suhu 16°C dengan Fan maksimal saat baru masuk ruangan, mengira ruangan akan lebih cepat dingin. Padahal, ini memicu lonjakan konsumsi listrik.',
      sections: [
        {
          heading: '1. Gunakan Suhu Ideal 24°C - 26°C',
          body: 'Di iklim tropis Indonesia, suhu 24°C - 25°C sudah sangat sejuk untuk tubuh manusia. Setiap kenaikan 1°C pada remote dapat menghemat konsumsi energi listrik sekitar 6-8%.'
        },
        {
          heading: '2. Pastikan Mode Operasi Berada di "Cool Mode" (Simbol Salju)',
          body: 'Hindari tidak sengaja mengaktifkan mode Auto atau Fan saja. Pada siang hari yang lembab, mode Dry juga bisa digunakan untuk mengurangi rasa gerah dengan watt lebih rendah.'
        },
        {
          heading: '3. Manfaatkan Fitur Timer & Sleep Mode',
          body: 'Suhu tubuh kita menurun saat tertidur lelap di dini hari. Sleep mode secara otomatis menaikkan suhu 1°C per jam, membuat tidur nyenyak tanpa kedinginan dan sangat hemat listrik.'
        }
      ],
      proTip: 'Tutup pintu dan tirai jendela yang terpapar langsung sinar matahari agar beban pendinginan AC berkurang drastis.',
      conclusion: 'Penggunaan remote AC yang bijak dikombinasikan dengan servis rutin membuat AC awet belasan tahun dan tagihan listrik bulanan tetap aman.'
    },
    tags: ['Hemat Listrik', 'Remote AC', 'Tips AC', 'Smart Home'],
    relatedServiceName: 'Cuci AC & Perawatan Rutin',
    relatedServicePrice: 'Rp75.000'
  },
  {
    id: 'art-4',
    title: 'AC Meneteskan Air di Dalam Kamar? Ini Penyebab Utama & Solusinya',
    slug: 'ac-meneteskan-air-dalam-kamar-penyebab-solusi',
    category: 'Troubleshooting',
    categoryColor: {
      bg: 'bg-amber-50 text-amber-700',
      text: 'text-amber-700',
      border: 'border-amber-200'
    },
    readTime: '3 mnt baca',
    date: '21 Agu 2026',
    author: {
      name: 'Tim Teknisi Master Tukang AC Online',
      role: 'Technical Support'
    },
    image: bannerBlueImg,
    badge: 'Solusi Cepat',
    summary: 'Tetesan air merusak kasur atau lantai kayu? Kenali penyebab talang air tersumbat lendir lumut atau kemiringan pipa buangan yang tidak pas.',
    content: {
      intro: 'Tetesan air dari unit indoor AC adalah masalah yang paling sering dialami pengguna. Jangan panik, umumnya ini bukan kerusakan mesin yang fatal.',
      sections: [
        {
          heading: '1. Talang Drainase Tertutup Gumpalan Lendir Lumut',
          body: 'Kondensasi udara lembab menghasilkan air tetesan alami. Jika AC jarang dicuci, debu bercampur air membentuk jelly/lendir lumut yang menyumbat lubang buangan air.'
        },
        {
          heading: '2. Kemiringan Pipa Buangan (Drain Pipe) Kurang Curam',
          body: 'Air mengalir dengan prinsip gravitasi. Jika posisi selang buangan melengkung ke atas atau terjepit, air akan berbalik arah dan meluap dari talang indoor.'
        },
        {
          heading: '3. Isolasi Pipa Tembaga Sudah Robek / Mengembun (Kondensasi)',
          body: 'Busa insulasi (Armaflex) yang sudah tipis atau robek membuat udara luar langsung menyentuh pipa dingin, menghasilkan butiran embun yang terus menetes.'
        }
      ],
      proTip: 'Langkah darurat: Matikan AC, letakkan ember atau handuk di bawah tetesan, dan segera jadwalkan pembersihan saluran drainase dengan teknisi.',
      conclusion: 'Jangan biarkan kebocoran air berlarut-larut karena dapat merusak plafon gypsum, wallpaper dinding, dan perabotan rumah Anda.'
    },
    tags: ['AC Bocor Air', 'Perbaikan AC', 'Drainase', 'Perawatan'],
    relatedServiceName: 'Perbaikan AC (Atasi Bocor & Netes)',
    relatedServicePrice: 'Rp125.000'
  },
  {
    id: 'art-5',
    title: 'Berapa Bulan Sekali Sebaiknya AC Rumah Dicuci? Ini Panduan Lengkapnya',
    slug: 'jadwal-ideal-cuci-ac-rumah',
    category: 'Perawatan AC',
    categoryColor: {
      bg: 'bg-blue-50 text-blue-700',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    readTime: '3 mnt baca',
    date: '18 Agu 2026',
    author: {
      name: 'Dian Permata',
      role: 'Healthy Living Specialist'
    },
    image: technicianImg,
    badge: 'Edukasi',
    summary: 'Tergantung lokasi ruangan, jumlah penghuni, dan keberadaan hewan peliharaan, ini jadwal tepat menjaga udara tetap segar dan sehat.',
    content: {
      intro: 'Menunggu AC tidak dingin atau bau apek baru memanggil teknisi adalah kebiasaan yang keliru. Perawatan preventif jauh lebih hemat daripada biaya servis darurat.',
      sections: [
        {
          heading: '1. Kamar Tidur Utama (Penggunaan 8-10 Jam/Hari): Tiap 2,5 - 3 Bulan',
          body: 'Debu dari sprei, pakaian, dan selimut cepat menumpuk di filter. Pencucian 3 bulan sekali menjaga sirkulasi udara kamar tetap steril untuk pernapasan.'
        },
        {
          heading: '2. Ruang Tamu / Ruang Keluarga (Dekat Jalan Raya): Tiap 2 Bulan',
          body: 'Pintu yang sering terbuka dan polusi asap jalan membuat kotoran lebih cepat masuk ke sirip indoor dan outdoor AC.'
        },
        {
          heading: '3. Kantor / Toko / Rumah dengan Hewan Peliharaan: Tiap 1,5 - 2 Bulan',
          body: 'Bulu halus anjing/kucing serta intensitas orang lalu-lalang memerlukan siklus cuci lebih cepat agar saluran udara tidak mampet.'
        }
      ],
      proTip: 'Anda bisa mencuci saringan udara (filter jaring) plastik sendiri di rumah setiap 2 minggu sekali dengan air mengalir.',
      conclusion: 'Jadwalkan servis rutin berkala agar keluarga terbebas dari alergi debu, jamur, dan infeksi saluran pernapasan.'
    },
    tags: ['Jadwal Cuci AC', 'Kesehatan', 'Filter AC', 'Perawatan'],
    relatedServiceName: 'Cuci AC',
    relatedServicePrice: 'Rp75.000'
  },
  {
    id: 'art-6',
    title: 'Mengapa AC Mengeluarkan Bau Apek / Asam? Cara Menghilangkannya',
    slug: 'cara-menghilangkan-bau-apek-ac',
    category: 'Perawatan AC',
    categoryColor: {
      bg: 'bg-purple-50 text-purple-700',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    readTime: '4 mnt baca',
    date: '15 Agu 2026',
    author: {
      name: 'Tim Teknisi Master Tukang AC Online',
      role: 'Sanitasi Specialist'
    },
    image: heroBannerImg,
    badge: 'Solusi Praktis',
    summary: 'Penyebab pertumbuhan koloni jamur hitam di blower AC dan langkah sanitasi disinfektan untuk mengembalikan kesegaran udara.',
    content: {
      intro: 'Saat AC baru dinyalakan, udara yang keluar terasa bau asam, apek, atau seperti cuka? Itu adalah tanda jelas adanya koloni mikroorganisme di dalam indoor unit.',
      sections: [
        {
          heading: '1. Jamur & Bakteri pada Blower Fan (Kipas Rol)',
          body: 'Kondisi lembab di dalam AC yang gelap adalah tempat ideal bagi jamur hitam berkembang biak di sela-sela roda kipas silinder.'
        },
        {
          heading: '2. Kebiasaan Merokok atau Memakai Pengharum Ruangan Berlebihan',
          body: 'Zat kimia dari aerosol pengharum ruangan yang lengket menempel pada evaporator dan mengikat debu hingga membusuk.'
        },
        {
          heading: '3. Solusi Tuntas: Cuci Steam + Sanitasi Anti-Bakteri',
          body: 'Bongkar cover dan cuci total hingga ke bagian blower belakang dengan semprotan air kencang dan cairan sanitasi khusus.'
        }
      ],
      proTip: 'Hindari menyemprotkan parfum atau minyak wangi langsung ke arah hisapan AC indoor, karena residu minyaknya akan mengikat debu tebal di evaporator.',
      conclusion: 'Udara bersih tanpa bau apek membuat istirahat Anda lebih berkualitas dan ruangan terasa jauh lebih segar.'
    },
    tags: ['Bau AC', 'Sanitasi AC', 'Cuci Bersih', 'Tips Ruangan'],
    relatedServiceName: 'Cuci AC & Sanitasi Total',
    relatedServicePrice: 'Rp75.000'
  }
];
