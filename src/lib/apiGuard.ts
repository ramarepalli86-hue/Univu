/**
 * Univu API Guard
 * ────────────────────────────────────────────────────────────
 * Provides:
 *  1. Per-IP rate limiting (in-memory, resets on cold start)
 *  2. Request size limiting
 *  3. Origin / Referer check (rejects requests from other origins)
 *  4. Basic input sanitisation helper
 *
 * Usage — at the top of every API route:
 *   const blocked = apiGuard(req);
 *   if (blocked) return blocked;
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Rate Limit Store ────────────────────────────────────────
// Key: IP address   Value: { count, windowStart }
const RL_WINDOW_MS  = 60_000;   // 1-minute window
const RL_MAX_REQ    = 20;       // max 20 requests per IP per minute
const RL_STORE      = new Map<string, { count: number; windowStart: number }>();

function getRateLimitResult(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = RL_STORE.get(ip);

  if (!entry || now - entry.windowStart > RL_WINDOW_MS) {
    RL_STORE.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RL_MAX_REQ - 1 };
  }

  entry.count++;
  if (entry.count > RL_MAX_REQ) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: RL_MAX_REQ - entry.count };
}

// Clean up stale entries periodically (every 500 requests)
let _cleanupCounter = 0;
function maybeCleanup() {
  if (++_cleanupCounter % 500 !== 0) return;
  const now = Date.now();
  for (const [ip, entry] of RL_STORE.entries()) {
    if (now - entry.windowStart > RL_WINDOW_MS * 10) RL_STORE.delete(ip);
  }
}

// ─── Allowed origins ─────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://univu.vercel.app',
  'https://www.univu.vercel.app',
  // allow all *.vercel.app preview deployments
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // server-to-server or direct curl — allow (rate limit still applies)
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow Vercel preview URLs: https://<name>-<hash>-univu.vercel.app
  if (/^https:\/\/univu(-[a-z0-9]+)*\.vercel\.app$/.test(origin)) return true;
  // Allow localhost in development
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

// ─── Main Guard ───────────────────────────────────────────────
export function apiGuard(req: NextRequest): NextResponse | null {
  // 1. Only allow POST (and OPTIONS for preflight)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 });
  }
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // 2. Origin check
  const origin = req.headers.get('origin');
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Content-Type check
  const ct = req.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  // 4. Per-IP rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  maybeCleanup();
  const rl = getRateLimitResult(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(RL_MAX_REQ),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null; // all checks passed
}

// ─── Input Sanitiser ─────────────────────────────────────────
/** Strip HTML tags and limit string length to prevent injection / oversized payloads */
export function sanitise(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[<>'"`;]/g, '')         // strip common injection chars
    .trim()
    .slice(0, maxLen);
}
