'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VedicChart from './VedicChart';
import WesternChart from './WesternChart';
import StoryAnimator from './StoryAnimator';
import type { FullReading } from '@/lib/astrology';
import type { ReadingContext } from '@/app/api/personal-reading/route';

export type ReadingResult = FullReading;

interface ReportCardProps {
  t: Record<string, string>;
  reading: FullReading;
}

const TEAL   = '#1A6B6B';
const AMBER  = '#D4880A';
const TEAL_L = '#2A8A8A';

const TABS = [
  { id: 'overview',  label: '✨ Overview'  },
  { id: 'love',      label: '💞 Love'      },
  { id: 'career',    label: '🏆 Career'    },
  { id: 'health',    label: '🌿 Health'    },
  { id: 'timeline',  label: '🗓 Timeline'  },
  { id: 'spiritual', label: '🔮 Purpose'   },
  { id: 'charts',    label: '🪐 Charts'    },
  { id: 'story',     label: '🎬 Story'     },
] as const;
type TabId = typeof TABS[number]['id'];

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
          return <p key={i} className="text-xs italic mt-4 pt-3 border-t" style={{ color: '#9CA3AF', borderColor: '#E5E7EB' }}>{line}</p>;
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
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Crafting your personalized reading…</span>
      </div>
      {[88,65,80,55,72,90,60,75].map((w,i) => (
        <div key={i} className="h-3 rounded-full" style={{ width: `${w}%`, background: '#F3F4F6' }} />
      ))}
    </div>
  );
}

const VEDIC_RASHIS_LOCAL = [
  'Mesha (Aries)','Vrishabha (Taurus)','Mithuna (Gemini)',
  'Karka (Cancer)','Simha (Leo)','Kanya (Virgo)',
  'Tula (Libra)','Vrischika (Scorpio)','Dhanu (Sagittarius)',
  'Makara (Capricorn)','Kumbha (Aquarius)','Meena (Pisces)',
];
const RASHI_LORDS_LOCAL = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const NAKSHATRA_DEITIES_LOCAL = [
  'Ashwini Kumaras','Yama','Agni','Brahma','Soma','Rudra',
  'Aditi','Brihaspati','Nagas','Pitris','Bhaga','Aryaman',
  'Savitar','Tvashtar','Vayu','Indragni','Mitra','Indra',
  'Nirriti','Apas','Vishvedevas','Vishnu','Vasus','Varuna',
  'Ajaikapada','Ahir Budhnya','Pushan',
];
const BODY_MAP: Record<string,string> = {
  'Mesha (Aries)':'head & brain','Vrishabha (Taurus)':'neck & throat',
  'Mithuna (Gemini)':'arms & lungs','Karka (Cancer)':'chest & stomach',
  'Simha (Leo)':'heart & spine','Kanya (Virgo)':'intestines & digestion',
  'Tula (Libra)':'kidneys & lower back','Vrischika (Scorpio)':'reproductive system',
  'Dhanu (Sagittarius)':'thighs & hips','Makara (Capricorn)':'knees & joints',
  'Kumbha (Aquarius)':'calves & circulation','Meena (Pisces)':'feet & lymph',
};

const NAKSHATRA_SYMBOL: Record<string, string> = {
  Ashwini:'🐴', Bharani:'🌺', Krittika:'🔥', Rohini:'🌹', Mrigashira:'🦌', Ardra:'💎',
  Punarvasu:'🌟', Pushya:'🌸', Ashlesha:'🐍', Magha:'👑', 'Purva Phalguni':'❤️', 'Uttara Phalguni':'🌞',
  Hasta:'🙌', Chitra:'💫', Swati:'🌬️', Vishakha:'⚡', Anuradha:'🪷', Jyeshtha:'⚔️',
  Mula:'🌿', 'Purva Ashadha':'🌊', 'Uttara Ashadha':'🦅', Shravana:'👂', Dhanishta:'🥁',
  Shatabhisha:'💊', 'Purva Bhadrapada':'⚡', 'Uttara Bhadrapada':'🐉', Revati:'🐟',
};

const NAKSHATRA_QUALITY: Record<string, string> = {
  Ashwini:'Healing & swift beginnings', Bharani:'Transformation & fierce love',
  Krittika:'Sharp discernment & fire', Rohini:'Beauty, wealth & sensuality',
  Mrigashira:'Eternal seeking & curiosity', Ardra:'Destruction that renews',
  Punarvasu:'Return & restoration', Pushya:'Nourishment & protection',
  Ashlesha:'Serpent wisdom & intensity', Magha:'Royal lineage & authority',
  'Purva Phalguni':'Pleasure & creative joy', 'Uttara Phalguni':'Contracts & social bonds',
  Hasta:'Craft, skill & dexterity', Chitra:'Architecture of beauty',
  Swati:'Independent spirit & balance', Vishakha:'Focused ambition & duality',
  Anuradha:'Loyal devotion & friendship', Jyeshtha:'Elder authority & occult power',
  Mula:'Root destruction & liberation', 'Purva Ashadha':'Invincible fire & pride',
  'Uttara Ashadha':'Universal victory & dharma', Shravana:'Listening, learning & connection',
  Dhanishta:'Abundance & musical soul', Shatabhisha:'Healing & mysticism',
  'Purva Bhadrapada':'Two-faced intensity & fire', 'Uttara Bhadrapada':'Depth, patience & moksha',
  Revati:'Final journey, protection & compassion',
};

const NAKSHATRA_FAMOUS: Record<string, string> = {
  Ashwini:'Mahatma Gandhi · Amitabh Bachchan', Bharani:'Charlie Chaplin · Aishwarya Rai',
  Krittika:'Jack Nicholson · Indira Gandhi', Rohini:'Barack Obama · Rihanna',
  Mrigashira:'Nikola Tesla · Oprah Winfrey', Ardra:'Leonardo DiCaprio · Elon Musk',
  Punarvasu:'Steve Jobs · Lata Mangeshkar', Pushya:'Dalai Lama · Warren Buffett',
  Ashlesha:'Elvis Presley · Cardi B', Magha:'Napoleon · Madhuri Dixit',
  'Purva Phalguni':'Michael Jackson · Marilyn Monroe', 'Uttara Phalguni':'Mother Teresa · AR Rahman',
  Hasta:'Mahatma Gandhi · Princess Diana', Chitra:'Michelangelo · Shah Jahan',
  Swati:'Rabindranath Tagore · Celine Dion', Vishakha:'Bill Gates · Deepika Padukone',
  Anuradha:'Shah Rukh Khan · Taylor Swift', Jyeshtha:'Cleopatra · Amitabh Bachchan',
  Mula:'Osho · Rumi · Nostradamus', 'Purva Ashadha':'Elvis · Jim Morrison',
  'Uttara Ashadha':'Julius Caesar · APJ Abdul Kalam', Shravana:'Albert Einstein · Jawaharlal Nehru',
  Dhanishta:'Aryabhata · Ludwig van Beethoven', Shatabhisha:'Abraham Lincoln · Nietzsche',
  'Purva Bhadrapada':'Nikola Tesla · Fyodor Dostoevsky', 'Uttara Bhadrapada':'Michelangelo · Nostradamus',
  Revati:'Swami Vivekananda · Rabindranath Tagore',
};

function NakshatraBanner({ reading }: { reading: FullReading }) {
  const nk = reading.moonNakshatraName;
  const sym = NAKSHATRA_SYMBOL[nk] || '✦';
  const quality = NAKSHATRA_QUALITY[nk] || 'Ancient cosmic wisdom';
  const famous = NAKSHATRA_FAMOUS[nk] || '';
  const pada = reading.moonNakshatraPada;
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(26,107,107,0.2)', background: 'linear-gradient(135deg,rgba(26,107,107,0.08),rgba(212,136,10,0.06))' }}>
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl" style={{ background: 'rgba(26,107,107,0.1)', border: '1px solid rgba(26,107,107,0.2)' }}>
          {sym}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: AMBER }}>Your Birth Star</p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: TEAL }}>{nk}</h2>
          <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: '#4B5563' }}>Pada {pada} · {quality}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 text-right flex-shrink-0">
          <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Shares nakshatra with</p>
          {famous.split(' · ').map(f => (
            <p key={f} className="text-xs font-semibold" style={{ color: '#374151' }}>{f}</p>
          ))}
        </div>
      </div>
      {/* Nakshatra strip — show all 27 nakshatras, highlight current */}
      <div className="flex overflow-x-auto px-4 pb-3 gap-1.5" style={{ scrollbarWidth: 'none' }}>
        {Object.keys(NAKSHATRA_SYMBOL).map((n, i) => {
          const isCurrent = n === nk;
          return (
            <div key={n} className="flex-shrink-0 text-center" style={{ opacity: isCurrent ? 1 : 0.35 }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-0.5"
                style={{ background: isCurrent ? `linear-gradient(135deg,${TEAL},${TEAL_L})` : 'rgba(26,107,107,0.06)', border: isCurrent ? `1px solid ${TEAL}` : '1px solid transparent' }}>
                {NAKSHATRA_SYMBOL[n]}
              </div>
              {isCurrent && <div className="w-1.5 h-1.5 rounded-full mx-auto" style={{ background: AMBER }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildContext(reading: FullReading): ReadingContext {
  const birthYear = parseInt(reading.dob?.split('-')[0] || '1990', 10);
  const currentAge = new Date().getFullYear() - birthYear;
  const venus   = reading.planets.find(p => p.name === 'Venus');
  const mars    = reading.planets.find(p => p.name === 'Mars');
  const saturn  = reading.planets.find(p => p.name === 'Saturn');
  const jupiter = reading.planets.find(p => p.name === 'Jupiter');
  const rahu    = reading.planets.find(p => p.name === 'Rahu');
  const ketu    = reading.planets.find(p => p.name === 'Ketu');
  const li = reading.lagnaRashi;
  const dashaTimeline = reading.dashaTimeline || [];
  let currentDashaYears = '', nextDasha = '', nextDashaYear = '';
  for (let i = 0; i < dashaTimeline.length; i++) {
    if (dashaTimeline[i].planet === reading.currentDasha) {
      currentDashaYears = `${dashaTimeline[i].startYear}–${dashaTimeline[i].endYear}`;
      if (dashaTimeline[i+1]) { nextDasha = dashaTimeline[i+1].planet; nextDashaYear = String(dashaTimeline[i+1].startYear); }
      break;
    }
  }
  return {
    name: reading.name, dob: reading.dob, birthCity: reading.birthCity,
    gender: reading.gender, maritalStatus: (reading as FullReading & { maritalStatus?: string }).maritalStatus ?? 'single',
    employment: (reading as FullReading & { employment?: string }).employment ?? 'employed',
    concern: (reading as FullReading & { concern?: string }).concern ?? '',
    lagnaSign: reading.lagnaSign, moonSign: reading.moonSign, sunSign: reading.sunSign,
    moonNakshatraName: reading.moonNakshatraName, moonNakshatraPada: reading.moonNakshatraPada,
    nakshatraDeity: NAKSHATRA_DEITIES_LOCAL[reading.moonNakshatra] || 'the divine',
    currentDasha: reading.currentDasha || 'Unknown', currentAntardasha: reading.currentAntardasha || 'Unknown',
    currentDashaYears, nextDasha, nextDashaYear, currentAge,
    isManglik: reading.manglik?.isManglik ?? false,
    marsHouse: mars?.house ?? 0, marsSign: mars?.rashi ?? '',
    venusSign: venus?.rashi ?? '', venusHouse: venus?.house ?? 0,
    saturnSign: saturn?.rashi ?? '', saturnHouse: saturn?.house ?? 0,
    jupiterSign: jupiter?.rashi ?? '', jupiterHouse: jupiter?.house ?? 0,
    rahuSign: rahu?.rashi ?? '', rahuHouse: rahu?.house ?? 0,
    ketuSign: ketu?.rashi ?? '', ketuHouse: ketu?.house ?? 0,
    seventhHouseSign: VEDIC_RASHIS_LOCAL[(li+6)%12], seventhHouseLord: RASHI_LORDS_LOCAL[(li+6)%12],
    tenthHouseSign: VEDIC_RASHIS_LOCAL[(li+9)%12], tenthHouseLord: RASHI_LORDS_LOCAL[(li+9)%12],
    sixthHouseSign: VEDIC_RASHIS_LOCAL[(li+5)%12], eighthHouseSign: VEDIC_RASHIS_LOCAL[(li+7)%12],
    ninthHouseSign: VEDIC_RASHIS_LOCAL[(li+8)%12], twelfthHouseSign: VEDIC_RASHIS_LOCAL[(li+11)%12],
    lagnaBodyPart: BODY_MAP[reading.lagnaSign] || 'general vitality',
    planetsIn7: reading.planets.filter(p=>p.house===7).map(p=>p.name).join(', ') || 'None',
    planetsIn6: reading.planets.filter(p=>p.house===6).map(p=>p.name).join(', ') || 'None',
    atmakaraka: reading.atmakaraka?.planet ?? 'Sun',
    sadeSatiActive: reading.sadeSati?.isActive ?? false,
  };
}

function ConcernBanner({ concern }: { concern: string }) {
  if (!concern?.trim()) return null;
  return (
    <div className="mb-5 rounded-xl p-4 border" style={{ background: 'rgba(212,136,10,0.07)', borderColor: 'rgba(212,136,10,0.3)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: AMBER }}>📌 Your Question</p>
      <p className="text-sm font-medium italic" style={{ color: '#374151' }}>&ldquo;{concern}&rdquo;</p>
      <p className="text-[11px] mt-1.5" style={{ color: '#9CA3AF' }}>The AI reading below addresses this directly.</p>
    </div>
  );
}

function AISection({ sectionId, reading }: { sectionId: string; reading: FullReading }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const fetch_ = useCallback(async () => {
    if (fetched || loading) return;
    setLoading(true);
    try {
      const ctx = buildContext(reading);
      const res = await fetch('/api/personal-reading', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionId, context: ctx }),
      });
      if (res.ok) { const d = await res.json(); if (d.text) setText(d.text); }
    } catch { /* silent */ } finally { setLoading(false); setFetched(true); }
  }, [sectionId, reading, fetched, loading]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const concern = (reading as FullReading & { concern?: string }).concern ?? '';

  if (loading) return (
    <div>
      {sectionId === 'overview' && <ConcernBanner concern={concern} />}
      <ReadingSkeleton />
    </div>
  );
  if (text) return (
    <div>
      {sectionId === 'overview' && <ConcernBanner concern={concern} />}
      <PersonalText text={text} />
    </div>
  );
  if (fetched) return (
    <div className="text-center py-10 space-y-3">
      <p className="text-sm" style={{ color: '#6B7280' }}>Could not load reading right now.</p>
      <button onClick={() => setFetched(false)} className="text-xs px-4 py-2 rounded-full font-medium text-white" style={{ background: TEAL }}>Try Again</button>
    </div>
  );
  return (
    <div>
      {sectionId === 'overview' && <ConcernBanner concern={concern} />}
      <ReadingSkeleton />
    </div>
  );
}

function StatBadge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-3 border" style={{ background: accent ? 'rgba(26,107,107,0.06)' : '#FAFAF8', borderColor: accent ? 'rgba(26,107,107,0.2)' : '#E5E7EB' }}>
      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
      <p className="text-sm font-semibold leading-tight" style={{ color: accent ? TEAL : '#1F2937' }}>{value}</p>
    </div>
  );
}

const P_SYMBOLS: Record<string,string> = { Sun:'☀️',Moon:'🌙',Mars:'♂',Mercury:'☿',Jupiter:'♃',Venus:'♀',Saturn:'♄',Rahu:'☊',Ketu:'☋' };

export default function ReportCard({ t: _t, reading }: ReportCardProps) {
  const [tab, setTab] = useState<TabId>('overview');
  const birthYear = parseInt(reading.dob?.split('-')[0] || '1990', 10);
  const AI_TABS: TabId[] = ['overview','love','career','health','timeline','spiritual'];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="text-center pb-1">
        <h1 className="text-2xl sm:text-3xl font-display font-bold" style={{ color:'#1F2937' }}>
          {reading.name}&apos;s Cosmic Blueprint
        </h1>
        <p className="text-sm mt-1" style={{ color:'#6B7280' }}>Born {reading.dob} · {reading.birthCity}</p>
      </div>

      <NakshatraBanner reading={reading} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBadge label="Ascendant (Lagna)" value={reading.lagnaSign} accent />
        <StatBadge label="Moon Sign" value={reading.moonSign} accent />
        <StatBadge label="Birth Star (Nakshatra)" value={`${reading.moonNakshatraName} Pada ${reading.moonNakshatraPada}`} />
        <StatBadge label="Active Dasha Period" value={`${reading.currentDasha} › ${reading.currentAntardasha}`} />
        <StatBadge label="Western Sun Sign" value={reading.westernSunSign} />
        <StatBadge label="Vedic Sun" value={reading.sunSign} />
        <StatBadge label="Manglik Dosha" value={reading.manglik?.isManglik ? '🔴 Yes' : '🟢 No'} />
        <StatBadge label="Sade Sati" value={reading.sadeSati?.isActive ? '⚠️ Active now' : '✓ Not active'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl p-1 overflow-x-auto" style={{ background:'rgba(26,107,107,0.06)' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all"
            style={tab === id
              ? { background:`linear-gradient(135deg,${TEAL},${TEAL_L})`, color:'#fff', boxShadow:'0 2px 8px rgba(26,107,107,0.25)' }
              : { color:'#6B7280' }
            }>{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}
          className="rounded-2xl p-5 sm:p-6 border" style={{ background:'#FFFDF8', borderColor:'#E5E7EB', minHeight:'320px' }}>

          {AI_TABS.includes(tab) && <AISection sectionId={tab} reading={reading} />}

          {tab === 'charts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>🪐 Your Planetary Positions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs border-b" style={{ color:'#9CA3AF', borderColor:'#E5E7EB' }}>
                        {['Planet','Rashi','House','Nakshatra','Pada'].map(h => <th key={h} className="pb-2 font-medium pr-4">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {reading.planets.map(p => (
                        <tr key={p.name} className="border-b" style={{ borderColor:'#F3F4F6' }}>
                          <td className="py-2 pr-4 font-medium" style={{ color:'#1F2937' }}>{P_SYMBOLS[p.name] || '•'} {p.name}{p.retrograde ? ' ℞' : ''}</td>
                          <td className="py-2 pr-4" style={{ color:'#4B5563' }}>{p.rashi}</td>
                          <td className="py-2 pr-4" style={{ color:'#4B5563' }}>{p.house}</td>
                          <td className="py-2 pr-4" style={{ color:'#4B5563' }}>{p.nakshatra}</td>
                          <td className="py-2" style={{ color:'#4B5563' }}>{p.nakshatraPada}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Personal planet-in-house meanings */}
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>💡 What Your Planets Mean For You</h3>
                <div className="space-y-2">
                  {reading.planets.map(p => {
                    const meanings: Record<string,Record<number,string>> = {
                      Sun: {1:'Strong personality, leadership ability, robust health. You command respect naturally.',2:'Wealth through authority. Your speech is powerful.',3:'Courageous, competitive spirit, bold communication.',4:'Deep connection to homeland; tension with authority figures.',5:'Sharp intelligence, creative power, strong firstborn.',6:'Victory over enemies; government dealings favor you.',7:'Dominant in relationships; partners from notable backgrounds.',8:'Interest in the hidden, occult, and transformation.',9:'Dharmic nature, strong father influence, higher purpose.',10:'Natural career authority — leadership, fame, government.',11:'Gains through powerful connections.',12:'Foreign residence tendency, spiritual inclinations.'},
                      Moon: {1:'Emotionally expressive, caring, changeable moods, sensitive to environment.',2:'Wealth fluctuations; warm voice; deeply attached to family.',3:'Creative courage; emotionally driven communication.',4:'Domestic happiness, close bond with mother. Very strong placement.',5:'Emotionally intelligent, imaginative, intuitive mind.',6:'Emotional sensitivity to enemies and health; needs grounding.',7:'Nurturing spouse; deeply emotional partnerships.',8:'Intense emotional depth; psychic ability; life upheavals.',9:'Devotion, religious instinct, fortune tied to mother figure.',10:'Public-facing career; popularity; emotional investment in work.',11:'Fulfilled through friendships and community.',12:'Rich dream life, spiritual sensitivity, needs solitude to recharge.'},
                      Mars: {1:'Physical courage, athletic energy, assertive temperament (Manglik).',2:'Aggressive wealth-building; harsh speech in conflict (Manglik).',3:'Immense initiative and courage — you charge when others hesitate.',4:'Domestic intensity; property disputes possible (Manglik).',5:'Sharp competitive intelligence; driven to achieve.',6:'Excellent — you destroy enemies and disease with fighting spirit.',7:'Passionate, intense partnerships (Manglik) — strong chemistry.',8:'Transformative upheavals; surgical/accident awareness (Manglik).',9:'Warrior dharma; sometimes conflict with teachers or authority.',10:'Career in action-fields: military, engineering, surgery, real estate.',11:'Gains through courage and powerful friend circles.',12:'Foreign roots, spiritual warrior, hidden intensity (Manglik).'},
                      Mercury: {1:'Quick-witted, youthful energy, natural communicator.',2:'Wealthy through intellect; eloquent, persuasive speaker.',3:'Exceptional communication talent — writing, speaking, media.',4:'Intellectual home environment; educated, stimulating mother.',5:'Mathematical and analytical brilliance; sharp examiner.',6:'Analytical problem-solver; defeats opponents through logic.',7:'Intelligent spouse; successful in business partnerships.',8:'Research genius; drawn to psychology and hidden knowledge.',9:'Higher education, philosophy, long-distance communication.',10:'Career in IT, writing, teaching, accounting, or consulting.',11:'Gains through diverse intellectual networks.',12:'Foreign-language talent; spiritual intellectualism.'},
                      Jupiter: {1:'Wisdom radiates from you; healthy, optimistic, natural teacher.',2:'Excellent for family wealth — speech is inspiring.',3:'Wise communicator; siblings carry philosophical energy.',4:'Domestic happiness; property gains; wise, nurturing household.',5:'Very auspicious — brilliant children, high intelligence, merit.',6:'Wisdom defeats enemies; charitable nature wins over opposition.',7:'Wise, educated spouse; marriage is dharmic and lasting.',8:'Longevity; inheritance; deep spiritual knowledge.',9:'Supreme — dharmic life, guru blessings, fortune flows.',10:'Career in law, education, banking, or counseling.',11:'All desires fulfilled — this is the best placement for wealth.',12:'Foreign prosperity; spiritual liberation; moksha potential.'},
                      Venus: {1:'Naturally attractive, artistic, charming, lover of comfort.',2:'Wealth; beautiful speaking voice; family harmony.',3:'Artistic communication; creative, beauty-oriented siblings.',4:'Luxury vehicles, beautiful home, deep comfort in life.',5:'Romantic nature; artistic children; creative talent.',6:'Relationship friction possible; success in beauty industries.',7:'Very favorable — charming spouse, harmonious marriage.',8:'Hidden pleasures; inheritance through spouse or partner.',9:'Fortune through art, beauty, and meaningful travel.',10:'Career in arts, entertainment, fashion, or diplomacy.',11:'Gains through beauty and pleasure; loving friend circle.',12:'Foreign luxuries; spiritual devotion through beauty.'},
                      Saturn: {1:'Serious, disciplined personality; life lessons through hardship early.',2:'Delayed but steady wealth accumulation; careful speech.',3:'Perseverance in communication; courage earned not inherited.',4:'Property delays; eventual domestic stability through patience.',5:'Delayed children; serious, old-soul intelligence.',6:'Defeat chronic problems through endurance — strong placement.',7:'Delayed marriage; brings serious, committed spouse eventually.',8:'Longevity; endurance through crisis; chronic health awareness.',9:'Practical dharma; strict guru; slow-building philosophy.',10:'Slow but permanent career rise — government, labor, authority.',11:'Steady income; loyal elder friends; patient fulfillment.',12:'Spiritual discipline through isolation; eventual liberation.'},
                      Rahu: {1:'Unconventional personality; worldly ambition; foreign connections.',2:'Unusual wealth patterns; hypnotic speech.',3:'Bold media talent; breaks communication barriers.',4:'Restlessness at home; foreign property connections.',5:'Speculative intelligence; unconventional education path.',6:'Powerful — victory over hidden enemies; foreign service.',7:'Karmic, intense marriage; foreign or unconventional spouse.',8:'Occult mastery; sudden transformations.',9:'Unconventional spirituality; foreign guru.',10:'Worldly fame through technology or unconventional path.',11:'Large gains; powerful networks; desire fulfilled.',12:'Foreign residence; vivid dreams; spiritual confusion.'},
                      Ketu: {1:'Spiritual personality; past-life wisdom visible from birth.',2:'Detachment from material accumulation; unique way of speaking.',3:'Psychic courage; intuitive communication.',4:'Emotional detachment; spiritual home environment.',5:'Past-life spiritual merit; deeply intuitive intelligence.',6:'Victory through spiritual means; alternative healing gifts.',7:'Karmic, spiritually charged relationships.',8:'Past-life occult knowledge; deep transformation.',9:'Unconventional dharma path; spiritual wisdom.',10:'Research, spirituality, detachment from worldly ambition.',11:'Spiritual gains; eventual detachment from desire.',12:'Excellent for liberation — deep meditation, past-life attainment.'},
                    };
                    const meaning = meanings[p.name]?.[p.house] || `${p.name} in House ${p.house} brings its unique energy to this life domain.`;
                    return (
                      <div key={p.name} className="rounded-xl p-3 border" style={{ background:'#FAFAF8', borderColor:'#E5E7EB' }}>
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0">{P_SYMBOLS[p.name]}</span>
                          <div>
                            <p className="text-xs font-bold mb-0.5" style={{ color: TEAL }}>
                              {p.name}{p.retrograde ? ' ℞' : ''} in {p.rashi} · House {p.house}
                              {p.retrograde && <span className="ml-1 text-[10px] font-normal" style={{ color: AMBER }}>(retrograde)</span>}
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{meaning}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>🪷 Panchanga at Birth</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[['Tithi',reading.panchanga.tithi.name],['Nakshatra',reading.panchanga.nakshatra],['Yoga',reading.panchanga.yoga],
                    ['Karana',reading.panchanga.karana],['Day (Vara)',reading.panchanga.vara],['Atmakaraka',reading.atmakaraka.planet]
                  ].map(([k,v]) => <StatBadge key={k} label={k} value={v} />)}
                </div>
              </div>

              {/* Charts — constrained size */}
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>📐 Vedic Chart</h3>
                <div className="max-w-sm mx-auto">
                  <VedicChart
                    planets={reading.planets.map(p=>({ name:p.name, rashi:p.rashi.split(' (')[1]?.replace(')','') || p.rashi, house:p.house, retrograde:p.retrograde }))}
                    ascendant={reading.lagnaSign.split(' (')[1]?.replace(')','') || reading.lagnaSign}
                    chartType={reading.chartType}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>⭕ Western Chart</h3>
                <div className="max-w-sm mx-auto">
                  <WesternChart
                    sunSign={reading.westernSunSign}
                    moonSign={reading.moonSign.split(' (')[1]?.replace(')','') || reading.moonSign}
                    risingSign={reading.lagnaSign.split(' (')[1]?.replace(')','') || reading.lagnaSign}
                    planets={reading.planets.map(p=>({ name:p.name, degree:p.siderealLongitude, sign:p.rashi.split(' (')[1]?.replace(')','') || 'Aries' }))}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'story' && (
            <div className="-m-5 sm:-m-6 rounded-2xl overflow-hidden">
              <StoryAnimator name={reading.name} storyText={reading.storyNarrative} storyEvents={reading.storyEvents}
                lagnaSign={reading.lagnaSign} moonSign={reading.moonSign} sunSign={reading.sunSign}
                birthYear={birthYear} planets={reading.planets} currentDasha={reading.currentDasha} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dasha timeline bar */}
      {reading.dashaTimeline?.length > 0 && (
        <div className="rounded-2xl p-4 border space-y-3" style={{ background:'#FFFDF8', borderColor:'#E5E7EB' }}>
          <h3 className="text-sm font-bold" style={{ color:TEAL }}>📅 Your Life&apos;s Planetary Timeline</h3>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {reading.dashaTimeline.map((d) => {
              const isCurrent = d.planet === reading.currentDasha;
              const span = d.endYear - d.startYear;
              return (
                <div key={d.planet + d.startYear}
                  className="flex-shrink-0 rounded-lg px-2 py-1.5 text-center border"
                  style={{ minWidth:`${Math.max(span*3,48)}px`,
                    background: isCurrent ? `linear-gradient(135deg,${TEAL},${TEAL_L})` : 'rgba(26,107,107,0.05)',
                    borderColor: isCurrent ? TEAL : 'rgba(26,107,107,0.15)',
                    boxShadow: isCurrent ? '0 2px 8px rgba(26,107,107,0.25)' : 'none',
                  }}>
                  <p className="text-[10px] font-bold" style={{ color:isCurrent?'#fff':TEAL }}>{d.planet}</p>
                  <p className="text-[9px]" style={{ color:isCurrent?'rgba(255,255,255,0.7)':'#9CA3AF' }}>{d.startYear}–{d.endYear}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs" style={{ color:'#6B7280' }}>
            Currently in <strong style={{ color:TEAL }}>{reading.currentDasha} Mahadasha</strong>
            {reading.currentAntardasha ? ` · ${reading.currentAntardasha} Antardasha` : ''}.
          </p>
        </div>
      )}

      {/* Tradition deep-dive cards */}
      <div className="space-y-3">
        {/* Egyptian Decan */}
        <div className="rounded-2xl p-5 border" style={{ background: '#FFFDF8', borderColor: '#E5E7EB' }}>
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">𓂀</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>Egyptian Decan</p>
              <p className="text-base font-bold" style={{ color: '#1F2937' }}>{reading.egyptianDecan?.sign} — Decan {reading.egyptianDecan?.decanNumber}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Ruled by {reading.egyptianDecan?.ruler} · Deity: {reading.egyptianDecan?.deity}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            You are born in the <strong>{reading.egyptianDecan?.decanNumber === 1 ? 'first' : reading.egyptianDecan?.decanNumber === 2 ? 'second' : 'third'} decan of {reading.egyptianDecan?.sign}</strong>, ruled by <strong>{reading.egyptianDecan?.ruler}</strong> in the ancient Chaldean system. 
            The Egyptians called this your &ldquo;star clock&rdquo; — the group of stars rising on your birth horizon. Your decan ruler {reading.egyptianDecan?.ruler} gives you: <em>{reading.egyptianDecan?.traits}</em>. 
            The presiding deity <strong>{reading.egyptianDecan?.deity}</strong> governs the cosmic energy of your life chapter.
            In the Temple of Hathor at Dendera, this decan marks you as one who carries {
              reading.egyptianDecan?.ruler === 'Mars' ? 'warrior courage and pioneering fire' :
              reading.egyptianDecan?.ruler === 'Sun' ? 'solar authority and creative leadership' :
              reading.egyptianDecan?.ruler === 'Venus' ? 'the gift of beauty, harmony, and artistic magnetism' :
              reading.egyptianDecan?.ruler === 'Mercury' ? 'the sacred scribe\'s intelligence and communicative power' :
              reading.egyptianDecan?.ruler === 'Moon' ? 'deep intuition and the healer\'s emotional wisdom' :
              reading.egyptianDecan?.ruler === 'Saturn' ? 'the builder\'s patience and the architect of lasting legacy' :
              'Jupiter\'s expansive wisdom and philosophical generosity'
            }.
          </p>
        </div>

        {/* Mayan Tzolkin */}
        <div className="rounded-2xl p-5 border" style={{ background: '#FFFDF8', borderColor: '#E5E7EB' }}>
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">☀️</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>Mayan Tzolkin</p>
              <p className="text-base font-bold" style={{ color: '#1F2937' }}>{reading.mayanTzolkin?.daySign}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Galactic Tone {reading.mayanTzolkin?.tone} of 13</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-2" style={{ color: '#374151' }}>
            {reading.mayanTzolkin?.meaning}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            Your Galactic Tone is <strong>{reading.mayanTzolkin?.tone}</strong> — {
              reading.mayanTzolkin?.tone === 1 ? 'the tone of Unity. You initiate new cycles and magnetically attract what you need. Your power is in new beginnings.' :
              reading.mayanTzolkin?.tone === 2 ? 'the tone of Duality. You hold opposites in balance and create stability from contradiction. Your power is in bridging divides.' :
              reading.mayanTzolkin?.tone === 3 ? 'the tone of Rhythm. You activate dormant potential in others. Your power is in catalyzing movement.' :
              reading.mayanTzolkin?.tone === 4 ? 'the tone of Form. You give shape to abstract ideas and build lasting structures. Your power is in definition.' :
              reading.mayanTzolkin?.tone === 5 ? 'the tone of Command. You are a natural center of authority who empowers others. Your power is in radiating stability.' :
              reading.mayanTzolkin?.tone === 6 ? 'the tone of Flow. You bring organic balance and equal exchange. Your power is in harmonizing systems.' :
              reading.mayanTzolkin?.tone === 7 ? 'the tone of Resonance. You attune to frequencies others cannot perceive. Your power is in alignment.' :
              reading.mayanTzolkin?.tone === 8 ? 'the tone of Harmony. You lead through integrity and example. Your power is in modeling wholeness.' :
              reading.mayanTzolkin?.tone === 9 ? 'the tone of Intention. Your intentions take time but carry immense weight. Your power is in completion.' :
              reading.mayanTzolkin?.tone === 10 ? 'the tone of Manifestation. You take abstract vision and make it real. Your power is in production.' :
              reading.mayanTzolkin?.tone === 11 ? 'the tone of Liberation. You dissolve outdated structures. Your power is in releasing what no longer serves.' :
              reading.mayanTzolkin?.tone === 12 ? 'the tone of Cooperation. You build bridges between worlds. Your power is in sharing knowledge.' :
              'the tone of Transcendence — the final tone. You carry the full cosmic cycle. Your power is in surpassing all limitations.'
            }
          </p>
        </div>

        {/* Nakshatra Hall of Fame */}
        <div className="rounded-2xl p-5 border" style={{ background: '#FFFDF8', borderColor: '#E5E7EB' }}>
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{NAKSHATRA_SYMBOL[reading.moonNakshatraName] || '⭐'}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>{reading.moonNakshatraName} — Kindred Souls</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Famous people born under your nakshatra</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {(NAKSHATRA_FAMOUS[reading.moonNakshatraName] || '').split(' · ').map(name => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TEAL }} />
                <p className="text-sm" style={{ color: '#374151' }}>{name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 italic" style={{ color: '#9CA3AF' }}>
            You share the {reading.moonNakshatraName} cosmic frequency — {NAKSHATRA_QUALITY[reading.moonNakshatraName] || 'ancient wisdom and unique potential'}.
          </p>
        </div>
      </div>

      <div className="text-center pb-6">
        <p className="text-xs italic" style={{ color:'#9CA3AF' }}>
          ⚠️ For entertainment and information only. Consult a qualified astrologer for personal guidance.
        </p>
      </div>
    </motion.div>
  );
}
