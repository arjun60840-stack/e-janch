// ==============================================================================
// E-JAANCH: CRYPTOGRAPHIC SHA-256 HASHING
// Supports Web Crypto API in browser and node:crypto fallback on server
// ==============================================================================

/**
 * Converts an ArrayBuffer to a lowercase hexadecimal string.
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Computes SHA-256 hash of a Blob or File (e.g. captured photograph).
 */
export async function calculateBlobSha256(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  return calculateBufferSha256(arrayBuffer);
}

/**
 * Computes SHA-256 hash of an ArrayBuffer.
 */
export async function calculateBufferSha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    return bufferToHex(hashBuffer);
  }

  // Node.js server environment fallback
  const cryptoModule = await import('crypto');
  const hash = cryptoModule.createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

/**
 * Computes SHA-256 hash of a string (e.g. canonical JSON record).
 */
export async function calculateStringSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return calculateBufferSha256(data.buffer as ArrayBuffer);
}
