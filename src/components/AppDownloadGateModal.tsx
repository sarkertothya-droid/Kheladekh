import React, { useState } from 'react';
import { Download, Smartphone, Sparkles, CheckCircle2, ShieldCheck, Zap, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppDownloadGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchTitle?: string;
}

export const AppDownloadGateModal: React.FC<AppDownloadGateModalProps> = ({
  isOpen,
  onClose,
  matchTitle,
}) => {
  const { isInstallable, isIOS, install, enterAppMode } = usePWAInstall();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    setDownloadSuccess(true);
    setTimeout(() => {
      enterAppMode();
      onClose();
    }, 1200);
  };

  const handleDirectAppMode = () => {
    enterAppMode();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#141D2B] via-[#0F1622] to-[#0A0F18] border-2 border-[#00B7FF]/40 p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00B7FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#16D98A]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#A5B1C2] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
            alt="KhelaDek App Logo"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#00B7FF]/50 shadow-lg shadow-[#00B7FF]/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">KhelaDek অফিশিয়াল অ্যাপ</h2>
              <span className="px-2 py-0.5 rounded-md bg-[#16D98A]/20 text-[#16D98A] text-[10px] font-mono font-bold">
                v2.4
              </span>
            </div>
            <p className="text-xs text-[#00B7FF] font-medium mt-0.5">
              ওয়েবে সরাসরি খেলা দেখা যাবে না · শুধুমাত্র অ্যাপে চলবে
            </p>
          </div>
        </div>

        {/* Notice Box */}
        <div className="p-3.5 rounded-2xl bg-[#080B12] border border-amber-500/30 text-amber-300 text-xs leading-relaxed mb-5">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>{matchTitle ? `"${matchTitle}" দেখতে অ্যাপ প্রয়োজন` : 'খেলা দেখার নিয়মাবলী'}</span>
          </p>
          <p className="text-[#A5B1C2] text-[11px]">
            ওয়েব ব্রাউজারে খেলা ব্লক রাখা হয়েছে। সম্পূর্ণ বাফারমুক্ত ফুল এইচডি লাইভ স্ট্রিমিং ও ১০০০+ টিভি চ্যানেল দেখতে এখনই KhelaDek অ্যাপটি ডাউনলোড ও ইন্সটল করুন।
          </p>
        </div>

        {/* App Highlights */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-white">
          <div className="p-2.5 rounded-xl bg-[#151E2B] border border-white/5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16D98A] shrink-0" />
            <span>১০০% বিজ্ঞাপনমুক্ত (No Ads)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#151E2B] border border-white/5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00B7FF] shrink-0" />
            <span>০ বাফারিং ও দ্রুত লোডিং</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#151E2B] border border-white/5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>১০০০+ লাইভ টিভি চ্যানেল</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#151E2B] border border-white/5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>৪-স্ক্রিন স্টেডিয়াম স্টুডিও</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] text-[#080B12] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#00B7FF]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5 fill-current" />
            <span>
              {downloadSuccess
                ? '✅ অ্যাপ ডাউনলোড ও ইনস্টলেশন সফল!'
                : 'KhelaDek অ্যাপ ডাউনলোড ও ইন্সটল করুন'}
            </span>
          </button>

          {/* Direct Instant App Mode Fallback for Desktop/Browser Testers */}
          <button
            type="button"
            onClick={handleDirectAppMode}
            className="w-full py-2.5 px-4 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>📱 সরাসরি অ্যাপ মোডে প্রবেশ করুন (Instant App Mode)</span>
          </button>
        </div>

        {isIOS && (
          <p className="mt-3 text-[11px] text-center text-[#A5B1C2]">
            iPhone / iPad ব্যবহারকারীরা Safari ব্রাউজারের <strong>Share</strong> বাটনে চেপে <strong>Add to Home Screen</strong> চাপুন।
          </p>
        )}
      </div>
    </div>
  );
};
