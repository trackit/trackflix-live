import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TrackitSymbol } from '@trackflix-live/ui';
import { CompositionStrip } from './composition-strip';
import { LayoutPicker } from './layout-picker';
import { SourceFeedGrid } from './source-feed-grid';
import { MultiviewPlayer } from './multiview-player';
import { MultiviewCanvas } from './multiview-canvas';
import { TileActionSheet } from './tile-action-sheet';
import { ManifestRow } from './manifest-row';
import { LivePreview } from './live-preview';
import { buildSingleViewManifestUrl } from './manifest-url';
import { SOURCES } from './sources';
import { CONTACT_URL, MultiviewModel } from './use-multiview';

// Lock the page scroll while a full-screen overlay (solo / immersive) is mounted. On iOS this also
// stops the Safari toolbars from retracting on scroll, which would otherwise resize the fixed player.
function useLockBodyScroll() {
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, []);
}

function CtaCard({ onTrack }: { onTrack: () => void }) {
  return (
    <a
      href={CONTACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTrack}
      className="flex items-center gap-3 mx-3.5 mb-3 mt-2 px-3.5 py-3 rounded-2xl bg-trackit-red/10 border border-trackit-red/40 hover:bg-trackit-red/20 transition-colors"
    >
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-trackit-red text-white shrink-0">
        <TrackitSymbol className="w-6" />
      </span>
      <span className="flex-1 flex flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold">
          Connect with TrackIt
        </span>
        <span className="text-[11.5px] text-base-content/55">
          Bring MultiView to your platform
        </span>
      </span>
      <ChevronRight className="w-5 h-5 text-base-content/40" />
    </a>
  );
}

function DevRow({ vm }: { vm: MultiviewModel }) {
  return (
    <div className="border-t border-base-content/10 mt-1">
      <button
        type="button"
        onClick={vm.toggleDevRow}
        aria-expanded={vm.showDevRow}
        className="flex items-center justify-between w-full h-11 px-4 text-[13px] font-medium text-base-content/70"
      >
        Manifest
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            vm.showDevRow ? 'rotate-180' : ''
          }`}
        />
      </button>
      {vm.showDevRow && (
        <div className="px-4 pb-4">
          {vm.composedUrl ? (
            <ManifestRow url={vm.composedUrl} />
          ) : (
            <p className="text-xs text-base-content/50">
              Assign a feed to every tile to compose the manifest.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ControlsSheet({ vm }: { vm: MultiviewModel }) {
  const swapping = vm.swapTileIndex !== null;
  return (
    <div className="flex-1 flex flex-col bg-base-100 rounded-t-[20px] border-t border-base-content/10">
      <div className="flex gap-1 mx-3.5 mt-2.5 p-[3px] rounded-[11px] bg-base-content/5">
        {(['feeds', 'layout'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => vm.setSheetTab(tab)}
            className={`flex-1 h-10 grid place-items-center rounded-[9px] text-[14px] font-semibold capitalize transition-colors ${
              vm.sheetTab === tab
                ? 'bg-primary text-primary-content'
                : 'text-base-content/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-3.5">
        {vm.sheetTab === 'feeds' ? (
          <>
            {swapping && (
              <p className="mb-3 px-3 py-2 rounded-lg bg-primary/10 text-[12px] text-primary">
                Pick a feed to place in tile {(vm.swapTileIndex ?? 0) + 1}.
              </p>
            )}
            <SourceFeedGrid
              sources={SOURCES}
              tiles={vm.tiles}
              onToggle={vm.toggleSource}
              endpoint={vm.endpoint}
              variant="mobile"
              swapMode={swapping}
            />
          </>
        ) : (
          <LayoutPicker
            selected={vm.selectedLayoutId}
            onSelect={vm.selectLayout}
            variant="mobile"
          />
        )}
      </div>

      {vm.sheetTab === 'feeds' && (
        <CtaCard onTrack={() => vm.trackCta('multiview_sheet_card')} />
      )}
      <DevRow vm={vm} />
    </div>
  );
}

function PortraitWatch({ vm }: { vm: MultiviewModel }) {
  return (
    <div className="flex flex-col flex-1 min-h-full">
      <div className="sticky top-0 z-30 bg-black">
        {vm.hasRealEndpoint ? (
          <MultiviewPlayer src={vm.playerSrc} showLive />
        ) : (
          <MultiviewCanvas
            layout={vm.layout}
            tiles={vm.tileSources}
            streamUrl={vm.previewStreamUrl}
            onFocusTile={vm.focusTile}
            onSoloTile={vm.soloTile}
          />
        )}
      </div>

      <div className="px-4 pt-3 pb-0.5">
        <h1 className="text-[17px] font-semibold tracking-[-0.015em] leading-tight">
          AWS Elemental Dynamic MultiView
        </h1>
        <p className="text-[12.5px] text-base-content/55 mt-1">
          Watch multiple live feeds at once in a single stream.
        </p>
      </div>

      {vm.composedUrl && (
        <div className="py-2.5">
          <CompositionStrip
            tiles={vm.tileSources}
            onOpenTile={vm.openTileActions}
          />
        </div>
      )}

      <ControlsSheet vm={vm} />
    </div>
  );
}

function SoloView({ vm }: { vm: MultiviewModel }) {
  const isLandscape = useMediaQuery('(orientation: landscape)');
  useLockBodyScroll();
  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden">
      {/* Landscape: the player fills the space above the rail (flexbox, so it adapts to the real
          visible height even when the browser toolbars shrink it). Portrait: a full-width 16:9 player
          sits at the top with the feed grid below. */}
      <div
        className={
          isLandscape
            ? 'flex-1 min-h-0 flex items-center justify-center p-2'
            : 'shrink-0 p-2'
        }
      >
        <MultiviewPlayer
          src={vm.playerSrc}
          isSolo
          immersive
          fill={isLandscape}
          soloLabel={vm.soloSource?.label}
          onExitSolo={vm.exitSolo}
        />
      </div>
      <div className="portrait:flex-1 portrait:min-h-0 overflow-y-auto p-4 landscape:p-2 flex flex-col gap-3 landscape:gap-2">
        <span className="text-[13px] landscape:text-[11px] font-semibold text-white/80">
          Switch feed
        </span>
        {/* Portrait fills the tall space below the player with a 2-column grid; landscape keeps a
            compact horizontal rail since vertical room is scarce. */}
        <div
          className="grid grid-cols-2 gap-3 landscape:flex landscape:overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {SOURCES.map((source) => {
            const active = vm.soloSource?.id === source.id;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => vm.selectSolo(source.id)}
                className={`w-full landscape:w-[104px] landscape:shrink-0 rounded-xl overflow-hidden border-2 ${
                  active ? 'border-primary' : 'border-white/10'
                }`}
              >
                {vm.endpoint ? (
                  <LivePreview
                    src={buildSingleViewManifestUrl(
                      vm.endpoint,
                      source.channelRef
                    )}
                    className="block w-full aspect-video landscape:aspect-auto landscape:h-[46px] object-cover bg-black"
                  />
                ) : (
                  <span
                    className="block w-full aspect-video landscape:aspect-auto landscape:h-[46px]"
                    style={{ backgroundColor: source.color }}
                  />
                )}
                <span
                  className={`block px-2 py-1.5 landscape:py-1 text-left text-[12px] landscape:text-[11px] font-semibold ${
                    active
                      ? 'bg-primary/20 text-white'
                      : 'bg-white/5 text-white/80'
                  }`}
                >
                  {source.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ImmersiveLandscape({ vm }: { vm: MultiviewModel }) {
  const [chromeVisible, setChromeVisible] = useState(true);
  useLockBodyScroll();

  useEffect(() => {
    if (!chromeVisible) {
      return;
    }
    const timer = setTimeout(() => setChromeVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [chromeVisible]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black"
      onClick={() => setChromeVisible(true)}
    >
      <MultiviewPlayer
        src={vm.playerSrc}
        fill
        showLive={false}
        showFullscreen={false}
      />

      {chromeVisible && (
        <>
          <div className="absolute top-0 inset-x-0 flex items-center gap-2 p-3 bg-gradient-to-b from-black/70 to-transparent pl-[75px] pointer-events-none">
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-black/55">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              <span className="text-[10px] font-bold tracking-[.11em] text-white">
                LIVE
              </span>
            </span>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent pl-[75px] pointer-events-none [&_button]:pointer-events-auto">
            <CompositionStrip
              tiles={vm.tileSources}
              onOpenTile={vm.openTileActions}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Feed picker used to replace a tile while the immersive landscape view is up. Portrait handles a
// swap inline in the Feeds tab, but the immersive view has no controls sheet, so a swap started
// there needs its own bottom sheet to pick the replacement feed.
function SwapPickerSheet({
  tileIndex,
  tiles,
  endpoint,
  onPick,
  onCancel,
}: {
  tileIndex: number;
  tiles: MultiviewModel['tiles'];
  endpoint: MultiviewModel['endpoint'];
  onPick: MultiviewModel['toggleSource'];
  onCancel: () => void;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className={`absolute inset-0 bg-[rgba(3,6,14,.62)] transition-opacity duration-200 ${
          shown ? 'opacity-100' : 'opacity-0'
        } motion-reduce:transition-none`}
      />
      <div
        role="dialog"
        aria-label={`Replace tile ${tileIndex + 1}`}
        className={`relative bg-base-100 rounded-t-[22px] max-h-[90dvh] flex flex-col transition-transform duration-200 ease-out ${
          shown ? 'translate-y-0' : 'translate-y-full'
        } motion-reduce:transition-none`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
          <span className="text-[15px] font-semibold">
            Replace tile {tileIndex + 1}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-lg bg-base-200 text-[13px] font-semibold hover:bg-base-300 transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)] overflow-y-auto min-h-0">
          <SourceFeedGrid
            sources={SOURCES}
            tiles={tiles}
            onToggle={onPick}
            endpoint={endpoint}
            variant="mobile"
            swapMode
          />
        </div>
      </div>
    </div>
  );
}

// Mobile-first composition of the MultiView demo (design screens A–E). One live player owns the
// video; the surrounding chrome switches between the portrait watch view, the immersive landscape
// view, the solo (watch-alone) view and the tile action sheet.
export function MultiviewMobile(vm: MultiviewModel) {
  const isLandscape = useMediaQuery('(orientation: landscape)');
  // Immersive is purely orientation-driven: landscape enters it, rotating back to portrait leaves it
  // (there is no on-screen exit, since the view cannot force the device orientation).
  const immersive =
    isLandscape && vm.hasRealEndpoint && Boolean(vm.composedUrl);

  const activeSource =
    vm.activeTile !== null ? vm.tileSources[vm.activeTile] : null;

  if (vm.hasRealEndpoint && vm.soloSource) {
    return <SoloView vm={vm} />;
  }

  return (
    <>
      {immersive ? <ImmersiveLandscape vm={vm} /> : <PortraitWatch vm={vm} />}

      {vm.activeTile !== null && activeSource && (
        <TileActionSheet
          source={activeSource}
          tileIndex={vm.activeTile}
          tileCount={vm.layout.tileCount}
          isPrimary={vm.activeTile === 0}
          canRemove={vm.layout.tileCount > 2}
          previewUrl={
            vm.endpoint
              ? buildSingleViewManifestUrl(vm.endpoint, activeSource.channelRef)
              : undefined
          }
          previewColor={activeSource.color}
          onMakePrimary={() => vm.focusTile(vm.activeTile as number)}
          onWatchAlone={() => vm.soloTile(vm.activeTile as number)}
          onReplace={() => vm.startSwap(vm.activeTile as number)}
          onRemove={() => vm.removeTile(vm.activeTile as number)}
          onClose={vm.closeTileActions}
        />
      )}

      {immersive && vm.swapTileIndex !== null && (
        <SwapPickerSheet
          tileIndex={vm.swapTileIndex}
          tiles={vm.tiles}
          endpoint={vm.endpoint}
          onPick={vm.toggleSource}
          onCancel={vm.cancelSwap}
        />
      )}
    </>
  );
}

export default MultiviewMobile;
