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

import { MultiviewLayout, MultiviewSource } from './types';
import { TileOverlay } from './tile-overlay';

interface MultiviewPlayerProps {
  src: string;
  layout?: MultiviewLayout;
  tiles?: (MultiviewSource | null)[];
  isSolo?: boolean;
  soloLabel?: string;
  onFocusTile?: (index: number) => void;
  onSoloTile?: (index: number) => void;
  onExitSolo?: () => void;
}

export function MultiviewPlayer({
  src,
  layout,
  tiles,
  isSolo = false,
  soloLabel,
  onFocusTile,
  onSoloTile,
  onExitSolo,
}: MultiviewPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // `live` = the current composition is buffered and playing. `hasPlayed` stays true once anything
  // has played, so a composition switch shows a spinner over the last frame instead of the big
  // "no feed" placeholder.
  const [live, setLive] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Hls.isSupported()) {
      return;
    }

    // Not true LL-HLS (the beta serves standard 2s segments), so lowLatencyMode only adds aggressive
    // manifest polling. A small live sync window makes composition switches start playing quickly.
    const hls = new Hls({
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      maxBufferLength: 20,
      backBufferLength: 10,
      liveDurationInfinity: true,
    });
    hlsRef.current = hls;
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
        hlsRef.current = null;
      }
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, []);

  // Switch the composed manifest in place. stopLoad + loadSource + startLoad gives hls.js a clean
  // reset so it fetches the new composition's segments (a plain loadSource can stall on a live swap).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setLive(false);

    if (!src) {
      hlsRef.current?.stopLoad();
      video.removeAttribute('src');
      setHasPlayed(false);
      return;
    }

    if (Hls.isSupported() && hlsRef.current) {
      hlsRef.current.stopLoad();
      hlsRef.current.loadSource(src);
      hlsRef.current.startLoad();
    } else {
      video.src = src;
    }
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

  const showOverlay =
    !isSolo &&
    layout !== undefined &&
    tiles !== undefined &&
    onFocusTile !== undefined &&
    onSoloTile !== undefined;

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

      {showOverlay && (
        <TileOverlay
          layout={layout}
          tiles={tiles}
          onFocusTile={onFocusTile}
          onSoloTile={onSoloTile}
        />
      )}

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
