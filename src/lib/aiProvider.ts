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

  // Gemini uses a generative model — convert messages into its format
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: opts.maxTokens,
      temperature: opts.temperature,
    },
  });

  // Extract system instruction and build chat history
  const systemMsg = opts.messages.find(m => m.role === 'system');
  const nonSystemMsgs = opts.messages.filter(m => m.role !== 'system');

  // Build the full prompt — Gemini uses generateContent with system instruction
  const systemInstruction = systemMsg?.content || '';

  // For multi-turn, we use the chat interface
  // For single user message (most common), we use generateContent
  if (nonSystemMsgs.length === 1 && nonSystemMsgs[0].role === 'user') {
    // Simple single-turn: combine system + user into one generateContent call
    const fullModel = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        maxOutputTokens: opts.maxTokens,
        temperature: opts.temperature,
      },
    });
    const result = await fullModel.generateContent(nonSystemMsgs[0].content);
    const text = result.response.text();
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
    return { text, tokensUsed, provider: 'gemini' };
  }

  // Multi-turn chat (for chat route)
  const chatModel = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction,
    generationConfig: {
      maxOutputTokens: opts.maxTokens,
      temperature: opts.temperature,
    },
  });

  // Convert messages to Gemini chat format
  const history = nonSystemMsgs.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const lastMsg = nonSystemMsgs[nonSystemMsgs.length - 1];
  const chat = chatModel.startChat({ history });
  const result = await chat.sendMessage(lastMsg.content);
  const text = result.response.text();
  const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
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

  for (const provider of PROVIDERS) {
    try {
      const result = await provider.call(opts);
      if (result.text) {
        if (errors.length > 0) {
          console.log(`[AI] ${provider.name} succeeded after ${errors.length} fallback(s): ${errors.join(' → ')}`);
        } else {
          console.log(`[AI] ${provider.name} responded (${result.tokensUsed} tokens)`);
        }
        return result;
      }
      errors.push(`${provider.name}: empty response`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Truncate long error messages for logging
      const shortMsg = msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
      errors.push(`${provider.name}: ${shortMsg}`);
      console.warn(`[AI] ${provider.name} failed: ${shortMsg}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(' | ')}`);
}
