import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Maximize, Sliders, Play, Radio, CheckCircle2, Clock } from 'lucide-react';
import { SportEvent } from '../types';
import { useData } from '../context/DataContext';
import { resolveMatchCaptains } from '../data/captainsData';

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

const CaptainAvatar: React.FC<{ src: string; name: string; teamName: string }> = ({
  src,
  name,
  teamName,
}) => {
  const [err, setErr] = useState(false);
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#00B7FF]/40 bg-[#0E1522] shrink-0 shadow-md">
      {!err && src ? (
        <img
          src={src}
          alt={`${name} (${teamName} Captain)`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setErr(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#00B7FF]">
          {initials}
        </div>
      )}
    </div>
  );
};

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const { sports, competitions } = useData();
  const [imgError, setImgError] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [selectedRes, setSelectedRes] = useState('1080p');

  const sport = sports.find((s) => s.id === event.sportId);
  const competition = competitions.find((c) => c.id === event.competitionId);
  const captains = resolveMatchCaptains(event);

  const isFinished = event.status === 'FINISHED';
  const isLive = event.status === 'LIVE';

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
      className={`group relative block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-lg ${
        isFinished
          ? 'bg-[#111723] border-white/10 hover:border-white/25 hover:bg-[#141b29]'
          : isLive
          ? 'bg-[#151E2B] border-white/10 hover:border-[#00B7FF]/60 hover:shadow-[#00B7FF]/15'
          : 'bg-[#151E2B] border-white/10 hover:border-white/30'
      }`}
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
            className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${
              isFinished ? 'grayscale-[20%] brightness-90' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#101722] to-[#151E2B]">
            <Trophy className="w-8 h-8 text-[#00B7FF]/70 mb-2" />
            <span className="text-xs font-medium text-[#A5B1C2] text-center line-clamp-1">
              {sport?.name || 'Sports Event'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#151E2B] via-[#151E2B]/35 to-black/30" />

        {/* Status Indicator Top-Left */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-white text-[10px] font-mono font-black tracking-wider shadow-lg shadow-red-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 backdrop-blur-md text-zinc-200 text-[10px] font-mono font-bold tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16D98A]" />
              FINISHED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white/90 text-[10px] font-mono font-semibold">
              <Clock className="w-3 h-3 text-[#00B7FF]" />
              UPCOMING
            </span>
          )}
        </div>

        {/* Interactive Resolution & Full Screen Actions */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={handleResolutionClick}
              title="ভিডিও রেজোলিউশন পরিবর্তন করুন"
              className="px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 hover:border-[#00B7FF] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>{selectedRes.toUpperCase()}</span>
            </button>

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

          <button
            type="button"
            onClick={handleFullscreenClick}
            title="ফুল স্ক্রিনে দেখুন"
            className="px-3 py-1.5 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#00B7FF]/25 active:scale-95"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>ফুল স্ক্রিন</span>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs text-[#A5B1C2]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-white font-semibold">{sport?.name || event.sportId}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{competition?.name || event.competitionId}</span>
          </div>
          {event.scoreSummary && (
            <span
              className={`font-mono text-[11px] font-bold shrink-0 ${
                isFinished
                  ? 'text-amber-300'
                  : isLive
                  ? 'text-[#16D98A]'
                  : 'text-[#A5B1C2]'
              }`}
            >
              {event.scoreSummary}
            </span>
          )}
        </div>

        <h3 className="font-display text-base font-bold text-white group-hover:text-[#00B7FF] transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Team Captains Faceoff Row */}
        <div className="flex items-center justify-between gap-2 pt-2.5 pb-1 border-t border-white/5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CaptainAvatar
              src={captains.teamACaptainPhoto}
              name={captains.teamACaptain}
              teamName={captains.teamAName}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{captains.teamACaptain}</p>
              <p className="text-[10px] text-[#A5B1C2] truncate">অধিনায়ক · {captains.teamAName}</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-black text-[#00B7FF] px-1.5 shrink-0">
            VS
          </span>

          <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{captains.teamBCaptain}</p>
              <p className="text-[10px] text-[#A5B1C2] truncate">অধিনায়ক · {captains.teamBName}</p>
            </div>
            <CaptainAvatar
              src={captains.teamBCaptainPhoto}
              name={captains.teamBCaptain}
              teamName={captains.teamBName}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#A5B1C2] font-mono tabular-nums">
          <span>
            {event.eventDate} · {event.eventTime}
          </span>
          {isFinished ? (
            <span className="inline-flex items-center gap-1.5 text-zinc-300 group-hover:text-white font-semibold text-xs transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16D98A]" />
              ফলাফল দেখুন
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#00B7FF] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
              <Play className="w-3 h-3 fill-current" />
              সরাসরি দেখুন
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
