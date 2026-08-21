export type SourceId = string;

export type LayoutId = string;

export interface MultiviewSource {
  id: SourceId;
  label: string;
  channelRef: string;
  // Fallback tile colour used when no live preview is available (no real endpoint configured).
  color: string;
}

export interface LayoutTile {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MultiviewLayout {
  id: LayoutId;
  label: string;
  tileCount: number;
  // A featured layout has one large primary tile (2PL/3PL/4PL); an equal layout tiles evenly
  // (2EH/4E) or with a smaller feature (3EL). Drives the "featured first" ordering and grouping.
  featured: boolean;
  tiles: LayoutTile[];
}

export type SheetTab = 'feeds' | 'layout';
