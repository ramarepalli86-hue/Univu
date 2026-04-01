'use client';

import { motion } from 'framer-motion';

interface StoryAnimatorProps {
  name: string;
  storyText: string;
}

export default function StoryAnimator({ name, storyText }: StoryAnimatorProps) {
  const paragraphs = storyText.split('\n').filter((p) => p.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl bg-warm-100 border border-warm-300 p-6 sm:p-8 space-y-5"
    >
      <h3 className="text-lg font-display font-semibold text-gray-800 text-center">
        Life Story — {name}
      </h3>

      <div className="space-y-4">
        {paragraphs.map((para, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.25, duration: 0.5 }}
            className="text-sm sm:text-base text-gray-700 leading-relaxed"
          >
            {para.trim()}
          </motion.p>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center italic pt-2 border-t border-warm-300">
        Based on comparative analysis of Vedic, Western, Egyptian, and Roman astrological traditions
      </p>
    </motion.div>
  );
}
