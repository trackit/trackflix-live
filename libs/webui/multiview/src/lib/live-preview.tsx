import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface LivePreviewProps {
  src: string;
  className?: string;
}

// A small muted live preview of one feed (its single-view manifest). capLevelToPlayerSize keeps it on
// the lowest rendition so a grid of previews stays light.
export function LivePreview({ src, className }: LivePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, capLevelToPlayerSize: true });
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
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={`mv-live-preview ${className ?? ''}`}
    />
  );
}

export default LivePreview;
