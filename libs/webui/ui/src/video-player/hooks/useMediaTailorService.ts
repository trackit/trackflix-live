import { useState, useEffect, useCallback } from 'react';
import { 
  mediaTailorService, 
  MediaTailorSessionConfig,
  MediaTailorTrackingEventInput,
  OverlayAdMetadata,
  MediaTailorServiceEvents
} from '../services/MediaTailorService';
import { MediaTailorSession } from '../types';

export interface UseMediaTailorServiceReturn {
  // Session state
  session: MediaTailorSession | null;
  isSessionActive: boolean;
  trackingData: any;
  overlayAds: OverlayAdMetadata[];
  
  // Actions
  initializeSession: (config: MediaTailorSessionConfig) => Promise<MediaTailorSession>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  sendTrackingEvent: (event: MediaTailorTrackingEventInput) => Promise<void>;
  destroySession: () => void;
  
  // Helpers
  getOverlayAds: () => OverlayAdMetadata[];
  
  // Ad tracking management
  markAdAsDisplayed: (availId: string) => void;
  isAdDisplayed: (availId: string) => boolean;
  resetDisplayedAds: () => void;
  getDisplayedAdsCount: () => number;
}

/**
 * ✅ Simplified React hook for using the MediaTailor service
 * 
 * Wraps the MediaTailor service in a React hook for:
 * - Automatic state management
 * - Lifecycle management 
 * - Event listeners setup
 */
export const useMediaTailorService = (
  autoCleanup = true
): UseMediaTailorServiceReturn => {
  
  // Local state
  const [session, setSession] = useState<MediaTailorSession | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [overlayAds, setOverlayAds] = useState<OverlayAdMetadata[]>([]);

  // Setup service event listeners
  useEffect(() => {
    const events: MediaTailorServiceEvents = {
      onSessionInitialized: (newSession) => {
        setSession(newSession);
      },
      onTrackingDataReceived: (data) => {
        setTrackingData(data);
      },
      onOverlayAdsFound: (ads) => {
        setOverlayAds(ads);
      },
      onError: (error) => {
        console.error('MediaTailor Service Error:', error);
      }
    };

    mediaTailorService.on(events);

    // Synchronize initial state
    setSession(mediaTailorService.getSession());
    setTrackingData(mediaTailorService.getTrackingData());

    return () => {
      // Auto-cleanup if requested
      if (autoCleanup) {
        mediaTailorService.destroySession();
      }
    };
  }, [autoCleanup]);

  // Wrapped actions
  const initializeSession = useCallback(async (config: MediaTailorSessionConfig): Promise<MediaTailorSession> => {
    return await mediaTailorService.initializeSession(config);
  }, []);

  const startPolling = useCallback((intervalMs = 30000): void => {
    mediaTailorService.startTrackingPolling(intervalMs);
  }, []);

  const stopPolling = useCallback((): void => {
    mediaTailorService.stopTrackingPolling();
  }, []);

  const sendTrackingEvent = useCallback(async (event: MediaTailorTrackingEventInput): Promise<void> => {
    await mediaTailorService.sendTrackingEvent(event);
  }, []);

  const destroySession = useCallback((): void => {
    mediaTailorService.destroySession();
    setSession(null);
    setTrackingData(null);
    setOverlayAds([]);
  }, []);

  const getOverlayAds = useCallback((): OverlayAdMetadata[] => {
    return mediaTailorService.extractOverlayAds();
  }, []);

  // Ad tracking management methods
  const markAdAsDisplayed = useCallback((availId: string): void => {
    mediaTailorService.markAdAsDisplayed(availId);
  }, []);

  const isAdDisplayed = useCallback((availId: string): boolean => {
    return mediaTailorService.isAdDisplayed(availId);
  }, []);

  const resetDisplayedAds = useCallback((): void => {
    mediaTailorService.resetDisplayedAds();
  }, []);

  const getDisplayedAdsCount = useCallback((): number => {
    return mediaTailorService.getDisplayedAdsCount();
  }, []);

  return {
    // State
    session,
    isSessionActive: mediaTailorService.isSessionActive(),
    trackingData,
    overlayAds,
    
    // Actions
    initializeSession,
    startPolling,
    stopPolling,
    sendTrackingEvent,
    destroySession,
    
    // Helpers
    getOverlayAds,
    
    // Ad tracking management
    markAdAsDisplayed,
    isAdDisplayed,
    resetDisplayedAds,
    getDisplayedAdsCount
  };
}; 