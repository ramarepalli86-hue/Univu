import { NextRequest, NextResponse } from 'next/server';

// Set NEXT_PUBLIC_MAINTENANCE=true in Vercel environment variables to activate.
// Locally and on preview deploys this is never set, so the app runs normally.
const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE === 'true';

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
