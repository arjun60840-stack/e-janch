import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { canonicalString, recordHash } = body;

    if (!canonicalString || !recordHash) {
      return NextResponse.json(
        { error: 'Missing canonicalString or recordHash in request payload' },
        { status: 400 }
      );
    }

    // Verify client record hash matches canonical string
    const serverCalculatedHash = crypto
      .createHash('sha256')
      .update(canonicalString)
      .digest('hex');

    if (serverCalculatedHash !== recordHash) {
      return NextResponse.json(
        { error: 'Record hash mismatch: canonical string does not hash to provided recordHash' },
        { status: 422 }
      );
    }

    // Server-side private secret key (never exposed to browser)
    const secret = process.env.RECORD_SIGNING_SECRET || 'e_jaanch_forensic_tamper_evident_secret_key_default_2026';

    // Generate HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`E-JAANCH-V1:${recordHash}`);
    const signature = hmac.digest('hex');

    return NextResponse.json({
      signature,
      signatureScheme: 'HMAC-SHA256-SERVER-AUTH',
      signingVersion: '1.0',
      signedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Record signing error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during record signing' },
      { status: 500 }
    );
  }
}
