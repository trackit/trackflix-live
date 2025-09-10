import { 
  MediaTailorSession, 
  MediaTailorTrackingEvent,
  MediaTailorSessionInitRequest,
  MediaTailorSessionInitResponse
} from '../types';

export interface MediaTailorSessionConfig {
  sessionInitUrl: string;
  adsParams?: Record<string, any>;
  sessionParameters?: {
    timestamp?: number;
    userAgent?: string;
    platform?: string;
  };
}

export interface MediaTailorTrackingEventInput {
  eventType: 'play' | 'pause' | 'timeupdate' | 'ended' | 'ad_start' | 'ad_complete' | 'ad_error' | 'ad_skip';
  currentTime: number;
  duration: number;
  additionalData?: Record<string, any>;
}

export interface OverlayAdMetadata {
  adId: string;
  adTitle: string;
  creativeId: string;
  staticResource: string;  // Image URL
  clickThrough: string;    // Click URL
  width: string;
  height: string;
  expandedWidth?: string;
  expandedHeight?: string;
  duration: number;
  availId: string;
  adSystem?: string;
  maintainAspectRatio?: boolean;
  scalable?: boolean;
  staticResourceCreativeType?: string;
  trackingEvents?: any[];
}

export interface MediaTailorServiceEvents {
  onSessionInitialized?: (session: MediaTailorSession) => void;
  onTrackingDataReceived?: (data: any) => void;
  onOverlayAdsFound?: (ads: OverlayAdMetadata[]) => void;
  onError?: (error: Error) => void;
}

// ===========================
// MEDIATAILOR SERVICE
// ===========================

/**
 * ✅ Clean and reusable MediaTailor service
 * 
 * Manages all interaction with the MediaTailor API:
 * - Session initialization
 * - TrackingUrl polling  
 * - Overlay ads metadata extraction
 * - Tracking events sending
 */
export class MediaTailorService {
  private session: MediaTailorSession | null = null;
  private isInitializing = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private trackingData: any = null;
  private events: MediaTailorServiceEvents = {};
  private displayedAvailIds = new Set<string>(); // Track displayed ads to avoid duplicates

  /**
   * Event listeners configuration
   */
  public on(events: MediaTailorServiceEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * ✅ Initialize a new MediaTailor session
   */
  public async initializeSession(config: MediaTailorSessionConfig): Promise<MediaTailorSession> {
    // Prevent simultaneous initializations
    if (this.isInitializing) {
      throw new Error('Session initialization already in progress');
    }

    // Return existing session if available
    if (this.session) {
      console.log('♻️ MediaTailor: Reusing existing session', this.session);
      return this.session;
    }

    try {
      this.isInitializing = true;
      console.log('🎯 MediaTailor: Initializing session', config);

      const requestBody: MediaTailorSessionInitRequest = {
        adsParams: config.adsParams || {},
        sessionParameters: {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          platform: 'web',
          ...config.sessionParameters
        }
      };

      const response = await fetch(config.sessionInitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`MediaTailor session initialization failed: ${response.status} ${response.statusText}`);
      }

             const sessionData: MediaTailorSessionInitResponse = await response.json();
      
      // Build complete URLs
      const baseUrl = new URL(config.sessionInitUrl).origin;
      const buildCompleteUrl = (url: string): string => {
        return url.startsWith('/') ? `${baseUrl}${url}` : url;
      };

      // Create the session
      this.session = {
        sessionId: this.extractSessionId(sessionData, config.sessionInitUrl) || `fallback-${Date.now()}`,
        manifestUrl: buildCompleteUrl(sessionData.manifestUrl),
        trackingUrl: buildCompleteUrl(sessionData.trackingUrl),
        adsParameters: config.adsParams
      };

      console.log('✅ MediaTailor: Session initialized successfully', this.session);
      
      // Notify listeners
      if (this.events.onSessionInitialized) {
        this.events.onSessionInitialized(this.session);
      }

      return this.session;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ MediaTailor: Session initialization failed:', errorMessage);
      
      if (this.events.onError) {
        this.events.onError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * ✅ Start trackingUrl polling to retrieve metadata
   */
  public startTrackingPolling(intervalMs = 30000): void {
    if (!this.session) {
      throw new Error('No active MediaTailor session. Call initializeSession() first.');
    }

    if (this.pollingInterval) {
      console.log('🔄 MediaTailor: Polling already active');
      return;
    }

    console.log('🔄 MediaTailor: Starting tracking URL polling', {
      trackingUrl: this.session.trackingUrl,
      intervalMs
    });

    // First immediate call
    this.pollTrackingData();

    // Regular polling
    this.pollingInterval = setInterval(() => {
      this.pollTrackingData();
    }, intervalMs);
  }

  /**
   * ✅ Stop trackingUrl polling
   */
  public stopTrackingPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ MediaTailor: Stopped tracking URL polling');
    }
  }

  /**
   * ✅ Poll trackingUrl to retrieve data
   */
  public async pollTrackingData(): Promise<any> {
    if (!this.session) {
      throw new Error('No active MediaTailor session');
    }

    try {
      console.log('🔄 MediaTailor: Polling tracking URL for ad metadata', {
        trackingUrl: this.session.trackingUrl
      });

      const response = await fetch(this.session.trackingUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Tracking URL polling failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.trackingData = data;

      console.log('✅ MediaTailor: Received tracking data with ad metadata', data);

      // Notify listeners
      if (this.events.onTrackingDataReceived) {
        this.events.onTrackingDataReceived(data);
      }

      // Extract and notify overlay ads if found
      const overlayAds = this.extractOverlayAds(data);
      if (overlayAds.length > 0 && this.events.onOverlayAdsFound) {
        this.events.onOverlayAdsFound(overlayAds);
      }

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ MediaTailor: Error polling tracking URL:', errorMessage);
      
      if (this.events.onError) {
        this.events.onError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      return null;
    }
  }

  /**
   * ✅ Extract overlay ads metadata from tracking data
   * Only returns ads not yet displayed (filtered by availId)
   */
  public extractOverlayAds(trackingData?: any): OverlayAdMetadata[] {
    const data = trackingData || this.trackingData;
    const overlayAds: OverlayAdMetadata[] = [];

    try {
      if (!data?.avails) {
        return overlayAds;
      }

      data.avails.forEach((avail: any) => {
        const availId = avail.availId || '';
        
        // Ignore if this ad has already been displayed
        if (availId && this.displayedAvailIds.has(availId)) {
          console.log(`⚠️ MediaTailor: Skipping already displayed ad with availId: ${availId}`);
          return;
        }

        // Extract from nonLinearAdsList (overlay ads)
        if (avail.nonLinearAdsList && avail.nonLinearAdsList.length > 0) {
          avail.nonLinearAdsList.forEach((nonLinearAd: any) => {
            if (nonLinearAd.nonLinearAdList && nonLinearAd.nonLinearAdList.length > 0) {
              nonLinearAd.nonLinearAdList.forEach((ad: any) => {
                const overlayAd: OverlayAdMetadata = {
                  adId: ad.adId || '',
                  adTitle: ad.adTitle || '',
                  creativeId: ad.creativeId || '',
                  staticResource: ad.staticResource || '',
                  clickThrough: ad.clickThrough || '',
                  width: ad.width || '400',
                  height: ad.height || '300',
                  expandedWidth: ad.expandedWidth,
                  expandedHeight: ad.expandedHeight,
                  duration: ad.durationInSeconds || 0,
                  availId: availId,
                  adSystem: ad.adSystem,
                  maintainAspectRatio: ad.maintainAspectRatio,
                  scalable: ad.scalable,
                  staticResourceCreativeType: ad.staticResourceCreativeType,
                  trackingEvents: nonLinearAd.trackingEvents || []
                };
                
                overlayAds.push(overlayAd);
              });
            }
          });
        }
      });

      if (overlayAds.length > 0) {
        console.log(`🎯 MediaTailor: Extracted ${overlayAds.length} new overlay ad(s)`, overlayAds);
      }

    } catch (error) {
      console.log('❌ Error extracting overlay ads from tracking data:', error);
    }

    return overlayAds;
  }

  /**
   * ✅ Mark an availId as displayed to avoid duplicates
   */
  public markAdAsDisplayed(availId: string): void {
    if (availId) {
      this.displayedAvailIds.add(availId);
      console.log(`✅ MediaTailor: Marked ad as displayed: ${availId}`);
    }
  }

  /**
   * ✅ Check if an availId has already been displayed
   */
  public isAdDisplayed(availId: string): boolean {
    return this.displayedAvailIds.has(availId);
  }

  /**
   * ✅ Reset displayed ads tracking
   */
  public resetDisplayedAds(): void {
    this.displayedAvailIds.clear();
    console.log('🔄 MediaTailor: Reset displayed ads tracking');
  }

  /**
   * ✅ Return the number of already displayed ads
   */
  public getDisplayedAdsCount(): number {
    return this.displayedAvailIds.size;
  }

  /**
   * ✅ Send a tracking event to MediaTailor
   * Uses GET with query parameters (MediaTailor beacon format)
   */
  public async sendTrackingEvent(event: MediaTailorTrackingEventInput): Promise<void> {
    if (!this.session) {
          console.log('⚠️ MediaTailor: Cannot send tracking event - no active session');
      return;
    }

    try {
      const trackingEvent: MediaTailorTrackingEvent = {
        ...event,
        sessionId: this.session.sessionId,
        timestamp: Date.now()
      };

      console.log('📊 MediaTailor: Sending tracking event', trackingEvent);

      // ✅ CORRECTED: Build beacon URL with query parameters (as in original implementation)
      const beaconUrl = `${this.session.trackingUrl}?` + new URLSearchParams({
        sessionId: this.session.sessionId,
        eventType: trackingEvent.eventType,
        currentTime: trackingEvent.currentTime.toString(),
        duration: trackingEvent.duration.toString(),
        timestamp: trackingEvent.timestamp.toString(),
        // Flatten additional data as query parameters
        ...(trackingEvent.additionalData ? Object.fromEntries(
          Object.entries(trackingEvent.additionalData).map(([key, value]) => [key, String(value)])
        ) : {})
      }).toString();

      // ✅ CORRECTED: Use GET method with keepalive (MediaTailor beacon standard)
      const response = await fetch(beaconUrl, {
        method: 'GET',
        keepalive: true, // Ensures beacon is sent even if page is unloading
        headers: {
          'User-Agent': navigator.userAgent,
        }
      });

      if (!response.ok) {
        console.log(`⚠️ MediaTailor: Tracking beacon returned ${response.status}`, trackingEvent);
      } else {
        console.log('✅ MediaTailor: Tracking event sent successfully', trackingEvent);
      }

    } catch (error) {
      console.log('❌ MediaTailor: Error sending tracking event:', error);
      // Don't throw - tracking errors shouldn't break video playback (as in original)
    }
  }

  /**
   * ✅ Destroy the active session
   */
  public destroySession(): void {
    if (this.session) {
      console.log('🧹 MediaTailor: Destroying session', this.session.sessionId);
      this.stopTrackingPolling();
      this.session = null;
      this.trackingData = null;
    }
  }

  /**
   * ✅ Getters to access data
   */
  public getSession(): MediaTailorSession | null {
    return this.session;
  }

  public getTrackingData(): any {
    return this.trackingData;
  }

  public isSessionActive(): boolean {
    return this.session !== null;
  }

  /**
   * Helper: Extract sessionId from MediaTailor response
   */
  private extractSessionId(sessionData: any, sessionInitUrl: string): string | null {
    if (sessionData.sessionId) {
      return sessionData.sessionId;
    }
    
    // Try to extract from manifestUrl
    const manifestUrl = sessionData.manifestUrl;
    const sessionIdMatch = manifestUrl.match(/[?&]sessionId=([^&]+)/);
    if (sessionIdMatch) {
      return sessionIdMatch[1];
    }
    
    // Try to extract from trackingUrl (last segment)
    const trackingPath = sessionData.trackingUrl;
    const pathSegments = trackingPath.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Check if it looks like a UUID
    if (lastSegment && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment)) {
      return lastSegment;
    }
    
    return null;
  }
}

export const mediaTailorService = new MediaTailorService();
