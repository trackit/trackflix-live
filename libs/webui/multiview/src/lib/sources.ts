import { MultiviewSource } from './types';

// Demo source catalogue. Each source maps to one MediaLive channel encoded into the shared
// MediaPackage V2 channel group; `channelRef` is the MediaPackage channel name used in the
// `sources` list of the multiview manifest query (see manifest-url.ts). These names must match
// the channels created in the MultiView-Preview channel group.
export const SOURCES: MultiviewSource[] = [
  { id: 'f1', label: 'F1', channelRef: 'f1', color: '#e10600' },
  { id: 'nascar', label: 'NASCAR', channelRef: 'nascar', color: '#ffd200' },
  {
    id: 'football',
    label: 'Football',
    channelRef: 'football',
    color: '#1e7a46',
  },
  { id: 'tennis', label: 'Tennis', channelRef: 'tennis', color: '#1f6fb2' },
  {
    id: 'cyclisme',
    label: 'Cycling',
    channelRef: 'cyclisme',
    color: '#f4a300',
  },
];

export const findSource = (id: string): MultiviewSource | undefined =>
  SOURCES.find((source) => source.id === id);
