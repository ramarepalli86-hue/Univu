'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CityEntry } from '@/lib/cities';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, entry?: CityEntry) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

function nominatimToCityEntry(r: NominatimResult): CityEntry {
  const city =
    r.address.city ||
    r.address.town ||
    r.address.village ||
    r.address.county ||
    r.display_name.split(',')[0];
  const state = r.address.state || '';
  const country = r.address.country || '';
  return {
    city,
    state,
    country,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  };
}

function formatEntry(e: CityEntry): string {
  return [e.city, e.state, e.country].filter(Boolean).join(', ');
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  icon,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<{ label: string; entry: CityEntry }[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const search = useCallback(async (text: string) => {
    if (text.length < 2) { setSuggestions([]); setOpen(false); return; }
    setFetching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=8&featuretype=city`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'Univu-App/1.0' },
      });
      const data: NominatimResult[] = await res.json();
      const results = data.map(r => ({
        label: formatEntry(nominatimToCityEntry(r)),
        entry: nominatimToCityEntry(r),
      }));
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setFetching(false);
    }
  }, []);

  function handleInput(text: string) {
    onChange(text); // update visible text immediately
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 350);
  }

  function handleSelect(label: string, entry: CityEntry) {
    onChange(label, entry);
    setOpen(false);
    setSuggestions([]);
  }

  const TEAL = '#1A6B6B';

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A4A4A' }}>
          {icon && <span className="inline mr-1.5">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #DDD8CE',
            color: '#1E1B17',
          }}
          placeholder={placeholder || 'Type any city in the world…'}
          autoComplete="off"
          spellCheck={false}
        />
        {fetching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin"
            style={{ borderColor: TEAL, borderTopColor: 'transparent' }} />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
          style={{ border: '1px solid rgba(26,107,107,0.20)' }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={e => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(s.label, s.entry)}
              className="px-4 py-2.5 cursor-pointer transition-colors border-b last:border-0 text-sm"
              style={{ borderColor: 'rgba(26,107,107,0.07)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLLIElement).style.background = 'rgba(26,107,107,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLLIElement).style.background = ''; }}
            >
              <span className="font-medium" style={{ color: '#1E1B17' }}>
                {s.entry.city}
              </span>
              {(s.entry.state || s.entry.country) && (
                <span className="ml-1.5 text-xs" style={{ color: '#7A7268' }}>
                  {[s.entry.state, s.entry.country].filter(Boolean).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
