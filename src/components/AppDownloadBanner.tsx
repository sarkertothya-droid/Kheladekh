import React from 'react';
import { Download, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const AppDownloadBanner: React.FC = () => {
  const { isInstalled, install, enterAppMode } = usePWAInstall();

  // If already in standalone/app mode, show a clean active app badge instead of download CTA
  if (isInstalled) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#0D1815] to-emerald-950/80 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-pulse" />
            <span className="text-[#16D98A] font-bold text-[11px]">
              KhelaDek অফিশিয়াল অ্যাপ সক্রিয় (v2.4.0) — সম্পূর্ণ বিজ্ঞাপনমুক্ত
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#A5B1C2] hidden sm:inline">
            Direct High-Speed Ultra HD Feed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-indigo-900 to-[#00B7FF] text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="p-1 rounded-lg bg-white/20 shrink-0">
            <Smartphone className="w-4 h-4 text-white animate-bounce" />
          </div>
          <p className="text-xs font-bold leading-tight">
            <span>খেলা দেখতে অফিশিয়াল KhelaDek অ্যাপটি ডাউনলোড করুন!</span>{' '}
            <span className="text-amber-300 font-normal hidden md:inline">
              (ওয়েবে খেলা ব্লক থাকবে, ফুল এইচডি খেলা শুধুমাত্র অ্যাপে চলবে)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/download"
            className="px-3.5 py-1 rounded-xl bg-white text-[#080B12] text-xs font-black flex items-center gap-1.5 hover:bg-amber-300 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 fill-current" />
            <span>অ্যাপ ডাউনলোড (APK)</span>
          </Link>

          <button
            type="button"
            onClick={enterAppMode}
            className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white text-[11px] font-semibold transition-all whitespace-nowrap"
            title="ইনস্ট্যান্ট অ্যাপ মোডে প্রবেশ করুন"
          >
            অ্যাপ মোড
          </button>
        </div>
      </div>
    </div>
  );
};
