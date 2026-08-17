import { useMemo, useState } from 'react';
import { CopyText, PageTitle, Panel } from '@trackflix-live/ui';
import { LayoutPicker } from './layout-picker';
import { SourceFeedGrid } from './source-feed-grid';
import { MultiviewCanvas } from './multiview-canvas';
import { MultiviewPlayer } from './multiview-player';
import { buildMultiviewManifestUrl } from './manifest-url';
import { DEFAULT_LAYOUT_ID, findLayout } from './layouts';
import { SOURCES, findSource } from './sources';
import { SourceId } from './types';

const buildTiles = (
  previous: (SourceId | null)[],
  tileCount: number
): (SourceId | null)[] =>
  Array.from({ length: tileCount }, (_, index) => previous[index] ?? null);

// Resize to the layout's tile count, then fill any empty tiles with feeds that are not yet
// assigned. This keeps the composition complete (and the manifest URL visible) when switching to a
// layout with more tiles than the current selection.
const resizeAndFill = (
  previous: (SourceId | null)[],
  tileCount: number
): (SourceId | null)[] => {
  const resized = buildTiles(previous, tileCount);
  const used = new Set(
    resized.filter((tile): tile is SourceId => tile !== null)
  );
  const available = SOURCES.map((source) => source.id).filter(
    (id) => !used.has(id)
  );
  let next = 0;
  return resized.map((tile) =>
    tile !== null ? tile : available[next++] ?? null
  );
};

const initialTiles = (tileCount: number): (SourceId | null)[] =>
  buildTiles(
    SOURCES.map((source) => source.id),
    tileCount
  );

export function MultiviewView() {
  const [selectedLayoutId, setSelectedLayoutId] = useState(DEFAULT_LAYOUT_ID);
  const [tiles, setTiles] = useState<(SourceId | null)[]>(() =>
    initialTiles(findLayout(DEFAULT_LAYOUT_ID).tileCount)
  );

  const layout = findLayout(selectedLayoutId);

  const egressDomain = import.meta.env.VITE_MULTIVIEW_EGRESS_DOMAIN ?? '';
  const channelGroup = import.meta.env.VITE_MULTIVIEW_CHANNEL_GROUP ?? '';
  const endpointName = import.meta.env.VITE_MULTIVIEW_ENDPOINT_NAME ?? '';
  const previewStreamUrl = import.meta.env.VITE_MULTIVIEW_MANIFEST_URL ?? '';
  const hasRealEndpoint = Boolean(egressDomain && channelGroup && endpointName);

  const selectLayout = (id: string) => {
    setSelectedLayoutId(id);
    setTiles((previous) => resizeAndFill(previous, findLayout(id).tileCount));
  };

  const toggleSource = (id: SourceId) => {
    setTiles((previous) => {
      const assignedIndex = previous.indexOf(id);
      if (assignedIndex >= 0) {
        return previous.map((tile, index) =>
          index === assignedIndex ? null : tile
        );
      }
      const freeIndex = previous.indexOf(null);
      if (freeIndex < 0) {
        return previous;
      }
      return previous.map((tile, index) => (index === freeIndex ? id : tile));
    });
  };

  // A multiview is only composable when every tile of the layout is filled (MediaPackage needs
  // exactly N sources for an N-tile layout) and a real beta endpoint is configured.
  const composedUrl = useMemo(() => {
    if (!egressDomain || !channelGroup || !endpointName) {
      return '';
    }
    if (!tiles.every((tile) => tile !== null)) {
      return '';
    }
    const channels = tiles.map(
      (id) => findSource(id as string)?.channelRef ?? ''
    );
    if (channels.some((channel) => !channel)) {
      return '';
    }
    return buildMultiviewManifestUrl(
      { egressDomain, channelGroup, endpointName },
      selectedLayoutId,
      channels
    );
  }, [egressDomain, channelGroup, endpointName, selectedLayoutId, tiles]);

  const tileSources = tiles.map((id) => (id ? findSource(id) ?? null : null));

  return (
    <div className="flex justify-center w-full h-full p-4 lg:p-8 relative">
      <div className="w-full container flex flex-col gap-5 lg:gap-8">
        <div>
          <PageTitle title="MultiView" />
          <p className="text-sm lg:text-base text-base-content/60">
            Viewers select their feeds. MediaPackage assembles the multiview on
            demand: one standard stream, one decoder, any device, codec
            agnostic, no re-encoding.
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-5 lg:gap-8">
          <div className="w-full lg:w-96 lg:shrink-0 flex flex-col gap-8">
            <Panel>
              <h2 className="font-bold mb-1">Source feeds</h2>
              <p className="text-sm text-base-content/60 mb-4">
                Encode once on MediaLive. Select {layout.tileCount} feeds.
              </p>
              <SourceFeedGrid
                sources={SOURCES}
                tiles={tiles}
                onToggle={toggleSource}
              />
            </Panel>

            <Panel>
              <h2 className="font-bold mb-4">Layout</h2>
              <LayoutPicker
                selected={selectedLayoutId}
                onSelect={selectLayout}
              />
            </Panel>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <Panel className="!p-4">
              <div className="flex items-baseline justify-between mb-4 px-4 pt-2">
                <h2 className="font-bold">Live MultiView output</h2>
                <span className="text-xs text-base-content/40">
                  {hasRealEndpoint ? 'MediaPackage V2' : 'Client-side preview'}
                </span>
              </div>
              {hasRealEndpoint ? (
                <MultiviewPlayer src={composedUrl} />
              ) : (
                <MultiviewCanvas
                  layout={layout}
                  tiles={tileSources}
                  streamUrl={previewStreamUrl}
                />
              )}
              {!hasRealEndpoint && (
                <p className="text-xs text-base-content/40 px-4 pt-3">
                  In production, MediaPackage returns a single server-composited
                  stream rendered by one player. This preview composes the tiles
                  client-side until the multiview endpoint is configured.
                </p>
              )}
            </Panel>
            {composedUrl ? (
              <CopyText text={composedUrl} className="w-full" />
            ) : hasRealEndpoint ? (
              <p className="text-xs text-base-content/50 px-1">
                Assign a feed to every tile to compose the multiview manifest.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiviewView;
