import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const trimmedSrc = src?.trim() || '';
  const isHls = trimmedSrc.includes('.m3u8');
  const isDirectVideo =
    isHls ||
    trimmedSrc.endsWith('.mp4') ||
    trimmedSrc.endsWith('.webm') ||
    trimmedSrc.endsWith('.ogg') ||
    trimmedSrc.includes('.mp4?');

  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);

    const video = videoRef.current;
    if (!video || !trimmedSrc || !isHls) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = trimmedSrc;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(trimmedSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setHasError(true);
        }
      });
      return () => {
        hls.destroy();
      };
    }
  }, [trimmedSrc, isHls]);

  if (!trimmedSrc || hasError) {
    return (
      <div className="relative w-full aspect-video bg-[#101722] rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-[#A5B1C2] mb-3" />
        <p className="text-base font-semibold text-white">
          Official stream is currently unavailable.
        </p>
        <p className="text-xs text-[#A5B1C2] mt-1 max-w-md">
          {hasError
            ? 'The broadcast feed could not be loaded. Please try again shortly.'
            : 'No live video feed is attached to this event yet.'}
        </p>
      </div>
    );
  }

  if (!isDirectVideo) {
    let embedUrl = trimmedSrc;

    if (trimmedSrc.includes('youtube.com/watch?v=')) {
      const videoId = new URL(trimmedSrc).searchParams.get('v');
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
      }
    } else if (trimmedSrc.includes('youtube.com/live/')) {
      const videoId = trimmedSrc.split('youtube.com/live/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
      }
    } else if (trimmedSrc.includes('youtu.be/')) {
      const videoId = trimmedSrc.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
      }
    } else if (
      trimmedSrc.includes('vimeo.com/') &&
      !trimmedSrc.includes('player.vimeo.com')
    ) {
      const videoId = trimmedSrc.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
      }
    }

    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-3 left-4 z-10 pointer-events-none select-none">
          <span className="font-display text-xs font-extrabold tracking-tight text-white/80 drop-shadow">
            Khela<span className="text-[#00B7FF]">DekH</span>
          </span>
        </div>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setHasError(true));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group"
    >
      <div className="absolute top-3 left-4 z-10 pointer-events-none select-none">
        <span className="font-display text-xs font-extrabold tracking-tight text-white/80 drop-shadow">
          Khela<span className="text-[#00B7FF]">DekH</span>
        </span>
      </div>

      <video
        ref={videoRef}
        src={isHls ? undefined : trimmedSrc}
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
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-8 h-8 text-[#00B7FF] animate-spin" />
        </div>
      )}

      {/* Theater Controls Bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#00B7FF] text-[#080B12] hover:bg-[#33C5FF] transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="text-xs font-medium text-white truncate max-w-[180px] sm:max-w-sm">
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Fullscreen"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
