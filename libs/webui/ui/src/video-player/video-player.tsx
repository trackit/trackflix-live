import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { formatBitrate } from './utils';

interface VideoPlayerProps {
  src: string;
}

interface QualityLevel {
  height: number;
  width: number;
  bitrate: number;
  level: number;
}

interface HlsStats {
  currentBitrate: number;
  minBitrate: number;
  maxBitrate: number;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [stats, setStats] = useState<HlsStats>({
    currentBitrate: 0,
    minBitrate: 0,
    maxBitrate: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!src) {
      setError('Aucune URL vidéo fournie');
      return;
    }

    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 5,
        liveMaxLatencyDurationCount: 10,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveDurationInfinity: true,
      });
      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', event, data);
        if (data.fatal) {
          setError(`Erreur HLS: ${data.type} - ${data.details}`);
        }
      });

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, index) => ({
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          level: index,
        }));
        setQualities(levels);
        setCurrentQuality(hls.currentLevel);

        // Set initial min/max bitrates
        const bitrates = levels.map((l) => l.bitrate);
        setStats((prev) => ({
          ...prev,
          minBitrate: Math.min(...bitrates),
          maxBitrate: Math.max(...bitrates),
        }));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        setStats((prev) => ({
          ...prev,
          currentBitrate: (data.frag.stats.loaded * 8) / data.frag.duration,
        }));
      });

      return () => {
        hls.destroy();
      };
    } else {
      videoRef.current.src = src; // Safari fallback
    }
  }, [src]);

  const handleQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (hlsRef.current) {
      const level = parseInt(event.target.value);
      hlsRef.current.currentLevel = level;
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video element error:', e);
    const videoElement = e.target as HTMLVideoElement;
    if (videoElement.error) {
      setError(`Erreur vidéo: ${videoElement.error.message} (code: ${videoElement.error.code})`);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col gap-2 items-center h-full">
        <div className="text-center text-red-500 p-4">
          <p className="text-lg font-semibold">Erreur de lecture vidéo</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">URL: {src}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2  items-center h-full">
      <div className="md:flex flex-row gap-4 items-center w-full">
        <div className="flex flex-row flex-wrap w-full md:w-auto  ">
          <div className="flex items-center gap-2 md:w-auto lg:w-auto my-2 px-2 sm:w-1/2">
            <span className="text-xs">Current:</span>
            <div className="text-sm font-mono lg:w-auto w-full badge badge-ghost w-fit">
              {formatBitrate(stats.currentBitrate)}
            </div>
          </div>

          <div className="flex items-center gap-2 md:w-auto lg:w-auto my-2 px-2">
            <span className="text-xs">Min/Max:</span>
            <div className="text-sm font-mono lg:w-auto w-full">
              {formatBitrate(stats.minBitrate)} /{' '}
              {formatBitrate(stats.maxBitrate)}
            </div>
          </div>
        </div>
        {qualities.length > 0 && (
          <select
            className="select select-ghost select-bordered select-xs font-bold my-2 md:w-auto w-full"
            value={currentQuality}
            onChange={handleQualityChange}
          >
            <option value={-1}>Auto</option>
            {qualities.map((quality) => (
              <option key={quality.level} value={quality.level}>
                {quality.height}p ({formatBitrate(quality.bitrate)})
              </option>
            ))}
          </select>
        )}
      </div>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        className="w-full mx-auto"
        onError={handleVideoError}
      />
    </div>
  );
}
export default VideoPlayer;
