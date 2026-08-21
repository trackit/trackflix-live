import {
  MultiviewEndpointConfig,
  buildSingleViewManifestUrl,
} from './manifest-url';
import { LivePreview } from './live-preview';
import { MultiviewSource, SourceId } from './types';

interface SourceFeedGridProps {
  sources: MultiviewSource[];
  tiles: (SourceId | null)[];
  onToggle: (id: SourceId) => void;
  // When set, each feed shows a live preview of its own single-view stream instead of a flat colour.
  endpoint?: MultiviewEndpointConfig;
  variant?: 'desktop' | 'mobile';
  // While replacing a feed, every source is pickable (tapping drops it into the tile being swapped).
  swapMode?: boolean;
}

export function SourceFeedGrid({
  sources,
  tiles,
  onToggle,
  endpoint,
  variant = 'desktop',
  swapMode = false,
}: SourceFeedGridProps) {
  const isFull = !tiles.includes(null);
  const isMobile = variant === 'mobile';
  const thumbHeight = isMobile ? 'h-[78px]' : 'h-[59px]';

  return (
    <div className={`grid gap-2.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {sources.map((source) => {
        const tileIndex = tiles.indexOf(source.id);
        const isSelected = tileIndex >= 0;
        const isDisabled = !isSelected && isFull && !swapMode;
        const previewUrl = endpoint
          ? buildSingleViewManifestUrl(endpoint, source.channelRef)
          : '';
        return (
          <button
            key={source.id}
            type="button"
            onClick={() => onToggle(source.id)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            aria-label={source.label}
            className={`relative rounded-[10px] overflow-hidden border-2 transition-colors ${
              isSelected
                ? 'border-primary'
                : 'border-base-content/10 hover:border-primary/40'
            } ${isDisabled ? 'opacity-55 cursor-not-allowed' : ''}`}
          >
            {previewUrl ? (
              <LivePreview
                src={previewUrl}
                className={`w-full ${thumbHeight} object-cover bg-black`}
              />
            ) : (
              <div
                className={`w-full ${thumbHeight}`}
                style={{ backgroundColor: source.color }}
              />
            )}
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 grid place-items-center w-5 h-5 rounded-[6px] bg-primary text-primary-content font-mono text-[10px] font-bold">
                {tileIndex + 1}
              </span>
            )}
            {isDisabled && (
              <span className="absolute top-1.5 right-1.5 grid place-items-center h-5 px-1.5 rounded-[6px] bg-base-100/80 text-base-content/70 font-mono text-[9px] font-bold tracking-wide">
                SWAP
              </span>
            )}
            <span className="absolute bottom-0 left-0 right-0 bg-black/55 text-white text-[11px] font-semibold px-2 py-1 text-left">
              {source.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SourceFeedGrid;
