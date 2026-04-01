'use client';

import { Locale, LANGUAGES, setLocale } from '@/i18n';

interface LanguageSelectorProps {
  current: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageSelector({ current, onChange }: LanguageSelectorProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as Locale;
    setLocale(newLocale);
    onChange(newLocale);
  }

  return (
    <div className="relative inline-block">
      <select
        value={current}
        onChange={handleChange}
        className="select-field pr-8 text-sm font-medium min-w-[140px]"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.label})
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        🌐
      </div>
    </div>
  );
}
