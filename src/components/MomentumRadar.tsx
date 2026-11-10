import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Flame, Zap, Shield, Heart } from 'lucide-react';
import { stadiumAudio } from '../services/stadiumAudioService';

interface MomentumRadarProps {
  team1Name?: string;
  team2Name?: string;
  className?: string;
}

export const MomentumRadar: React.FC<MomentumRadarProps> = ({
  team1Name = 'বাংলাদেশ (BAN)',
  team2Name = 'ভারত (IND)',
  className = '',
}) => {
  const [team1Prob, setTeam1Prob] = useState(56);
  const [team2Prob, setTeam2Prob] = useState(38);
  const [drawProb, setDrawProb] = useState(6);
  const [team1Pressure, setTeam1Pressure] = useState(72);
  const [team2Pressure, setTeam2Pressure] = useState(54);
  const [fanCheersTeam1, setFanCheersTeam1] = useState(1420);
  const [fanCheersTeam2, setFanCheersTeam2] = useState(1180);
  const [cheerSparks, setCheerSparks] = useState<{ id: number; team: 1 | 2; x: number }[]>([]);

  // Simulate realistic live dynamic momentum micro-shifts
  useEffect(() => {
    const interval = setInterval(() => {
      setTeam1Pressure((prev) => Math.min(95, Math.max(25, prev + (Math.floor(Math.random() * 9) - 4))));
      setTeam2Pressure((prev) => Math.min(95, Math.max(25, prev + (Math.floor(Math.random() * 9) - 4))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCheer = (team: 1 | 2) => {
    try {
      stadiumAudio.playApplause(1.2);
    } catch {
      // Audio fallback
    }

    if (team === 1) {
      setFanCheersTeam1((prev) => prev + 1);
      setTeam1Pressure((prev) => Math.min(98, prev + 3));
    } else {
      setFanCheersTeam2((prev) => prev + 1);
      setTeam2Pressure((prev) => Math.min(98, prev + 3));
    }

    const newSpark = {
      id: Date.now() + Math.random(),
      team,
      x: team === 1 ? 25 + Math.random() * 20 : 65 + Math.random() * 20,
    };
    setCheerSparks((prev) => [...prev.slice(-10), newSpark]);

    setTimeout(() => {
      setCheerSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1200);
  };

  const totalCheers = fanCheersTeam1 + fanCheersTeam2;
  const team1CheerPercent = Math.round((fanCheersTeam1 / (totalCheers || 1)) * 100);
  const team2CheerPercent = 100 - team1CheerPercent;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#101722] via-[#141C28] to-[#0A0E17] border border-white/10 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Floating cheer sparks */}
      {cheerSparks.map((spark) => (
        <div
          key={spark.id}
          className={`absolute bottom-16 text-lg pointer-events-none animate-bounce font-bold ${
            spark.team === 1 ? 'text-[#16D98A]' : 'text-[#00B7FF]'
          }`}
          style={{ left: `${spark.x}%`, animationDuration: '0.8s' }}
        >
          🔥 +1 CHEER!
        </div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 text-[#00B7FF]">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                লাইভ মোমেন্টাম ও উইন প্রোবাবিলিটি রাডার
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                AI ANALYTICS
              </span>
            </div>
            <p className="text-[11px] text-[#A5B1C2]">
              ম্যাচের গতিবিধি, আক্রমণ চাপ ও দর্শকদের রিয়েলটাইম রিঅ্যাকশন সূচক
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#16D98A] bg-[#16D98A]/10 px-2.5 py-1 rounded-xl border border-[#16D98A]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16D98A] animate-ping" />
          <span>লাইভ হিসাব চলছে</span>
        </div>
      </div>

      {/* 1. Win Probability Gauge */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-1.5 text-[#16D98A]">
            <Shield className="w-3.5 h-3.5" /> {team1Name} ({team1Prob}%)
          </span>
          <span className="text-[#64748B] text-[11px] font-mono">ড্র: {drawProb}%</span>
          <span className="flex items-center gap-1.5 text-[#00B7FF]">
            {team2Name} ({team2Prob}%) <Shield className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 3-way split progress bar */}
        <div className="h-3 w-full bg-[#080B12] rounded-full overflow-hidden flex p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-[#16D98A] rounded-l-full transition-all duration-700"
            style={{ width: `${team1Prob}%` }}
            title={`${team1Name}: ${team1Prob}%`}
          />
          <div
            className="h-full bg-gray-600/60 transition-all duration-700"
            style={{ width: `${drawProb}%` }}
            title={`ড্র: ${drawProb}%`}
          />
          <div
            className="h-full bg-gradient-to-r from-[#00B7FF] to-cyan-400 rounded-r-full transition-all duration-700"
            style={{ width: `${team2Prob}%` }}
            title={`${team2Name}: ${team2Prob}%`}
          />
        </div>
      </div>

      {/* 2. Attacking Pressure Index */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-[#080B12]/70 border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#A5B1C2] truncate">{team1Name} আক্রমণ চাপ</span>
            <span className="font-mono font-bold text-[#16D98A]">{team1Pressure}/100</span>
          </div>
          <div className="h-2 w-full bg-[#151E2B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#16D98A] rounded-full transition-all duration-500"
              style={{ width: `${team1Pressure}%` }}
            />
          </div>
          <div className="text-[10px] text-[#64748B] mt-1 font-mono">
            {team1Pressure > 70 ? '🔥 হাই প্রেসার অ্যাটাক' : 'ব্যালেন্সড ডিফেন্স'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#080B12]/70 border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#A5B1C2] truncate">{team2Name} আক্রমণ চাপ</span>
            <span className="font-mono font-bold text-[#00B7FF]">{team2Pressure}/100</span>
          </div>
          <div className="h-2 w-full bg-[#151E2B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00B7FF] rounded-full transition-all duration-500"
              style={{ width: `${team2Pressure}%` }}
            />
          </div>
          <div className="text-[10px] text-[#64748B] mt-1 font-mono">
            {team2Pressure > 70 ? '🔥 কাউন্টার অ্যাটাক সক্রিয়' : 'স্থিতিশীল নিয়ন্ত্রণ'}
          </div>
        </div>
      </div>

      {/* 3. Interactive Fan Cheer Energy Meter */}
      <div className="p-3.5 rounded-xl bg-[#151E2B]/80 border border-white/10">
        <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
          <span className="flex items-center gap-1.5 text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>ফ্যান চিয়ার যুদ্ধ (লাইভ রিঅ্যাকশন)</span>
          </span>
          <span className="text-[11px] font-mono text-[#A5B1C2]">
            মোট ভোট: {totalCheers.toLocaleString()}
          </span>
        </div>

        {/* Fan cheer battle bar */}
        <div className="h-2.5 w-full bg-[#080B12] rounded-full overflow-hidden flex mb-3">
          <div
            className="h-full bg-[#16D98A] transition-all duration-300"
            style={{ width: `${team1CheerPercent}%` }}
          />
          <div
            className="h-full bg-[#00B7FF] transition-all duration-300"
            style={{ width: `${team2CheerPercent}%` }}
          />
        </div>

        {/* Cheer Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleCheer(1)}
            className="py-2 px-3 rounded-xl bg-[#16D98A]/15 hover:bg-[#16D98A]/25 border border-[#16D98A]/40 text-[#16D98A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#16D98A]/10"
          >
            <Heart className="w-3.5 h-3.5 fill-[#16D98A]" />
            <span className="truncate">{team1Name} কে চিয়ার করুন ({team1CheerPercent}%)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCheer(2)}
            className="py-2 px-3 rounded-xl bg-[#00B7FF]/15 hover:bg-[#00B7FF]/25 border border-[#00B7FF]/40 text-[#00B7FF] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#00B7FF]/10"
          >
            <Zap className="w-3.5 h-3.5 fill-[#00B7FF]" />
            <span className="truncate">{team2Name} কে চিয়ার করুন ({team2CheerPercent}%)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
