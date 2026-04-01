'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSparkles } from 'react-icons/io5';
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
  const [showUnderage, setShowUnderage] = useState(false);
  const [error, setError] = useState('');

  // Init locale
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

      if (json.reading.isUnderage) {
        setShowUnderage(true);
      }
      setReading(json.reading);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Animated star background */}
      <StarField />

      {/* ═══════════════════════════════════════════════════════
          BIG DISCLAIMER BANNER — TOP OF PAGE, IMPOSSIBLE TO MISS
          ═══════════════════════════════════════════════════════ */}
      <DisclaimerBanner t={t} />

      {/* Underage overlay */}
      <AgeGate t={t} underage={showUnderage && !reading?.isUnderage === false} />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <h1 className="text-4xl sm:text-6xl font-display font-bold bg-gradient-to-r from-cosmic-400 via-gold-400 to-cosmic-400 bg-clip-text text-transparent">
              {t.app_name || 'Univu'}
            </h1>
          </motion.div>
          <p className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto">
            {t.tagline || 'See the universe. Know yourself.'}
          </p>
          <p className="text-sm text-white/40 mt-2 italic">
            {t.hero_subtitle || 'Combine ancient Vedic wisdom with Western astrology'}
          </p>
        </motion.header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!reading ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
            >
              {/* Hero message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-900/50 border border-cosmic-500/30 rounded-full text-sm text-cosmic-300">
                  <IoSparkles className="text-gold-400" />
                  {t.hero_title || 'Your Cosmic Blueprint Awaits'}
                </div>
              </motion.div>

              {/* Intake Form */}
              <IntakeForm
                t={t}
                locale={locale}
                onLocaleChange={handleLocaleChange}
                onSubmit={handleSubmit}
                loading={loading}
              />

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-center mt-4"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Back button */}
              <button
                onClick={() => { setReading(null); setShowUnderage(false); }}
                className="mb-6 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                ← {t.nav_home || 'Back to Home'}
              </button>

              {/* Report */}
              <ReportCard t={t} reading={reading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════
            STICKY FOOTER DISCLAIMER — ALWAYS VISIBLE
            ═══════════════════════════════════════════════════════ */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center space-y-4">
          <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 max-w-3xl mx-auto">
            <p className="text-sm font-bold text-red-200">
              ⚠️ IMPORTANT: This site is for INFORMATION and ENTERTAINMENT purposes ONLY.
            </p>
            <p className="text-xs text-red-200/70 mt-1">
              It should NOT be used as guidance or a path for any life decisions.
              Please CONSULT A PROFESSIONAL ASTROLOGER for true and accurate details about your horoscope.
            </p>
          </div>
          <p className="text-xs text-white/30">
            {t.footer_text || '© 2026 Univu. For informational purposes only. Consult a qualified astrologer.'}
          </p>
        </footer>
      </div>
    </div>
  );
}
