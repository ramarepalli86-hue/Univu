import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Univu — See the Universe. Know Yourself.',
  description: 'Discover your cosmic blueprint through Telugu (Vedic) and Western astrology. For entertainment and informational purposes only. Consult a qualified astrologer for personal guidance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0014]">{children}</body>
    </html>
  );
}
