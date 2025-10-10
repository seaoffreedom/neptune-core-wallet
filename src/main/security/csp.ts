/**
 * Content Security Policy Configuration
 *
 * Defines the CSP for the application to enhance security.
 */

export const CSP_POLICY = `
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
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
  block-all-mixed-content;
  referrer no-referrer;
`
  .replace(/\s+/g, ' ')
  .trim();

export const CSP_META_TAG = CSP_POLICY;
