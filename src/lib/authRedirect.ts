// Email links (verify, reset) always return to the live domain,
// except while testing inside the Lovable editor preview.
export const LIVE_SITE = "https://ajmalakhtar.com.np";
export function authRedirectBase(): string {
  const h = window.location.hostname;
  if (h.includes("id-preview") || h.includes("lovableproject.com") || h === "localhost" || h === "127.0.0.1") {
    return window.location.origin;
  }
  return LIVE_SITE;
}
