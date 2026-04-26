/**
 * Univu Budget Guard
 * Tracks token usage across the process lifetime.
 * Hard-blocks all AI calls when monthly cost exceeds $100.
 *
 * Cost is calculated PER PROVIDER — free-tier providers (Gemini, Cerebras)
 * cost $0. Only Groq at $0.59/1M tokens incurs cost.
 *
 * NOTE: Vercel serverless functions are stateless — this counter resets
 * on cold starts. For true persistence, set FORCE_SHUTDOWN=1 in Vercel
 * environment variables to manually kill AI features if needed.
 */

const MONTHLY_BUDGET_USD = 100;

// Cost per 1M tokens by provider — free tiers cost $0
const COST_PER_M_TOKENS: Record<string, number> = {
  gemini:      0.00,
  cerebras:    0.00,
  groq:        0.59,
  openrouter:  0.00,  // using free-tier models only (:free suffix)
};

// Module-level singleton — persists within a warm serverless instance
let _tokens = 0;
let _requests = 0;
let _costUSD = 0;
let _month = new Date().getMonth();

function resetIfNewMonth() {
  const m = new Date().getMonth();
  if (m !== _month) {
    _tokens = 0;
    _requests = 0;
    _costUSD = 0;
    _month = m;
  }
}

export function addTokens(n: number, provider?: string) {
  resetIfNewMonth();
  _tokens += n;
  _requests += 1;
  const rate = COST_PER_M_TOKENS[provider || 'groq'] ?? 0.59;
  _costUSD += n * (rate / 1_000_000);
}

export function getCost(): number {
  resetIfNewMonth();
  return _costUSD;
}

export function getStats() {
  resetIfNewMonth();
  return {
    tokens: _tokens,
    requests: _requests,
    costUSD: _costUSD,
    budgetUSD: MONTHLY_BUDGET_USD,
    percent: (_costUSD / MONTHLY_BUDGET_USD) * 100,
    isOverBudget: _costUSD >= MONTHLY_BUDGET_USD || process.env.FORCE_SHUTDOWN === '1',
    isNearBudget: _costUSD >= MONTHLY_BUDGET_USD * 0.8,
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
