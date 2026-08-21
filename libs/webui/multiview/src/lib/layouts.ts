import { MultiviewLayout } from './types';

// The six MediaPackage MultiView beta layouts. Code = tile count + arrangement letter(s):
// E = equal, P = larger primary, and the trailing letter qualifies (H = horizontal, L = primary
// on the left). Valid LAYOUT values per the onboarding guide: 2EH, 3EL, 4E, 2PL, 3PL, 4PL.
// Geometries are relative (0..1) and mirror the guide's layout diagrams (V1 is the first source).
//
// Order is "featured first": the primary layouts (3PL, 2PL, 4PL) lead, then the equal grids
// (3EL, 2EH, 4E). At phone widths an equal tile is unwatchably small, so the featured variant is
// the better default (see DEFAULT_LAYOUT_ID and the feed-count grouping below).
export const LAYOUTS: MultiviewLayout[] = [
  {
    id: '3PL',
    label: 'Primary + 2',
    tileCount: 3,
    featured: true,
    tiles: [
      { x: 0, y: 0, width: 0.66, height: 1 },
      { x: 0.66, y: 0, width: 0.34, height: 0.5 },
      { x: 0.66, y: 0.5, width: 0.34, height: 0.5 },
    ],
  },
  {
    id: '2PL',
    label: 'Primary + 1',
    tileCount: 2,
    featured: true,
    tiles: [
      { x: 0, y: 0, width: 0.66, height: 1 },
      { x: 0.66, y: 0, width: 0.34, height: 1 },
    ],
  },
  {
    id: '4PL',
    label: 'Primary + 3',
    tileCount: 4,
    featured: true,
    tiles: [
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 1 / 3 },
      { x: 0.6, y: 1 / 3, width: 0.4, height: 1 / 3 },
      { x: 0.6, y: 2 / 3, width: 0.4, height: 1 / 3 },
    ],
  },
  {
    id: '3EL',
    label: 'Left feature',
    tileCount: 3,
    featured: false,
    tiles: [
      { x: 0, y: 0, width: 0.62, height: 1 },
      { x: 0.62, y: 0, width: 0.38, height: 0.5 },
      { x: 0.62, y: 0.5, width: 0.38, height: 0.5 },
    ],
  },
  {
    id: '2EH',
    label: 'Side by side',
    tileCount: 2,
    featured: false,
    tiles: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  {
    id: '4E',
    label: 'Grid',
    tileCount: 4,
    featured: false,
    tiles: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
];

// Phones default to the featured 3-up (3PL), not an equal grid: at ~390px wide an equal tile is
// ~90px, unwatchable. Desktop opens on the same featured composition.
export const DEFAULT_LAYOUT_ID = '3PL';

export const findLayout = (id: string): MultiviewLayout =>
  LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0];

export interface LayoutGroup {
  tileCount: number;
  label: string;
  note?: string;
  layouts: MultiviewLayout[];
}

// Mobile groups the picker by feed count (3 / 2 / 4), featured layout first within each group. The
// four-feed group is flagged because its tiles are the smallest on a phone.
export const LAYOUT_GROUPS: LayoutGroup[] = [3, 2, 4].map((tileCount) => ({
  tileCount,
  label: `${tileCount} feeds`,
  note: tileCount === 4 ? 'small tiles on phone' : undefined,
  layouts: LAYOUTS.filter((layout) => layout.tileCount === tileCount).sort(
    (a, b) => Number(b.featured) - Number(a.featured)
  ),
}));

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

const equalLayoutFor = (tileCount: number): string => {
  switch (tileCount) {
    case 2:
      return '2EH';
    case 3:
      return '3EL';
    case 4:
      return '4E';
    default:
      return DEFAULT_LAYOUT_ID;
  }
};

// The layout of the same family (featured or equal) for a given tile count. Used to drop to the next
// smaller layout when a tile is removed while keeping the featured/equal character intact.
export const layoutFor = (tileCount: number, featured: boolean): string =>
  featured ? primaryLayoutFor(tileCount) : equalLayoutFor(tileCount);
