import React, { useEffect, useState } from 'react';
import {
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { PreRollAdConfig } from '../types';
import { recordAdImpression } from '../services/adService';

interface PreRollAdModalProps {
  config?: PreRollAdConfig;
  isOpen: boolean;
  onClose: () => void;
  contextText?: string;
}

export const PreRollAdModal: React.FC<PreRollAdModalProps> = ({
  config,
  isOpen,
  onClose,
  contextText = 'খেলা শুরু হওয়ার পূর্বে সংক্ষিপ্ত বিজ্ঞাপন',
}) => {
  const duration = config?.durationSeconds || 12;
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown when opened
    setTimeLeft(duration);
    setCanSkip(false);

    // Record impression immediately so 12-hour lock begins
    recordAdImpression();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, duration]);

  // When time hits 0, allow user to close or auto-dismiss after brief moment
  useEffect(() => {
    if (timeLeft === 0) {
      setCanSkip(true);
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(autoCloseTimer);
    }
  }, [timeLeft, onClose]);

  if (!isOpen) return null;

  const title = config?.title || 'KhelaDekH অফিসিয়াল স্পোর্টস স্পন্সর অফার';
  const description =
    config?.description ||
    'আজকের লাইভ ক্রিকেট ও ফুটবল ম্যাচ উপভোগ করুন বাফারিংহীন আল্ট্রা এইচডি কোয়ালিটিতে! এখনই অফারটি দেখে নিন।';
  const targetUrl = config?.targetUrl || 'https://kheladekh.vercel.app/sports';
  const ctaText = config?.ctaText || 'অফারটি দেখুন (Claim Offer)';
  const imageUrl =
    config?.imageUrl ||
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80';

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / duration) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#0f1724] border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Badge, Cooldown Notice, and Countdown Clock */}
        <div className="bg-[#151E2B] px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
              {config?.badgeText || 'স্পন্সর বিজ্ঞাপন (Sponsored Ad)'}
            </span>
            <span className="hidden sm:inline-block text-[11px] text-[#A5B1C2] border-l border-white/15 pl-2">
              🔒 পরবর্তী ১২ ঘণ্টা এই বিজ্ঞাপনটি আর আসবে না
            </span>
          </div>

          {/* 12s Countdown Pill */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>
                {timeLeft > 0 ? `${timeLeft} সেকেন্ড...` : 'শেষ হয়েছে ✓'}
              </span>
            </div>

            {canSkip && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="বিজ্ঞাপন বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (smooth 12s animation) */}
        <div className="w-full bg-white/5 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-[#00B7FF] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Ad Media Banner */}
          <div className="relative aspect-video sm:aspect-[21/9] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group shadow-lg bg-black/40">
            <img
              src={imageUrl}
              alt="Ad Sponsor Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00B7FF] text-[#080B12] text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  এক্সক্লুসিভ অফার
                </span>
                <h3 className="font-display text-lg sm:text-2xl font-black text-white leading-tight">
                  {title}
                </h3>
              </div>
            </div>
          </div>

          {/* Ad Text & Description */}
          <div className="bg-[#151E2B] rounded-xl p-3.5 border border-white/5 space-y-2">
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#A5B1C2] pt-1 border-t border-white/5">
              <span className="flex items-center gap-1 text-[#16D98A]">
                <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফায়েড পার্টনার
              </span>
              <span>• ১২ সেকেন্ডের পর সরাসরি খেলা শুরু হবে</span>
              <span className="text-[#00B7FF]">• ১২ ঘণ্টার ফ্রিকোয়েন্সি লিমিট সক্রিয়</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-[#151E2B] px-4 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#A5B1C2] text-center sm:text-left">
            {contextText}
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* CTA Sponsor Link Button */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>{ctaText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Skip / Watch Match Button */}
            <button
              type="button"
              disabled={!canSkip}
              onClick={onClose}
              className={`flex-1 sm:flex-none min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                canSkip
                  ? 'bg-[#16D98A] hover:bg-[#1fe294] text-[#080B12] shadow-[#16D98A]/25'
                  : 'bg-white/10 text-[#A5B1C2] border border-white/10 cursor-not-allowed opacity-80'
              }`}
            >
              {canSkip ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>খেলা শুরু করুন (Watch Match)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft} সেকেন্ড অপেক্ষা করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
