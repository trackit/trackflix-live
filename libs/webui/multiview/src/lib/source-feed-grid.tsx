import { MultiviewSource, SourceId } from './types';

interface SourceFeedGridProps {
  sources: MultiviewSource[];
  tiles: (SourceId | null)[];
  onToggle: (id: SourceId) => void;
}

export function SourceFeedGrid({
  sources,
  tiles,
  onToggle,
}: SourceFeedGridProps) {
  const isFull = !tiles.includes(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {sources.map((source) => {
        const tileIndex = tiles.indexOf(source.id);
        const isSelected = tileIndex >= 0;
        const isDisabled = !isSelected && isFull;
        return (
          <button
            key={source.id}
            type="button"
            onClick={() => onToggle(source.id)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            aria-label={source.label}
            className={`relative rounded-lg overflow-hidden border-2 transition-all ${
              isSelected
                ? 'border-primary shadow'
                : 'border-transparent hover:border-primary/40'
            } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <img
              src={source.thumbnail}
              alt={source.label}
              className="w-full aspect-video object-cover"
            />
            {isSelected && (
              <span className="absolute top-1 right-1 badge badge-primary badge-sm font-bold">
                {tileIndex + 1}
              </span>
            )}
            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-medium px-2 py-1 text-left">
              {source.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SourceFeedGrid;
