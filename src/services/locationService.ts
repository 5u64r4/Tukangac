import { DetectedLocation } from '../types';

const STORAGE_KEY = 'tukang_ac_customer_location';

export interface LocationPreset {
  id: string;
  name: string;
  district: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export const POPULAR_LOCATIONS: LocationPreset[] = [
  {
    id: 'bks-sel',
    name: 'Bekasi Selatan (Galaxy, Pekayon, Kemang Pratama)',
    district: 'Bekasi Selatan',
    city: 'Kota Bekasi',
    neighborhood: 'Galaxy / Pekayon',
    lat: -6.2625,
    lng: 106.9785
  },
  {
    id: 'bks-tim',
    name: 'Bekasi Timur (Grand Wisata, Duren Jaya)',
    district: 'Bekasi Timur',
    city: 'Kota Bekasi',
    neighborhood: 'Grand Wisata',
    lat: -6.2512,
    lng: 107.0145
  },
  {
    id: 'bks-bar',
    name: 'Bekasi Barat (Kranji, Bintara, Jakasampurna)',
    district: 'Bekasi Barat',
    city: 'Kota Bekasi',
    neighborhood: 'Kranji / Bintara',
    lat: -6.2335,
    lng: 106.9721
  },
  {
    id: 'bks-ut',
    name: 'Bekasi Utara (Summarecon Bekasi, Harapan Baru)',
    district: 'Bekasi Utara',
    city: 'Kota Bekasi',
    neighborhood: 'Summarecon Bekasi',
    lat: -6.2185,
    lng: 107.0012
  },
  {
    id: 'jkt-sel-kby',
    name: 'Jakarta Selatan (Kebayoran Baru, Senopati)',
    district: 'Kebayoran Baru',
    city: 'Jakarta Selatan',
    neighborhood: 'Senopati / Melawai',
    lat: -6.2415,
    lng: 106.8045
  },
  {
    id: 'jkt-sel-cld',
    name: 'Jakarta Selatan (Cilandak, Fatmawati, Lebak Bulus)',
    district: 'Cilandak',
    city: 'Jakarta Selatan',
    neighborhood: 'Fatmawati',
    lat: -6.2912,
    lng: 106.7978
  },
  {
    id: 'jkt-ut-gading',
    name: 'Jakarta Utara (Kelapa Gading, Boulevard)',
    district: 'Kelapa Gading',
    city: 'Jakarta Utara',
    neighborhood: 'Boulevard Kelapa Gading',
    lat: -6.1582,
    lng: 106.9082
  },
  {
    id: 'tgr-sel-btr',
    name: 'Tangerang Selatan (Pondok Aren, Bintaro Sektor 7/9)',
    district: 'Pondok Aren',
    city: 'Kota Tangerang Selatan',
    neighborhood: 'Bintaro Jaya',
    lat: -6.2845,
    lng: 106.7152
  },
  {
    id: 'tgr-sel-srp',
    name: 'Tangerang Selatan (Serpong, BSD City)',
    district: 'Serpong',
    city: 'Kota Tangerang Selatan',
    neighborhood: 'BSD City',
    lat: -6.3025,
    lng: 106.6548
  },
  {
    id: 'dpk-bj',
    name: 'Kota Depok (Beji, Margonda Raya)',
    district: 'Beji',
    city: 'Kota Depok',
    neighborhood: 'Margonda',
    lat: -6.3685,
    lng: 106.8335
  },
  {
    id: 'jkt-pus-mtg',
    name: 'Jakarta Pusat (Menteng, Cikini)',
    district: 'Menteng',
    city: 'Jakarta Pusat',
    neighborhood: 'Cikini',
    lat: -6.1965,
    lng: 106.8385
  }
];

export const DEFAULT_CUSTOMER_LOCATION: DetectedLocation = {
  city: 'Kota Bekasi',
  district: 'Bekasi Selatan',
  neighborhood: 'Galaxy / Pekayon',
  latitude: -6.2625,
  longitude: 106.9785,
  isGpsDetected: false,
  detectedAt: new Date().toISOString(),
  source: 'default'
};

/**
 * Get current saved or default customer location
 */
export function getSavedCustomerLocation(): DetectedLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.city && parsed.district) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved location from localStorage:', e);
  }
  return DEFAULT_CUSTOMER_LOCATION;
}

/**
 * Save customer location to storage and notify listeners
 */
export function saveCustomerLocation(location: DetectedLocation): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    window.dispatchEvent(new CustomEvent('tukang_ac_location_changed', { detail: location }));
  } catch (e) {
    console.warn('Could not save location to localStorage:', e);
  }
}

/**
 * Parse an address string (e.g., from booking form) to extract District & City
 */
export function parseLocationFromAddressText(addressText: string): DetectedLocation | null {
  if (!addressText || typeof addressText !== 'string') return null;

  const lower = addressText.toLowerCase();

  // Check against known presets
  for (const loc of POPULAR_LOCATIONS) {
    const distLower = loc.district.toLowerCase();
    const cityLower = loc.city.toLowerCase().replace(/kota|kabupaten|dki/g, '').trim();
    const neighLower = loc.neighborhood.toLowerCase();

    if (
      lower.includes(distLower) ||
      (neighLower && lower.includes(neighLower.split('/')[0].trim())) ||
      (lower.includes('galaxy') && loc.district === 'Bekasi Selatan') ||
      (lower.includes('pekayon') && loc.district === 'Bekasi Selatan') ||
      (lower.includes('kemang pratama') && loc.district === 'Bekasi Selatan') ||
      (lower.includes('grand wisata') && loc.district === 'Bekasi Timur') ||
      (lower.includes('summarecon') && loc.district === 'Bekasi Utara') ||
      (lower.includes('senopati') && loc.district === 'Kebayoran Baru') ||
      (lower.includes('fatmawati') && loc.district === 'Cilandak') ||
      (lower.includes('bintaro') && loc.district === 'Pondok Aren') ||
      (lower.includes('bsd') && loc.district === 'Serpong') ||
      (lower.includes('margonda') && loc.district === 'Beji')
    ) {
      return {
        city: loc.city,
        district: loc.district,
        neighborhood: loc.neighborhood,
        latitude: loc.lat,
        longitude: loc.lng,
        isGpsDetected: false,
        detectedAt: new Date().toISOString(),
        source: 'address_input'
      };
    }
  }

  // Broad city fallback detection
  if (lower.includes('bekasi')) {
    if (lower.includes('timur')) return { city: 'Kota Bekasi', district: 'Bekasi Timur', source: 'address_input' };
    if (lower.includes('barat')) return { city: 'Kota Bekasi', district: 'Bekasi Barat', source: 'address_input' };
    if (lower.includes('utara')) return { city: 'Kota Bekasi', district: 'Bekasi Utara', source: 'address_input' };
    return { city: 'Kota Bekasi', district: 'Bekasi Selatan', source: 'address_input' };
  }

  if (lower.includes('jakarta selatan') || lower.includes('jaksel')) {
    return { city: 'Jakarta Selatan', district: 'Kebayoran Baru', source: 'address_input' };
  }
  if (lower.includes('jakarta utara') || lower.includes('jakut')) {
    return { city: 'Jakarta Utara', district: 'Kelapa Gading', source: 'address_input' };
  }
  if (lower.includes('depok')) {
    return { city: 'Kota Depok', district: 'Beji', source: 'address_input' };
  }
  if (lower.includes('tangerang')) {
    return { city: 'Kota Tangerang Selatan', district: 'Pondok Aren', source: 'address_input' };
  }

  return null;
}

/**
 * Detect customer's physical geolocation via browser GPS with reverse-lookup
 */
export async function detectBrowserGeolocation(): Promise<DetectedLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      const fallback = getSavedCustomerLocation();
      resolve(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Approximate reverse match against known Jabodetabek center coordinates
        let closestLocation = POPULAR_LOCATIONS[0];
        let minDistance = Infinity;

        for (const loc of POPULAR_LOCATIONS) {
          const dist = Math.hypot(latitude - loc.lat, longitude - loc.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestLocation = loc;
          }
        }

        const detected: DetectedLocation = {
          city: closestLocation.city,
          district: closestLocation.district,
          neighborhood: closestLocation.neighborhood,
          latitude,
          longitude,
          isGpsDetected: true,
          detectedAt: new Date().toISOString(),
          source: 'gps'
        };

        saveCustomerLocation(detected);
        resolve(detected);
      },
      (err) => {
        console.warn('Geolocation access declined or unavailable, using saved/default location:', err.message);
        const fallback = getSavedCustomerLocation();
        resolve(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000
      }
    );
  });
}
