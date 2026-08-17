import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Maximize2 } from 'lucide-react';

interface TilePlayerProps {
  src: string;
  label: string;
  tileNumber: number;
  featured?: boolean;
  onSelect?: () => void;
  onSolo?: () => void;
}

export function TilePlayer({
  src,
  label,
  tileNumber,
  featured = false,
  onSelect,
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
    <div
      className={`relative w-full h-full bg-black rounded overflow-hidden group ${
        featured ? 'ring-2 ring-primary' : ''
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Feature ${label}`}
        className={`absolute inset-0 w-full h-full ${
          onSelect ? 'cursor-pointer' : ''
        }`}
      />
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover pointer-events-none"
      />
      {featured ? (
        <span className="pointer-events-none absolute top-1 left-1 badge badge-primary badge-sm">
          Featured
        </span>
      ) : (
        <span className="pointer-events-none absolute top-1 left-1 badge badge-neutral badge-sm font-bold">
          {tileNumber}
        </span>
      )}
      <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-0.5">
        {label}
      </span>
      {onSolo && (
        <button
          type="button"
          title="Play this feed full screen"
          onClick={onSolo}
          className="absolute top-1 right-1 btn btn-xs btn-circle btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default TilePlayer;
