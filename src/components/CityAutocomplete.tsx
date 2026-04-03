'use client';

import { useState, useRef, useEffect } from 'react';
import { searchCities, formatCity, CityEntry } from '@/lib/cities';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, entry?: CityEntry) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

export default function CityAutocomplete({ value, onChange, placeholder, label, icon }: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CityEntry[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInput(text: string) {
    onChange(text);
    const results = searchCities(text);
    setSuggestions(results);
    setOpen(results.length > 0);
  }

  function handleSelect(entry: CityEntry) {
    const formatted = formatCity(entry);
    onChange(formatted, entry);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {icon && <span className="inline mr-1.5">{icon}</span>}
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        className="input-field"
        placeholder={placeholder || 'Start typing a city name...'}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          style={{ border: '1px solid rgba(26,107,107,0.18)' }}>
          {suggestions.map((entry, i) => (
            <li
              key={`${entry.city}-${entry.state}-${i}`}
              onClick={() => handleSelect(entry)}
              className="px-4 py-3 cursor-pointer transition-colors border-b last:border-0"
              style={{ borderColor: 'rgba(26,107,107,0.08)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLLIElement).style.background = 'rgba(26,107,107,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLLIElement).style.background = ''; }}
            >
              <span className="font-medium" style={{ color: '#1E1B17' }}>{entry.city}</span>
              <span className="text-sm ml-1" style={{ color: '#6A7A72' }}>
                {entry.state}, {entry.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
