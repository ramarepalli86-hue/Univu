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
  const maxDate = new Date().toISOString().split('T')[0];

  const btnClass = (active: boolean) =>
    `flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
      active
        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
        : 'bg-white border-gray-200 text-gray-500 hover:border-teal-300'
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
        <h2 className="text-xl font-display font-semibold text-gray-800">
          {t.start_reading || 'Begin Your Reading'}
        </h2>
        <LanguageSelector current={locale} onChange={onLocaleChange} />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {t.form_name || 'Full Name'}
        </label>
        <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" placeholder="e.g. Rama Krishna" />
      </div>

      {/* DOB + Time side by side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            {t.form_dob || 'Date of Birth'}
          </label>
          <input type="date" required max={maxDate} value={form.dob} onChange={(e) => update('dob', e.target.value)} className="input-field" />
          {isUnderage && age !== null && (
            <p className="text-sm text-saffron-600 mt-1">
              ✨ You&apos;ll receive encouraging guidance. Full readings are for 21+.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            {t.form_time || 'Time of Birth'}
          </label>
          <input type="time" value={form.timeOfBirth} onChange={(e) => update('timeOfBirth', e.target.value)} className="input-field" />
          <p className="text-xs text-gray-400 mt-1">Optional — improves Lagna precision</p>
        </div>
      </div>

      {/* Chart Type: North Indian vs South Indian */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
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
      <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-teal-600 flex-shrink-0"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
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
