'use client';

import React from 'react';
import { CalibrationData, ColorAnalysisResult } from '@/types';
import { Sliders, SunMedium, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

interface ColorCalibrationViewProps {
  calibrationData: CalibrationData;
  colourValues: ColorAnalysisResult;
  imageUrl: string;
}

export const ColorCalibrationView: React.FC<ColorCalibrationViewProps> = ({
  calibrationData,
  colourValues,
  imageUrl,
}) => {
  const { whiteGain, sampledPatches, qualityMetrics } = calibrationData;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Colorimetric Lighting Calibration</h3>
            <p className="text-xs text-slate-500">
              Reference card white balance & optical illumination normalization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {calibrationData.referenceDetected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reference Card Calibrated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              Standard Card Not Detected
            </span>
          )}
        </div>
      </div>

      {/* Grid: Visual Reference Patches & Gains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Sampled Reference Patches */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Sampled Reference Standards (From Card)
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* White Patch */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center text-center">
              <div 
                className="w-10 h-10 rounded-md border border-slate-300 shadow-xs mb-2" 
                style={{ backgroundColor: sampledPatches.white.hex }}
              />
              <span className="text-[10px] font-bold text-slate-600 uppercase">White Patch</span>
              <span className="text-[10px] font-mono text-slate-500">{sampledPatches.white.hex}</span>
              <span className="text-[9px] font-mono text-slate-400">R:{sampledPatches.white.r} G:{sampledPatches.white.g} B:{sampledPatches.white.b}</span>
            </div>

            {/* Gray Patch */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center text-center">
              <div 
                className="w-10 h-10 rounded-md border border-slate-300 shadow-xs mb-2" 
                style={{ backgroundColor: sampledPatches.gray.hex }}
              />
              <span className="text-[10px] font-bold text-slate-600 uppercase">18% Gray</span>
              <span className="text-[10px] font-mono text-slate-500">{sampledPatches.gray.hex}</span>
              <span className="text-[9px] font-mono text-slate-400">R:{sampledPatches.gray.r} G:{sampledPatches.gray.g} B:{sampledPatches.gray.b}</span>
            </div>

            {/* Black Patch */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center text-center">
              <div 
                className="w-10 h-10 rounded-md border border-slate-300 shadow-xs mb-2" 
                style={{ backgroundColor: sampledPatches.black.hex }}
              />
              <span className="text-[10px] font-bold text-slate-600 uppercase">Black Patch</span>
              <span className="text-[10px] font-mono text-slate-500">{sampledPatches.black.hex}</span>
              <span className="text-[9px] font-mono text-slate-400">R:{sampledPatches.black.r} G:{sampledPatches.black.g} B:{sampledPatches.black.b}</span>
            </div>
          </div>

          {/* Illumination Gains Factor */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                Computed Von Kries Chromatic Gains:
              </span>
              <span className="font-mono text-[11px] text-blue-600 font-bold">
                kR: {whiteGain.r.toFixed(2)} | kG: {whiteGain.g.toFixed(2)} | kB: {whiteGain.b.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Adjusts sensor response to emulate standardized D65 illuminant (6500K daylight), canceling yellow indoor incandescent or overcast ambient tints.
            </p>
          </div>
        </div>

        {/* Right: Color Shift Comparison */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Reagent Colorimeter Normalization
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Raw Sensor */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded border border-slate-300 shrink-0" 
                  style={{ backgroundColor: colourValues.raw.hex }}
                />
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">Raw Sensor Sample</div>
                  <div className="text-xs font-mono font-bold text-slate-800">{colourValues.raw.hex}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                <div>RGB: ({colourValues.raw.r}, {colourValues.raw.g}, {colourValues.raw.b})</div>
                <div>HSV: {colourValues.raw.hsv?.h}° {colourValues.raw.hsv?.s}% {colourValues.raw.hsv?.v}%</div>
              </div>
            </div>

            {/* Calibrated */}
            <div className="bg-white p-3.5 rounded-lg border border-blue-200 bg-blue-50/20">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-blue-500 shrink-0 shadow-xs" 
                  style={{ backgroundColor: colourValues.calibrated.hex }}
                />
                <div>
                  <div className="text-[10px] font-bold uppercase text-blue-600">Calibrated Reading</div>
                  <div className="text-xs font-mono font-bold text-slate-900">{colourValues.calibrated.hex}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-700 space-y-0.5">
                <div>RGB: ({colourValues.calibrated.r}, {colourValues.calibrated.g}, {colourValues.calibrated.b})</div>
                <div>HSV: {colourValues.calibrated.hsv?.h}° {colourValues.calibrated.hsv?.s}% {colourValues.calibrated.hsv?.v}%</div>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Laplacian Sharpness Variance:</span>
              <span className="font-mono font-semibold">{qualityMetrics.blurVariance} (Min threshold: 45)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mean Luminance Exposure:</span>
              <span className="font-mono font-semibold">{qualityMetrics.meanBrightness} / 255</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Luminance Contrast Deviation:</span>
              <span className="font-mono font-semibold">{qualityMetrics.contrast}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
