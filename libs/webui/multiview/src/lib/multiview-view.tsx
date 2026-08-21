import { useMediaQuery } from 'usehooks-ts';
import { useMultiview } from './use-multiview';
import { MultiviewDesktop } from './multiview-desktop';
import { MultiviewMobile } from './multiview-mobile';

// Composition root for the MultiView demo. The state and derived manifest live in useMultiview; the
// desktop and mobile trees are two distinct layouts (only one player mounts at a time), picked by
// viewport width so a phone gets the sticky-player / bottom-sheet experience and a desktop gets the
// two-column panel layout.
export function MultiviewView() {
  const vm = useMultiview();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop) {
    return (
      <div className="flex justify-center w-full p-8">
        <div className="w-full container">
          <MultiviewDesktop {...vm} />
        </div>
      </div>
    );
  }

  return <MultiviewMobile {...vm} />;
}

export default MultiviewView;
