// ==============================================================================
// E-JAANCH: COLORIMETRIC THRESHOLDS AND IMAGE ANALYSIS CONFIGURATION
// Easily adjustable parameters for field-test kit calibration
// ==============================================================================

export interface TestKitProfile {
  id: string;
  name: string;
  description: string;
  positiveColor: { r: number; g: number; b: number; name: string };
  negativeColor: { r: number; g: number; b: number; name: string };
  // Maximum delta-E distance in Lab space to be considered positive
  positiveThresholdDeltaE: number;
  // Maximum delta-E distance to be considered negative
  negativeThresholdDeltaE: number;
  // Minimum saturation (0-100) for a positive reaction
  minPositiveSaturation: number;
  // Inconclusive range margin
  inconclusiveMarginDeltaE: number;
}

export const ACTIVE_KIT_PROFILE: TestKitProfile = {
  id: 'standard-colorimetric-alkaloid',
  name: 'Presumptive Alkaloid / Cobalt Thiocyanate & Acid Reagent',
  description: 'Colorimetric field test kit developing a deep turquoise/cyan-blue or violet chromophore upon reaction.',
  positiveColor: { r: 28, g: 82, b: 168, name: 'Deep Cobalt Blue / Turquoise' },
  negativeColor: { r: 232, g: 218, b: 185, name: 'Pale Amber / Reagent Blank' },
  positiveThresholdDeltaE: 38.0,
  negativeThresholdDeltaE: 32.0,
  minPositiveSaturation: 25.0,
  inconclusiveMarginDeltaE: 14.0,
};

export const ANALYSIS_CONFIG = {
  // Quality Assessment Thresholds
  MIN_BLUR_VARIANCE: 45.0, // Variance of Laplacian; below this is considered blurred
  MIN_BRIGHTNESS: 35.0,    // Average 0-255 brightness; below is underexposed
  MAX_BRIGHTNESS: 235.0,   // Average 0-255 brightness; above is washed out / overexposed
  MIN_CONTRAST: 28.0,      // Minimum standard deviation of luminance

  // Reference Card Standards (Ground Truth Expected Colors)
  REFERENCE_CARD: {
    WHITE_PATCH: { r: 245, g: 245, b: 245, name: 'Reference White' },
    NEUTRAL_GRAY: { r: 128, g: 128, b: 128, name: '18% Neutral Gray' },
    BLACK_PATCH: { r: 25, g: 25, b: 25, name: 'Reference Black' },
    STANDARD_RED: { r: 210, g: 45, b: 40, name: 'Color Standard Red' },
    STANDARD_BLUE: { r: 35, g: 90, b: 200, name: 'Color Standard Blue' },
  },

  // Region of Interest (ROI) Default Normalized Coordinates [x, y, width, height] (0.0 - 1.0)
  DEFAULT_ROI: {
    REFERENCE_CARD: { x: 0.10, y: 0.15, width: 0.28, height: 0.70 },
    TEST_RESULT_AREA: { x: 0.52, y: 0.25, width: 0.38, height: 0.50 },
  },

  // Disclaimers
  STATUTORY_DISCLAIMER: 
    'E-Jaanch provides a presumptive field-test result based on image analysis of a colorimetric test. It does not replace laboratory confirmatory testing.',
};
