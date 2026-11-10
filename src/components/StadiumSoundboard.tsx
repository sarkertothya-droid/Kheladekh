import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Radio, Flame, Zap } from 'lucide-react';
import { stadiumAudio } from '../services/stadiumAudioService';

interface StadiumSoundboardProps {
  className?: string;
  compact?: boolean;
}

export const StadiumSoundboard: React.FC<StadiumSoundboardProps> = ({
  className = '',
  compact = false,
}) => {
  const [ambientActive, setAmbientActive] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  useEffect(() => {
    stadiumAudio.setVolume(volume);
  }, [volume]);

  const triggerSound = (name: string, fn: () => void) => {
    setActiveSound(name);
    try {
      fn();
    } catch (e) {
      console.warn('Audio play error:', e);
    }
    setTimeout(() => {
      setActiveSound((prev) => (prev === name ? null : prev));
    }, 1800);
  };

  const handleToggleAmbient = () => {
    const newState = stadiumAudio.toggleAmbientLoop();
    setAmbientActive(newState);
  };

  if (compact) {
    return (
      <div className={`p-2.5 rounded-2xl bg-[#101722]/90 border border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar ${className}`}>
        <button
          type="button"
          onClick={handleToggleAmbient}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shrink-0 transition-all ${
            ambientActive
              ? 'bg-[#16D98A]/20 text-[#16D98A] border border-[#16D98A]/40'
              : 'bg-[#151E2B] text-[#A5B1C2] border border-white/5 hover:text-white'
          }`}
          title="স্টেডিয়াম ব্যাকগ্রাউন্ড ক্রাউড সাউন্ড চালু/বন্ধ করুন"
        >
          <Radio className={`w-3.5 h-3.5 ${ambientActive ? 'animate-pulse text-[#16D98A]' : ''}`} />
          <span>ক্রাউড {ambientActive ? 'অন' : 'অফ'}</span>
        </button>

        <button
          type="button"
          onClick={() => triggerSound('vuvuzela', () => stadiumAudio.playVuvuzela())}
          className="px-2.5 py-1.5 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/10 text-xs font-semibold text-white shrink-0 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>🎺 ভুভুজেলা</span>
        </button>
        <button
          type="button"
          onClick={() => triggerSound('applause', () => stadiumAudio.playApplause())}
          className="px-2.5 py-1.5 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/10 text-xs font-semibold text-white shrink-0 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>👏 করতালি</span>
        </button>
        <button
          type="button"
          onClick={() => triggerSound('roar', () => stadiumAudio.playCrowdRoar())}
          className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-300 shrink-0 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>📣 গোল গর্জন</span>
        </button>
        <button
          type="button"
          onClick={() => triggerSound('dhol', () => stadiumAudio.playStadiumDhol())}
          className="px-2.5 py-1.5 rounded-xl bg-[#00B7FF]/15 hover:bg-[#00B7FF]/25 border border-[#00B7FF]/30 text-xs font-semibold text-[#00B7FF] shrink-0 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>🥁 ঢোল</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#101722] via-[#151E2B] to-[#0D131D] border border-white/10 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Dynamic ambient glow behind board */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#00B7FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#16D98A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#00B7FF]/20 to-[#16D98A]/20 border border-white/10 text-[#00B7FF]">
            <Sparkles className="w-5 h-5 text-[#00B7FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                স্টেডিয়াম সাউন্ড সিন্থেসাইজার (Stadium FX)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-[#00B7FF]/15 border border-[#00B7FF]/30 text-[#00B7FF] text-[10px] font-mono font-bold">
                এক্সক্লুসিভ
              </span>
            </div>
            <p className="text-xs text-[#A5B1C2] mt-0.5">
              অন্য কোনো ওয়েবসাইটে নেই! ব্রাউজার থেকে সরাসরি রিয়েল স্টেডিয়াম সাউন্ড বাজিয়ে খেলা উপভোগ করুন।
            </p>
          </div>
        </div>

        {/* Ambient Loop & Master Volume */}
        <div className="flex items-center gap-3">
          {/* Continuous Ambient Noise Toggle */}
          <button
            type="button"
            onClick={handleToggleAmbient}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
              ambientActive
                ? 'bg-[#16D98A] text-[#080B12] shadow-lg shadow-[#16D98A]/30'
                : 'bg-[#1E293B] hover:bg-[#2A374A] text-white border border-white/10'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${ambientActive ? 'animate-pulse' : ''}`} />
            <span>{ambientActive ? 'লাইভ গ্যালারি রোর চালু' : 'গ্যালারি নয়েজ চালু করুন'}</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#080B12] border border-white/10">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#64748B]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#00B7FF]" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#00B7FF] h-1.5 bg-[#1E293B] rounded-lg cursor-pointer"
              title="সাউন্ড ভলিউম"
            />
          </div>
        </div>
      </div>

      {/* 5 Sound Effect Launch Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* 1. Vuvuzela */}
        <button
          type="button"
          onClick={() => triggerSound('vuvuzela', () => stadiumAudio.playVuvuzela(2.2))}
          className={`p-3 rounded-xl border text-left transition-all active:scale-95 group relative overflow-hidden ${
            activeSound === 'vuvuzela'
              ? 'bg-[#00B7FF]/20 border-[#00B7FF] shadow-lg shadow-[#00B7FF]/30'
              : 'bg-[#151E2B] hover:bg-[#1E293B] border-white/10 hover:border-[#00B7FF]/50'
          }`}
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎺</div>
          <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-between">
            <span>ভুভুজেলা হর্ন</span>
            <span className="text-[10px] font-mono text-[#A5B1C2]">Horn</span>
          </div>
          <div className="text-[11px] text-[#A5B1C2] mt-0.5">স্টেডিয়ামের জোরালো ভুভুজেলা</div>
          {activeSound === 'vuvuzela' && (
            <div className="absolute inset-0 bg-[#00B7FF]/10 animate-ping pointer-events-none rounded-xl" />
          )}
        </button>

        {/* 2. Crowd Applause */}
        <button
          type="button"
          onClick={() => triggerSound('applause', () => stadiumAudio.playApplause(2.6))}
          className={`p-3 rounded-xl border text-left transition-all active:scale-95 group relative overflow-hidden ${
            activeSound === 'applause'
              ? 'bg-[#16D98A]/20 border-[#16D98A] shadow-lg shadow-[#16D98A]/30'
              : 'bg-[#151E2B] hover:bg-[#1E293B] border-white/10 hover:border-[#16D98A]/50'
          }`}
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">👏</div>
          <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-between">
            <span>স্টেডিয়াম করতালি</span>
            <span className="text-[10px] font-mono text-[#A5B1C2]">Clap</span>
          </div>
          <div className="text-[11px] text-[#A5B1C2] mt-0.5">দর্শকদের একযোগে হাততালি</div>
          {activeSound === 'applause' && (
            <div className="absolute inset-0 bg-[#16D98A]/10 animate-ping pointer-events-none rounded-xl" />
          )}
        </button>

        {/* 3. Goal / Sixer Roar */}
        <button
          type="button"
          onClick={() => triggerSound('roar', () => stadiumAudio.playCrowdRoar(3.5))}
          className={`p-3 rounded-xl border text-left transition-all active:scale-95 group relative overflow-hidden ${
            activeSound === 'roar'
              ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30'
              : 'bg-[#151E2B] hover:bg-[#1E293B] border-white/10 hover:border-red-500/50'
          }`}
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📣</div>
          <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-between">
            <span className="text-red-400">গোল/ছক্কা গর্জন</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-[11px] text-[#A5B1C2] mt-0.5">বিশাল স্টেডিয়াম জনতার চিৎকার</div>
          {activeSound === 'roar' && (
            <div className="absolute inset-0 bg-red-500/15 animate-ping pointer-events-none rounded-xl" />
          )}
        </button>

        {/* 4. Referee Whistle */}
        <button
          type="button"
          onClick={() => triggerSound('whistle', () => stadiumAudio.playWhistle(0.9))}
          className={`p-3 rounded-xl border text-left transition-all active:scale-95 group relative overflow-hidden ${
            activeSound === 'whistle'
              ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/30'
              : 'bg-[#151E2B] hover:bg-[#1E293B] border-white/10 hover:border-amber-500/50'
          }`}
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">⚡</div>
          <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-between">
            <span>রেফারি বাঁশি</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-[11px] text-[#A5B1C2] mt-0.5">ফাউল বা কিক-অফের তীক্ষ্ণ বাঁশি</div>
          {activeSound === 'whistle' && (
            <div className="absolute inset-0 bg-amber-500/10 animate-ping pointer-events-none rounded-xl" />
          )}
        </button>

        {/* 5. Bangladeshi Dhol */}
        <button
          type="button"
          onClick={() => triggerSound('dhol', () => stadiumAudio.playStadiumDhol(3.0))}
          className={`p-3 rounded-xl border text-left transition-all active:scale-95 group relative overflow-hidden col-span-2 sm:col-span-1 ${
            activeSound === 'dhol'
              ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/30'
              : 'bg-[#151E2B] hover:bg-[#1E293B] border-white/10 hover:border-purple-500/50'
          }`}
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🥁</div>
          <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-between">
            <span>স্টেডিয়াম ঢোল/ড্রাম</span>
            <span className="text-[10px] font-mono text-purple-400">Beat</span>
          </div>
          <div className="text-[11px] text-[#A5B1C2] mt-0.5">দেশি ঢোল ও ড্রামের উন্মাদনা</div>
          {activeSound === 'dhol' && (
            <div className="absolute inset-0 bg-purple-500/10 animate-ping pointer-events-none rounded-xl" />
          )}
        </button>
      </div>

      {/* Real-Time Audio Frequency Bar Visualizer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#A5B1C2]">
          <span className="w-2 h-2 rounded-full bg-[#16D98A] animate-pulse" />
          <span>ওয়েব অডিও সিন্থেসিস ইঞ্জিন (কোনো ব্যান্ডউইথ খরচ হয় না)</span>
        </div>

        {/* Dancing equalizer visualizer */}
        <div className="flex items-end gap-1 h-4">
          {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                activeSound || ambientActive ? 'bg-[#00B7FF]' : 'bg-[#1E293B]'
              }`}
              style={{
                height: activeSound || ambientActive ? `${h}%` : '20%',
                opacity: activeSound || ambientActive ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
