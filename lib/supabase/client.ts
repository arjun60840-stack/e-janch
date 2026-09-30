// ==============================================================================
// E-JAANCH: SUPABASE CLIENT & DATA ACCESS REPOSITORY
// Communicates with Supabase PostgreSQL, Auth & Storage with robust fallback
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  TestRecord, 
  AuditLogEntry, 
  OperatorProfile, 
  KitType
} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isLiveSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
}

// Singleton real client (if configured)
let supabaseInstance: SupabaseClient | null = null;
if (isLiveSupabaseConfigured()) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

// ------------------------------------------------------------------------------
// LOCAL STORAGE KEYS FOR PERSISTENCE (when remote Supabase is unconfigured)
// ------------------------------------------------------------------------------
const STORAGE_KEY_TESTS = 'e_jaanch_persistent_tests_v2';
const STORAGE_KEY_AUDIT = 'e_jaanch_persistent_audit_v2';
const STORAGE_KEY_OPERATOR = 'e_jaanch_current_operator_v2';

const SAMPLE_SIG_1 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80' viewBox='0 0 240 80'><path d='M20,50 Q40,10 70,35 T120,40 Q150,20 180,55 T220,30' fill='none' stroke='%230B1F3A' stroke-width='3' stroke-linecap='round'/><path d='M50,60 L190,58' fill='none' stroke='%230B1F3A' stroke-width='1.5'/></svg>";
const SAMPLE_SIG_2 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='80' viewBox='0 0 240 80'><path d='M30,45 Q60,15 90,40 T150,30 Q170,60 200,35' fill='none' stroke='%230B1F3A' stroke-width='2.8' stroke-linecap='round'/><path d='M40,65 L170,62' fill='none' stroke='%230B1F3A' stroke-width='1.5'/></svg>";

// Seed demo operators for field evaluation
export const DEMO_OPERATORS: OperatorProfile[] = [
  {
    id: 'op-001',
    operator_id: 'OP-DEL-8921',
    full_name: 'Inspector Rajesh Kumar',
    operator_name: 'Inspector Rajesh Kumar',
    operator_age: 42,
    department: 'Traffic & Narcotics Inspection Squad',
    badge_number: 'FCU-8921',
    role: 'field_operator',
    signature_url: SAMPLE_SIG_1,
    preferred_language: 'hi',
  },
  {
    id: 'op-002',
    operator_id: 'OP-MUM-4412',
    full_name: 'Dr. Sunita Deshmukh',
    operator_name: 'Dr. Sunita Deshmukh',
    operator_age: 38,
    department: 'Central Narcotics Forensic Lab',
    badge_number: 'NCL-4412',
    role: 'senior_examiner',
    signature_url: SAMPLE_SIG_2,
    preferred_language: 'en',
  },
];

// ------------------------------------------------------------------------------
// INITIAL SAMPLE SEED RECORDS FOR INSTANT EVALUATION
// ------------------------------------------------------------------------------
const POS_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23E2E8F0'/><rect x='80' y='90' width='220' height='420' rx='8' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/><text x='96' y='120' font-family='monospace' font-size='12' font-weight='bold' fill='%231E3A8A'>E-JAANCH CALIBRATION</text><rect x='110' y='140' width='160' height='80' fill='%23F8F9FA' stroke='%2394A3B8'/><text x='120' y='185' font-family='sans-serif' font-size='11' fill='%23475569'>WHITE (95%25)</text><rect x='110' y='250' width='160' height='80' fill='%237F8082' stroke='%2364748B'/><text x='120' y='295' font-family='sans-serif' font-size='11' fill='%23FFFFFF'>18%25 NEUTRAL GRAY</text><rect x='110' y='360' width='160' height='80' fill='%231A1A1C' stroke='%23334155'/><text x='120' y='405' font-family='sans-serif' font-size='11' fill='%23E2E8F0'>BLACK (3%25)</text><rect x='410' y='130' width='310' height='340' rx='16' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/><text x='435' y='165' font-family='sans-serif' font-size='13' font-weight='bold' fill='%23334155'>COLORIMETRIC FIELD ASSAY</text><circle cx='565' cy='310' r='100' fill='%23E2E8F0' stroke='%2394A3B8'/><circle cx='565' cy='310' r='90' fill='%231450BE'/><ellipse cx='535' cy='280' rx='28' ry='14' transform='rotate(-30 535 280)' fill='white' opacity='0.35'/></svg>";

const NEG_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23E2E8F0'/><rect x='80' y='90' width='220' height='420' rx='8' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/><text x='96' y='120' font-family='monospace' font-size='12' font-weight='bold' fill='%231E3A8A'>E-JAANCH CALIBRATION</text><rect x='110' y='140' width='160' height='80' fill='%23F8F9FA' stroke='%2394A3B8'/><text x='120' y='185' font-family='sans-serif' font-size='11' fill='%23475569'>WHITE (95%25)</text><rect x='110' y='250' width='160' height='80' fill='%237F8082' stroke='%2364748B'/><text x='120' y='295' font-family='sans-serif' font-size='11' fill='%23FFFFFF'>18%25 NEUTRAL GRAY</text><rect x='110' y='360' width='160' height='80' fill='%231A1A1C' stroke='%23334155'/><text x='120' y='405' font-family='sans-serif' font-size='11' fill='%23E2E8F0'>BLACK (3%25)</text><rect x='410' y='130' width='310' height='340' rx='16' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/><text x='435' y='165' font-family='sans-serif' font-size='13' font-weight='bold' fill='%23334155'>COLORIMETRIC FIELD ASSAY</text><circle cx='565' cy='310' r='100' fill='%23E2E8F0' stroke='%2394A3B8'/><circle cx='565' cy='310' r='90' fill='%23EADAB8'/><ellipse cx='535' cy='280' rx='28' ry='14' transform='rotate(-30 535 280)' fill='white' opacity='0.35'/></svg>";

const INC_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23E2E8F0'/><rect x='80' y='90' width='220' height='420' rx='8' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/><text x='96' y='120' font-family='monospace' font-size='12' font-weight='bold' fill='%231E3A8A'>E-JAANCH CALIBRATION</text><rect x='110' y='140' width='160' height='80' fill='%23F8F9FA' stroke='%2394A3B8'/><text x='120' y='185' font-family='sans-serif' font-size='11' fill='%23475569'>WHITE (95%25)</text><rect x='110' y='250' width='160' height='80' fill='%237F8082' stroke='%2364748B'/><text x='120' y='295' font-family='sans-serif' font-size='11' fill='%23FFFFFF'>18%25 NEUTRAL GRAY</text><rect x='110' y='360' width='160' height='80' fill='%231A1A1C' stroke='%23334155'/><text x='120' y='405' font-family='sans-serif' font-size='11' fill='%23E2E8F0'>BLACK (3%25)</text><rect x='410' y='130' width='310' height='340' rx='16' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2'/><text x='435' y='165' font-family='sans-serif' font-size='13' font-weight='bold' fill='%23334155'>COLORIMETRIC FIELD ASSAY</text><circle cx='565' cy='310' r='100' fill='%23E2E8F0' stroke='%2394A3B8'/><circle cx='565' cy='310' r='90' fill='%239BA5B9'/><ellipse cx='535' cy='280' rx='28' ry='14' transform='rotate(-30 535 280)' fill='white' opacity='0.35'/></svg>";

const SEED_TESTS: TestRecord[] = [
  {
    id: 'seed-01',
    test_id: 'EJ-20260911-POS1',
    operator_id: 'OP-DEL-8921',
    operator_name: 'Inspector Rajesh Kumar',
    operator_age: 42,
    kit_type: 'STANDARD_NARCOTIC',
    test_type: 'cocaine',
    detected_drug: 'Cocaine',
    state: 'Delhi',
    vehicle_number: 'DL 01 AB 1234',
    sample_type: 'Saliva',
    result: 'POSITIVE',
    confidence: 94.2,
    latitude: 28.613939,
    longitude: 77.209021,
    location_accuracy: 4.5,
    location_status: 'AVAILABLE',
    tested_at: '2026-09-11T13:45:00.000Z',
    image_url: POS_SVG,
    image_hash: 'a8f92c81d89fa3c4481b7e61e0952d7e97a2cb58ef8a9d18e8f8139589d791de',
    record_hash: '3f7a1c9b4e8d2f6a5c1b0e9d8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a',
    signature: '84b7a64e10c73e89547d21c3b69a25ef14d02587a32194c7b654e821fa530182',
    signature_url: SAMPLE_SIG_1,
    calibration_data: {
      referenceDetected: true,
      whiteGain: { r: 1.01, g: 0.99, b: 1.02 },
      sampledPatches: {
        white: { r: 243, g: 246, b: 241, hex: '#F3F6F1' },
        gray: { r: 127, g: 128, b: 129, hex: '#7F8081' },
        black: { r: 26, g: 25, b: 27, hex: '#1A191B' },
      },
      qualityMetrics: {
        blurVariance: 114.5,
        meanBrightness: 128.4,
        contrast: 52.1,
        isAcceptable: true,
        issues: [],
      },
    },
    colour_values: {
      raw: { r: 20, g: 80, b: 190, hex: '#1450BE' },
      calibrated: { r: 20, g: 79, b: 194, hex: '#144FC2' },
      targetExpectedColor: 'Brilliant Blue Precipitate',
      deltaE: 8.4,
    },
    quality_score: 'GOOD',
    reason: 'Distinct chromophore reaction detected (Calibrated Hex #144FC2, Hue 220°, Saturation 90%). Calibrated profile closely matches the positive standard (Brilliant Blue Precipitate) with ΔE of 8.4.',
    app_version: '1.0.0',
    is_demo: true,
    created_at: '2026-09-11T13:45:00.000Z',
  },
  {
    id: 'seed-02',
    test_id: 'EJ-20260911-NEG2',
    operator_id: 'OP-DEL-8921',
    operator_name: 'Inspector Rajesh Kumar',
    operator_age: 42,
    kit_type: 'PRECURSOR_CHEMICAL',
    test_type: 'ephedrine',
    detected_drug: 'None Detected',
    state: 'Maharashtra',
    vehicle_number: 'MH 02 CD 5678',
    sample_type: 'Urine',
    result: 'NEGATIVE',
    confidence: 95.8,
    latitude: 28.614210,
    longitude: 77.209350,
    location_accuracy: 3.8,
    location_status: 'AVAILABLE',
    tested_at: '2026-09-11T14:10:00.000Z',
    image_url: NEG_SVG,
    image_hash: 'c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    record_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    signature: '12e456a78b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    signature_url: SAMPLE_SIG_1,
    calibration_data: {
      referenceDetected: true,
      whiteGain: { r: 1.0, g: 1.0, b: 1.0 },
      sampledPatches: {
        white: { r: 245, g: 245, b: 245, hex: '#F5F5F5' },
        gray: { r: 128, g: 128, b: 128, hex: '#808080' },
        black: { r: 25, g: 25, b: 25, hex: '#191919' },
      },
      qualityMetrics: {
        blurVariance: 102.1,
        meanBrightness: 135.2,
        contrast: 48.3,
        isAcceptable: true,
        issues: [],
      },
    },
    colour_values: {
      raw: { r: 234, g: 218, b: 184, hex: '#EADAB8' },
      calibrated: { r: 234, g: 218, b: 184, hex: '#EADAB8' },
      targetExpectedColor: 'Purple-Violet',
      deltaE: 6.2,
    },
    quality_score: 'GOOD',
    reason: 'No reaction chromophore observed (Calibrated Hex #EADAB8, Hue 41°, Saturation 21%). Color profile is consistent with negative reagent blank without purple coloration.',
    app_version: '1.0.0',
    is_demo: true,
    created_at: '2026-09-11T14:10:00.000Z',
  },
  {
    id: 'seed-03',
    test_id: 'EJ-20260911-INC3',
    operator_id: 'OP-MUM-4412',
    operator_name: 'Dr. Sunita Deshmukh',
    operator_age: 38,
    kit_type: 'KETAMINE',
    test_type: 'ketamine_rapid',
    detected_drug: 'None Detected',
    state: 'Karnataka',
    vehicle_number: 'KA 04 EF 9012',
    sample_type: 'Sputum',
    result: 'INCONCLUSIVE',
    confidence: 54.0,
    latitude: 19.076090,
    longitude: 72.877426,
    location_accuracy: 8.0,
    location_status: 'AVAILABLE',
    tested_at: '2026-09-11T14:35:00.000Z',
    image_url: INC_SVG,
    image_hash: 'f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1',
    record_hash: '5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    signature: '34a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    signature_url: SAMPLE_SIG_2,
    calibration_data: {
      referenceDetected: true,
      whiteGain: { r: 1.02, g: 1.01, b: 0.98 },
      sampledPatches: {
        white: { r: 240, g: 242, b: 248, hex: '#F0F2F8' },
        gray: { r: 125, g: 126, b: 130, hex: '#7D7E82' },
        black: { r: 28, g: 27, b: 29, hex: '#1C1B1D' },
      },
      qualityMetrics: {
        blurVariance: 89.4,
        meanBrightness: 122.0,
        contrast: 41.5,
        isAcceptable: true,
        issues: [],
      },
    },
    colour_values: {
      raw: { r: 155, g: 165, b: 185, hex: '#9BA5B9' },
      calibrated: { r: 158, g: 166, b: 181, hex: '#9EA6B5' },
      targetExpectedColor: 'Violet-Purple Complex',
      deltaE: 28.5,
    },
    quality_score: 'ACCEPTABLE',
    reason: 'Ambiguous colorimetric reading (Calibrated Hex #9EA6B5, Hue 219°, Saturation 13%). Values fall within the borderline zone. Retesting or laboratory confirmation required.',
    app_version: '1.0.0',
    is_demo: true,
    created_at: '2026-09-11T14:35:00.000Z',
  },
];

// Helper to get local tests from localStorage
function getLocalTests(): TestRecord[] {
  if (typeof window === 'undefined') return SEED_TESTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_TESTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(SEED_TESTS));
      return SEED_TESTS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_TESTS;
  } catch {
    return SEED_TESTS;
  }
}

function saveLocalTests(tests: TestRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
  } catch (e) {
    console.error('Local storage write failed:', e);
  }
}

function getLocalAudit(): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY_AUDIT);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalAudit(audit: AuditLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(audit));
  } catch (e) {
    console.error('Audit write failed:', e);
  }
}

// ------------------------------------------------------------------------------
// AUTHENTICATION & OPERATOR PROFILE
// ------------------------------------------------------------------------------

export async function getCurrentOperator(): Promise<OperatorProfile | null> {
  if (isLiveSupabaseConfigured() && supabaseInstance) {
    const { data: { session } } = await supabaseInstance.auth.getSession();
    if (!session?.user) return null;

    // Fetch profile
    const { data: profile } = await supabaseInstance
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        operator_id: profile.operator_id || session.user.email?.split('@')[0] || 'OP-UNKNOWN',
        full_name: profile.full_name || 'Authorized Field Operator',
        operator_name: profile.operator_name || profile.full_name || 'Authorized Field Operator',
        operator_age: profile.operator_age || 35,
        signature_url: profile.signature_url,
        preferred_language: profile.preferred_language || 'en',
        department: profile.department || 'Forensic Field Unit',
        badge_number: profile.badge_number || 'BADGE-001',
        role: profile.role || 'field_operator',
      };
    }

    return {
      id: session.user.id,
      operator_id: session.user.email?.split('@')[0]?.toUpperCase() || 'OP-CURRENT',
      full_name: session.user.email || 'Authorized Field Operator',
      operator_name: session.user.email || 'Authorized Field Operator',
      department: 'Forensic Field Unit',
      badge_number: 'BADGE-AUTH',
      role: 'field_operator',
      preferred_language: 'en',
    };
  }

  // Fallback to local session
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_OPERATOR);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    // Default to first demo operator for smooth testing
    const defaultOp = DEMO_OPERATORS[0];
    localStorage.setItem(STORAGE_KEY_OPERATOR, JSON.stringify(defaultOp));
    return defaultOp;
  }
  return DEMO_OPERATORS[0];
}

export async function updateOperatorProfile(
  updates: Partial<OperatorProfile>
): Promise<OperatorProfile> {
  const current = await getCurrentOperator();
  const updated: OperatorProfile = {
    ...(current || DEMO_OPERATORS[0]),
    ...updates,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_OPERATOR, JSON.stringify(updated));
  }

  if (isLiveSupabaseConfigured() && supabaseInstance && current?.id) {
    try {
      await supabaseInstance
        .from('profiles')
        .update({
          full_name: updated.full_name || updated.operator_name,
          operator_name: updated.operator_name || updated.full_name,
          operator_age: updated.operator_age,
          signature_url: updated.signature_url,
          preferred_language: updated.preferred_language,
          department: updated.department,
          badge_number: updated.badge_number,
        })
        .eq('id', current.id);
    } catch (e) {
      console.warn('Failed to update remote profile:', e);
    }
  }

  return updated;
}

export async function loginWithCredentials(
  emailOrId: string, 
  password?: string
): Promise<{ success: boolean; operator?: OperatorProfile; error?: string }> {
  // If real Supabase configured and email format
  if (isLiveSupabaseConfigured() && supabaseInstance && emailOrId.includes('@')) {
    const { error } = await supabaseInstance.auth.signInWithPassword({
      email: emailOrId,
      password: password || 'TestPassword123!',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const op = await getCurrentOperator();
    if (op) {
      await logAuditEvent({
        event_id: `EV-${Date.now()}`,
        operator_id: op.operator_id,
        event_type: 'LOGIN',
        metadata: { email: emailOrId, provider: 'supabase_auth' },
      });
      return { success: true, operator: op };
    }
  }

  // Check matching demo operators
  const cleanId = emailOrId.trim().toUpperCase();
  const matched = DEMO_OPERATORS.find(
    o => o.operator_id.toUpperCase() === cleanId || 
         o.full_name.toUpperCase().includes(cleanId) ||
         o.badge_number.toUpperCase() === cleanId
  ) || {
    id: `op-custom-${Date.now()}`,
    operator_id: cleanId.startsWith('OP-') ? cleanId : `OP-${cleanId.replace(/[^A-Z0-9]/g, '')}`,
    full_name: emailOrId.includes('@') ? emailOrId.split('@')[0] : emailOrId,
    operator_name: emailOrId.includes('@') ? emailOrId.split('@')[0] : emailOrId,
    operator_age: 35,
    department: 'Digital Forensic Inspection Squad',
    badge_number: `BADGE-${Math.floor(1000 + Math.random() * 9000)}`,
    role: 'field_operator' as const,
    signature_url: SAMPLE_SIG_1,
    preferred_language: 'en' as const,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_OPERATOR, JSON.stringify(matched));
  }

  await logAuditEvent({
    event_id: `EV-${Date.now()}`,
    operator_id: matched.operator_id,
    event_type: 'LOGIN',
    metadata: { operator_name: matched.full_name, timestamp: new Date().toISOString() },
  });

  return { success: true, operator: matched };
}

export async function logoutCurrentOperator(): Promise<void> {
  const current = await getCurrentOperator();
  if (current) {
    await logAuditEvent({
      event_id: `EV-${Date.now()}`,
      operator_id: current.operator_id,
      event_type: 'LOGOUT',
    });
  }

  if (isLiveSupabaseConfigured() && supabaseInstance) {
    await supabaseInstance.auth.signOut();
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_OPERATOR);
  }
}

// ------------------------------------------------------------------------------
// IMAGE & SIGNATURE STORAGE
// ------------------------------------------------------------------------------

export async function uploadTestImage(
  imageBlob: Blob,
  testId: string
): Promise<{ imageUrl: string; path: string }> {
  const fileName = `${testId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.jpg`;
  const filePath = `captures/${fileName}`;

  if (isLiveSupabaseConfigured() && supabaseInstance) {
    const { error } = await supabaseInstance.storage
      .from('test-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseInstance.storage
      .from('test-images')
      .getPublicUrl(filePath);

    return {
      imageUrl: publicUrlData.publicUrl,
      path: filePath,
    };
  }

  // Fallback: Convert to persistent Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve({
          imageUrl: reader.result,
          path: filePath,
        });
      } else {
        reject(new Error('Failed to convert image blob to Data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading captured image file'));
    reader.readAsDataURL(imageBlob);
  });
}

export async function uploadOperatorSignature(
  signatureDataOrBlob: Blob | string,
  operatorId: string
): Promise<string> {
  const fileName = `sig_${operatorId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.png`;

  if (typeof signatureDataOrBlob === 'string' && !isLiveSupabaseConfigured()) {
    // If it's already a Data URL and offline, return it directly
    return signatureDataOrBlob;
  }

  // If live supabase is configured
  if (isLiveSupabaseConfigured() && supabaseInstance) {
    let blob: Blob;
    if (typeof signatureDataOrBlob === 'string') {
      // Convert base64 data url to blob
      const res = await fetch(signatureDataOrBlob);
      blob = await res.blob();
    } else {
      blob = signatureDataOrBlob;
    }

    const { error } = await supabaseInstance.storage
      .from('operator-signatures')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (!error) {
      const { data } = supabaseInstance.storage
        .from('operator-signatures')
        .getPublicUrl(fileName);
      return data.publicUrl;
    }
  }

  // Fallback if blob
  if (typeof signatureDataOrBlob !== 'string') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read signature blob'));
        }
      };
      reader.readAsDataURL(signatureDataOrBlob);
    });
  }

  return signatureDataOrBlob;
}

// ------------------------------------------------------------------------------
// TEST RECORDS CRUD
// ------------------------------------------------------------------------------

export async function saveTestRecord(recordData: Omit<TestRecord, 'id' | 'created_at'>): Promise<TestRecord> {
  const newRecord: TestRecord = {
    ...recordData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `test-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isLiveSupabaseConfigured() && supabaseInstance) {
    const { error } = await supabaseInstance
      .from('tests')
      .insert([
        {
          test_id: newRecord.test_id,
          operator_id: newRecord.operator_id,
          operator_name: newRecord.operator_name,
          operator_age: newRecord.operator_age,
          kit_type: newRecord.kit_type,
          test_type: newRecord.test_type,
          detected_drug: newRecord.detected_drug,
          state: newRecord.state,
          vehicle_number: newRecord.vehicle_number,
          sample_type: newRecord.sample_type,
          result: newRecord.result,
          confidence: newRecord.confidence,
          latitude: newRecord.latitude,
          longitude: newRecord.longitude,
          location_accuracy: newRecord.location_accuracy,
          location_status: newRecord.location_status,
          tested_at: newRecord.tested_at,
          image_url: newRecord.image_url,
          image_hash: newRecord.image_hash,
          record_hash: newRecord.record_hash,
          signature: newRecord.signature,
          signature_url: newRecord.signature_url,
          calibration_data: newRecord.calibration_data,
          colour_values: newRecord.colour_values,
          quality_score: newRecord.quality_score,
          reason: newRecord.reason,
          app_version: newRecord.app_version,
          is_demo: newRecord.is_demo,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase DB insert error:', error);
      throw new Error(`Failed to save record to Supabase database: ${error.message}`);
    }

    // Also mirror locally for offline reliability
    const locals = getLocalTests();
    saveLocalTests([newRecord, ...locals.filter(t => t.test_id !== newRecord.test_id)]);
    return newRecord;
  }

  // Local storage persistence
  const existing = getLocalTests();
  const updated = [newRecord, ...existing.filter(t => t.test_id !== newRecord.test_id)];
  saveLocalTests(updated);

  return newRecord;
}

export async function fetchTestRecords(filters?: {
  search?: string;
  result?: string;
  kitType?: KitType | string;
  detectedDrug?: string;
  state?: string;
  vehicleNumber?: string;
  operator?: string;
  dateFrom?: string;
  dateTo?: string;
  isDemo?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ tests: TestRecord[]; total: number }> {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;

  if (isLiveSupabaseConfigured() && supabaseInstance) {
    let query = supabaseInstance.from('tests').select('*', { count: 'exact' });

    if (filters?.result && filters.result !== 'ALL') {
      query = query.eq('result', filters.result);
    }
    if (filters?.kitType && filters.kitType !== 'ALL') {
      query = query.eq('kit_type', filters.kitType);
    }
    if (filters?.detectedDrug && filters.detectedDrug !== 'ALL') {
      query = query.ilike('detected_drug', `%${filters.detectedDrug}%`);
    }
    if (filters?.state && filters.state !== 'ALL') {
      query = query.eq('state', filters.state);
    }
    if (filters?.vehicleNumber) {
      query = query.ilike('vehicle_number', `%${filters.vehicleNumber}%`);
    }
    if (filters?.operator) {
      query = query.ilike('operator_id', `%${filters.operator}%`);
    }
    if (filters?.search) {
      query = query.or(`test_id.ilike.%${filters.search}%,vehicle_number.ilike.%${filters.search}%,operator_id.ilike.%${filters.search}%,detected_drug.ilike.%${filters.search}%`);
    }
    if (filters?.dateFrom) {
      query = query.gte('tested_at', new Date(filters.dateFrom).toISOString());
    }
    if (filters?.dateTo) {
      query = query.lte('tested_at', new Date(filters.dateTo + 'T23:59:59Z').toISOString());
    }
    if (typeof filters?.isDemo === 'boolean') {
      query = query.eq('is_demo', filters.isDemo);
    }

    const fromIdx = (page - 1) * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    query = query.order('tested_at', { ascending: false }).range(fromIdx, toIdx);

    const { data, count, error } = await query;
    if (!error && data) {
      return {
        tests: data as TestRecord[],
        total: count || data.length,
      };
    }
  }

  // Local fallback
  let all = getLocalTests();

  if (filters?.result && filters.result !== 'ALL') {
    all = all.filter(t => t.result === filters.result);
  }
  if (filters?.kitType && filters.kitType !== 'ALL') {
    all = all.filter(t => t.kit_type === filters.kitType);
  }
  if (filters?.detectedDrug && filters.detectedDrug !== 'ALL') {
    const dq = filters.detectedDrug.toLowerCase();
    all = all.filter(t => t.detected_drug?.toLowerCase().includes(dq));
  }
  if (filters?.state && filters.state !== 'ALL') {
    all = all.filter(t => t.state === filters.state);
  }
  if (filters?.vehicleNumber) {
    const vq = filters.vehicleNumber.toLowerCase();
    all = all.filter(t => t.vehicle_number?.toLowerCase().includes(vq));
  }
  if (filters?.operator) {
    const opQuery = filters.operator.toLowerCase();
    all = all.filter(t => 
      t.operator_id.toLowerCase().includes(opQuery) ||
      t.operator_name?.toLowerCase().includes(opQuery)
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    all = all.filter(t => 
      t.test_id.toLowerCase().includes(q) || 
      t.vehicle_number?.toLowerCase().includes(q) ||
      t.operator_id.toLowerCase().includes(q) ||
      t.detected_drug?.toLowerCase().includes(q) ||
      t.operator_name?.toLowerCase().includes(q)
    );
  }
  if (filters?.dateFrom) {
    all = all.filter(t => new Date(t.tested_at) >= new Date(filters.dateFrom!));
  }
  if (filters?.dateTo) {
    all = all.filter(t => new Date(t.tested_at) <= new Date(filters.dateTo! + 'T23:59:59Z'));
  }
  if (typeof filters?.isDemo === 'boolean') {
    all = all.filter(t => Boolean(t.is_demo) === filters.isDemo);
  }

  all.sort((a, b) => new Date(b.tested_at).getTime() - new Date(a.tested_at).getTime());

  const start = (page - 1) * pageSize;
  const paginated = all.slice(start, start + pageSize);

  return {
    tests: paginated,
    total: all.length,
  };
}


export async function fetchTestById(testId: string): Promise<TestRecord | null> {
  const cleanId = testId.trim();

  if (isLiveSupabaseConfigured() && supabaseInstance) {
    const { data, error } = await supabaseInstance
      .from('tests')
      .select('*')
      .eq('test_id', cleanId)
      .single();

    if (!error && data) {
      return data as TestRecord;
    }
  }

  // Check local tests
  const locals = getLocalTests();
  const match = locals.find(t => t.test_id.toLowerCase() === cleanId.toLowerCase());
  return match || null;
}

export async function fetchDashboardMetrics(): Promise<{
  total: number;
  positive: number;
  negative: number;
  inconclusive: number;
  invalid: number;
}> {
  const { tests: all } = await fetchTestRecords({ pageSize: 1000 });

  return {
    total: all.length,
    positive: all.filter(t => t.result === 'POSITIVE').length,
    negative: all.filter(t => t.result === 'NEGATIVE').length,
    inconclusive: all.filter(t => t.result === 'INCONCLUSIVE').length,
    invalid: all.filter(t => t.result === 'INVALID_IMAGE').length,
  };
}

export async function fetchStateMetrics(): Promise<Record<string, {
  total: number;
  positive: number;
  negative: number;
  inconclusive: number;
  drugs: string[];
}>> {
  const { tests: all } = await fetchTestRecords({ pageSize: 5000 });
  const result: Record<string, { total: number; positive: number; negative: number; inconclusive: number; drugs: string[] }> = {};

  for (const t of all) {
    const stateName = t.state || 'Unknown';
    if (!result[stateName]) {
      result[stateName] = { total: 0, positive: 0, negative: 0, inconclusive: 0, drugs: [] };
    }
    result[stateName].total++;
    if (t.result === 'POSITIVE') result[stateName].positive++;
    else if (t.result === 'NEGATIVE') result[stateName].negative++;
    else if (t.result === 'INCONCLUSIVE') result[stateName].inconclusive++;
    if (t.detected_drug && t.detected_drug !== 'None Detected' && !result[stateName].drugs.includes(t.detected_drug)) {
      result[stateName].drugs.push(t.detected_drug);
    }
  }
  return result;
}

export async function fetchTrendData(options?: {
  state?: string;
  period?: '7d' | '30d' | '90d' | 'all';
}): Promise<Array<{ date: string; positive: number; negative: number; inconclusive: number }>> {
  const { tests: all } = await fetchTestRecords({ pageSize: 5000, state: options?.state !== 'ALL' ? options?.state : undefined });

  // Filter by time period
  let filtered = all;
  if (options?.period && options.period !== 'all') {
    const days = options.period === '7d' ? 7 : options.period === '30d' ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    filtered = all.filter(t => new Date(t.tested_at) >= cutoff);
  }

  // Group by date
  const byDate: Record<string, { positive: number; negative: number; inconclusive: number }> = {};
  for (const t of filtered) {
    const date = t.tested_at.slice(0, 10); // YYYY-MM-DD
    if (!byDate[date]) byDate[date] = { positive: 0, negative: 0, inconclusive: 0 };
    if (t.result === 'POSITIVE') byDate[date].positive++;
    else if (t.result === 'NEGATIVE') byDate[date].negative++;
    else if (t.result === 'INCONCLUSIVE') byDate[date].inconclusive++;
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}


// ------------------------------------------------------------------------------
// AUDIT LOGS
// ------------------------------------------------------------------------------

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  if (isLiveSupabaseConfigured() && supabaseInstance) {
    try {
      await supabaseInstance.from('audit_logs').insert([
        {
          event_id: fullEntry.event_id,
          operator_id: fullEntry.operator_id,
          event_type: fullEntry.event_type,
          test_id: fullEntry.test_id,
          metadata: fullEntry.metadata,
        },
      ]);
    } catch (e) {
      console.warn('Supabase audit log insert error:', e);
    }
  }

  // Local storage
  const locals = getLocalAudit();
  saveLocalAudit([fullEntry, ...locals.slice(0, 200)]);
}

export async function fetchAuditLogs(testId?: string): Promise<AuditLogEntry[]> {
  if (isLiveSupabaseConfigured() && supabaseInstance) {
    let q = supabaseInstance.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (testId) q = q.eq('test_id', testId);
    const { data } = await q;
    if (data) return data as AuditLogEntry[];
  }

  const locals = getLocalAudit();
  if (testId) {
    return locals.filter(l => l.test_id === testId);
  }
  return locals;
}
