'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoSparkles, IoCalendar, IoLocation, IoPerson, IoEarth, IoChatbubbles } from 'react-icons/io5';
import LanguageSelector from './LanguageSelector';
import { Locale } from '@/i18n';

export interface IntakeFormData {
  name: string;
  dob: string;
  birthplace: string;
  gender: 'male' | 'female' | 'other';
  location: string;
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
    birthplace: '',
    gender: 'male',
    location: '',
    concern: '',
    consent: false,
    language: locale,
  });

  function update(field: keyof IntakeFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) return;
    onSubmit({ ...form, language: locale });
  }

  // Calculate age from DOB
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
  const isUnderage = age !== null && age < 18;
  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="card-glass max-w-2xl mx-auto space-y-6"
    >
      {/* Language Selector — top right of form */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-display font-semibold text-gold-400">
          {t.start_reading || 'Begin Your Reading'}
        </h2>
        <LanguageSelector current={locale} onChange={onLocaleChange} />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          <IoPerson className="inline mr-1.5 text-cosmic-400" />
          {t.form_name || 'Full Name'}
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="input-field"
          placeholder="e.g. Rama Krishna"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          <IoCalendar className="inline mr-1.5 text-cosmic-400" />
          {t.form_dob || 'Date of Birth'}
        </label>
        <input
          type="date"
          required
          max={maxDate}
          value={form.dob}
          onChange={(e) => update('dob', e.target.value)}
          className="input-field"
        />
        {isUnderage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gold-400 mt-1.5"
          >
            ✨ {t.underage_title || 'Welcome, Young Star!'} — {t.age_gate_text || 'You\'ll receive positive encouraging guidance only.'}
          </motion.p>
        )}
      </div>

      {/* Birthplace */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          <IoLocation className="inline mr-1.5 text-cosmic-400" />
          {t.form_birthplace || 'Place of Birth'}
        </label>
        <input
          type="text"
          required
          value={form.birthplace}
          onChange={(e) => update('birthplace', e.target.value)}
          className="input-field"
          placeholder="e.g. Hyderabad, India"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          {t.form_gender || 'Gender'}
        </label>
        <div className="flex gap-3">
          {(['male', 'female', 'other'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => update('gender', g)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                form.gender === g
                  ? 'bg-cosmic-600 border-cosmic-400 text-white shadow-lg shadow-cosmic-500/30'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {t[`form_gender_${g}`] || g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Location */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          <IoEarth className="inline mr-1.5 text-cosmic-400" />
          {t.form_location || 'Current Location'}
        </label>
        <input
          type="text"
          required
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          className="input-field"
          placeholder="e.g. San Francisco, USA"
        />
      </div>

      {/* Concern */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          <IoChatbubbles className="inline mr-1.5 text-cosmic-400" />
          {t.form_concern || 'Your Primary Concern'}
        </label>
        <textarea
          required
          rows={3}
          value={form.concern}
          onChange={(e) => update('concern', e.target.value)}
          className="input-field resize-none"
          placeholder={t.form_concern_placeholder || 'e.g. career, relationships, health, finances, spiritual growth...'}
        />
      </div>

      {/* Consent Checkbox */}
      <div className="bg-amber-900/30 border border-amber-500/40 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-cosmic-500 flex-shrink-0"
          />
          <span className="text-sm text-amber-200 leading-relaxed">
            ⚠️ {t.consent_label || 'I understand this is for entertainment and informational purposes only, and I will consult a qualified astrologer for personal guidance.'}
          </span>
        </label>
      </div>

      {/* Mini Disclaimer inside form */}
      <div className="text-center">
        <p className="text-xs text-white/40 italic leading-relaxed">
          🔴 This site is for information and entertainment purposes only. It should NOT be used as
          guidance or a path for life decisions. Please consult a professional astrologer for true details.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!form.consent || loading}
        className="btn-gold w-full flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-cosmic-900 border-t-transparent rounded-full"
          />
        ) : (
          <>
            <IoSparkles />
            {t.form_submit || 'Reveal My Stars'}
          </>
        )}
      </button>
    </motion.form>
  );
}
