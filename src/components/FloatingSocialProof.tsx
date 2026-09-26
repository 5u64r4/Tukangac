import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  Compass, 
  ChevronRight,
  LocateFixed,
  Radio
} from 'lucide-react';
import { CustomerTab, DetectedLocation, LiveSocialProofItem } from '../types';
import { getLocalizedSocialProof } from '../data/socialProofData';
import { 
  getSavedCustomerLocation, 
  saveCustomerLocation, 
  detectBrowserGeolocation, 
  POPULAR_LOCATIONS 
} from '../services/locationService';

interface FloatingSocialProofProps {
  onSelectBooking?: (tab: CustomerTab) => void;
  customerLocation?: DetectedLocation | null;
}

export const FloatingSocialProof: React.FC<FloatingSocialProofProps> = ({ 
  onSelectBooking,
  customerLocation: propLocation 
}) => {
  const [activeLocation, setActiveLocation] = useState<DetectedLocation>(() => {
    return propLocation || getSavedCustomerLocation();
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Sync with prop location when it changes
  useEffect(() => {
    if (propLocation) {
      setActiveLocation(propLocation);
    }
  }, [propLocation]);

  // Listen to global location events
  useEffect(() => {
    const handleLocationEvent = (e: CustomEvent<DetectedLocation>) => {
      if (e.detail) {
        setActiveLocation(e.detail);
        setCurrentIndex(0); // Reset to first matching item of new district
      }
    };

    window.addEventListener('tukang_ac_location_changed' as any, handleLocationEvent);
    return () => {
      window.removeEventListener('tukang_ac_location_changed' as any, handleLocationEvent);
    };
  }, []);

  // Compute localized social proof items based on current active location
  const { items: localizedOrders, matchLevel, matchedDistrict, matchedCity } = useMemo(() => {
    return getLocalizedSocialProof(activeLocation);
  }, [activeLocation]);

  // Initial delay before showing popup
  useEffect(() => {
    if (isDismissed) return;

    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2200);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  // Auto rotation timer
  useEffect(() => {
    if (isDismissed || localizedOrders.length === 0) return;

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    if (isVisible) {
      // Stay visible for 5.5 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5500);
    } else {
      // Pause for 3.5 seconds before next alert
      nextTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % localizedOrders.length);
        setIsVisible(true);
      }, 3500);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, isDismissed, localizedOrders.length]);

  const handleTriggerGpsDetection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetectingGps(true);
    try {
      const detected = await detectBrowserGeolocation();
      setActiveLocation(detected);
      setCurrentIndex(0);
      setIsVisible(true);
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSelectPresetDistrict = (preset: typeof POPULAR_LOCATIONS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const newLoc: DetectedLocation = {
      city: preset.city,
      district: preset.district,
      neighborhood: preset.neighborhood,
      latitude: preset.lat,
      longitude: preset.lng,
      isGpsDetected: false,
      detectedAt: new Date().toISOString(),
      source: 'preset'
    };
    saveCustomerLocation(newLoc);
    setActiveLocation(newLoc);
    setCurrentIndex(0);
    setShowLocationPicker(false);
    setIsVisible(true);
  };

  if (isDismissed || localizedOrders.length === 0) return null;

  const safeIndex = currentIndex % localizedOrders.length;
  const currentOrder: LiveSocialProofItem = localizedOrders[safeIndex] || localizedOrders[0];

  const isExactDistrictMatch = matchLevel === 'exact_district';
  const isSameCityMatch = matchLevel === 'same_city';

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-50 max-w-[340px] sm:max-w-[390px] pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto bg-slate-950/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl border border-sky-400/35 shadow-2xl shadow-slate-950/60 flex flex-col gap-2 relative group overflow-hidden cursor-pointer"
            onClick={() => onSelectBooking?.('booking')}
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 opacity-90" />

            {/* Proximity Matching Header Banner */}
            <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/10 text-[10px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                
                {isExactDistrictMatch ? (
                  <div className="flex items-center gap-1 text-emerald-300 font-extrabold truncate">
                    <Radio className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Terdekat: 1 Kecamatan ({activeLocation.district || matchedDistrict})
                    </span>
                  </div>
                ) : isSameCityMatch ? (
                  <div className="flex items-center gap-1 text-sky-300 font-extrabold truncate">
                    <Navigation className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate">
                      Satu Kota: {activeLocation.city || matchedCity}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-300 font-bold truncate">
                    <Compass className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>Aktivitas Pesanan Real-Time</span>
                  </div>
                )}
              </div>

              {/* Location Pill / Switcher Trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLocationPicker(prev => !prev);
                }}
                className="px-2 py-0.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-[9px] font-bold text-sky-200 flex items-center gap-1 shrink-0 transition-colors"
                title="Ganti atau sesuaikan deteksi kecamatan"
              >
                <MapPin className="w-2.5 h-2.5 text-rose-400" />
                <span className="max-w-[100px] truncate">{activeLocation.district || 'Pilih Lokasi'}</span>
              </button>
            </div>

            {/* Main Content Row */}
            <div className="flex items-start gap-3 relative">
              {/* Left Customer Avatar with Status Indicator */}
              <div className="relative shrink-0 mt-0.5">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${currentOrder.avatarBg} text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white/20`}
                >
                  {currentOrder.avatarText}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-slate-950">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>

              {/* Order Info */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs sm:text-[13px] font-black text-white truncate flex items-center gap-1.5">
                    {currentOrder.name}
                  </span>
                  <span className="text-[10px] text-sky-300/90 font-semibold shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {currentOrder.timeAgo}
                  </span>
                </div>

                {/* Specific Location with Kecamatan & Kota Badge */}
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300 font-medium mb-1 truncate">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="font-semibold text-white truncate">
                    {currentOrder.locationFormatted}
                  </span>
                  {currentOrder.estimatedDistanceKm && (
                    <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold shrink-0 border border-emerald-400/30">
                      ±{currentOrder.estimatedDistanceKm} km
                    </span>
                  )}
                </div>

                {/* Service Badge & Tag */}
                <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-black text-amber-300 truncate block">
                      {currentOrder.service}
                    </span>
                    {currentOrder.units && (
                      <span className="text-[9px] sm:text-[10px] text-sky-200 block font-medium">
                        Jumlah: {currentOrder.units} Unit AC
                      </span>
                    )}
                  </div>
                  {currentOrder.tag && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                      {currentOrder.tag}
                    </span>
                  )}
                </div>

                {/* Bottom Quick Action hint */}
                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/10 text-[10px] text-sky-200/80">
                  <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-300 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    Teknisi Siaga di Area Ini
                  </span>
                  <span className="font-bold text-amber-400 group-hover:underline flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Pesan &rarr;
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                  setIsDismissed(true);
                }}
                className="absolute top-0 right-0 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expandable Location Switcher Dropdown */}
            <AnimatePresence>
              {showLocationPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pt-2 border-t border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-sky-300 flex items-center gap-1">
                        <LocateFixed className="w-3 h-3 text-sky-400" />
                        Pilih Lokasi & Kecamatan:
                      </span>
                      <button
                        onClick={handleTriggerGpsDetection}
                        disabled={isDetectingGps}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Radio className={`w-2.5 h-2.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                        <span>{isDetectingGps ? 'Mendeteksi...' : 'Deteksi GPS'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-1 text-[10px]">
                      {POPULAR_LOCATIONS.map((preset) => {
                        const isCurrentSelected = 
                          activeLocation.district?.toLowerCase() === preset.district.toLowerCase() &&
                          activeLocation.city?.toLowerCase() === preset.city.toLowerCase();

                        return (
                          <button
                            key={preset.id}
                            onClick={(e) => handleSelectPresetDistrict(preset, e)}
                            className={`p-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                              isCurrentSelected
                                ? 'bg-sky-600 text-white font-bold'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{preset.name}</span>
                            {isCurrentSelected && <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
