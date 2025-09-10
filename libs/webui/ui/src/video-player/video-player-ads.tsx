import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { useMediaTailorService } from './index';
import { formatBitrate } from './utils';
import { OverlayAd, type OverlayAdData } from './components/OverlayAd';
import { LShapedAd, createLShapedAdData, type LShapedAdData as LShapedAdComponent } from './components/LShapedAd';

// ✅ Minimal props - only the essentials
interface VideoPlayerAdsProps {
  src: string;
  enableMediaTailorTracking?: boolean;
  mediaTailorSessionInitUrl?: string;
}

// ✅ Player stats and quality interfaces
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

// ✅ Overlay types with natural anchor points
type OverlayType = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'l-shaped';

/**
 * ✅ MINIMALIST VIDEO PLAYER with MediaTailor
 * 
 * Ultra-simple version with HLS.js for live streams compatibility
 * Exactly replicates the behavior of VideoPlayerImaWithTracking
 */
export const VideoPlayerAds: React.FC<VideoPlayerAdsProps> = ({
  src,
  enableMediaTailorTracking = false,
  mediaTailorSessionInitUrl
}) => {
  
  // ✅ Refs 
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // ✅ State - minimum necessary
  const [lastReportedTime, setLastReportedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Ads state - simplified to use components
  const [currentOverlayAd, setCurrentOverlayAd] = useState<OverlayAdData | null>(null);
  const [showOverlayAd, setShowOverlayAd] = useState(false);
  
  // ✅ L-shaped ads state - simplified
  const [showLShapedAds, setShowLShapedAds] = useState(false);
  const [currentOverlayType, setCurrentOverlayType] = useState<OverlayType>('l-shaped');
  const [lShapedAdData, setLShapedAdData] = useState<LShapedAdComponent | null>(null);

  // ✅ Refs to manage demo ads timers
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lShapedTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ Player stats and quality state
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [stats, setStats] = useState<HlsStats>({
    currentBitrate: 0,
    minBitrate: 0,
    maxBitrate: 0,
  });
  
  // ✅ MediaTailor service - single source of data with duplicate management
  const {
    session: mediaTailorSession,
    isSessionActive,
    overlayAds,
    initializeSession,
    sendTrackingEvent,
    startPolling,
    markAdAsDisplayed,
    isAdDisplayed,
  } = useMediaTailorService();

  // ✅ Video source - MediaTailor manifest or original source
  const videoSrc = mediaTailorSession?.manifestUrl || src;

  // ✅ HLS initialization - CRUCIAL for live streams!
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;

    setError(null);

    // Clean up old HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 5,
        liveMaxLatencyDurationCount: 10,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveDurationInfinity: true,
        debug: false,
      });
      
      hlsRef.current = hls;

      // Error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError(`HLS Error: ${data.type} - ${data.details}`);
        }
      });

      // Manifest parsed - extract quality levels
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

      // Level switched - update current quality
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      });

      // Fragment loaded - update current bitrate
      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        setStats((prev) => ({
          ...prev,
          currentBitrate: (data.frag.stats.loaded * 8) / data.frag.duration,
        }));
      });

      // Load source and attach to video element
      hls.loadSource(videoSrc);
      hls.attachMedia(videoRef.current);

    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      videoRef.current.src = videoSrc;
    } else {
      setError('HLS not supported in this browser');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoSrc]);

  // ✅ MediaTailor initialization - ultra-simple
  useEffect(() => {
    if (!enableMediaTailorTracking || !mediaTailorSessionInitUrl || isSessionActive) {
      return;
    }

    const initMediaTailor = async () => {
      try {
        await initializeSession({
          sessionInitUrl: mediaTailorSessionInitUrl,
          adsParams: {
            player: 'minimal-video-player',
            version: '1.0.0',
            platform: 'web'
          }
        });
        
        startPolling(30000); // Poll every 30 seconds
      } catch (error) {
        console.error('MediaTailor init failed:', error);
      }
    };

    initMediaTailor();
  }, [enableMediaTailorTracking, mediaTailorSessionInitUrl, isSessionActive, initializeSession, startPolling]);

  // ✅ Handlers for ad components
  const handleOverlayAdClick = useCallback((clickUrl?: string) => {
    if (clickUrl) {
      if (enableMediaTailorTracking) {
        sendTrackingEvent({
          eventType: 'ad_complete',
          currentTime: videoRef.current?.currentTime || 0,
          duration: videoRef.current?.duration || 0,
          additionalData: { reason: 'ad_clicked' }
        });
      }
      window.open(clickUrl, '_blank');
    }
  }, [enableMediaTailorTracking, sendTrackingEvent]);

  const handleOverlayAdClose = useCallback(() => {
    setShowOverlayAd(false);
    setCurrentOverlayAd(null);
    if (enableMediaTailorTracking) {
      sendTrackingEvent({
        eventType: 'ad_complete',
        currentTime: videoRef.current?.currentTime || 0,
        duration: videoRef.current?.duration || 0,
        additionalData: { reason: 'ad_closed' }
      });
    }
  }, [enableMediaTailorTracking, sendTrackingEvent]);

  const handleLShapedAdClick = useCallback((clickUrl?: string) => {
    if (clickUrl) {
      if (enableMediaTailorTracking) {
        sendTrackingEvent({
          eventType: 'ad_complete',
          currentTime: videoRef.current?.currentTime || 0,
          duration: videoRef.current?.duration || 0,
          additionalData: { reason: 'l_shaped_ad_clicked' }
        });
      }
      window.open(clickUrl, '_blank');
    }
  }, [enableMediaTailorTracking, sendTrackingEvent]);

  const handleLShapedAdComplete = useCallback(() => {
    setShowLShapedAds(false);
    setLShapedAdData(null);
    if (enableMediaTailorTracking) {
      sendTrackingEvent({
        eventType: 'ad_complete',
        currentTime: videoRef.current?.currentTime || 0,
        duration: videoRef.current?.duration || 0,
        additionalData: { reason: 'l_shaped_ad_completed' }
      });
    }
  }, [enableMediaTailorTracking, sendTrackingEvent]);

  // ✅ Demo functions to manually trigger advertisements
  const triggerDemoOverlayAd = useCallback(() => {
    // Clean up previous timer if it exists
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }

    const demoOverlayAd: OverlayAdData = {
      adId: 'demo-overlay-001',
      adTitle: 'Demo Overlay Advertisement',
      creativeId: 'overlay-demo',
      staticResource: 'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/480x70.jpg',
      clickThrough: 'https://example.com',
      width: '480',
      height: '70',
      duration: 8,
      availId: 'demo-overlay-' + Date.now(),
      adSystem: 'Demo System',
      trackingEvents: []
    };
    
    setCurrentOverlayAd(demoOverlayAd);
    setShowOverlayAd(true);
    
    // Auto-hide after 8 seconds with timer reference
    overlayTimerRef.current = setTimeout(() => {
      setShowOverlayAd(false);
      setCurrentOverlayAd(null);
      overlayTimerRef.current = null;
    }, 8000);
  }, []);

  const triggerDemoLShapedAd = useCallback((layoutType: OverlayType = 'bottom-left') => {
    // Clean up previous timer if it exists
    if (lShapedTimerRef.current) {
      clearTimeout(lShapedTimerRef.current);
      lShapedTimerRef.current = null;
    }

    const demoLShapedData = createLShapedAdData(
      'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/1000x150.png',
      'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/250x450.png',
      'https://example.com/top',
      'https://example.com/side'
    );
    
    setLShapedAdData(demoLShapedData);
    setCurrentOverlayType(layoutType);
    setShowLShapedAds(true);
    
    // Auto-hide after 10 seconds with timer reference
    lShapedTimerRef.current = setTimeout(() => {
      handleLShapedAdComplete();
      lShapedTimerRef.current = null;
    }, 10000);
  }, [handleLShapedAdComplete]);

  const resetAllAds = useCallback(() => {
    // Clean up all active timers
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    if (lShapedTimerRef.current) {
      clearTimeout(lShapedTimerRef.current);
      lShapedTimerRef.current = null;
    }

    // Reset all ad states
    setShowOverlayAd(false);
    setCurrentOverlayAd(null);
    setShowLShapedAds(false);
    setLShapedAdData(null);
  }, []);

  // ✅ Quality change handler
  const handleQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (hlsRef.current) {
      const level = parseInt(event.target.value);
      hlsRef.current.currentLevel = level;
    }
  };

  // ✅ MediaTailor ads management based on creativeId
  useEffect(() => {
    if (overlayAds.length > 0) {
      // Group ads by availId to detect L-shaped ones
      const adsByAvailId = overlayAds.reduce((acc, ad) => {
        const availId = ad.availId || ad.adId || '';
        if (!acc[availId]) {
          acc[availId] = [];
        }
        acc[availId].push(ad);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Process each ad group
      Object.entries(adsByAvailId).forEach(([availId, ads]) => {
        // Check if this ad has already been displayed
        if (availId && isAdDisplayed(availId)) {
          return;
        }
        
        // Check if it's an L-shaped ad (multiple creatives with "l-shape")
        const lShapeAds = ads.filter(ad => ad.creativeId?.toLowerCase().includes('l-shape'));
        
        if (lShapeAds.length > 1) {
          // L-shaped ad with "top" and "side" creatives
          const topAd = lShapeAds.find(ad => ad.creativeId?.toLowerCase().includes('top'));
          const sideAd = lShapeAds.find(ad => ad.creativeId?.toLowerCase().includes('side'));
          
          if (topAd && sideAd) {
            // Mark this ad as displayed
            markAdAsDisplayed(availId);
            
            // Create data for L-shaped component
            const adData = createLShapedAdData(
              topAd.staticResource || 'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/480x70.jpg',
              sideAd.staticResource || 'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/480x70.jpg',
              topAd.clickThrough || '',
              sideAd.clickThrough || ''
            );
            
            setLShapedAdData(adData);
            setCurrentOverlayType('bottom-left');
            setShowLShapedAds(true);
            
            // Auto-hide after ad duration
            const duration = (topAd.duration || 15) * 1000;
            setTimeout(() => {
              handleLShapedAdComplete();
            }, duration);
            
            return;
          }
        }
        
        // Process a single ad (overlay or simple L-shaped)
        const firstAd = ads[0];
        const creativeId = firstAd.creativeId || '';

        if (availId) {
          markAdAsDisplayed(availId);
        }
        
        if (creativeId.toLowerCase().includes('overlay')) {
          // Display as overlay ad - convert to OverlayAdData
          const overlayData: OverlayAdData = {
            adId: firstAd.adId || '',
            adTitle: firstAd.adTitle || '',
            creativeId: firstAd.creativeId || '',
            staticResource: firstAd.staticResource || '',
            clickThrough: firstAd.clickThrough || '',
            width: firstAd.width || '400',
            height: firstAd.height || '300',
            duration: firstAd.duration || 10,
            availId: firstAd.availId || '',
            adSystem: firstAd.adSystem,
            trackingEvents: firstAd.trackingEvents || []
          };
          
          setCurrentOverlayAd(overlayData);
          setShowOverlayAd(true);
          
        } else if (creativeId.toLowerCase().includes('l-shape')) {
          // Display as simple L-shaped ad (same image for top and side)
          const imageUrl = firstAd.staticResource || 'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/480x70.jpg';
          const clickUrl = firstAd.clickThrough || '';
          
          // Create data for L-shaped component
          const adData = createLShapedAdData(imageUrl, imageUrl, clickUrl, clickUrl);
          
          setLShapedAdData(adData);
          setCurrentOverlayType('bottom-left');
          setShowLShapedAds(true);
          
          // Auto-hide after ad duration
          const duration = (firstAd.duration || 15) * 1000;
          setTimeout(() => {
            handleLShapedAdComplete();
          }, duration);
          
        } else {
          // By default, display as overlay ad - convert to OverlayAdData
          const overlayData: OverlayAdData = {
            adId: firstAd.adId || '',
            adTitle: firstAd.adTitle || '',
            creativeId: firstAd.creativeId || '',
            staticResource: firstAd.staticResource || '',
            clickThrough: firstAd.clickThrough || '',
            width: firstAd.width || '400',
            height: firstAd.height || '300',
            duration: firstAd.duration || 10,
            availId: firstAd.availId || '',
            adSystem: firstAd.adSystem,
            trackingEvents: firstAd.trackingEvents || []
          };
          
          setCurrentOverlayAd(overlayData);
          setShowOverlayAd(true);
        }
      });
    }
  }, [overlayAds, isAdDisplayed, markAdAsDisplayed, handleLShapedAdComplete]);

  // ✅ Video event tracking - essentials only
  const handlePlay = useCallback(() => {
    if (enableMediaTailorTracking && isSessionActive) {
      sendTrackingEvent({
        eventType: 'play',
        currentTime: videoRef.current?.currentTime || 0,
        duration: videoRef.current?.duration || 0
      });
    }
  }, [enableMediaTailorTracking, isSessionActive, sendTrackingEvent]);

  const handlePause = useCallback(() => {
    if (enableMediaTailorTracking && isSessionActive) {
      sendTrackingEvent({
        eventType: 'pause',
        currentTime: videoRef.current?.currentTime || 0,
        duration: videoRef.current?.duration || 0
      });
    }
  }, [enableMediaTailorTracking, isSessionActive, sendTrackingEvent]);

  const handleTimeUpdate = useCallback(() => {
    if (!enableMediaTailorTracking || !isSessionActive || !videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 0;

    // Tracking every 10 seconds
    if (currentTime - lastReportedTime >= 10) {
      sendTrackingEvent({
        eventType: 'timeupdate',
        currentTime,
        duration
      });
      setLastReportedTime(currentTime);
    }
  }, [enableMediaTailorTracking, isSessionActive, sendTrackingEvent, lastReportedTime]);

  // ✅ Event listeners setup - minimum necessary
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [handlePlay, handlePause, handleTimeUpdate]);

  // ✅ Timer cleanup on component unmount
  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }
      if (lShapedTimerRef.current) {
        clearTimeout(lShapedTimerRef.current);
      }
    };
  }, []);

  // ✅ Error state
  if (error) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">❌ Playback Error</div>
          <div className="text-sm opacity-75">{error}</div>
        </div>
      </div>
    );
  }

  // ✅ Render complet avec L-shaped ads et contrôles
  return (
    <div className="flex flex-col gap-2 items-center h-full">
      {/* ✅ Player Stats and Quality Selection */}
      <div className="md:flex flex-row gap-4 items-center w-full">
        <div className="flex flex-row flex-wrap w-full md:w-auto">
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

      {/* ✅ Video container with L-shaped ads management */}
      <div 
        className="relative w-full mx-auto" 
        style={{
          aspectRatio: '16/9',
          height: '600px',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          transform: 'translateZ(0)', // GPU acceleration
        }}
      >
        {/* ✅ L-shaped ads overlays */}
                 {showLShapedAds && lShapedAdData && (
           <LShapedAd
             isVisible={showLShapedAds}
             adData={lShapedAdData}
             overlayType={currentOverlayType}
             onAdClick={handleLShapedAdClick}
             onAdComplete={handleLShapedAdComplete}
             enableTracking={enableMediaTailorTracking}
             containerStyle={{
               zIndex: 20,
             }}
           />
         )}

        {/* ✅ Video zone with smooth animation */}
        <div 
          className="absolute overflow-hidden bg-black"
          style={{
            // Dynamic position based on L-shaped layout
            top: showLShapedAds ? (() => {
              if (currentOverlayType === 'l-shaped' || currentOverlayType === 'top-right' || currentOverlayType === 'top-left') {
                return '25%';
              }
              return '0%';
            })() : '0%',
            left: showLShapedAds ? (() => {
              if (currentOverlayType === 'top-left' || currentOverlayType === 'bottom-left') {
                return '25%';
              }
              return '0%';
            })() : '0%',
            right: showLShapedAds ? (() => {
              if (currentOverlayType === 'l-shaped' || currentOverlayType === 'top-right' || currentOverlayType === 'bottom-right') {
                return '25%';
              }
              return '0%';
            })() : '0%',
            bottom: showLShapedAds ? (() => {
              if (currentOverlayType === 'bottom-right' || currentOverlayType === 'bottom-left') {
                return '25%';
              }
              return '0%';
            })() : '0%',
            // Ultra-smooth animation
            transition: 'all 1.4s cubic-bezier(0.23, 1, 0.32, 1)',
            willChange: 'top, left, right, bottom, transform, box-shadow',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            boxShadow: showLShapedAds 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)' 
              : '0 4px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
          }}
        >
          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-full"
            style={{
              objectFit: 'cover' as const,
              aspectRatio: '16/9'
            }}
          />
        </div>

        {/* ✅ Overlay Ads (separate component) - Positioned in video container */}
        <OverlayAd
          adData={currentOverlayAd}
          isVisible={showOverlayAd && !showLShapedAds}
          onAdClick={handleOverlayAdClick}
          onAdClose={handleOverlayAdClose}
          enableTracking={enableMediaTailorTracking}
          position="bottom-center"
          zIndex={1000}
        />
      </div>

      {/* ✅ Demo Controls Panel */}
      <div 
        className="fixed bottom-4 left-4 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 z-50"
        style={{ minWidth: '250px' }}
      >
        <h3 className="text-white text-sm font-bold mb-3 border-b border-gray-600 pb-2">
          🎬 Demo Ads
        </h3>
        
        <div className="space-y-2">
          {/* Overlay Ad Demo */}
          <button
            onClick={triggerDemoOverlayAd}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-200"
            disabled={showOverlayAd}
          >
            📺 Overlay Ad
          </button>

          {/* L-shaped Ads Demo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerDemoLShapedAd('bottom-left')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors duration-200"
              disabled={showLShapedAds}
            >
              ↙️ L-Shape BL
            </button>
            <button
              onClick={() => triggerDemoLShapedAd('top-right')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors duration-200"
              disabled={showLShapedAds}
            >
              ↗️ L-Shape TR
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerDemoLShapedAd('top-left')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors duration-200"
              disabled={showLShapedAds}
            >
              ↖️ L-Shape TL
            </button>
            <button
              onClick={() => triggerDemoLShapedAd('bottom-right')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors duration-200"
              disabled={showLShapedAds}
            >
              ↘️ L-Shape BR
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetAllAds}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors duration-200"
          >
            🔄 Reset All Ads
          </button>
        </div>
      </div>

    </div>
  );
};

export default VideoPlayerAds; 
