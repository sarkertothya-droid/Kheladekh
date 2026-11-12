import React, { useEffect, useState } from 'react';
import { Sparkles, Radio, ShieldCheck, Tv, Zap } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  minDurationMs = 2200,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('সার্ভার ক্লাস্টারে সংযোগ স্থাপন করা হচ্ছে...');

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 25) {
        setStatusText('সার্ভার ক্লাস্টারে সুরক্ষিত সংযোগ স্থাপন করা হচ্ছে...');
      } else if (pct < 55) {
        setStatusText('১০০০+ এইচডি টিভি চ্যানেল তালিকা প্রস্তুত হচ্ছে...');
      } else if (pct < 80) {
        setStatusText('লাইভ ক্রিকেট ও ফুটবল ফিড সিঙ্ক হচ্ছে...');
      } else if (pct < 98) {
        setStatusText('বাফারমুক্ত আল্ট্রা এইচডি প্লেয়ার শুরু হচ্ছে...');
      } else {
        setStatusText('প্রস্তুত! KhelaDek অ্যাপ ওপেন হচ্ছে...');
      }

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#05070B] via-[#090E17] to-[#04060A] text-white p-6 select-none animate-fade-in overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00B7FF]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#16D98A]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* App Icon Container with Multi-layer Glow */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] opacity-60 blur-lg animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-b from-[#1C2638] to-[#0C121D] border-2 border-[#00B7FF]/60 shadow-2xl overflow-hidden flex items-center justify-center">
            <img
              src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
              alt="KhelaDek App Icon"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-[#16D98A] text-[#080B12] shadow-lg ring-2 ring-[#080B12]">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Branding & App Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#00B7FF] tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-ping" />
            <span>KhelaDek Official App v2.4.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Khela<span className="text-[#00B7FF]">Dek</span>
          </h1>

          <p className="text-xs text-[#A5B1C2]">
            লাইভ ফুটবল, ক্রিকেট ও ১০০০+ টিভি চ্যানেল
          </p>
        </div>

        {/* Dynamic Loading Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A5B1C2] truncate max-w-[240px] text-left">
              {statusText}
            </span>
            <span className="text-[#00B7FF] font-bold tabular-nums shrink-0">
              {progress}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] transition-all duration-75 shadow-lg shadow-[#00B7FF]/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Security & Feature Micro Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-[#64748B] pt-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16D98A]" />
            <span>১০০% অ্যাড-ফ্রি</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-[#00B7FF]" />
            <span>১০০০+ চ্যানেল</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>১০৮০p আল্ট্রা এইচডি</span>
          </span>
        </div>
      </div>
    </div>
  );
};
