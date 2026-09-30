import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { ANALYSIS_CONFIG } from '@/lib/image-analysis/config';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact }) => {
  if (compact) {
    return (
      <div className="bg-[#FFF7ED] border-l-4 border-[#FF7722] p-3 text-xs text-[#9A3412] rounded-r-xl flex items-start gap-2.5 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wide text-[#C2410C]">Official Field-Test Protocol:</span>{' '}
          <span className="font-semibold">{ANALYSIS_CONFIG.STATUTORY_DISCLAIMER}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-200 border-l-4 border-l-[#FF7722] rounded-2xl p-4 sm:p-5 my-3 flex items-start gap-3.5 shadow-sm">
      <div className="p-2.5 bg-[#0A1E3F] rounded-xl text-white shrink-0 shadow-md">
        <ShieldCheck className="w-5 h-5 text-[#FF7722]" />
      </div>
      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="font-black text-[#0A1E3F] flex flex-wrap items-center gap-2 mb-1 uppercase tracking-wider text-xs">
          <span>Official Field-Test Presumptive Notice</span>
          <span className="bg-[#FFF7ED] text-[#E65100] border border-[#FF8C00]/40 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
            Field Evidence Protocol
          </span>
        </div>
        <p className="font-bold text-slate-900 leading-normal">
          {ANALYSIS_CONFIG.STATUTORY_DISCLAIMER}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          This digital evaluation serves as preliminary field evidentiary documentation. Quantitative substance identification and court-admissible confirmatory proof require laboratory GC-MS or spectrophotometric analysis.
        </p>
      </div>
    </div>
  );
};
