import React from 'react';
import { Snowflake, ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 text-white font-['Plus_Jakarta_Sans',sans-serif] px-4 select-none">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Animated Brand Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-sky-500/40 ring-4 ring-sky-400/20">
            <Snowflake className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin [animation-duration:8s]" />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-sky-400/20 blur-xl -z-10 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">
          Tukang AC <span className="text-sky-400">Online</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mb-6">
          Solusi Servis & Perawatan AC Terpercaya
        </p>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-3 relative">
          <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>
        <p className="text-[11px] text-sky-300 font-semibold tracking-wide">
          Memeriksa sesi autentikasi...
        </p>

        {/* Security badge */}
        <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/50 text-[10px] text-sky-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Sistem Resmi & Bergaransi</span>
        </div>
      </div>
    </div>
  );
};
