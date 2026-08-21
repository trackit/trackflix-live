import { LAYOUTS, LAYOUT_GROUPS } from './layouts';
import { LayoutId, MultiviewLayout } from './types';

interface LayoutPickerProps {
  selected: LayoutId;
  onSelect: (id: LayoutId) => void;
  variant?: 'desktop' | 'mobile';
}

function LayoutSchematic({
  layout,
  active,
}: {
  layout: MultiviewLayout;
  active: boolean;
}) {
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
          className={
            active
              ? index === 0
                ? 'fill-primary'
                : 'fill-primary/40'
              : 'fill-base-content/25'
          }
        />
      ))}
    </svg>
  );
}

function LayoutCard({
  layout,
  selected,
  onSelect,
}: {
  layout: MultiviewLayout;
  selected: LayoutId;
  onSelect: (id: LayoutId) => void;
}) {
  const active = layout.id === selected;
  return (
    <button
      type="button"
      onClick={() => onSelect(layout.id)}
      aria-pressed={active}
      className={`flex flex-col gap-2 p-2 rounded-[10px] border-2 transition-colors ${
        active
          ? 'border-primary bg-primary/[.08]'
          : 'border-base-content/10 hover:border-primary/50'
      }`}
    >
      <LayoutSchematic layout={layout} active={active} />
      <span className="text-[10.5px] font-semibold text-left leading-tight">
        <span
          className={`font-mono mr-1 ${
            active ? 'text-primary' : 'text-base-content/50'
          }`}
        >
          {layout.id}
        </span>
        {layout.label}
      </span>
    </button>
  );
}

export function LayoutPicker({
  selected,
  onSelect,
  variant = 'desktop',
}: LayoutPickerProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-5">
        {LAYOUT_GROUPS.map((group) => {
          const isCurrent = group.layouts.some(
            (layout) => layout.id === selected
          );
          return (
            <div key={group.tileCount} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-[.12em] uppercase text-base-content/45">
                  {group.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase text-primary">
                    current
                  </span>
                )}
                {group.note && (
                  <span className="text-[10px] text-base-content/40">
                    {group.note}
                  </span>
                )}
                <span className="flex-1 h-px bg-base-content/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.layouts.map((layout) => (
                  <LayoutCard
                    key={layout.id}
                    layout={layout}
                    selected={selected}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {LAYOUTS.map((layout) => (
        <LayoutCard
          key={layout.id}
          layout={layout}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default LayoutPicker;
