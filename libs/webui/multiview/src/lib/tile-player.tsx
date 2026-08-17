import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Maximize2, Scan } from 'lucide-react';

interface TilePlayerProps {
  src: string;
  label: string;
  tileNumber: number;
  onFocus?: () => void;
  onSolo?: () => void;
}

export function TilePlayer({
  src,
  label,
  tileNumber,
  onFocus,
  onSolo,
}: TilePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }

    video.src = src;
    return undefined;
  }, [src]);

  return (
    <div className="relative w-full h-full bg-black rounded overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <span className="absolute top-1 left-1 badge badge-neutral badge-sm font-bold">
        {tileNumber}
      </span>
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-0.5">
        {label}
      </span>
      <div className="absolute top-1 right-1 flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {onFocus && (
          <button
            type="button"
            title="Make this the primary view"
            onClick={onFocus}
            className="btn btn-xs btn-circle btn-neutral"
          >
            <Scan className="w-3 h-3" />
          </button>
        )}
        {onSolo && (
          <button
            type="button"
            title="Play this feed full screen"
            onClick={onSolo}
            className="btn btn-xs btn-circle btn-neutral"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TilePlayer;
