// Google Analytics (gtag.js) is loaded globally from index.html. Declare the optional global so the
// public MultiView navbar CTA can fire a conversion event safely.
export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
