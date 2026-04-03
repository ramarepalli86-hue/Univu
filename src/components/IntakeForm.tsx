'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoSparkles } from 'react-icons/io5';
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

// ─── Date helpers ─────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function daysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

function pad2(n: number | string): string {
  return String(n).padStart(2, '0');
}

// ─── DOB Picker Component ─────────────────────────────────────────────────────
function DOBPicker({
  value,
  onChange,
}: {
  value: string; // "YYYY-MM-DD"
  onChange: (v: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const parts = value ? value.split('-') : ['', '', ''];
  const selYear  = parts[0] ? parseInt(parts[0], 10) : 0;
  const selMonth = parts[1] ? parseInt(parts[1], 10) : 0;
  const selDay   = parts[2] ? parseInt(parts[2], 10) : 0;

  const maxDays = daysInMonth(selMonth, selYear);
  const years = Array.from({ length: currentYear - 1900 }, (_, i) => currentYear - i);

  function emit(y: number, m: number, d: number) {
    if (y && m && d) {
      // Clamp day if month changes and day > maxDays
      const max = daysInMonth(m, y);
      const safeDay = Math.min(d, max);
      onChange(`${y}-${pad2(m)}-${pad2(safeDay)}`);
    } else {
      onChange('');
    }
  }

  const selectClass =
    'flex-1 rounded-xl border px-3 py-2.5 text-sm appearance-none cursor-pointer outline-none transition-all duration-200' +
    ' bg-[rgba(20,17,9,0.9)] border-[rgba(156,122,26,0.22)] text-[#E8D4A8]' +
    ' focus:ring-2 focus:ring-[rgba(156,122,26,0.15)] focus:border-[rgba(156,122,26,0.5)]';

  return (
    <div className="flex gap-2">
      {/* Day */}
      <div className="relative flex-1">
        <select
          value={selDay || ''}
          onChange={e => emit(selYear, selMonth, parseInt(e.target.value, 10))}
          className={selectClass}
          required
        >
          <option value="">Day</option>
          {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{pad2(d)}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
      </div>

      {/* Month */}
      <div className="relative flex-[1.6]">
        <select
          value={selMonth || ''}
          onChange={e => emit(selYear, parseInt(e.target.value, 10), selDay)}
          className={selectClass}
          required
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
      </div>

      {/* Year */}
      <div className="relative flex-[1.4]">
        <select
          value={selYear || ''}
          onChange={e => emit(parseInt(e.target.value, 10), selMonth, selDay)}
          className={selectClass}
          required
        >
          <option value="">Year</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
      </div>
    </div>
  );
}

// ─── Time Picker Component ────────────────────────────────────────────────────
function TimePicker({
  value,
  onChange,
}: {
  value: string; // "HH:MM"
  onChange: (v: string) => void;
}) {
  const parts = value ? value.split(':') : ['', ''];
  const selHour   = parts[0] !== '' ? parseInt(parts[0], 10) : -1;
  const selMinute = parts[1] !== '' ? parseInt(parts[1], 10) : -1;

  function emit(h: number, m: number) {
    if (h >= 0 && m >= 0) onChange(`${pad2(h)}:${pad2(m)}`);
    else onChange('');
  }

  const selectClass =
    'flex-1 rounded-xl border px-3 py-2.5 text-sm appearance-none cursor-pointer outline-none transition-all duration-200' +
    ' bg-[rgba(20,17,9,0.9)] border-[rgba(156,122,26,0.22)] text-[#E8D4A8]' +
    ' focus:ring-2 focus:ring-[rgba(156,122,26,0.15)] focus:border-[rgba(156,122,26,0.5)]';

  return (
    <div className="flex gap-2">
      {/* Hour */}
      <div className="relative flex-1">
        <select
          value={selHour >= 0 ? selHour : ''}
          onChange={e => emit(parseInt(e.target.value, 10), selMinute >= 0 ? selMinute : 0)}
          className={selectClass}
        >
          <option value="">Hr</option>
          {Array.from({ length: 24 }, (_, i) => i).map(h => (
            <option key={h} value={h}>
              {pad2(h)} {h < 12 ? 'AM' : 'PM'} ({h === 0 ? '12AM' : h <= 12 ? `${h}AM` : `${h - 12}PM`})
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
      </div>

      {/* Minute — every 5 min for easy selection */}
      <div className="relative flex-1">
        <select
          value={selMinute >= 0 ? selMinute : ''}
          onChange={e => emit(selHour >= 0 ? selHour : 12, parseInt(e.target.value, 10))}
          className={selectClass}
        >
          <option value="">Min</option>
          {Array.from({ length: 60 }, (_, i) => i).map(m => (
            <option key={m} value={m}>{pad2(m)}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
      </div>
    </div>
  );
}

export default function IntakeForm({ t, locale, onLocaleChange, onSubmit, loading }: IntakeFormProps) {
  const [form, setForm] = useState<IntakeFormData>({
    name: '',
    dob: '',
    timeOfBirth: '',
    birthCity: '',
    birthLat: 0,
    birthLng: 0,
    gender: 'male',
    currentCity: '',
    currentLat: 0,
    currentLng: 0,
    chartType: 'north',
    maritalStatus: 'single',
    employment: 'employed',
    concern: '',
    consent: false,
    language: locale,
  });

  function update(field: keyof IntakeFormData, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBirthCityChange(value: string, entry?: CityEntry) {
    update('birthCity', value);
    if (entry) {
      setForm((prev) => ({ ...prev, birthCity: value, birthLat: entry.lat, birthLng: entry.lng }));
    }
  }

  function handleCurrentCityChange(value: string, entry?: CityEntry) {
    update('currentCity', value);
    if (entry) {
      setForm((prev) => ({ ...prev, currentCity: value, currentLat: entry.lat, currentLng: entry.lng }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) return;
    onSubmit({ ...form, language: locale });
  }

  function getAge(dob: string): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  const age = getAge(form.dob);
  const isUnderage = age !== null && age < 21;

  const btnClass = (active: boolean) =>
    `flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
      active
        ? 'bg-[rgba(156,122,26,0.25)] border-[rgba(156,122,26,0.5)] text-[#E8D4A8] shadow-sm'
        : 'bg-[rgba(20,17,9,0.7)] border-[rgba(156,122,26,0.15)] text-[#7A6448] hover:border-[rgba(156,122,26,0.35)] hover:text-[#C4A87A]'
    }`;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-main max-w-2xl mx-auto space-y-5"
    >
      {/* Header + Language */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-display font-semibold text-[#E8D4A8]">
          {t.start_reading || 'Begin Your Reading'}
        </h2>
        <LanguageSelector current={locale} onChange={onLocaleChange} />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_name || 'Full Name'}
        </label>
        <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" placeholder="e.g. Rama Krishna" />
      </div>

      {/* DOB + Time side by side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
            {t.form_dob || 'Date of Birth'}
          </label>
          <DOBPicker value={form.dob} onChange={v => update('dob', v)} />
          {form.dob && (
            <p className="text-xs text-[#B8922A] mt-1.5 font-medium">
              📅 {new Date(form.dob + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              {age !== null && ` · Age ${age}`}
            </p>
          )}
          {isUnderage && age !== null && (
            <p className="text-sm text-[#C4A87A] mt-1">
              ✨ You&apos;ll receive encouraging guidance. Full readings are for 21+.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
            {t.form_time || 'Time of Birth'}
          </label>
          <TimePicker value={form.timeOfBirth} onChange={v => update('timeOfBirth', v)} />
          <p className="text-xs text-[#6B5840] mt-1">Optional — improves Lagna precision</p>
        </div>
      </div>

      {/* Chart Type: North Indian vs South Indian */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_chart_type || 'Chart Style'}
        </label>
        <div className="flex gap-3">
          {([
            { value: 'north' as const, label: '🕉️ North Indian' },
            { value: 'south' as const, label: '🕉️ South Indian' },
          ]).map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => update('chartType', ct.value)}
              className={btnClass(form.chartType === ct.value)}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Birthplace */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_birthplace || 'Place of Birth'}
        </label>
        <CityAutocomplete
          value={form.birthCity}
          onChange={handleBirthCityChange}
          placeholder="e.g. Vijayawada"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_gender || 'Gender'}
        </label>
        <div className="flex gap-3">
          {(['male', 'female', 'other'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => update('gender', g)}
              className={btnClass(form.gender === g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Marital Status */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_marital || 'Marital Status'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([
            { value: 'single' as const, label: 'Single' },
            { value: 'married' as const, label: 'Married' },
            { value: 'divorced' as const, label: 'Divorced' },
            { value: 'widowed' as const, label: 'Widowed' },
          ]).map((ms) => (
            <button
              key={ms.value}
              type="button"
              onClick={() => update('maritalStatus', ms.value)}
              className={btnClass(form.maritalStatus === ms.value)}
            >
              {ms.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employment Status */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_employment || 'Employment Status'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([
            { value: 'employed' as const, label: 'Employed' },
            { value: 'self-employed' as const, label: 'Self-Employed' },
            { value: 'student' as const, label: 'Student' },
            { value: 'unemployed' as const, label: 'Unemployed' },
            { value: 'retired' as const, label: 'Retired' },
          ]).map((emp) => (
            <button
              key={emp.value}
              type="button"
              onClick={() => update('employment', emp.value)}
              className={btnClass(form.employment === emp.value)}
            >
              {emp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Location */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_location || 'Current Location'}
        </label>
        <CityAutocomplete
          value={form.currentCity}
          onChange={handleCurrentCityChange}
          placeholder="e.g. San Francisco"
        />
      </div>

      {/* Concern */}
      <div>
        <label className="block text-sm font-medium text-[#A08B6E] mb-1.5">
          {t.form_concern || 'Primary Concern'}
        </label>
        <textarea
          required
          rows={3}
          value={form.concern}
          onChange={(e) => update('concern', e.target.value)}
          className="input-field resize-none"
          placeholder="e.g. career, relationships, health..."
        />
      </div>

      {/* Consent */}
      <div style={{ background: 'rgba(156,122,26,0.07)', border: '1px solid rgba(156,122,26,0.18)', borderRadius: '0.75rem', padding: '1rem' }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-1 w-4 h-4 rounded flex-shrink-0"
            style={{ accentColor: '#B8922A' }}
          />
          <span className="text-sm text-[#9A8468] leading-relaxed">
            I understand this is for entertainment and informational purposes only and will consult a qualified astrologer for personal guidance.
          </span>
        </label>
      </div>

      {/* Submit */}
      <button type="submit" disabled={!form.consent || loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <IoSparkles />
            {t.form_submit || 'Generate Reading'}
          </>
        )}
      </button>
    </motion.form>
  );
}
