import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Maximize, Sliders, Play, Radio } from 'lucide-react';
import { SportEvent } from '../types';
import { useData } from '../context/DataContext';

interface EventCardProps {
  event: SportEvent;
}

const RESOLUTION_OPTIONS = [
  { id: '1080p', label: '1080p Full HD', badge: 'FHD' },
  { id: '720p', label: '720p HD', badge: 'HD' },
  { id: '480p', label: '480p Standard', badge: 'SD' },
  { id: '360p', label: '360p Data Saver', badge: 'Low' },
  { id: 'auto', label: 'Auto Adaptive', badge: 'Auto' },
];

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const { sports, competitions } = useData();
  const [imgError, setImgError] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [selectedRes, setSelectedRes] = useState('1080p');

  const sport = sports.find((s) => s.id === event.sportId);
  const competition = competitions.find((c) => c.id === event.competitionId);

  const handleCardClick = () => {
    navigate(`/events/${event.slug}`);
  };

  const handleFullscreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${event.slug}?fullscreen=true&res=${selectedRes}`);
  };

  const handleResolutionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResMenu((prev) => !prev);
  };

  const handleSelectResOption = (e: React.MouseEvent, resId: string) => {
    e.stopPropagation();
    setSelectedRes(resId);
    setShowResMenu(false);
    navigate(`/events/${event.slug}?res=${resId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative block bg-[#151E2B] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00B7FF]/50 transition-all cursor-pointer shadow-lg hover:shadow-[#00B7FF]/10"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] bg-[#101722] overflow-hidden">
        {event.thumbnailUrl && !imgError ? (
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#101722] to-[#151E2B]">
            <Trophy className="w-8 h-8 text-[#00B7FF]/70 mb-2" />
            <span className="text-xs font-medium text-[#A5B1C2] text-center line-clamp-1">
              {sport?.name || 'Sports Event'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#151E2B] via-transparent to-black/30" />

        {/* Live Badge Top-Left */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          {event.status === 'LIVE' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16D98A]/25 backdrop-blur-md border border-[#16D98A]/40 text-[#16D98A] text-[10px] font-mono font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16D98A] animate-pulse" />
              LIVE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-mono font-semibold">
              {event.status}
            </span>
          )}
        </div>

        {/* PROMINENT DUAL OPTIONS: Resolution & Full Screen (On hover / On mobile) */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2">
          {/* OPTION 1: Resolution Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={handleResolutionClick}
              title="ভিডিও রেজোলিউশন পরিবর্তন করুন (Change Resolution)"
              className="px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 hover:border-[#00B7FF] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>{selectedRes.toUpperCase()}</span>
            </button>

            {/* Resolution Menu Popover */}
            {showResMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-[#101722]/95 backdrop-blur-xl border border-white/20 p-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95"
              >
                <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    রেজোলিউশন
                  </span>
                  <span className="text-[9px] text-[#00B7FF] font-mono">HD</span>
                </div>
                <div className="space-y-0.5">
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => handleSelectResOption(e, opt.id)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedRes === opt.id
                          ? 'bg-[#00B7FF]/20 text-[#00B7FF] font-bold'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Radio
                          className={`w-3 h-3 ${
                            selectedRes === opt.id ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
                          }`}
                        />
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1 rounded bg-white/10 text-white/80">
                        {opt.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OPTION 2: Full Screen Quick Play Button */}
          <button
            type="button"
            onClick={handleFullscreenClick}
            title="ফুল স্ক্রিনে সরাসরি চালু করুন (Play Full Screen)"
            className="px-3 py-1.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#00B7FF]/25 active:scale-95"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>ফুল স্ক্রিন (Full Screen)</span>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-[#A5B1C2] mb-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-white font-medium">{sport?.name || event.sportId}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{competition?.name || event.competitionId}</span>
          </div>
          {event.scoreSummary && (
            <span className="text-[#16D98A] font-mono text-xs font-bold shrink-0">
              {event.scoreSummary}
            </span>
          )}
        </div>

        <h3 className="font-display text-base font-bold text-white group-hover:text-[#00B7FF] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A5B1C2] font-mono tabular-nums">
          <span>
            {event.eventDate} · {event.eventTime}
          </span>
          <span className="inline-flex items-center gap-1 text-[#00B7FF] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
            <Play className="w-3 h-3 fill-current" />
            Watch Match
          </span>
        </div>
      </div>
    </div>
  );
};
