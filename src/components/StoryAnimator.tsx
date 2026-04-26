'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  gender?: string;
  storyText: string;
  /** Rendering/prompt tone: 'default' | 'mythic' */
  tone?: 'default' | 'mythic';
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

// ─── Pronoun Helper ───────────────────────────────────────────────────────────

function getPronouns(gender?: string) {
  if (gender === 'female') return { sub: 'she', obj: 'her', pos: 'her', ref: 'herself' };
  if (gender === 'nonbinary' || gender === 'they' || gender === 'prefer_not')
    return { sub: 'they', obj: 'them', pos: 'their', ref: 'themselves' };
  return { sub: 'he', obj: 'him', pos: 'his', ref: 'himself' };
}

// ─── Animated SVG Characters — 3D-shaded, gender-aware ──────────────────────

function NewbornFigure({ color, gender }: { color: string; gender?: string }) {
  const isFemale = gender === 'female';
  return (
    <svg viewBox="0 0 140 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nb-body" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.9"/>
        </radialGradient>
        <radialGradient id="nb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
        <filter id="nb-shadow">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor={color} floodOpacity="0.4"/>
        </filter>
      </defs>
      {/* Cosmic glow */}
      <circle cx="70" cy="80" r="60" fill="url(#nb-glow)" />
      {/* Orbital rings */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.circle key={i}
          cx={70 + 54 * Math.cos((angle * Math.PI) / 180)}
          cy={80 + 54 * Math.sin((angle * Math.PI) / 180)}
          r="2.5" fill={color} opacity="0.7"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.5, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
      <motion.g animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        {/* Body — 3D swaddled */}
        <ellipse cx="70" cy="100" rx="28" ry="36" fill="url(#nb-body)" filter="url(#nb-shadow)" />
        <ellipse cx="70" cy="100" rx="28" ry="36" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        {/* Shading fold */}
        <ellipse cx="58" cy="95" rx="8" ry="14" fill="white" opacity="0.12" />
        {/* Head */}
        <circle cx="70" cy="62" r="22" fill="url(#nb-body)" filter="url(#nb-shadow)" />
        <circle cx="70" cy="62" r="22" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
        {/* Face highlight */}
        <ellipse cx="63" cy="57" rx="7" ry="9" fill="white" opacity="0.18" />
        {/* Eyes */}
        <circle cx="63" cy="62" r="3.5" fill="#1a1a2e" />
        <circle cx="77" cy="62" r="3.5" fill="#1a1a2e" />
        <circle cx="64.2" cy="60.8" r="1.2" fill="white" opacity="0.9" />
        <circle cx="78.2" cy="60.8" r="1.2" fill="white" opacity="0.9" />
        {/* Smile */}
        <path d="M64 68 Q70 73 76 68" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Halo for newborn */}
        <motion.ellipse cx="70" cy="42" rx="22" ry="6" fill="none" stroke={color} strokeWidth="1.5"
          animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
        {/* Star on forehead */}
        <circle cx="70" cy="52" r="2.5" fill={color} opacity="0.9" />
      </motion.g>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.line key={i}
          x1={70 + 22 * Math.cos((angle * Math.PI) / 180)}
          y1={62 + 22 * Math.sin((angle * Math.PI) / 180)}
          x2={70 + 40 * Math.cos((angle * Math.PI) / 180)}
          y2={62 + 40 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="1.5" strokeLinecap="round"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.33 }}
        />
      ))}
    </svg>
  );
}

function ChildFigure({ color, gender }: { color: string; gender?: string }) {
  const isFemale = gender === 'female';
  return (
    <svg viewBox="0 0 140 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ch-skin" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffe0c0" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#d4956a" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="ch-cloth" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.9"/>
        </radialGradient>
        <filter id="ch-shadow"><feDropShadow dx="2" dy="5" stdDeviation="5" floodColor={color} floodOpacity="0.35"/></filter>
      </defs>
      <motion.g animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '70px 100px' }}>
        {/* Shadow on floor */}
        <ellipse cx="70" cy="168" rx="28" ry="6" fill={color} opacity="0.18" />
        {/* Legs */}
        <rect x="55" y="132" width="12" height="34" rx="6" fill="url(#ch-cloth)" />
        <rect x="73" y="132" width="12" height="34" rx="6" fill="url(#ch-cloth)" />
        {/* Shoes */}
        <ellipse cx="61" cy="166" rx="10" ry="5" fill={color} opacity="0.7" />
        <ellipse cx="79" cy="166" rx="10" ry="5" fill={color} opacity="0.7" />
        {/* Body */}
        <rect x="50" y="90" width="40" height="46" rx="14" fill="url(#ch-cloth)" filter="url(#ch-shadow)" />
        {/* Body highlight */}
        <ellipse cx="61" cy="100" rx="8" ry="14" fill="white" opacity="0.15" />
        {isFemale && <path d="M50 120 Q70 128 90 120" fill={color} opacity="0.35" />}
        {/* Arms */}
        <motion.line x1="50" y1="102" x2="30" y2="90" stroke="url(#ch-cloth)" strokeWidth="12" strokeLinecap="round"
          animate={{ x2: [30, 25, 30], y2: [90, 82, 90] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.line x1="90" y1="102" x2="110" y2="90" stroke="url(#ch-cloth)" strokeWidth="12" strokeLinecap="round"
          animate={{ x2: [110, 115, 110], y2: [90, 82, 90] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Head */}
        <circle cx="70" cy="76" r="22" fill="url(#ch-skin)" filter="url(#ch-shadow)" />
        {/* Head highlight */}
        <ellipse cx="63" cy="70" rx="8" ry="10" fill="white" opacity="0.2" />
        {/* Hair */}
        {isFemale
          ? <><path d="M48 70 Q70 48 92 70" fill="#3d2010" opacity="0.85" /><path d="M48 70 Q42 85 46 100" stroke="#3d2010" strokeWidth="5" fill="none" /><path d="M92 70 Q98 85 94 100" stroke="#3d2010" strokeWidth="5" fill="none" /></>
          : <path d="M48 72 Q70 50 92 72 Q88 58 70 54 Q52 58 48 72Z" fill="#3d2010" opacity="0.85" />
        }
        {/* Eyes */}
        <circle cx="63" cy="76" r="4" fill="#1a1a2e" /><circle cx="77" cy="76" r="4" fill="#1a1a2e" />
        <circle cx="64.3" cy="74.7" r="1.5" fill="white" opacity="0.9" /><circle cx="78.3" cy="74.7" r="1.5" fill="white" opacity="0.9" />
        {/* Smile */}
        <path d="M63 84 Q70 90 77 84" stroke="#c07040" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </motion.g>
      {[0, 1, 2].map(i => (
        <motion.text key={i} x={28 + i * 32} y="28" fontSize="18" textAnchor="middle"
          animate={{ y: [28, 16, 28], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}>⭐</motion.text>
      ))}
    </svg>
  );
}

function YouthFigure({ color, gender }: { color: string; gender?: string }) {
  const isFemale = gender === 'female';
  return (
    <svg viewBox="0 0 140 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="yu-skin" cx="38%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#ffe0c0" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#c4845a" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="yu-cloth" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.92"/>
        </radialGradient>
        <filter id="yu-shadow"><feDropShadow dx="3" dy="6" stdDeviation="6" floodColor={color} floodOpacity="0.35"/></filter>
      </defs>
      <motion.g animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="70" cy="192" rx="22" ry="5" fill={color} opacity="0.2" />
        {/* Legs */}
        <rect x="55" y="148" width="14" height="42" rx="7" fill="url(#yu-cloth)" />
        <rect x="71" y="148" width="14" height="42" rx="7" fill="url(#yu-cloth)" />
        <ellipse cx="62" cy="190" rx="12" ry="5" fill={color} opacity="0.65" />
        <ellipse cx="78" cy="190" rx="12" ry="5" fill={color} opacity="0.65" />
        {/* Body */}
        <rect x="48" y="98" width="44" height="55" rx="14" fill="url(#yu-cloth)" filter="url(#yu-shadow)" />
        <ellipse cx="61" cy="110" rx="9" ry="16" fill="white" opacity="0.14" />
        {isFemale && <path d="M48 138 Q70 148 92 138" fill={color} opacity="0.3" />}
        {/* Arms */}
        <line x1="48" y1="112" x2="26" y2="124" stroke="url(#yu-cloth)" strokeWidth="13" strokeLinecap="round" />
        <line x1="92" y1="112" x2="114" y2="124" stroke="url(#yu-cloth)" strokeWidth="13" strokeLinecap="round" />
        {/* Book in hand */}
        <rect x="14" y="116" width="18" height="22" rx="2" fill={color} opacity="0.85" />
        <line x1="23" y1="116" x2="23" y2="138" stroke="white" strokeWidth="1.2" opacity="0.5" />
        {/* Head */}
        <circle cx="70" cy="82" r="24" fill="url(#yu-skin)" filter="url(#yu-shadow)" />
        <ellipse cx="62" cy="74" rx="9" ry="11" fill="white" opacity="0.18" />
        {/* Hair */}
        {isFemale
          ? <><path d="M46 78 Q70 54 94 78" fill="#2d1a08" opacity="0.9" /><path d="M46 78 Q40 96 44 116" stroke="#2d1a08" strokeWidth="6" fill="none"/><path d="M94 78 Q100 96 96 116" stroke="#2d1a08" strokeWidth="6" fill="none"/></>
          : <path d="M47 80 Q70 56 93 80 Q89 63 70 59 Q51 63 47 80Z" fill="#2d1a08" opacity="0.9" />
        }
        {/* Eyes */}
        <circle cx="62" cy="82" r="4.5" fill="#1a1a2e" /><circle cx="78" cy="82" r="4.5" fill="#1a1a2e" />
        <circle cx="63.5" cy="80.5" r="1.6" fill="white" opacity="0.9" /><circle cx="79.5" cy="80.5" r="1.6" fill="white" opacity="0.9" />
        <path d="M63 90 Q70 95 77 90" stroke="#b07050" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </motion.g>
      {[0, 1, 2, 3].map(i => (
        <motion.circle key={i} cx={100 + (i % 2) * 22} cy={65 + Math.floor(i / 2) * 26}
          r="4" fill={color}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </svg>
  );
}

function AdultFigure({ color, gender }: { color: string; gender?: string }) {
  const isFemale = gender === 'female';
  return (
    <svg viewBox="0 0 140 220" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ad-skin" cx="38%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#ffe0c0" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#b87045" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="ad-cloth" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.92"/>
        </radialGradient>
        <filter id="ad-shadow"><feDropShadow dx="3" dy="7" stdDeviation="7" floodColor={color} floodOpacity="0.4"/></filter>
      </defs>
      {/* Confidence aura rings */}
      {[0, 1, 2, 3].map(i => (
        <motion.rect key={i} x={14 + i * 22} y={176 - i * 18} width="22" height="5"
          rx="2" fill={color} opacity="0.22"
          animate={{ opacity: [0.12, 0.35, 0.12] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
        />
      ))}
      <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <ellipse cx="70" cy="210" rx="24" ry="6" fill={color} opacity="0.2" />
        {/* Legs */}
        <rect x="54" y="158" width="15" height="48" rx="7" fill="url(#ad-cloth)" />
        <rect x="71" y="158" width="15" height="48" rx="7" fill="url(#ad-cloth)" />
        <ellipse cx="62" cy="206" rx="13" ry="6" fill={color} opacity="0.7" />
        <ellipse cx="79" cy="206" rx="13" ry="6" fill={color} opacity="0.7" />
        {/* Body — isFemale gets slight hourglass */}
        {isFemale
          ? <path d="M48 105 Q48 148 52 162 Q70 168 88 162 Q92 148 92 105 Q80 98 70 100 Q60 98 48 105Z" fill="url(#ad-cloth)" filter="url(#ad-shadow)" />
          : <rect x="46" y="102" width="48" height="62" rx="14" fill="url(#ad-cloth)" filter="url(#ad-shadow)" />
        }
        <ellipse cx="59" cy="116" rx="10" ry="18" fill="white" opacity="0.13" />
        {/* Arms */}
        <motion.line x1="46" y1="118" x2="24" y2="104" stroke="url(#ad-cloth)" strokeWidth="14" strokeLinecap="round"
          animate={{ x2: [24, 20, 24], y2: [104, 92, 104] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <line x1="94" y1="118" x2="116" y2="130" stroke="url(#ad-cloth)" strokeWidth="14" strokeLinecap="round" />
        {/* Star badge */}
        <motion.text x="14" y="100" fontSize="22"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '25px 96px' }}>⭐</motion.text>
        {/* Head */}
        <circle cx="70" cy="86" r="25" fill="url(#ad-skin)" filter="url(#ad-shadow)" />
        <ellipse cx="61" cy="78" rx="9" ry="12" fill="white" opacity="0.2" />
        {/* Hair */}
        {isFemale
          ? <><path d="M45 82 Q70 56 95 82" fill="#2d1a08" opacity="0.9"/><path d="M45 82 Q38 103 42 126" stroke="#2d1a08" strokeWidth="7" fill="none"/><path d="M95 82 Q102 103 98 126" stroke="#2d1a08" strokeWidth="7" fill="none"/></>
          : <path d="M46 84 Q70 60 94 84 Q90 66 70 62 Q50 66 46 84Z" fill="#2d1a08" opacity="0.9" />
        }
        {/* Eyes + brows */}
        <path d="M59 78 Q63 75 67 78" stroke="#2d1a08" strokeWidth="2" fill="none" />
        <path d="M73 78 Q77 75 81 78" stroke="#2d1a08" strokeWidth="2" fill="none" />
        <circle cx="63" cy="85" r="4.5" fill="#1a1a2e" /><circle cx="77" cy="85" r="4.5" fill="#1a1a2e" />
        <circle cx="64.5" cy="83.5" r="1.6" fill="white" opacity="0.9" /><circle cx="78.5" cy="83.5" r="1.6" fill="white" opacity="0.9" />
        <path d="M64 93 Q70 98 76 93" stroke="#b07050" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function CoupleFigure({ color, gender }: { color: string; gender?: string }) {
  return (
    <svg viewBox="0 0 180 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cp-skin" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffe0c0" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#c4845a" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="cp-m" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.9"/>
        </radialGradient>
        <radialGradient id="cp-f" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#e879a0" stopOpacity="0.9"/>
        </radialGradient>
        <filter id="cp-shadow"><feDropShadow dx="2" dy="5" stdDeviation="5" floodColor={color} floodOpacity="0.35"/></filter>
      </defs>
      {/* Floating hearts */}
      {[0, 1, 2].map(i => (
        <motion.text key={i} x={62 + i * 22} y="28" fontSize="16" textAnchor="middle"
          animate={{ y: [28, 10, 28], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}>💗</motion.text>
      ))}
      {/* Connecting dashed line */}
      <motion.line x1="55" y1="108" x2="125" y2="108"
        stroke={color} strokeWidth="2" strokeDasharray="5 4"
        animate={{ strokeDashoffset: [0, -18] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
      {/* Male figure */}
      <motion.g animate={{ x: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <ellipse cx="45" cy="192" rx="22" ry="5" fill={color} opacity="0.2"/>
        <rect x="33" y="150" width="12" height="38" rx="6" fill="url(#cp-m)"/>
        <rect x="49" y="150" width="12" height="38" rx="6" fill="url(#cp-m)"/>
        <rect x="28" y="98" width="38" height="56" rx="12" fill="url(#cp-m)" filter="url(#cp-shadow)"/>
        <ellipse cx="37" cy="108" rx="7" ry="13" fill="white" opacity="0.15"/>
        <circle cx="47" cy="82" r="20" fill="url(#cp-skin)" filter="url(#cp-shadow)"/>
        <ellipse cx="40" cy="76" rx="7" ry="9" fill="white" opacity="0.2"/>
        <path d="M27 98 Q22 84 28 77" stroke="#2d1a08" strokeWidth="6" fill="none" />
        <path d="M27 79 Q22 70 28 63" fill="#2d1a08" opacity="0.9"/>
        <path d="M28 76 Q47 56 66 76 Q62 62 47 58 Q32 62 28 76Z" fill="#2d1a08" opacity="0.9"/>
        <circle cx="41" cy="82" r="3.5" fill="#1a1a2e"/><circle cx="53" cy="82" r="3.5" fill="#1a1a2e"/>
        <circle cx="42.2" cy="80.8" r="1.2" fill="white" opacity="0.9"/><circle cx="54.2" cy="80.8" r="1.2" fill="white" opacity="0.9"/>
        <path d="M42 89 Q47 93 52 89" stroke="#b07050" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <line x1="28" y1="112" x2="10" y2="126" stroke="url(#cp-m)" strokeWidth="10" strokeLinecap="round"/>
        <line x1="66" y1="112" x2="84" y2="126" stroke="url(#cp-m)" strokeWidth="10" strokeLinecap="round"/>
      </motion.g>
      {/* Female figure */}
      <motion.g animate={{ x: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <ellipse cx="135" cy="192" rx="22" ry="5" fill="#e879a0" opacity="0.2"/>
        {/* Dress */}
        <path d="M110 150 Q112 185 120 190 Q135 195 150 190 Q158 185 160 150 Q148 155 135 154 Q122 155 110 150Z" fill="url(#cp-f)" opacity="0.85"/>
        <rect x="118" y="98" width="34" height="56" rx="12" fill="url(#cp-f)" filter="url(#cp-shadow)"/>
        <ellipse cx="126" cy="108" rx="7" ry="13" fill="white" opacity="0.15"/>
        <circle cx="135" cy="82" r="20" fill="url(#cp-skin)" filter="url(#cp-shadow)"/>
        <ellipse cx="128" cy="76" rx="7" ry="9" fill="white" opacity="0.2"/>
        {/* Long hair */}
        <path d="M115 78 Q135 56 155 78" fill="#2d1a08" opacity="0.9"/>
        <path d="M115 78 Q108 98 112 126" stroke="#2d1a08" strokeWidth="7" fill="none"/>
        <path d="M155 78 Q162 98 158 126" stroke="#2d1a08" strokeWidth="7" fill="none"/>
        <circle cx="129" cy="82" r="3.5" fill="#1a1a2e"/><circle cx="141" cy="82" r="3.5" fill="#1a1a2e"/>
        <circle cx="130.2" cy="80.8" r="1.2" fill="white" opacity="0.9"/><circle cx="142.2" cy="80.8" r="1.2" fill="white" opacity="0.9"/>
        <path d="M130 89 Q135 93 140 89" stroke="#b07050" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <line x1="118" y1="112" x2="96" y2="126" stroke="url(#cp-f)" strokeWidth="10" strokeLinecap="round"/>
        <line x1="152" y1="112" x2="170" y2="126" stroke="url(#cp-f)" strokeWidth="10" strokeLinecap="round"/>
        {/* Bindi */}
        <circle cx="135" cy="74" r="2.5" fill="#e879a0" opacity="0.9"/>
      </motion.g>
    </svg>
  );
}

function ElderFigure({ color, gender }: { color: string; gender?: string }) {
  const isFemale = gender === 'female';
  return (
    <svg viewBox="0 0 140 210" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="el-skin" cx="38%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#f0d0a0" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#a07040" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="el-cloth" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.88"/>
        </radialGradient>
        <filter id="el-shadow"><feDropShadow dx="3" dy="6" stdDeviation="6" floodColor={color} floodOpacity="0.35"/></filter>
      </defs>
      <motion.circle cx="70" cy="90" r="55" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 5"
        animate={{ r: [55, 64, 55], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }} />
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <ellipse cx="70" cy="200" rx="22" ry="5" fill={color} opacity="0.18"/>
        {/* Robe / dhoti body */}
        {isFemale
          ? <path d="M42 110 Q44 155 50 165 Q70 172 90 165 Q96 155 98 110 Q84 105 70 108 Q56 105 42 110Z" fill="url(#el-cloth)" filter="url(#el-shadow)" />
          : <path d="M45 110 Q46 158 52 168 Q70 174 88 168 Q94 158 95 110 Q82 103 70 106 Q58 103 45 110Z" fill="url(#el-cloth)" filter="url(#el-shadow)" />
        }
        <ellipse cx="58" cy="122" rx="9" ry="18" fill="white" opacity="0.12"/>
        {/* Head */}
        <circle cx="70" cy="86" r="24" fill="url(#el-skin)" filter="url(#el-shadow)" />
        <ellipse cx="62" cy="79" rx="8" ry="10" fill="white" opacity="0.18"/>
        {/* White / grey hair */}
        {isFemale
          ? <><path d="M46 82 Q70 58 94 82" fill="#d0d0c8" opacity="0.92"/><path d="M46 82 Q40 104 44 130" stroke="#d0d0c8" strokeWidth="7" fill="none"/><path d="M94 82 Q100 104 96 130" stroke="#d0d0c8" strokeWidth="7" fill="none"/></>
          : <path d="M47 84 Q70 60 93 84 Q89 67 70 63 Q51 67 47 84Z" fill="#d0d0c8" opacity="0.92" />
        }
        {/* Beard for male elder */}
        {!isFemale && <path d="M57 96 Q70 108 83 96 Q78 118 70 120 Q62 118 57 96Z" fill="#d0d0c8" opacity="0.7" />}
        {/* Eyes — wise/squinting */}
        <path d="M60 86 Q63 83 66 86" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M74 86 Q77 83 80 86" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M62 93 Q70 99 78 93" stroke="#8a6040" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Tilak / bindi */}
        <circle cx="70" cy="74" r="2.5" fill={color} opacity="0.9" />
        {/* Walking staff */}
        <line x1="96" y1="104" x2="96" y2="195" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <circle cx="96" cy="100" r="6" fill={color} opacity="0.85" />
      </motion.g>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <motion.circle key={i}
          cx={70 + 52 * Math.cos((angle * Math.PI) / 180)}
          cy={90 + 52 * Math.sin((angle * Math.PI) / 180)}
          r="5" fill={color} opacity="0.65"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </svg>
  );
}

function CosmicFigure({ color, gender }: { color: string; gender?: string }) {
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cos-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="72" fill="url(#cos-glow)" />
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
          animate={{ opacity: [0.12, 0.4, 0.12] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <motion.circle cx="80" cy="80" r="18" fill={color} opacity="0.88"
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
            cx: [80 + radius * Math.cos((i * 120 * Math.PI) / 180), 80 + radius * Math.cos(((i * 120 + 180) * Math.PI) / 180), 80 + radius * Math.cos((i * 120 * Math.PI) / 180)],
            cy: [80 + radius * Math.sin((i * 120 * Math.PI) / 180), 80 + radius * Math.sin(((i * 120 + 180) * Math.PI) / 180), 80 + radius * Math.sin((i * 120 * Math.PI) / 180)],
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

function CharacterFigure({ pose, color, gender }: { pose: StoryScene['characterPose']; color: string; gender?: string }) {
  switch (pose) {
    case 'newborn': return <NewbornFigure color={color} gender={gender} />;
    case 'child':   return <ChildFigure color={color} gender={gender} />;
    case 'youth':   return <YouthFigure color={color} gender={gender} />;
    case 'adult':   return <AdultFigure color={color} gender={gender} />;
    case 'couple':  return <CoupleFigure color={color} gender={gender} />;
    case 'elder':   return <ElderFigure color={color} gender={gender} />;
    case 'cosmic':  return <CosmicFigure color={color} gender={gender} />;
    default:        return <CosmicFigure color={color} gender={gender} />;
  }
}

// ─── Scene Builder ────────────────────────────────────────────────────────────

function buildScenesFromData(
  name: string, gender: string | undefined, storyText: string, _events: StoryEvent[],
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
    const pr = getPronouns(gender);
    return {
      id: i,
      chapter: cfg.chapter,
      title: cfg.title,
      subtitle: cfg.subtitle,
      narrativeText: chapterText.slice(0, 320) || `The ${cfg.title.toLowerCase()} — a chapter of profound significance in the cosmic journey of ${name}. ${pr.sub.charAt(0).toUpperCase() + pr.sub.slice(1)} walks a path written in the stars.`,
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

function CinematicScene({ scene, name, gender, planets }: {
  scene: StoryScene; name: string; gender?: string;
  planets: Array<{ name: string; rashi: string; house: number }>;
}) {
  const orbPlanets = planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu').slice(0, 3);

  // Parse challenge and lesson from enriched narrative text
  const text = scene.narrativeText || '';
  const challengeMatch = text.match(/challenge[s]?[:\s]+([^.!?\n]{20,120}[.!?])/i)
    || text.match(/struggle[s]?[:\s]+([^.!?\n]{20,120}[.!?])/i)
    || text.match(/difficult[y]?[:\s]+([^.!?\n]{20,120}[.!?])/i);
  const lessonMatch = text.match(/lesson[s]?[:\s]+([^.!?\n]{20,120}[.!?])/i)
    || text.match(/learn[s]?[:\s]+([^.!?\n]{20,120}[.!?])/i)
    || text.match(/growth[:\s]+([^.!?\n]{20,120}[.!?])/i)
    || text.match(/action[s]?[:\s]+([^.!?\n]{20,120}[.!?])/i);

  // Strip the matched sentence from the main narrative to avoid duplication
  let mainText = text
    .replace(/\*\*/g, '').replace(/\*/g, '').replace(/#+\s/g, '')
    .replace('⚠️ For entertainment & informational purposes only.', '')
    .replace('⚠️ For entertainment and informational purposes only.', '')
    .trim();
  // Limit main text to ~260 chars for readability
  if (mainText.length > 300) mainText = mainText.slice(0, 297) + '…';

  const challengeText = challengeMatch?.[1]?.trim();
  const lessonText = lessonMatch?.[1]?.trim();

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-start overflow-hidden bg-gradient-to-br ${scene.bgGradient}`}>
      <StarField count={scene.starsCount} color={scene.accentColor} />
      <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: '60%', height: '60%', top: '10%', left: '20%', backgroundColor: scene.accentColor + '08' }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} />
      {orbPlanets.map((p, i) => (
        <PlanetOrb key={p.name} planet={p.name}
          x={i === 0 ? '3%' : i === 1 ? '80%' : '86%'}
          y={i === 0 ? '10%' : i === 1 ? '8%' : '48%'}
          delay={i * 0.8} />
      ))}

      {/* Scrollable content area */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-14 pb-28 flex flex-col items-center gap-4 overflow-y-auto h-full scroll-smooth">
        {/* Chapter badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="px-4 py-1.5 rounded-full border text-xs font-semibold tracking-widest uppercase"
          style={{ borderColor: scene.accentColor + '60', color: scene.accentColor, backgroundColor: scene.accentColor + '15' }}>
          {scene.chapter} · {scene.lifeAge}
        </motion.div>

        {/* Character figure — smaller */}
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring', stiffness: 80 }}
          className="w-28 h-28 md:w-36 md:h-36">
          <CharacterFigure pose={scene.characterPose} color={scene.accentColor} gender={gender} />
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-0.5"
            style={{ color: scene.accentColor, textShadow: `0 0 30px ${scene.accentColor}60` }}>
            {scene.title}
          </h2>
          <p className="text-base md:text-lg text-white/70 font-light">{scene.subtitle}</p>
          <p className="text-sm font-semibold text-white/90 mt-1">{name}</p>
        </motion.div>

        {/* Main narrative — bigger and more readable */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="text-sm md:text-base leading-relaxed text-white/85 text-center max-w-lg"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
          {mainText || `The ${scene.title.toLowerCase()} — a chapter of profound significance in the cosmic journey of ${name}.`}
        </motion.p>

        {/* Challenge card */}
        {challengeText && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.7 }}
            className="w-full max-w-md rounded-xl px-4 py-3 border-l-4 backdrop-blur-sm"
            style={{ background: 'rgba(239,68,68,0.12)', borderLeftColor: '#EF4444', borderTop: '1px solid rgba(239,68,68,0.2)', borderRight: '1px solid rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#FCA5A5' }}>⚠️ Challenge in this period</p>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed">{challengeText}</p>
          </motion.div>
        )}

        {/* Lesson / Growth card */}
        {lessonText && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.7 }}
            className="w-full max-w-md rounded-xl px-4 py-3 border-l-4 backdrop-blur-sm"
            style={{ background: 'rgba(34,197,94,0.10)', borderLeftColor: '#22C55E', borderTop: '1px solid rgba(34,197,94,0.2)', borderRight: '1px solid rgba(34,197,94,0.1)', borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#86EFAC' }}>✨ What to learn & do</p>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed">{lessonText}</p>
          </motion.div>
        )}

        {/* Planet ruler badge */}
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
  name, gender, storyText, storyEvents = [], lagnaSign = 'Aries',
  moonSign = 'Cancer', sunSign = 'Leo', birthYear = 1990,
  planets = [], currentDasha = 'Jupiter',
  tone = 'default',
}: StoryAnimatorProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [enrichedTexts, setEnrichedTexts] = useState<Record<number, string>>({});
  const [loadingScene, setLoadingScene] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenes = buildScenesFromData(name, gender, storyText, storyEvents, lagnaSign, moonSign, sunSign, birthYear, planets, currentDasha);

  // Lightweight client-side mythic tone transformer. This keeps the transformation local
  // so we can preview 'mythic' tone immediately without server calls. For production
  // enrichment, the /api/enrich-story endpoint will accept a tone param.
  const transformedStoryText = tone === 'mythic'
    ? storyText
        .replace(/\band\b/gi, '— and —')
        .replace(/\bwas\b/gi, 'was, as the stars foretold,')
        .replace(/\bthe Seeker\b/gi, 'the Seeker, child of the sky')
    : storyText;

  // Enrich a scene with GPT-4o-mini
  const enrichScene = useCallback(async (sceneIdx: number) => {
    if (enrichedTexts[sceneIdx] || loadingScene === sceneIdx) return;
    const scene = scenes[sceneIdx];
    if (!scene) return;
    setLoadingScene(sceneIdx);
    try {
      const res = await fetch('/api/enrich-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, gender, sceneIndex: sceneIdx, sceneTitle: scene.title,
          lifeAge: scene.lifeAge, lagnaSign, moonSign, sunSign,
          birthYear, birthCity: '', currentDasha, planet: scene.planet,
          planets,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enriched) {
          // Replace anonymisation token with real first name
          const firstName = name.trim().split(/\s+/)[0];
          const corrected = data.enriched
            .replace(/\bthe Seeker\b/g, firstName)
            .replace(/\bThe Seeker\b/g, firstName);
          setEnrichedTexts(prev => ({ ...prev, [sceneIdx]: corrected }));
        }
      }
    } catch {
      // Silently fail — fall back to local narrative text
    } finally {
      setLoadingScene(null);
    }
  }, [enrichedTexts, loadingScene, scenes, name, gender, lagnaSign, moonSign, sunSign, birthYear, currentDasha, planets]);

  // Auto-enrich current scene when it changes
  useEffect(() => {
    enrichScene(currentScene);
  }, [currentScene, enrichScene]);

  // Auto-play logic
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

  // Stop speech when scene changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentScene]);

  function handleSpeak() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = (enrichedTexts[currentScene] || scene.narrativeText)
      .replace(/\*\*/g, '').replace(/\*/g, '').replace(/#+\s/g, '').split('⚠️')[0].trim();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.72;
    utterance.pitch = 0.82;
    utterance.volume = 1.0;
    // Prefer a deep, calm male voice — temple saint style
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.toLowerCase().includes('daniel'))
      || voices.find(v => v.name.toLowerCase().includes('alex'))
      || voices.find(v => v.lang === 'en-IN' && !v.name.toLowerCase().includes('compact'))
      || voices.find(v => v.lang === 'en-GB' && !v.name.toLowerCase().includes('compact'))
      || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('compact'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  const scene = scenes[currentScene];

  // Merge enriched text or show loading state
  const displayScene = {
    ...scene,
    narrativeText: enrichedTexts[currentScene] || scene.narrativeText,
  };
  const isEnriching = loadingScene === currentScene;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full rounded-2xl overflow-hidden'}`}>
      <SceneNav scenes={scenes} current={currentScene} onSelect={setCurrentScene} />
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button onClick={handleSpeak}
          className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all"
          style={{ backgroundColor: isSpeaking ? (scene.accentColor + '40') : 'rgba(0,0,0,0.4)' }}
          title={isSpeaking ? 'Stop narration' : 'Listen to this scene'}>
          {isSpeaking ? '🔇 Stop' : '🔊 Listen'}
        </button>
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
      {/* AI enrichment indicator */}
      {isEnriching && (
        <div className="absolute top-14 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          <motion.div className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity }} />
          <span className="text-[10px] text-white/60">AI enriching story…</span>
        </div>
      )}
      {enrichedTexts[currentScene] && !isEnriching && (
        <div className="absolute top-14 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400">✨ AI-enhanced</span>
        </div>
      )}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[90vh] min-h-[660px]'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={currentScene} className="absolute inset-0"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}>
            <CinematicScene scene={displayScene} name={name} gender={gender} planets={planets} />
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
