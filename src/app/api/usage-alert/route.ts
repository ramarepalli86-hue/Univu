import { NextRequest, NextResponse } from 'next/server';

// ─── Cost Alert System ────────────────────────────────────────────────────────
// Groq free tier: 14,400 req/day free
// Groq paid: ~$0.59 per 1M tokens (llama-3.3-70b)
// Each story scene: ~400 tokens avg = $0.000236 per scene
// 7 scenes per reading = ~$0.00165 per full reading
// $100 budget = ~60,600 full readings per month
//
// This route is called by the app to log usage and check if we're near $100/month

const MONTHLY_BUDGET_USD = 100;
const COST_PER_TOKEN_USD = 0.59 / 1_000_000; // Groq llama-3.3-70b pricing
const ALERT_THRESHOLD_PERCENT = 80; // Alert at 80% of budget

// ─── In-memory tracker (resets on server restart) ─────────────────────────────
// For production: replace with a database (Vercel KV, Supabase, etc.)
let monthlyTokens = 0;
let monthlyRequests = 0;
let currentMonth = new Date().getMonth();
let lastAlertSent = 0;

function resetIfNewMonth() {
  const now = new Date().getMonth();
  if (now !== currentMonth) {
    monthlyTokens = 0;
    monthlyRequests = 0;
    currentMonth = now;
    lastAlertSent = 0;
    console.log('✅ Monthly usage counter reset for new month');
  }
}

async function sendCostAlert(costUSD: number, tokens: number, requests: number) {
  const alertEmail = process.env.ALERT_EMAIL;
  
  // Log to console always (visible in Vercel logs)
  console.warn(`
⚠️ UNIVU COST ALERT ⚠️
Monthly cost: $${costUSD.toFixed(4)}
Budget: $${MONTHLY_BUDGET_USD}
Usage: ${(costUSD / MONTHLY_BUDGET_USD * 100).toFixed(1)}% of budget
Tokens used: ${tokens.toLocaleString()}
Requests: ${requests.toLocaleString()}
Date: ${new Date().toISOString()}
  `);

  // If you have a webhook URL set (e.g. Slack or email service)
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ *UNIVU COST ALERT* ⚠️\nMonthly cost: *$${costUSD.toFixed(4)}* (${(costUSD / MONTHLY_BUDGET_USD * 100).toFixed(1)}% of $${MONTHLY_BUDGET_USD} budget)\nTokens: ${tokens.toLocaleString()} | Requests: ${requests.toLocaleString()}`,
        }),
      });
    } catch (e) {
      console.error('Failed to send webhook alert:', e);
    }
  }
}

// ─── POST: Log usage ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  resetIfNewMonth();

  const { tokensUsed = 0 } = await req.json().catch(() => ({}));

  monthlyTokens += tokensUsed;
  monthlyRequests += 1;

  const currentCostUSD = monthlyTokens * COST_PER_TOKEN_USD;
  const budgetPercent = (currentCostUSD / MONTHLY_BUDGET_USD) * 100;
  const isOverBudget = currentCostUSD >= MONTHLY_BUDGET_USD;
  const isNearBudget = budgetPercent >= ALERT_THRESHOLD_PERCENT;

  // Send alert if we hit threshold and haven't alerted in last hour
  const now = Date.now();
  if (isNearBudget && now - lastAlertSent > 3600_000) {
    lastAlertSent = now;
    await sendCostAlert(currentCostUSD, monthlyTokens, monthlyRequests);
  }

  return NextResponse.json({
    monthlyTokens,
    monthlyRequests,
    currentCostUSD: currentCostUSD.toFixed(6),
    budgetPercent: budgetPercent.toFixed(2),
    budgetLimit: MONTHLY_BUDGET_USD,
    isNearBudget,
    isOverBudget,
    status: isOverBudget ? 'OVER_BUDGET' : isNearBudget ? 'NEAR_BUDGET' : 'OK',
  });
}

// ─── GET: Check current usage ─────────────────────────────────────────────────
export async function GET() {
  resetIfNewMonth();
  const currentCostUSD = monthlyTokens * COST_PER_TOKEN_USD;
  const budgetPercent = (currentCostUSD / MONTHLY_BUDGET_USD) * 100;

  return NextResponse.json({
    monthlyTokens,
    monthlyRequests,
    currentCostUSD: currentCostUSD.toFixed(6),
    budgetPercent: budgetPercent.toFixed(2),
    budgetLimit: MONTHLY_BUDGET_USD,
    freeReadingsRemaining: Math.floor((MONTHLY_BUDGET_USD - currentCostUSD) / (7 * 400 * COST_PER_TOKEN_USD)),
    status: currentCostUSD >= MONTHLY_BUDGET_USD ? 'OVER_BUDGET' : budgetPercent >= ALERT_THRESHOLD_PERCENT ? 'NEAR_BUDGET' : 'OK',
    message: currentCostUSD >= MONTHLY_BUDGET_USD
      ? '🚨 Monthly budget exceeded — AI enrichment paused'
      : budgetPercent >= ALERT_THRESHOLD_PERCENT
      ? `⚠️ ${budgetPercent.toFixed(1)}% of $${MONTHLY_BUDGET_USD} budget used`
      : `✅ $${currentCostUSD.toFixed(4)} of $${MONTHLY_BUDGET_USD} used this month`,
  });
}
