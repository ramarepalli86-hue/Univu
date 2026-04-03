'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAL = '#1A6B6B';
const AMBER = '#D4880A';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const STARTER_QUESTIONS = [
  'When will I get married?',
  'What career suits my chart?',
  'What does my dasha mean right now?',
  'How do I know my Moon sign?',
  'What is Sade Sati?',
  'When will my life improve?',
];

interface AstroChatProps {
  chartContext?: string; // pass reading summary so AI knows the user's chart
}

export default function CosmicOracle({ chartContext }: AstroChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste 🙏 I'm your Cosmic Oracle. Ask me anything about your chart, timing, marriage, career, or any astrological tradition — Vedic, Western, Egyptian, or Mayan. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          chartContext,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) {
        const errText = data.error === 'BUDGET_EXCEEDED'
          ? "The monthly AI budget has been reached. Please check back next month. 🙏"
          : "Sorry, I couldn't reach the astrology server right now. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: errText, error: true }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection issue — please try again.',
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const showStarters = messages.length <= 1;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(135deg, ${TEAL}, #2A8A8A)`, boxShadow: `0 4px 20px rgba(26,107,107,0.45)` }}
        aria-label="Open Cosmic Oracle chat"
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
          : <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="11" cy="11" r="4" fill="white" opacity="0.9"/>
              <circle cx="11" cy="4" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="11" cy="18" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="4" cy="11" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="18" cy="11" r="1.5" fill="white" opacity="0.7"/>
            </svg>
        }
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 sm:bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '72vh', display: 'flex', flexDirection: 'column', background: '#FFFDF8', border: `1px solid rgba(26,107,107,0.2)` }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${TEAL}, #2A8A8A)` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>🔮</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">Cosmic Oracle</p>
                <p className="text-[10px] text-white/70">Your personal astrology guide</p>
              </div>
              {chartContext && (
                <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                  <span className="text-[10px] text-white/80">Chart loaded</span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                    style={m.role === 'user'
                      ? { background: `linear-gradient(135deg, ${TEAL}, #2A8A8A)`, color: 'white', borderBottomRightRadius: '4px' }
                      : { background: m.error ? '#FFF5F5' : 'rgba(26,107,107,0.06)', color: '#1F2937', borderBottomLeftRadius: '4px', border: m.error ? '1px solid #FCA5A5' : '1px solid rgba(26,107,107,0.1)' }
                    }
                  >
                    {m.content.split('\n').map((line, j) => (
                      <span key={j}>
                        {line.split(/(\*\*[^*]+\*\*)/).map((part, k) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={k}>{part.replace(/\*\*/g, '')}</strong>
                            : part
                        )}
                        {j < m.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                    style={{ background: 'rgba(26,107,107,0.06)', border: '1px solid rgba(26,107,107,0.1)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: TEAL }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Starter questions */}
              {showStarters && !loading && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: AMBER }}>Quick questions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STARTER_QUESTIONS.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-teal-50"
                        style={{ borderColor: 'rgba(26,107,107,0.25)', color: TEAL, background: 'rgba(26,107,107,0.04)' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 py-3 border-t" style={{ borderColor: 'rgba(26,107,107,0.12)' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your chart…"
                  disabled={loading}
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(26,107,107,0.05)',
                    border: `1px solid rgba(26,107,107,0.2)`,
                    color: '#1F2937',
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${TEAL}, #2A8A8A)` }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M9 3l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-center mt-1.5" style={{ color: '#9CA3AF' }}>For entertainment & information only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
