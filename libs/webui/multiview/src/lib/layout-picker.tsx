import { LAYOUTS } from './layouts';
import { LayoutId, MultiviewLayout } from './types';

interface LayoutPickerProps {
  selected: LayoutId;
  onSelect: (id: LayoutId) => void;
}

function LayoutSchematic({ layout }: { layout: MultiviewLayout }) {
  return (
    <svg viewBox="0 0 100 56" className="w-full h-auto" aria-hidden="true">
      {layout.tiles.map((tile, index) => (
        <rect
          key={index}
          x={tile.x * 100 + 1}
          y={tile.y * 56 + 1}
          width={tile.width * 100 - 2}
          height={tile.height * 56 - 2}
          rx="2"
          className="fill-primary/20 stroke-primary"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export function LayoutPicker({ selected, onSelect }: LayoutPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {LAYOUTS.map((layout) => {
        const isActive = layout.id === selected;
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout.id)}
            aria-pressed={isActive}
            className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
              isActive
                ? 'border-primary bg-primary/5 shadow'
                : 'border-base-300 hover:border-primary/50'
            }`}
          >
            <LayoutSchematic layout={layout} />
            <span className="text-xs font-semibold text-center">
              <span className="badge badge-ghost badge-xs font-mono mr-1">
                {layout.id}
              </span>
              {layout.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default LayoutPicker;
