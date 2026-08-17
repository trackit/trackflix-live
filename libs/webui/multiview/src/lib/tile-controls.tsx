import { Maximize2, Scan } from 'lucide-react';
import { MultiviewSource } from './types';

interface TileControlsProps {
  tiles: (MultiviewSource | null)[];
  onFocus: (index: number) => void;
  onSolo: (index: number) => void;
}

// Per-tile controls rendered below the player (not over the video): the composited stream places
// tiles with its own letterboxing, so on-video hotspots do not line up. A labelled row is always
// aligned and reads clearly. Focus makes the tile the primary view; solo plays it full screen.
export function TileControls({ tiles, onFocus, onSolo }: TileControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tiles.map((source, index) =>
        source ? (
          <div
            key={index}
            className="flex items-center gap-1 bg-base-200 rounded-lg pl-2 pr-1 py-1"
          >
            <span className="badge badge-neutral badge-sm">{index + 1}</span>
            <span className="text-sm font-medium mr-1">{source.label}</span>
            <button
              type="button"
              aria-label={`Feature ${source.label}`}
              title="Make this the primary view"
              onClick={() => onFocus(index)}
              className="btn btn-xs btn-ghost btn-circle"
            >
              <Scan className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={`Full screen ${source.label}`}
              title="Play this feed full screen"
              onClick={() => onSolo(index)}
              className="btn btn-xs btn-ghost btn-circle"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : null
      )}
    </div>
  );
}

export default TileControls;
