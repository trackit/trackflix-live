import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Radio } from 'lucide-react';

interface MultiviewPlayerProps {
  src: string;
}

export function MultiviewPlayer({ src }: MultiviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  // "No stream" covers both no selection and a configured endpoint that is not live yet
  // (channels stopped / manifest 404). We keep retrying in the background and clear it once
  // playback actually starts.
  const [live, setLive] = useState(false);

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
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) {
        return;
      }
      setLive(false);
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        // Stream not up yet (manifest 404) or a transient drop: keep polling so the player
        // recovers on its own once the encoders start.
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

  // Swap the composed manifest in place, without tearing down the player, to mirror the AWS
  // demo's near-instant tile/layout change.
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

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        className={`w-full h-full ${live ? '' : 'invisible'}`}
      />
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
