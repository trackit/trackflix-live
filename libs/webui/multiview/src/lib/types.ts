export type SourceId = string;

export type LayoutId = string;

export interface MultiviewSource {
  id: SourceId;
  label: string;
  channelRef: string;
  thumbnail: string;
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
