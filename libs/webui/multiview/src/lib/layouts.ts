import { MultiviewLayout } from './types';

// The six MediaPackage MultiView beta layouts. Code = tile count + arrangement letter(s):
// E = equal, P = larger primary, and the trailing letter qualifies (H = horizontal, L = primary
// on the left). Valid LAYOUT values per the onboarding guide: 2EH, 3EL, 4E, 2PL, 3PL, 4PL.
// Geometries are relative (0..1) and mirror the guide's layout diagrams (V1 is the first source).
export const LAYOUTS: MultiviewLayout[] = [
  {
    id: '2EH',
    label: 'Side by side',
    tileCount: 2,
    tiles: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  {
    id: '3EL',
    label: 'Left feature',
    tileCount: 3,
    tiles: [
      { x: 0, y: 0, width: 0.62, height: 1 },
      { x: 0.62, y: 0, width: 0.38, height: 0.5 },
      { x: 0.62, y: 0.5, width: 0.38, height: 0.5 },
    ],
  },
  {
    id: '4E',
    label: 'Grid',
    tileCount: 4,
    tiles: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: '2PL',
    label: 'Primary + 1',
    tileCount: 2,
    tiles: [
      { x: 0, y: 0, width: 0.66, height: 1 },
      { x: 0.66, y: 0, width: 0.34, height: 1 },
    ],
  },
  {
    id: '3PL',
    label: 'Primary + 2',
    tileCount: 3,
    tiles: [
      { x: 0, y: 0, width: 0.66, height: 1 },
      { x: 0.66, y: 0, width: 0.34, height: 0.5 },
      { x: 0.66, y: 0.5, width: 0.34, height: 0.5 },
    ],
  },
  {
    id: '4PL',
    label: 'Primary + 3',
    tileCount: 4,
    tiles: [
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 1 / 3 },
      { x: 0.6, y: 1 / 3, width: 0.4, height: 1 / 3 },
      { x: 0.6, y: 2 / 3, width: 0.4, height: 1 / 3 },
    ],
  },
];

export const DEFAULT_LAYOUT_ID = '3EL';

export const findLayout = (id: string): MultiviewLayout =>
  LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0];

// The primary-view layout (one large tile + secondaries) for a given tile count, used when a viewer
// focuses a tile to make it the featured/large view.
export const primaryLayoutFor = (tileCount: number): string => {
  switch (tileCount) {
    case 2:
      return '2PL';
    case 3:
      return '3PL';
    case 4:
      return '4PL';
    default:
      return DEFAULT_LAYOUT_ID;
  }
};
