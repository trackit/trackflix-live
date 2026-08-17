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
}

export function MultiviewPlayer({
  src,
  isSolo = false,
  soloLabel,
  onExitSolo,
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
        console.error('Fatal multiview player error', {
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

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapperRef.current?.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full"
      />

      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          type="button"
          title={muted ? 'Unmute' : 'Mute'}
          onClick={() => setMuted((value) => !value)}
          className="btn btn-sm btn-circle btn-neutral"
        >
          {muted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          onClick={toggleFullscreen}
          className="btn btn-sm btn-circle btn-neutral"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>

      {isSolo && (
        <button
          type="button"
          onClick={onExitSolo}
          className="absolute top-2 left-2 btn btn-sm btn-neutral gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {soloLabel ? `Back (${soloLabel})` : 'Back to multiview'}
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
            Select your source feeds to compose the multiview.
          </p>
        </div>
      )}
    </div>
  );
}

export default MultiviewPlayer;
