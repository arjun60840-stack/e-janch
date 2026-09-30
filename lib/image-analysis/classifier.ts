// ==============================================================================
// E-JAANCH: COLORIMETRIC CLASSIFIER & CONFIDENCE ENGINE
// Converts color spaces (RGB -> HSV -> CIELAB), calculates Delta-E, and classifies
// ==============================================================================

import { ACTIVE_KIT_PROFILE, ANALYSIS_CONFIG } from './config';
import { 
  RGBColor, 
  TestResult, 
  QualityScore, 
  ColorAnalysisResult, 
  CalibrationData 
} from '@/types';
import { 
  NormalizedROI, 
  sampleSubRegion, 
  performColorCalibration, 
  applyCalibrationGain, 
  rgbToHex 
} from './calibration';
import { assessImageQuality } from './quality';

/**
 * Converts hex to RGB numbers
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Converts sRGB [0-255] to HSV color representation.
 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

/**
 * Converts sRGB [0-255] to CIE-L*a*b* (D65 illuminant).
 */
export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  // sRGB gamma expansion to linear RGB
  const pivotRgb = (c: number) => {
    const v = c / 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  };

  const rLin = pivotRgb(r) * 100;
  const gLin = pivotRgb(g) * 100;
  const bLin = pivotRgb(b) * 100;

  // Linear RGB to XYZ using Standard sRGB D65 matrix
  const x = rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805;
  const y = rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722;
  const z = rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505;

  // XYZ to CIELAB using D65 reference white [Xn=95.047, Yn=100.0, Zn=108.883]
  const pivotXyz = (c: number) => {
    return c > 0.008856 ? Math.cbrt(c) : 7.787 * c + 16 / 116;
  };

  const xNorm = pivotXyz(x / 95.047);
  const yNorm = pivotXyz(y / 100.0);
  const zNorm = pivotXyz(z / 108.883);

  const l = 116 * yNorm - 16;
  const labA = 500 * (xNorm - yNorm);
  const labB = 200 * (yNorm - zNorm);

  return {
    l: Math.round(l * 10) / 10,
    a: Math.round(labA * 10) / 10,
    b: Math.round(labB * 10) / 10,
  };
}

/**
 * Calculates CIE76 Delta-E distance between two Lab colors.
 */
export function calculateDeltaE(
  lab1: { l: number; a: number; b: number },
  lab2: { l: number; a: number; b: number }
): number {
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

export interface PipelineAnalysisOutput {
  result: TestResult;
  confidence: number;
  quality_score: QualityScore;
  colour_values: ColorAnalysisResult;
  calibration_data: CalibrationData;
  reason: string;
  detected_drug: string; // Auto-classified drug name (or 'None Detected')
}

export interface KitTestOption {
  id: string;
  name: string;
  expectedColorHex: string;
  expectedColorName: string;
}

export interface AnalysisPipelineOptions {
  customCardROI?: NormalizedROI;
  customTestROI?: NormalizedROI;
  expectedColorHex?: string;
  expectedColorName?: string;
  enforceReferenceCard?: boolean;
  kitTests?: KitTestOption[]; // Full panel for auto drug detection
}

/**
 * Full image processing and classification pipeline.
 */
export function runImageAnalysisPipeline(
  imageData: ImageData,
  options?: AnalysisPipelineOptions
): PipelineAnalysisOutput {
  const cardROI = options?.customCardROI || ANALYSIS_CONFIG.DEFAULT_ROI.REFERENCE_CARD;
  const testROI = options?.customTestROI || ANALYSIS_CONFIG.DEFAULT_ROI.TEST_RESULT_AREA;

  // 1. Quality Assessment
  const quality = assessImageQuality(imageData);

  // 2. Reference Card Sampling and Calibration
  const { calibrationData: partialCalib, whiteGain } = performColorCalibration(imageData, cardROI);

  const calibration_data: CalibrationData = {
    ...partialCalib,
    qualityMetrics: {
      blurVariance: quality.blurVariance,
      meanBrightness: quality.meanBrightness,
      contrast: quality.contrast,
      isAcceptable: quality.isAcceptable,
      issues: quality.issues,
    },
  };

  // 3. Test Region Color Extraction
  const rawTestColor = sampleSubRegion(imageData, testROI);
  rawTestColor.hsv = rgbToHsv(rawTestColor.r, rawTestColor.g, rawTestColor.b);
  rawTestColor.lab = rgbToLab(rawTestColor.r, rawTestColor.g, rawTestColor.b);

  // 4. Color Normalization
  const calibratedTestColor = applyCalibrationGain(rawTestColor, whiteGain);
  calibratedTestColor.hsv = rgbToHsv(calibratedTestColor.r, calibratedTestColor.g, calibratedTestColor.b);
  calibratedTestColor.lab = rgbToLab(calibratedTestColor.r, calibratedTestColor.g, calibratedTestColor.b);

  // 5. Target Color Determination
  let targetExpectedHex = rgbToHex(ACTIVE_KIT_PROFILE.positiveColor.r, ACTIVE_KIT_PROFILE.positiveColor.g, ACTIVE_KIT_PROFILE.positiveColor.b);
  let targetExpectedName = ACTIVE_KIT_PROFILE.positiveColor.name;

  if (options?.expectedColorHex) {
    targetExpectedHex = options.expectedColorHex;
    targetExpectedName = options.expectedColorName || 'Target Chromophore';
  }

  const targetRgb = hexToRgb(targetExpectedHex);
  const posLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);
  const negLab = rgbToLab(ACTIVE_KIT_PROFILE.negativeColor.r, ACTIVE_KIT_PROFILE.negativeColor.g, ACTIVE_KIT_PROFILE.negativeColor.b);

  const deltaEtoPositive = calculateDeltaE(calibratedTestColor.lab, posLab);
  const deltaEtoNegative = calculateDeltaE(calibratedTestColor.lab, negLab);

  let result: TestResult = 'INCONCLUSIVE';
  let confidence = 50;
  let reason = '';

  // Check 1: Reference card presence check
  const enforceCard = options?.enforceReferenceCard ?? false;
  if (enforceCard && !calibration_data.referenceDetected) {
    result = 'INVALID_IMAGE';
    confidence = 0;
    reason = 'Reference colour card not detected. Please capture the image again with the calibration card clearly in view.';
  } else if (quality.score === 'INVALID' || (!quality.isAcceptable && quality.blurVariance < 20)) {
    result = 'INVALID_IMAGE';
    confidence = 0;
    reason = `Image quality is insufficient for colorimetric reading: ${quality.issues.join('; ')}.`;
  } else if (!calibration_data.referenceDetected && quality.score === 'POOR') {
    result = 'INVALID_IMAGE';
    confidence = 0;
    reason = 'Reference colour card not detected. Please capture the image again.';
  } else {
    // Classification Logic
    const sat = calibratedTestColor.hsv.s;
    const hue = calibratedTestColor.hsv.h;

    const targetHsv = rgbToHsv(targetRgb.r, targetRgb.g, targetRgb.b);
    const hueDiff = Math.min(Math.abs(hue - targetHsv.h), 360 - Math.abs(hue - targetHsv.h));

    if (deltaEtoPositive <= 38 || (hueDiff <= 45 && sat >= 25)) {
      result = 'POSITIVE';
      const distanceFactor = Math.max(0, 1 - (deltaEtoPositive / 50));
      const satFactor = Math.min(0.2, (sat / 100) * 0.2);
      confidence = Math.min(99, Math.round((0.76 + distanceFactor * 0.18 + satFactor) * 100));
      reason = `Distinct chromophore reaction detected (Calibrated Hex ${calibratedTestColor.hex}, Hue ${hue}°, Saturation ${sat}%). Calibrated profile closely matches the positive standard (${targetExpectedName}) with ΔE of ${deltaEtoPositive.toFixed(1)}.`;
    } else if (deltaEtoNegative <= ACTIVE_KIT_PROFILE.negativeThresholdDeltaE || (sat < 18 && calibratedTestColor.hsv.v > 40)) {
      result = 'NEGATIVE';
      const distanceFactor = Math.max(0, 1 - (deltaEtoNegative / 60));
      confidence = Math.min(98, Math.round((0.78 + distanceFactor * 0.18) * 100));
      reason = `No reaction chromophore observed (Calibrated Hex ${calibratedTestColor.hex}, Hue ${hue}°, Saturation ${sat}%). Color profile is consistent with negative reagent blank (${ACTIVE_KIT_PROFILE.negativeColor.name}) with ΔE of ${deltaEtoNegative.toFixed(1)}.`;
    } else {
      result = 'INCONCLUSIVE';
      confidence = 52;
      reason = `Ambiguous colorimetric reading (Calibrated Hex ${calibratedTestColor.hex}, Hue ${hue}°, Saturation ${sat}%). Values fall within the borderline zone (ΔE to Positive: ${deltaEtoPositive.toFixed(1)}, ΔE to Negative: ${deltaEtoNegative.toFixed(1)}). Retesting or laboratory confirmation required.`;
    }

    if (quality.score === 'ACCEPTABLE') {
      confidence = Math.max(50, Math.round(confidence * 0.92));
    }
  }

  const colour_values: ColorAnalysisResult = {
    raw: rawTestColor,
    calibrated: calibratedTestColor,
    targetExpectedColor: result === 'POSITIVE' ? targetExpectedName : ACTIVE_KIT_PROFILE.negativeColor.name,
    deltaE: result === 'POSITIVE' ? Math.round(deltaEtoPositive * 10) / 10 : Math.round(deltaEtoNegative * 10) / 10,
  };

  // ─── Auto Drug Detection ────────────────────────────────────────────────────
  // When a full kit test panel is provided, find the closest matching drug
  // by calculating CIE76 Delta-E from the calibrated sample color to each
  // test's expected color. Closest match is declared the detected drug.
  let detected_drug = 'None Detected';
  if (result === 'POSITIVE' && options?.kitTests && options.kitTests.length > 0) {
    let minDeltaE = Infinity;
    let closestDrugName = options.kitTests[0].name;
    for (const test of options.kitTests) {
      const testRgb = hexToRgb(test.expectedColorHex);
      const testLab = rgbToLab(testRgb.r, testRgb.g, testRgb.b);
      const de = calculateDeltaE(calibratedTestColor.lab!, testLab);
      if (de < minDeltaE) {
        minDeltaE = de;
        closestDrugName = test.name;
      }
    }
    detected_drug = closestDrugName;
  }

  return {
    result,
    confidence,
    quality_score: quality.score,
    colour_values,
    calibration_data,
    reason,
    detected_drug,
  };
}
