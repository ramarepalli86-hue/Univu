import { NextRequest, NextResponse } from 'next/server';

// ─── MAINTENANCE MODE ────────────────────────────────────────────────────────
// Prod (univu.vercel.app) shows the Coming Soon page until this is set to false.
// localhost is ALWAYS exempt — dev works normally regardless of this flag.
//
// TO LAUNCH:
//   1. Change `true` → `false` below
//   2. git add -A && git commit -m "chore: launch — disable maintenance mode"
//   3. git push  (Vercel auto-deploys)
// ────────────────────────────────────────────────────────────────────────────
const MAINTENANCE = true; // ← flip to false when ready to go live

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  if (!MAINTENANCE || isLocal) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Allow the maintenance page itself and all Next.js internals through
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Redirect everything else to /maintenance
  return NextResponse.redirect(new URL('/maintenance', req.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
