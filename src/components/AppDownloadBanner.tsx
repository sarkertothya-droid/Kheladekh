import React from 'react';
import { Download, Smartphone, Sparkles, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { downloadKhelaDekBinaryApk } from '../utils/apkDownloader';

interface AppDownloadBannerProps {
  onLaunchApp?: () => void;
  isAppMode?: boolean;
}

export const AppDownloadBanner: React.FC<AppDownloadBannerProps> = ({
  onLaunchApp,
  isAppMode = false,
}) => {
  // If already in app mode, show clean active app badge
  if (isAppMode) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#0D1815] to-emerald-950/80 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-pulse" />
            <span className="text-[#16D98A] font-bold text-[11px]">
              KhelaDek অফিশিয়াল অ্যাপ সক্রিয় (v2.4.0) — সম্পূর্ণ বিজ্ঞাপনমুক্ত
            </span>
          </div>
          <Link
            to="/download"
            className="text-[10px] font-mono text-[#A5B1C2] hover:text-white underline"
          >
            APK ডাউনলোড পেজ
          </Link>
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
            <span>ওয়েবসাইটে কোনো সরাসরি সম্প্রচার হবে না! খেলা দেখতে KhelaDek APK ডাউনলোড করুন</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => downloadKhelaDekBinaryApk()}
            className="px-3.5 py-1 rounded-xl bg-white text-[#080B12] text-xs font-black flex items-center gap-1.5 hover:bg-amber-300 transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 fill-current" />
            <span>APK ডাউনলোড (৭.৩ MB)</span>
          </button>

          {onLaunchApp && (
            <button
              type="button"
              onClick={onLaunchApp}
              className="px-3 py-1 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer"
              title="ইনস্ট্যান্ট অ্যাপ ওপেন করুন"
            >
              <Play className="w-3 h-3 text-[#16D98A] fill-current" />
              <span>অ্যাপে ওপেন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
