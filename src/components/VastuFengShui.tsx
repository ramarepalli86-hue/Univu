'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CityAutocomplete from './CityAutocomplete';

const TEAL   = '#1A6B6B';
const AMBER  = '#D4880A';

// ── Minimal context for the API (no birth chart required) ────────────────────
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

// ── Climate & sun/wind helpers ─────────────────────────────────────────────────

function climateProfile(lat: number, cityName: string): string {
  const absLat = Math.abs(lat);
  const hem = lat >= 0 ? 'Northern Hemisphere' : 'Southern Hemisphere';
  let zone = '';
  if (absLat < 10)       zone = 'equatorial — consistently hot, very high humidity year-round, heavy rainfall, no distinct winter';
  else if (absLat < 23)  zone = 'tropical — hot summers, warm winters, monsoon or dry season pattern, intense solar radiation';
  else if (absLat < 35)  zone = 'subtropical — hot dry summers, mild winters, occasional frost, high solar gain in summer';
  else if (absLat < 50)  zone = 'temperate — four distinct seasons, cold winters (often below 5°C), warm summers, moderate humidity';
  else if (absLat < 60)  zone = 'cool temperate — long dark cold winters (can drop to −15°C), short summers, significant seasonal depression risk, low solar angle in winter';
  else                   zone = 'subarctic/polar — extreme winters, minimal daylight for months, very low solar angle year-round, severe cold, insulation is critical';
  return `${cityName} is in the ${hem}, ${zone}.`;
}

function sunWindProfile(lat: number, lng: number): string {
  const hem = lat >= 0 ? 'N' : 'S';
  const sunArc = hem === 'N'
    ? `Sun rises in the East, tracks across the SOUTHERN sky, and sets in the West. The South-facing wall gets maximum sunlight year-round.`
    : `Sun rises in the East, tracks across the NORTHERN sky, and sets in the West. The North-facing wall gets maximum sunlight year-round.`;
  let wind = '';
  if (Math.abs(lat) < 10) wind = 'Prevailing winds: equatorial doldrums — variable, often calm or from the East (Trade winds).';
  else if (Math.abs(lat) < 30) wind = `Prevailing winds: ${hem === 'N' ? 'NE Trade Winds' : 'SE Trade Winds'} — steady flow from the ${hem === 'N' ? 'Northeast' : 'Southeast'}.`;
  else if (Math.abs(lat) < 60) wind = `Prevailing winds: ${hem === 'N' ? 'Westerlies — winds arrive predominantly from the West/Southwest' : 'Westerlies — winds arrive predominantly from the West/Northwest'}.`;
  else wind = 'Prevailing winds: polar easterlies — cold winds from the East/NE.';
  return `${sunArc} ${wind}`;
}

// ── Form state ─────────────────────────────────────────────────────────────────

interface VastuFormState {
  houseCity: string;
  houseLat: number;
  houseLng: number;
  personEnabled: boolean;
  personDob: string;
  personTime: string;
  personBirthCity: string;
  personBirthLat: number;
  personBirthLng: number;
  partnerEnabled: boolean;
  partnerDob: string;
  partnerTime: string;
  partnerBirthCity: string;
  partnerBirthLat: number;
  partnerBirthLng: number;
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
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Analysing your space…</span>
      </div>
      {[88,65,80,55,72,90,60,75].map((w,i) => (
        <div key={i} className="h-3 rounded-full" style={{ width: `${w}%`, background: '#F3F4F6' }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vastu & Feng Shui — standalone top-level component (no birth chart required)
// ═══════════════════════════════════════════════════════════════════════════════

export default function VastuFengShui() {
  const [form, setForm] = useState<VastuFormState>({
    houseCity: '',
    houseLat: 0,
    houseLng: 0,
    personEnabled: false,
    personDob: '',
    personTime: '',
    personBirthCity: '',
    personBirthLat: 0,
    personBirthLng: 0,
    partnerEnabled: false,
    partnerDob: '',
    partnerTime: '',
    partnerBirthCity: '',
    partnerBirthLat: 0,
    partnerBirthLng: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const upd = <K extends keyof VastuFormState>(k: K, v: VastuFormState[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  async function handleGenerate() {
    if (!form.houseCity || form.houseLat === 0) {
      setError('Please select the city/location of the house first.');
      return;
    }
    setError('');
    setLoading(true);
    setText('');
    try {
      const ctx = buildMinimalContext();
      const vastuCtx = {
        ...ctx,
        currentCity: form.houseCity,
        currentLat: form.houseLat,
        currentLng: form.houseLng,
        vastuHouseCity: form.houseCity,
        vastuHouseLat: form.houseLat,
        vastuHouseLng: form.houseLng,
        vastuClimate: climateProfile(form.houseLat, form.houseCity),
        vastuSunWind: sunWindProfile(form.houseLat, form.houseLng),
        vastuPersonDob: form.personEnabled ? form.personDob : '',
        vastuPersonTime: form.personEnabled ? form.personTime : '',
        vastuPersonBirthCity: form.personEnabled ? form.personBirthCity : '',
        vastuPartnerDob: form.partnerEnabled ? form.partnerDob : '',
        vastuPartnerTime: form.partnerEnabled ? form.partnerTime : '',
        vastuPartnerBirthCity: form.partnerEnabled ? form.partnerBirthCity : '',
        vastuMode: !form.personEnabled ? 'place-only' : form.partnerEnabled ? 'couple' : 'person',
      };
      const res = await fetch('/api/personal-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'vastu', context: vastuCtx }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.text) {
          setText(d.text.replace(/\bthe Seeker\b/g, '').replace(/\bThe Seeker\b/g, ''));
          setSubmitted(true);
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
      } else setError('Could not generate Vastu reading. Try again.');
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  }

  const inpCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all';
  const inpSt: React.CSSProperties = { border: '1.5px solid #DDD8CE', background: '#fff', color: '#1E1B17' };
  const focusSt: React.CSSProperties = { borderColor: TEAL, boxShadow: '0 0 0 3px rgba(26,107,107,0.12)' };

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
          🏠 Vastu &amp; Feng Shui Compass
        </h2>
        <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>
          Three traditions, one space — Vedic Vastu Shastra + Chinese Feng Shui + modern environmental science.
          <br />Location-aware, adjusted for your city&apos;s sun path, winds, and climate. No birth chart required!
        </p>
      </div>

      {/* Mode selector */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(26,107,107,0.05)', border: '1px solid rgba(26,107,107,0.15)' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEAL }}>What kind of Vastu reading?</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '🏙️ Place Only', sub: 'Just the house location', val: 'place' },
            { label: '🧘 For Me', sub: 'My DOB + house location', val: 'person' },
            { label: '👫 For Us', sub: 'Both partners + house', val: 'couple' },
          ].map(opt => {
            const active = opt.val === 'place'
              ? !form.personEnabled
              : opt.val === 'person'
              ? form.personEnabled && !form.partnerEnabled
              : form.personEnabled && form.partnerEnabled;
            return (
              <button key={opt.val} type="button"
                onClick={() => {
                  if (opt.val === 'place')  { upd('personEnabled', false); upd('partnerEnabled', false); }
                  if (opt.val === 'person') { upd('personEnabled', true);  upd('partnerEnabled', false); }
                  if (opt.val === 'couple') { upd('personEnabled', true);  upd('partnerEnabled', true);  }
                }}
                className="rounded-xl p-2.5 text-left border transition-all"
                style={active
                  ? { background: 'linear-gradient(135deg,rgba(26,107,107,0.12),rgba(212,136,10,0.08))', border: `1.5px solid ${TEAL}` }
                  : { background: '#FAFAF8', border: '1.5px solid #E5E7EB' }}>
                <div className="text-xs font-bold" style={{ color: active ? TEAL : '#4A4540' }}>{opt.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{opt.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MANDATORY: House city ── */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: TEAL }}>
          🏠 City / Location of the House <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <CityAutocomplete
          value={form.houseCity}
          onChange={(val, entry) => {
            upd('houseCity', val);
            if (entry) { upd('houseLat', entry.lat); upd('houseLng', entry.lng); }
          }}
          placeholder="Type the city where the home is or will be built…"
        />
        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
          🔒 Privacy-first: We don&apos;t use browser location. Type to search — powered by OpenStreetMap.
        </p>
        {form.houseLat !== 0 && (
          <p className="text-[10px]" style={{ color: TEAL }}>
            🌍 {climateProfile(form.houseLat, form.houseCity)}
          </p>
        )}
        {form.houseLat !== 0 && (
          <p className="text-[10px]" style={{ color: '#6B7280' }}>
            ☀️ {sunWindProfile(form.houseLat, form.houseLng)}
          </p>
        )}
      </div>

      {/* ── OPTIONAL: Person details ── */}
      {form.personEnabled && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(26,107,107,0.04)', border: '1px solid rgba(26,107,107,0.12)' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEAL }}>👤 Your Details (optional — improves personalisation)</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4A4540' }}>Date of Birth</label>
              <input type="date" value={form.personDob} onChange={e => upd('personDob', e.target.value)}
                className={inpCls} style={inpSt}
                onFocus={e => Object.assign(e.target.style, focusSt)}
                onBlur={e => { e.target.style.borderColor='#DDD8CE'; e.target.style.boxShadow='none'; }} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4A4540' }}>Time of Birth</label>
              <input type="time" value={form.personTime} onChange={e => upd('personTime', e.target.value)}
                className={inpCls} style={inpSt}
                onFocus={e => Object.assign(e.target.style, focusSt)}
                onBlur={e => { e.target.style.borderColor='#DDD8CE'; e.target.style.boxShadow='none'; }} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4A4540' }}>Birth City</label>
              <CityAutocomplete
                value={form.personBirthCity}
                onChange={(val, entry) => {
                  upd('personBirthCity', val);
                  if (entry) { upd('personBirthLat', entry.lat); upd('personBirthLng', entry.lng); }
                }}
                placeholder="Birth city…"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── OPTIONAL: Partner details ── */}
      {form.partnerEnabled && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(212,136,10,0.05)', border: '1px solid rgba(212,136,10,0.18)' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: AMBER }}>💑 Partner&apos;s Details (optional)</p>
          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>For couples buying or building a home together.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4A4540' }}>Date of Birth</label>
              <input type="date" value={form.partnerDob} onChange={e => upd('partnerDob', e.target.value)}
                className={inpCls} style={inpSt}
                onFocus={e => Object.assign(e.target.style, focusSt)}
                onBlur={e => { e.target.style.borderColor='#DDD8CE'; e.target.style.boxShadow='none'; }} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4A4540' }}>Time of Birth</label>
              <input type="time" value={form.partnerTime} onChange={e => upd('partnerTime', e.target.value)}
                className={inpCls} style={inpSt}
                onFocus={e => Object.assign(e.target.style, focusSt)}
                onBlur={e => { e.target.style.borderColor='#DDD8CE'; e.target.style.boxShadow='none'; }} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4A4540' }}>Birth City</label>
              <CityAutocomplete
                value={form.partnerBirthCity}
                onChange={(val, entry) => {
                  upd('partnerBirthCity', val);
                  if (entry) { upd('partnerBirthLat', entry.lat); upd('partnerBirthLng', entry.lng); }
                }}
                placeholder="Partner's birth city…"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}

      {/* Generate button */}
      {!submitted && (
        <button onClick={handleGenerate} disabled={loading || !form.houseCity}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg,${TEAL} 0%,#1E8080 40%,${AMBER} 100%)`, color: '#fff', boxShadow: '0 4px 20px rgba(26,107,107,0.28)' }}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing your space…</>
            : '🏠 Generate Vastu & Feng Shui Reading'}
        </button>
      )}

      {/* Result */}
      {text && (
        <div ref={resultRef} className="space-y-4 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEAL }}>
              🏠 Vastu &amp; Feng Shui · {form.houseCity}
            </p>
            <button onClick={() => { setText(''); setSubmitted(false); }}
              className="text-[10px] px-3 py-1 rounded-full border font-medium"
              style={{ color: TEAL, borderColor: 'rgba(26,107,107,0.3)' }}>
              ← New Reading
            </button>
          </div>
          <PersonalText text={text} />
          <p className="text-xs mt-3 pt-3 border-t text-center" style={{ color: '#9CA3AF', borderColor: 'rgba(0,0,0,0.07)' }}>
            For entertainment &amp; information only · Not professional architectural advice
          </p>
        </div>
      )}

      {loading && !text && (
        <div className="pt-2">
          <ReadingSkeleton />
        </div>
      )}
    </div>
  );
}
