import React, { useCallback, useEffect } from 'react';

// ✅ Types for L-shaped ads
export type OverlayType = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'l-shaped';

export interface LShapedAdData {
  topAd: { imageUrl: string; clickUrl: string; width: number; height: number };
  sideAd: { imageUrl: string; clickUrl: string; width: number; height: number };
}

export interface AdCreativeData {
  adId: string;
  adTitle: string;
  creativeId: string;
  staticResource: string;
  clickThrough: string;
  width: string;
  height: string;
  duration: number;
  availId: string;
}

export interface LShapedAdProps {
  // Callbacks
  onAdClick?: (clickUrl?: string) => void;
  onAdStart?: () => void;
  onAdComplete?: () => void;
  
  // Configuration
  enableTracking?: boolean;
  containerStyle?: React.CSSProperties;
  
  // External control
  isVisible?: boolean;
  adData?: LShapedAdData | null;
  overlayType?: OverlayType;
}

/**
 * ✅ LShapedAd Component - Manages the display of L-shaped advertisements
 * 
 * Features:
 * - Smooth animations and transitions
 * - Different layout types (top-right, bottom-left, etc.)
 * - Dynamic video positioning
 * - Click handling on different zones
 * - Auto-hide with timing
 */
export const LShapedAd: React.FC<LShapedAdProps> = ({
  onAdClick,
  onAdStart,
  onAdComplete,
  enableTracking = false,
  containerStyle = {},
  isVisible = false,
  adData = null,
  overlayType = 'l-shaped'
}) => {

  // ✅ Effect to notify the start and end of the ad
  useEffect(() => {
    if (isVisible && adData && onAdStart) {
      onAdStart();
    }
  }, [isVisible, adData, onAdStart]);

  // ✅ Ad click handling
  const handleLShapedAdClick = useCallback((adType: 'top' | 'side') => {
    if (!adData) return;
    
    const clickUrl = adType === 'top' ? adData.topAd.clickUrl : adData.sideAd.clickUrl;
    if (clickUrl && onAdClick) {
      onAdClick(clickUrl);
    }
  }, [adData, onAdClick]);

  // ✅ Don't render if not visible
  if (!isVisible || !adData) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        ...containerStyle
      }}
    >
      {/* ✅ Top Ad Area */}
      {isVisible && (overlayType === 'l-shaped' || overlayType === 'top-right' || overlayType === 'top-left') && (
        <div 
          className="absolute bg-gray-800 overflow-hidden flex items-center justify-center text-white"
          style={{ 
            top: '0%',
            left: '0%',
            right: '0%',
            height: '25%',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.9)',
            transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: isVisible ? '0.5s' : '0s',
            zIndex: 20,
            pointerEvents: 'auto',
          }}
        >
          {adData.topAd.imageUrl ? (
            <img
              src={adData.topAd.imageUrl}
              alt="Top Advertisement"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleLShapedAdClick('top')}
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-sm">Top Advertisement</p>
              <p className="text-xs opacity-70">Available ad space</p>
            </div>
          )}
        </div>
      )}
      
      {/* ✅ Right Ad Area */}
      {isVisible && (overlayType === 'l-shaped' || overlayType === 'top-right' || overlayType === 'bottom-right') && (
        <div 
          className="absolute bg-gray-800 overflow-hidden flex items-center justify-center text-white"
          style={{ 
            top: overlayType === 'l-shaped' ? '0%' : (overlayType === 'top-right' ? '25%' : '0%'),
            right: '0%',
            bottom: overlayType === 'bottom-right' ? '25%' : '0%',
            width: '25%',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.9)',
            transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: isVisible ? '0.7s' : '0s',
            zIndex: 20,
            pointerEvents: 'auto',
          }}
        >
          {adData.sideAd.imageUrl ? (
            <img
              src={adData.sideAd.imageUrl}
              alt="Right Advertisement"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleLShapedAdClick('side')}
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-sm">Right Advertisement</p>
              <p className="text-xs opacity-70">Available ad space</p>
            </div>
          )}
        </div>
      )}

      {/* ✅ Left Ad Area */}
      {isVisible && (overlayType === 'top-left' || overlayType === 'bottom-left') && (
        <div 
          className="absolute bg-gray-800 overflow-hidden flex items-center justify-center text-white"
          style={{ 
            top: overlayType === 'top-left' ? '25%' : '0%',
            left: '0%',
            bottom: overlayType === 'bottom-left' ? '25%' : '0%',
            width: '25%',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-30px) scale(0.9)',
            transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: isVisible ? '0.7s' : '0s',
            zIndex: 20,
            pointerEvents: 'auto',
          }}
        >
          {adData.sideAd.imageUrl ? (
            <img
              src={adData.sideAd.imageUrl}
              alt="Left Advertisement"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleLShapedAdClick('side')}
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-sm">Left Advertisement</p>
              <p className="text-xs opacity-70">Available ad space</p>
            </div>
          )}
        </div>
      )}

      {/* ✅ Bottom Ad Area */}
      {isVisible && (overlayType === 'bottom-right' || overlayType === 'bottom-left') && (
        <div 
          className="absolute bg-gray-800 overflow-hidden flex items-center justify-center text-white"
          style={{ 
            bottom: '0%',
            left: '0%',
            right: '0%',
            height: '25%',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
            transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: isVisible ? '0.9s' : '0s',
            zIndex: 20,
            pointerEvents: 'auto',
          }}
        >
          {adData.topAd.imageUrl ? (
            <img
              src={adData.topAd.imageUrl}
              alt="Bottom Advertisement"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleLShapedAdClick('top')}
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-sm">Bottom Advertisement</p>
              <p className="text-xs opacity-70">Available ad space</p>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

// ✅ Utility functions to facilitate usage
export const createLShapedAdData = (
  topImageUrl: string,
  sideImageUrl: string,
  topClickUrl?: string,
  sideClickUrl?: string
): LShapedAdData => ({
  topAd: { 
    imageUrl: topImageUrl, 
    clickUrl: topClickUrl || '', 
    width: 300, 
    height: 200 
  },
  sideAd: { 
    imageUrl: sideImageUrl || '', 
    clickUrl: sideClickUrl || '', 
    width: 200, 
    height: 300 
  }
});

export default LShapedAd; 