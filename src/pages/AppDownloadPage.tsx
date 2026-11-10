import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  Tv,
  CheckCircle2,
  Share2,
  HardDrive,
  Laptop,
  Apple,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';

export const AppDownloadPage: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install, enterAppMode } = usePWAInstall();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const navigate = useNavigate();

  const handleDownload = async () => {
    setDownloading(true);
    await install();
    setDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => {
      enterAppMode();
      navigate('/');
    }, 1500);
  };

  const handleOpenAppMode = () => {
    enterAppMode();
    navigate('/');
  };

  // Simulate direct APK file download
  const handleDownloadApkFile = () => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        'KhelaDek Official App v2.4.0\nInstall directly via Chrome/PWA or Browser Menu -> Add to Home Screen.',
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'KhelaDek-v2.4.0.apk';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloadSuccess(true);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101722] via-[#162232] to-[#0A0F18] border-2 border-[#00B7FF]/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B7FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#16D98A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-[#00B7FF]/20 border border-[#00B7FF]/40 text-[#00B7FF] text-xs font-mono font-bold">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>KhelaDek অফিশিয়াল অ্যাপ ডাউনলোড পোর্টাল</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              খেলা দেখতে <span className="text-[#00B7FF]">KhelaDek</span> অ্যাপ ডাউনলোড করুন
            </h1>

            <p className="text-sm sm:text-base text-[#A5B1C2] leading-relaxed">
              ওয়েবে সরাসরি কোনো খেলা চলবে না—সম্পূর্ণ বাফারমুক্ত লাইভ ক্রিকেট, ফুটবল, ৪-স্ক্রিন স্টেডিয়াম স্টুডিও এবং ১০০০+ টিভি চ্যানেল দেখতে এখনই আপনার ফোনে বা কম্পিউটারে KhelaDek অ্যাপটি ডাউনলোড ও ইন্সটল করুন।
            </p>

            {/* Quick Spec Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono text-white">
              <span className="px-3 py-1 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#16D98A]" />
                <span>সাইজ: ৪.৮ MB</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00B7FF]" />
                <span>১০০% বিজ্ঞাপনমুক্ত (No Ads)</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>ভার্সন: v2.4.0 (Latest)</span>
              </span>
            </div>

            {/* Main Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] text-[#080B12] font-black text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-[#00B7FF]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5 fill-current" />
                <span>
                  {downloadSuccess
                    ? '✅ অ্যাপ ইন্সটল হয়েছে! প্রবেশ করুন'
                    : downloading
                    ? 'ডাউনলোড হচ্ছে...'
                    : 'KhelaDek অ্যাপ ইন্সটল করুন'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadApkFile}
                className="py-4 px-6 rounded-2xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                title="ডাউনলোড KhelaDek APK ফাইল"
              >
                <Smartphone className="w-4 h-4 text-[#00B7FF]" />
                <span>APK ফাইল ডাউনলোড (৪.৮ MB)</span>
              </button>
            </div>

            {/* Direct Instant Mode Access for Web Testers */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAppMode}
                className="text-xs text-[#00B7FF] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <span>📱 সরাসরি ব্রাউজারে অ্যাপ মোড চালু করুন (Instant App Mode) &rarr;</span>
              </button>
            </div>
          </div>

          {/* App Preview Card */}
          <div className="relative w-full max-w-sm mx-auto lg:mx-0 p-5 rounded-3xl bg-[#0B101A] border-2 border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <img
                src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
                alt="KhelaDek App Icon"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#00B7FF] shadow-lg shadow-[#00B7FF]/30"
              />
              <div>
                <h3 className="font-bold text-base text-white">KhelaDek (খেলদেখ)</h3>
                <p className="text-xs text-[#16D98A] font-mono font-bold">অফিশিয়াল স্পোর্টস অ্যাপ</p>
                <p className="text-[10px] text-[#A5B1C2]">Verified by Google Play &amp; Web Store</p>
              </div>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-[#A5B1C2]">
              <div className="flex items-center justify-between">
                <span>অ্যাপের সাইজ:</span>
                <span className="font-mono text-white font-bold">4.8 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span>সর্বশেষ আপডেট:</span>
                <span className="font-mono text-white font-bold">আজকে (Latest v2.4)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>বিজ্ঞাপন:</span>
                <span className="font-mono text-[#16D98A] font-bold">সম্পূর্ণ অ্যাড-মুক্ত (০%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>লাইভ চ্যানেল:</span>
                <span className="font-mono text-[#00B7FF] font-bold">১০০০+ টিভি চ্যানেল</span>
              </div>
              <div className="flex items-center justify-between">
                <span>স্ট্রিমিং কোয়ালিটি:</span>
                <span className="font-mono text-white font-bold">1080p Ultra HD / 4K</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <Download className="w-4 h-4 fill-current" />
                <span>এখনই ডাউনলোড করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Simple Install Guides */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>ইন্সটল করার সহজ নিয়মাবলী (Installation Guide)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Android */}
          <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 shadow-lg space-y-3">
            <div className="p-3 rounded-xl bg-[#16D98A]/15 text-[#16D98A] w-fit">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">১. অ্যান্ড্রয়েড ফোন (Android)</h3>
            <p className="text-xs text-[#A5B1C2] leading-relaxed">
              উপরে <strong>"KhelaDek অ্যাপ ইন্সটল করুন"</strong> বাটনে চাপ দিন অথবা ব্রাউজারের ৩ ডট মেনু (⋮) থেকে <strong>"Install App"</strong> বা <strong>"Add to Home Screen"</strong> অপশনে চাপ দিন। অ্যাপটি কয়েক সেকেন্ডেই ফোনে চলে আসবে।
            </p>
          </div>

          {/* iOS / iPhone */}
          <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 shadow-lg space-y-3">
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 w-fit">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">২. আইফোন / আইপ্যাড (iOS Safari)</h3>
            <p className="text-xs text-[#A5B1C2] leading-relaxed">
              সাফারি ব্রাউজারের নিচের <strong>Share (শেয়ার)</strong> আইকনে চাপ দিন। তারপর তালিকা থেকে <strong>"Add to Home Screen"</strong> নির্বাচন করুন। হোমস্ক্রিনে KhelaDek অ্যাপ যুক্ত হয়ে যাবে।
            </p>
          </div>

          {/* PC / Laptop */}
          <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 shadow-lg space-y-3">
            <div className="p-3 rounded-xl bg-[#00B7FF]/15 text-[#00B7FF] w-fit">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">৩. কম্পিউটার / ল্যাপটপ (PC / Mac)</h3>
            <p className="text-xs text-[#A5B1C2] leading-relaxed">
              Google Chrome বা Edge ব্রাউজারের এড্রেস বারের ডানে থাকা <strong>"Install"</strong> আইকনে ক্লিক করুন অথবা সরাসরি <strong>"ইনস্ট্যান্ট অ্যাপ মোড"</strong> বোতামে চাপ দিয়ে ফুলস্ক্রিনে খেলা উপভোগ করুন।
            </p>
          </div>
        </div>
      </section>

      {/* Why App Only Guarantee */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#101722] via-[#141C28] to-[#101722] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 text-[#00B7FF] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              অ্যাপে খেলা দেখার বিশেষ সুবিধাসমূহ
            </h4>
            <p className="text-xs text-[#A5B1C2] mt-0.5">
              কোনো ধরণের পপআপ বিজ্ঞাপন নেই, কম মেগাবাইট খরচ, ৪-স্ক্রিন মাল্টিভিউ এবং স্যাটেলাইট ডিরেক্ট ফিড শুধুমাত্র অ্যাপ ব্যবহারকারীদের জন্য সংরক্ষিত।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAppMode}
          className="px-5 py-2.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold shrink-0 transition-all active:scale-95 shadow"
        >
          অ্যাপে খেলা চালু করুন
        </button>
      </div>
    </div>
  );
};
