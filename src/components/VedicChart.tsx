'use client';

import { motion } from 'framer-motion';

interface VedicPlanet {
  name: string;
  rashi: string;
  house: number;
  retrograde: boolean;
}

interface VedicChartProps {
  planets: VedicPlanet[];
  ascendant: string;
  chartType: 'north' | 'south';
}

const SOUTH_SIGN_POSITIONS: Record<string, [number, number]> = {
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

const VEDIC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function getPlanetAbbrev(name: string, retrograde: boolean): string {
  const abbrevs: Record<string, string> = {
    'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
    'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra', 'Ketu': 'Ke',
  };
  const a = abbrevs[name] || name.slice(0, 2);
  return retrograde ? a + '℞' : a;
}

export default function VedicChart({ planets, ascendant, chartType }: VedicChartProps) {
  const signPlanets: Record<string, string[]> = {};
  for (const p of planets) {
    if (!signPlanets[p.rashi]) signPlanets[p.rashi] = [];
    signPlanets[p.rashi].push(getPlanetAbbrev(p.name, p.retrograde));
  }

  const ascIdx = VEDIC_SIGNS.indexOf(ascendant);

  if (chartType === 'north') {
    return <NorthChart signPlanets={signPlanets} ascIdx={ascIdx} ascendant={ascendant} />;
  }
  return <SouthChart signPlanets={signPlanets} ascendant={ascendant} />;
}

/* ──── South Indian Chart ──── */
function SouthChart({ signPlanets, ascendant }: {
  signPlanets: Record<string, string[]>;
  ascendant: string;
}) {
  function getCell(row: number, col: number) {
    if ((row === 1 || row === 2) && (col === 1 || col === 2)) return null;

    const sign = Object.keys(SOUTH_SIGN_POSITIONS).find((s) => {
      const [r, c] = SOUTH_SIGN_POSITIONS[s];
      return r === row && c === col;
    });
    if (!sign) return null;

    const abbrev = SIGN_ABBREV[sign];
    const pList = signPlanets[sign] || [];
    const isAsc = ascendant === sign;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 * (row * 4 + col) }}
        className={`relative min-h-[60px] border border-copper-200 p-1 ${
          isAsc ? 'bg-saffron-50 border-saffron-300 border-2' : ''
        }`}
      >
        <div className="absolute top-0.5 left-1 text-[10px] font-bold text-copper-400">{abbrev}</div>
        {isAsc && <div className="absolute top-0.5 right-1 text-[10px] text-saffron-600 font-bold">As</div>}
        <div className="flex flex-wrap gap-0.5 justify-center items-center pt-3">
          {pList.map((p, i) => (
            <span key={i} className="text-[10px] sm:text-xs font-medium text-copper-500 whitespace-nowrap">{p}</span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="section-heading">🕉️ South Indian Kundali</h3>
      <div className="grid grid-cols-4 border-2 border-copper-300 rounded-lg overflow-hidden max-w-xs mx-auto bg-warm-50">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const cell = getCell(row, col);
            if (cell === null && (row === 1 || row === 2) && (col === 1 || col === 2)) {
              if (row === 1 && col === 1) {
                return (
                  <div key={`${row}-${col}`} className="col-span-2 row-span-2 flex items-center justify-center bg-warm-100 border border-warm-300 p-2">
                    <div className="text-center">
                      <p className="text-[10px] text-copper-400 font-medium">Rashi Chart</p>
                      <p className="text-base font-display font-bold text-copper-500">🕉️</p>
                    </div>
                  </div>
                );
              }
              return null;
            }
            return <div key={`${row}-${col}`}>{cell}</div>;
          })
        )}
      </div>
    </div>
  );
}

/* ──── North Indian Chart (SVG diamond) ──── */
function NorthChart({ signPlanets, ascIdx, ascendant }: {
  signPlanets: Record<string, string[]>;
  ascIdx: number;
  ascendant: string;
}) {
  const houses: { sign: string; planets: string[] }[] = [];
  for (let i = 0; i < 12; i++) {
    const signIdx = (ascIdx + i) % 12;
    const sign = VEDIC_SIGNS[signIdx];
    houses.push({ sign, planets: signPlanets[sign] || [] });
  }

  const S = 300;
  const H = S / 2;
  const Q = S / 4;

  // Triangle vertices for each house (12 triangles radiating from center)
  const tri: [string, string, string][] = [
    [`${H},${H}`, `${Q},0`, `${3*Q},0`],       // H1 top-center
    [`${H},${H}`, `${3*Q},0`, `${S},0`],        // H2 top-right
    [`${H},${H}`, `${S},0`, `${S},${Q}`],       // H3 right-top
    [`${H},${H}`, `${S},${Q}`, `${S},${3*Q}`],  // H4 right-center
    [`${H},${H}`, `${S},${3*Q}`, `${S},${S}`],  // H5 right-bottom
    [`${H},${H}`, `${S},${S}`, `${3*Q},${S}`],  // H6 bottom-right
    [`${H},${H}`, `${3*Q},${S}`, `${Q},${S}`],  // H7 bottom-center
    [`${H},${H}`, `${Q},${S}`, `0,${S}`],       // H8 bottom-left
    [`${H},${H}`, `0,${S}`, `0,${3*Q}`],        // H9 left-bottom
    [`${H},${H}`, `0,${3*Q}`, `0,${Q}`],        // H10 left-center
    [`${H},${H}`, `0,${Q}`, `0,0`],             // H11 left-top
    [`${H},${H}`, `0,0`, `${Q},0`],             // H12 top-left
  ];

  function centroid(pts: [string, string, string]): [number, number] {
    let sx = 0, sy = 0;
    for (const p of pts) {
      const [x, y] = p.split(',').map(Number);
      sx += x; sy += y;
    }
    const cx = sx / 3, cy = sy / 3;
    const dx = cx - H, dy = cy - H;
    return [cx + dx * 0.3, cy + dy * 0.3];
  }

  return (
    <div className="space-y-3">
      <h3 className="section-heading">🕉️ North Indian Kundali</h3>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="max-w-xs">
          <rect x="0" y="0" width={S} height={S} fill="#FFFDF7" stroke="#B8860B" strokeWidth="2" rx="4" />
          <line x1={H} y1={0} x2={S} y2={H} stroke="#D4A853" strokeWidth="1" />
          <line x1={S} y1={H} x2={H} y2={S} stroke="#D4A853" strokeWidth="1" />
          <line x1={H} y1={S} x2={0} y2={H} stroke="#D4A853" strokeWidth="1" />
          <line x1={0} y1={H} x2={H} y2={0} stroke="#D4A853" strokeWidth="1" />
          <line x1={H} y1={0} x2={H} y2={S} stroke="#D4A853" strokeWidth="0.5" strokeDasharray="4" />
          <line x1={0} y1={H} x2={S} y2={H} stroke="#D4A853" strokeWidth="0.5" strokeDasharray="4" />

          {houses.map((h, i) => {
            const [lx, ly] = centroid(tri[i]);
            const isFirst = i === 0;
            return (
              <g key={i}>
                <polygon
                  points={tri[i].join(' ')}
                  fill={isFirst ? 'rgba(255,165,0,0.08)' : 'transparent'}
                  stroke="none"
                />
                <text x={lx} y={ly - 5} textAnchor="middle" fontSize="9"
                  fill={isFirst ? '#B45309' : '#8B6914'}
                  fontWeight={isFirst ? 'bold' : 'normal'}>
                  {SIGN_ABBREV[h.sign] || h.sign.slice(0, 2)}
                </text>
                {h.planets.length > 0 && (
                  <text x={lx} y={ly + 8} textAnchor="middle" fontSize="8" fill="#7C5B20">
                    {h.planets.join(' ')}
                  </text>
                )}
              </g>
            );
          })}

          <text x={H} y={H - 6} textAnchor="middle" fontSize="10" fill="#8B6914" fontWeight="bold">
            {ascendant}
          </text>
          <text x={H} y={H + 8} textAnchor="middle" fontSize="8" fill="#B8860B">
            Lagna
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
