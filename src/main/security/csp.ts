/**
 * Content Security Policy Configuration
 *
 * Defines the CSP for the application to enhance security.
 * Based on Electron security best practices and Medium article recommendations.
 */

// Development CSP - allows unsafe-inline for development tools but removes unsafe-eval
export const CSP_POLICY_DEV = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' http://localhost:* ws://localhost:*;
  media-src 'self';
  object-src 'none';
  child-src 'none';
  frame-src 'none';
  worker-src 'self';
  manifest-src 'self';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
`
    .replace(/\s+/g, " ")
    .trim();

// Production CSP - strict security without unsafe-inline
export const CSP_POLICY_PROD = `
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self' data:;
  connect-src 'self';
  media-src 'self';
  object-src 'none';
  child-src 'none';
  frame-src 'none';
  worker-src 'self';
  manifest-src 'self';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
`
    .replace(/\s+/g, " ")
    .trim();

// Additional security headers
export const SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Get appropriate CSP based on environment
export function getCSPPolicy(): string {
    return process.env.NODE_ENV === "development"
        ? CSP_POLICY_DEV
        : CSP_POLICY_PROD;
}

// Legacy export for backward compatibility
export const CSP_POLICY = getCSPPolicy();
export const CSP_META_TAG = CSP_POLICY;
