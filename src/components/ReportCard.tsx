'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import VedicChart from './VedicChart';
import WesternChart from './WesternChart';
import StoryAnimator from './StoryAnimator';
import CelestialScene from './CelestialScene';
import type { FullReading } from '@/lib/astrology';

// Re-export FullReading as ReadingResult for page.tsx compatibility
export type ReadingResult = FullReading;

interface ReportCardProps {
  t: Record<string, string>;
  reading: FullReading;
}

const TABS = [
  'Overview', 'Personality', 'Houses', 'Timeline',
  'Love', 'Career', 'Health', 'Spiritual',
  'Traditions', 'Charts', 'Story',
] as const;
type Tab = typeof TABS[number];

function MarkdownSection({ content }: { content: string }) {
  // Simple markdown-to-JSX renderer for our report text
  const lines = content.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-display font-bold text-teal-700 mt-4 mb-2">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-3 mb-1">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return <p key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-teal-200">{line.replace('- ', '')}</p>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-semibold text-gray-700 mt-2">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('*') && line.endsWith('*')) {
          return <p key={i} className="text-sm italic text-gray-500">{line.replace(/\*/g, '')}</p>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        // Handle inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-gray-700">{part.replace(/\*\*/g, '')}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function ReportCard({ t, reading }: ReportCardProps) {
  const [tab, setTab] = useState<Tab>('Overview');

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
        sunSign={reading.westernSunSign}
        moonSign={reading.moonSign}
        rashi={reading.lagnaSign}
        nakshatra={reading.moonNakshatraName}
      />

      {/* Disclaimer */}
      <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-500">
          ⚠️ For entertainment and information only. Consult a professional astrologer for guidance.
        </p>
      </div>

      {/* Tab Navigation — scrollable */}
      <div className="flex gap-1 bg-warm-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === tabName
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabName}
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
                <h3 className="section-heading">🕉️ Vedic Chart</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Lagna (Ascendant)</p>
                    <p className="text-sm font-semibold text-copper-500">{reading.lagnaSign}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Moon Sign</p>
                    <p className="text-sm font-semibold text-copper-500">{reading.moonSign}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Nakshatra</p>
                    <p className="text-sm font-semibold text-copper-500">{reading.moonNakshatraName} (Pada {reading.moonNakshatraPada})</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Sun Sign (Vedic)</p>
                    <p className="text-sm font-semibold text-copper-500">{reading.sunSign}</p>
                  </div>
                </div>
              </div>

              <div className="card-main space-y-3">
                <h3 className="section-heading">📊 Current Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Western Sun</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.westernSunSign}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Current Dasha</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.currentDasha || 'N/A'}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Antardasha</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.currentAntardasha || 'N/A'}</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Manglik</p>
                    <p className="text-sm font-semibold text-teal-700">{reading.manglik.isManglik ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panchanga */}
            <div className="card-main space-y-3">
              <h3 className="section-heading">🪷 Panchanga</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-warm-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Tithi</p>
                  <p className="text-sm font-semibold text-gray-700">{reading.panchanga.tithi.name}</p>
                </div>
                <div className="bg-warm-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Nakshatra</p>
                  <p className="text-sm font-semibold text-gray-700">{reading.panchanga.nakshatra}</p>
                </div>
                <div className="bg-warm-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Yoga</p>
                  <p className="text-sm font-semibold text-gray-700">{reading.panchanga.yoga}</p>
                </div>
                <div className="bg-warm-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Karana</p>
                  <p className="text-sm font-semibold text-gray-700">{reading.panchanga.karana}</p>
                </div>
                <div className="bg-warm-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Vara (Day)</p>
                  <p className="text-sm font-semibold text-gray-700">{reading.panchanga.vara}</p>
                </div>
                <div className="bg-warm-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Atmakaraka</p>
                  <p className="text-sm font-semibold text-gray-700">{reading.atmakaraka.planet}</p>
                </div>
              </div>
            </div>

            {/* Planet positions table */}
            <div className="card-main space-y-3">
              <h3 className="section-heading">🪐 Planetary Positions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="pb-2">Planet</th>
                      <th className="pb-2">Rashi</th>
                      <th className="pb-2">House</th>
                      <th className="pb-2">Nakshatra</th>
                      <th className="pb-2">Pada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reading.planets.map((p) => (
                      <tr key={p.name} className="border-b border-gray-50">
                        <td className="py-1.5 font-medium text-gray-700">
                          {p.name} {p.retrograde ? '℞' : ''}
                        </td>
                        <td className="py-1.5 text-gray-600">{p.rashi}</td>
                        <td className="py-1.5 text-gray-600">{p.house}</td>
                        <td className="py-1.5 text-gray-600">{p.nakshatra}</td>
                        <td className="py-1.5 text-gray-600">{p.nakshatraPada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'Personality' && (
          <div className="card-main"><MarkdownSection content={reading.personalityReport} /></div>
        )}

        {tab === 'Houses' && (
          <div className="card-main"><MarkdownSection content={reading.houseAnalysis} /></div>
        )}

        {tab === 'Timeline' && (
          <div className="card-main"><MarkdownSection content={reading.lifeTimeline} /></div>
        )}

        {tab === 'Love' && (
          <div className="card-main"><MarkdownSection content={reading.loveReport} /></div>
        )}

        {tab === 'Career' && (
          <div className="card-main"><MarkdownSection content={reading.careerReport} /></div>
        )}

        {tab === 'Health' && (
          <div className="card-main"><MarkdownSection content={reading.healthReport} /></div>
        )}

        {tab === 'Spiritual' && (
          <div className="card-main"><MarkdownSection content={reading.spiritualReport} /></div>
        )}

        {tab === 'Traditions' && (
          <div className="space-y-5">
            <div className="card-main"><MarkdownSection content={reading.egyptianReport} /></div>
            <div className="card-main"><MarkdownSection content={reading.mayanReport} /></div>
            <div className="card-main"><MarkdownSection content={reading.historicalPatterns} /></div>
            <div className="card-main"><MarkdownSection content={reading.remedies} /></div>
          </div>
        )}

        {tab === 'Charts' && (
          <div className="space-y-6">
            <div className="card-main">
              <VedicChart
                planets={reading.planets.map(p => {
                  const westernName = p.rashi.split(' (')[0].replace('Mesha', 'Aries').replace('Vrishabha', 'Taurus').replace('Mithuna', 'Gemini').replace('Karka', 'Cancer').replace('Simha', 'Leo').replace('Kanya', 'Virgo').replace('Tula', 'Libra').replace('Vrischika', 'Scorpio').replace('Dhanu', 'Sagittarius').replace('Makara', 'Capricorn').replace('Kumbha', 'Aquarius').replace('Meena', 'Pisces');
                  return { name: p.name, rashi: westernName, house: p.house, retrograde: p.retrograde };
                })}
                ascendant={reading.lagnaSign.split(' (')[0].replace('Mesha', 'Aries').replace('Vrishabha', 'Taurus').replace('Mithuna', 'Gemini').replace('Karka', 'Cancer').replace('Simha', 'Leo').replace('Kanya', 'Virgo').replace('Tula', 'Libra').replace('Vrischika', 'Scorpio').replace('Dhanu', 'Sagittarius').replace('Makara', 'Capricorn').replace('Kumbha', 'Aquarius').replace('Meena', 'Pisces')}
                chartType={reading.chartType}
              />
            </div>
            <div className="card-main">
              <WesternChart
                sunSign={reading.westernSunSign}
                moonSign={(() => {
                  const sign = reading.moonSign.split(' (')[1]?.replace(')', '') || reading.moonSign;
                  return sign;
                })()}
                risingSign={(() => {
                  const sign = reading.lagnaSign.split(' (')[1]?.replace(')', '') || reading.lagnaSign;
                  return sign;
                })()}
                planets={reading.planets.map(p => ({
                  name: p.name,
                  degree: p.siderealLongitude,
                  sign: p.rashi.split(' (')[1]?.replace(')', '') || 'Aries',
                }))}
              />
            </div>
          </div>
        )}

        {tab === 'Story' && (
          <StoryAnimator
            name={reading.name}
            storyText={reading.storyNarrative}
            storyEvents={reading.storyEvents}
            lagnaSign={reading.lagnaSign}
            moonSign={reading.moonSign}
            sunSign={reading.sunSign}
            birthYear={parseInt(reading.dob?.split('-')[0] || '1990', 10)}
            planets={reading.planets}
            currentDasha={reading.currentDasha}
          />
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
