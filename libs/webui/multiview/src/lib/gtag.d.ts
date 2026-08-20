// Google Analytics (gtag.js) is loaded globally from apps/webui/index.html.
// Declare the optional global so the MultiView page can fire conversion events safely.
export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
