export interface AudioTrackLike {
  name: string;
}

// The multiview manifest exposes one audio rendition group per view, named View1_*, View2_*, ...
// Map a tile index (0-based) to the hls.js audio-track index that carries that view's audio.
// Returns -1 when there is no matching track.
export const audioTrackIndexForTile = (
  tracks: readonly AudioTrackLike[],
  tileIndex: number
): number => {
  const matcher = new RegExp(`^view${tileIndex + 1}(_|$)`, 'i');
  return tracks.findIndex((track) => matcher.test(track.name ?? ''));
};
