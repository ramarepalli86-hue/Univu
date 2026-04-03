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
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(160deg, #EFF8F8 0%, #F5F2EC 40%, #FBF6ED 100%)' }}>
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
          {/* Logo mark */}
          <div className="flex justify-center mb-4">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(26,107,107,0.12), rgba(212,136,10,0.12))', border: '2px solid rgba(26,107,107,0.25)' }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Univu logo">
                <circle cx="22" cy="22" r="10" stroke="#1A6B6B" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <circle cx="22" cy="22" r="18" stroke="#D4880A" strokeWidth="1" fill="none" strokeDasharray="3 3" opacity="0.5"/>
                <circle cx="22" cy="22" r="3" fill="#1A6B6B"/>
                <line x1="22" y1="4" x2="22" y2="14" stroke="#D4880A" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="22" y1="30" x2="22" y2="40" stroke="#D4880A" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="4" y1="22" x2="14" y2="22" stroke="#D4880A" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="30" y1="22" x2="40" y2="22" stroke="#D4880A" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="22" cy="8"  r="2" fill="#D4880A" opacity="0.7"/>
                <circle cx="22" cy="36" r="2" fill="#D4880A" opacity="0.7"/>
                <circle cx="8"  cy="22" r="2" fill="#D4880A" opacity="0.7"/>
                <circle cx="36" cy="22" r="2" fill="#D4880A" opacity="0.7"/>
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #1A6B6B 0%, #1E8080 40%, #D4880A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t.app_name || 'Univu'}
          </h1>
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
        </footer>
      </div>
    </div>
  );
}
