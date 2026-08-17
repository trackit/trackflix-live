import { Maximize2 } from 'lucide-react';
import { MultiviewLayout, MultiviewSource } from './types';

interface TileOverlayProps {
  layout: MultiviewLayout;
  tiles: (MultiviewSource | null)[];
  onFocusTile: (index: number) => void;
  onSoloTile: (index: number) => void;
}

// Interactive layer over the single composited video: one region per layout tile (positioned from
// the tile geometry). Click a region to make that feed the primary/large view; the solo button plays
// that feed full screen (with its own audio). Tile 0 is the current primary and is highlighted.
export function TileOverlay({
  layout,
  tiles,
  onFocusTile,
  onSoloTile,
}: TileOverlayProps) {
  return (
    <div className="absolute inset-0">
      {layout.tiles.map((geometry, index) => {
        const source = tiles[index] ?? null;
        const isPrimary = index === 0;
        return (
          <div
            key={index}
            className="absolute p-[3px]"
            style={{
              left: `${geometry.x * 100}%`,
              top: `${geometry.y * 100}%`,
              width: `${geometry.width * 100}%`,
              height: `${geometry.height * 100}%`,
            }}
          >
            <div
              className={`relative w-full h-full rounded overflow-hidden group ${
                isPrimary
                  ? 'ring-2 ring-primary'
                  : 'ring-1 ring-transparent hover:ring-white/50'
              }`}
            >
              <button
                type="button"
                onClick={() => onFocusTile(index)}
                aria-label={
                  source
                    ? `Feature ${source.label}`
                    : `Feature tile ${index + 1}`
                }
                title={source ? `Feature ${source.label}` : undefined}
                className="absolute inset-0 w-full h-full cursor-pointer"
              />
              {source && (
                <span className="pointer-events-none absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                  {source.label}
                </span>
              )}
              {isPrimary && (
                <span className="pointer-events-none absolute top-1 left-1 badge badge-primary badge-sm">
                  Featured
                </span>
              )}
              <button
                type="button"
                title="Play this feed full screen"
                onClick={() => onSoloTile(index)}
                className="absolute top-1 right-1 btn btn-xs btn-circle btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TileOverlay;
