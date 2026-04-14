import { NextRequest, NextResponse } from 'next/server';
import { addTokens, getStats } from '@/lib/budget';
import { apiGuard } from '@/lib/apiGuard';

/**
 * Usage alert endpoint — tracks token spend and fires webhook alerts.
 *
 * Security:
 *  - POST is rate-limited + origin-checked via apiGuard
 *  - POST validates tokensUsed is a sane positive integer
 *  - GET is removed — budget stats should NOT be publicly visible
 */

export async function POST(req: NextRequest) {
  // Rate limit + origin check
  const blocked = apiGuard(req);
  if (blocked) return blocked;

  let tokensUsed = 0;
  try {
    const body = await req.json();
    tokensUsed = typeof body.tokensUsed === 'number' ? Math.max(0, Math.min(Math.floor(body.tokensUsed), 100000)) : 0;
  } catch {
    // Invalid body — treat as 0 tokens
  }

  addTokens(tokensUsed);
  const s = getStats();

  if (s.isOverBudget) {
    console.error(`UNIVU BUDGET EXCEEDED: $${s.costUSD.toFixed(4)} — AI features BLOCKED`);
  } else if (s.isNearBudget) {
    console.warn(`UNIVU NEAR BUDGET: $${s.costUSD.toFixed(4)} / $${s.budgetUSD} (${s.percent.toFixed(1)}%)`);
  }

  // Fire webhook alert if configured
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if ((s.isOverBudget || s.isNearBudget) && webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${s.isOverBudget ? 'BUDGET EXCEEDED' : 'Near Budget'} — Univu: $${s.costUSD.toFixed(4)} / $${s.budgetUSD} (${s.percent.toFixed(1)}%)`,
      }),
    }).catch(() => {});
  }

  // Only return status — no detailed budget numbers to the client
  return NextResponse.json({
    status: s.isOverBudget ? 'OVER_BUDGET' : s.isNearBudget ? 'NEAR_BUDGET' : 'OK',
  });
}
