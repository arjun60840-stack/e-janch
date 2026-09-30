'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Printer, 
  AlertTriangle,
  RotateCcw,
  Car,
  Beaker,
  Shield,
  Pen
} from 'lucide-react';
import { fetchTestById, logAuditEvent } from '@/lib/supabase/client';
import { TestRecord, VerificationResult } from '@/types';
import { ResultCard } from '@/components/ResultCard';
import { IntegrityBadge } from '@/components/IntegrityBadge';
import { ColorCalibrationView } from '@/components/ColorCalibrationView';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { verifyRecordIntegrity } from '@/lib/verification/integrity';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TestDetailPage() {
  const params = useParams();
  const testId = params.id as string;
  const { language, t } = useLanguage();

  const [record, setRecord] = useState<TestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [tamperedRecord, setTamperedRecord] = useState<TestRecord | null>(null);
  const [isTamperSimulated, setIsTamperSimulated] = useState(false);
  const [verifyingAgain, setVerifyingAgain] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTestById(testId);
        if (!data) {
          setError(`Test record "${testId}" was not found in the database.`);
        } else {
          setRecord(data);
          const v = await verifyRecordIntegrity(data);
          setVerification(v);

          await logAuditEvent({
            event_id: `EV-${Date.now()}`,
            operator_id: data.operator_id,
            event_type: 'RECORD_VERIFIED',
            test_id: data.test_id,
          });
        }
      } catch (e: any) {
        setError(e.message || 'Error fetching test record');
      } finally {
        setLoading(false);
      }
    }
    if (testId) load();
  }, [testId]);

  const handleVerifyAgain = async () => {
    if (!record) return;
    setVerifyingAgain(true);
    const target = isTamperSimulated && tamperedRecord ? tamperedRecord : record;
    const v = await verifyRecordIntegrity(target);
    setVerification(v);
    setVerifyingAgain(false);
  };

  const toggleTamperSimulation = async () => {
    if (!record) return;

    if (!isTamperSimulated) {
      // Create modified copy with altered result or confidence
      const altered: TestRecord = {
        ...record,
        result: record.result === 'POSITIVE' ? 'NEGATIVE' : 'POSITIVE',
        confidence: 99.9,
      };
      setTamperedRecord(altered);
      setIsTamperSimulated(true);
      const v = await verifyRecordIntegrity(altered);
      setVerification(v);
    } else {
      // Revert to true record
      setTamperedRecord(null);
      setIsTamperSimulated(false);
      const v = await verifyRecordIntegrity(record);
      setVerification(v);
    }
  };

  const activeDisplayRecord = tamperedRecord || record;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0B1F3A] border-t-[#FF9933] rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Retrieving Dossier {testId}...
        </p>
      </div>
    );
  }

  if (error || !activeDisplayRecord) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Record Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
        <div className="pt-2">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Test History</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0B1F3A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test History</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Verify Again Button */}
          <button
            type="button"
            onClick={handleVerifyAgain}
            disabled={verifyingAgain}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${verifyingAgain ? 'animate-spin' : ''}`} />
            <span>{t.btnVerifyAgain}</span>
          </button>

          {/* Tamper Simulation Toggle */}
          <button
            type="button"
            onClick={toggleTamperSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
              isTamperSimulated
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {isTamperSimulated ? '⚠ Revert Tampering' : '🧪 Test Tamper Detection'}
          </button>

          {/* Print Record */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>{t.btnPrintRecord}</span>
          </button>
        </div>
      </div>

      {isTamperSimulated && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-xs text-rose-900 flex items-start gap-2 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase">Tampering Simulation Active:</span> Record field values were artificially altered in memory. SHA-256 and HMAC verification will immediately detect integrity breakdown below.
          </div>
        </div>
      )}

      {/* Main Dossier Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Official Header with Vehicle Number */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full ring-2 ring-[#FF9933] overflow-hidden bg-[#0B1F3A] shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/e-jaanch-emblem.jpg" 
                alt="Traffic Police Official Emblem" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF9933] text-[#0B1F3A] shadow-xs">
                  POLICE FIELD DOSSIER
                </span>
                {activeDisplayRecord.is_demo && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    DEMO
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-mono font-black text-[#0B1F3A]">
                {activeDisplayRecord.test_id}
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {t.appSubtitle} • {activeDisplayRecord.kit_type || 'STANDARD_NARCOTIC'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Car className="w-3 h-3 text-[#FF9933]" />
                {t.vehicleNumber}
              </div>
              <div className="font-mono font-black text-slate-900 text-sm">
                {activeDisplayRecord.vehicle_number || 'UNSPECIFIED'}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Beaker className="w-3 h-3 text-[#FF9933]" />
                {t.sampleType}
              </div>
              <div className="font-bold text-slate-900">
                {activeDisplayRecord.sample_type || 'Saliva'}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-[#FF9933]" />
                {t.operatorId}
              </div>
              <div className="font-mono font-bold text-slate-900">
                {activeDisplayRecord.operator_id}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Classification Result */}
        <ResultCard
          result={activeDisplayRecord.result}
          confidence={activeDisplayRecord.confidence}
          qualityScore={activeDisplayRecord.quality_score}
          colourValues={activeDisplayRecord.colour_values}
          reason={activeDisplayRecord.reason}
          detectedDrug={activeDisplayRecord.detected_drug}
          testId={activeDisplayRecord.test_id}
          timestamp={activeDisplayRecord.tested_at}
        />

        {/* Cryptographic Tamper-Evident Badge */}
        <IntegrityBadge
          record={activeDisplayRecord}
          initialVerification={verification}
        />

        {/* Photographic Evidence & Color Calibration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Image View */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Field Photographic Evidence</span>
              <a
                href={activeDisplayRecord.image_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                View Full Size
              </a>
            </div>

            <div className="aspect-[4/3] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeDisplayRecord.image_url}
                alt={`Test ${activeDisplayRecord.test_id}`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Image SHA-256 Digest</div>
              <p className="font-mono text-[11px] text-slate-800 break-all select-all">
                {activeDisplayRecord.image_hash}
              </p>
            </div>
          </div>

          {/* Calibration View */}
          <div className="lg:col-span-7">
            <ColorCalibrationView
              calibrationData={activeDisplayRecord.calibration_data}
              colourValues={activeDisplayRecord.colour_values}
              imageUrl={activeDisplayRecord.image_url}
            />
          </div>
        </div>

        {/* Operator Digital Signature Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
              <Pen className="w-4 h-4 text-[#FF9933]" />
              {t.operatorSignature}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Certified by {activeDisplayRecord.operator_name || activeDisplayRecord.operator_id}
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-800">
                {activeDisplayRecord.operator_name || 'Authorized Field Operator'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Operator ID: {activeDisplayRecord.operator_id}
                {activeDisplayRecord.operator_age ? ` • Age: ${activeDisplayRecord.operator_age}` : ''}
              </p>
            </div>

            {activeDisplayRecord.signature_url ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeDisplayRecord.signature_url}
                  alt="Operator Signature"
                  className="max-h-20 max-w-[220px] object-contain border-b border-slate-300 pb-1"
                />
                <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                  Verified Digital Signature
                </span>
              </div>
            ) : (
              <span className="text-xs italic text-slate-400">
                {t.noSignatureProvided}
              </span>
            )}
          </div>
        </div>

        {/* Statutory Forensic Disclaimer */}
        <DisclaimerBanner />
      </div>

    </div>
  );
}
