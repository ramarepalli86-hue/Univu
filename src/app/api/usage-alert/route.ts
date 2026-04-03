import { NextRequest, NextResponse } from 'next/server';
import { addTokens, getStats } from '@/lib/budget';

export async function POST(req: NextRequest) {
  const { tokensUsed = 0 } = await req.json().catch(() => ({}));
  addTokens(tokensUsed);
  const s = getStats();

  if (s.isOverBudget) {
    console.error(`UNIVU BUDGET EXCEEDED: $${s.costUSD.toFixed(4)} — AI features BLOCKED`);
  } else if (s.isNearBudget) {
    console.warn(`UNIVU NEAR BUDGET: $${s.costUSD.toFixed(4)} / $${s.budgetUSD} (${s.percent.toFixed(1)}%)`);
  }

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

  return NextResponse.json({
    costUSD: s.costUSD.toFixed(6),
    budgetUSD: s.budgetUSD,
    percent: s.percent.toFixed(2),
    tokens: s.tokens,
    requests: s.requests,
    isOverBudget: s.isOverBudget,
    isNearBudget: s.isNearBudget,
    status: s.isOverBudget ? 'OVER_BUDGET' : s.isNearBudget ? 'NEAR_BUDGET' : 'OK',
  });
}

export async function GET() {
  const s = getStats();
  return NextResponse.json({
    costUSD: s.costUSD.toFixed(6),
    budgetUSD: s.budgetUSD,
    percent: s.percent.toFixed(2),
    tokens: s.tokens,
    requests: s.requests,
    isOverBudget: s.isOverBudget,
    isNearBudget: s.isNearBudget,
    status: s.isOverBudget ? 'OVER_BUDGET' : s.isNearBudget ? 'NEAR_BUDGET' : 'OK',
    message: s.isOverBudget
      ? 'Monthly AI budget exceeded — all AI features paused until next month'
      : s.isNearBudget
        ? `${s.percent.toFixed(1)}% of $${s.budgetUSD} budget used`
        : `$${s.costUSD.toFixed(4)} of $${s.budgetUSD} used this month`,
  });
}
