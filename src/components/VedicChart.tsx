'use client';

import { motion } from 'framer-motion';

interface VedicChartProps {
  rashi: string;
  nakshatra: string;
  planets: { name: string; house: number; sign: string }[];
  ascendant: string;
}

/**
 * South Indian style Kundali chart
 * 4x4 grid with center 2x2 being the label area
 * Houses arranged in fixed sign positions (South Indian = signs are fixed)
 *
 *  | Pi | Ar | Ta | Ge |
 *  | Aq |         | Ca |
 *  | Cp |         | Le |
 *  | Sg | Sc | Li | Vi |
 */

const SIGN_POSITIONS: Record<string, [number, number]> = {
  'Pisces': [0, 0], 'Aries': [0, 1], 'Taurus': [0, 2], 'Gemini': [0, 3],
  'Aquarius': [1, 0], 'Cancer': [1, 3],
  'Capricorn': [2, 0], 'Leo': [2, 3],
  'Sagittarius': [3, 0], 'Scorpio': [3, 1], 'Libra': [3, 2], 'Virgo': [3, 3],
};

const SIGN_ABBREV: Record<string, string> = {
  'Pisces': 'Pi', 'Aries': 'Ar', 'Taurus': 'Ta', 'Gemini': 'Ge',
  'Aquarius': 'Aq', 'Cancer': 'Ca', 'Leo': 'Le', 'Virgo': 'Vi',
  'Libra': 'Li', 'Scorpio': 'Sc', 'Sagittarius': 'Sg', 'Capricorn': 'Cp',
};

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': 'Su ☉', 'Moon': 'Mo ☽', 'Mars': 'Ma ♂', 'Mercury': 'Me ☿',
  'Jupiter': 'Ju ♃', 'Venus': 'Ve ♀', 'Saturn': 'Sa ♄',
  'Rahu': 'Ra ☊', 'Ketu': 'Ke ☋', 'Ascendant': 'As ↑',
};

export default function VedicChart({ rashi, nakshatra, planets, ascendant }: VedicChartProps) {
  // Map planets to houses/signs
  const signPlanets: Record<string, string[]> = {};
  for (const p of planets) {
    if (!signPlanets[p.sign]) signPlanets[p.sign] = [];
    signPlanets[p.sign].push(PLANET_SYMBOLS[p.name] || p.name);
  }

  function getCell(row: number, col: number) {
    // Center area (rows 1-2, cols 1-2)
    if ((row === 1 || row === 2) && (col === 1 || col === 2)) return null;

    const sign = Object.keys(SIGN_POSITIONS).find((s) => {
      const [r, c] = SIGN_POSITIONS[s];
      return r === row && c === col;
    });

    if (!sign) return null;

    const abbrev = SIGN_ABBREV[sign];
    const planetsInSign = signPlanets[sign] || [];
    const isAscendant = ascendant === sign;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 * (row * 4 + col) }}
        className={`chart-cell relative ${isAscendant ? 'bg-saffron-50 border-saffron-300 border-2' : ''}`}
      >
        <div className="absolute top-0.5 left-1 text-[10px] font-bold text-copper-400">{abbrev}</div>
        {isAscendant && <div className="absolute top-0.5 right-1 text-[10px] text-saffron-600 font-bold">As</div>}
        <div className="flex flex-wrap gap-0.5 justify-center items-center pt-3">
          {planetsInSign.map((p, i) => (
            <span key={i} className="text-[10px] sm:text-xs font-medium text-copper-500 whitespace-nowrap">{p}</span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="section-heading">
        🕉️ South Indian Kundali
      </h3>
      <p className="text-sm text-gray-500">
        Rashi: <span className="font-semibold text-copper-500">{rashi}</span> · 
        Nakshatra: <span className="font-semibold text-copper-500">{nakshatra}</span>
      </p>
      <div className="grid grid-cols-4 border-2 border-copper-300 rounded-lg overflow-hidden max-w-md mx-auto bg-warm-50">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const cell = getCell(row, col);
            if (cell === null && (row === 1 || row === 2) && (col === 1 || col === 2)) {
              // Center area
              if (row === 1 && col === 1) {
                return (
                  <div key={`${row}-${col}`} className="col-span-2 row-span-2 flex items-center justify-center bg-warm-100 border border-warm-300 p-3">
                    <div className="text-center">
                      <p className="text-xs text-copper-400 font-medium">Rashi Chart</p>
                      <p className="text-lg font-display font-bold text-copper-500">🕉️</p>
                      <p className="text-[10px] text-gray-400">South Indian</p>
                    </div>
                  </div>
                );
              }
              return null; // Skip other center cells (merged)
            }
            return <div key={`${row}-${col}`}>{cell}</div>;
          })
        )}
      </div>
    </div>
  );
}
