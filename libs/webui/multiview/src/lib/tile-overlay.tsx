import { Maximize2, Scan } from 'lucide-react';
import { MultiviewLayout, MultiviewSource } from './types';

interface TileOverlayProps {
  layout: MultiviewLayout;
  tiles: (MultiviewSource | null)[];
  onFocusTile: (index: number) => void;
  onSoloTile: (index: number) => void;
}

// Interactive layer over the single composited video: one region per layout tile (positioned from
// the tile geometry). Each tile has two explicit actions (no whole-tile click, to avoid surprising
// layout changes): focus makes that feed the primary/large view, solo plays it full screen.
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
            <div className="relative w-full h-full group">
              {source && (
                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                  {source.label}
                </span>
              )}
              <div className="absolute top-1 right-1 flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title="Make this the primary view"
                  onClick={() => onFocusTile(index)}
                  className="btn btn-xs btn-circle btn-neutral"
                >
                  <Scan className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Play this feed full screen"
                  onClick={() => onSoloTile(index)}
                  className="btn btn-xs btn-circle btn-neutral"
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
