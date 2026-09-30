// ==============================================================================
// E-JAANCH: REFERENCE CARD SAMPLING & COLOR CALIBRATION
// Samples reference color standards and computes illumination normalization gains
// ==============================================================================

import { ANALYSIS_CONFIG } from './config';
import { RGBColor, CalibrationData } from '@/types';

export interface NormalizedROI {
  x: number;     // 0.0 - 1.0 (relative left)
  y: number;     // 0.0 - 1.0 (relative top)
  width: number; // 0.0 - 1.0
  height: number;// 0.0 - 1.0
}

/**
 * Converts RGB tuple to Hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Extracts median RGB color from a sub-rectangle within ImageData.
 * Median filtering avoids bias from specular highlights or speckles.
 */
export function sampleSubRegion(
  imageData: ImageData,
  roi: NormalizedROI
): RGBColor {
  const { width, height, data } = imageData;

  const startX = Math.max(0, Math.min(width - 1, Math.floor(roi.x * width)));
  const startY = Math.max(0, Math.min(height - 1, Math.floor(roi.y * height)));
  const roiW = Math.max(2, Math.min(width - startX, Math.floor(roi.width * width)));
  const roiH = Math.max(2, Math.min(height - startY, Math.floor(roi.height * height)));

  const rVals: number[] = [];
  const gVals: number[] = [];
  const bVals: number[] = [];

  // Subsample every 1-2 pixels for speed
  const step = Math.max(1, Math.floor(Math.min(roiW, roiH) / 40));

  for (let y = startY; y < startY + roiH; y += step) {
    for (let x = startX; x < startX + roiW; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Discard pure saturated white glare (>250 on all channels) if there are non-glare pixels
      if (r > 252 && g > 252 && b > 252 && rVals.length > 20) {
        continue;
      }

      rVals.push(r);
      gVals.push(g);
      bVals.push(b);
    }
  }

  if (rVals.length === 0) {
    return { r: 128, g: 128, b: 128, hex: '#808080' };
  }

  rVals.sort((a, b) => a - b);
  gVals.sort((a, b) => a - b);
  bVals.sort((a, b) => a - b);

  const mid = Math.floor(rVals.length / 2);
  const medR = rVals[mid];
  const medG = gVals[mid];
  const medB = bVals[mid];

  return {
    r: medR,
    g: medG,
    b: medB,
    hex: rgbToHex(medR, medG, medB),
  };
}

/**
 * Samples the reference card regions and estimates lighting calibration gains.
 */
export function performColorCalibration(
  imageData: ImageData,
  cardROI: NormalizedROI
): {
  calibrationData: Omit<CalibrationData, 'qualityMetrics'>;
  whiteGain: { r: number; g: number; b: number };
} {
  // Within the reference card bounding box, sample three standardized zones:
  // Top quadrant: White reference patch
  // Middle quadrant: Neutral Gray reference patch
  // Bottom quadrant: Black reference patch
  const whitePatchROI: NormalizedROI = {
    x: cardROI.x + cardROI.width * 0.15,
    y: cardROI.y + cardROI.height * 0.08,
    width: cardROI.width * 0.70,
    height: cardROI.height * 0.22,
  };

  const grayPatchROI: NormalizedROI = {
    x: cardROI.x + cardROI.width * 0.15,
    y: cardROI.y + cardROI.height * 0.38,
    width: cardROI.width * 0.70,
    height: cardROI.height * 0.22,
  };

  const blackPatchROI: NormalizedROI = {
    x: cardROI.x + cardROI.width * 0.15,
    y: cardROI.y + cardROI.height * 0.68,
    width: cardROI.width * 0.70,
    height: cardROI.height * 0.22,
  };

  const sampledWhite = sampleSubRegion(imageData, whitePatchROI);
  const sampledGray = sampleSubRegion(imageData, grayPatchROI);
  const sampledBlack = sampleSubRegion(imageData, blackPatchROI);

  // Compute Von Kries / White-Point Gains
  const expectedWhite = ANALYSIS_CONFIG.REFERENCE_CARD.WHITE_PATCH;
  
  // Safe bounds: gain factor clamped to [0.6, 2.0]
  const calcGain = (expected: number, actual: number) => {
    const raw = actual > 15 ? expected / actual : 1.0;
    return Math.max(0.6, Math.min(2.0, raw));
  };

  const gainR = calcGain(expectedWhite.r, sampledWhite.r);
  const gainG = calcGain(expectedWhite.g, sampledWhite.g);
  const gainB = calcGain(expectedWhite.b, sampledWhite.b);

  // Check if reference card appears plausibly detected (white is brighter than gray, gray is brighter than black)
  const isPlausible = (sampledWhite.r + sampledWhite.g + sampledWhite.b) > 
                      (sampledGray.r + sampledGray.g + sampledGray.b) &&
                      (sampledGray.r + sampledGray.g + sampledGray.b) > 
                      (sampledBlack.r + sampledBlack.g + sampledBlack.b);

  return {
    whiteGain: {
      r: Math.round(gainR * 1000) / 1000,
      g: Math.round(gainG * 1000) / 1000,
      b: Math.round(gainB * 1000) / 1000,
    },
    calibrationData: {
      referenceDetected: isPlausible,
      whiteGain: {
        r: Math.round(gainR * 1000) / 1000,
        g: Math.round(gainG * 1000) / 1000,
        b: Math.round(gainB * 1000) / 1000,
      },
      sampledPatches: {
        white: sampledWhite,
        gray: sampledGray,
        black: sampledBlack,
      },
    },
  };
}

/**
 * Applies calibration gains to an observed RGB color.
 */
export function applyCalibrationGain(
  color: RGBColor,
  gain: { r: number; g: number; b: number }
): RGBColor {
  const r = Math.max(0, Math.min(255, Math.round(color.r * gain.r)));
  const g = Math.max(0, Math.min(255, Math.round(color.g * gain.g)));
  const b = Math.max(0, Math.min(255, Math.round(color.b * gain.b)));

  return {
    r,
    g,
    b,
    hex: rgbToHex(r, g, b),
  };
}
