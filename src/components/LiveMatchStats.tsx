import React from 'react';
import { Activity, Shield, MapPin, Gauge, Flame, Trophy } from 'lucide-react';
import { SportEvent, Team } from '../types';

interface LiveMatchStatsProps {
  event: SportEvent;
  teams?: Team[];
}

export const LiveMatchStats: React.FC<LiveMatchStatsProps> = ({ event, teams = [] }) => {
  const isCricket = event.sportId === 'cricket';
  const teamA = teams[0]?.name || 'Team 1';
  const teamB = teams[1]?.name || 'Team 2';
  const shortA = teams[0]?.shortName || 'T1';
  const shortB = teams[1]?.shortName || 'T2';

  // Realistic match stats based on sport
  const possessionA = 56;
  const possessionB = 44;

  return (
    <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00B7FF]/15 border border-[#00B7FF]/30 flex items-center justify-center text-[#00B7FF]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Match Intelligence & Momentum
            </h3>
            <p className="text-xs text-[#A5B1C2]">Real-time match dynamics and key statistics</p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#16D98A]/15 text-[#16D98A] font-bold">
          LIVE TRACKER
        </span>
      </div>

      {/* Momentum / Control Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B7FF]" />
            {teamA} ({possessionA}%)
          </span>
          <span className="text-[#A5B1C2] font-mono text-[10px] uppercase">
            {isCricket ? 'Projected Win Probability' : 'Ball Possession'}
          </span>
          <span className="text-white flex items-center gap-1.5">
            ({possessionB}%) {teamB}
            <span className="w-2 h-2 rounded-full bg-[#16D98A]" />
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="h-3 w-full bg-[#101722] rounded-full overflow-hidden flex p-0.5 border border-white/10">
          <div
            className="h-full bg-[#00B7FF] rounded-l-full transition-all duration-700 ease-out"
            style={{ width: `${possessionA}%` }}
          />
          <div
            className="h-full bg-[#16D98A] rounded-r-full transition-all duration-700 ease-out"
            style={{ width: `${possessionB}%` }}
          />
        </div>
      </div>

      {/* Grid of Key Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isCricket ? (
          <>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Current RR</span>
              <span className="font-display text-base font-bold text-white">8.42</span>
            </div>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Required RR</span>
              <span className="font-display text-base font-bold text-[#00B7FF]">7.95</span>
            </div>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Total Sixes</span>
              <span className="font-display text-base font-bold text-[#16D98A]">11</span>
            </div>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Dot Balls</span>
              <span className="font-display text-base font-bold text-white">34</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Shots on Target</span>
              <span className="font-display text-base font-bold text-white">7 - 4</span>
            </div>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Corner Kicks</span>
              <span className="font-display text-base font-bold text-[#00B7FF]">6 - 3</span>
            </div>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Pass Accuracy</span>
              <span className="font-display text-base font-bold text-[#16D98A]">88% - 81%</span>
            </div>
            <div className="bg-[#101722] p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-[#A5B1C2] font-mono uppercase block">Fouls</span>
              <span className="font-display text-base font-bold text-white">9 - 12</span>
            </div>
          </>
        )}
      </div>

      {/* Head to Head & Recent Form */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00B7FF] shrink-0" />
          <span className="text-[#A5B1C2]">Form Guide (Last 5):</span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-[#16D98A]/20 text-[#16D98A] font-bold">W</span>
            <span className="px-1.5 py-0.5 rounded bg-[#16D98A]/20 text-[#16D98A] font-bold">W</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">D</span>
            <span className="px-1.5 py-0.5 rounded bg-[#16D98A]/20 text-[#16D98A] font-bold">W</span>
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">L</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#A5B1C2] font-mono">
          <MapPin className="w-3.5 h-3.5 text-[#00B7FF]" />
          <span>{event.timezone} Timezone · Verified Broadcast</span>
        </div>
      </div>
    </div>
  );
};
