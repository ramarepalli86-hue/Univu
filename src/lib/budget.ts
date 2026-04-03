/**
 * Univu Budget Guard
 * Tracks token usage across the process lifetime.
 * Hard-blocks all AI calls when monthly cost exceeds $100.
 *
 * NOTE: Vercel serverless functions are stateless — this counter resets
 * on cold starts. For true persistence, set FORCE_SHUTDOWN=1 in Vercel
 * environment variables to manually kill AI features if needed.
 */

const MONTHLY_BUDGET_USD = 100;
const COST_PER_TOKEN = 0.59 / 1_000_000; // llama-3.3-70b

// Module-level singleton — persists within a warm serverless instance
let _tokens = 0;
let _requests = 0;
let _month = new Date().getMonth();

function resetIfNewMonth() {
  const m = new Date().getMonth();
  if (m !== _month) {
    _tokens = 0;
    _requests = 0;
    _month = m;
  }
}

export function addTokens(n: number) {
  resetIfNewMonth();
  _tokens += n;
  _requests += 1;
}

export function getCost(): number {
  resetIfNewMonth();
  return _tokens * COST_PER_TOKEN;
}

export function getStats() {
  resetIfNewMonth();
  const cost = _tokens * COST_PER_TOKEN;
  return {
    tokens: _tokens,
    requests: _requests,
    costUSD: cost,
    budgetUSD: MONTHLY_BUDGET_USD,
    percent: (cost / MONTHLY_BUDGET_USD) * 100,
    isOverBudget: cost >= MONTHLY_BUDGET_USD || process.env.FORCE_SHUTDOWN === '1',
    isNearBudget: cost >= MONTHLY_BUDGET_USD * 0.8,
  };
}

/** Call this at the top of every AI route. Returns 503 response if over budget. */
export function budgetGuard(): Response | null {
  const s = getStats();
  if (s.isOverBudget) {
    return new Response(
      JSON.stringify({
        error: 'BUDGET_EXCEEDED',
        message: 'Monthly AI budget of $100 has been reached. AI features are paused until next month.',
        text: null,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}
