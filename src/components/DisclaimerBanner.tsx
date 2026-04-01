'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoInformationCircle } from 'react-icons/io5';

interface DisclaimerBannerProps {
  t: Record<string, string>;
}

export default function DisclaimerBanner({ t }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="relative w-full z-50 bg-saffron-50 border-b border-saffron-200"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <IoInformationCircle className="h-5 w-5 text-saffron-500 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-snug flex-1">
              <span className="font-semibold text-saffron-700">Disclaimer:</span>{' '}
              {t.disclaimer_text || 'This site is for information and entertainment only. Not a substitute for professional astrological consultation. Please consult a qualified astrologer for accurate guidance.'}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Dismiss"
            >
              <IoClose className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
