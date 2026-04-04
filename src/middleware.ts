import { NextRequest, NextResponse } from 'next/server';

// MAINTENANCE MODE — set to false and redeploy when ready to launch.
// Local dev (localhost) is always exempt.
const MAINTENANCE = true;

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
