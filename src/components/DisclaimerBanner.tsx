'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoWarning, IoClose, IoShieldCheckmark } from 'react-icons/io5';

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
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="relative w-full z-50"
        >
          {/* ═══════════════════════════════════════════════════════════════
              BIG DISCLAIMER BANNER — IMPOSSIBLE TO MISS
              ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 border-b-4 border-yellow-400">
            <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex items-start gap-4">
                {/* Warning Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-yellow-400 rounded-full p-2 animate-pulse">
                    <IoWarning className="h-8 w-8 text-red-800" />
                  </div>
                </div>

                {/* Banner Content */}
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-yellow-100 mb-2 flex items-center gap-2 tracking-wide">
                    <IoShieldCheckmark className="h-6 w-6" />
                    ⚠️ {t.disclaimer_title || 'IMPORTANT DISCLAIMER'} ⚠️
                  </h2>

                  <div className="space-y-3 text-white">
                    {/* PRIMARY MESSAGE — Bold, large, unmissable */}
                    <p className="text-base sm:text-lg font-bold leading-relaxed bg-black/30 rounded-lg px-4 py-3 border border-yellow-400/50">
                      🔴 This site is for <span className="text-yellow-300 underline underline-offset-2">INFORMATION and ENTERTAINMENT purposes ONLY</span>. 
                      It should <span className="text-yellow-300 underline underline-offset-2">NOT be used as guidance, direction, or a path</span> for 
                      any real-life decisions. These readings are computer-generated using classical rule-sets and 
                      are <span className="text-yellow-300 underline underline-offset-2">NOT accurate predictions of your future</span>.
                    </p>

                    {/* SECONDARY MESSAGE — Consult a professional */}
                    <p className="text-base sm:text-lg font-semibold leading-relaxed bg-black/30 rounded-lg px-4 py-3 border border-yellow-400/50">
                      🔴 Please <span className="text-yellow-300 underline underline-offset-2">CONSULT A PROFESSIONAL ASTROLOGER</span> for 
                      true and accurate details about your horoscope and life path. Do not base any personal, 
                      financial, health, or relationship decisions on what you read here.
                    </p>

                    {/* TERTIARY MESSAGE — Legal-style fine print */}
                    <p className="text-sm text-yellow-200/90 leading-relaxed italic">
                      By using Univu, you acknowledge and agree that all readings are generated for fun and learning only. 
                      The creators of Univu are not responsible for any actions taken based on these readings. 
                      This is not a substitute for professional astrological consultation.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setDismissed(true)}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                  aria-label="Dismiss disclaimer"
                >
                  <IoClose className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Accept Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setDismissed(true)}
                  className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold text-sm sm:text-base rounded-full transition-all duration-200 shadow-lg hover:shadow-yellow-400/50 transform hover:scale-105"
                >
                  ✅ I UNDERSTAND — THIS IS FOR ENTERTAINMENT ONLY
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
