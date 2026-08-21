import { LayoutPicker } from './layout-picker';
import { SourceFeedGrid } from './source-feed-grid';
import { MultiviewCanvas } from './multiview-canvas';
import { MultiviewPlayer } from './multiview-player';
import { TileControls } from './tile-controls';
import { ManifestRow } from './manifest-row';
import { SOURCES } from './sources';
import { MultiviewModel } from './use-multiview';

function DesktopPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-base-100 rounded-2xl border border-base-content/10 p-5 ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  );
}

// Desktop composition of the MultiView demo (design screen 2a). Two columns: a fixed left rail with
// the source and layout pickers, and a fluid right column with the live output, tile chips and the
// manifest row. The red CTA lives in the public page navbar, not here.
export function MultiviewDesktop(vm: MultiviewModel) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-[30px] font-semibold tracking-[-0.02em] leading-tight">
          AWS Elemental Dynamic MultiView
        </h1>
        <p className="max-w-[820px] text-[15px] leading-relaxed text-base-content/60">
          Watch multiple live feeds at once in a single stream.
        </p>
      </div>

      <div className="flex gap-8 items-start">
        <div className="w-[380px] shrink-0 flex flex-col gap-6">
          <DesktopPanel>
            <h2 className="text-[15px] font-semibold mb-1">Source feeds</h2>
            <p className="text-[12.5px] text-base-content/50 mb-4">
              Select {vm.layout.tileCount} feeds.
            </p>
            <SourceFeedGrid
              sources={SOURCES}
              tiles={vm.tiles}
              onToggle={vm.toggleSource}
              endpoint={vm.endpoint}
            />
          </DesktopPanel>

          <DesktopPanel>
            <h2 className="text-[15px] font-semibold mb-4">Layout</h2>
            <LayoutPicker
              selected={vm.selectedLayoutId}
              onSelect={vm.selectLayout}
            />
          </DesktopPanel>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3.5">
          <DesktopPanel className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">
                Live MultiView output
              </h2>
              {vm.hasRealEndpoint ? (
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-error/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                  <span className="text-[10px] font-bold tracking-[.11em] text-error">
                    LIVE
                  </span>
                </span>
              ) : (
                <span className="text-xs text-base-content/40">
                  Client-side preview
                </span>
              )}
            </div>

            {vm.hasRealEndpoint ? (
              <MultiviewPlayer
                src={vm.playerSrc}
                isSolo={Boolean(vm.soloSource)}
                soloLabel={vm.soloSource?.label}
                onExitSolo={vm.exitSolo}
                showLive={false}
              />
            ) : (
              <MultiviewCanvas
                layout={vm.layout}
                tiles={vm.tileSources}
                streamUrl={vm.previewStreamUrl}
                onFocusTile={vm.focusTile}
                onSoloTile={vm.soloTile}
              />
            )}

            {vm.hasRealEndpoint && !vm.soloSource && vm.composedUrl && (
              <TileControls
                tiles={vm.tileSources}
                onFocus={vm.focusTile}
                onSolo={vm.soloTile}
              />
            )}

            {!vm.hasRealEndpoint && (
              <p className="text-xs text-base-content/40">
                In production, MediaPackage returns a single server-composited
                stream rendered by one player. This preview composes the tiles
                client-side until the MultiView endpoint is configured.
              </p>
            )}
          </DesktopPanel>

          {vm.composedUrl ? (
            <ManifestRow url={vm.composedUrl} />
          ) : vm.hasRealEndpoint ? (
            <p className="text-xs text-base-content/50 px-1">
              Assign a feed to every tile to compose the MultiView manifest.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default MultiviewDesktop;
