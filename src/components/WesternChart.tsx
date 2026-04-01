'use client';

import { motion } from 'framer-motion';

interface WesternChartProps {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: { name: string; degree: number; sign: string }[];
}

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', start: 0 },
  { name: 'Taurus', symbol: '♉', start: 30 },
  { name: 'Gemini', symbol: '♊', start: 60 },
  { name: 'Cancer', symbol: '♋', start: 90 },
  { name: 'Leo', symbol: '♌', start: 120 },
  { name: 'Virgo', symbol: '♍', start: 150 },
  { name: 'Libra', symbol: '♎', start: 180 },
  { name: 'Scorpio', symbol: '♏', start: 210 },
  { name: 'Sagittarius', symbol: '♐', start: 240 },
  { name: 'Capricorn', symbol: '♑', start: 270 },
  { name: 'Aquarius', symbol: '♒', start: 300 },
  { name: 'Pisces', symbol: '♓', start: 330 },
];

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿',
  'Jupiter': '♃', 'Venus': '♀', 'Saturn': '♄', 'Uranus': '⛢',
  'Neptune': '♆', 'Pluto': '♇', 'North Node': '☊', 'South Node': '☋',
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function WesternChart({ sunSign, moonSign, risingSign, planets }: WesternChartProps) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 160;
  const midR = 130;
  const innerR = 90;
  const planetR = 108;

  return (
    <div className="space-y-4">
      <h3 className="section-heading">
        🌟 Western Birth Chart
      </h3>
      <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600 mb-2">
        <span>☉ Sun: <strong className="text-teal-700">{sunSign}</strong></span>
        <span>☽ Moon: <strong className="text-copper-500">{moonSign}</strong></span>
        <span>↑ Rising: <strong className="text-saffron-600">{risingSign}</strong></span>
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex justify-center"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
          {/* Outer circle */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#B8860B" strokeWidth="2" />
          {/* Mid circle */}
          <circle cx={cx} cy={cy} r={midR} fill="none" stroke="#D4A853" strokeWidth="1.5" />
          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={innerR} fill="#FFFDF7" stroke="#D4A853" strokeWidth="1" />

          {/* Sign divisions and labels */}
          {ZODIAC_SIGNS.map((sign, i) => {
            const angle = i * 30;
            const p1 = polarToCartesian(cx, cy, innerR, angle);
            const p2 = polarToCartesian(cx, cy, outerR, angle);
            const labelPos = polarToCartesian(cx, cy, (midR + outerR) / 2, angle + 15);

            return (
              <g key={sign.name}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#D4A853" strokeWidth="1" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-sm"
                  fill="#8B6914"
                  fontSize="14"
                >
                  {sign.symbol}
                </text>
              </g>
            );
          })}

          {/* Planets */}
          {planets.map((planet, i) => {
            const signIndex = ZODIAC_SIGNS.findIndex((s) => s.name === planet.sign);
            const angle = signIndex >= 0 ? signIndex * 30 + (planet.degree % 30) : i * 30;
            const pos = polarToCartesian(cx, cy, planetR, angle);

            return (
              <g key={planet.name}>
                <circle cx={pos.x} cy={pos.y} r={10} fill="#FFF8E8" stroke="#B8860B" strokeWidth="1" />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fill="#6B3A10"
                >
                  {PLANET_SYMBOLS[planet.name] || planet.name.charAt(0)}
                </text>
              </g>
            );
          })}

          {/* Center label */}
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="12" fill="#8B6914" fontWeight="bold">
            Natal Chart
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#B8860B">
            Western
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
