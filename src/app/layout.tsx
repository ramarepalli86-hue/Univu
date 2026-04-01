import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Univu — See the Universe. Know Yourself.',
  description: 'Discover your cosmic blueprint through Vedic (South Indian) and Western astrology. For entertainment and informational purposes only. Consult a qualified astrologer for personal guidance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-cream-50">{children}</body>
    </html>
  );
}
