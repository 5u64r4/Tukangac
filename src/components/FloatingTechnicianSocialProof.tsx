import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  X, 
  Sparkles, 
  Wallet, 
  ShieldCheck, 
  Award, 
  ChevronRight,
  TrendingUp,
  UserCheck,
  Zap,
  Users,
  Building,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  TECHNICIAN_SOCIAL_PROOF_DATABASE, 
  LiveTechnicianSocialProofItem 
} from '../data/technicianSocialProofData';
import { TechnicianTab } from '../types';

interface FloatingTechnicianSocialProofProps {
  onSelectTab?: (tab: TechnicianTab) => void;
  onOpenApplyModal?: () => void;
}

export const FloatingTechnicianSocialProof: React.FC<FloatingTechnicianSocialProofProps> = ({
  onSelectTab,
  onOpenApplyModal
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'payout' | 'applicant' | 'bonus'>('all');

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'all') return TECHNICIAN_SOCIAL_PROOF_DATABASE;
    if (activeFilter === 'payout') return TECHNICIAN_SOCIAL_PROOF_DATABASE.filter(i => i.type === 'payout_success');
    if (activeFilter === 'applicant') return TECHNICIAN_SOCIAL_PROOF_DATABASE.filter(i => i.type === 'applicant_accepted' || i.type === 'applicant_applied' || i.type === 'certification_verified');
    if (activeFilter === 'bonus') return TECHNICIAN_SOCIAL_PROOF_DATABASE.filter(i => i.type === 'bonus_earned' || i.type === 'priority_assigned');
    return TECHNICIAN_SOCIAL_PROOF_DATABASE;
  }, [activeFilter]);

  // Initial delay before first popup
  useEffect(() => {
    if (isDismissed) return;

    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  // Auto rotation timer
  useEffect(() => {
    if (isDismissed || filteredItems.length === 0) return;

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    if (isVisible) {
      // Stay visible for 6 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    } else {
      // Pause for 3.8 seconds before next notification
      nextTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
        setIsVisible(true);
      }, 3800);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, isDismissed, filteredItems.length]);

  if (isDismissed || filteredItems.length === 0) return null;

  const currentItem: LiveTechnicianSocialProofItem = filteredItems[currentIndex % filteredItems.length] || filteredItems[0];

  const getEventIcon = (type: LiveTechnicianSocialProofItem['type']) => {
    switch (type) {
      case 'payout_success':
        return <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'applicant_accepted':
        return <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'applicant_applied':
        return <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'bonus_earned':
        return <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
      case 'certification_verified':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'priority_assigned':
        return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
  };

  const handleClickSocialProof = () => {
    if (onSelectTab) {
      onSelectTab('pelamar');
    }
    if (onOpenApplyModal) {
      onOpenApplyModal();
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-50 max-w-[340px] sm:max-w-[390px] pointer-events-none font-['Plus_Jakarta_Sans',sans-serif]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto bg-slate-950/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl shadow-slate-950/70 flex flex-col gap-2 relative group overflow-hidden cursor-pointer"
            onClick={handleClickSocialProof}
          >
            {/* Top Accent Gradient Bar (Technician Gold / Emerald Pro) */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 opacity-90" />

            {/* Header / Social Proof Type Banner */}
            <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/10 text-[10px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                
                <div className="flex items-center gap-1 text-amber-300 font-extrabold truncate">
                  {getEventIcon(currentItem.type)}
                  <span className="truncate">Kemitraan & Pelamar Teknisi</span>
                </div>
              </div>

              {/* Tag / Live Badge */}
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black shrink-0">
                  {currentItem.highlightBadge}
                </span>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="flex items-start gap-3 relative">
              {/* Avatar Icon */}
              <div className="relative shrink-0 mt-0.5">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${currentItem.avatarBg} text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white/20`}
                >
                  {currentItem.avatarText}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center ring-2 ring-slate-950">
                  <Wrench className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs sm:text-[13px] font-black text-white truncate">
                    {currentItem.name}
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-semibold shrink-0">
                    {currentItem.timeAgo}
                  </span>
                </div>

                {/* Domicile / District */}
                <div className="text-[10px] sm:text-[11px] text-slate-300 font-semibold mb-1 truncate flex items-center gap-1">
                  <Building className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>{currentItem.district}, {currentItem.city}</span>
                </div>

                {/* Highlight Headline & Description */}
                <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] sm:text-xs font-black text-amber-300 truncate">
                      {currentItem.headline}
                    </span>
                    {currentItem.amountFormatted && (
                      <span className="text-[11px] font-black text-emerald-300 font-mono shrink-0">
                        {currentItem.amountFormatted}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-200 line-clamp-2 leading-tight">
                    {currentItem.description}
                  </p>
                </div>

                {/* Bottom CTA Bar */}
                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/10 text-[10px]">
                  <span className="text-[9px] sm:text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    180+ Mitra Aktif Jabodetabek
                  </span>
                  <span className="font-extrabold text-amber-400 group-hover:underline flex items-center gap-0.5">
                    <span>Gabung / Pelamar &rarr;</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
