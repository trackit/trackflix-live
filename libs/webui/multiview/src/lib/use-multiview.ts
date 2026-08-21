import { useMemo, useState } from 'react';
import {
  MultiviewEndpointConfig,
  buildMultiviewManifestUrl,
  buildSingleViewManifestUrl,
} from './manifest-url';
import { DEFAULT_LAYOUT_ID, findLayout, layoutFor } from './layouts';
import { SOURCES, findSource } from './sources';
import { MultiviewSource, SheetTab, SourceId } from './types';

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

// Move the tile at `index` to position 0 (the primary/large view, which must also be the URL path
// channel), keeping the other tiles in order.
const promoteToPrimary = (
  tiles: (SourceId | null)[],
  index: number
): (SourceId | null)[] => {
  const target = tiles[index];
  if (target == null) {
    return tiles;
  }
  return [target, ...tiles.filter((_, position) => position !== index)];
};

export interface MultiviewModel {
  layout: ReturnType<typeof findLayout>;
  selectedLayoutId: string;
  tiles: (SourceId | null)[];
  tileSources: (MultiviewSource | null)[];
  soloSource: MultiviewSource | undefined;
  playerSrc: string;
  composedUrl: string;
  hasRealEndpoint: boolean;
  endpoint?: MultiviewEndpointConfig;
  previewStreamUrl: string;
  isFull: boolean;
  sheetTab: SheetTab;
  activeTile: number | null;
  swapTileIndex: number | null;
  showDevRow: boolean;
  selectLayout: (id: string) => void;
  focusTile: (index: number) => void;
  soloTile: (index: number) => void;
  selectSolo: (id: SourceId) => void;
  exitSolo: () => void;
  toggleSource: (id: SourceId) => void;
  removeTile: (index: number) => void;
  openTileActions: (index: number) => void;
  closeTileActions: () => void;
  startSwap: (index: number) => void;
  cancelSwap: () => void;
  setSheetTab: (tab: SheetTab) => void;
  toggleDevRow: () => void;
  trackCta: (placement: string) => void;
}

export const CONTACT_URL =
  'https://trackit.io/contact?utm_source=trackflix-demo&utm_medium=qr&utm_campaign=ibc-multiview';

export function useMultiview(): MultiviewModel {
  const [selectedLayoutId, setSelectedLayoutId] = useState(DEFAULT_LAYOUT_ID);
  const [tiles, setTiles] = useState<(SourceId | null)[]>(() =>
    initialTiles(findLayout(DEFAULT_LAYOUT_ID).tileCount)
  );
  const [soloSource, setSoloSource] = useState<SourceId | null>(null);
  const [sheetTab, setSheetTab] = useState<SheetTab>('feeds');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [swapTileIndex, setSwapTileIndex] = useState<number | null>(null);
  const [showDevRow, setShowDevRow] = useState(false);

  const layout = findLayout(selectedLayoutId);

  const egressDomain = import.meta.env.VITE_MULTIVIEW_EGRESS_DOMAIN ?? '';
  const channelGroup = import.meta.env.VITE_MULTIVIEW_CHANNEL_GROUP ?? '';
  const endpointName = import.meta.env.VITE_MULTIVIEW_ENDPOINT_NAME ?? '';
  const previewStreamUrl = import.meta.env.VITE_MULTIVIEW_MANIFEST_URL ?? '';
  const hasRealEndpoint = Boolean(egressDomain && channelGroup && endpointName);
  const endpoint = hasRealEndpoint
    ? { egressDomain, channelGroup, endpointName }
    : undefined;

  const selectLayout = (id: string) => {
    setSelectedLayoutId(id);
    setTiles((previous) => resizeAndFill(previous, findLayout(id).tileCount));
  };

  // Move a feed to the primary position (V1) while keeping the current layout. In a primary layout
  // (2PL/3PL/4PL) V1 is the large tile; in an equal layout it is the first position. The layout only
  // changes when the viewer picks one, never as a side effect of featuring a feed.
  const focusTile = (index: number) => {
    setTiles((previous) => promoteToPrimary(previous, index));
    setActiveTile(null);
  };

  const soloTile = (index: number) => {
    const id = tiles[index];
    if (id) {
      setSoloSource(id);
      setActiveTile(null);
    }
  };

  const selectSolo = (id: SourceId) => setSoloSource(id);

  const exitSolo = () => setSoloSource(null);

  // Assign a feed to the first free tile, or unassign it if already placed. When a swap is in
  // progress (the viewer chose "replace with another feed"), drop the picked feed into that tile
  // instead, swapping positions if it was already on screen.
  const toggleSource = (id: SourceId) => {
    if (swapTileIndex !== null) {
      const target = swapTileIndex;
      setTiles((previous) => {
        const outgoing = previous[target];
        const elsewhere = previous.indexOf(id);
        return previous.map((tile, index) => {
          if (index === target) {
            return id;
          }
          if (index === elsewhere) {
            return outgoing;
          }
          return tile;
        });
      });
      setSwapTileIndex(null);
      return;
    }
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

  // Remove a tile and fall back to the next smaller layout of the same family (featured or equal).
  // Two feeds is the smallest valid composition, so a two-tile layout ignores the request.
  const removeTile = (index: number) => {
    const nextCount = layout.tileCount - 1;
    if (nextCount < 2) {
      setActiveTile(null);
      return;
    }
    const remaining = tiles.filter((_, position) => position !== index);
    setSelectedLayoutId(layoutFor(nextCount, layout.featured));
    setTiles(resizeAndFill(remaining, nextCount));
    setActiveTile(null);
  };

  const openTileActions = (index: number) => {
    if (tiles[index]) {
      setActiveTile(index);
    }
  };
  const closeTileActions = () => setActiveTile(null);

  const startSwap = (index: number) => {
    setSwapTileIndex(index);
    setActiveTile(null);
    setSheetTab('feeds');
  };

  const cancelSwap = () => setSwapTileIndex(null);

  const toggleDevRow = () => setShowDevRow((value) => !value);

  const trackCta = (placement: string) =>
    window.gtag?.('event', 'connect_with_trackit', { placement });

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

  const soloSourceRef = soloSource ? findSource(soloSource) : undefined;
  const playerSrc =
    soloSourceRef && endpoint
      ? buildSingleViewManifestUrl(endpoint, soloSourceRef.channelRef)
      : composedUrl;

  return {
    layout,
    selectedLayoutId,
    tiles,
    tileSources,
    soloSource: soloSourceRef,
    playerSrc,
    composedUrl,
    hasRealEndpoint,
    endpoint,
    previewStreamUrl,
    isFull: !tiles.includes(null),
    sheetTab,
    activeTile,
    swapTileIndex,
    showDevRow,
    selectLayout,
    focusTile,
    soloTile,
    selectSolo,
    exitSolo,
    toggleSource,
    removeTile,
    openTileActions,
    closeTileActions,
    startSwap,
    cancelSwap,
    setSheetTab,
    toggleDevRow,
    trackCta,
  };
}
