import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  Tv,
  CheckCircle2,
  HardDrive,
  Laptop,
  Apple,
  ExternalLink,
  Flame,
  Radio,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Wifi,
  Play,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppSplashScreen } from '../components/AppSplashScreen';
import { downloadKhelaDekBinaryApk } from '../utils/apkDownloader';

interface AppDownloadPageProps {
  onOpenApp?: () => void;
}

export const AppDownloadPage: React.FC<AppDownloadPageProps> = ({ onOpenApp }) => {
  const { isInstallable, install, enterAppMode } = usePWAInstall();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDownloadClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setDownloadError(null);
    setDownloadStarted(true);

    await downloadKhelaDekBinaryApk((progress, statusText) => {
      setDownloadProgress(progress);
      setDownloadStatusText(statusText);
    });
  };

  const handleOpenInNewTab = () => {
    const directUrl = window.location.origin;
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLaunchApp = () => {
    setShowSplash(true);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    enterAppMode();
    if (onOpenApp) {
      onOpenApp();
    } else {
      window.location.href = '/fixtures';
    }
  };

  const faqs = [
    {
      q: 'ওয়েবসাইটে কেন সরাসরি খেলা দেখা যাচ্ছে না?',
      a: 'ওয়েব ব্রাউজারে উচ্চগতির আনলিমিটেড স্ট্রিমিং ব্যাহত হয় এবং বাফারিংয়ের সমস্যা তৈরি হয়। তাই দর্শকরা যেন কোনো প্রকার বাফারিং ছাড়া ক্রিস্টাল ক্লিয়ার ১০৮০p ফুল এইচডিতে খেলা দেখতে পারেন, সেজন্য লাইভ স্ট্রিমিং শুধুমাত্র অফিশিয়াল KhelaDek APK অ্যাপে সংরক্ষিত রাখা হয়েছে। ওয়েবে শুধু অ্যাপ ডাউনলোড ও ম্যাচ শিডিউল তথ্য পাওয়া যাবে।',
    },
    {
      q: 'KhelaDek APK ডাউনলোড ও ইনস্টল করা কি নিরাপদ?',
      a: 'হ্যাঁ, KhelaDek APK ফাইলটি গুগল প্লে প্রটেক্ট স্ট্যান্ডার্ড অনুযায়ী স্ক্যানকৃত এবং শতভাগ নিরাপদ, ভাইরাস ও ম্যালওয়্যার মুক্ত। কোনো রুট পারমিশন বা অপ্রয়োজনীয় অ্যাক্সেসের প্রয়োজন নেই।',
    },
    {
      q: 'কীভাবে অ্যান্ড্রয়েড ফোনে APK ইনস্টল করবেন?',
      a: 'ডাউনলোড বাটনে ক্লিক করার পর ব্রাউজারে যদি "File might be harmful" বা "ডাউনলোড চালিয়ে যেতে চান?" ওয়ার্নিং দেখায়, তখন "Download anyway" চাপুন। ডাউনলোড শেষ হলে ফাইলটিতে ট্যাপ করে "Install" সিলেক্ট করলেই অ্যাপ ইনস্টল হয়ে যাবে। প্রয়োজনে Settings থেকে "Install unknown apps" অন করে দিন।',
    },
    {
      q: 'অ্যান্ড্রয়েড স্মার্ট টিভি বা অ্যান্ড্রয়েড টিভিবক্সে কি এটি চলবে?',
      a: 'হ্যাঁ! KhelaDek APK ফাইলটি আপনি সরাসরি পেনড্রাইভ বা "Send files to TV" অ্যাপের মাধ্যমে আপনার অ্যান্ড্রয়েড টিভিতে ট্রান্সফার করে ইনস্টল করতে পারবেন এবং বড় পর্দায় ১০০০+ টিভি চ্যানেল ও লাইভ খেলা দেখতে পারবেন।',
    },
    {
      q: 'আইফোন (iPhone) বা কম্পিউটারে কি খেলা দেখা যাবে?',
      a: 'আইফোন ও কম্পিউটারের জন্য PWA ইনস্টলেশন রয়েছে। আইফোনে Safari ব্রাউজার থেকে Share -> "Add to Home Screen" করলেই KhelaDek অ্যাপ যুক্ত হয়ে যাবে।',
    },
  ];

  return (
    <>
      {showSplash && <AppSplashScreen onFinish={handleSplashFinish} />}

      <div className="space-y-12 animate-fade-in pb-24">
        {/* Top Banner Notice: Web is Download-Only */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-[#00B7FF]/15 to-red-500/15 border border-red-500/30 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 font-bold shrink-0">
              🚫 নোটিশ
            </span>
            <p className="text-white font-medium">
              <strong className="text-red-400">ওয়েবে কোনো সরাসরি খেলা চলবে না!</strong> সব লাইভ খেলা ও ১০০০+ টিভি চ্যানেল দেখতে নিচে থেকে অফিশিয়াল KhelaDek APK ডাউনলোড করুন।
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadClick}
              className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 fill-current" />
              <span>APK নামান</span>
            </button>
            <button
              type="button"
              onClick={handleLaunchApp}
              className="px-3.5 py-1.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] font-black text-xs flex items-center gap-1 transition-all shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>অ্যাপ খুলুন</span>
            </button>
          </div>
        </div>

        {/* Old File Warning & Solution Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/15 to-red-500/20 border-2 border-red-500/40 space-y-2 text-white">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm sm:text-base">
            <span className="p-1 rounded bg-red-500/20">⚠️</span>
            <span>ফোনে "Cookie check / Action required" স্ক্রিন দেখানোর কারণ ও সমাধান:</span>
          </div>
          <div className="text-xs sm:text-sm text-[#E2E8F0] space-y-1.5 pl-6 leading-relaxed">
            <p>
              • আপনার ফোনের <strong>Downloads</strong> ফোল্ডারে পূর্বে সেভ হওয়া ফাইলটির নাম ছিল <code className="text-amber-300 font-mono bg-black/40 px-1 py-0.5 rounded">KhelaDek-v2.4.0.apk...html</code> (এটি অ্যাপ ছিল না, গুগলের একটি ওয়েবপেজ ছিল)। ঐ পুরনো ফাইলে ক্লিক করলে এই কুকি স্ক্রিনটি আসে।
            </p>
            <p className="text-emerald-400 font-bold">
              ✔ সমাধান: আপনার ফোনের ফাইল ম্যানেজার বা "Downloads" থেকে পুরনো KhelaDek....html ফাইলগুলো ডিলিট করে দিন। এরপর নিচের বড় বাটনে চাপুন—ফোনে সরাসরি আসল ৭.৩২ MB APK ফাইল ডাউনলোড হবে!
            </p>
          </div>
        </div>

        {/* Hero Section: Primary APK Download Centerpiece */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101722] via-[#141C28] to-[#0A0E17] border-2 border-[#00B7FF]/50 p-6 sm:p-10 lg:p-12 shadow-2xl shadow-cyan-950/40">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B7FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#16D98A]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Text & Download CTA */}
            <div className="space-y-5 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00B7FF]/20 to-[#16D98A]/20 border border-[#00B7FF]/40 text-[#00B7FF] text-xs font-mono font-bold mx-auto lg:mx-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>KhelaDek Official Android APK (v2.4.0)</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                খেলা দেখতে <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A]">KhelaDek APK</span> ডাউনলোড করুন
              </h1>

              <p className="text-sm sm:text-base text-[#A5B1C2] leading-relaxed">
                ওয়েবে সরাসরি কোনো খেলা চলবে না। সব ধরনের লাইভ ক্রিকেট, ফুটবল, ৪-স্ক্রিন স্টেডিয়াম স্টুডিও এবং ১০০০+ টিভি চ্যানেল সম্পূর্ণ বাফারমুক্ত ও বিজ্ঞাপনহীন দেখতে এখনই আপনার ফোনে অফিশিয়াল KhelaDek অ্যান্ড্রয়েড APK অ্যাপটি ডাউনলোড করে নিন।
              </p>

              {/* Verification & Spec Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 text-xs font-mono text-white">
                <span className="px-3 py-1.5 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-1.5 shadow">
                  <HardDrive className="w-3.5 h-3.5 text-[#16D98A]" />
                  <span>সাইজ: ৭.৩ MB</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-1.5 shadow">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00B7FF]" />
                  <span>১০০% বিজ্ঞাপনমুক্ত ও নিরাপদ</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-1.5 shadow">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Android 5.0+ ও Smart TV</span>
                </span>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] text-[#080B12] font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#00B7FF]/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer ring-2 ring-white/30"
                >
                  <Download className="w-6 h-6 fill-current animate-bounce" />
                  <span>KhelaDek APK ডাউনলোড (৭.৩ MB)</span>
                </button>

                <a
                  href="/api/download-apk"
                  download="KhelaDek-v2.4.0.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-6 rounded-2xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow"
                >
                  <FileCheck className="w-4 h-4 text-[#00B7FF]" />
                  <span>বিকল্প ডিরেক্ট মিরর</span>
                </a>

                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="py-4 px-5 rounded-2xl bg-[#080B12] hover:bg-[#151E2B] border border-[#00B7FF]/40 text-[#00B7FF] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow"
                  title="গুগল প্রিভিউ ফ্রেমের বাইরে সরাসরি নতুন ট্যাবে খুলুন"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>নতুন ট্যাবে খুলুন</span>
                </button>
              </div>

              {/* Progress & Status Indicator */}
              {downloadProgress !== null && (
                <div className="p-4 rounded-2xl bg-[#080B12] border border-[#00B7FF]/40 space-y-2 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#00B7FF] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>{downloadStatusText || 'আসল বাইনারি APK প্রস্তুত হচ্ছে...'}</span>
                    </span>
                    <span className="text-[#16D98A] font-bold">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00B7FF] to-[#16D98A] transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A5B1C2]">
                    ৭,৬৭৮,৪২৩ বাইট (৭.৩ MB) KhelaDek APK মেমোরি থেকে আপনার ফোনে সেভ হচ্ছে।
                  </p>
                </div>
              )}

              {downloadStarted && downloadProgress === 100 && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">
                      আপনার ফোনে <strong>KhelaDek-v2.4.0.apk</strong> ফাইলটি ডাউনলোড সম্পন্ন হয়েছে!
                    </p>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      ফোনের নোটিফিকেশন বার থেকে ফাইলটিতে ট্যাপ করে <strong>"Install"</strong> চাপুন। কোনো সমস্যা হলে ওপরের <strong>"অ্যাপে খেলা দেখুন"</strong> বাটনে ক্লিক করে সরাসরি ওয়েব অ্যাপেও খেলা উপভোগ করতে পারবেন।
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Cookie Check Helper Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
                <span className="p-1 rounded bg-amber-500/20 text-amber-300 shrink-0 font-bold">
                  💡 টিপস
                </span>
                <div className="space-y-1">
                  <p className="leading-snug">
                    ফোনে <strong>"Cookie check"</strong> বা <strong>"Action required"</strong> দেখালে: ওপরের <strong>"নতুন ট্যাবে খুলুন"</strong> বাটনে চাপ দিন অথবা সরাসরি ক্রোম/সাফারি ব্রাউজারে লিংকটি খুলুন। কোনো প্রকার কুকি সমস্যা ছাড়াই আসল APK ডাউনলোড হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Right Phone Mockup Card */}
            <div className="relative w-full max-w-xs sm:max-w-sm shrink-0">
              {/* Phone Bezel */}
              <div className="relative rounded-[40px] p-3 bg-gradient-to-b from-[#222F43] via-[#151E2B] to-[#0A0E17] border-4 border-[#00B7FF]/50 shadow-2xl shadow-cyan-500/20">
                <div className="rounded-[32px] overflow-hidden bg-[#080B12] border border-white/10 p-4 space-y-4">
                  {/* Phone Notch & Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <img
                        src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
                        alt="KhelaDek App Icon"
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#00B7FF]"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white">KhelaDek App</h4>
                        <p className="text-[10px] text-[#16D98A] font-mono">v2.4.0 • Verified</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[9px] font-bold">
                      LIVE STREAM
                    </span>
                  </div>

                  {/* Simulated App Video Screen */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80"
                      alt=""
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white">
                      <span className="font-bold">🔴 BAN vs SL — Live</span>
                      <span className="font-mono bg-[#00B7FF] text-[#080B12] px-1.5 py-0.2 rounded font-black">
                        1080p
                      </span>
                    </div>
                  </div>

                  {/* App Features Mini List */}
                  <div className="space-y-2 text-[11px] text-[#A5B1C2]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span>📺 লাইভ টিভি চ্যানেল:</span>
                      <strong className="text-white">১০০০+ চ্যানেল</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span>⚡ আল্ট্রা এইচডি সার্ভার:</span>
                      <strong className="text-[#16D98A]">৫টি সার্ভার ব্যাকআপ</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span>🏟️ স্টেডিয়াম মাল্টিভিউ:</span>
                      <strong className="text-[#00B7FF]">৪-স্ক্রিন সুবিধা</strong>
                    </div>
                  </div>

                  {/* Direct Mockup Action Button */}
                  <button
                    type="button"
                    onClick={handleLaunchApp}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00B7FF] to-[#16D98A] text-[#080B12] font-black text-xs flex items-center justify-center gap-2 shadow hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>অ্যাপে প্রবেশ করুন (Launch App)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 100% Ad-Free Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#16D98A]/10 to-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">সম্পূর্ণ বিজ্ঞাপনমুক্ত অভিজ্ঞতা (100% Ad-Free)</h4>
              <p className="text-xs text-[#A5B1C2]">KhelaDek অ্যাপে কোনো প্রকার পপআপ বা অপ্রীতিকর বিজ্ঞাপন নেই। সরাসরি খেলা দেখুন।</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLaunchApp}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#080B12] text-xs font-black shrink-0 transition-all shadow"
          >
            খেলা শুরু করুন &rarr;
          </button>
        </div>

        {/* 3-Step Simple Installation Guide */}
        <section id="install-guide" className="space-y-6 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              সহজ ৩ ধাপে কীভাবে ফোনে APK ইনস্টল করবেন?
            </h2>
            <p className="text-xs sm:text-sm text-[#A5B1C2]">
              KhelaDek APK ডাউনলোড ও ইনস্টল করা একদম সহজ। নিচের ধাপগুলো অনুসরণ করুন:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-[#101722] border border-white/10 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 text-[#00B7FF] font-black font-display text-lg flex items-center justify-center">
                ১
              </div>
              <h3 className="font-bold text-lg text-white">ধাপ ১: APK ডাউনলোড</h3>
              <p className="text-xs sm:text-sm text-[#A5B1C2] leading-relaxed">
                উপরের <strong>"KhelaDek APK ডাউনলোড করুন"</strong> বাটনে ক্লিক করুন। সাথে সাথে আপনার ব্রাউজারে ৭.৩ MB সাইজের APK ফাইলটি ডাউনলোড হওয়া শুরু হবে।
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-[#101722] border border-white/10 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 font-black font-display text-lg flex items-center justify-center">
                ২
              </div>
              <h3 className="font-bold text-lg text-white">ধাপ ২: অনুমতি প্রদান (Allow)</h3>
              <p className="text-xs sm:text-sm text-[#A5B1C2] leading-relaxed">
                ডাউনলোড শেষ হলে ফাইলটিতে ট্যাপ করুন। ব্রাউজারে অনুমতি চাইলে <strong>"Settings"</strong>-এ গিয়ে <strong>"Allow from this source"</strong> বা <strong>"Install unknown apps"</strong> অন করুন।
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-[#101722] border border-white/10 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#16D98A]/15 border border-[#16D98A]/30 text-[#16D98A] font-black font-display text-lg flex items-center justify-center">
                ৩
              </div>
              <h3 className="font-bold text-lg text-white">ধাপ ৩: ইনস্টল ও খেলা উপভোগ</h3>
              <p className="text-xs sm:text-sm text-[#A5B1C2] leading-relaxed">
                এবার <strong>"Install"</strong> বাটনে চাপ দিন। ২ সেকেন্ডেই অ্যাপ ইনস্টল হয়ে যাবে। এবার KhelaDek ওপেন করে সব লাইভ খেলা ও ১০০০+ টিভি চ্যানেল উপভোগ করুন!
              </p>
            </div>
          </div>
        </section>

        {/* What You Get Exclusively in the KhelaDek App */}
        <section id="features" className="space-y-6 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16D98A]/10 border border-[#16D98A]/30 text-[#16D98A] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>EXCLUSIVES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              KhelaDek অ্যাপে যা যা সুবিধা পাবেন
            </h2>
            <p className="text-xs sm:text-sm text-[#A5B1C2]">
              ওয়েবসাইটে কোনো সরাসরি খেলা থাকবে না, এই সব অসাধারণ ফিচার শুধুমাত্র অফিশিয়াল KhelaDek অ্যাপে সংরক্ষিত:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-2.5">
              <div className="p-3 rounded-xl bg-red-500/15 text-red-400 w-fit">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">১০০০+ লাইভ টিভি চ্যানেল</h3>
              <p className="text-xs text-[#A5B1C2] leading-relaxed">
                টি স্পোর্টস, জিটিভি, স্টার স্পোর্টস ১/২/৩, সনি টেন ১/২/৩/৫, পিটিভি স্পোর্টসসহ দেশি-বিদেশি ১০০০+ স্পোর্টস ও এন্টারটেইনমেন্ট চ্যানেল।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-2.5">
              <div className="p-3 rounded-xl bg-[#00B7FF]/15 text-[#00B7FF] w-fit">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">৫টি আল্ট্রা এইচডি সার্ভার (No Buffer)</h3>
              <p className="text-xs text-[#A5B1C2] leading-relaxed">
                কোনো সার্ভার আটকে গেলে সাথে সাথে অন্য সার্ভারে সুইচ করার সুবিধা। দুর্বল নেটওয়ার্কেও ৩৬০p থেকে ১০৮০p স্পষ্ট স্ট্রিমিং।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-2.5">
              <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">৪-স্ক্রিন স্টেডিয়াম মাল্টিভিউ</h3>
              <p className="text-xs text-[#A5B1C2] leading-relaxed">
                একসাথে ৪টি আলাদা ম্যাচ বা টিভি চ্যানেল দেখার অনন্য সুবিধা। যেকোনো স্ক্রিনে ট্যাপ করলেই অডিও সুইচ হবে।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-2.5">
              <div className="p-3 rounded-xl bg-amber-400/15 text-amber-400 w-fit">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">ইনস্ট্যান্ট ৫-সেকেন্ড রিপ্লে</h3>
              <p className="text-xs text-[#A5B1C2] leading-relaxed">
                খেলায় কোনো চার, ছক্কা বা গোলের মুহূর্ত মিস হলে ১ ক্লিকে ৫ সেকেন্ড পূর্বে গিয়ে মুহূর্তটি পুনরায় দেখার বাটন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-2.5">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">১০০% নিরাপদ ও অ্যাড-ফ্রি প্লেয়ার</h3>
              <p className="text-xs text-[#A5B1C2] leading-relaxed">
                অ্যাপের প্লেয়ারে কোনো বিরক্তিকর ওভারলে বা ব্যানার বিজ্ঞাপন নেই। নিরবচ্ছিন্নভাবে খেলা উপভোগ করুন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101722] border border-white/10 space-y-2.5">
              <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 w-fit">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">স্মার্ট টিভি ও টিভিবক্স সাপোর্ট</h3>
              <p className="text-xs text-[#A5B1C2] leading-relaxed">
                যেকোনো অ্যান্ড্রয়েড স্মার্ট টিভি বা অ্যান্ড্রয়েড টিভিবক্সে ফুলস্ক্রিন রিমোট সাপোর্ট সহ সরাসরি খেলা দেখা যাবে।
              </p>
            </div>
          </div>
        </section>

        {/* APK Technical Specifications Table */}
        <section id="specs" className="p-6 sm:p-8 rounded-3xl bg-[#101722] border border-white/10 space-y-4 shadow-xl scroll-mt-20">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#00B7FF]" />
            <span>KhelaDek APK স্পেসিফিকেশন ও বিবরণ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#080B12] border border-white/5">
              <span className="text-[#A5B1C2] block text-[10px]">অ্যাপের নাম:</span>
              <span className="text-white font-bold text-sm">KhelaDek (খেলদেখ)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#080B12] border border-white/5">
              <span className="text-[#A5B1C2] block text-[10px]">প্যাকেজ নাম:</span>
              <span className="text-[#00B7FF] font-bold text-sm">com.kheladek.app</span>
            </div>
            <div className="p-3 rounded-xl bg-[#080B12] border border-white/5">
              <span className="text-[#A5B1C2] block text-[10px]">ভার্সন:</span>
              <span className="text-[#16D98A] font-bold text-sm">v2.4.0 (Latest Release)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#080B12] border border-white/5">
              <span className="text-[#A5B1C2] block text-[10px]">ফাইল সাইজ:</span>
              <span className="text-white font-bold text-sm">৭.৩২ MB (7,678,423 Bytes)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#080B12] border border-white/5">
              <span className="text-[#A5B1C2] block text-[10px]">সাপোর্টেড অপারেটিং সিস্টেম:</span>
              <span className="text-amber-400 font-bold text-sm">Android 5.0 up to Android 15</span>
            </div>
            <div className="p-3 rounded-xl bg-[#080B12] border border-white/5">
              <span className="text-[#A5B1C2] block text-[10px]">লাইসেন্স ও মূল্য:</span>
              <span className="text-emerald-400 font-bold text-sm">১০০% ফ্রি (Free Download)</span>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQ) Accordion */}
        <section id="faq" className="space-y-4 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              সাধারণ প্রশ্ন ও উত্তর (FAQ)
            </h2>
            <p className="text-xs text-[#A5B1C2]">
              অ্যাপ ডাউনলোড ও ব্যবহার সম্পর্কিত যেকোনো তথ্যের জন্য নিচের উত্তরগুলো দেখুন:
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-[#101722] border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-3 hover:text-[#00B7FF] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#00B7FF] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#A5B1C2] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#A5B1C2] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A5B1C2] leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Floating Sticky Bottom Download Bar for Mobile */}
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-[#080B12]/95 backdrop-blur-lg border-t border-white/10 shadow-2xl flex items-center justify-between gap-3 sm:hidden">
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
              alt=""
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#00B7FF]"
            />
            <div className="leading-tight">
              <span className="text-xs font-bold text-white block">KhelaDek APK</span>
              <span className="text-[10px] text-[#16D98A] font-mono">v2.4.0 (৭.৩ MB)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownloadClick}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00B7FF] to-[#16D98A] text-[#080B12] font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 fill-current" />
              <span>ডাউনলোড</span>
            </button>
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="py-2.5 px-2.5 rounded-xl bg-[#151E2B] text-[#00B7FF] font-bold text-xs flex items-center gap-1 border border-white/20 active:scale-95 cursor-pointer"
              title="নতুন ব্রাউজার ট্যাবে খুলুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ট্যাব</span>
            </button>
            <button
              type="button"
              onClick={handleLaunchApp}
              className="py-2.5 px-2.5 rounded-xl bg-[#151E2B] text-white font-bold text-xs flex items-center gap-1 border border-white/20 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#16D98A] fill-current" />
              <span>ওপেন</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
