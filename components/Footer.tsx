'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="w-full bg-[#0B1F3A] border-t-2 border-[#FF9933] text-white text-xs mt-auto">
      {/* Top Banner with Emblem and Ministry Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 p-0.5 flex items-center justify-center">
            {/* Ashoka Pillar icon / emblem */}
            <span className="text-[14px]">🏛️</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide">
              {language === 'hi' ? 'गृह मंत्रालय' : 'Ministry of Home Affairs'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300 font-medium">
              {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
          <span className="bg-[#FF9933]/20 text-[#FF9933] px-2 py-0.5 rounded border border-[#FF9933]/30 font-bold">
            E-JAANCH v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </span>
          <span className="hidden md:inline text-slate-400">
            {language === 'hi' ? 'डिजिटल फील्ड टेस्ट दस्तावेज़ीकरण प्रणाली' : 'Digital Field Test Documentation System'}
          </span>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-[11px] text-slate-300 leading-relaxed font-medium">
        <p>
          {language === 'hi'
            ? 'वैधानिक सूचना: E-Jaanch कलरिमेट्रिक टेस्ट के इमेज विश्लेषण पर आधारित एक प्रारंभिक (Presumptive) फील्ड-टेस्ट परिणाम प्रदान करता है। यह प्रयोगशाला पुष्टि का विकल्प नहीं है।'
            : 'Statutory Notice: E-Jaanch provides a presumptive field-test result based on image analysis of a colorimetric test. It does not replace laboratory confirmatory testing.'}
        </p>
      </div>
    </footer>
  );
};
