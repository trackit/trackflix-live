import { useEffect, useState } from 'react';
import { ArrowLeftRight, Maximize2, MinusCircle, Star } from 'lucide-react';
import { LivePreview } from './live-preview';
import { MultiviewSource } from './types';

interface TileActionSheetProps {
  source: MultiviewSource;
  tileIndex: number;
  tileCount: number;
  isPrimary: boolean;
  canRemove: boolean;
  // Live single-view manifest for the tile's feed; falls back to the flat colour when absent.
  previewUrl?: string;
  previewColor: string;
  onMakePrimary: () => void;
  onWatchAlone: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function ActionRow({
  icon,
  label,
  sub,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 w-full min-h-[58px] px-[18px] text-left hover:bg-base-content/5 transition-colors"
    >
      <span
        className={`grid place-items-center w-[26px] shrink-0 ${
          danger ? 'text-error' : 'text-primary'
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span
          className={`text-[16px] font-semibold leading-tight ${
            danger ? 'text-error' : ''
          }`}
        >
          {label}
        </span>
        {sub && <span className="text-[12px] text-base-content/55">{sub}</span>}
      </span>
    </button>
  );
}

// The mobile tile menu (design screen C). Opened from a composition-strip chip; replaces the tiny
// on-tile icon buttons with full-width, thumb-friendly rows.
export function TileActionSheet({
  source,
  tileIndex,
  tileCount,
  isPrimary,
  canRemove,
  previewUrl,
  previewColor,
  onMakePrimary,
  onWatchAlone,
  onReplace,
  onRemove,
  onClose,
}: TileActionSheetProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 bg-[rgba(3,6,14,.62)] transition-opacity duration-200 ${
          shown ? 'opacity-100' : 'opacity-0'
        } motion-reduce:transition-none`}
      />
      <div
        role="dialog"
        aria-label={`${source.label} tile actions`}
        className={`relative bg-base-100 rounded-t-[22px] max-h-[90dvh] flex flex-col transition-transform duration-200 ease-out ${
          shown ? 'translate-y-0' : 'translate-y-full'
        } motion-reduce:transition-none`}
      >
        <div className="flex items-center gap-3 px-[18px] pt-4 pb-3 shrink-0">
          {previewUrl ? (
            <LivePreview
              src={previewUrl}
              className="w-[74px] h-[42px] rounded-lg shrink-0 object-cover bg-black"
            />
          ) : (
            <span
              className="w-[74px] h-[42px] rounded-lg shrink-0 bg-black overflow-hidden"
              style={{ backgroundColor: previewColor }}
            />
          )}
          <span className="flex flex-col">
            <span className="text-[17px] font-semibold leading-tight">
              {source.label}
            </span>
            <span className="text-[12.5px] text-base-content/55">
              Tile {tileIndex + 1} of {tileCount}
            </span>
          </span>
        </div>

        <div className="border-t border-base-content/10 overflow-y-auto min-h-0">
          {!isPrimary && (
            <ActionRow
              icon={<Star className="w-[22px] h-[22px]" />}
              label="Make primary"
              onClick={onMakePrimary}
            />
          )}
          <ActionRow
            icon={<Maximize2 className="w-[22px] h-[22px]" />}
            label="Watch alone"
            sub="Single feed, full screen"
            onClick={onWatchAlone}
          />
          <ActionRow
            icon={<ArrowLeftRight className="w-[22px] h-[22px]" />}
            label="Replace with another feed"
            onClick={onReplace}
          />
          {canRemove && (
            <ActionRow
              icon={<MinusCircle className="w-[22px] h-[22px]" />}
              label="Remove from mosaic"
              danger
              onClick={onRemove}
            />
          )}
        </div>

        <div className="px-[18px] pt-3 pb-[max(env(safe-area-inset-bottom),16px)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[52px] rounded-xl bg-base-200 text-[15px] font-semibold hover:bg-base-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TileActionSheet;
