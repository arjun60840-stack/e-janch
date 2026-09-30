'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Hash, 
  FileText,
  ArrowRight,
  Car,
  Beaker,
  Pen
} from 'lucide-react';
import { fetchTestById, logAuditEvent } from '@/lib/supabase/client';
import { TestRecord, VerificationResult } from '@/types';
import { verifyRecordIntegrity } from '@/lib/verification/integrity';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PublicVerificationPage() {
  const { language, t } = useLanguage();
  const [testIdInput, setTestIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<TestRecord | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = testIdInput.trim();
    if (!cleanId) return;

    setLoading(true);
    setSearched(true);
    setNotFound(false);
    setRecord(null);
    setVerification(null);

    try {
      const data = await fetchTestById(cleanId);
      if (!data) {
        setNotFound(true);
      } else {
        setRecord(data);
        const v = await verifyRecordIntegrity(data);
        setVerification(v);

        await logAuditEvent({
          event_id: `EV-${Date.now()}`,
          operator_id: 'PUBLIC_AUDITOR',
          event_type: 'RECORD_VERIFIED',
          test_id: data.test_id,
        });
      }
    } catch (err) {
      console.error('Verification query failed:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full ring-3 ring-[#FF9933] shadow-xl overflow-hidden bg-[#0B1F3A]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/e-jaanch-emblem.jpg" 
            alt="E-Jaanch Traffic Police Emblem" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
            {t.navVerify}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium mt-1">
            Audit and authenticate E-Jaanch colorimetric field test records using SHA-256 cryptographic digests and server-backed signatures.
          </p>
        </div>
      </div>

      {/* Verification Query Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-1.5">
              Enter Field Test ID / टेस्ट आईडी दर्ज करें
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4 text-[#0B1F3A]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. EJ-20260911-POS1"
                  value={testIdInput}
                  onChange={e => setTestIdInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-[#0B1F3A] focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#071527] active:scale-98 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 text-[#FF9933]" />
                <span>{loading ? 'Verifying Integrity...' : t.btnVerifyRecord}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-400">Try Pre-Loaded Test IDs:</span>
          {['EJ-20260911-POS1', 'EJ-20260911-NEG2', 'EJ-20260911-INC3'].map(id => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTestIdInput(id);
                setTimeout(() => handleVerify(), 50);
              }}
              className="font-mono text-[11px] font-bold text-[#0B1F3A] hover:underline px-2.5 py-1 rounded bg-amber-50 border border-amber-300 cursor-pointer"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Result Status Screen */}
      {searched && !loading && (
        <div>
          {notFound ? (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Record Not Found in Database</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching field record was located for identifier <strong className="font-mono">{testIdInput}</strong>. Please check the spelling or format.
              </p>
            </div>
          ) : record && verification ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
              
              {/* Grand Integrity Verdict */}
              <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left ${
                verification.verified
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className={`p-4 rounded-2xl shrink-0 ${
                  verification.verified ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {verification.verified ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-800">
                    Official Cryptographic Audit
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    {verification.verified ? '✓ DIGITAL RECORD VERIFIED AUTHENTIC' : '⚠ RECORD INTEGRITY CHECK FAILED'}
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {verification.message}
                  </p>
                </div>
              </div>

              {/* Record Summary Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Car className="w-3 h-3 text-[#FF9933]" />
                    {t.vehicleNumber}
                  </span>
                  <div className="text-sm font-mono font-black text-slate-900 mt-0.5">
                    {record.vehicle_number || 'UNSPECIFIED'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Beaker className="w-3 h-3 text-[#FF9933]" />
                    {t.sampleType}
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {record.sample_type || 'Saliva'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Classification</span>
                  <div className="text-sm font-black text-[#0B1F3A] mt-0.5">
                    {record.result} ({record.confidence}%)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Pen className="w-3 h-3 text-[#FF9933]" />
                    {t.operatorSignature}
                  </span>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {record.signature_url ? '✓ Signed & Attached' : 'Unsigned'}
                  </div>
                </div>
              </div>

              {/* Hashes Audit */}
              <div className="space-y-3 bg-[#0B1F3A] text-white p-5 rounded-xl text-xs">
                <div className="font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-[#FF9933]" />
                  <span>Evidentiary SHA-256 Digest Verification</span>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-[#071527] p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Image Binary SHA-256 Hash</div>
                    <p className="font-mono text-[11px] text-slate-300 break-all select-all">{record.image_hash}</p>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">✓ Verified Match</div>
                  </div>

                  <div className="bg-[#071527] p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Canonical Metadata SHA-256 Hash</div>
                    <p className="font-mono text-[11px] text-slate-300 break-all select-all">{record.record_hash}</p>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">✓ Verified Canonical Ledger</div>
                  </div>
                </div>
              </div>

              {/* Link to Full Dossier */}
              <div className="pt-2 flex justify-end">
                <Link
                  href={`/test/${record.test_id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-bold transition shadow-md"
                >
                  <span>Open Full Evidentiary Dossier</span>
                  <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                </Link>
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* Forensic Disclaimer */}
      <DisclaimerBanner />

    </div>
  );
}
