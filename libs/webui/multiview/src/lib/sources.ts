import { MultiviewSource } from './types';
import soccer from '../assets/soccer.svg';
import motorsport from '../assets/motorsport.svg';
import basketball from '../assets/basketball.svg';
import football from '../assets/football.svg';
import adventure from '../assets/adventure.svg';

// Demo source catalogue. Each source maps to one MediaLive channel encoded into the shared
// MediaPackage V2 channel group; `channelRef` is the MediaPackage channel name used in the
// `sources` list of the multiview manifest query (see manifest-url.ts). These names must match
// the channels created in the MultiView-Preview channel group.
export const SOURCES: MultiviewSource[] = [
  { id: 'soccer', label: 'Soccer', channelRef: 'soccer', thumbnail: soccer },
  {
    id: 'motorsport',
    label: 'Motorsport',
    channelRef: 'motorsport',
    thumbnail: motorsport,
  },
  {
    id: 'basketball',
    label: 'Basketball',
    channelRef: 'basketball',
    thumbnail: basketball,
  },
  {
    id: 'football',
    label: 'Football',
    channelRef: 'football',
    thumbnail: football,
  },
  {
    id: 'adventure',
    label: 'Adventure',
    channelRef: 'adventure',
    thumbnail: adventure,
  },
];

export const findSource = (id: string): MultiviewSource | undefined =>
  SOURCES.find((source) => source.id === id);
