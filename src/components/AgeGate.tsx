'use client';

import { motion } from 'framer-motion';

interface AgeGateProps {
  t: Record<string, string>;
  underage: boolean;
}

export default function AgeGate({ t, underage }: AgeGateProps) {
  if (!underage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-warm-50/95 backdrop-blur-sm p-4"
    >
      <div className="card-main max-w-lg text-center space-y-5 p-8">
        <div className="text-5xl">✨</div>
        <h2 className="text-2xl font-display font-bold text-gray-800">
          {t.underage_title || 'Welcome, Young Star!'}
        </h2>
        <p className="text-base text-gray-600 leading-relaxed">
          {t.underage_message ||
            'The universe has wonderful things planned for you. Focus on your studies, be kind, follow your curiosity, and trust that your path is bright. Come back when you\'re 21 for a detailed reading!'}
        </p>
        <div className="p-3 bg-saffron-50 rounded-xl border border-saffron-200">
          <p className="text-xs text-gray-500 italic">
            {t.disclaimer_text || 'This site is for entertainment and informational purposes only.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
