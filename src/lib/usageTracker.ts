/**
 * Univu Usage Tracker
 * ────────────────────────────────────────────────────────────
 * Tracks detailed per-request metrics in memory:
 *  - Provider breakdown (gemini / cerebras / groq)
 *  - Route breakdown (chat / personal-reading / enrich-story / reading)
 *  - Tokens, cost, latency, errors, fallbacks
 *  - Hourly/daily aggregation
 *
 * NOTE: In-memory — resets on cold start / redeploy.
 * For persistent tracking, use Vercel Analytics or a DB.
 */

// ─── Cost per million tokens by provider ─────────────────────
const COST_PER_M_TOKENS: Record<string, number> = {
  gemini:   0.00,   // free tier
  cerebras: 0.00,   // free tier
  groq:     0.59,   // llama-3.3-70b-versatile
};

// ─── Types ───────────────────────────────────────────────────
export interface RequestLog {
  timestamp: number;
  route: string;
  provider: string;
  tokens: number;
  costUSD: number;
  latencyMs: number;
  success: boolean;
  fallbacks: number;
  errorMsg?: string;
}

export interface ProviderStats {
  requests: number;
  tokens: number;
  costUSD: number;
  errors: number;
  avgLatencyMs: number;
}

export interface RouteStats {
  requests: number;
  tokens: number;
  costUSD: number;
  avgLatencyMs: number;
}

export interface HourlyBucket {
  hour: string;       // "2026-04-13T14"
  requests: number;
  tokens: number;
  costUSD: number;
}

export interface DashboardData {
  uptime: number;
  totalRequests: number;
  totalTokens: number;
  totalCostUSD: number;
  budgetUSD: number;
  budgetPercent: number;
  isOverBudget: boolean;

  byProvider: Record<string, ProviderStats>;
  byRoute: Record<string, RouteStats>;
  hourly: HourlyBucket[];
  recentErrors: Array<{ time: string; route: string; provider: string; error: string }>;
  last20: RequestLog[];

  apiKeys: {
    gemini: boolean;
    cerebras: boolean;
    groq: boolean;
  };
}

// ─── In-memory store ─────────────────────────────────────────
const _startTime = Date.now();
const _logs: RequestLog[] = [];
const MAX_LOGS = 5000; // keep last 5000 requests in memory

let _monthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
let _monthlyTokens = 0;
let _monthlyRequests = 0;
let _monthlyCostUSD = 0;

function resetIfNewMonth() {
  const key = `${new Date().getFullYear()}-${new Date().getMonth()}`;
  if (key !== _monthKey) {
    _monthKey = key;
    _monthlyTokens = 0;
    _monthlyRequests = 0;
    _monthlyCostUSD = 0;
    _logs.length = 0;
  }
}

// ─── Public API ──────────────────────────────────────────────

export function trackRequest(log: Omit<RequestLog, 'timestamp' | 'costUSD'>) {
  resetIfNewMonth();
  const costPerToken = (COST_PER_M_TOKENS[log.provider] || 0.59) / 1_000_000;
  const costUSD = log.tokens * costPerToken;

  const entry: RequestLog = {
    ...log,
    timestamp: Date.now(),
    costUSD,
  };

  _logs.push(entry);
  if (_logs.length > MAX_LOGS) _logs.splice(0, _logs.length - MAX_LOGS);

  _monthlyTokens += log.tokens;
  _monthlyRequests += 1;
  _monthlyCostUSD += costUSD;
}

export function getDashboardData(): DashboardData {
  resetIfNewMonth();
  const BUDGET = 100;

  // Provider breakdown
  const byProvider: Record<string, ProviderStats> = {};
  for (const p of ['gemini', 'cerebras', 'groq']) {
    const pLogs = _logs.filter(l => l.provider === p);
    const successLogs = pLogs.filter(l => l.success);
    byProvider[p] = {
      requests: pLogs.length,
      tokens: pLogs.reduce((s, l) => s + l.tokens, 0),
      costUSD: pLogs.reduce((s, l) => s + l.costUSD, 0),
      errors: pLogs.filter(l => !l.success).length,
      avgLatencyMs: successLogs.length > 0
        ? Math.round(successLogs.reduce((s, l) => s + l.latencyMs, 0) / successLogs.length)
        : 0,
    };
  }

  // Route breakdown
  const byRoute: Record<string, RouteStats> = {};
  const routeNames = [...new Set(_logs.map(l => l.route))];
  for (const r of routeNames) {
    const rLogs = _logs.filter(l => l.route === r);
    byRoute[r] = {
      requests: rLogs.length,
      tokens: rLogs.reduce((s, l) => s + l.tokens, 0),
      costUSD: rLogs.reduce((s, l) => s + l.costUSD, 0),
      avgLatencyMs: rLogs.length > 0
        ? Math.round(rLogs.reduce((s, l) => s + l.latencyMs, 0) / rLogs.length)
        : 0,
    };
  }

  // Hourly buckets (last 48 hours)
  const now = Date.now();
  const cutoff = now - 48 * 60 * 60 * 1000;
  const hourMap = new Map<string, HourlyBucket>();
  for (const log of _logs) {
    if (log.timestamp < cutoff) continue;
    const d = new Date(log.timestamp);
    const hourKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}`;
    const bucket = hourMap.get(hourKey) || { hour: hourKey, requests: 0, tokens: 0, costUSD: 0 };
    bucket.requests += 1;
    bucket.tokens += log.tokens;
    bucket.costUSD += log.costUSD;
    hourMap.set(hourKey, bucket);
  }

  // Recent errors
  const recentErrors = _logs
    .filter(l => !l.success && l.errorMsg)
    .slice(-20)
    .reverse()
    .map(l => ({
      time: new Date(l.timestamp).toISOString(),
      route: l.route,
      provider: l.provider,
      error: l.errorMsg || 'Unknown',
    }));

  return {
    uptime: Math.round((now - _startTime) / 1000),
    totalRequests: _monthlyRequests,
    totalTokens: _monthlyTokens,
    totalCostUSD: _monthlyCostUSD,
    budgetUSD: BUDGET,
    budgetPercent: ((_monthlyCostUSD / BUDGET) * 100),
    isOverBudget: _monthlyCostUSD >= BUDGET || process.env.FORCE_SHUTDOWN === '1',

    byProvider,
    byRoute,
    hourly: [...hourMap.values()].sort((a, b) => a.hour.localeCompare(b.hour)),
    recentErrors,
    last20: _logs.slice(-20).reverse(),

    apiKeys: {
      gemini: !!process.env.GEMINI_API_KEY,
      cerebras: !!process.env.CEREBRAS_API_KEY,
      groq: !!(process.env.Grok_Univu_Key || process.env.GROQ_API_KEY),
    },
  };
}
