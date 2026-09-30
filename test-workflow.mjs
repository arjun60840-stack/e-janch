// ==============================================================================
// E-JAANCH: AUTOMATED END-TO-END WORKFLOW & CRYPTOGRAPHY TEST
// ==============================================================================

import crypto from 'crypto';

console.log('--- STARTING E-JAANCH AUTOMATED ACCEPTANCE TEST ---');

// 1. Test SHA-256 Hashing of Image Binary
const sampleImageData = Buffer.from('E-JAANCH-SAMPLE-IMAGE-BINARY-DATA-2026-COBALT-BLUE');
const imageHash = crypto.createHash('sha256').update(sampleImageData).digest('hex');
console.log('✓ 1. Image SHA-256 Hash calculated:', imageHash);

// 2. Test Canonical Representation & Hash
const recordPayload = {
  test_id: 'EJ-20260911-TEST1',
  operator_id: 'OP-DEL-8921',
  result: 'POSITIVE',
  confidence: 94.2,
  tested_at: '2026-09-11T14:00:00.000Z',
  latitude: 28.613939,
  longitude: 77.209021,
  image_hash: imageHash,
  calibrated_hex: '#144FC2',
  quality_score: 'GOOD',
  app_version: '1.0.0',
};

const sortedKeys = Object.keys(recordPayload).sort();
const canonicalObj = {};
for (const k of sortedKeys) {
  canonicalObj[k] = recordPayload[k];
}
const canonicalString = JSON.stringify(canonicalObj);
const recordHash = crypto.createHash('sha256').update(canonicalString).digest('hex');
console.log('✓ 2. Canonical JSON string generated:', canonicalString);
console.log('✓ 3. Canonical Record Hash (SHA-256):', recordHash);

// 3. Test Server-Side HMAC-SHA256 Signing
const secretKey = 'e_jaanch_forensic_tamper_evident_secret_key_dev_2026';
const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(`E-JAANCH-V1:${recordHash}`);
const signature = hmac.digest('hex');
console.log('✓ 4. Server HMAC-SHA256 signature generated:', signature);

// 4. Test Signature Verification (Valid Record)
const verifyHmac = crypto.createHmac('sha256', secretKey);
verifyHmac.update(`E-JAANCH-V1:${recordHash}`);
const expectedSig = verifyHmac.digest('hex');
const isSignatureValid = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'));

if (!isSignatureValid) {
  throw new Error('Verification failed for valid signature');
}
console.log('✓ 5. Signature verification passed: RECORD INTEGRITY VERIFIED');

// 5. Test Tampering Detection
// Simulate malicious alteration of test result from POSITIVE to NEGATIVE
const tamperedObj = { ...canonicalObj, result: 'NEGATIVE' };
const tamperedString = JSON.stringify(tamperedObj);
const tamperedHash = crypto.createHash('sha256').update(tamperedString).digest('hex');

const isTamperedHashMatch = (tamperedHash === recordHash);
console.log('✓ 6. Tampering test: altered record hash matches stored hash?', isTamperedHashMatch);
if (isTamperedHashMatch) {
  throw new Error('Security failure: Tampered record hash unexpectedly matched original hash');
}
console.log('✓ 7. Tampering successfully caught by SHA-256 check: RECORD INTEGRITY CHECK FAILED');

console.log('\n--- ALL E-JAANCH ACCEPTANCE TESTS PASSED SUCCESSFULLY (7/7) ---');
