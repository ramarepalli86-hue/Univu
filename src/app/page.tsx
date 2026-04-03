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
    <div className="relative min-h-screen" style={{ background: '#F5F2EC' }}>
      <StarField />
      <DisclaimerBanner t={t} />
      <AgeGate t={t} underage={false} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header — consistent color, no rainbow */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight" style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #B84A00 45%, #C4820A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t.app_name || 'Univu'}
          </h1>
          <p className="text-base sm:text-lg mt-2 font-medium" style={{ color: '#114A4A' }}>
            {t.tagline || 'See the universe. Know yourself.'}
          </p>
          <p className="text-sm mt-1 italic" style={{ color: '#8A8278' }}>
            {t.hero_subtitle || 'Vedic · Western · Egyptian · Roman astrological traditions'}
          </p>
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
                style={{ color: '#114A4A' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8B1A1A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#114A4A')}
              >
                ← Back to Home
              </button>
              <ReportCard t={t} reading={reading} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-16 pt-6 text-center space-y-3" style={{ borderTop: '1.5px solid', borderImage: 'linear-gradient(90deg, transparent, #8B1A1A, #C4820A, transparent) 1' }}>
          <p className="text-xs" style={{ color: '#8A8278' }}>
            For entertainment and information only. Consult a professional astrologer for accurate guidance.
          </p>
          <p className="text-xs font-semibold" style={{ color: '#114A4A' }}>
            {t.footer_text || '© 2026 Univu'}
          </p>
        </footer>
      </div>
    </div>
  );
}
