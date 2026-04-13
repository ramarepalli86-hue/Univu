'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerBannerProps {
  t: Record<string, string>;
}

export default function DisclaimerBanner({ t }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setDismissed(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 180 }}
          className="fixed bottom-4 z-50 left-0 right-0 flex justify-center pointer-events-none px-4"
        >
          <motion.div
            className="relative rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl pointer-events-auto overflow-hidden"
            style={{
              background: 'rgba(20,70,70,0.93)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 40px rgba(26,107,107,0.5)',
              maxWidth: '580px',
              width: '100%',
            }}
          >
            <span className="text-xl flex-shrink-0">🕉️</span>
            <p className="text-xs text-white/85 leading-snug flex-1">
              <span className="font-semibold text-white">For entertainment only.</span>{' '}
              {t.disclaimer_text || 'Not a substitute for professional astrological consultation.'}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all text-base leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
            {/* Auto-countdown bar at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 rounded-full"
              style={{ background: 'rgba(212,136,10,0.7)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
