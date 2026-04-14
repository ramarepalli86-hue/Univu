import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/usageTracker';

/**
 * Admin Stats API
 * Protected by ADMIN_SECRET env var or localhost-only access.
 *
 * GET /api/admin/stats?secret=YOUR_SECRET
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // In production, require a secret token
  if (!isLocal) {
    const secret = req.nextUrl.searchParams.get('secret');
    const expected = process.env.ADMIN_SECRET;
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const data = getDashboardData();
  return NextResponse.json(data);
}
