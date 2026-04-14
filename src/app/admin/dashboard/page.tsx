'use client';

import { useState, useEffect, useCallback } from 'react';

/* ─── Types matching DashboardData from usageTracker ─── */
interface ProviderStats {
  requests: number;
  tokens: number;
  costUSD: number;
  errors: number;
  avgLatencyMs: number;
}
interface RouteStats {
  requests: number;
  tokens: number;
  costUSD: number;
  avgLatencyMs: number;
}
interface HourlyBucket {
  hour: string;
  requests: number;
  tokens: number;
  costUSD: number;
}
interface RequestLog {
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
interface DashboardData {
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
  apiKeys: { gemini: boolean; cerebras: boolean; groq: boolean };
}

/* ─── Helpers ─── */
function fmt$(n: number) { return '$' + n.toFixed(4); }
function fmtK(n: number) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n); }
function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const PROVIDER_COLORS: Record<string, string> = {
  gemini: '#3b82f6',
  cerebras: '#f97316',
  groq: '#10b981',
};

const PROVIDER_EMOJI: Record<string, string> = {
  gemini: '🔵',
  cerebras: '🟠',
  groq: '🟢',
};

/* ─── Stat Card ─── */
function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color?: string; icon?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-2 right-3 text-3xl opacity-15 pointer-events-none">{icon || '✦'}</div>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600/70">{label}</span>
      <span className={`text-3xl font-extrabold mt-1 ${color || 'text-stone-800'}`}>{value}</span>
      {sub && <span className="text-xs mt-1.5 text-stone-400">{sub}</span>}
    </div>
  );
}

/* ─── Bar Chart (CSS only) ─── */
function BarChart({ data, labelKey, valueKey, barColor = '#f59e0b' }: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  barColor?: string;
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <span className="w-28 text-stone-500 truncate text-right font-mono">{String(d[labelKey])}</span>
          <div className="flex-1 rounded-full h-5 overflow-hidden bg-amber-50 border border-amber-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(3, (Number(d[valueKey]) / max) * 100)}%`,
                background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
              }}
            />
          </div>
          <span className="w-14 text-stone-700 text-right font-bold">{fmtK(Number(d[valueKey]))}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Card wrapper ─── */
function Card({ children, className = '', danger = false }: { children: React.ReactNode; className?: string; danger?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${
      danger
        ? 'bg-red-50 border-red-200'
        : 'bg-white border-amber-200/60 shadow-sm'
    } ${className}`}>
      {children}
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tab, setTab] = useState<'overview' | 'cost' | 'usage' | 'logs'>('overview');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        setError(res.status === 401 ? 'Unauthorized — add ?secret=YOUR_SECRET in production' : 'Failed to fetch');
        return;
      }
      setData(await res.json());
      setError('');
    } catch {
      setError('Cannot reach server');
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <h1 className="text-2xl text-red-500 font-bold">⚠️ {error}</h1>
          <button onClick={fetchData} className="mt-4 px-5 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── Loading State ─── */
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-amber-600 text-lg animate-pulse">✦ Loading dashboard…</div>
      </div>
    );
  }

  const providers = Object.entries(data.byProvider).sort((a, b) => b[1].requests - a[1].requests);
  const routes = Object.entries(data.byRoute).sort((a, b) => b[1].requests - a[1].requests);
  const totalErrors = providers.reduce((s, [, p]) => s + p.errors, 0);
  const successRate = data.totalRequests > 0 ? ((data.totalRequests - totalErrors) / data.totalRequests * 100) : 100;

  const TABS = [
    { id: 'overview' as const, label: '📊 Overview' },
    { id: 'cost' as const, label: '💰 Cost' },
    { id: 'usage' as const, label: '📈 Usage' },
    { id: 'logs' as const, label: '📋 Logs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-50 text-stone-800">

      {/* ─── Header ─── */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-amber-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔭</span>
          <div>
            <h1 className="text-xl font-bold text-stone-800">Univu Admin Dashboard</h1>
            <p className="text-xs text-stone-400">Uptime: {fmtTime(data.uptime)} • Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
              autoRefresh
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-stone-50 border-stone-200 text-stone-500'
            }`}
          >
            {autoRefresh ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button onClick={fetchData} className="px-3 py-1.5 text-xs rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* ─── Tabs ─── */}
      <nav className="px-6 flex gap-1 overflow-x-auto border-b border-amber-200/50 bg-white/40">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="p-6 max-w-7xl mx-auto">

        {/* ═══════════ OVERVIEW ═══════════ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="📡" label="Total Requests" value={fmtK(data.totalRequests)} sub="This month" />
              <StatCard icon="🪙" label="Total Tokens" value={fmtK(data.totalTokens)} sub="This month" />
              <StatCard icon="💰" label="Total Cost" value={fmt$(data.totalCostUSD)}
                sub={`${data.budgetPercent.toFixed(1)}% of $${data.budgetUSD}`}
                color={data.budgetPercent > 80 ? 'text-red-600' : data.budgetPercent > 50 ? 'text-amber-600' : 'text-emerald-600'} />
              <StatCard icon="✅" label="Success Rate" value={successRate.toFixed(1) + '%'}
                sub={`${totalErrors} errors`}
                color={successRate >= 95 ? 'text-emerald-600' : successRate >= 80 ? 'text-amber-600' : 'text-red-600'} />
            </div>

            {/* API Keys */}
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-3">🔑 API Keys Status</h2>
              <div className="flex flex-wrap gap-5">
                {Object.entries(data.apiKeys).map(([key, active]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <span className="text-sm text-stone-700 capitalize font-medium">{key}</span>
                    <span className={`text-xs font-medium ${active ? 'text-emerald-600' : 'text-red-500'}`}>{active ? 'Active' : 'Missing'}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Provider Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {providers.map(([name, stats]) => (
                <Card key={name}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{PROVIDER_EMOJI[name] || '⚪'}</span>
                    <h3 className="font-bold text-stone-800 capitalize">{name}</h3>
                    <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${
                      data.apiKeys[name as keyof typeof data.apiKeys]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {data.apiKeys[name as keyof typeof data.apiKeys] ? '● Active' : '○ No Key'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Requests</span>
                      <div className="text-lg font-bold text-stone-800">{stats.requests}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Tokens</span>
                      <div className="text-lg font-bold text-stone-800">{fmtK(stats.tokens)}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Cost</span>
                      <div className="text-lg font-bold text-stone-800">{fmt$(stats.costUSD)}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Errors</span>
                      <div className={`text-lg font-bold ${stats.errors > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{stats.errors}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Avg Latency</span>
                      <div className="text-lg font-bold text-stone-800">{stats.avgLatencyMs}ms</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ COST ═══════════ */}
        {tab === 'cost' && (
          <div className="space-y-6">
            {/* Budget Meter */}
            <Card>
              <h2 className="text-lg font-bold text-stone-800 mb-4">💰 Monthly Budget</h2>
              <div className="relative h-10 rounded-full overflow-hidden bg-stone-100 border border-stone-200 mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(data.budgetPercent, 100)}%`,
                    background: data.budgetPercent > 80
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : data.budgetPercent > 50
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-stone-700 drop-shadow-sm">
                  {fmt$(data.totalCostUSD)} / ${data.budgetUSD} ({data.budgetPercent.toFixed(2)}%)
                </span>
              </div>
              {data.isOverBudget && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  ⚠️ BUDGET EXCEEDED — AI features are blocked!
                </div>
              )}
            </Card>

            {/* Cost by Provider */}
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">Cost by Provider</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                      <th className="pb-3">Provider</th>
                      <th className="pb-3 text-right">Requests</th>
                      <th className="pb-3 text-right">Tokens</th>
                      <th className="pb-3 text-right">Cost</th>
                      <th className="pb-3 text-right">$/request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map(([name, stats]) => (
                      <tr key={name} className="border-t border-stone-100">
                        <td className="py-3 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[name] }} />
                          <span className="capitalize text-stone-700 font-medium">{name}</span>
                        </td>
                        <td className="py-3 text-right text-stone-600">{stats.requests}</td>
                        <td className="py-3 text-right text-stone-600">{fmtK(stats.tokens)}</td>
                        <td className="py-3 text-right font-mono text-stone-800 font-bold">{fmt$(stats.costUSD)}</td>
                        <td className="py-3 text-right font-mono text-stone-400">
                          {stats.requests > 0 ? fmt$(stats.costUSD / stats.requests) : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-stone-200 font-bold">
                      <td className="py-3 text-stone-800">Total</td>
                      <td className="py-3 text-right text-stone-800">{data.totalRequests}</td>
                      <td className="py-3 text-right text-stone-800">{fmtK(data.totalTokens)}</td>
                      <td className="py-3 text-right font-mono text-stone-800">{fmt$(data.totalCostUSD)}</td>
                      <td className="py-3 text-right font-mono text-stone-400">
                        {data.totalRequests > 0 ? fmt$(data.totalCostUSD / data.totalRequests) : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Cost by Route */}
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">Cost by Route</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                      <th className="pb-3">Route</th>
                      <th className="pb-3 text-right">Requests</th>
                      <th className="pb-3 text-right">Tokens</th>
                      <th className="pb-3 text-right">Cost</th>
                      <th className="pb-3 text-right">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map(([name, stats]) => (
                      <tr key={name} className="border-t border-stone-100">
                        <td className="py-3 font-mono text-amber-700">/api/{name}</td>
                        <td className="py-3 text-right text-stone-600">{stats.requests}</td>
                        <td className="py-3 text-right text-stone-600">{fmtK(stats.tokens)}</td>
                        <td className="py-3 text-right font-mono text-stone-800 font-bold">{fmt$(stats.costUSD)}</td>
                        <td className="py-3 text-right text-stone-400">{stats.avgLatencyMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pricing Reference */}
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">📊 Provider Pricing Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Model</th>
                      <th className="pb-3 text-right">$/1M tokens</th>
                      <th className="pb-3 text-right">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { emoji: '🔵', name: 'Gemini', model: 'gemini-2.5-flash', price: '$0.00', tier: 'Free', tierColor: 'text-emerald-600' },
                      { emoji: '🟠', name: 'Cerebras', model: 'llama3.1-8b', price: '$0.00', tier: 'Free', tierColor: 'text-emerald-600' },
                      { emoji: '🟢', name: 'Groq', model: 'llama-3.3-70b', price: '$0.59', tier: '100K/day free', tierColor: 'text-amber-600' },
                    ].map(p => (
                      <tr key={p.name} className="border-t border-stone-100">
                        <td className="py-3 text-stone-700">{p.emoji} {p.name}</td>
                        <td className="py-3 text-stone-400">{p.model}</td>
                        <td className={`py-3 text-right font-bold ${p.tierColor}`}>{p.price}</td>
                        <td className={`py-3 text-right ${p.tierColor}`}>{p.tier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════ USAGE ═══════════ */}
        {tab === 'usage' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">📈 Requests by Route</h2>
              {routes.length > 0 ? (
                <BarChart
                  data={routes.map(([name, stats]) => ({ name: `/api/${name}`, requests: stats.requests }))}
                  labelKey="name" valueKey="requests" barColor="#f59e0b"
                />
              ) : <p className="text-center py-4 text-stone-400">No data yet</p>}
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">🔄 Tokens by Provider</h2>
              <BarChart
                data={providers.map(([name, stats]) => ({ name, tokens: stats.tokens }))}
                labelKey="name" valueKey="tokens" barColor="#10b981"
              />
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">⏱ Avg Latency by Provider (ms)</h2>
              <BarChart
                data={providers.map(([name, stats]) => ({ name, latency: stats.avgLatencyMs }))}
                labelKey="name" valueKey="latency" barColor="#f97316"
              />
            </Card>

            {/* Hourly Activity */}
            {data.hourly.length > 0 && (
              <Card>
                <h2 className="text-sm font-semibold text-stone-500 mb-4">📅 Hourly Activity (last 48h)</h2>
                <div className="flex items-end gap-px h-36 overflow-x-auto pb-1">
                  {data.hourly.map((h, i) => {
                    const maxReq = Math.max(...data.hourly.map(b => b.requests), 1);
                    const pct = (h.requests / maxReq) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center group relative" style={{ minWidth: 14 }}>
                        <div
                          className="w-3 rounded-t transition-all duration-300"
                          style={{
                            height: `${Math.max(4, pct)}%`,
                            background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                          }}
                          title={`${h.hour}: ${h.requests} requests, ${fmtK(h.tokens)} tokens`}
                        />
                        <div className="absolute bottom-full mb-2 hidden group-hover:block text-xs p-2 rounded-lg shadow-lg whitespace-nowrap z-10 bg-white border border-amber-200 text-stone-700">
                          {h.hour.split('T')[1]}:00 — {h.requests} req, {fmtK(h.tokens)} tok
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs mt-1 text-stone-400">
                  <span>{data.hourly[0]?.hour.split('T').join(' ') || ''}</span>
                  <span>{data.hourly[data.hourly.length - 1]?.hour.split('T').join(' ') || ''}</span>
                </div>
              </Card>
            )}

            {/* Fallback Frequency */}
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">🔀 Fallback Chain Usage</h2>
              <div className="space-y-3">
                {(() => {
                  const successLogs = data.last20.filter(l => l.success);
                  const total = successLogs.length || 1;
                  const rows = [
                    { label: 'Direct (no fallback)', count: successLogs.filter(l => l.fallbacks === 0).length, color: '#10b981' },
                    { label: '1 fallback (2nd provider)', count: successLogs.filter(l => l.fallbacks === 1).length, color: '#f59e0b' },
                    { label: '2 fallbacks (3rd provider)', count: successLogs.filter(l => l.fallbacks === 2).length, color: '#ef4444' },
                  ];
                  return rows.map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-500">{r.label}</span>
                        <span className="font-bold" style={{ color: r.color }}>{r.count} / {successLogs.length}</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(r.count / total) * 100}%`, backgroundColor: r.color }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════ LOGS ═══════════ */}
        {tab === 'logs' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-sm font-semibold text-stone-500 mb-4">📋 Last 20 Requests</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left uppercase tracking-wider text-stone-400">
                      <th className="pb-3 pr-3">Time</th>
                      <th className="pb-3 pr-3">Route</th>
                      <th className="pb-3 pr-3">Provider</th>
                      <th className="pb-3 pr-3 text-right">Tokens</th>
                      <th className="pb-3 pr-3 text-right">Cost</th>
                      <th className="pb-3 pr-3 text-right">Latency</th>
                      <th className="pb-3 pr-3">Status</th>
                      <th className="pb-3">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.last20.map((log, i) => (
                      <tr key={i} className={`border-t border-stone-100 ${!log.success ? 'bg-red-50' : ''}`}>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-stone-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-amber-700">{log.route}</td>
                        <td className="py-2.5 pr-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[log.provider] || '#666' }} />
                            <span className="text-stone-600">{log.provider}</span>
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-right text-stone-600">{fmtK(log.tokens)}</td>
                        <td className="py-2.5 pr-3 text-right font-mono text-stone-700">{fmt$(log.costUSD)}</td>
                        <td className="py-2.5 pr-3 text-right text-stone-400">{log.latencyMs}ms</td>
                        <td className="py-2.5 pr-3">
                          {log.success
                            ? <span className="text-emerald-600 font-bold">✓{log.fallbacks > 0 ? ` (${log.fallbacks}fb)` : ''}</span>
                            : <span className="text-red-500 font-bold">✗</span>
                          }
                        </td>
                        <td className="py-2.5 truncate max-w-[200px] text-stone-400" title={log.errorMsg || ''}>
                          {log.errorMsg || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.last20.length === 0 && (
                  <p className="text-center py-8 text-stone-400">
                    No requests yet — generate a reading to see data here ✦
                  </p>
                )}
              </div>
            </Card>

            {/* Recent Errors */}
            {data.recentErrors.length > 0 && (
              <Card danger>
                <h2 className="text-sm font-semibold text-red-600 mb-4">⚠️ Recent Errors</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.recentErrors.map((e, i) => (
                    <div key={i} className="text-xs p-3 rounded-lg bg-red-100/50 border border-red-200">
                      <div className="flex justify-between text-stone-500">
                        <span className="font-mono">{e.route} → {e.provider}</span>
                        <span>{new Date(e.time).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-red-700 mt-1">{e.error}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
