import { MultiviewLayout, MultiviewSource } from './types';
import { TilePlayer } from './tile-player';

interface MultiviewCanvasProps {
  layout: MultiviewLayout;
  tiles: (MultiviewSource | null)[];
  streamUrl: string;
  onFocusTile?: (index: number) => void;
  onSoloTile?: (index: number) => void;
}

// Client-side preview of the multiview composition: one video per tile, positioned per the
// selected layout geometry. This is a stand-in for the production output, where MediaPackage
// returns a single server-composited stream that a single player renders (see MultiviewPlayer).
// The preview lets the demo show every selected feed and react to layout changes without the
// beta multiview channel.
export function MultiviewCanvas({
  layout,
  tiles,
  streamUrl,
  onFocusTile,
  onSoloTile,
}: MultiviewCanvasProps) {
  const hasStream = Boolean(streamUrl);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
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
            {source && hasStream ? (
              <TilePlayer
                src={streamUrl}
                label={source.label}
                tileNumber={index + 1}
                featured={index === 0}
                onSelect={onFocusTile ? () => onFocusTile(index) : undefined}
                onSolo={onSoloTile ? () => onSoloTile(index) : undefined}
              />
            ) : (
              <div className="w-full h-full rounded border border-dashed border-white/20 flex items-center justify-center text-white/40 text-xs">
                {source ? source.label : 'Empty tile'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MultiviewCanvas;
