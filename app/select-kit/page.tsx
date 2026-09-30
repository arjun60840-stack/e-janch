'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, FlaskConical, Shield, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { KIT_DEFINITIONS } from '@/lib/kits/kit-definitions';
import { KitType } from '@/types';

export default function SelectKitPage() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleSelectKit = (kitId: KitType) => {
    // Navigate directly into camera scanning with the selected kit
    router.push(`/new-test?kit=${kitId}`);
  };

  const kits: {
    id: KitType;
    num: number;
    titleEn: string;
    titleHi: string;
    descEn: string;
    descHi: string;
    badge: string;
    icon: string;
  }[] = [
    {
      id: 'STANDARD_NARCOTIC',
      num: 1,
      titleEn: 'Standard Narcotic Drugs Detection Kit',
      titleHi: 'मानक नारकोटिक ड्रग्स पहचान किट',
      descEn: 'Field reagent test for Opium, Morphine, Codeine, Heroin, Amphetamines, Cocaine, Cannabis, and Methaqualone.',
      descHi: 'अफीम, मॉर्फिन, कोडीन, हेरोइन, एम्फ़ैटेमिन, कोकीन, गांजा और मेथाक्वालोन के लिए त्वरित फील्ड पहचान।',
      badge: 'SNDK',
      icon: '📦',
    },
    {
      id: 'PRECURSOR_CHEMICAL',
      num: 2,
      titleEn: 'Precursor Chemicals Detection Kit',
      titleHi: 'पूर्ववर्ती रसायन पहचान किट',
      descEn: 'Identification of controlled precursors including Ephedrine, Pseudoephedrine, Acetic Anhydride, and Anthranilic Acid.',
      descHi: 'एफेड्रिन, स्यूडोएफेड्रिन, एसिटिक एनहाइड्राइड और एंथ्रानिलिक एसिड आदि नियंत्रित पूर्ववर्ती रसायनों की जांच।',
      badge: 'PCK',
      icon: '🧪',
    },
    {
      id: 'KETAMINE',
      num: 3,
      titleEn: 'Ketamine Detection Kit',
      titleHi: 'केटामाइन पहचान किट',
      descEn: 'Targeted colorimetric reagents for rapid screening of Ketamine and Ketamine Hydro-Chloride.',
      descHi: 'केटामाइन और केटामाइन हाइड्रोक्लोराइड की त्वरित फील्ड जांच के लिए विशेष पहचान किट।',
      badge: 'KET',
      icon: '🔬',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Heading */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[#FF9933] text-[#0B1F3A]">
              STEP 1 OF 3
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'hi' ? 'फील्ड परीक्षण प्रक्रिया' : 'Field Test Workflow'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0B1F3A] mt-2">
            Select Test Kit / {language === 'hi' ? 'परीक्षण किट चुनें' : 'परीक्षण किट चुनें'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {language === 'hi'
              ? 'उपयोग किए जा रहे अधिकृत परीक्षण किट का चयन करें। चयन के तुरंत बाद कैमरा स्कैनर खुल जाएगा।'
              : 'Select the authorized field testing kit. Camera scanning will initialize immediately.'}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.btnBack} / {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
        </Link>
      </div>

      {/* Kit Cards Stack (Exactly matches reference layout) */}
      <div className="space-y-4">
        {kits.map((kit) => (
          <div
            key={kit.id}
            onClick={() => handleSelectKit(kit.id)}
            className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-[#FF9933] hover:shadow-lg p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
          >
            {/* Left Accent indicator */}
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-[#0B1F3A] group-hover:bg-[#FF9933] transition-colors" />

            <div className="flex items-center gap-4 pl-2">
              {/* Number Badge */}
              <div className="w-12 h-12 rounded-2xl bg-[#FF9933] text-[#0B1F3A] font-black text-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                {kit.num}
              </div>

              {/* Kit Icon Visual placeholder */}
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                {kit.icon}
              </div>

              {/* Kit Details */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {kit.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1F3A] group-hover:text-[#FF9933] transition-colors">
                  {kit.titleEn}
                </h3>
                <h4 className="text-xs sm:text-sm font-semibold text-[#FF9933]">
                  {kit.titleHi}
                </h4>
                <p className="text-xs text-slate-500 max-w-2xl pt-1">
                  {language === 'hi' ? kit.descHi : kit.descEn}
                </p>
              </div>
            </div>

            {/* Right Arrow / Action */}
            <div className="flex items-center gap-2 self-end sm:self-center pr-2">
              <span className="hidden md:inline text-xs font-bold text-slate-600 group-hover:text-[#0B1F3A]">
                {language === 'hi' ? 'स्कैन शुरू करें' : 'Open Camera'}
              </span>
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#0B1F3A] group-hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-5 h-5 text-[#FF9933]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back button at bottom matching reference image */}
      <div className="pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back / वापस</span>
        </Link>
      </div>
    </div>
  );
}
