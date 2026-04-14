/**
 * 3-Tier AI Provider with automatic fallback:
 *   1. Gemini (Google) — primary   (free tier, gemini-2.0-flash)
 *   2. Cerebras — secondary        (free tier, llama3.1-8b)
 *   3. Groq — tertiary             (100K tokens/day free, llama-3.3-70b-versatile)
 *
 * Each provider is tried in order. If one fails (rate limit, network error,
 * missing API key), the next one is tried automatically.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import Groq from 'groq-sdk';
import { trackRequest } from '@/lib/usageTracker';

// ─── Lazy singleton clients ─────────────────────────────────────────────────

let _gemini: GoogleGenerativeAI | null = null;
function getGemini(): GoogleGenerativeAI | null {
  if (_gemini) return _gemini;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  _gemini = new GoogleGenerativeAI(key);
  return _gemini;
}

let _cerebras: Cerebras | null = null;
function getCerebras(): Cerebras | null {
  if (_cerebras) return _cerebras;
  const key = process.env.CEREBRAS_API_KEY;
  if (!key) return null;
  _cerebras = new Cerebras({ apiKey: key });
  return _cerebras;
}

let _groq: Groq | null = null;
function getGroq(): Groq | null {
  if (_groq) return _groq;
  const key = process.env.Grok_Univu_Key || process.env.GROQ_API_KEY;
  if (!key) return null;
  _groq = new Groq({ apiKey: key });
  return _groq;
}

// ─── Shared types ───────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  maxTokens: number;
  temperature: number;
  /** Route label for usage tracking (e.g. 'chat', 'personal-reading') */
  route?: string;
}

export interface AIResponse {
  text: string;
  tokensUsed: number;
  provider: 'gemini' | 'cerebras' | 'groq';
}

// ─── Provider implementations ───────────────────────────────────────────────

async function callGemini(opts: AIRequestOptions): Promise<AIResponse> {
  const client = getGemini();
  if (!client) throw new Error('GEMINI_API_KEY not configured');

  // IMPORTANT: Gemini 2.5 Flash uses "thinking" tokens by default, which consume
  // a huge portion of maxOutputTokens (often 70%+) for internal reasoning, leaving
  // very little budget for actual visible text. We disable thinking entirely
  // (thinkingBudget: 0) so ALL output tokens go to the actual response text.
  const genConfig = {
    maxOutputTokens: opts.maxTokens,
    temperature: opts.temperature,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thinkingConfig: { thinkingBudget: 0 },
  } as Record<string, unknown>;

  // Extract system instruction and build chat history
  const systemMsg = opts.messages.find(m => m.role === 'system');
  const nonSystemMsgs = opts.messages.filter(m => m.role !== 'system');
  const systemInstruction = systemMsg?.content || '';

  // For single user message (most common), use generateContent
  if (nonSystemMsgs.length === 1 && nonSystemMsgs[0].role === 'user') {
    const fullModel = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: genConfig as never,
    });
    const result = await fullModel.generateContent(nonSystemMsgs[0].content);
    const text = result.response.text();
    const usage = result.response.usageMetadata;
    // Use candidatesTokenCount (actual output) not totalTokenCount (which includes thinking)
    const tokensUsed = usage?.candidatesTokenCount || usage?.totalTokenCount || 0;
    return { text, tokensUsed, provider: 'gemini' };
  }

  // Multi-turn chat (for chat route)
  const chatModel = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction,
    generationConfig: genConfig as never,
  });

  const history = nonSystemMsgs.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const lastMsg = nonSystemMsgs[nonSystemMsgs.length - 1];
  const chat = chatModel.startChat({ history });
  const result = await chat.sendMessage(lastMsg.content);
  const text = result.response.text();
  const usage = result.response.usageMetadata;
  const tokensUsed = usage?.candidatesTokenCount || usage?.totalTokenCount || 0;
  return { text, tokensUsed, provider: 'gemini' };
}

async function callCerebras(opts: AIRequestOptions): Promise<AIResponse> {
  const client = getCerebras();
  if (!client) throw new Error('CEREBRAS_API_KEY not configured');

  const completion = await client.chat.completions.create({
    model: 'llama3.1-8b',
    messages: opts.messages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    })),
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
  });

  // Cerebras returns a union type — cast to access the standard chat completion fields
  const result = completion as unknown as {
    choices: Array<{ message: { content?: string | null } }>;
    usage?: { total_tokens?: number };
  };
  const text = result.choices?.[0]?.message?.content || '';
  const tokensUsed = result.usage?.total_tokens || 0;
  return { text, tokensUsed, provider: 'cerebras' };
}

async function callGroq(opts: AIRequestOptions): Promise<AIResponse> {
  const client = getGroq();
  if (!client) throw new Error('GROQ_API_KEY not configured');

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: opts.messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
  });

  const text = completion.choices[0]?.message?.content || '';
  const tokensUsed = completion.usage?.total_tokens || 0;
  return { text, tokensUsed, provider: 'groq' };
}

// ─── 3-Tier Fallback ────────────────────────────────────────────────────────

const PROVIDERS: {
  name: 'gemini' | 'cerebras' | 'groq';
  call: (opts: AIRequestOptions) => Promise<AIResponse>;
}[] = [
  { name: 'gemini',   call: callGemini },
  { name: 'cerebras', call: callCerebras },
  { name: 'groq',     call: callGroq },
];

/**
 * Call the AI with automatic 3-tier fallback:
 * Gemini → Cerebras → Groq
 *
 * If all three fail, throws the last error.
 */
export async function callAI(opts: AIRequestOptions): Promise<AIResponse> {
  const errors: string[] = [];
  const routeLabel = opts.route || 'unknown';

  for (const provider of PROVIDERS) {
    const t0 = Date.now();
    try {
      const result = await provider.call(opts);
      const latency = Date.now() - t0;
      if (result.text) {
        if (errors.length > 0) {
          console.log(`[AI] ${provider.name} succeeded after ${errors.length} fallback(s): ${errors.join(' → ')}`);
        } else {
          console.log(`[AI] ${provider.name} responded (${result.tokensUsed} tokens)`);
        }
        // Track successful request
        trackRequest({
          route: routeLabel,
          provider: provider.name,
          tokens: result.tokensUsed,
          latencyMs: latency,
          success: true,
          fallbacks: errors.length,
        });
        return result;
      }
      // Track empty response as error
      trackRequest({
        route: routeLabel,
        provider: provider.name,
        tokens: 0,
        latencyMs: latency,
        success: false,
        fallbacks: errors.length,
        errorMsg: 'Empty response',
      });
      errors.push(`${provider.name}: empty response`);
    } catch (err: unknown) {
      const latency = Date.now() - t0;
      const msg = err instanceof Error ? err.message : String(err);
      // Truncate long error messages for logging
      const shortMsg = msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
      // Track failed request
      trackRequest({
        route: routeLabel,
        provider: provider.name,
        tokens: 0,
        latencyMs: latency,
        success: false,
        fallbacks: errors.length,
        errorMsg: shortMsg,
      });
      errors.push(`${provider.name}: ${shortMsg}`);
      console.warn(`[AI] ${provider.name} failed: ${shortMsg}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(' | ')}`);
}
