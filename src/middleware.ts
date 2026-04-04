import { NextRequest, NextResponse } from 'next/server';

// Set MAINTENANCE_MODE=true in Vercel environment variables (Production) to activate.
// Locally and on preview deploys this is never set, so the app runs normally.
const MAINTENANCE = process.env.MAINTENANCE_MODE === 'true';

export function middleware(req: NextRequest) {
  if (!MAINTENANCE) return NextResponse.next();

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
