// Google Analytics (GA4) initialization via gtag.js.
// The measurement ID is provided by the linked Google Analytics connector.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const measurementId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined;

let initialized = false;

export const initAnalytics = () => {
  if (initialized || !measurementId) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
};

export const trackPageView = (path: string) => {
  if (!initialized || !window.gtag) return;
  window.gtag("event", "page_view", { page_path: path });
};

export const trackEvent = (name: string, params: Record<string, unknown> = {}) => {
  if (!initialized || !window.gtag) return;
  window.gtag("event", name, params);
};
