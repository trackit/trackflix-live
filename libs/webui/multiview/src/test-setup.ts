// jsdom does not implement window.matchMedia, which the responsive multiview view relies on
// (useMediaQuery). Resolve queries against a fixed 1440px, portrait, reduced-motion viewport so the
// component tests exercise the desktop tree deterministically. Individual tests can override
// window.matchMedia to render the mobile tree.
const VIEWPORT_WIDTH = 1440;

const evaluate = (query: string): boolean => {
  const min = query.match(/min-width:\s*(\d+)/);
  if (min && VIEWPORT_WIDTH < Number(min[1])) {
    return false;
  }
  const max = query.match(/max-width:\s*(\d+)/);
  if (max && VIEWPORT_WIDTH > Number(max[1])) {
    return false;
  }
  if (query.includes('orientation: landscape')) {
    return false;
  }
  return true;
};

window.matchMedia = (query: string): MediaQueryList => ({
  matches: evaluate(query),
  media: query,
  onchange: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false,
});
