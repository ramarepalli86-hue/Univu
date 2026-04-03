'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportCard, { ReadingResult } from '@/components/ReportCard';
import { getTranslations } from '@/i18n';

const TEAL = '#1A6B6B';
const AMBER = '#D4880A';
const BORDER = '#DDD8CE';
const BG = '#FAFAF8';

const TEST_PROFILES = [
  {
    label: '🧑 Arjun Mehta — Hyderabad, 1990',
    data: {
      name: 'Arjun Mehta', dob: '1990-06-15', timeOfBirth: '06:30',
      birthCity: 'Hyderabad', birthLat: 17.3850, birthLng: 78.4867,
      gender: 'male', currentCity: 'Bengaluru', currentLat: 12.9716, currentLng: 77.5946,
      chartType: 'north', tradition: 'all', maritalStatus: 'single', employment: 'employed',
      concern: 'Career growth and financial stability', consent: true, language: 'en',
    },
  },
  {
    label: '👩 Sofia Chen — Shanghai, 1985',
    data: {
      name: 'Sofia Chen', dob: '1985-03-22', timeOfBirth: '14:15',
      birthCity: 'Shanghai', birthLat: 31.2304, birthLng: 121.4737,
      gender: 'female', currentCity: 'Singapore', currentLat: 1.3521, currentLng: 103.8198,
      chartType: 'south', tradition: 'chinese', maritalStatus: 'married', employment: 'self-employed',
      concern: 'Relationship harmony and family planning', consent: true, language: 'en',
    },
  },
  {
    label: '🧑 Luca Romano — Rome, 2005',
    data: {
      name: 'Luca Romano', dob: '2005-09-10', timeOfBirth: '22:00',
      birthCity: 'Rome', birthLat: 41.9028, birthLng: 12.4964,
      gender: 'male', currentCity: 'Milan', currentLat: 45.4642, currentLng: 9.1900,
      chartType: 'north', tradition: 'western', maritalStatus: 'single', employment: 'student',
      concern: 'Life path, studies, and purpose', consent: true, language: 'en',
    },
  },
];

interface QAItem { label: string; check: (r: ReadingResult) => boolean; }
const QA_CHECKS: QAItem[] = [
  { label: '✅ Name present in response',        check: r => !!r.name },
  { label: '✅ Sun sign calculated',             check: r => !!r.sunSign },
  { label: '✅ Moon sign calculated',            check: r => !!r.moonSign },
  { label: '✅ Vedic rashi present',             check: r => r.moonRashi > 0 },
  { label: '✅ Planets list non-empty',          check: r => (r.planets?.length ?? 0) > 0 },
  { label: '✅ Story narrative has content',     check: r => (r.storyNarrative?.length ?? 0) > 50 },
  { label: '✅ Personality report present',      check: r => (r.personalityReport?.length ?? 0) > 20 },
  { label: '✅ Career report present',           check: r => (r.careerReport?.length ?? 0) > 20 },
  { label: '✅ Dasha timeline present',          check: r => (r.dashaTimeline?.length ?? 0) > 0 },
  { label: '✅ Egyptian decan calculated',       check: r => !!r.egyptianDecan?.sign },
  { label: '✅ Mayan Tzolkin calculated',        check: r => !!r.mayanTzolkin?.daySign },
  { label: '✅ Western sun sign present',        check: r => !!r.westernSunSign },
];

export default function TestPage() {
  const [profileIdx, setProfileIdx] = useState(0);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState<number | null>(null);
  const t = getTranslations('en');

  async function runTest() {
    setLoading(true); setError(''); setReading(null); setElapsed(null);
    const t0 = Date.now();
    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_PROFILES[profileIdx].data),
      });
      const json = await res.json();
      setElapsed(Date.now() - t0);
      if (!res.ok) throw new Error(json.error || 'API error');
      setReading(json.reading);
    } catch (e: unknown) {
      setElapsed(Date.now() - t0);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const qaResults = reading ? QA_CHECKS.map(q => ({ ...q, passed: q.check(reading) })) : [];
  const passCount = qaResults.filter(q => q.passed).length;

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: 'linear-gradient(160deg, #EFF8F8 0%, #F5F2EC 100%)' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${BORDER}`, borderTop: `3px solid ${TEAL}` }}>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Cinzel, Georgia, serif', color: TEAL }}>
            🧪 Univu QA Tester
          </h1>
          <p className="text-sm" style={{ color: '#7A7268' }}>
            Run a full end-to-end test with pre-filled generic profiles. Validates API output and rendering quality.
          </p>

          {/* Profile selector */}
          <div className="flex flex-wrap gap-2 mt-4">
            {TEST_PROFILES.map((p, i) => (
              <button key={i} onClick={() => { setProfileIdx(i); setReading(null); setError(''); }}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                style={profileIdx === i
                  ? { background: `rgba(26,107,107,0.1)`, border: `1.5px solid ${TEAL}`, color: TEAL }
                  : { background: BG, border: `1.5px solid ${BORDER}`, color: '#4A4540' }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Profile details */}
          <div className="mt-4 p-4 rounded-xl text-xs font-mono space-y-1" style={{ background: '#F4F8F7', border: `1px solid rgba(26,107,107,0.12)` }}>
            {Object.entries(TEST_PROFILES[profileIdx].data).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span style={{ color: TEAL, minWidth: 100 }}>{k}:</span>
                <span style={{ color: '#2A3A3A' }}>{String(v)}</span>
              </div>
            ))}
          </div>

          {/* Run button */}
          <button onClick={runTest} disabled={loading}
            className="mt-4 w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #1E8080 40%, ${AMBER} 100%)`, color: '#FFFFFF', boxShadow: '0 4px 16px rgba(26,107,107,0.25)' }}>
            {loading
              ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running test…</>
              : `▶ Run Test with "${TEST_PROFILES[profileIdx].data.name}"`}
          </button>
          {elapsed !== null && (
            <p className="text-xs text-center mt-2" style={{ color: '#7A7268' }}>⏱ {(elapsed / 1000).toFixed(1)}s</p>
          )}
          {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
        </div>

        {/* QA Checklist */}
        <AnimatePresence>
          {reading && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${BORDER}`, borderTop: `3px solid ${AMBER}` }}>
              <h2 className="font-semibold mb-3" style={{ color: AMBER }}>
                QA Checklist — {passCount}/{qaResults.length} passed
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {qaResults.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                    style={{ background: q.passed ? 'rgba(26,107,107,0.06)' : 'rgba(200,60,60,0.06)', border: `1px solid ${q.passed ? 'rgba(26,107,107,0.2)' : 'rgba(200,60,60,0.2)'}` }}>
                    <span>{q.passed ? '✅' : '❌'}</span>
                    <span style={{ color: q.passed ? TEAL : '#C03030' }}>{q.label.slice(3)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full report */}
        <AnimatePresence>
          {reading && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 ml-1" style={{ color: TEAL }}>Full Report Output ↓</p>
              <ReportCard t={t} reading={reading} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
