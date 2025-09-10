import React, { useEffect, useCallback } from 'react';

// Types for overlay ads metadata
export interface OverlayAdData {
  adId: string;
  adTitle: string;
  creativeId: string;
  staticResource: string;
  clickThrough: string;
  width: string;
  height: string;
  duration: number;
  availId: string;
  adSystem?: string;
  trackingEvents?: any[];
}

export interface OverlayAdProps {
  // Ad data
  adData: OverlayAdData | null;
  isVisible: boolean;
  
  // Callbacks
  onAdClick?: (clickUrl?: string) => void;
  onAdClose?: () => void;
  onAdStart?: () => void;
  onAdComplete?: () => void;
  
  // Configuration
  enableTracking?: boolean;
  autoHideDuration?: number; // in seconds
  
  // Style and positioning
  position?: 'bottom-center' | 'top-center' | 'center';
  zIndex?: number;
}

/**
 * ✅ OverlayAd Component - Manages the display of overlay advertisements
 * 
 * Features:
 * - Automatic display with timing
 * - Click handling and tracking
 * - Configurable auto-hide
 * - Flexible positioning
 */
export const OverlayAd: React.FC<OverlayAdProps> = ({
  adData,
  isVisible,
  onAdClick,
  onAdClose,
  onAdStart,
  onAdComplete,
  enableTracking = false,
  autoHideDuration,
  position = 'bottom-center',
  zIndex = 1000
}) => {

  // ✅ Auto-hide logic based on ad duration
  useEffect(() => {
    if (!isVisible || !adData) return;
    
    // Notify ad start
    if (onAdStart) {
      onAdStart();
    }

    // Calculate auto-hide duration
    const duration = (autoHideDuration || adData.duration || 10) * 1000;
    
    const hideTimer = setTimeout(() => {
      if (onAdComplete) {
        onAdComplete();
      }
      if (onAdClose) {
        onAdClose();
      }
    }, duration);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [isVisible, adData, autoHideDuration, onAdStart, onAdComplete, onAdClose]);

  // ✅ Handle ad click
  const handleClick = useCallback(() => {
    if (onAdClick && adData?.clickThrough) {
      onAdClick(adData.clickThrough);
    }
  }, [onAdClick, adData?.clickThrough]);

  // ✅ Don't render if not visible or no data
  if (!isVisible || !adData) {
    return null;
  }

  // ✅ Positioning classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom-center':
      default:
        return 'bottom-16 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div 
      className={`absolute cursor-pointer ${getPositionClasses()}`}
      style={{ 
        zIndex: zIndex // High z-index to be above everything
      }}
      onClick={handleClick}
    >
      <img
        src={adData.staticResource || 'https://trackit-tv-mathis.s3.us-west-2.amazonaws.com/480x70.jpg'}
        alt={adData.adTitle || 'Advertisement'}
        className="w-full h-auto transition-opacity duration-300"
        style={{ 
          maxHeight: '200px', 
          objectFit: 'cover',
          opacity: isVisible ? 1 : 0
        }}
      />
    </div>
  );
};

export default OverlayAd; 