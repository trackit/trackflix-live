import { Maximize2, Scan, Volume2 } from 'lucide-react';
import { MultiviewLayout, MultiviewSource } from './types';

interface TileOverlayProps {
  layout: MultiviewLayout;
  tiles: (MultiviewSource | null)[];
  activeTile: number;
  onSelectTile: (index: number) => void;
  onFocusTile: (index: number) => void;
  onSoloTile: (index: number) => void;
}

// Interactive layer over the single composited video: one region per layout tile (positioned from the
// tile geometry). Click a region to make it the active audio tile; the focus/solo buttons promote a
// tile to primary or play it full screen.
export function TileOverlay({
  layout,
  tiles,
  activeTile,
  onSelectTile,
  onFocusTile,
  onSoloTile,
}: TileOverlayProps) {
  return (
    <div className="absolute inset-0">
      {layout.tiles.map((geometry, index) => {
        const source = tiles[index] ?? null;
        const isActive = index === activeTile;
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
              className={`relative w-full h-full rounded overflow-hidden ${
                isActive
                  ? 'ring-2 ring-success'
                  : 'ring-1 ring-transparent hover:ring-white/40'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTile(index)}
                aria-label={
                  source ? `Listen to ${source.label}` : `Tile ${index + 1}`
                }
                className="absolute inset-0 w-full h-full cursor-pointer"
              />
              {isActive && (
                <span className="pointer-events-none absolute top-1 left-1 badge badge-success badge-sm gap-1">
                  <Volume2 className="w-3 h-3" />
                  Audio
                </span>
              )}
              {source && (
                <span className="pointer-events-none absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                  {source.label}
                </span>
              )}
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  type="button"
                  title="Focus (make this the primary view)"
                  onClick={() => onFocusTile(index)}
                  className="btn btn-xs btn-circle btn-neutral opacity-80 hover:opacity-100"
                >
                  <Scan className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Solo (play this feed full screen)"
                  onClick={() => onSoloTile(index)}
                  className="btn btn-xs btn-circle btn-neutral opacity-80 hover:opacity-100"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TileOverlay;
