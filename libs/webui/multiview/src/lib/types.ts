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
  tiles: LayoutTile[];
}
