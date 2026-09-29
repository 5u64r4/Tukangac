import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  // Defensive validation: Never render invalid, undefined, null, or corrupted string templates
  if (
    !message ||
    typeof message !== 'string' ||
    message.trim() === '' ||
    message.includes('undefined') ||
    message.includes('null') ||
    message.includes('[object Object]')
  ) {
    return null;
  }

  const cleanMessage = message.trim();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-20 right-4 sm:right-6 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 cursor-pointer"
        onClick={onClose}
      >
        <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold leading-snug">{cleanMessage}</span>
      </motion.div>
    </AnimatePresence>
  );
};
