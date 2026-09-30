import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { canonicalString, recordHash, signature } = body;

    if (!canonicalString || !recordHash || !signature) {
      return NextResponse.json(
        {
          verified: false,
          recordHashMatches: false,
          signatureValid: false,
          error: 'Missing canonicalString, recordHash, or signature in payload',
        },
        { status: 400 }
      );
    }

    // 1. Recalculate hash of canonical record
    const serverCalculatedHash = crypto
      .createHash('sha256')
      .update(canonicalString)
      .digest('hex');

    const recordHashMatches = (serverCalculatedHash === recordHash);

    // 2. Recalculate HMAC signature
    const secret = process.env.RECORD_SIGNING_SECRET || 'e_jaanch_forensic_tamper_evident_secret_key_default_2026';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`E-JAANCH-V1:${recordHash}`);
    const expectedSignature = hmac.digest('hex');

    const signatureValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    const verified = recordHashMatches && signatureValid;

    return NextResponse.json({
      verified,
      recordHashMatches,
      signatureValid,
      serverCalculatedHash,
      providedHash: recordHash,
      verifiedAt: new Date().toISOString(),
      message: verified 
        ? 'Digital record canonical hash and cryptographic server signature are valid.' 
        : 'Integrity check failed: Record content or signature has been modified.',
    });
  } catch (err: any) {
    console.error('Record verification error:', err);
    return NextResponse.json(
      {
        verified: false,
        recordHashMatches: false,
        signatureValid: false,
        error: err.message || 'Error occurred during server verification',
      },
      { status: 500 }
    );
  }
}
