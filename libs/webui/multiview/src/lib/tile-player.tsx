import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Volume2 } from 'lucide-react';

interface TilePlayerProps {
  src: string;
  label: string;
  tileNumber: number;
  active?: boolean;
  onSelect?: () => void;
}

export function TilePlayer({
  src,
  label,
  tileNumber,
  active = false,
  onSelect,
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
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`relative w-full h-full bg-black rounded overflow-hidden ${
        active ? 'ring-2 ring-success' : ''
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {active ? (
        <span className="absolute top-1 left-1 badge badge-success badge-sm gap-1">
          <Volume2 className="w-3 h-3" />
          {tileNumber}
        </span>
      ) : (
        <span className="absolute top-1 left-1 badge badge-primary badge-sm font-bold">
          {tileNumber}
        </span>
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-0.5">
        {label}
      </span>
    </div>
  );
}

export default TilePlayer;
