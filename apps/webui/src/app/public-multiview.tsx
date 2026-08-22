import { useDarkMode } from 'usehooks-ts';

import { ThemeSwitcher, TrackitSymbol } from '@trackflix-live/ui';
import { MultiviewView } from '@trackflix-live/multiview';

import logoWhite from '../assets/TrackFlix_Live_White.svg';
import logoDark from '../assets/TrackFlix_Live_Black_Red.svg';

// Public-style shell for the MultiView demo page: its own slim navbar (logo + "Connect with
// TrackIt" + theme switcher) instead of the app Topbar. Currently rendered behind the Cognito gate
// in app.tsx, but the shell itself carries no auth so it can go fully public again unchanged.
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
        <div className="flex items-center gap-4">
          <a
            href="https://trackit.io/contact?utm_source=trackflix-demo&utm_medium=qr&utm_campaign=ibc-multiview"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              window.gtag?.('event', 'connect_with_trackit', {
                placement: 'multiview_navbar',
              })
            }
            className="hidden lg:inline-flex items-center gap-2 h-[38px] px-5 rounded-lg bg-trackit-red hover:bg-trackit-red-hover text-white text-[13.5px] font-semibold transition-colors"
          >
            <TrackitSymbol className="w-5" />
            Connect with TrackIt
          </a>
          <ThemeSwitcher />
        </div>
      </header>
      <main className="flex-grow flex flex-col">
        <MultiviewView />
      </main>
    </div>
  );
}

export default PublicMultiview;
