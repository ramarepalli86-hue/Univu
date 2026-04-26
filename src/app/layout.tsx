import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Univu — See the Universe. Know Yourself.',
  description: 'Discover your cosmic blueprint through Vedic, Western, Chinese, Egyptian & Mayan astrology traditions. For entertainment purposes only.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Univu' },
  keywords: ['astrology', 'vedic astrology', 'birth chart', 'horoscope', 'nakshatra', 'entertainment', 'informational'],
  authors: [{ name: 'Univu' }],
  creator: 'Univu',
  publisher: 'Univu',
  robots: { index: true, follow: true, nocache: false },
  openGraph: {
    title: 'Univu — See the Universe. Know Yourself.',
    description: 'Personalised birth chart readings across Vedic, Western, Chinese, Egyptian & Mayan traditions. For entertainment purposes only.',
    type: 'website',
    url: 'https://univu.vercel.app',
    siteName: 'Univu',
  },
  twitter: {
    card: 'summary',
    title: 'Univu — Cosmic Blueprint',
    description: 'Personalised birth chart readings. For entertainment purposes only.',
  },
  other: {
    // Machine-readable disclaimer — picked up by search engines and legal bots
    'disclaimer': 'This site provides astrological readings for ENTERTAINMENT AND INFORMATIONAL PURPOSES ONLY. Nothing on this site constitutes professional advice of any kind (medical, legal, financial, psychological, or otherwise). Results are not guaranteed to be accurate. Consult a qualified professional for personal guidance.',
    'rating': 'general',
  },
};

// JSON-LD structured data — clearly marks the site as entertainment, not professional services
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Univu',
  url: 'https://univu.vercel.app',
  description: 'Astrological readings for entertainment and informational purposes only.',
  genre: 'Entertainment',
  audience: {
    '@type': 'Audience',
    audienceType: 'General public',
  },
  disclaimer: 'All readings are for entertainment and informational purposes only. Not professional advice of any kind.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#5B21B6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Legal disclaimer — machine-readable */}
        <meta name="disclaimer" content="For entertainment and informational purposes only. Not professional advice." />
        <meta name="rating" content="general" />
        {/* Structured data — marks site as entertainment genre */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen" style={{ background: '#F4F1EA' }}>{children}</body>
    </html>
  );
}
