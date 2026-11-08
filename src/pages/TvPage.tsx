import React, { useState, useMemo, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import {
  Tv,
  Radio,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  Sparkles,
  Play,
  RotateCw,
  Globe,
  Trophy,
  Flame,
  Film,
  Music,
  Smile,
  Info,
  CheckCircle2,
  Layers,
  Heart
} from 'lucide-react';
import rawChannelsData from '../data/tvChannels.json';
import { LiveTvChannel } from '../types';

const CHANNELS: LiveTvChannel[] = rawChannelsData as LiveTvChannel[];

// Category badges and friendly Bengali labels
const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  all: { label: 'সকল চ্যানেল (All)', icon: Layers, color: 'text-white' },
  sports: { label: 'খেলাধুলা (Sports)', icon: Trophy, color: 'text-amber-400' },
  news: { label: 'সংবাদ (News)', icon: Flame, color: 'text-red-400' },
  entertainment: { label: 'বিনোদন (Entertainment)', icon: Film, color: 'text-purple-400' },
  music: { label: 'গান ও মিউজিক (Music)', icon: Music, color: 'text-pink-400' },
  movies: { label: 'সিনেমা ও মুভি (Movies)', icon: Film, color: 'text-cyan-400' },
  kids: { label: 'কার্টুন ও কিডস (Kids)', icon: Smile, color: 'text-emerald-400' },
  general: { label: 'সাধারণ চ্যানেল (General)', icon: Globe, color: 'text-blue-400' },
  religious: { label: 'ধর্মীয় (Religious)', icon: Info, color: 'text-teal-400' },
};

export const TvPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel>(() => {
    // Default to the first sports channel or first channel
    return CHANNELS.find((c) => c.category === 'sports') || CHANNELS[0];
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kheladekh_tv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Toggle favorite channel
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('kheladekh_tv_favorites', JSON.stringify(next));
      return next;
    });
  };

  // Filter channels based on category and search query
  const filteredChannels = useMemo(() => {
    let list = CHANNELS;

    if (selectedCategory === 'favorites') {
      list = list.filter((c) => favorites.includes(c.id));
    } else if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.country && c.country.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery, favorites]);

  // Handle HLS stream initialization for selected channel
  useEffect(() => {
    setHasPlaybackError(false);
    setIsLoading(true);
    setIsPlaying(false);

    const video = videoRef.current;
    if (!video || !selectedChannel?.streamUrl) return;

    video.muted = isMuted;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(selectedChannel.streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setHasPlaybackError(false);
        video.muted = true;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('TV HLS fatal error:', data.type);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHasPlaybackError(true);
              setIsLoading(false);
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = selectedChannel.streamUrl;
      video.muted = true;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [selectedChannel]);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header & Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#151E2B] via-[#0E1522] to-[#151E2B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/15 text-red-500 border border-red-500/30">
              <Tv className="w-5 h-5 animate-pulse" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              ১০০০+ লাইভ টিভি চ্যানেল (Live TV Streaming)
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            সরাসরি লাইভ টিভি সম্প্রচার
          </h1>
          <p className="text-xs sm:text-sm text-[#A5B1C2] max-w-2xl">
            কোনো প্রি-রেকর্ডেড ভিডিও নয়, সরাসরি স্যাটেলাইট ও অফিসিয়াল আইপি ব্রডকাস্ট। দেশি-বিদেশি খেলাধুলা, খবর, মুভি ও বিনোদন চ্যানেলসমূহ উপভোগ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-right">
            <p className="text-[10px] text-[#A5B1C2] uppercase font-mono">মোট সক্রিয় চ্যানেল</p>
            <p className="font-display text-xl font-black text-[#00B7FF] tabular-nums">
              {CHANNELS.length}+
            </p>
          </div>
        </div>
      </div>

      {/* Main Broadcast Cinema Player Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Live Player */}
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={playerContainerRef}
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group select-none"
          >
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted={isMuted}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                  } else {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }
              }}
            />

            {/* Top Overlay: Channel Info & Live Status */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE ON AIR
                </span>
                <span className="text-sm font-bold text-white drop-shadow truncate max-w-[200px] sm:max-w-md">
                  {selectedChannel?.name}
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="text-[10px] font-mono text-[#00B7FF] bg-[#00B7FF]/15 px-2 py-0.5 rounded border border-[#00B7FF]/30">
                  {selectedChannel?.quality || 'HD'}
                </span>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors"
                  title="ফুল স্ক্রিন"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Autoplay Unmute Helper */}
            {isMuted && isPlaying && (
              <div className="absolute top-16 left-4 z-20 animate-fade-in pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-2 shadow-xl border border-amber-300 transition-transform active:scale-95"
                >
                  <VolumeX className="w-4 h-4 animate-bounce" />
                  <span>সাউন্ড চালু করতে এখানে ট্যাপ করুন (Unmute)</span>
                </button>
              </div>
            )}

            {/* Error Overlay with Direct Link Fallback */}
            {hasPlaybackError && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <RotateCw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedChannel.name} লাইভ স্ট্রিম সিগন্যাল লোড হচ্ছে...
                  </h3>
                  <p className="text-xs text-[#A5B1C2] mt-1 max-w-sm">
                    সার্ভার সিগন্যাল পুনরায় সংযুক্ত করা হচ্ছে অথবা নিচের বাটন দিয়ে সরাসরি ব্রাউজারে খুলুন।
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasPlaybackError(false);
                      setIsLoading(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>পুনরায় চেষ্টা করুন</span>
                  </button>
                  <a
                    href={selectedChannel.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>সরাসরি লিঙ্ক খুলুন</span>
                  </a>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <div className="text-xs">
                  <span className="font-bold text-white block">{selectedChannel.name}</span>
                  <span className="text-[10px] text-[#A5B1C2] capitalize font-mono">
                    Category: {selectedChannel.category} · {selectedChannel.country || 'Global'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedChannel.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                  title="সরাসরি লাইভ স্ট্রিম লিংক ব্রাউজারে খুলুন"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#00B7FF]" />
                  <span className="hidden sm:inline">সরাসরি লিংক</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-[#151E2B] border border-white/10 flex items-center justify-between gap-3 text-xs text-[#CBD5E1]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>
                বর্তমানে দেখছেন: <strong className="text-white">{selectedChannel.name}</strong> (লাইভ ব্রডকাস্ট)
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => toggleFavorite(selectedChannel.id, e)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                favorites.includes(selectedChannel.id)
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-white/5 border-white/10 text-white hover:border-white/20'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.includes(selectedChannel.id) ? 'fill-red-400' : ''}`} />
              <span>{favorites.includes(selectedChannel.id) ? 'ফেভারিটে যুক্ত' : 'ফেভারিটে যোগ করুন'}</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Channel Categories & Live Channel List */}
        <div className="space-y-4">
          <div className="bg-[#151E2B] rounded-3xl border border-white/10 p-5 space-y-4 shadow-xl flex flex-col h-[560px]">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A5B1C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="চ্যানেলের নাম বা ক্যাটাগরি খুঁজুন..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#101722] border border-white/10 text-xs text-white placeholder-[#64748B] focus:border-[#00B7FF] focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#00B7FF] text-[#080B12] border-[#00B7FF]'
                    : 'bg-[#101722] text-[#A5B1C2] border-white/10 hover:text-white'
                }`}
              >
                সকল ({CHANNELS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('sports')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 ${
                  selectedCategory === 'sports'
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-[#101722] text-[#A5B1C2] border-white/10 hover:text-white'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>খেলাধুলা</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('news')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 ${
                  selectedCategory === 'news'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-[#101722] text-[#A5B1C2] border-white/10 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>সংবাদ</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('entertainment')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === 'entertainment'
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-[#101722] text-[#A5B1C2] border-white/10 hover:text-white'
                }`}
              >
                বিনোদন
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('favorites')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 ${
                  selectedCategory === 'favorites'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-[#101722] text-[#A5B1C2] border-white/10 hover:text-white'
                }`}
              >
                <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                <span>ফেভারিট ({favorites.length})</span>
              </button>
            </div>

            {/* Channel List Items (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredChannels.length === 0 ? (
                <div className="py-12 text-center text-[#A5B1C2] text-xs">
                  কোনো চ্যানেল খুঁজে পাওয়া যায়নি
                </div>
              ) : (
                filteredChannels.map((ch) => {
                  const isSelected = selectedChannel?.id === ch.id;
                  const isFav = favorites.includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#00B7FF]/15 border-[#00B7FF] shadow-lg shadow-[#00B7FF]/20 ring-1 ring-[#00B7FF]'
                          : 'bg-[#101722] border-white/5 hover:border-white/20 hover:bg-[#131b29]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#A5B1C2]">
                          <Tv className="w-4 h-4 text-[#00B7FF]" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#00B7FF]' : 'text-white'}`}>
                            {ch.name}
                          </p>
                          <p className="text-[10px] text-[#A5B1C2] capitalize truncate flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{ch.category}</span>
                            <span>·</span>
                            <span>{ch.country || 'Global'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(ch.id, e)}
                          className="p-1.5 rounded-lg text-[#A5B1C2] hover:text-red-400 transition-colors"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-400 text-red-400' : ''}`} />
                        </button>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-[#A5B1C2]">
                          {ch.quality || 'HD'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Sections: Sports, News, Movies, Music */}
      <div className="space-y-8 pt-4">
        {/* Section 1: Sports TV Channels */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white">লাইভ স্পোর্টস টিভি চ্যানেলসমূহ (Live Sports TV)</h2>
                <p className="text-xs text-[#A5B1C2]">আন্তর্জাতিক ফুটবল, ক্রিকেট, টেনিস, গল্ফ ও মোটরস্পোর্টস লাইভ ব্রডকাস্ট</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('sports');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-[#00B7FF] hover:underline font-semibold"
            >
              সবগুলো দেখুন →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CHANNELS.filter((c) => c.category === 'sports').slice(0, 12).map((ch) => (
              <div
                key={ch.id}
                onClick={() => {
                  setSelectedChannel(ch);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3.5 rounded-2xl bg-[#151E2B] border border-white/10 hover:border-[#00B7FF] transition-all cursor-pointer group space-y-2 hover:shadow-lg hover:shadow-[#00B7FF]/10"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold">
                    SPORTS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#00B7FF] transition-colors truncate">
                  {ch.name}
                </p>
                <p className="text-[10px] text-[#A5B1C2] truncate font-mono">{ch.country || 'International'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: News TV Channels */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white">লাইভ নিউজ ও ব্রেকিং সংবাদ (Live News Channels)</h2>
                <p className="text-xs text-[#A5B1C2]">বিশ্বখ্যাত লাইভ নিউজ চ্যানেলসমূহ সরাসরি ২৪ ঘণ্টা সম্প্রচার</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('news');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-[#00B7FF] hover:underline font-semibold"
            >
              সবগুলো দেখুন →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CHANNELS.filter((c) => c.category === 'news').slice(0, 12).map((ch) => (
              <div
                key={ch.id}
                onClick={() => {
                  setSelectedChannel(ch);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3.5 rounded-2xl bg-[#151E2B] border border-white/10 hover:border-red-500 transition-all cursor-pointer group space-y-2 hover:shadow-lg hover:shadow-red-500/10"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-mono font-bold">
                    NEWS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                  {ch.name}
                </p>
                <p className="text-[10px] text-[#A5B1C2] truncate font-mono">{ch.country || 'Global'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Entertainment & Movies Channels */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Film className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white">বিনোদন ও মুভি চ্যানেল (Entertainment & Movies)</h2>
                <p className="text-xs text-[#A5B1C2]">নাটক, সিনেমা ও পূর্ণাঙ্গ বিনোদনমূলক টিভি চ্যানেলসমূহ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('entertainment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-[#00B7FF] hover:underline font-semibold"
            >
              সবগুলো দেখুন →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CHANNELS.filter((c) => c.category === 'entertainment' || c.category === 'movies').slice(0, 12).map((ch) => (
              <div
                key={ch.id}
                onClick={() => {
                  setSelectedChannel(ch);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3.5 rounded-2xl bg-[#151E2B] border border-white/10 hover:border-purple-500 transition-all cursor-pointer group space-y-2 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[10px] font-mono font-bold">
                    {ch.category.toUpperCase()}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                  {ch.name}
                </p>
                <p className="text-[10px] text-[#A5B1C2] truncate font-mono">{ch.country || 'Global'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
