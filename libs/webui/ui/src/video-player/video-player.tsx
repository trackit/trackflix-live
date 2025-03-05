import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

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

  useEffect(() => {
    if (!videoRef.current) return;

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

  const formatBitrate = (bits: number) => {
    const mbps = (bits / 1_000_000).toFixed(2);
    return `${mbps} Mbps`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4 items-center w-full justify-between">
        <div className="flex flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs">Current:</span>
            <div className="badge badge-ghost font-mono">
              {formatBitrate(stats.currentBitrate)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Min:</span>
            <div className="badge badge-ghost font-mono">
              {formatBitrate(stats.minBitrate)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Max:</span>
            <div className="badge badge-ghost font-mono">
              {formatBitrate(stats.maxBitrate)}
            </div>
          </div>
        </div>
        {qualities.length > 0 && (
          <select
            className="select select-ghost select-bordered select-xs font-bold"
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
      />
    </div>
  );
}
export default VideoPlayer;
