'use client';

import { motion } from 'framer-motion';
import { IoStar, IoMoon, IoSunny, IoLeaf, IoFlower, IoSparkles } from 'react-icons/io5';
import StoryAnimator from './StoryAnimator';

export interface ReadingResult {
  name: string;
  isUnderage: boolean;
  vedic: {
    rashi: string;
    nakshatra: string;
    summary: string;
  };
  western: {
    sunSign: string;
    moonSign: string;
    rising: string;
    summary: string;
  };
  combined: string;
  remedies: string[];
  story: string;
}

interface ReportCardProps {
  t: Record<string, string>;
  reading: ReadingResult;
}

const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};

export default function ReportCard({ t, reading }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="text-center space-y-3"
      >
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gold-400">
          {t.report_title || 'Your Cosmic Reading'}
        </h1>
        <p className="text-white/60 text-lg">
          Prepared for <span className="text-cosmic-400 font-semibold">{reading.name}</span>
        </p>
      </motion.div>

      {/* ════════════════════════════════════════════
          DISCLAIMER BANNER — INSIDE REPORT TOO
          ════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-red-900/40 border-2 border-red-500/60 rounded-xl p-5 text-center"
      >
        <p className="text-base font-bold text-red-200 leading-relaxed">
          ⚠️ DISCLAIMER: This reading is for <span className="text-yellow-300">INFORMATION and ENTERTAINMENT purposes ONLY</span>.
          It should NOT be used as guidance or a path for life decisions.
          Please <span className="text-yellow-300">CONSULT A PROFESSIONAL ASTROLOGER</span> for true and accurate details.
        </p>
      </motion.div>

      {/* Vedic Section */}
      <motion.section
        custom={1}
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
        className="card-glass space-y-4"
      >
        <h2 className="text-xl font-display font-semibold text-cosmic-300 flex items-center gap-2">
          <IoMoon className="text-cosmic-400" />
          {t.report_vedic || 'Vedic (Telugu) Analysis'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/50 mb-1">Rashi (Moon Sign)</p>
            <p className="text-lg font-semibold text-gold-400">{reading.vedic.rashi}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/50 mb-1">Nakshatra (Birth Star)</p>
            <p className="text-lg font-semibold text-gold-400">{reading.vedic.nakshatra}</p>
          </div>
        </div>
        <p className="text-white/80 leading-relaxed">{reading.vedic.summary}</p>
      </motion.section>

      {/* Western Section */}
      <motion.section
        custom={2}
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
        className="card-glass space-y-4"
      >
        <h2 className="text-xl font-display font-semibold text-cosmic-300 flex items-center gap-2">
          <IoSunny className="text-gold-400" />
          {t.report_western || 'Western Analysis'}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/50 mb-1">Sun Sign</p>
            <p className="text-lg font-semibold text-gold-400">{reading.western.sunSign}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/50 mb-1">Moon Sign</p>
            <p className="text-lg font-semibold text-gold-400">{reading.western.moonSign}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-white/50 mb-1">Rising Sign</p>
            <p className="text-lg font-semibold text-gold-400">{reading.western.rising}</p>
          </div>
        </div>
        <p className="text-white/80 leading-relaxed">{reading.western.summary}</p>
      </motion.section>

      {/* Combined Insight */}
      <motion.section
        custom={3}
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
        className="card-glass space-y-4"
      >
        <h2 className="text-xl font-display font-semibold text-cosmic-300 flex items-center gap-2">
          <IoStar className="text-gold-400" />
          {t.report_combined || 'Combined Insight'}
        </h2>
        <p className="text-white/80 leading-relaxed text-base">{reading.combined}</p>
      </motion.section>

      {/* Remedies */}
      <motion.section
        custom={4}
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
        className="card-glass space-y-4"
      >
        <h2 className="text-xl font-display font-semibold text-cosmic-300 flex items-center gap-2">
          <IoLeaf className="text-green-400" />
          {t.report_remedies || 'Remedies & Guidance'}
        </h2>
        <ul className="space-y-3">
          {reading.remedies.map((remedy, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
              className="flex items-start gap-3 text-white/80"
            >
              <IoFlower className="text-cosmic-400 flex-shrink-0 mt-1" />
              <span>{remedy}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* Anime-Style Celestial Story */}
      <motion.section
        custom={5}
        variants={sectionVariant}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-display font-semibold text-cosmic-300 flex items-center gap-2 mb-4">
          <IoSparkles className="text-gold-400" />
          {t.report_story_title || 'Your Celestial Story'}
        </h2>
        <StoryAnimator name={reading.name} storyText={reading.story} />
      </motion.section>

      {/* Final Disclaimer at bottom of report */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="bg-amber-900/30 border border-amber-500/40 rounded-xl p-5 text-center space-y-2"
      >
        <p className="text-sm font-bold text-amber-200">
          ⚠️ REMINDER: Everything above is for INFORMATION and ENTERTAINMENT ONLY.
        </p>
        <p className="text-xs text-amber-200/70 italic">
          Do not use this as guidance or a path. Consult a professional astrologer for true details.
          The creators of Univu accept no responsibility for actions taken based on these readings.
        </p>
      </motion.div>
    </motion.div>
  );
}
