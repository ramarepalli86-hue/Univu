'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import IntakeForm, { IntakeFormData } from '@/components/IntakeForm';
import AgeGate from '@/components/AgeGate';
import ReportCard, { ReadingResult } from '@/components/ReportCard';
import { Locale, getTranslations, detectLocale } from '@/i18n';

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [t, setT] = useState<Record<string, string>>({});
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);
    setT(getTranslations(detected));
  }, []);

  function handleLocaleChange(newLocale: Locale) {
    setLocale(newLocale);
    setT(getTranslations(newLocale));
  }

  async function handleSubmit(data: IntakeFormData) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setReading(json.reading);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(160deg, #FDF6E8 0%, #FAF0DC 45%, #F5E8D0 100%)' }}>
      <StarField />
      <DisclaimerBanner t={t} />
      <AgeGate t={t} underage={false} />

      {/* Floating zodiac symbols — decorative background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
        {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','☯','☀','🌙','⭐'].map((sym, i) => (
          <span key={i} className="absolute text-2xl sm:text-3xl opacity-[0.07]"
            style={{
              left: `${[5,12,22,33,45,55,65,75,82,90,8,18,40,60,78,50][i]}%`,
              top: `${[8,20,5,35,12,28,45,15,60,30,75,55,90,80,70,50][i]}%`,
              transform: `rotate(${(i * 23) % 360}deg)`,
              fontSize: `${1.2 + (i % 3) * 0.5}rem`,
              color: i % 3 === 0 ? '#1A6B6B' : i % 3 === 1 ? '#D4880A' : '#2A8A8A',
            }}>
            {sym}
          </span>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {/* Logo — gradient pill matching the submit button style */}
          <div className="flex justify-center mb-5">
            <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A6B6B 0%, #1E8080 40%, #D4880A 100%)',
                boxShadow: '0 4px 20px rgba(26,107,107,0.35), 0 2px 8px rgba(212,136,10,0.2)',
              }}>
              {/* Icon mark — orrery/eye-of-cosmos */}
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer orbital ring */}
                <circle cx="26" cy="26" r="23" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeDasharray="4 2.5"/>
                {/* Middle ring */}
                <circle cx="26" cy="26" r="15" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
                {/* Inner filled circle — the star / soul */}
                <circle cx="26" cy="26" r="6" fill="white" opacity="0.9"/>
                {/* Cardinal dots on middle ring */}
                <circle cx="26" cy="11" r="2.2" fill="white" opacity="0.85"/>
                <circle cx="26" cy="41" r="2.2" fill="white" opacity="0.85"/>
                <circle cx="11" cy="26" r="2.2" fill="white" opacity="0.85"/>
                <circle cx="41" cy="26" r="2.2" fill="white" opacity="0.85"/>
                {/* Diagonal subtle crosses */}
                <circle cx="36.6" cy="15.4" r="1.4" fill="white" opacity="0.5"/>
                <circle cx="15.4" cy="36.6" r="1.4" fill="white" opacity="0.5"/>
                <circle cx="15.4" cy="15.4" r="1.4" fill="white" opacity="0.5"/>
                <circle cx="36.6" cy="36.6" r="1.4" fill="white" opacity="0.5"/>
              </svg>

              {/* Wordmark */}
              <div className="text-left">
                <div className="leading-none" style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '2.1rem', fontWeight: 700, letterSpacing: '0.12em', color: '#FFFFFF' }}>
                  UNIVU
                </div>
                <div className="tracking-[0.22em] text-[0.6rem] font-semibold uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Cosmic Blueprint
                </div>
              </div>
            </div>
          </div>
          <p className="text-base sm:text-lg mt-2 font-medium" style={{ color: '#1A6B6B' }}>
            {t.tagline || 'See the universe. Know yourself.'}
          </p>
          <p className="text-sm mt-1 italic" style={{ color: '#7A8A80' }}>
            {t.hero_subtitle || 'Vedic · Western · Chinese · Egyptian · Mayan traditions'}
          </p>

          {/* Tradition pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[['🕉️','Vedic'],['♈','Western'],['☯️','Chinese'],['𓂀','Egyptian'],['☀️','Mayan']].map(([icon, name]) => (
              <span key={name} className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: 'rgba(26,107,107,0.08)', color: '#1A6B6B', border: '1px solid rgba(26,107,107,0.18)' }}>
                {icon} {name}
              </span>
            ))}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {!reading ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
              <IntakeForm
                t={t}
                locale={locale}
                onLocaleChange={handleLocaleChange}
                onSubmit={handleSubmit}
                loading={loading}
              />
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mt-4 text-sm">
                  {error}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => { setReading(null); }}
                className="mb-6 text-sm font-medium transition-colors"
                style={{ color: '#1A6B6B' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4880A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#1A6B6B')}
              >
                ← Back to Home
              </button>
              <ReportCard t={t} reading={reading} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-16 pt-6 text-center space-y-3" style={{ borderTop: '1.5px solid', borderImage: 'linear-gradient(90deg, transparent, #1A6B6B, #D4880A, transparent) 1' }}>
          <p className="text-xs" style={{ color: '#8A8278' }}>
            For entertainment and information only. Consult a professional astrologer for accurate guidance.
          </p>
          <p className="text-xs font-semibold" style={{ color: '#1A6B6B' }}>
            {t.footer_text || '© 2026 Univu'}
          </p>
          <a
            href="https://univu.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold hover:underline transition-opacity hover:opacity-80"
            style={{ color: '#D4880A', letterSpacing: '0.05em' }}
          >
            🌐 univu.vercel.app
          </a>
        </footer>
      </div>
    </div>
  );
}
