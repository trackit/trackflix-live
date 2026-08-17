import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Radio,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { MultiviewLayout, MultiviewSource } from './types';
import { audioTrackIndexForTile } from './audio';
import { TileOverlay } from './tile-overlay';

interface MultiviewPlayerProps {
  src: string;
  layout?: MultiviewLayout;
  tiles?: (MultiviewSource | null)[];
  activeTile?: number;
  isSolo?: boolean;
  soloLabel?: string;
  onSelectTile?: (index: number) => void;
  onFocusTile?: (index: number) => void;
  onSoloTile?: (index: number) => void;
  onExitSolo?: () => void;
}

export function MultiviewPlayer({
  src,
  layout,
  tiles,
  activeTile = 0,
  isSolo = false,
  soloLabel,
  onSelectTile,
  onFocusTile,
  onSoloTile,
  onExitSolo,
}: MultiviewPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const activeTileRef = useRef(activeTile);
  activeTileRef.current = activeTile;
  const initialisedRef = useRef(false);

  // "No stream" covers both no selection and a configured endpoint that is not live yet.
  const [live, setLive] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const applyActiveAudio = () => {
    const hls = hlsRef.current;
    const tracks = hls?.audioTracks ?? [];
    if (!hls || tracks.length === 0) {
      return;
    }
    const index = audioTrackIndexForTile(tracks, activeTileRef.current);
    if (index >= 0) {
      hls.audioTrack = index;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Hls.isSupported()) {
      return;
    }

    const hls = new Hls({
      lowLatencyMode: true,
      liveSyncDurationCount: 5,
      liveMaxLatencyDurationCount: 10,
      liveDurationInfinity: true,
    });
    hlsRef.current = hls;
    hls.attachMedia(video);

    hls.on(Hls.Events.FRAG_BUFFERED, () => setLive(true));
    hls.on(Hls.Events.MANIFEST_PARSED, () => applyActiveAudio());
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

  // Swap the composed manifest in place, without tearing down the player.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setLive(false);

    if (!src) {
      hlsRef.current?.stopLoad();
      video.removeAttribute('src');
      return;
    }

    if (Hls.isSupported() && hlsRef.current) {
      hlsRef.current.loadSource(src);
    } else {
      video.src = src;
    }
  }, [src]);

  // Switch audio to the active tile. Selecting a tile is a user gesture, so it is allowed to unmute
  // (the initial mount stays muted for autoplay).
  useEffect(() => {
    applyActiveAudio();
    if (initialisedRef.current) {
      setMuted(false);
    } else {
      initialisedRef.current = true;
    }
  }, [activeTile]);

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
    live &&
    !isSolo &&
    layout !== undefined &&
    tiles !== undefined &&
    onSelectTile !== undefined &&
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
        className={`w-full h-full ${live ? '' : 'invisible'}`}
      />

      {showOverlay && (
        <TileOverlay
          layout={layout}
          tiles={tiles}
          activeTile={activeTile}
          onSelectTile={onSelectTile}
          onFocusTile={onFocusTile}
          onSoloTile={onSoloTile}
        />
      )}

      {live && (
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
      )}

      {live && isSolo && (
        <button
          type="button"
          onClick={onExitSolo}
          className="absolute top-2 left-2 btn btn-sm btn-neutral gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {soloLabel ? `Back (${soloLabel})` : 'Back to multiview'}
        </button>
      )}

      {!live && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 text-white/80">
          <Radio className="w-8 h-8 sm:w-10 sm:h-10 opacity-60" />
          <p className="text-sm sm:text-base font-medium">
            {src
              ? 'Waiting for the live feed…'
              : 'Select your source feeds to compose the multiview.'}
          </p>
          {src && (
            <p className="text-xs opacity-60">
              The stream will start automatically once it is live.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiviewPlayer;
