'use client';

import { motion } from 'framer-motion';
import { IoStar, IoHeart } from 'react-icons/io5';

interface AgeGateProps {
  t: Record<string, string>;
  underage: boolean;
}

export default function AgeGate({ t, underage }: AgeGateProps) {
  if (!underage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0014]/95 backdrop-blur-lg p-4"
    >
      <div className="card-glass max-w-lg text-center space-y-6 p-8">
        {/* Animated star ring */}
        <div className="relative w-24 h-24 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            {[...Array(6)].map((_, i) => (
              <IoStar
                key={i}
                className="absolute text-gold-400 text-xl"
                style={{
                  top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
                  left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <IoHeart className="text-5xl text-cosmic-400" />
          </motion.div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-bold text-gold-400">
          {t.underage_title || 'Welcome, Young Star! ✨'}
        </h2>
        <p className="text-base sm:text-lg text-white/90 leading-relaxed">
          {t.underage_message ||
            'The universe has wonderful things planned for you. Focus on your studies, be kind, follow your curiosity, and trust that your path is bright. Come back when you\'re 18 for a full reading!'}
        </p>

        <div className="mt-4 p-4 bg-cosmic-900/50 rounded-xl border border-cosmic-500/30">
          <p className="text-sm text-white/70 italic">
            ⚠️ {t.disclaimer_text || 'This site is for entertainment and informational purposes only.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
