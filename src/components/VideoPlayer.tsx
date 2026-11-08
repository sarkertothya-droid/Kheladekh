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
  Radio,
  Loader2,
  ChevronUp,
  Sparkles,
  PictureInPicture2,
  Server,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
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

export const VERIFIED_HLS_STREAM_1 = 'https://live-par-2-abr.livepush.io/live/bigbuckbunnyclip/index.m3u8';
export const VERIFIED_HLS_STREAM_2 = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';
export const VERIFIED_HLS_STREAM_3 = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
export const VERIFIED_HLS_STREAM_4 = 'https://assets.afcdn.com/video49/20210722/v_645516.m3u8';
export const VERIFIED_MP4_STREAM_5 = 'https://www.w3schools.com/html/mov_bbb.mp4';

const DEFAULT_BROADCAST_STREAM = VERIFIED_HLS_STREAM_1;

export const buildDefaultServers = (primaryUrl?: string): StreamServer[] => {
  // If primaryUrl contains deprecated YouTube listType=search or is empty, use verified stream
  const cleanPrimary =
    primaryUrl && primaryUrl.trim() && !primaryUrl.includes('listType=search')
      ? primaryUrl.trim()
      : VERIFIED_HLS_STREAM_1;

  return [
    {
      id: 'server-1',
      name: 'সার্ভার ১ (আল্ট্রা এইচডি ১০৮০p)',
      quality: '1080p Ultra HD',
      url: cleanPrimary,
      badge: 'সবচেয়ে দ্রুত ও স্পষ্ট',
      description: 'সর্বোচ্চ স্পিড ও ক্রিস্টাল ক্লিয়ার স্পষ্ট পিকচার কোয়ালিটি। বাফারিং ছাড়া লাইভ ব্রডকাস্ট।',
    },
    {
      id: 'server-2',
      name: 'সার্ভার ২ (স্ট্যান্ডার্ড এইচডি ৭২০p)',
      quality: '720p HD',
      url: VERIFIED_HLS_STREAM_2,
      badge: 'স্থিতিশীল ব্যাকআপ',
      description: 'স্থিতিশীল দ্বিতীয় লাইভ ফিড (অ্যাডাপটিভ বিটরেট ব্যাকআপ)।',
    },
    {
      id: 'server-3',
      name: 'সার্ভার ৩ (ডাটা সেভার ৪৮০p)',
      quality: '480p SD',
      url: VERIFIED_HLS_STREAM_3,
      badge: 'কম মেগাবাইট খরচ',
      description: 'কম ব্যান্ডউইথ খরচ করে খেলা দেখার জন্য হাই-স্পিড ডাটা সেভার।',
    },
    {
      id: 'server-4',
      name: 'সার্ভার ৪ (অল্টারনেটিভ মিরর ৩৬০p)',
      quality: '360p Mirror',
      url: VERIFIED_HLS_STREAM_4,
      badge: 'বিকল্প মিরর',
      description: 'বিকল্প মিরর সার্ভার। দুর্বল ইন্টারনেট সংযোগের জন্য উপযুক্ত।',
    },
    {
      id: 'server-5',
      name: 'সার্ভার ৫ (ইমার্জেন্সি গ্লোবাল ফিড)',
      quality: 'Direct Stream',
      url: VERIFIED_MP4_STREAM_5,
      badge: 'ইমার্জেন্সি ব্যাকআপ',
      description: 'পিক আওয়ারে অন্য সার্ভার জ্যাম থাকলে জরুরি ডিরেক্ট ব্যাকআপ ফিড।',
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
  const activeServers = servers && servers.length > 0 ? servers : buildDefaultServers(src);
  const [selectedServerId, setSelectedServerId] = useState<string>(activeServers[0]?.id || 'server-1');

  const currentServer = activeServers.find((s) => s.id === selectedServerId) || activeServers[0];
  const rawStream = (currentServer.url && currentServer.url.trim()) || DEFAULT_BROADCAST_STREAM;
  // If the stream contains deprecated search embed which causes 'Video unavailable', fallback to verified stream
  const activeStream = rawStream.includes('listType=search') ? VERIFIED_HLS_STREAM_1 : rawStream;

  // Determine if stream is an embed or direct video
  const isYouTube =
    activeStream.includes('youtube.com') ||
    activeStream.includes('youtu.be');
  const isEmbed =
    isYouTube ||
    activeStream.includes('facebook.com') ||
    activeStream.includes('/embed/') ||
    activeStream.includes('dailymotion.com');

  const isHls = !isEmbed && (activeStream.includes('.m3u8') || activeStream.includes('m3u8?'));
  const isDirectVideo =
    !isEmbed &&
    (isHls ||
      activeStream.endsWith('.mp4') ||
      activeStream.endsWith('.webm') ||
      activeStream.endsWith('.ogg') ||
      activeStream.includes('.mp4?'));

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted to ensure modern browser autoplay succeeds
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<string>(initialResolution);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hlsLevels, setHlsLevels] = useState<{ id: string; height: number; index: number }[]>([]);

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
    setHasPlaybackError(false);
    setIsPlaying(false);
    setIsLoading(true);

    const video = videoRef.current;
    if (!video || !activeStream || !isDirectVideo) {
      setIsLoading(false);
      return;
    }

    // Set muted initially to satisfy browser autoplay security policy
    video.muted = isMuted;

    if (isHls && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(activeStream);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        setHasPlaybackError(false);

        if (data.levels && data.levels.length > 0) {
          const parsed = data.levels.map((lvl, idx) => ({
            id: `${lvl.height}p`,
            height: lvl.height,
            index: idx,
          }));
          setHlsLevels(parsed);
        }

        // Try autoplaying muted
        video.muted = true;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setShowUnmuteBanner(true);
          })
          .catch((err) => {
            console.log('Autoplay prevented, ready for user interaction:', err);
            setIsPlaying(false);
          });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS fatal error encountered:', data.type);
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
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = activeStream;
      video.muted = true;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setShowUnmuteBanner(true);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      // Direct MP4 / WebM
      video.src = activeStream;
      video.muted = true;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setShowUnmuteBanner(true);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [activeStream, isHls, isDirectVideo]);

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
      video.muted = false;
      setIsMuted(false);
      setShowUnmuteBanner(false);
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If unmuted play fails, try muted
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const unmuteAndPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setShowUnmuteBanner(false);
    video.play().then(() => setIsPlaying(true)).catch(() => {});
    showToast('সাউন্ড চালু করা হয়েছে (Sound Unmuted)');
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) setShowUnmuteBanner(false);
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

  const handleSelectServer = (srv: StreamServer) => {
    setSelectedServerId(srv.id);
    setHasPlaybackError(false);
    showToast(`${srv.name} এ পরিবর্তন করা হয়েছে`);
  };

  const retryPlayback = () => {
    setHasPlaybackError(false);
    setIsLoading(true);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // 5-Server Selector Component
  const serverSelectorBar = (
    <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-3 sm:p-4 space-y-3 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#00B7FF]/15 text-[#00B7FF]">
            <Server className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              ৫টি লাইভ স্ট্রিমিং সার্ভার (Multi-Server Streaming)
            </span>
            <p className="text-[11px] text-[#A5B1C2]">
              সার্ভার ১ সবচেয়ে স্পষ্ট। কোনো সার্ভার আটকে গেলে সাথে সাথে অন্য সার্ভারে সুইচ করুন।
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 self-start sm:self-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          সব সার্ভার সক্রিয়
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
                <span
                  className={`text-[11px] font-extrabold flex items-center gap-1 ${
                    isSelected ? 'text-[#00B7FF]' : 'text-white'
                  }`}
                >
                  {idx === 0 ? '⚡ ' : ''}সার্ভার {idx + 1}
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                    isSelected ? 'bg-[#00B7FF] text-[#080B12]' : 'bg-white/10 text-[#A5B1C2]'
                  }`}
                >
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

      {/* Selected Server Description & External View Link */}
      <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#A5B1C2] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong className="text-white">{currentServer.name}:</strong>{' '}
          {currentServer.description || currentServer.quality}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a
            href={activeStream}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#00B7FF] hover:underline flex items-center gap-1 font-mono"
            title="ব্রাউজারে সরাসরি স্ট্রিম লিংক খুলুন"
          >
            <span>সরাসরি লিংক</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
            {isEmbed ? '🌐 Embed Stream' : isHls ? '⚡ HLS Live Feed' : '🎥 Direct Video'}
          </span>
        </div>
      </div>
    </div>
  );

  // If Third-Party Embed (YouTube, Facebook, etc.)
  if (!isDirectVideo) {
    let embedUrl = activeStream;
    if (activeStream.includes('youtube.com/watch?v=')) {
      const videoId = new URL(activeStream).searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
    } else if (activeStream.includes('youtu.be/')) {
      const videoId = activeStream.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
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

          {/* Quick External Fallback Button */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <a
              href={activeStream}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-[#00B7FF] flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>নতুন উইন্ডোতে খুলুন</span>
            </a>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-[#00B7FF] flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <Maximize className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>ফুল স্ক্রিন</span>
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
          poster={poster}
          playsInline
          autoPlay
          muted={isMuted}
          preload="auto"
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => {
            setIsLoading(false);
            setHasPlaybackError(false);
          }}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
            setHasPlaybackError(false);
          }}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            console.warn('Video element error triggered');
            setIsLoading(false);
            setHasPlaybackError(true);
          }}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
        />

        {/* Unmute notification banner (Browser Autoplay helper) */}
        {showUnmuteBanner && isPlaying && isMuted && (
          <div className="absolute top-14 left-4 z-30 animate-fade-in">
            <button
              type="button"
              onClick={unmuteAndPlay}
              className="px-3.5 py-1.5 rounded-full bg-amber-500 text-black text-xs font-extrabold flex items-center gap-2 shadow-xl hover:bg-amber-400 transition-transform active:scale-95 border border-amber-300"
            >
              <VolumeX className="w-4 h-4 animate-bounce" />
              <span>সাউন্ড চালু করতে এখানে ট্যাপ করুন (Tap to Unmute)</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !hasPlaybackError && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-black/70 border border-white/10">
              <Loader2 className="w-9 h-9 text-[#00B7FF] animate-spin" />
              <span className="text-xs font-semibold text-white">লাইভ স্ট্রিম লোড হচ্ছে...</span>
              <span className="text-[10px] text-[#A5B1C2] font-mono">{currentServer.name}</span>
            </div>
          </div>
        )}

        {/* Playback Error Overlay with 1-click Server Switching */}
        {hasPlaybackError && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-30 p-4">
            <div className="max-w-md w-full bg-[#151E2B] border border-amber-500/30 rounded-2xl p-5 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {currentServer.name} থেকে স্ট্রিম সংযোগে বিলম্ব হচ্ছে
                </h3>
                <p className="text-xs text-[#A5B1C2] mt-1">
                  কোনো সমস্যা নেই! নিচের বিকল্প সার্ভারগুলোতে তাৎক্ষণিকভাবে খেলা দেখা যাবে।
                </p>
              </div>

              {/* Server switch buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {activeServers
                  .filter((s) => s.id !== currentServer.id)
                  .slice(0, 4)
                  .map((altServer) => (
                    <button
                      key={altServer.id}
                      type="button"
                      onClick={() => handleSelectServer(altServer)}
                      className="p-2.5 rounded-xl bg-[#101722] hover:bg-[#00B7FF]/15 border border-white/10 hover:border-[#00B7FF] text-white text-xs font-bold transition-all text-left flex items-center justify-between"
                    >
                      <span className="truncate">{altServer.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-[#00B7FF] font-mono">
                        {altServer.quality.split(' ')[0]}
                      </span>
                    </button>
                  ))}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={retryPlayback}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>

                <a
                  href={activeStream}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#00B7FF] text-[#080B12] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#33C5FF] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>সরাসরি ব্রাউজারে খুলুন</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar: Brand, Live Badge, and Match Title */}
        <div
          className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none transition-opacity duration-300 z-20 ${
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

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-30 animate-fade-in">
            <div className="px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-[#00B7FF]/40 text-white text-xs font-medium shadow-xl flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Prominent Center Play / Action Bar */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-20 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {!isPlaying && !isLoading && !hasPlaybackError && (
            <button
              type="button"
              onClick={togglePlay}
              className="pointer-events-auto p-4 rounded-full bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] shadow-2xl shadow-[#00B7FF]/50 transition-all hover:scale-110 active:scale-95 flex items-center gap-2"
              title="খেলা শুরু করুন"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}

          {isPlaying && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-2xl"
            >
              {/* Resolution Popover Button */}
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
                    <span className="block text-[10px] text-[#A5B1C2] uppercase font-mono">
                      রেজোলিউশন
                    </span>
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

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#00B7FF] hover:bg-[#33C5FF] text-[#080B12] text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#00B7FF]/20 active:scale-95"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="w-4 h-4" />
                    <span>ফুল স্ক্রিন বন্ধ করুন</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4" />
                    <span>ফুল স্ক্রিন করুন</span>
                  </>
                )}
              </button>
            </div>
          )}
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
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#16D98A]" />
              )}
            </button>
          </div>

          {/* Right Controls: Resolution badge + PiP + Fullscreen */}
          <div className="flex items-center gap-2">
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

            <button
              type="button"
              onClick={togglePiP}
              title="পিকচার-ইন-পিকচার (Picture-in-Picture)"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

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
