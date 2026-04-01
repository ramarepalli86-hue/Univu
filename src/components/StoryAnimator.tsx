'use client';

import { motion } from 'framer-motion';
import { IoMoon, IoSunny, IoStar, IoPlanet, IoSparkles } from 'react-icons/io5';

interface StoryAnimatorProps {
  name: string;
  storyText: string;
}

const celestialIcons = [IoMoon, IoSunny, IoStar, IoPlanet, IoSparkles];

export default function StoryAnimator({ name, storyText }: StoryAnimatorProps) {
  const sentences = storyText.split('. ').filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-cosmic-950 via-[#0d0025] to-cosmic-950 border border-cosmic-700/30 p-6 sm:p-8"
    >
      {/* Floating celestial icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {celestialIcons.map((Icon, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 10 * (i % 2 === 0 ? 1 : -1), 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute text-cosmic-500/20"
            style={{
              top: `${15 + i * 18}%`,
              left: `${10 + i * 20}%`,
              fontSize: `${2 + i * 0.5}rem`,
            }}
          >
            <Icon />
          </motion.div>
        ))}
      </div>

      {/* Story title */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl sm:text-2xl font-display font-bold text-gold-400 mb-6 text-center relative z-10"
      >
        ✨ The Celestial Story of {name} ✨
      </motion.h3>

      {/* Animated story paragraphs — anime-style reveal */}
      <div className="space-y-4 relative z-10">
        {sentences.map((sentence, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.4, duration: 0.6 }}
            className={`flex items-start gap-3 ${
              i % 2 === 0 ? '' : 'flex-row-reverse text-right'
            }`}
          >
            {/* Speech bubble */}
            <div
              className={`flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 ${
                i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'
              }`}
            >
              <p className="text-sm sm:text-base text-white/90 leading-relaxed italic">
                &ldquo;{sentence.trim()}.&rdquo;
              </p>
            </div>
            {/* Avatar bubble */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-500 to-gold-500 flex items-center justify-center text-white text-lg"
            >
              {i % 2 === 0 ? '🌙' : '⭐'}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Footer glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-cosmic-500/20 blur-3xl rounded-full"
      />
    </motion.div>
  );
}
