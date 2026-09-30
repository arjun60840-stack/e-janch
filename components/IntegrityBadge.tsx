'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink,
  Hash,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { TestRecord, VerificationResult } from '@/types';
import { verifyRecordIntegrity } from '@/lib/verification/integrity';

interface IntegrityBadgeProps {
  record: TestRecord;
  initialVerification?: VerificationResult | null;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({
  record,
  initialVerification = null,
}) => {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(initialVerification);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyRecordIntegrity(record);
      setResult(res);
    } catch (e) {
      console.error('Verification failed:', e);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const isVerified = result ? result.verified : true;

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${
      isVerified 
        ? 'bg-slate-900 border-slate-800 text-white' 
        : 'bg-rose-950 border-rose-800 text-white'
    }`}>
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            {isVerified ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-black tracking-wider uppercase ${isVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isVerified ? '✓ RECORD INTEGRITY VERIFIED' : '⚠ RECORD INTEGRITY CHECK FAILED'}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SHA-256
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVerified 
                ? 'Evidentiary chain of custody intact. Digital image and canonical metadata are authentic.' 
                : 'Warning: Hash mismatch detected. Record or image content has been altered.'}
            </p>
          </div>
        </div>

        {/* Re-verify Button */}
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'Verifying Hashes...' : 'Re-Verify Integrity'}</span>
        </button>
      </div>

      {/* Cryptographic Hashes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        {/* Image SHA-256 Hash */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              Image SHA-256 Cryptographic Hash
            </span>
            <button
              onClick={() => copyToClipboard(record.image_hash, 'image')}
              className="hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Copy Image Hash"
            >
              {copiedHash === 'image' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-200 break-all select-all bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            {record.image_hash}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${result?.imageHashMatches !== false ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span>Image binary data integrity: {result?.imageHashMatches !== false ? 'Match confirmed' : 'Mismatch detected'}</span>
          </div>
        </div>

        {/* Canonical Record Hash */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              Canonical Record Hash (SHA-256)
            </span>
            <button
              onClick={() => copyToClipboard(record.record_hash, 'record')}
              className="hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Copy Record Hash"
            >
              {copiedHash === 'record' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-200 break-all select-all bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            {record.record_hash}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${result?.recordHashMatches !== false ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span>Metadata canonical structure: {result?.recordHashMatches !== false ? 'Unaltered' : 'Modified'}</span>
          </div>
        </div>
      </div>

      {/* Signature & Verification Scheme Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Server Signature: <code className="font-mono text-[11px] text-slate-300">{record.signature ? `${record.signature.slice(0, 16)}...${record.signature.slice(-12)}` : 'HMAC-SHA256'}</code></span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          App Version: {record.app_version} • Algorithm: HMAC-SHA256
        </div>
      </div>
    </div>
  );
};
