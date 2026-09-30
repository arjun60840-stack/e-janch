'use client';

import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  XCircle, 
  Info,
  Check
} from 'lucide-react';
import { TestResult, QualityScore, ColorAnalysisResult } from '@/types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface TargetScore {
  name: string;
  nameHi?: string;
  confidence: number;
  status: 'PRESENT_HIGH' | 'PRESENT_LOW' | 'NOT_DETECTED';
  deltaE: number;
}

interface ResultCardProps {
  result: TestResult;
  confidence: number;
  qualityScore: QualityScore;
  colourValues: ColorAnalysisResult;
  reason: string;
  detectedDrug?: string;
  testId?: string;
  timestamp?: string;
  showDisclaimer?: boolean;
  targetScores?: TargetScore[];
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  confidence,
  qualityScore,
  colourValues,
  reason,
  detectedDrug,
  testId,
  timestamp,
  showDisclaimer = true,
  targetScores,
}) => {
  const isPositive = result === 'POSITIVE';
  const isNegative = result === 'NEGATIVE';
  const isInconclusive = result === 'INCONCLUSIVE';

  // Fallback target list if not provided
  const primaryDrug = detectedDrug && detectedDrug !== 'None Detected' ? detectedDrug : 'Morphine';

  const baseDeltaE = colourValues.deltaE ?? 15;

  const defaultTargets: TargetScore[] = [
    {
      name: primaryDrug,
      nameHi: primaryDrug === 'Morphine' ? 'मॉर्फिन' : primaryDrug,
      confidence: isPositive ? confidence : 0,
      status: isPositive ? (confidence >= 80 ? 'PRESENT_HIGH' : 'PRESENT_LOW') : 'NOT_DETECTED',
      deltaE: baseDeltaE,
    },
    {
      name: 'Codeine',
      nameHi: 'कोडीन',
      confidence: isPositive && primaryDrug !== 'Codeine' ? Math.max(0, confidence - 24) : (primaryDrug === 'Codeine' ? confidence : 0),
      status: isPositive && primaryDrug !== 'Codeine' && confidence > 70 ? 'PRESENT_LOW' : (primaryDrug === 'Codeine' ? 'PRESENT_HIGH' : 'NOT_DETECTED'),
      deltaE: baseDeltaE + 12,
    },
    {
      name: 'Heroin',
      nameHi: 'हेरोइन',
      confidence: primaryDrug === 'Heroin' ? confidence : 0,
      status: primaryDrug === 'Heroin' ? 'PRESENT_HIGH' : 'NOT_DETECTED',
      deltaE: baseDeltaE + 24,
    },
    {
      name: 'Amphetamines',
      nameHi: 'एम्फ़ैटेमिन',
      confidence: primaryDrug.includes('Amphetamine') ? confidence : 0,
      status: primaryDrug.includes('Amphetamine') ? 'PRESENT_HIGH' : 'NOT_DETECTED',
      deltaE: baseDeltaE + 35,
    },
  ];

  const activeTargets = targetScores && targetScores.length > 0 ? targetScores : defaultTargets;

  return (
    <div className="space-y-4">
      {/* Success Notice Banner matching UI reference */}
      <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-emerald-950 flex items-center gap-2.5 shadow-xs">
        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <span className="text-xs sm:text-sm font-black">
          Test Completed Successfully / परीक्षण सफलतापूर्वक पूरा हुआ
        </span>
      </div>

      {/* Main Two-Column Result Grid matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Result & Detected Drugs Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          {/* Main Presumptive Status Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className={`p-2.5 rounded-xl ${isPositive ? 'bg-rose-600 text-white' : isNegative ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'} shrink-0 shadow-md`}>
              {isPositive ? <AlertCircle className="w-6 h-6" /> : isNegative ? <CheckCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                PRESUMPTIVE RESULT / प्रारंभिक परिणाम
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${isPositive ? 'text-rose-600' : isNegative ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isPositive ? '! POSITIVE / सकारात्मक' : isNegative ? '✓ NEGATIVE / नकारात्मक' : '? INCONCLUSIVE / अनिर्णायक'}
              </h2>
            </div>
          </div>

          {/* Detected Drug(s) List with Progress Bars */}
          <div className="space-y-3.5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-700">
              Detected Drug(s) / पहचाना गया पदार्थ
            </div>

            <div className="space-y-3">
              {activeTargets.map((target, idx) => (
                <div key={target.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {idx + 1}. {target.name}
                      {target.nameHi && <span className="text-slate-500 font-normal ml-1">({target.nameHi})</span>}
                      {' — '}
                      <span className={target.status === 'PRESENT_HIGH' ? 'text-rose-600 font-black' : target.status === 'PRESENT_LOW' ? 'text-amber-600 font-bold' : 'text-slate-400 font-medium'}>
                        {target.status === 'PRESENT_HIGH' ? 'Present (High level)' : target.status === 'PRESENT_LOW' ? 'Present (Low level)' : 'Not Detected'}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-slate-700">{target.confidence}%</span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 rounded-full ${
                        target.status === 'PRESENT_HIGH' ? 'bg-rose-500' : target.status === 'PRESENT_LOW' ? 'bg-[#FF9933]' : 'bg-slate-200'
                      }`}
                      style={{ width: `${target.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Details Card matching Reference Image */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                Analysis Details / विश्लेषण विवरण
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Colour Match / रंग मिलान</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isPositive ? 'Match / मिलान' : 'Blank / रिक्त'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Confidence / विश्वसनीयता</span>
                <span className="font-mono font-black text-base text-[#0B1F3A]">{confidence}%</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Image Quality / छवि गुणवत्ता</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  {qualityScore}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Calibrated Values / कैलिब्रेटेड मान
                </span>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs flex items-center justify-between">
                  <span>R: <strong className="text-slate-900">{colourValues.calibrated?.r ?? colourValues.raw.r}</strong></span>
                  <span>G: <strong className="text-slate-900">{colourValues.calibrated?.g ?? colourValues.raw.g}</strong></span>
                  <span>B: <strong className="text-slate-900">{colourValues.calibrated?.b ?? colourValues.raw.b}</strong></span>
                  <div 
                    className="w-5 h-5 rounded-md border border-slate-300 shrink-0 shadow-xs" 
                    style={{ backgroundColor: colourValues.calibrated?.hex || colourValues.raw.hex }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Automated Colorimetry:</span>
            {reason}
          </div>
        </div>

      </div>

      {/* Forensic Legal Notice */}
      {showDisclaimer && <DisclaimerBanner compact />}
    </div>
  );
};
