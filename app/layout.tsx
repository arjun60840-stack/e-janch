import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'E-Jaanch — Digital Field Test Documentation System',
  description: 'Forensic digital documentation, photometric calibration, and cryptographic auditing for colorimetric field-test kits.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-100 text-slate-900">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 selection:bg-[#FF9933] selection:text-[#0B1F3A]">
        <LanguageProvider>
          <Navigation />
          <main className="flex-1 pb-16">
            {children}
          </main>
          
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
