// ==============================================================================
// E-JAANCH: IMAGE QUALITY ASSESSMENT
// Evaluates image blur (Laplacian variance), exposure (brightness), and contrast
// ==============================================================================

import { ANALYSIS_CONFIG } from './config';
import { QualityScore } from '@/types';

export interface QualityAssessment {
  score: QualityScore;
  blurVariance: number;
  meanBrightness: number;
  contrast: number;
  isAcceptable: boolean;
  issues: string[];
}

/**
 * Assesses an ImageData buffer for sharpness, illumination balance, and contrast.
 */
export function assessImageQuality(imageData: ImageData): QualityAssessment {
  const { width, height, data } = imageData;
  const issues: string[] = [];

  // 1. Calculate Mean Luminance and Contrast (Standard Deviation)
  let sumLuminance = 0;
  let sumSquaredLuminance = 0;
  const totalPixels = width * height;

  // Luminance grayscale buffer for blur analysis
  const gray = new Float32Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    
    // Standard Rec. 709 luminance weights
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    gray[i] = lum;
    sumLuminance += lum;
    sumSquaredLuminance += lum * lum;
  }

  const meanBrightness = sumLuminance / totalPixels;
  const variance = Math.max(0, (sumSquaredLuminance / totalPixels) - (meanBrightness * meanBrightness));
  const contrast = Math.sqrt(variance);

  // Check illumination issues
  if (meanBrightness < ANALYSIS_CONFIG.MIN_BRIGHTNESS) {
    issues.push('Image is severely underexposed (too dark). Move to better ambient light or enable torch.');
  } else if (meanBrightness > ANALYSIS_CONFIG.MAX_BRIGHTNESS) {
    issues.push('Image is overexposed / washed out with glare. Avoid direct flash or sun reflection.');
  }

  if (contrast < ANALYSIS_CONFIG.MIN_CONTRAST) {
    issues.push('Image lacks sufficient contrast between reagents and card background.');
  }

  // 2. Laplacian Blur Estimation (Sharpness)
  // Convolve with 3x3 discrete Laplacian kernel: [0, 1, 0], [1, -4, 1], [0, 1, 0]
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let laplacianCount = 0;

  // Sample every 2nd row and column for high-speed mobile performance
  const step = 2;
  for (let y = 1; y < height - 1; y += step) {
    const rowOffset = y * width;
    const rowAbove = (y - 1) * width;
    const rowBelow = (y + 1) * width;

    for (let x = 1; x < width - 1; x += step) {
      const center = gray[rowOffset + x];
      const lap = 
        gray[rowAbove + x] +
        gray[rowBelow + x] +
        gray[rowOffset + x - 1] +
        gray[rowOffset + x + 1] -
        (4 * center);

      laplacianSum += lap;
      laplacianSqSum += lap * lap;
      laplacianCount++;
    }
  }

  const laplacianMean = laplacianCount > 0 ? laplacianSum / laplacianCount : 0;
  const blurVariance = laplacianCount > 0 
    ? Math.max(0, (laplacianSqSum / laplacianCount) - (laplacianMean * laplacianMean))
    : 0;

  if (blurVariance < ANALYSIS_CONFIG.MIN_BLUR_VARIANCE) {
    issues.push('Image appears blurry or out of focus. Hold the camera steady and refocus.');
  }

  // Determine Quality Score
  let score: QualityScore = 'GOOD';
  let isAcceptable = true;

  if (issues.length === 0 && blurVariance > 80 && contrast > 40) {
    score = 'GOOD';
    isAcceptable = true;
  } else if (issues.length <= 1 && blurVariance >= ANALYSIS_CONFIG.MIN_BLUR_VARIANCE) {
    score = 'ACCEPTABLE';
    isAcceptable = true;
  } else if (issues.length > 1 || blurVariance < ANALYSIS_CONFIG.MIN_BLUR_VARIANCE) {
    score = 'POOR';
    isAcceptable = false;
  }

  if (meanBrightness < 20 || meanBrightness > 245 || blurVariance < 15) {
    score = 'INVALID';
    isAcceptable = false;
  }

  return {
    score,
    blurVariance: Math.round(blurVariance * 10) / 10,
    meanBrightness: Math.round(meanBrightness * 10) / 10,
    contrast: Math.round(contrast * 10) / 10,
    isAcceptable,
    issues,
  };
}
