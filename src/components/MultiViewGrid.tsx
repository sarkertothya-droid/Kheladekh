import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Radio,
  Tv,
  X,
  Sliders,
  Check,
  Flame,
  Shield,
  RefreshCw,
  Download,
  Smartphone,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import rawChannelsData from '../data/tvChannels.json';
import { LiveTvChannel, SportEvent } from '../types';
import {
  VERIFIED_HLS_STREAM_1,
  VERIFIED_HLS_STREAM_2,
  VERIFIED_HLS_STREAM_3,
  VERIFIED_HLS_STREAM_4,
} from './VideoPlayer';

const ALL_CHANNELS = rawChannelsData as LiveTvChannel[];

export type GridLayout = '1' | '2' | '3' | '4';
export type AmbilightMode = 'none' | 'green' | 'blue' | 'red' | 'gold';

interface ScreenSlot {
  id: string;
  title: string;
  subtitle?: string;
  streamUrl: string;
  sourceType: 'match' | 'tv';
  logo?: string;
}

interface MultiViewPlayerProps {
  slot: ScreenSlot;
  index: number;
  isActiveAudio: boolean;
  onSelectAudio: () => void;
  onChangeSource: () => void;
  onInstantReplay: () => void;
  videoRefCallback: (el: HTMLVideoElement | null) => void;
}

const SingleSlotPlayer: React.FC<MultiViewPlayerProps> = ({
  slot,
  index,
  isActiveAudio,
  onSelectAudio,
  onChangeSource,
  onInstantReplay,
  videoRefCallback,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);

  const initStream = useCallback(() => {
    const video = localVideoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setHasError(false);

    // If source url is empty or bad, pick verified fallback based on index
    const fallbacks = [
      VERIFIED_HLS_STREAM_1,
      VERIFIED_HLS_STREAM_2,
      VERIFIED_HLS_STREAM_3,
      VERIFIED_HLS_STREAM_4,
    ];
    const url = slot.streamUrl && slot.streamUrl.trim().length > 5
      ? slot.streamUrl.trim()
      : fallbacks[index % fallbacks.length];

    if (Hls.isSupported() && (url.includes('.m3u8') || !url.includes('.mp4'))) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              // Try fallback verified stream
              video.src = fallbacks[index % fallbacks.length];
              video.play().catch(() => {});
              break;
          }
        }
      });
    } else {
      video.src = url;
      video.play().catch(() => {});
    }
  }, [slot.streamUrl, index]);

  useEffect(() => {
    initStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initStream]);

  // Sync mute status with isActiveAudio
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = !isActiveAudio;
    }
  }, [isActiveAudio]);

  const toggleFullscreen = () => {
    const video = localVideoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      video.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      onClick={onSelectAudio}
      className={`group relative w-full h-full min-h-[220px] sm:min-h-[280px] bg-black rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-xl ${
        isActiveAudio
          ? 'border-[#00B7FF] ring-2 ring-[#00B7FF]/40 shadow-cyan-500/20'
          : 'border-white/10 hover:border-white/30'
      }`}
    >
      <video
        ref={(el) => {
          localVideoRef.current = el;
          videoRefCallback(el);
        }}
        playsInline
        autoPlay
        muted={!isActiveAudio}
        className="w-full h-full object-cover bg-black"
      />

      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 p-2.5 sm:p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {slot.logo ? (
            <img
              src={slot.logo}
              alt=""
              className="w-5 h-5 rounded-md object-contain bg-black/40"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-5 h-5 rounded-md bg-[#00B7FF]/20 flex items-center justify-center text-[#00B7FF] text-[10px] font-bold">
              {index + 1}
            </div>
          )}
          <div className="leading-tight">
            <span className="font-bold text-xs sm:text-sm text-white drop-shadow truncate max-w-[130px] sm:max-w-[200px] block">
              {slot.title}
            </span>
            {slot.subtitle && (
              <span className="text-[10px] text-[#A5B1C2] drop-shadow block truncate max-w-[120px]">
                {slot.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Status badges & Quick audio indicator */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectAudio();
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              isActiveAudio
                ? 'bg-[#16D98A] text-[#080B12] shadow-md shadow-[#16D98A]/30'
                : 'bg-black/60 text-white/70 hover:text-white border border-white/10'
            }`}
            title={isActiveAudio ? 'সাউন্ড চালু রয়েছে' : 'সাউন্ড শুনতে ক্লিক করুন'}
          >
            {isActiveAudio ? (
              <>
                <Volume2 className="w-3 h-3" />
                <span>অডিও অন</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3" />
                <span>মিউট</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hover Control Bar at Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeSource();
            }}
            className="px-2 py-1 rounded-lg bg-[#151E2B]/90 hover:bg-[#1E293B] border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
            title="এই স্ক্রিনে অন্য চ্যানেল বা ম্যাচ চালান"
          >
            <Sliders className="w-3 h-3 text-[#00B7FF]" />
            <span>ফিড পরিবর্তন</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInstantReplay();
            }}
            className="px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-white text-[11px] font-mono flex items-center gap-1 transition-all"
            title="৫ সেকেন্ড পূর্বে যান (Instant 5s Replay)"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>-5s</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              initStream();
            }}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white"
            title="রিলোড স্ট্রিম"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white"
            title="ফুলস্ক্রিন"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MultiViewGrid: React.FC = () => {
  const { events } = useData();
  const { isInstalled, enterAppMode } = usePWAInstall();
  const liveEvents = events.filter((e) => e.published && e.status === 'LIVE');
  const allEvents = events.filter((e) => e.published);

  const [layout, setLayout] = useState<GridLayout>('4');
  const [activeAudioIndex, setActiveAudioIndex] = useState<number>(0);
  const [ambilight, setAmbilight] = useState<AmbilightMode>('blue');
  const [changingSlotIndex, setChangingSlotIndex] = useState<number | null>(null);
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'matches' | 'sports_tv' | 'all_tv'>('matches');

  // Video element references for instant replay rewind
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);

  // Default 4 initial slots
  const [slots, setSlots] = useState<ScreenSlot[]>([
    {
      id: 'slot-1',
      title: liveEvents[0]?.title || 'T Sports Live (HD)',
      subtitle: liveEvents[0] ? 'লাইভ ম্যাচ ফিড ১' : 'খেলাধুলা চ্যানেল #১',
      streamUrl: liveEvents[0]?.authorizedViewingUrl || VERIFIED_HLS_STREAM_1,
      sourceType: liveEvents[0] ? 'match' : 'tv',
      logo: liveEvents[0]?.thumbnailUrl,
    },
    {
      id: 'slot-2',
      title: liveEvents[1]?.title || 'GTV Live (গাজী টিভি)',
      subtitle: liveEvents[1] ? 'লাইভ ম্যাচ ফিড ২' : 'খেলাধুলা চ্যানেল #২',
      streamUrl: liveEvents[1]?.authorizedViewingUrl || VERIFIED_HLS_STREAM_2,
      sourceType: liveEvents[1] ? 'match' : 'tv',
      logo: liveEvents[1]?.thumbnailUrl,
    },
    {
      id: 'slot-3',
      title: 'Star Sports 1 (HD)',
      subtitle: 'আন্তর্জাতিক ক্রিকেট ও ফুটবল',
      streamUrl: VERIFIED_HLS_STREAM_3,
      sourceType: 'tv',
    },
    {
      id: 'slot-4',
      title: 'Sony Ten 1 (HD)',
      subtitle: 'চ্যাম্পিয়ন্স লিগ ও ডব্লিউডব্লিউই',
      streamUrl: VERIFIED_HLS_STREAM_4,
      sourceType: 'tv',
    },
  ]);

  const handleSelectSlotSource = (
    title: string,
    streamUrl: string,
    sourceType: 'match' | 'tv',
    subtitle?: string,
    logo?: string
  ) => {
    if (changingSlotIndex === null) return;
    setSlots((prev) => {
      const next = [...prev];
      next[changingSlotIndex] = {
        ...next[changingSlotIndex],
        title,
        streamUrl,
        sourceType,
        subtitle: subtitle || (sourceType === 'match' ? 'লাইভ ম্যাচ' : 'টিভি চ্যানেল'),
        logo,
      };
      return next;
    });
    setChangingSlotIndex(null);
  };

  const handleInstantReplay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.currentTime = Math.max(0, video.currentTime - 5);
      video.play().catch(() => {});
    }
  };

  // Filtered lists for selector modal
  const filteredTvChannels = ALL_CHANNELS.filter((ch) => {
    if (sourceFilter === 'sports_tv' && ch.category !== 'sports') return false;
    if (!sourceSearch.trim()) return true;
    const query = sourceSearch.toLowerCase();
    return (
      ch.name.toLowerCase().includes(query) ||
      (ch.category && ch.category.toLowerCase().includes(query)) ||
      (ch.channelNumber && String(ch.channelNumber).includes(query))
    );
  });

  const getAmbilightClass = () => {
    switch (ambilight) {
      case 'green':
        return 'shadow-[0_0_80px_rgba(22,217,138,0.25)] border-[#16D98A]/30';
      case 'blue':
        return 'shadow-[0_0_80px_rgba(0,183,255,0.25)] border-[#00B7FF]/30';
      case 'red':
        return 'shadow-[0_0_80px_rgba(239,68,68,0.25)] border-red-500/30';
      case 'gold':
        return 'shadow-[0_0_80px_rgba(245,158,11,0.25)] border-amber-500/30';
      default:
        return 'border-white/10';
    }
  };

  // Determine active visible slots based on layout
  const visibleCount = layout === '1' ? 1 : layout === '2' ? 2 : layout === '3' ? 3 : 4;
  const currentSlots = slots.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* Control Bar: Layout Switcher + Ambilight + Active Audio Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#101722] border border-white/10 shadow-lg">
        {/* Left: Screen Layout Modes */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#A5B1C2] uppercase font-mono mr-1">
            স্ক্রিন মোড:
          </span>

          <div className="inline-flex rounded-xl bg-[#080B12] p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setLayout('1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                layout === '1'
                  ? 'bg-[#00B7FF] text-[#080B12] shadow'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              ১-স্ক্রিন (সোলো)
            </button>
            <button
              type="button"
              onClick={() => setLayout('2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                layout === '2'
                  ? 'bg-[#00B7FF] text-[#080B12] shadow'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              ২-স্ক্রিন (ডুয়াল)
            </button>
            <button
              type="button"
              onClick={() => setLayout('3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                layout === '3'
                  ? 'bg-[#00B7FF] text-[#080B12] shadow'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              ৩-স্ক্রিন (ট্রিও)
            </button>
            <button
              type="button"
              onClick={() => setLayout('4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                layout === '4'
                  ? 'bg-[#00B7FF] text-[#080B12] shadow'
                  : 'text-[#A5B1C2] hover:text-white'
              }`}
            >
              ৪-স্ক্রিন (কোয়াড ওয়াল)
            </button>
          </div>
        </div>

        {/* Right: Ambient Glow Selector + Audio Intercept Tip */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#080B12] px-2.5 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-[11px] text-[#A5B1C2]">অ্যাম্বিলাইট:</span>
            {(['none', 'blue', 'green', 'red', 'gold'] as AmbilightMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAmbilight(mode)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  ambilight === mode ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                } ${
                  mode === 'none'
                    ? 'bg-transparent border-white/40'
                    : mode === 'blue'
                    ? 'bg-[#00B7FF] border-[#00B7FF]'
                    : mode === 'green'
                    ? 'bg-[#16D98A] border-[#16D98A]'
                    : mode === 'red'
                    ? 'bg-red-500 border-red-500'
                    : 'bg-amber-400 border-amber-400'
                }`}
                title={`অ্যাম্বিলাইট: ${mode}`}
              />
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B7FF]/10 border border-[#00B7FF]/20 text-[#00B7FF] text-xs font-mono">
            <Volume2 className="w-3.5 h-3.5" />
            <span>স্ক্রিনে ট্যাপ করলেই সাউন্ড ট্রান্সফার হবে</span>
          </div>
        </div>
      </div>

      {/* The Master Video Grid Container with Ambilight Effect */}
      <div
        className={`p-2 sm:p-3 rounded-3xl bg-[#080B12] border transition-all duration-500 ${getAmbilightClass()}`}
      >
        {!isInstalled ? (
          <div className="relative w-full aspect-video min-h-[360px] rounded-2xl bg-gradient-to-br from-[#101722] via-[#141C28] to-[#0A0E17] border-2 border-[#00B7FF]/40 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="relative z-10 max-w-lg space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00B7FF]/20 to-[#16D98A]/20 border border-[#00B7FF]/40 flex items-center justify-center mx-auto text-[#00B7FF] shadow-lg shadow-[#00B7FF]/20 animate-pulse">
                <Smartphone className="w-8 h-8 text-[#00B7FF]" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold mb-2">
                  <span>🚫 ওয়েবে সরাসরি সম্প্রচার বন্ধ রয়েছে</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ৪-স্ক্রিন মাল্টিভিউ দেখতে KhelaDek APK ডাউনলোড করুন
                </h3>
                <p className="text-xs sm:text-sm text-[#A5B1C2] mt-1.5 leading-relaxed">
                  একসাথে ৪টি স্ক্রিনে লাইভ ম্যাচ, বিকল্প ক্যামেরা অ্যাঙ্গেল এবং টিভি চ্যানেল উপভোগ করার সুবিধা শুধুমাত্র অফিশিয়াল KhelaDek অ্যাপে সংরক্ষিত। ওয়েব ব্রাউজারে লাইভ স্ট্রিমিং বন্ধ।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="/api/download-apk"
                  download="KhelaDek-v2.4.0.apk"
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] text-[#080B12] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#00B7FF]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 fill-current" />
                  <span>KhelaDek APK ডাউনলোড (৭.৩ MB)</span>
                </a>

                <button
                  type="button"
                  onClick={enterAppMode}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/20 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <span>অ্যাপ মোডে চালু করুন (App Mode)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-2.5 sm:gap-3 ${
              layout === '1'
                ? 'grid-cols-1'
                : layout === '2'
                ? 'grid-cols-1 md:grid-cols-2'
                : layout === '3'
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {currentSlots.map((slot, index) => (
              <div
                key={slot.id}
                className={`w-full aspect-video ${
                  layout === '3' && index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <SingleSlotPlayer
                  slot={slot}
                  index={index}
                  isActiveAudio={activeAudioIndex === index}
                  onSelectAudio={() => setActiveAudioIndex(index)}
                  onChangeSource={() => setChangingSlotIndex(index)}
                  onInstantReplay={() => handleInstantReplay(index)}
                  videoRefCallback={(el) => {
                    videoRefs.current[index] = el;
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source Selector Modal */}
      {changingSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#101722] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00B7FF]/20 text-[#00B7FF]">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    স্ক্রিন #{changingSlotIndex + 1}-এর জন্য ফিড নির্বাচন করুন
                  </h3>
                  <p className="text-xs text-[#A5B1C2]">
                    লাইভ ম্যাচ অথবা ১০০০+ টিভি চ্যানেলের যেকোনোটি বেছে নিন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangingSlotIndex(null)}
                className="p-1.5 rounded-lg text-[#A5B1C2] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSourceFilter('matches')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sourceFilter === 'matches'
                    ? 'bg-[#00B7FF] text-[#080B12]'
                    : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
                }`}
              >
                লাইভ ও আপকামিং ম্যাচ ({allEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('sports_tv')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sourceFilter === 'sports_tv'
                    ? 'bg-[#00B7FF] text-[#080B12]'
                    : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
                }`}
              >
                স্পোর্টস টিভি চ্যানেল
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('all_tv')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sourceFilter === 'all_tv'
                    ? 'bg-[#00B7FF] text-[#080B12]'
                    : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
                }`}
              >
                সকল ১০০০+ টিভি
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="চ্যানেল বা ম্যাচের নাম লিখে খুঁজুন..."
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#080B12] border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00B7FF]"
              />
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {sourceFilter === 'matches' ? (
                allEvents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#A5B1C2]">
                    কোনো ম্যাচ পাওয়া যায়নি।
                  </div>
                ) : (
                  allEvents.map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() =>
                        handleSelectSlotSource(
                          evt.title,
                          evt.authorizedViewingUrl || VERIFIED_HLS_STREAM_1,
                          'match',
                          `${evt.status === 'LIVE' ? '🔴 লাইভ ম্যাচ' : 'ম্যাচ'} • ${evt.scoreSummary || ''}`,
                          evt.thumbnailUrl
                        )
                      }
                      className="w-full p-2.5 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/5 hover:border-[#00B7FF]/40 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {evt.thumbnailUrl ? (
                          <img
                            src={evt.thumbnailUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-black/40"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#00B7FF]/10 text-[#00B7FF] flex items-center justify-center font-bold">
                            ⚽
                          </div>
                        )}
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00B7FF] transition-colors">
                            {evt.title}
                          </div>
                          <div className="text-[11px] text-[#A5B1C2] flex items-center gap-2 mt-0.5">
                            {evt.status === 'LIVE' && (
                              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-mono font-bold text-[10px]">
                                LIVE
                              </span>
                            )}
                            <span>{evt.scoreSummary || 'স্ট্রিমিং প্রস্তুত'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#00B7FF]/10 text-[#00B7FF] text-xs font-bold group-hover:bg-[#00B7FF] group-hover:text-[#080B12] transition-colors">
                        চালান
                      </span>
                    </button>
                  ))
                )
              ) : filteredTvChannels.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A5B1C2]">
                  কোনো টিভি চ্যানেল পাওয়া যায়নি।
                </div>
              ) : (
                filteredTvChannels.slice(0, 40).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() =>
                      handleSelectSlotSource(
                        ch.name,
                        ch.streamUrl,
                        'tv',
                        `চ্যানেল #${ch.channelNumber || ''} • ${ch.category || 'TV'}`,
                        ch.logo || undefined
                      )
                    }
                    className="w-full p-2.5 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/5 hover:border-[#00B7FF]/40 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {ch.logo ? (
                        <img
                          src={ch.logo}
                          alt=""
                          className="w-9 h-9 rounded-lg object-contain bg-black/40 p-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 text-[#A5B1C2] flex items-center justify-center text-xs font-bold font-mono">
                          #{ch.channelNumber || ''}
                        </div>
                      )}
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00B7FF] transition-colors">
                          {ch.name}
                        </div>
                        <div className="text-[10px] text-[#A5B1C2] font-mono mt-0.5">
                          চ্যানেল #{ch.channelNumber || ''} • {ch.category?.toUpperCase() || 'TV'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#00B7FF]/10 text-[#00B7FF] text-xs font-bold group-hover:bg-[#00B7FF] group-hover:text-[#080B12] transition-colors">
                      স্ক্রিনে নিন
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
