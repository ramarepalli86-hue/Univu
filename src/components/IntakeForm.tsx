'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IoSparkles, IoLocate } from 'react-icons/io5';
import LanguageSelector from './LanguageSelector';
import CityAutocomplete from './CityAutocomplete';
import { Locale } from '@/i18n';
import { CityEntry } from '@/lib/cities';

export interface IntakeFormData {
  name: string;
  dob: string;
  timeOfBirth: string;
  birthCity: string;
  birthLat: number;
  birthLng: number;
  gender: 'male' | 'female' | 'other';
  currentCity: string;
  currentLat: number;
  currentLng: number;
  chartType: 'north' | 'south';
  tradition: 'vedic' | 'western' | 'chinese' | 'egyptian' | 'mayan' | 'all';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  employment: 'employed' | 'self-employed' | 'student' | 'unemployed' | 'retired';
  concern: string;
  consent: boolean;
  language: Locale;
}

interface IntakeFormProps {
  t: Record<string, string>;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onSubmit: (data: IntakeFormData) => void;
  loading?: boolean;
}

const TEAL = '#1A6B6B';
const TEAL_L = '#2A8A8A';
const AMBER = '#D4880A';
const TEXT = '#1E1B17';
const TEXT_MID = '#4A4540';
const TEXT_MUTED = '#7A7268';
const LABEL_C = '#1A4A4A';
const BG_WHITE = '#FFFFFF';
const BORDER = '#DDD8CE';
const TEAL_BG = 'rgba(26,107,107,0.07)';
const TEAL_BR = 'rgba(26,107,107,0.22)';
const AMBER_BG = 'rgba(212,136,10,0.08)';

const inputBase = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 appearance-none';
const inputSt = { background: BG_WHITE, border: `1.5px solid ${BORDER}`, color: TEXT } as React.CSSProperties;
const focusSt = { borderColor: TEAL, boxShadow: '0 0 0 3px rgba(26,107,107,0.12)' } as React.CSSProperties;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function daysInMonth(m: number, y: number) { if (!m || !y) return 31; return new Date(y, m, 0).getDate(); }
function p2(n: number | string) { return String(n).padStart(2, '0'); }

function Sel({ val, onChange, req, children, grow = '1' }: {
  val: string | number; onChange: (v: string) => void; req?: boolean;
  children: React.ReactNode; grow?: string;
}) {
  const [f, setF] = useState(false);
  return (
    <div className="relative min-w-0" style={{ flex: grow }}>
      <select value={val} onChange={e => onChange(e.target.value)} required={req}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        className={`${inputBase} cursor-pointer pr-8`}
        style={{ ...inputSt, ...(f ? focusSt : {}) }}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: TEAL }}>▾</span>
    </div>
  );
}

function DOBPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cy = new Date().getFullYear();
  // Parse existing value for initial state
  const parsed = value ? value.split('-').map(Number) : [0, 0, 0];
  // Use internal state so partial selections (day without year, etc.) are preserved
  const [selYr, setSelYr] = useState(parsed[0] || 0);
  const [selMo, setSelMo] = useState(parsed[1] || 0);
  const [selDy, setSelDy] = useState(parsed[2] || 0);

  const maxD = daysInMonth(selMo, selYr);
  const years = Array.from({ length: cy - 1899 }, (_, i) => cy - i);

  function commit(y: number, m: number, d: number) {
    if (y && m && d) {
      const safeD = Math.min(d, daysInMonth(m, y));
      onChange(`${y}-${p2(m)}-${p2(safeD)}`);
    }
    // Do NOT call onChange('') for partial — just keep internal state
  }

  function onDay(v: string)  { const d = Number(v); setSelDy(d);  commit(selYr, selMo, d); }
  function onMonth(v: string){ const m = Number(v); setSelMo(m);  commit(selYr, m, selDy); }
  function onYear(v: string) { const y = Number(v); setSelYr(y);  commit(y, selMo, selDy); }

  return (
    <div className="flex gap-2">
      <Sel val={selDy || ''} onChange={onDay} req grow="1">
        <option value="">Day</option>
        {Array.from({ length: maxD }, (_, i) => i + 1).map(d => <option key={d} value={d}>{p2(d)}</option>)}
      </Sel>
      <Sel val={selMo || ''} onChange={onMonth} req grow="1.6">
        <option value="">Month</option>
        {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
      </Sel>
      <Sel val={selYr || ''} onChange={onYear} req grow="1.4">
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </Sel>
    </div>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value ? value.split(':').map(Number) : [-1, -1];
  function emit(hh: number, mm: number) { if (hh >= 0 && mm >= 0) onChange(`${p2(hh)}:${p2(mm)}`); else onChange(''); }
  return (
    <div className="flex gap-2">
      <Sel val={h >= 0 ? h : ''} onChange={v => emit(Number(v), m >= 0 ? m : 0)} grow="1.2">
        <option value="">Hour</option>
        {Array.from({ length: 24 }, (_, i) => i).map(hh => (
          <option key={hh} value={hh}>{p2(hh)} ({hh === 0 ? '12 AM' : hh < 12 ? `${hh} AM` : hh === 12 ? '12 PM' : `${hh-12} PM`})</option>
        ))}
      </Sel>
      <Sel val={m >= 0 ? m : ''} onChange={v => emit(h >= 0 ? h : 0, Number(v))} grow="1">
        <option value="">Min</option>
        {Array.from({ length: 60 }, (_, i) => i).map(mm => <option key={mm} value={mm}>{p2(mm)}</option>)}
      </Sel>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="flex-1 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-150 border"
      style={active
        ? { background: `linear-gradient(135deg,${TEAL_BG},${AMBER_BG})`, border: `1.5px solid ${TEAL}`, color: TEAL, fontWeight: 600 }
        : { background: BG_WHITE, border: `1.5px solid ${BORDER}`, color: TEXT_MID }}>
      {children}
    </button>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: LABEL_C }}>{children}</label>;
}

const TRADITIONS = [
  { v: 'all'      as const, icon: '🌍', name: 'All Systems',  desc: 'Vedic + Western + Chinese + Egyptian' },
  { v: 'vedic'    as const, icon: '🕉️', name: 'Vedic',        desc: 'Jyotish, Nakshatras, Dashas' },
  { v: 'western'  as const, icon: '♈', name: 'Western',       desc: 'Tropical zodiac & houses' },
  { v: 'chinese'  as const, icon: '☯️', name: 'Chinese',       desc: 'Zodiac animal, elements' },
  { v: 'egyptian' as const, icon: '𓂀', name: 'Egyptian',      desc: 'Decans, gods of hour' },
  { v: 'mayan'    as const, icon: '☀️', name: 'Mayan',         desc: 'Tzolkin, day signs' },
];

export default function IntakeForm({ t, locale, onLocaleChange, onSubmit, loading }: IntakeFormProps) {
  const [form, setForm] = useState<IntakeFormData>({
    name: '', dob: '', timeOfBirth: '',
    birthCity: '', birthLat: 0, birthLng: 0,
    gender: 'male',
    currentCity: '', currentLat: 0, currentLng: 0,
    chartType: 'north', tradition: 'all',
    maritalStatus: 'single', employment: 'employed',
    concern: '', consent: false, language: locale,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const upd = useCallback((f: keyof IntakeFormData, v: string | boolean | number) =>
    setForm(p => ({ ...p, [f]: v })), []);

  function onBirth(val: string, e?: CityEntry) {
    if (e) setForm(p => ({ ...p, birthCity: val, birthLat: e.lat, birthLng: e.lng }));
    else upd('birthCity', val);
  }
  function onCurrent(val: string, e?: CityEntry) {
    if (e) setForm(p => ({ ...p, currentCity: val, currentLat: e.lat, currentLng: e.lng }));
    else upd('currentCity', val);
  }

  function detectGPS() {
    if (!navigator.geolocation) { setGpsError('Geolocation not supported'); return; }
    setGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
        const d = await r.json();
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
        const state = d.address?.state || '';
        const country = d.address?.country || '';
        const label = [city, state, country].filter(Boolean).join(', ');
        // Store both display label AND lat/lng via the CityEntry
        setForm(p => ({
          ...p,
          currentCity: label,
          currentLat: lat,
          currentLng: lng,
        }));
      } catch {
        setForm(p => ({
          ...p,
          currentCity: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          currentLat: lat,
          currentLng: lng,
        }));
      }
      setGpsLoading(false);
    }, err => {
      setGpsError(err.code === 1 ? 'Location permission denied' : 'Could not detect location');
      setGpsLoading(false);
    }, { timeout: 10000 });
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (!form.consent) return; onSubmit({ ...form, language: locale }); }

  const age = (() => {
    if (!form.dob) return null;
    const b = new Date(form.dob), now = new Date();
    let a = now.getFullYear() - b.getFullYear();
    if (now.getMonth() - b.getMonth() < 0 || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
    return a;
  })();

  const showVedicStyle = form.tradition === 'vedic' || form.tradition === 'all';

  return (
    <motion.form onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
      style={{ background: BG_WHITE, boxShadow: '0 8px 48px rgba(26,107,107,0.10), 0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}` }}>

      {/* Rainbow top stripe */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${TEAL}, ${AMBER}, ${TEAL_L})` }} />

      <div className="p-5 sm:p-7 space-y-6">

        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Cinzel, Georgia, serif', color: TEAL }}>Your Cosmic Blueprint</h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>Fill in your details for a personalised reading</p>
          </div>
          <LanguageSelector current={locale} onChange={onLocaleChange} />
        </div>

        {/* Tradition */}
        <div>
          <Lbl>Astrology Tradition</Lbl>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRADITIONS.map(tr => (
              <button key={tr.v} type="button" onClick={() => upd('tradition', tr.v)}
                className="rounded-xl p-2.5 text-left transition-all duration-150 border"
                style={form.tradition === tr.v
                  ? { background: `linear-gradient(135deg,${TEAL_BG},${AMBER_BG})`, border: `1.5px solid ${TEAL}` }
                  : { background: '#FAFAF8', border: `1.5px solid ${BORDER}` }}>
                <div className="text-sm font-semibold" style={{ color: form.tradition === tr.v ? TEAL : TEXT_MID }}>{tr.icon} {tr.name}</div>
                <div className="text-[10px] mt-0.5 leading-tight" style={{ color: TEXT_MUTED }}>{tr.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <Lbl>Full Name</Lbl>
          <input type="text" required value={form.name} onChange={e => upd('name', e.target.value)}
            className={inputBase} style={inputSt} placeholder="e.g. Arjun Mehta"
            onFocus={e => Object.assign(e.target.style, focusSt)}
            onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }} />
        </div>

        {/* DOB + Time */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Lbl>Date of Birth</Lbl>
            <DOBPicker value={form.dob} onChange={v => upd('dob', v)} />
            {form.dob && age !== null && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: AMBER }}>
                📅 {new Date(form.dob + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} · Age {age}
              </p>
            )}
            {age !== null && age < 21 && <p className="text-xs mt-1" style={{ color: TEAL }}>✨ Guidance tailored for younger seekers</p>}
          </div>
          <div>
            <Lbl>Time of Birth <span style={{ color: TEXT_MUTED, textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>(optional)</span></Lbl>
            <TimePicker value={form.timeOfBirth} onChange={v => upd('timeOfBirth', v)} />
            <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>Improves rising sign accuracy</p>
          </div>
        </div>

        {/* Vedic chart style */}
        {showVedicStyle && (
          <div>
            <Lbl>Vedic Chart Style</Lbl>
            <div className="flex gap-2">
              <Chip active={form.chartType === 'north'} onClick={() => upd('chartType', 'north')}>🔷 North Indian</Chip>
              <Chip active={form.chartType === 'south'} onClick={() => upd('chartType', 'south')}>🔶 South Indian</Chip>
            </div>
          </div>
        )}

        {/* Birth place */}
        <div>
          <Lbl>Place of Birth</Lbl>
          <CityAutocomplete value={form.birthCity} onChange={onBirth} placeholder="Start typing a city…" />
        </div>

        {/* Gender */}
        <div>
          <Lbl>Gender</Lbl>
          <div className="flex gap-2">
            <Chip active={form.gender === 'male'}   onClick={() => upd('gender', 'male')}>♂ Male</Chip>
            <Chip active={form.gender === 'female'} onClick={() => upd('gender', 'female')}>♀ Female</Chip>
            <Chip active={form.gender === 'other'}  onClick={() => upd('gender', 'other')}>⚥ Other</Chip>
          </div>
        </div>

        {/* Marital + Employment */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Lbl>Marital Status</Lbl>
            <div className="grid grid-cols-2 gap-2">
              {(['single','married','divorced','widowed'] as const).map(ms => (
                <Chip key={ms} active={form.maritalStatus === ms} onClick={() => upd('maritalStatus', ms)}>
                  {ms.charAt(0).toUpperCase() + ms.slice(1)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Lbl>Employment</Lbl>
            <div className="grid grid-cols-2 gap-2">
              {(['employed','self-employed','student','unemployed','retired'] as const).map(emp => (
                <Chip key={emp} active={form.employment === emp} onClick={() => upd('employment', emp)}>
                  {emp === 'self-employed' ? 'Self-Emp.' : emp.charAt(0).toUpperCase() + emp.slice(1)}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* Current Location + GPS */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Lbl>Current Location</Lbl>
            <button type="button" onClick={detectGPS} disabled={gpsLoading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BR}` }}>
              {gpsLoading
                ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                : <IoLocate size={13} />}
              {gpsLoading ? 'Detecting…' : 'Use My Location'}
            </button>
          </div>
          <CityAutocomplete value={form.currentCity} onChange={onCurrent} placeholder="Search or use GPS ↑" />
          {gpsError && <p className="text-xs mt-1" style={{ color: '#B84A00' }}>{gpsError}</p>}
        </div>

        {/* Concern */}
        <div>
          <Lbl>What would you like guidance on?</Lbl>
          <textarea required rows={3} value={form.concern} onChange={e => upd('concern', e.target.value)}
            className={`${inputBase} resize-none`} style={inputSt}
            placeholder="e.g. career growth, relationships, health, finances, spiritual path…"
            onFocus={e => Object.assign(e.target.style, focusSt)}
            onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }} />
        </div>

        {/* Consent */}
        <div className="rounded-xl p-4" style={{ background: TEAL_BG, border: `1px solid ${TEAL_BR}` }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.consent} onChange={e => upd('consent', e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0 rounded" style={{ accentColor: TEAL }} />
            <span className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
              I understand this reading is for entertainment and informational purposes only. I will consult a qualified astrologer for personal decisions.
            </span>
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={!form.consent || loading}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #1E8080 40%, ${AMBER} 100%)`, color: '#FFFFFF', letterSpacing: '0.03em', boxShadow: '0 4px 20px rgba(26,107,107,0.30)' }}>
          {loading
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><IoSparkles size={18} /> Reveal My Cosmic Blueprint</>}
        </button>

      </div>
    </motion.form>
  );
}
