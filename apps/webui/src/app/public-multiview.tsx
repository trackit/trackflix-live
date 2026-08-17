import { useDarkMode } from 'usehooks-ts';

import { ThemeSwitcher } from '@trackflix-live/ui';
import { MultiviewView } from '@trackflix-live/multiview';

import logoWhite from '../assets/TrackFlix_Live_White.svg';
import logoDark from '../assets/TrackFlix_Live_Black_Red.svg';

// Public, unauthenticated shell for the MultiView demo page (reachable without signing in).
export function PublicMultiview() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="flex flex-col min-h-screen dark:bg-base-300 bg-base-200">
      <header className="w-full h-14 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <img
          src={isDarkMode ? logoWhite : logoDark}
          className="max-w-[130px] lg:max-w-[160px]"
          alt="Trackflix Live"
        />
        <ThemeSwitcher />
      </header>
      <main className="flex-grow">
        <MultiviewView />
      </main>
    </div>
  );
}

export default PublicMultiview;
