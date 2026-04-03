'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryEvent } from '@/lib/astrology';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoryScene {
  id: number;
  chapter: string;
  title: string;
  subtitle: string;
  narrativeText: string;
  planet: string;
  planetSymbol: string;
  planetColor: string;
  bgGradient: string;
  accentColor: string;
  characterPose: 'newborn' | 'child' | 'youth' | 'adult' | 'couple' | 'elder' | 'cosmic';
  lifeAge: string;
  starsCount: number;
}

interface StoryAnimatorProps {
  name: string;
  storyText: string;
  storyEvents?: StoryEvent[];
  lagnaSign?: string;
  moonSign?: string;
  sunSign?: string;
  birthYear?: number;
  planets?: Array<{ name: string; rashi: string; house: number }>;
  currentDasha?: string;
}

// ─── Planet Data ──────────────────────────────────────────────────────────────

const PLANET_DATA: Record<string, { symbol: string; color: string; emoji: string }> = {
  Sun:     { symbol: '☀️', color: '#FFD700', emoji: '☀️' },
  Moon:    { symbol: '🌙', color: '#C0C8E0', emoji: '🌙' },
  Mars:    { symbol: '♂',  color: '#FF4444', emoji: '🔴' },
  Mercury: { symbol: '☿',  color: '#A8D8A8', emoji: '🟢' },
  Jupiter: { symbol: '♃',  color: '#FFA040', emoji: '🟠' },
  Venus:   { symbol: '♀',  color: '#FFB6C1', emoji: '💗' },
  Saturn:  { symbol: '♄',  color: '#8888AA', emoji: '💜' },
  Rahu:    { symbol: '☊',  color: '#404070', emoji: '🌑' },
  Ketu:    { symbol: '☋',  color: '#806040', emoji: '🌒' },
  Lagna:   { symbol: '⬆',  color: '#88FFCC', emoji: '⬆️' },
};

// ─── Animated SVG Characters ──────────────────────────────────────────────────

function NewbornFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.circle key={i}
          cx={60 + 50 * Math.cos((angle * Math.PI) / 180)}
          cy={70 + 50 * Math.sin((angle * Math.PI) / 180)}
          r="2" fill={color}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
      <motion.ellipse cx="60" cy="70" rx="35" ry="45"
        fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 4"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '60px 70px' }}
      />
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="60" cy="85" rx="22" ry="28" fill={color} opacity="0.25" />
        <ellipse cx="60" cy="85" rx="18" ry="24" fill={color} opacity="0.35" />
        <circle cx="60" cy="55" r="16" fill={color} opacity="0.8" />
        <path d="M54 54 Q57 52 60 54" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M60 54 Q63 52 66 54" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M56 60 Q60 64 64 60" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <motion.circle cx="60" cy="55" r="22" fill="none" stroke={color} strokeWidth="2" opacity="0.5"
          animate={{ r: [22, 28, 22], opacity: [0.5, 0.1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.g>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.line key={i}
          x1={60 + 20 * Math.cos((angle * Math.PI) / 180)}
          y1={55 + 20 * Math.sin((angle * Math.PI) / 180)}
          x2={60 + 38 * Math.cos((angle * Math.PI) / 180)}
          y2={55 + 38 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="1.5" strokeLinecap="round"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}

function ChildFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <motion.g animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '60px 90px' }}>
        <ellipse cx="60" cy="148" rx="30" ry="6" fill={color} opacity="0.15" />
        <rect x="48" y="88" width="24" height="40" rx="8" fill={color} opacity="0.6" />
        <circle cx="60" cy="78" r="18" fill={color} opacity="0.8" />
        <circle cx="54" cy="76" r="3.5" fill="#fff" /><circle cx="66" cy="76" r="3.5" fill="#fff" />
        <circle cx="55" cy="77" r="2" fill="#222" /><circle cx="67" cy="77" r="2" fill="#222" />
        <path d="M54 84 Q60 89 66 84" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <motion.line x1="48" y1="98" x2="32" y2="82" stroke={color} strokeWidth="6" strokeLinecap="round"
          animate={{ x2: [32, 28, 32], y2: [82, 76, 82] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.line x1="72" y1="98" x2="88" y2="82" stroke={color} strokeWidth="6" strokeLinecap="round"
          animate={{ x2: [88, 92, 88], y2: [82, 76, 82] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <line x1="54" y1="128" x2="50" y2="148" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <line x1="66" y1="128" x2="70" y2="148" stroke={color} strokeWidth="7" strokeLinecap="round" />
      </motion.g>
      {[0, 1, 2].map(i => (
        <motion.text key={i} x={30 + i * 25} y="30" fontSize="18" textAnchor="middle"
          animate={{ y: [30, 20, 30], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}>⭐</motion.text>
      ))}
    </svg>
  );
}

function YouthFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <motion.ellipse cx="60" cy="172" rx="25" ry="5" fill={color} opacity="0.2"
          animate={{ rx: [25, 20, 25] }} transition={{ duration: 3, repeat: Infinity }} />
        <rect x="47" y="95" width="26" height="55" rx="10" fill={color} opacity="0.6" />
        <circle cx="60" cy="82" r="20" fill={color} opacity="0.8" />
        <path d="M51 80 L57 80" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M63 80 L69 80" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 88 Q60 93 66 88" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="47" y1="108" x2="30" y2="118" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <line x1="73" y1="108" x2="90" y2="118" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <rect x="22" y="115" width="16" height="20" rx="2" fill={color} opacity="0.9" />
        <line x1="30" y1="115" x2="30" y2="135" stroke="#fff" strokeWidth="1" />
        <line x1="54" y1="150" x2="50" y2="172" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <line x1="66" y1="150" x2="70" y2="172" stroke={color} strokeWidth="8" strokeLinecap="round" />
      </motion.g>
      {[0, 1, 2, 3].map(i => (
        <motion.circle key={i} cx={85 + (i % 2) * 20} cy={60 + Math.floor(i / 2) * 25}
          r="4" fill={color}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </svg>
  );
}

function AdultFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2, 3].map(i => (
        <motion.rect key={i} x={10 + i * 22} y={165 - i * 20} width="22" height="5"
          rx="2" fill={color} opacity="0.3"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <rect x="46" y="100" width="28" height="60" rx="12" fill={color} opacity="0.65" />
        <circle cx="60" cy="86" r="20" fill={color} opacity="0.85" />
        <path d="M51 84 Q54 81 57 84" stroke="#222" strokeWidth="2" fill="none" />
        <path d="M63 84 Q66 81 69 84" stroke="#222" strokeWidth="2" fill="none" />
        <path d="M54 92 Q60 96 66 92" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <motion.line x1="46" y1="115" x2="26" y2="100" stroke={color} strokeWidth="8" strokeLinecap="round"
          animate={{ x2: [26, 22, 26], y2: [100, 88, 100] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <line x1="74" y1="115" x2="92" y2="128" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <motion.text x="18" y="92" fontSize="20"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '28px 90px' }}>⭐</motion.text>
        <line x1="54" y1="160" x2="50" y2="188" stroke={color} strokeWidth="9" strokeLinecap="round" />
        <line x1="66" y1="160" x2="70" y2="188" stroke={color} strokeWidth="9" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function CoupleFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 160 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2].map(i => (
        <motion.text key={i} x={55 + i * 20} y="30" fontSize="16" textAnchor="middle"
          animate={{ y: [30, 10, 30], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}>💗</motion.text>
      ))}
      <motion.line x1="50" y1="100" x2="110" y2="100"
        stroke={color} strokeWidth="2" strokeDasharray="4 3"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      <motion.g animate={{ x: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <circle cx="44" cy="72" r="18" fill={color} opacity="0.75" />
        <circle cx="38" cy="70" r="3" fill="#222" /><circle cx="50" cy="70" r="3" fill="#222" />
        <path d="M39 78 Q44 83 49 78" stroke="#222" strokeWidth="1.5" fill="none" />
        <rect x="33" y="90" width="22" height="45" rx="9" fill={color} opacity="0.6" />
        <line x1="33" y1="105" x2="18" y2="118" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="55" y1="105" x2="70" y2="118" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="38" y1="135" x2="34" y2="158" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <line x1="50" y1="135" x2="54" y2="158" stroke={color} strokeWidth="7" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={{ x: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <circle cx="116" cy="72" r="18" fill={color} opacity="0.75" />
        <circle cx="110" cy="70" r="3" fill="#222" /><circle cx="122" cy="70" r="3" fill="#222" />
        <path d="M111 78 Q116 83 121 78" stroke="#222" strokeWidth="1.5" fill="none" />
        <rect x="105" y="90" width="22" height="45" rx="9" fill={color} opacity="0.6" />
        <line x1="105" y1="105" x2="90" y2="118" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="127" y1="105" x2="142" y2="118" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="110" y1="135" x2="106" y2="158" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <line x1="122" y1="135" x2="126" y2="158" stroke={color} strokeWidth="7" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function ElderFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 190" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <motion.circle cx="60" cy="82" r="50" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 4"
        animate={{ r: [50, 58, 50], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }} />
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <path d="M35 105 Q40 95 60 92 Q80 95 85 105 L88 165 Q60 170 32 165 Z" fill={color} opacity="0.5" />
        <circle cx="60" cy="78" r="22" fill={color} opacity="0.8" />
        <path d="M50 76 Q54 73 58 76" stroke="#222" strokeWidth="2" fill="none" />
        <path d="M62 76 Q66 73 70 76" stroke="#222" strokeWidth="2" fill="none" />
        <path d="M52 85 Q60 91 68 85" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="88" y1="100" x2="88" y2="170" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <circle cx="88" cy="96" r="5" fill={color} opacity="0.9" />
        <ellipse cx="50" cy="168" rx="10" ry="5" fill={color} opacity="0.6" />
        <ellipse cx="70" cy="168" rx="10" ry="5" fill={color} opacity="0.6" />
      </motion.g>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <motion.circle key={i}
          cx={60 + 48 * Math.cos((angle * Math.PI) / 180)}
          cy={82 + 48 * Math.sin((angle * Math.PI) / 180)}
          r="5" fill={color} opacity="0.7"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </svg>
  );
}

function CosmicFigure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <motion.circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 6"
        animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '80px 80px' }} />
      <motion.circle cx="80" cy="80" r="50" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5 4"
        animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '80px 80px' }} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.ellipse key={i}
          cx={80 + 30 * Math.cos((angle * Math.PI) / 180)}
          cy={80 + 30 * Math.sin((angle * Math.PI) / 180)}
          rx="10" ry="18" fill={color} opacity="0.2"
          transform={`rotate(${angle}, ${80 + 30 * Math.cos((angle * Math.PI) / 180)}, ${80 + 30 * Math.sin((angle * Math.PI) / 180)})`}
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <motion.circle cx="80" cy="80" r="18" fill={color} opacity="0.9"
        animate={{ r: [18, 22, 18], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity }} />
      <motion.circle cx="80" cy="80" r="10" fill="#fff" opacity="0.9"
        animate={{ r: [10, 13, 10] }} transition={{ duration: 2.5, repeat: Infinity }} />
      {[35, 50, 62].map((radius, i) => (
        <motion.circle key={i}
          cx={80 + radius * Math.cos((i * 120 * Math.PI) / 180)}
          cy={80 + radius * Math.sin((i * 120 * Math.PI) / 180)}
          r="6" fill={color} opacity="0.8"
          animate={{
            cx: [
              80 + radius * Math.cos((i * 120 * Math.PI) / 180),
              80 + radius * Math.cos(((i * 120 + 180) * Math.PI) / 180),
              80 + radius * Math.cos((i * 120 * Math.PI) / 180),
            ],
            cy: [
              80 + radius * Math.sin((i * 120 * Math.PI) / 180),
              80 + radius * Math.sin(((i * 120 + 180) * Math.PI) / 180),
              80 + radius * Math.sin((i * 120 * Math.PI) / 180),
            ],
          }}
          transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </svg>
  );
}

// ─── Star Field Background ─────────────────────────────────────────────────────

function StarField({ count, color }: { count: number; color: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 137.508) % 100,
    y: (i * 97.3 + 13.7) % 100,
    size: 0.5 + (i % 3) * 0.5,
    delay: (i * 0.23) % 3,
    duration: 2 + (i % 4),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size * 3, height: s.size * 3, backgroundColor: color }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
}

// ─── Planet Orb ────────────────────────────────────────────────────────────────

function PlanetOrb({ planet, x, y, delay }: { planet: string; x: string; y: string; delay: number }) {
  const data = PLANET_DATA[planet] || { symbol: '✦', color: '#ffffff', emoji: '✦' };
  return (
    <motion.div className="absolute flex flex-col items-center z-20"
      style={{ left: x, top: y }}
      animate={{ y: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 3, repeat: Infinity, delay }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border"
        style={{ backgroundColor: data.color + '33', borderColor: data.color, boxShadow: `0 0 16px ${data.color}66` }}>
        {data.emoji}
      </div>
      <span className="text-xs mt-1 font-medium" style={{ color: data.color }}>{planet}</span>
    </motion.div>
  );
}

// ─── Character Renderer ───────────────────────────────────────────────────────

function CharacterFigure({ pose, color }: { pose: StoryScene['characterPose']; color: string }) {
  switch (pose) {
    case 'newborn': return <NewbornFigure color={color} />;
    case 'child':   return <ChildFigure color={color} />;
    case 'youth':   return <YouthFigure color={color} />;
    case 'adult':   return <AdultFigure color={color} />;
    case 'couple':  return <CoupleFigure color={color} />;
    case 'elder':   return <ElderFigure color={color} />;
    case 'cosmic':  return <CosmicFigure color={color} />;
    default:        return <CosmicFigure color={color} />;
  }
}

// ─── Scene Builder ────────────────────────────────────────────────────────────

function buildScenesFromData(
  name: string, storyText: string, _events: StoryEvent[],
  lagnaSign: string, _moonSign: string, _sunSign: string,
  _birthYear: number, planets: Array<{ name: string; rashi: string; house: number }>,
  _currentDasha: string
): StoryScene[] {
  const chapterRegex = /###\s*(Chapter \d+[^—\n]*—[^\n]*)\n\n([\s\S]*?)(?=###|$)/g;
  const chapters: Array<{ title: string; text: string }> = [];
  let match;
  while ((match = chapterRegex.exec(storyText)) !== null) {
    chapters.push({ title: match[1].trim(), text: match[2].trim() });
  }
  const paragraphs = storyText.split('\n').filter(p => p.trim().length > 40).slice(0, 7);

  const sceneConfigs = [
    { chapter: 'Chapter I',   title: 'The Arrival',   subtitle: `Born Under ${lagnaSign} Rising`,  pose: 'newborn' as const, planet: 'Moon',    bgGradient: 'from-indigo-950 via-purple-950 to-slate-950',  accentColor: '#C0C8E0', lifeAge: 'Birth' },
    { chapter: 'Chapter II',  title: 'The Unfolding', subtitle: 'Childhood & Wonder',              pose: 'child' as const,   planet: 'Moon',    bgGradient: 'from-blue-950 via-cyan-950 to-slate-950',      accentColor: '#7DD3FC', lifeAge: 'Ages 0–12' },
    { chapter: 'Chapter III', title: 'The Awakening', subtitle: 'Youth & Discovery',               pose: 'youth' as const,   planet: 'Jupiter', bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',   accentColor: '#6EE7B7', lifeAge: 'Ages 13–25' },
    { chapter: 'Chapter IV',  title: 'The Forge',     subtitle: 'Ambition & Achievement',          pose: 'adult' as const,   planet: 'Sun',     bgGradient: 'from-amber-950 via-orange-950 to-slate-950',   accentColor: '#FCD34D', lifeAge: 'Ages 26–40' },
    { chapter: 'Chapter V',   title: 'The Union',     subtitle: 'Love, Bonds & Partnership',       pose: 'couple' as const,  planet: 'Venus',   bgGradient: 'from-rose-950 via-pink-950 to-slate-950',      accentColor: '#FDA4AF', lifeAge: 'Ages 30–50' },
    { chapter: 'Chapter VI',  title: 'The Deepening', subtitle: 'Wisdom & Harvest',                pose: 'elder' as const,   planet: 'Saturn',  bgGradient: 'from-violet-950 via-purple-950 to-slate-950',  accentColor: '#C4B5FD', lifeAge: 'Ages 50–70' },
    { chapter: 'Chapter VII', title: 'The Eternal',   subtitle: 'Soul Purpose & Legacy',           pose: 'cosmic' as const,  planet: 'Ketu',    bgGradient: 'from-slate-950 via-indigo-950 to-black',       accentColor: '#E0E7FF', lifeAge: 'The Soul' },
  ];

  return sceneConfigs.map((cfg, i) => {
    const planetData = PLANET_DATA[cfg.planet] || PLANET_DATA['Moon'];
    const chapterText = chapters[i]?.text || paragraphs[i] || '';
    return {
      id: i,
      chapter: cfg.chapter,
      title: cfg.title,
      subtitle: cfg.subtitle,
      narrativeText: chapterText.slice(0, 320) || `The ${cfg.title.toLowerCase()} — a chapter of profound significance in the cosmic journey of ${name}.`,
      planet: cfg.planet,
      planetSymbol: planetData.symbol,
      planetColor: cfg.accentColor,
      bgGradient: cfg.bgGradient,
      accentColor: cfg.accentColor,
      characterPose: cfg.pose,
      lifeAge: cfg.lifeAge,
      starsCount: 40 + i * 8,
    };
  });
}

// ─── Single Scene Component ───────────────────────────────────────────────────

function CinematicScene({ scene, name, planets }: {
  scene: StoryScene; name: string;
  planets: Array<{ name: string; rashi: string; house: number }>;
}) {
  const orbPlanets = planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu').slice(0, 3);
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${scene.bgGradient}`}>
      <StarField count={scene.starsCount} color={scene.accentColor} />
      <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: '60%', height: '60%', top: '20%', left: '20%', backgroundColor: scene.accentColor + '08' }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} />
      {orbPlanets.map((p, i) => (
        <PlanetOrb key={p.name} planet={p.name}
          x={i === 0 ? '5%' : i === 1 ? '78%' : '85%'}
          y={i === 0 ? '15%' : i === 1 ? '12%' : '55%'}
          delay={i * 0.8} />
      ))}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center text-center gap-5">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="px-4 py-1.5 rounded-full border text-xs font-semibold tracking-widest uppercase"
          style={{ borderColor: scene.accentColor + '60', color: scene.accentColor, backgroundColor: scene.accentColor + '15' }}>
          {scene.chapter} · {scene.lifeAge}
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring', stiffness: 80 }}
          className="w-44 h-44 md:w-60 md:h-60">
          <CharacterFigure pose={scene.characterPose} color={scene.accentColor} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-1"
            style={{ color: scene.accentColor, textShadow: `0 0 30px ${scene.accentColor}60` }}>
            {scene.title}
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-light">{scene.subtitle}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }} className="text-2xl font-semibold text-white/90">
          {name}
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="text-sm md:text-base leading-relaxed text-white/80 italic max-w-lg"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
          {scene.narrativeText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#+\s/g, '')}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: scene.accentColor + '20', border: `1px solid ${scene.accentColor}40` }}>
          <span className="text-lg">{PLANET_DATA[scene.planet]?.emoji}</span>
          <span className="text-xs font-medium" style={{ color: scene.accentColor }}>
            {scene.planet} — Cosmic Ruler of this Chapter
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Scene Navigation Dots ────────────────────────────────────────────────────

function SceneNav({ scenes, current, onSelect }: {
  scenes: StoryScene[]; current: number; onSelect: (i: number) => void;
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
      {scenes.map((scene, i) => (
        <button key={i} onClick={() => onSelect(i)} title={scene.title} className="transition-all duration-300">
          <motion.div className="rounded-full"
            style={{ height: 8, backgroundColor: i === current ? scene.accentColor : 'rgba(255,255,255,0.3)',
              boxShadow: i === current ? `0 0 8px ${scene.accentColor}` : 'none' }}
            animate={{ width: i === current ? 24 : 8 }}
            transition={{ duration: 0.3 }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main StoryAnimator Component ────────────────────────────────────────────

export default function StoryAnimator({
  name, storyText, storyEvents = [], lagnaSign = 'Aries',
  moonSign = 'Cancer', sunSign = 'Leo', birthYear = 1990,
  planets = [], currentDasha = 'Jupiter',
}: StoryAnimatorProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenes = buildScenesFromData(name, storyText, storyEvents, lagnaSign, moonSign, sunSign, birthYear, planets, currentDasha);

  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        setCurrentScene(prev => (prev + 1) % scenes.length);
      }, 8000);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [autoPlay, scenes.length]);

  const goNext = () => setCurrentScene(prev => Math.min(prev + 1, scenes.length - 1));
  const goPrev = () => setCurrentScene(prev => Math.max(prev - 1, 0));
  const scene = scenes[currentScene];

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full rounded-2xl overflow-hidden'}`}>
      <SceneNav scenes={scenes} current={currentScene} onSelect={setCurrentScene} />
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setAutoPlay(!autoPlay)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all"
          style={{ backgroundColor: autoPlay ? scene.accentColor + '40' : 'rgba(0,0,0,0.4)' }}>
          {autoPlay ? '⏸ Pause' : '▶ Auto-Play'}
        </button>
        <button onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 text-white/80 hover:text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          {isFullscreen ? '⊙ Exit' : '⛶ Full'}
        </button>
      </div>
      <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[85vh] min-h-[600px]'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={currentScene} className="absolute inset-0"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}>
            <CinematicScene scene={scene} name={name} planets={planets} />
          </motion.div>
        </AnimatePresence>
      </div>
      <button onClick={goPrev} disabled={currentScene === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 text-white text-xl disabled:opacity-20 hover:opacity-100 transition-all"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>‹</button>
      <button onClick={goNext} disabled={currentScene === scenes.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 text-white text-xl disabled:opacity-20 hover:opacity-100 transition-all"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>›</button>
      <div className="absolute bottom-8 left-0 right-0 z-50 p-4 flex items-center justify-between backdrop-blur-md bg-black/30 border-t border-white/10">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-widest">{scene.chapter}</p>
          <p className="text-sm font-semibold text-white">{scene.title} — {scene.lifeAge}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">{currentScene + 1} / {scenes.length}</p>
          <p className="text-xs font-medium" style={{ color: scene.accentColor }}>
            {PLANET_DATA[scene.planet]?.emoji} {scene.planet} Mahadasha
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/80 text-center">
        <p className="text-[10px] text-white/30 italic">
          ⚠️ For entertainment &amp; informational purposes only. Consult a professional astrologer for guidance.
        </p>
      </div>
    </div>
  );
}
