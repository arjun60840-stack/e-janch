// ==============================================================================
// E-JAANCH: CANONICAL RECORD GENERATOR
// Produces a deterministic, strictly formatted canonical representation of a test record
// ==============================================================================

import { TestRecord } from '@/types';
import { calculateStringSha256 } from './sha256';

export interface CanonicalRecordPayload {
  test_id: string;
  operator_id: string;
  result: string;
  confidence: number;
  tested_at: string;
  latitude: number | null;
  longitude: number | null;
  image_hash: string;
  calibrated_hex: string;
  quality_score: string;
  app_version: string;
}

/**
 * Normalizes and formats the core record fields into a deterministic canonical JSON string.
 * Keys are strictly sorted alphabetically, and number precision is stabilized.
 */
export function createCanonicalRepresentation(
  record: Pick<
    TestRecord,
    | 'test_id'
    | 'operator_id'
    | 'result'
    | 'confidence'
    | 'tested_at'
    | 'latitude'
    | 'longitude'
    | 'image_hash'
    | 'colour_values'
    | 'quality_score'
    | 'app_version'
  >
): string {
  const payload: CanonicalRecordPayload = {
    test_id: record.test_id.trim(),
    operator_id: record.operator_id.trim(),
    result: record.result.trim(),
    confidence: Math.round(record.confidence * 100) / 100,
    tested_at: new Date(record.tested_at).toISOString(),
    latitude: record.latitude !== null && record.latitude !== undefined 
      ? Math.round(record.latitude * 1000000) / 1000000 
      : null,
    longitude: record.longitude !== null && record.longitude !== undefined 
      ? Math.round(record.longitude * 1000000) / 1000000 
      : null,
    image_hash: record.image_hash.trim().toLowerCase(),
    calibrated_hex: (record.colour_values?.calibrated?.hex || '#000000').toUpperCase(),
    quality_score: record.quality_score.trim(),
    app_version: record.app_version.trim(),
  };

  // Sort keys deterministically
  const sortedKeys = Object.keys(payload).sort() as (keyof CanonicalRecordPayload)[];
  const canonicalObj: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    canonicalObj[key] = payload[key];
  }

  return JSON.stringify(canonicalObj);
}

/**
 * Computes the SHA-256 hash of the canonical representation.
 */
export async function calculateCanonicalRecordHash(
  record: Pick<
    TestRecord,
    | 'test_id'
    | 'operator_id'
    | 'result'
    | 'confidence'
    | 'tested_at'
    | 'latitude'
    | 'longitude'
    | 'image_hash'
    | 'colour_values'
    | 'quality_score'
    | 'app_version'
  >
): Promise<{ canonicalString: string; recordHash: string }> {
  const canonicalString = createCanonicalRepresentation(record);
  const recordHash = await calculateStringSha256(canonicalString);
  return { canonicalString, recordHash };
}
