// Utility functions for VideoPlayer components

/**
 * Format bitrate from bits to Mbps
 */
export const formatBitrate = (bits: number): string => {
  const mbps = (bits / 1_000_000).toFixed(2);
  return `${mbps} Mbps`;
}; 