// Export all VideoPlayer elements

// Main components
export { VideoPlayer } from './video-player';

// ✅ Minimal MediaTailor Video Player - Production ready
export { VideoPlayerAds } from './video-player-ads';

// ✅ New MediaTailor Service - Clean and reusable
export { 
  MediaTailorService,
  mediaTailorService,
  type MediaTailorSessionConfig,
  type MediaTailorTrackingEventInput,
  type OverlayAdMetadata,
  type MediaTailorServiceEvents
} from './services/MediaTailorService';
export { 
  useMediaTailorService,
  type UseMediaTailorServiceReturn 
} from './hooks/useMediaTailorService';

// Export types
export type {
  QualityLevel,
  HlsStats,
  OverlayType,
  LShapedAdData,
  MediaTailorSession,
  MediaTailorTrackingEvent,
  MediaTailorBeaconConfig,
  MediaTailorSessionInitRequest,
  MediaTailorSessionInitResponse,
  MediaTailorEvent,
} from './types';

// Export ad components
export { 
  OverlayAd,
  type OverlayAdData,
  type OverlayAdProps
} from './components/OverlayAd';

export { 
  LShapedAd,
  createLShapedAdData,
  type LShapedAdData as LShapedAdDataComponent,
  type LShapedAdProps,
  type AdCreativeData,
  type OverlayType as OverlayTypeComponent
} from './components/LShapedAd';

// Export constants and utilities
export { ERROR_MESSAGES } from './constants';
export { formatBitrate } from './utils'; 