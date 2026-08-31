// Central application configuration
export const appConfig = {
  name: "LM Verify",
  fullName: "Digital Legal Metrology Verification Platform",
  shortName: "LMV",
  version: "1.0.0",
  description:
    "Secure, transparent, and digitally-verified weighing & measuring instrument certification.",
  supportEmail: "support@lmverify.gov.in",
  logoText: "LM Verify",
};

/**
 * Returns the authoritative environment-aware public verification URL for a given certificate ID.
 * In development: uses current window.location.origin (e.g. http://localhost:5175).
 * In production: uses VITE_PUBLIC_APP_URL if defined, falling back to window.location.origin.
 */
export function getPublicVerificationUrl(certificateId) {
  if (!certificateId) return "";
  const baseUrl =
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_PUBLIC_APP_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:5175");
  return `${baseUrl}/verify/certificate/${encodeURIComponent(certificateId.trim())}`;
}
