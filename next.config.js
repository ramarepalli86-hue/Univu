/** @type {import('next').NextConfig} */

const SELF = "'self'";
const UNSAFE_INLINE = "'unsafe-inline'";
const UNSAFE_EVAL = "'unsafe-eval'";

// Content-Security-Policy — strict allowlist
const csp = [
  `default-src ${SELF}`,
  `script-src ${SELF} ${UNSAFE_INLINE} ${UNSAFE_EVAL}`,   // Next.js needs inline + eval in dev; tighten in prod if needed
  `style-src ${SELF} ${UNSAFE_INLINE} https://fonts.googleapis.com`,
  `font-src ${SELF} https://fonts.gstatic.com`,
  `img-src ${SELF} data: blob: https://replicate.delivery https://pbxt.replicate.delivery`,
  `connect-src ${SELF} https://api.groq.com https://generativelanguage.googleapis.com https://api.cerebras.ai https://nominatim.openstreetmap.org`,
  `frame-ancestors 'none'`,   // blocks all embedding / clickjacking
  `base-uri ${SELF}`,
  `form-action ${SELF}`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  // Blocks browsers from sniffing MIME types
  { key: 'X-Content-Type-Options',            value: 'nosniff' },
  // Prevents clickjacking — page cannot be embedded in iframes
  { key: 'X-Frame-Options',                   value: 'DENY' },
  // Legacy XSS filter (IE/older browsers)
  { key: 'X-XSS-Protection',                  value: '1; mode=block' },
  // Forces HTTPS for 2 years, including sub-domains
  { key: 'Strict-Transport-Security',         value: 'max-age=63072000; includeSubDomains; preload' },
  // Limits referrer information sent to third parties
  { key: 'Referrer-Policy',                   value: 'strict-origin-when-cross-origin' },
  // Disables sensitive browser APIs we don't use
  { key: 'Permissions-Policy',                value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  // Content Security Policy
  { key: 'Content-Security-Policy',           value: csp },
  // Tells crawlers this is an entertainment/info site — not professional advice
  { key: 'X-Robots-Tag',                      value: 'index, follow' },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
  },
  async headers() {
    return [
      {
        // Apply security headers to ALL routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // API routes: no-cache + strict CORS (same-origin only)
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control',               value: 'no-store, no-cache, must-revalidate' },
          { key: 'Access-Control-Allow-Origin',  value: process.env.ALLOWED_ORIGIN || 'https://univu.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
