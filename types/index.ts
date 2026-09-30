export type TestResult = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'INVALID_IMAGE';

export type QualityScore = 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'INVALID';

export type LocationStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'DENIED' | 'PENDING';

export type KitType = 'STANDARD_NARCOTIC' | 'PRECURSOR_CHEMICAL' | 'KETAMINE';

export type SampleType = 'Sputum' | 'Saliva' | 'Urine' | 'Sweat' | 'Other';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  hsv?: {
    h: number; // 0 - 360
    s: number; // 0 - 100
    v: number; // 0 - 100
  };
  lab?: {
    l: number;
    a: number;
    b: number;
  };
}

export interface CalibrationData {
  referenceDetected: boolean;
  whiteGain: { r: number; g: number; b: number };
  sampledPatches: {
    white: RGBColor;
    gray: RGBColor;
    black: RGBColor;
    standardRed?: RGBColor;
    standardBlue?: RGBColor;
  };
  qualityMetrics: {
    blurVariance: number;
    meanBrightness: number;
    contrast: number;
    isAcceptable: boolean;
    issues: string[];
  };
}

export interface ColorAnalysisResult {
  raw: RGBColor;
  calibrated: RGBColor;
  targetExpectedColor?: string;
  deltaE?: number;
}

export interface TestRecord {
  id: string;
  test_id: string;
  operator_id: string;
  operator_name: string;
  operator_age?: number | string;
  kit_type: KitType;
  test_type: string;
  detected_drug?: string;   // Auto-classified drug name from colorimetric analysis
  state?: string;           // Indian state name derived from GPS coordinates
  result: TestResult;
  confidence: number;
  vehicle_number: string;
  sample_type: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy?: number | null;
  location_status: LocationStatus;
  tested_at: string;
  image_url: string;
  image_hash: string;
  record_hash: string;
  signature?: string; // Server HMAC signature
  signature_url?: string; // Operator uploaded signature image
  calibration_data: CalibrationData;
  colour_values: ColorAnalysisResult;
  quality_score: QualityScore;
  reason: string;
  app_version: string;
  is_demo: boolean;
  created_at: string;
}

export type AuditEventType = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'TEST_STARTED'
  | 'IMAGE_CAPTURED'
  | 'RESULT_GENERATED' 
  | 'IMAGE_UPLOADED' 
  | 'RECORD_CREATED' 
  | 'RECORD_VERIFIED' 
  | 'RECORD_TAMPER_DETECTED';

export interface AuditLogEntry {
  id: string;
  event_id: string;
  operator_id: string;
  event_type: AuditEventType;
  test_id?: string | null;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface OperatorProfile {
  id: string;
  auth_user_id?: string;
  operator_id: string;
  full_name: string;
  operator_name?: string;
  operator_age?: number | string;
  signature_url?: string;
  preferred_language?: 'en' | 'hi';
  department: string;
  badge_number: string;
  role: 'field_operator' | 'senior_examiner' | 'supervisor' | 'admin';
}

export interface VerificationResult {
  verified: boolean;
  imageHashMatches: boolean;
  recordHashMatches: boolean;
  signatureValid: boolean;
  tamperedFields: string[];
  calculatedImageHash?: string;
  storedImageHash?: string;
  calculatedRecordHash?: string;
  storedRecordHash?: string;
  message: string;
  verifiedAt: string;
}
