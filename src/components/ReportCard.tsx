'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import StoryAnimator from './StoryAnimator';
import CelestialScene from './CelestialScene';

export interface ReadingResult {
  name: string;
  isUnderage: boolean;
  vedic: { rashi: string; nakshatra: string; summary: string };
  western: { sunSign: string; moonSign: string; rising: string; summary: string };
  combined: string;
  remedies: string[];
  story: string;
}

interface ReportCardProps {
  t: Record<string, string>;
  reading: ReadingResult;
}

const TABS = ['Overview', 'Life', 'Love', 'Career', 'Story'] as const;
type Tab = typeof TABS[number];

export default function ReportCard({ t, reading }: ReportCardProps) {
  const [tab, setTab] = useState<Tab>('Overview');

  // Split combined text into sections for Life/Love/Career
  const combinedParts = reading.combined.split('\n').filter(Boolean);
  const lifeText = combinedParts[0] || reading.vedic.summary;
  const loveText = combinedParts[1] || 'Relationships are shaped by your emotional patterns. Honest communication and mutual respect are the real foundations.';
  const careerText = combinedParts[2] || 'Your professional path reflects your inner drive. Focus on meaningful work over titles.';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          {t.report_title || 'Your Reading'}
        </h1>
        <p className="text-gray-500">
          Prepared for <span className="text-teal-700 font-semibold">{reading.name}</span>
        </p>
      </div>

      {/* 3D Celestial Scene */}
      <CelestialScene
        sunSign={reading.western.sunSign}
        moonSign={reading.western.moonSign}
        rashi={reading.vedic.rashi.split(' ')[0]}
        nakshatra={reading.vedic.nakshatra}
      />

      {/* Disclaimer — small, clean */}
      <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-500">
          ⚠️ For entertainment and information only. Consult a professional astrologer for guidance.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-warm-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {tab === 'Overview' && (
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-main space-y-3">
                <h3 className="section-heading">🕉️ Vedic Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Rashi</p>
                    <p className="text-sm font-semibold text-copper-500">{reading.vedic.rashi}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Nakshatra</p>
                    <p className="text-sm font-semibold text-copper-500">{reading.vedic.nakshatra}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{reading.vedic.summary}</p>
              </div>

              <div className="card-main space-y-3">
                <h3 className="section-heading">🌟 Western Analysis</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Sun</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.western.sunSign}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Moon</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.western.moonSign}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Rising</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.western.rising}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{reading.western.summary}</p>
              </div>
            </div>

            {/* Combined Insight */}
            <div className="card-main space-y-3">
              <h3 className="section-heading">Combined Insight</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{reading.combined}</p>
            </div>
          </div>
        )}

        {tab === 'Life' && (
          <div className="card-main space-y-4">
            <h3 className="section-heading">Life Report</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{lifeText}</p>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Remedies & Guidance</h4>
              {reading.remedies.map((r, i) => (
                <p key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-teal-200">{r}</p>
              ))}
            </div>
          </div>
        )}

        {tab === 'Love' && (
          <div className="card-main space-y-4">
            <h3 className="section-heading">Love & Relationships</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{loveText}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              With Moon in {reading.western.moonSign}, your emotional inner world shapes how you bond. 
              In Vedic tradition, {reading.vedic.nakshatra} nakshatra governs your instinctual patterns in partnership.
              Honest self-awareness matters more than any planetary alignment.
            </p>
          </div>
        )}

        {tab === 'Career' && (
          <div className="card-main space-y-4">
            <h3 className="section-heading">Career & Purpose</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{careerText}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your {reading.western.sunSign} Sun drives your ambitions. The 10th house patterns from 
              {reading.vedic.rashi} suggest that perseverance and strategic thinking will serve you. 
              Historical records from similar birth configurations suggest practical, grounded approaches yield the best outcomes.
            </p>
          </div>
        )}

        {tab === 'Story' && (
          <StoryAnimator name={reading.name} storyText={reading.story} />
        )}
      </motion.div>

      {/* Footer disclaimer */}
      <div className="text-center pt-4 border-t border-warm-200">
        <p className="text-xs text-gray-400 italic">
          For entertainment only. Consult a qualified astrologer for personal guidance.
        </p>
      </div>
    </motion.div>
  );
}
