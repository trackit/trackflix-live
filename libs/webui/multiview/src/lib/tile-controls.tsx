import { Maximize2, Star } from 'lucide-react';
import { MultiviewSource } from './types';

interface TileControlsProps {
  tiles: (MultiviewSource | null)[];
  onFocus: (index: number) => void;
  onSolo: (index: number) => void;
}

function IconButton({
  label,
  title,
  onClick,
  children,
}: {
  label: string;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onClick={onClick}
      className="grid place-items-center w-[34px] h-[34px] rounded-lg bg-base-content/10 text-base-content/70 hover:bg-base-content/20 hover:text-base-content transition-colors"
    >
      {children}
    </button>
  );
}

// Per-tile controls rendered below the player (not over the video): the composited stream places
// tiles with its own letterboxing, so on-video hotspots do not line up. A labelled chip row is
// always aligned and reads clearly. The primary tile (index 0) is marked PRIMARY and cannot be
// re-featured; every other tile can be made primary (star) or watched alone (expand).
export function TileControls({ tiles, onFocus, onSolo }: TileControlsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {tiles.map((source, index) => {
        if (!source) {
          return null;
        }
        const isPrimary = index === 0;
        return (
          <div
            key={index}
            className={`flex items-center gap-2.5 h-[52px] pl-2 pr-2.5 rounded-[11px] border ${
              isPrimary
                ? 'bg-primary/[.12] border-primary/40'
                : 'bg-base-200 border-base-content/10'
            }`}
          >
            <span
              className={`grid place-items-center w-6 h-6 rounded-[7px] font-mono text-[11px] font-bold ${
                isPrimary
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-content/10 text-base-content/80'
              }`}
            >
              {index + 1}
            </span>
            <span className="flex flex-col mr-1">
              <span className="text-[13px] font-semibold leading-none">
                {source.label}
              </span>
              {isPrimary && (
                <span className="text-[9px] font-semibold tracking-[.1em] text-primary mt-1">
                  PRIMARY
                </span>
              )}
            </span>
            {!isPrimary && (
              <IconButton
                label={`Make ${source.label} primary`}
                title="Make primary"
                onClick={() => onFocus(index)}
              >
                <Star className="w-[15px] h-[15px]" />
              </IconButton>
            )}
            <IconButton
              label={`Watch ${source.label} alone`}
              title="Watch alone"
              onClick={() => onSolo(index)}
            >
              <Maximize2 className="w-[15px] h-[15px]" />
            </IconButton>
          </div>
        );
      })}
    </div>
  );
}

export default TileControls;
