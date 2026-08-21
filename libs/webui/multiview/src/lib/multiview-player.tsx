import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Loader,
  Maximize,
  Minimize,
  Radio,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MultiviewPlayerProps {
  src: string;
  isSolo?: boolean;
  soloLabel?: string;
  onExitSolo?: () => void;
  // Fill the positioned parent (immersive landscape) instead of holding an intrinsic 16:9 box.
  fill?: boolean;
  // Show the LIVE badge top-left (the composited mosaic; hidden in the solo view, which carries its
  // own live dot next to the back pill).
  showLive?: boolean;
  // Show the fullscreen toggle. Hidden in the immersive landscape view, where the player already
  // fills the viewport and its own chrome would duplicate the immersive controls.
  showFullscreen?: boolean;
}

export function MultiviewPlayer({
  src,
  isSolo = false,
  soloLabel,
  onExitSolo,
  fill = false,
  showLive = true,
  showFullscreen = true,
}: MultiviewPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // `live` = the current stream is buffered and playing. `hasPlayed` stays true once anything has
  // played, so a switch shows a spinner instead of the big "no feed" placeholder.
  const [live, setLive] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Recreate hls.js for each source. Switching a live stream in place (loadSource) can stall,
  // especially between a multiview composition and a single-feed (solo) manifest, which have
  // unrelated media sequences. A fresh instance guarantees clean playback on every switch.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setLive(false);

    if (!src) {
      video.removeAttribute('src');
      setHasPlayed(false);
      return;
    }

    if (!Hls.isSupported()) {
      video.src = src;
      return;
    }

    // Not true LL-HLS (the beta serves standard 2s segments), so a small live sync window makes a
    // switch start playing quickly.
    const hls = new Hls({
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      maxBufferLength: 20,
      backBufferLength: 10,
      liveDurationInfinity: true,
    });
    hls.attachMedia(video);
    hls.on(Hls.Events.FRAG_BUFFERED, () => {
      setLive(true);
      setHasPlayed(true);
    });
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) {
        return;
      }
      setLive(false);
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else {
        console.error('Fatal MultiView player error', {
          type: data.type,
          details: data.details,
        });
        hls.destroy();
      }
    });
    hls.loadSource(src);
    hls.startLoad();

    return () => {
      hls.destroy();
    };
  }, [src]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // iOS leaves the <video> paused when the viewer closes native fullscreen (the inline player has no
  // controls to resume it). The pause usually lands a moment AFTER the exit event, so an immediate
  // play() gets overridden; also catch the pause that follows an exit and play again.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    let justExitedFullscreen = false;
    const play = () => video.play().catch(() => undefined);
    const onExit = () => {
      justExitedFullscreen = true;
      play();
      window.setTimeout(() => {
        justExitedFullscreen = false;
      }, 800);
    };
    const onPause = () => {
      if (justExitedFullscreen) {
        play();
      }
    };
    video.addEventListener('webkitendfullscreen', onExit);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('webkitendfullscreen', onExit);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (wrapperRef.current?.requestFullscreen) {
      wrapperRef.current.requestFullscreen();
      return;
    }
    // iOS Safari does not implement Element.requestFullscreen (so the button did nothing on iPhone);
    // fall back to the native fullscreen of the <video> element, which iOS does support.
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    video?.webkitEnterFullscreen?.();
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative bg-black overflow-hidden ${
        fill ? 'w-full h-full' : 'w-full aspect-video rounded-lg'
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain"
      />

      {showLive && !isSolo && (
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-black/55">
          <span className="w-1.5 h-1.5 rounded-full bg-error" />
          <span className="text-[10px] font-bold tracking-[.11em] text-white">
            LIVE
          </span>
        </span>
      )}

      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
        <button
          type="button"
          title={muted ? 'Unmute' : 'Mute'}
          onClick={() => setMuted((value) => !value)}
          className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-full bg-black/60 text-white text-[11.5px] font-semibold hover:bg-black/75 transition-colors"
        >
          {muted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          {muted ? 'Sound off' : 'Sound on'}
        </button>
        {showFullscreen && (
          <button
            type="button"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            onClick={toggleFullscreen}
            className="grid place-items-center w-[38px] h-[38px] rounded-full bg-black/60 text-white hover:bg-black/75 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {isSolo && (
        <button
          type="button"
          onClick={onExitSolo}
          className="absolute top-2.5 left-2.5 inline-flex items-center gap-2 h-11 px-4 rounded-full bg-white/10 text-white text-sm font-semibold backdrop-blur hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {soloLabel ? `MultiView · ${soloLabel}` : 'MultiView'}
        </button>
      )}

      {src && !live && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 text-white/80 bg-black/30 pointer-events-none">
          <Loader className="w-7 h-7 animate-spin opacity-70" />
          {!hasPlayed && (
            <p className="text-sm opacity-80">
              Waiting for the live feed… it starts automatically once live.
            </p>
          )}
        </div>
      )}

      {!src && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 text-white/80">
          <Radio className="w-8 h-8 sm:w-10 sm:h-10 opacity-60" />
          <p className="text-sm sm:text-base font-medium">
            Select your source feeds to compose the MultiView.
          </p>
        </div>
      )}
    </div>
  );
}

export default MultiviewPlayer;
