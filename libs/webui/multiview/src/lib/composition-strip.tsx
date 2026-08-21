import { MultiviewSource } from './types';

interface CompositionStripProps {
  tiles: (MultiviewSource | null)[];
  onOpenTile: (index: number) => void;
}

// Horizontally scrollable row of the current tiles (design screen A). The primary tile leads and is
// highlighted; tapping any chip opens that tile's action sheet.
export function CompositionStrip({ tiles, onOpenTile }: CompositionStripProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4"
      style={{ scrollbarWidth: 'none' }}
    >
      {tiles.map((source, index) =>
        source ? (
          <button
            key={index}
            type="button"
            onClick={() => onOpenTile(index)}
            className={`flex items-center gap-2.5 h-[46px] shrink-0 pl-2.5 pr-3.5 rounded-xl border transition-colors ${
              index === 0
                ? 'bg-primary/[.14] border-primary/45'
                : 'bg-base-200 border-base-content/10'
            }`}
          >
            <span
              className={`grid place-items-center w-6 h-6 rounded-[7px] font-mono text-[11px] font-bold ${
                index === 0
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-content/10 text-base-content/80'
              }`}
            >
              {index + 1}
            </span>
            <span className="text-[13px] font-semibold">{source.label}</span>
          </button>
        ) : null
      )}
    </div>
  );
}

export default CompositionStrip;
