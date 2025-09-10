// Types and interfaces for VideoPlayer components

// MediaTailor Event Types
export interface MediaTailorEvent {
  type: 'FILLED_OVERLAY_AVAIL' | 'OVERLAY_COMPLETE' | 'BREAK_START' | 'BREAK_END' | 'UNKNOWN';
  timestamp: number;
  duration?: number;
  metadata?: MediaTailorEventMetadata;
  raw?: unknown;
}

export interface MediaTailorEventMetadata {
  // Original metadata from tags
  tagName?: string;
  tagValue?: string;
  caid?: string;
  decodedCaid?: string;
  source?: string;
  
  // Enriched metadata for ad display
  availId?: string;
  assetUri?: string;
  clickThrough?: string;
  creativeId?: string;
  impressionUrl?: string;
  adSystem?: string;
  
  // Additional metadata
  originalCaid?: string;
  rawDateRange?: unknown;
  [key: string]: unknown; // For flexibility
}

export interface QualityLevel {
  height: number;
  width: number;
  bitrate: number;
  level: number;
}

export interface HlsStats {
  currentBitrate: number;
  minBitrate: number;
  maxBitrate: number;
}

export type OverlayType = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'l-shaped';

export interface LShapedAdData {
  topAd: { imageUrl: string; clickUrl: string; width: number; height: number };
  sideAd: { imageUrl: string; clickUrl: string; width: number; height: number };
}

// MediaTailor Client-side Tracking Types
export interface MediaTailorSession {
  sessionId: string;
  manifestUrl: string;
  trackingUrl: string;
  adsParameters?: Record<string, unknown>;
}

export interface MediaTailorTrackingEvent {
  eventType: 'play' | 'pause' | 'timeupdate' | 'ended' | 'ad_start' | 'ad_complete' | 'ad_error' | 'ad_skip' | 'ad_click';
  currentTime: number;
  duration: number;
  timestamp: number;
  sessionId: string;
  additionalData?: Record<string, unknown>;
}

export interface MediaTailorBeaconConfig {
  trackingUrl: string;
  sessionId: string;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface MediaTailorSessionInitRequest {
  adsParams?: Record<string, unknown>;
  sessionParameters?: Record<string, unknown>;
}

export interface MediaTailorSessionInitResponse {
  manifestUrl: string;
  trackingUrl: string;
  sessionId: string;
}

 