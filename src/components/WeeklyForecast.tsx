'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const TEAL   = '#B8860B';
const AMBER  = '#8B1A1A';
const TEAL_L = '#9A7520';

// ── Sign / animal lists ────────────────────────────────────────────────────────

const VEDIC_RASHIS = [
  'Mesha (Aries)','Vrishabha (Taurus)','Mithuna (Gemini)',
  'Karka (Cancer)','Simha (Leo)','Kanya (Virgo)',
  'Tula (Libra)','Vrischika (Scorpio)','Dhanu (Sagittarius)',
  'Makara (Capricorn)','Kumbha (Aquarius)','Meena (Pisces)',
];
const WESTERN_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];
const CHINESE_ANIMALS = [
  'Rat','Ox','Tiger','Rabbit','Dragon','Snake',
  'Horse','Goat','Monkey','Rooster','Dog','Pig',
];

const RASHI_EMOJI: Record<string,string> = {
  'Mesha (Aries)':'♈','Vrishabha (Taurus)':'♉','Mithuna (Gemini)':'♊',
  'Karka (Cancer)':'♋','Simha (Leo)':'♌','Kanya (Virgo)':'♍',
  'Tula (Libra)':'♎','Vrischika (Scorpio)':'♏','Dhanu (Sagittarius)':'♐',
  'Makara (Capricorn)':'♑','Kumbha (Aquarius)':'♒','Meena (Pisces)':'♓',
};
const ZODIAC_EMOJI: Record<string,string> = {
  Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',
  Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓',
};
const ANIMAL_EMOJI: Record<string,string> = {
  Rat:'🐀',Ox:'🐂',Tiger:'🐅',Rabbit:'🐇',Dragon:'🐉',Snake:'🐍',
  Horse:'🐎',Goat:'🐐',Monkey:'🐒',Rooster:'🐓',Dog:'🐕',Pig:'🐖',
};

type WeeklySubTab = 'rashi' | 'zodiac' | 'chinese';
type WeeklyTimeframe = 'current' | 'next_week' | 'month';

// ── Minimal context for the API (no birth chart needed) ────────────────────────
function buildMinimalContext() {
  return {
    name: 'Reader', dob: '1990-01-01', birthCity: 'Unknown', currentCity: 'Unknown',
    currentLat: 0, currentLng: 0, gender: 'other', maritalStatus: 'single',
    employment: 'employed', concern: '', lagnaSign: '', moonSign: '', sunSign: '',
    moonNakshatraName: '', moonNakshatraPada: 0, nakshatraDeity: '',
    currentDasha: '', currentAntardasha: '', currentDashaYears: '', nextDasha: '',
    nextDashaYear: '', currentAge: 30, isManglik: false, marsHouse: 0, marsSign: '',
    venusSign: '', venusHouse: 0, saturnSign: '', saturnHouse: 0,
    jupiterSign: '', jupiterHouse: 0, rahuSign: '', rahuHouse: 0,
    ketuSign: '', ketuHouse: 0, seventhHouseSign: '', seventhHouseLord: '',
    tenthHouseSign: '', tenthHouseLord: '', sixthHouseSign: '', eighthHouseSign: '',
    ninthHouseSign: '', twelfthHouseSign: '', lagnaBodyPart: '',
    planetsIn7: '', planetsIn6: '', atmakaraka: 'Sun', sadeSatiActive: false,
    vedicSystem: 'parashari' as const,
  };
}

// ── Text renderer ──────────────────────────────────────────────────────────────
function PersonalText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
          return <h3 key={i} className="text-base font-bold mt-5 mb-1" style={{ color: TEAL }}>{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.trim().startsWith('⚠️')) {
          return <p key={i} className="text-xs italic mt-4 pt-3 border-t" style={{ color: '#8A7050', borderColor: '#E5E7EB' }}>{line}</p>;
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: '#1F2937' }}>{part.replace(/\*\*/g, '')}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

function ReadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse py-2">
      <div className="flex items-center gap-2 mb-4">
        <motion.div className="w-2 h-2 rounded-full" style={{ background: AMBER }}
          animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 0.9, repeat: Infinity }} />
        <span className="text-xs" style={{ color: '#8A7050' }}>Consulting the stars…</span>
      </div>
      {[88,65,80,55,72,90,60,75].map((w,i) => (
        <div key={i} className="h-3 rounded-full" style={{ width: `${w}%`, background: '#F3F4F6' }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Weekly Forecast — standalone top-level component (no birth chart required)
// Three sub-tabs: Vedic Rashi, Western Zodiac, Chinese Year
// ═══════════════════════════════════════════════════════════════════════════════

export default function WeeklyForecast() {
  const [subTab, setSubTab] = useState<WeeklySubTab>('rashi');
  const [timeframe, setTimeframe] = useState<WeeklyTimeframe>('current');
  const [selectedRashi, setSelectedRashi] = useState(VEDIC_RASHIS[0]);
  const [selectedZodiac, setSelectedZodiac] = useState(WESTERN_SIGNS[0]);
  const [selectedAnimal, setSelectedAnimal] = useState(CHINESE_ANIMALS[0]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastKey, setLastKey] = useState('');

  const fetchKey = `${subTab}_${timeframe}_${subTab === 'rashi' ? selectedRashi : subTab === 'zodiac' ? selectedZodiac : selectedAnimal}`;

  const handleGenerate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setText('');
    try {
      const ctx = buildMinimalContext();
      let sectionId = '';
      const extCtx: Record<string, unknown> = { ...ctx, weeklyTimeframe: timeframe };

      if (subTab === 'rashi') {
        sectionId = 'weekly_rashi';
        extCtx.weeklyRashi = selectedRashi;
      } else if (subTab === 'zodiac') {
        sectionId = 'weekly_zodiac';
        extCtx.weeklyZodiacSign = selectedZodiac;
      } else {
        sectionId = 'weekly_chinese';
        extCtx.weeklyChineseAnimal = selectedAnimal;
      }

      const res = await fetch('/api/personal-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionId, context: extCtx }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.text) {
          setText(d.text.replace(/\bthe Seeker\b/g, '').replace(/\bThe Seeker\b/g, ''));
          setLastKey(fetchKey);
        }
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [subTab, timeframe, selectedRashi, selectedZodiac, selectedAnimal, loading, fetchKey]);

  const SUB_TABS: { id: WeeklySubTab; label: string; icon: string }[] = [
    { id: 'rashi',   label: 'By Rashi (Vedic)',    icon: '🕉️' },
    { id: 'zodiac',  label: 'By Zodiac (Western)', icon: '♈' },
    { id: 'chinese', label: 'Chinese Year',         icon: '☯️' },
  ];

  const TIMEFRAMES: { id: WeeklyTimeframe; label: string }[] = [
    { id: 'current',   label: '📅 This Week' },
    { id: 'next_week', label: '➡️ Next Week' },
    { id: 'month',     label: '🗓 Full Month' },
  ];

  return (
    <div className="rounded-2xl p-5 sm:p-7 space-y-5"
      style={{
        background: 'rgba(255,255,255,0.75)',
        border: '1.5px solid rgba(26,107,107,0.15)',
        boxShadow: '0 4px 24px rgba(26,107,107,0.08)',
        WebkitBackdropFilter: 'blur(10px)',
        backdropFilter: 'blur(10px)',
      }}>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cinzel,Georgia,serif', color: TEAL }}>
          📅 Weekly &amp; Monthly Forecast
        </h2>
        <p className="text-xs mt-1.5" style={{ color: '#6B4A20' }}>
          AI-powered forecasts by Vedic Rashi, Western Zodiac, or Chinese Year animal.
          <br />No birth chart needed — just pick your sign!
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl p-1.5" style={{ background: 'rgba(26,107,107,0.05)' }}>
        {SUB_TABS.map(st => (
          <button key={st.id} onClick={() => { setSubTab(st.id); setText(''); setLastKey(''); }}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
            style={subTab === st.id
              ? { background: `linear-gradient(135deg,${TEAL},${TEAL_L})`, color: '#fff', boxShadow: '0 2px 8px rgba(184,134,11,0.25)' }
              : { color: '#6B4A20' }}>
            <span>{st.icon}</span> {st.label}
          </button>
        ))}
      </div>

      {/* Timeframe selector */}
      <div className="flex flex-wrap gap-1.5">
        {TIMEFRAMES.map(tf => (
          <button key={tf.id} onClick={() => { setTimeframe(tf.id); setText(''); setLastKey(''); }}
            className="flex-1 min-w-[90px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center"
            style={timeframe === tf.id
              ? { background: 'rgba(212,136,10,0.1)', color: AMBER, borderColor: 'rgba(212,136,10,0.3)' }
              : { background: '#FAFAF8', color: '#6B4A20', borderColor: '#E5E7EB' }}>
            {tf.label}
          </button>
        ))}
      </div>

      {/* ── Sign selector: Rashi ── */}
      {subTab === 'rashi' && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEAL }}>
            Select your Vedic Moon Sign (Rashi)
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {VEDIC_RASHIS.map(r => {
              const isSel = r === selectedRashi;
              return (
                <button key={r} onClick={() => setSelectedRashi(r)}
                  className="px-2 py-2.5 text-xs font-medium rounded-lg border transition-all text-left"
                  style={isSel
                    ? { background: `linear-gradient(135deg,rgba(184,134,11,0.12),rgba(139,26,26,0.08))`, borderColor: TEAL, color: TEAL }
                    : { background: '#FAFAF8', borderColor: '#E5E7EB', color: '#4B5563' }}>
                  <span className="mr-1">{RASHI_EMOJI[r] || '•'}</span>
                  {r.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sign selector: Western Zodiac ── */}
      {subTab === 'zodiac' && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEAL }}>
            Select your Western Sun Sign
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {WESTERN_SIGNS.map(s => {
              const isSel = s === selectedZodiac;
              return (
                <button key={s} onClick={() => setSelectedZodiac(s)}
                  className="px-2 py-2.5 text-xs font-medium rounded-lg border transition-all text-left"
                  style={isSel
                    ? { background: `linear-gradient(135deg,rgba(184,134,11,0.12),rgba(139,26,26,0.08))`, borderColor: TEAL, color: TEAL }
                    : { background: '#FAFAF8', borderColor: '#E5E7EB', color: '#4B5563' }}>
                  <span className="mr-1">{ZODIAC_EMOJI[s] || '•'}</span>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Animal selector: Chinese ── */}
      {subTab === 'chinese' && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEAL }}>
            Select your Chinese Zodiac Animal
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {CHINESE_ANIMALS.map(a => {
              const isSel = a === selectedAnimal;
              return (
                <button key={a} onClick={() => setSelectedAnimal(a)}
                  className="px-2 py-2.5 text-xs font-medium rounded-lg border transition-all text-left"
                  style={isSel
                    ? { background: `linear-gradient(135deg,rgba(184,134,11,0.12),rgba(139,26,26,0.08))`, borderColor: TEAL, color: TEAL }
                    : { background: '#FAFAF8', borderColor: '#E5E7EB', color: '#4B5563' }}>
                  <span className="mr-1">{ANIMAL_EMOJI[a] || '•'}</span>
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate button */}
      {lastKey !== fetchKey && (
        <button onClick={handleGenerate} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg,${TEAL} 0%,#7C3AED 40%,${AMBER} 100%)`, color: '#fff', boxShadow: '0 4px 20px rgba(184,134,11,0.28)' }}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Consulting the stars…</>
            : subTab === 'rashi' ? `🕉️ Get ${selectedRashi.split(' (')[0]} Rashi Forecast`
            : subTab === 'zodiac' ? `♈ Get ${selectedZodiac} Horoscope`
            : `☯️ Get ${selectedAnimal} Forecast`}
        </button>
      )}

      {/* Loading */}
      {loading && <ReadingSkeleton />}

      {/* Result */}
      {text && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEAL }}>
              {subTab === 'rashi' ? `🕉️ ${selectedRashi}` : subTab === 'zodiac' ? `♈ ${selectedZodiac}` : `☯️ ${selectedAnimal}`}
              {' · '}{timeframe === 'current' ? 'This Week' : timeframe === 'next_week' ? 'Next Week' : 'Full Month'}
            </p>
            <button onClick={() => { setText(''); setLastKey(''); }}
              className="text-[10px] px-3 py-1 rounded-full border font-medium"
              style={{ color: TEAL, borderColor: 'rgba(184,134,11,0.3)' }}>
              ← New Forecast
            </button>
          </div>
          <PersonalText text={text} />
          <p className="text-xs mt-3 pt-3 border-t text-center" style={{ color: '#8A7050', borderColor: 'rgba(0,0,0,0.07)' }}>
            For entertainment &amp; information only · Not professional advice
          </p>
        </div>
      )}
    </div>
  );
}
