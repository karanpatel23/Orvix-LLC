/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy notes — read before tightening.
 *
 * `script-src` keeps 'unsafe-inline' deliberately. Every page in this project is
 * statically prerendered, and a nonce-based CSP requires a per-request value,
 * which would force every route to dynamic rendering and lose static output.
 * Next.js also injects its own inline bootstrap and Flight-data scripts, and
 * app/layout.tsx emits an inline application/ld+json block for the Organization
 * schema. All three break under a nonce-free strict policy.
 *
 * 'unsafe-eval' is development-only (React Refresh needs it); production drops it.
 *
 * WHAT THIS WILL BREAK: nothing today — the site loads no third-party scripts,
 * iframes, external fonts, or remote images. It WILL break the moment you add
 * Google Analytics, Vercel Analytics, a YouTube/Maps embed, a chat widget, or a
 * Google Fonts <link>. Each of those needs its origin added to the relevant
 * directive. Phase 3 self-hosts fonts via next/font, which stays inside 'self'.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
