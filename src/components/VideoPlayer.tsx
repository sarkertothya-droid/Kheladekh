import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Check,
  Radio,
  Loader2,
  ChevronUp,
  Sparkles,
  PictureInPicture2,
  Server,
  Zap,
} from 'lucide-react';
import { StreamServer } from '../types';

interface VideoPlayerProps {
  src?: string;
  servers?: StreamServer[];
  poster?: string;
  title: string;
  autoFullscreen?: boolean;
  initialResolution?: string;
}

export interface ResolutionOption {
  id: string;
  label: string;
  badge?: string;
  height?: number;
}

const DEFAULT_BROADCAST_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export const buildDefaultServers = (primaryUrl?: string): StreamServer[] => {
  const url1 = (primaryUrl && primaryUrl.trim()) || DEFAULT_BROADCAST_STREAM;
  return [
    {
      id: 'server-1',
      name: 'সার্ভার ১ (আল্ট্রা এইচডি ১০৮০p)',
      quality: '1080p Ultra HD',
      url: url1,
      badge: 'সবচেয়ে দ্রুত ও স্পষ্ট',
      description: 'সর্বোচ্চ স্পিড ও ক্রিস্টাল ক্লিয়ার স্পষ্ট পিকচার কোয়ালিটি।',
    },
    {
      id: 'server-2',
      name: 'সার্ভার ২ (স্ট্যান্ডার্ড এইচডি ৭২০p)',
      quality: '720p HD',
      url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
      badge: 'স্থিতিশীল ব্যাকআপ',
      description: 'স্থিতিশীল দ্বিতীয় লাইভ ফিড (হালকা ব্যাকআপ)।',
    },
    {
      id: 'server-3',
      name: 'সার্ভার ৩ (ডাটা সেভার ৪৮০p)',
      quality: '480p SD',
      url: 'https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8',
      badge: 'কম মেগাবাইট খরচ',
      description: 'কম ব্যান্ডউইথ খরচ করে খেলা দেখার জন্য ডাটা সেভার।',
    },
    {
      id: 'server-4',
      name: 'সার্ভার ৪ (অল্টারনেটিভ মিরর ৩৬০p)',
      quality: '360p Mirror',
      url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      badge: 'বিকল্প মিরর',
      description: 'বিকল্প মিরর সার্ভার। দুর্বল ইন্টারনেট সংযোগের জন্য।',
    },
    {
      id: 'server-5',
      name: 'সার্ভার ৫ (ইমার্জেন্সি গ্লোবাল প্রক্সি)',
      quality: 'Emergency SD',
      url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
      badge: 'ইমার্জেন্সি',
      description: 'পিক আওয়ারে অন্য সার্ভার জ্যাম থাকলে জরুরি ব্যাকআপ।',
    },
  ];
};

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { id: '1080p', label: '1080p Full HD', badge: '60fps', height: 1080 },
  { id: '720p', label: '720p HD', badge: '60fps', height: 720 },
  { id: '480p', label: '480p Standard', badge: 'SD', height: 480 },
  { id: '360p', label: '360p Data Saver', badge: 'Low', height: 360 },
  { id: 'auto', label: 'Auto (Adaptive)', badge: 'Best', height: 0 },
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  servers,
  poster,
  title,
  autoFullscreen = false,
  initialResolution = '1080p',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active servers configuration (defaults to 5 tiers if not configured)
  const activeServers = (servers && servers.length > 0) ? servers : buildDefaultServers(src);
  const [selectedServerId, setSelectedServerId] = useState<string>(activeServers[0]?.id || 'server-1');

  const currentServer = activeServers.find((s) => s.id === selectedServerId) || activeServers[0];
  const activeStream = (currentServer.url && currentServer.url.trim()) ? currentServer.url.trim() : DEFAULT_BROADCAST_STREAM;

  const isEmbed =
    activeStream.includes('youtube.com/embed') ||
    activeStream.includes('facebook.com') ||
    activeStream.includes('/embed/') ||
    activeStream.includes('dailymotion.com/embed');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<string>(initialResolution);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hlsLevels, setHlsLevels] = useState<{ id: string; height: number; index: number }[]>([]);

  const isHls = !isEmbed && activeStream.includes('.m3u8');
  const isDirectVideo =
    !isEmbed &&
    (isHls ||
      activeStream.endsWith('.mp4') ||
      activeStream.endsWith('.webm') ||
      activeStream.endsWith('.ogg') ||
      activeStream.includes('.mp4?'));

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (!showResolutionMenu) {
        setShowControls(false);
      }
    }, 3500);
  }, [showResolutionMenu]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull) {
        showToast('ফুল স্ক্রিন মোড চালু হয়েছে (Full Screen)');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [showToast]);

  // Keyboard shortcut 'F' for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Video & HLS
  useEffect(() => {
    setIsPlaying(false);
    const video = videoRef.current;
    if (!video || !activeStream || !isHls) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(activeStream);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (data.levels && data.levels.length > 0) {
          const parsed = data.levels.map((lvl, idx) => ({
            id: `${lvl.height}p`,
            height: lvl.height,
            index: idx,
          }));
          setHlsLevels(parsed);
        }
        // Attempt autoplay with mute if policy allows
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Autoplay was prevented, wait for user interaction
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
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
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeStream;
    }
  }, [activeStream, isHls]);

  // Auto-fullscreen trigger if requested
  useEffect(() => {
    if (autoFullscreen && containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    }
  }, [autoFullscreen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    showToast(video.muted ? 'সাউন্ড মিউট করা হয়েছে (Muted)' : 'সাউন্ড চালু করা হয়েছে (Unmuted)');
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
    resetControlsTimer();
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showToast('পিকচার-ইন-পিকচার বন্ধ করা হয়েছে');
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        showToast('পিকচার-ইন-পিকচার চালু হয়েছে (Floating Window)');
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
    resetControlsTimer();
  };

  const handleSelectResolution = (res: ResolutionOption) => {
    setCurrentResolution(res.id);
    setShowResolutionMenu(false);

    if (hlsRef.current && hlsLevels.length > 0) {
      if (res.id === 'auto') {
        hlsRef.current.currentLevel = -1;
      } else {
        const targetHeight = res.height || 720;
        // Find closest level
        let closestIdx = 0;
        let minDiff = 99999;
        hlsLevels.forEach((lvl) => {
          const diff = Math.abs(lvl.height - targetHeight);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = lvl.index;
          }
        });
        hlsRef.current.currentLevel = closestIdx;
      }
    }

    showToast(`রেজোলিউশন ${res.label} সেট করা হয়েছে`);
    resetControlsTimer();
  };

  // Embed URL for YouTube or Vimeo if source is 3rd party
  const handleSelectServer = (srv: StreamServer) => {
    setSelectedServerId(srv.id);
    showToast(`${srv.name} এ পরিবর্তন করা হয়েছে`);
  };

  const serverSelectorBar = (
    <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-3 sm:p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#00B7FF]/15 text-[#00B7FF]">
            <Server className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              লাইভ স্ট্রিমিং সার্ভার (Multi-Server Streaming)
            </span>
            <p className="text-[11px] text-[#A5B1C2]">
              সার্ভার ১ সবচেয়ে সুন্দর ও স্পষ্ট। আটকে গেলে বা দুর্বল নেটওয়ার্কে অন্য সার্ভারে সুইচ করুন।
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start sm:self-auto">
          ৫টি সার্ভার সক্রিয়
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {activeServers.slice(0, 5).map((srv, idx) => {
          const isSelected = currentServer.id === srv.id;
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => handleSelectServer(srv)}
              className={`min-h-[46px] p-2.5 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-[#00B7FF]/15 border-[#00B7FF] shadow-lg shadow-[#00B7FF]/20 ring-1 ring-[#00B7FF]'
                  : 'bg-[#101722] border-white/10 hover:border-white/20 text-[#A5B1C2] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-extrabold flex items-center gap-1 ${
                  isSelected ? 'text-[#00B7FF]' : 'text-white'
                }`}>
                  {idx === 0 ? '⚡ ' : ''}সার্ভার {idx + 1}
                </span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                  isSelected ? 'bg-[#00B7FF] text-[#080B12]' : 'bg-white/10 text-[#A5B1C2]'
                }`}>
                  {srv.quality.split(' ')[0]}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B1C2] truncate mt-0.5">
                {srv.badge || srv.quality}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Server Description */}
      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#A5B1C2] flex items-center justify-between">
        <span>
          <strong className="text-white">{currentServer.name}:</strong> {currentServer.description || currentServer.quality}
        </span>
        <span className="text-[10px] text-[#00B7FF] font-mono">
          {isEmbed ? '🌐 Embed Stream' : '⚡ HLS Live Stream'}
        </span>
      </div>
    </div>
  );

  if (!isDirectVideo) {
    let embedUrl = activeStream;
    if (activeStream.includes('youtube.com/watch?v=')) {
      const videoId = new URL(activeStream).searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    } else if (activeStream.includes('youtu.be/')) {
      const videoId = activeStream.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    }

    return (
      <div className="space-y-3">
        {serverSelectorBar}
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group"
        >
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
          {/* Floating Quick Actions Bar for Embed */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-[#00B7FF] flex items-center gap-1.5 transition-colors"
            >
              <Maximize className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>ফুল স্ক্রিন (Full Screen)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeResObj =
    RESOLUTION_OPTIONS.find((r) => r.id === currentResolution) || RESOLUTION_OPTIONS[0];

  return (
    <div className="space-y-3">
      {serverSelectorBar}
      <div
        ref={containerRef}
        onMouseMove={resetControlsTimer}
        onTouchStart={resetControlsTimer}
        onClick={() => resetControlsTimer()}
        onDoubleClick={toggleFullscreen}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none group"
      >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={isHls ? undefined : activeStream}
        poster={poster}
        playsInline
        preload="metadata"
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-9 h-9 text-[#00B7FF] animate-spin" />
            <span className="text-xs font-medium text-white/80">লাইভ স্ট্রিম লোড হচ্ছে...</span>
          </div>
        </div>
      )}

      {/* Top Bar: Brand, Live Badge, and Match Title */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-xs font-extrabold tracking-tight text-white/90 drop-shadow">
            Khela<span className="text-[#00B7FF]">DekH</span>
          </span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#16D98A]/20 border border-[#16D98A]/40 text-[#16D98A] text-[10px] font-mono font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16D98A] animate-pulse" />
            LIVE
          </div>
        </div>

        <span className="text-xs font-semibold text-white/90 truncate max-w-[200px] sm:max-w-md drop-shadow">
          {title}
        </span>
      </div>

      {/* Center Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-30 animate-fade-in">
          <div className="px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-[#00B7FF]/40 text-white text-xs font-medium shadow-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00B7FF]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Prominent Center On-Tap Quick Action Bar */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-2xl"
        >
          {/* OPTION 1: Resolution Changer Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowResolutionMenu((prev) => !prev);
                resetControlsTimer();
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/15 hover:border-[#00B7FF] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
              aria-label="Resolution switcher"
            >
              <Sliders className="w-4 h-4 text-[#00B7FF]" />
              <div className="text-left">
                <span className="block text-[10px] text-[#A5B1C2] uppercase font-mono">রেজোলিউশন</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  {activeResObj.id.toUpperCase()}
                  {activeResObj.badge && (
                    <span className="text-[10px] px-1 rounded bg-[#00B7FF]/20 text-[#00B7FF] font-mono">
                      {activeResObj.badge}
                    </span>
                  )}
                </span>
              </div>
              <ChevronUp
                className={`w-3.5 h-3.5 text-[#A5B1C2] transition-transform duration-200 ${
                  showResolutionMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Resolution Selection Popover Menu */}
            {showResolutionMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl bg-[#101722]/95 backdrop-blur-xl border border-white/20 p-1.5 shadow-2xl z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    ভিডিও রেজোলিউশন
                  </span>
                  <span className="text-[10px] text-[#00B7FF] font-mono">HD Quality</span>
                </div>
                <div className="space-y-0.5">
                  {RESOLUTION_OPTIONS.map((opt) => {
                    const isSelected = currentResolution === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectResolution(opt)}
                        className={`w-full min-h-[38px] px-3 py-2 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#00B7FF]/20 text-[#00B7FF] font-bold'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Radio
                            className={`w-3 h-3 ${
                              isSelected ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
                            }`}
                          />
                          <span>{opt.label}</span>
                        </div>
                        {opt.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isSelected
                                ? 'bg-[#00B7FF] text-black font-bold'
                                : 'bg-white/10 text-[#A5B1C2]'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* OPTION 2: Full Screen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#00B7FF]/20 active:scale-95"
            aria-label="Full screen toggle"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4" />
                <span>ফুল স্ক্রিন বন্ধ করুন (Exit)</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                <span>ফুল স্ক্রিন করুন (Full Screen)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 flex items-center justify-between gap-3 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left: Play/Pause, Mute */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Controls: Resolution badge + Fullscreen toggle */}
        <div className="flex items-center gap-2">
          {/* Resolution button on bottom bar */}
          <button
            type="button"
            onClick={() => {
              setShowResolutionMenu((prev) => !prev);
              resetControlsTimer();
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00B7FF]" />
            <span className="font-mono text-[11px]">{activeResObj.id.toUpperCase()}</span>
          </button>

          {/* Picture-in-Picture button */}
          <button
            type="button"
            onClick={togglePiP}
            title="পিকচার-ইন-পিকচার (Picture-in-Picture)"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>

          {/* Fullscreen button on bottom bar */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-[#00B7FF] hover:text-black text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};
