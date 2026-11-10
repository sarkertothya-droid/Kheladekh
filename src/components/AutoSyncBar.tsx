import React, { useState } from 'react';
import { RefreshCw, Radio, ShieldCheck, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { SecurityCenterModal } from './SecurityCenterModal';

export const AutoSyncBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    events,
    autoSyncing,
    lastAutoSyncTime,
    nextSyncSeconds,
    syncLiveSportsFromGoogle,
  } = useData();

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const liveCount = events.filter((e) => e.published && e.status === 'LIVE').length;

  // Format MM:SS
  const mins = Math.floor(nextSyncSeconds / 60);
  const secs = nextSyncSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101722] border border-white/10 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-pulse" />
          <span className="text-[#A5B1C2] font-mono text-[11px]">সিঙ্ক: {timeFormatted}</span>
        </div>
        <button
          type="button"
          onClick={() => syncLiveSportsFromGoogle(false)}
          disabled={autoSyncing}
          className="p-1 rounded-lg text-[#00B7FF] hover:bg-white/10 transition-colors disabled:opacity-50"
          title="এখনই লাইভ স্কোর সিঙ্ক করুন"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101722] via-[#151E2B] to-[#101722] border border-white/10 p-3 sm:p-4 shadow-xl">
      {/* Subtle background glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00B7FF]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#16D98A]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Info: Live Status & Active Matches Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>লাইভ ব্রডকাস্ট ও স্কোর অটো-সিঙ্ক</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#16D98A]/15 border border-[#16D98A]/30 text-[#16D98A] text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16D98A] animate-ping" />
                <span>{liveCount}টি সরাসরি চলছে</span>
              </span>
            </div>
            <p className="text-[11px] text-[#A5B1C2] mt-0.5">
              প্রতি ৫ মিনিট পর পর স্বয়ংক্রিয়ভাবে নতুন লাইভ স্কোর ও স্ট্রিমিং সিঙ্ক হয়। সমাপ্ত ম্যাচ আলাদাভাবে সংরক্ষিত।
            </p>
          </div>
        </div>

        {/* Right Info: Countdown Timer & Sync Now Trigger */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {/* Security & Verification Pill */}
          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono transition-all cursor-pointer"
            title="লাইভ সিকিউরিটি ডায়াগনস্টিক রিপোর্ট দেখুন"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>সিকিউরিটি শিল্ড সক্রিয়</span>
          </button>

          {/* 5-Minute Countdown Display */}
          <div className="px-3 py-1.5 rounded-xl bg-[#080B12] border border-white/10 flex items-center gap-2 font-mono text-xs text-white">
            <span className="text-[10px] text-[#A5B1C2] uppercase">পরবর্তী সিঙ্ক</span>
            <span className="font-black text-[#00B7FF] tracking-wider text-sm tabular-nums">
              {timeFormatted}
            </span>
          </div>

          {/* Manual Trigger Button */}
          <button
            type="button"
            onClick={() => syncLiveSportsFromGoogle(false)}
            disabled={autoSyncing}
            className="px-3.5 py-1.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#00B7FF]/20 active:scale-95 disabled:opacity-50"
            title="সার্ভার থেকে এখনই সর্বশেষ লাইভ স্কোর ও খেলা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoSyncing ? 'animate-spin' : ''}`} />
            <span>{autoSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক করুন'}</span>
          </button>
        </div>
      </div>

      {lastAutoSyncTime && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
          <span>সর্বশেষ সফল সিঙ্ক: {lastAutoSyncTime}</span>
          <span className="text-[#00B7FF]/70 flex items-center gap-1">
            <Zap className="w-3 h-3" /> রিয়েলটাইম Google Grounded Feed
          </span>
        </div>
      )}
    </div>
    <SecurityCenterModal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} />
    </>
  );
};
