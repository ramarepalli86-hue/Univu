'use client';

export default function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #0A2020 0%, #0F2A2A 60%, #1A1A0A 100%)' }}>
      <div className="max-w-md space-y-6">
        {/* Logo mark */}
        <div className="flex justify-center">
          <svg width="64" height="64" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="23" stroke="rgba(212,136,10,0.4)" strokeWidth="1.2" strokeDasharray="4 2.5"/>
            <circle cx="26" cy="26" r="15" stroke="rgba(26,107,107,0.8)" strokeWidth="1.5" fill="none"/>
            <circle cx="26" cy="26" r="6" fill="#D4880A" opacity="0.9"/>
            <circle cx="26" cy="11" r="2.2" fill="#D4880A" opacity="0.7"/>
            <circle cx="26" cy="41" r="2.2" fill="#D4880A" opacity="0.7"/>
            <circle cx="11" cy="26" r="2.2" fill="#D4880A" opacity="0.7"/>
            <circle cx="41" cy="26" r="2.2" fill="#D4880A" opacity="0.7"/>
          </svg>
        </div>

        <div>
          <h1 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '2.4rem', fontWeight: 700, letterSpacing: '0.14em', color: '#FFFFFF' }}>
            UNIVU
          </h1>
          <p className="text-xs tracking-widest font-semibold uppercase mt-1" style={{ color: 'rgba(212,136,10,0.8)' }}>
            Cosmic Blueprint
          </p>
        </div>

        <div className="h-px w-24 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #D4880A, transparent)' }} />

        <div className="space-y-3">
          <p className="text-2xl font-semibold" style={{ color: '#E5E7EB' }}>
            Coming Soon
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(229,231,235,0.6)' }}>
            We&apos;re preparing something extraordinary. Ancient Vedic wisdom meets modern astrology — your cosmic blueprint awaits.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['🕉️ Vedic', '♈ Western', '☯️ Chinese', '𓂀 Egyptian', '☀️ Mayan'].map(t => (
            <span key={t} className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: 'rgba(26,107,107,0.2)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(26,107,107,0.3)' }}>
              {t}
            </span>
          ))}
        </div>

        <p className="text-xs pt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          univu.vercel.app
        </p>
      </div>
    </div>
  );
}
