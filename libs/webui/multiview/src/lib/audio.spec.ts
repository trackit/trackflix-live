import { audioTrackIndexForTile } from './audio';

describe('audioTrackIndexForTile', () => {
  const tracks = [
    { name: 'View1_eng' },
    { name: 'View2_und' },
    { name: 'View3_und_2' },
  ];

  it('maps a tile index to its View{n} audio track', () => {
    expect(audioTrackIndexForTile(tracks, 0)).toBe(0);
    expect(audioTrackIndexForTile(tracks, 1)).toBe(1);
    expect(audioTrackIndexForTile(tracks, 2)).toBe(2);
  });

  it('does not confuse View1 with View10-style names', () => {
    const shuffled = [{ name: 'View10_eng' }, { name: 'View1_eng' }];

    expect(audioTrackIndexForTile(shuffled, 0)).toBe(1);
  });

  it('returns -1 when there is no matching track', () => {
    expect(audioTrackIndexForTile(tracks, 3)).toBe(-1);
    expect(audioTrackIndexForTile([], 0)).toBe(-1);
  });
});
