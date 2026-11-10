import React from 'react';
import {
  Sparkles,
  Layers,
  Radio,
  Tv,
  Flame,
  ShieldCheck,
  Zap,
  Volume2,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { MultiViewGrid } from '../components/MultiViewGrid';
import { StadiumSoundboard } from '../components/StadiumSoundboard';
import { MomentumRadar } from '../components/MomentumRadar';

export const StadiumPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Title & Super-Exclusive Badge */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101722] via-[#172233] to-[#101722] border border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00B7FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#16D98A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#00B7FF]/20 to-[#16D98A]/20 border border-[#00B7FF]/30 text-[#00B7FF] text-xs font-mono font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>১০০% এক্সক্লুসিভ ফিচার • শুধু KhelaDekH-এ বিদ্যমান</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>স্টেডিয়াম স্টুডিও প্রো™</span>
              <span className="text-sm sm:text-base font-mono px-2.5 py-0.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                QUAD 4X
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#A5B1C2] max-w-2xl mt-2 leading-relaxed">
              অন্য কোনো ওয়েবসাইটে এমন সুবিধা নেই! একই সাথে ৪টি লাইভ খেলা বা টিভি চ্যানেল দেখুন, এক ক্লিকে যেকোনো স্ক্রিনের সাউন্ড শুনুন এবং ওয়েব অডিও সিন্থেসাইজারে স্টেডিয়ামের ভুভুজেলা ও করতালির শব্দ বাজিয়ে সত্যিকারের গ্যালারির রোমাঞ্চ অনুভব করুন।
            </p>
          </div>

          {/* Quick Feature Pills */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[#080B12]/80 border border-white/10 text-[11px] font-mono text-[#16D98A] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>৪-স্ক্রিন সিঙ্ক ও অ্যাম্বিলাইট</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#080B12]/80 border border-white/10 text-[11px] font-mono text-[#00B7FF] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>স্মার্ট অডিও ইন্টারসেপ্ট</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#080B12]/80 border border-white/10 text-[11px] font-mono text-purple-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>স্টেডিয়াম ক্রাউড সিন্থেসাইজার</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Feature: The Master 4-Screen Multi-View Engine */}
      <section>
        <MultiViewGrid />
      </section>

      {/* Two Column Grid: Virtual Stadium Soundboard + AI Momentum Radar */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StadiumSoundboard />
        <MomentumRadar />
      </section>

      {/* Exclusive Feature Guarantee Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101722]/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16D98A]/15 border border-[#16D98A]/30 text-[#16D98A] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              KhelaDekH উদ্ভাবনী গ্যারান্টি (Exclusive Tech)
            </h4>
            <p className="text-xs text-[#A5B1C2] mt-0.5">
              মাল্টি-স্ক্রিন অডিও রুট, ব্রাউজার-লেভেল সাউন্ড সিন্থেসিস এবং ৫-সেকেন্ড ইনস্ট্যান্ট রিপ্লে কোনো থার্ড পার্টি সাইটে পাওয়া অসম্ভব।
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-[#151E2B] border border-white/10 text-[11px] font-mono text-[#00B7FF]">
            Ultra HD 1080p + Zero Latency
          </span>
        </div>
      </div>
    </div>
  );
};
