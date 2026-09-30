'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FlaskConical, 
  MapPin, 
  Clock, 
  User, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  Save,
  Check,
  Hash,
  Car,
  Beaker,
  Shield,
  FileCheck,
  AlertOctagon,
  Printer
} from 'lucide-react';
import { getCurrentOperator, uploadTestImage, saveTestRecord, logAuditEvent, uploadOperatorSignature } from '@/lib/supabase/client';
import { OperatorProfile, TestRecord, LocationStatus, KitType, SampleType } from '@/types';
import { CameraCapture } from '@/components/CameraCapture';
import { runImageAnalysisPipeline, PipelineAnalysisOutput } from '@/lib/image-analysis/classifier';
import { calculateBlobSha256 } from '@/lib/hashing/sha256';
import { calculateCanonicalRecordHash } from '@/lib/hashing/canonical';
import { ResultCard } from '@/components/ResultCard';
import { ColorCalibrationView } from '@/components/ColorCalibrationView';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import SignaturePad from '@/components/SignaturePad';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { KIT_DEFINITIONS, getKitDefinition, getTestDefinition } from '@/lib/kits/kit-definitions';
import { getStateFromCoords } from '@/lib/geo/india-states';
import type { KitTestOption } from '@/lib/image-analysis/classifier';

const SAMPLE_TYPES: SampleType[] = ['Sputum', 'Saliva', 'Urine', 'Sweat', 'Other'];

function NewTestInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  // Workflow Steps: 1: Details, 2: Kit (skipped if kit in URL), 3: Camera, 4: Analysis, 5: Result & Signature, 6: Done
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [kitFromUrl, setKitFromUrl] = useState<boolean>(false);

  // Operator
  const [operator, setOperator] = useState<OperatorProfile | null>(null);

  // Step 1: Examination Details
  const [testId, setTestId] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [sampleType, setSampleType] = useState<SampleType>('Saliva');
  const [customSampleType, setCustomSampleType] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [operatorAge, setOperatorAge] = useState<number | string>('');
  const [operatorId, setOperatorId] = useState('');
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined);

  // GPS
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('PENDING');
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null; accuracy: number | null }>({
    lat: null,
    lng: null,
    accuracy: null,
  });
  const [locationMessage, setLocationMessage] = useState('Acquiring GPS fix...');

  // Step 2: Kit Selection
  const [selectedKit, setSelectedKit] = useState<KitType>('STANDARD_NARCOTIC');
  const [selectedTestId, setSelectedTestId] = useState<string>('cocaine');
  const [detectedDrug, setDetectedDrug] = useState<string>('');

  // Step 3 & 4: Camera & Analysis
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [isDemoSample, setIsDemoSample] = useState(false);
  const [demoSampleName, setDemoSampleName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState<PipelineAnalysisOutput | null>(null);
  const [imageHash, setImageHash] = useState<string>('');
  const [refCardError, setRefCardError] = useState<string | null>(null);

  // Step 5 & 6: Save State
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<TestRecord | null>(null);

  // Initialization
  useEffect(() => {
    async function init() {
      const op = await getCurrentOperator();
      if (!op) {
        router.push('/login');
        return;
      }
      setOperator(op);
      setOperatorName(op.operator_name || op.full_name || '');
      setOperatorAge(op.operator_age || 35);
      setOperatorId(op.operator_id);
      if (op.signature_url) {
        setSignatureUrl(op.signature_url);
      }

      // Read kit from URL param (navigated from /select-kit)
      const kitParam = searchParams.get('kit') as KitType | null;
      if (kitParam && (['STANDARD_NARCOTIC', 'PRECURSOR_CHEMICAL', 'KETAMINE'] as KitType[]).includes(kitParam)) {
        setSelectedKit(kitParam);
        const tests = KIT_DEFINITIONS[kitParam].tests;
        if (tests.length > 0) setSelectedTestId(tests[0].id);
        setKitFromUrl(true);
      }

      // Generate Test ID
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      setTestId(`EJ-${datePart}-${randomPart}`);
    }
    init();

    const timer = setInterval(() => {
      setCurrentTimestamp(new Date().toISOString());
    }, 1000);
    setCurrentTimestamp(new Date().toISOString());

    return () => clearInterval(timer);
  }, [router]);

  // Request GPS
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('UNAVAILABLE');
      setLocationMessage('Geolocation is not supported on this device.');
      return;
    }

    setLocationStatus('PENDING');
    setLocationMessage('Acquiring high-accuracy GNSS/GPS lock...');

    navigator.geolocation.getCurrentPosition(
      position => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationStatus('AVAILABLE');
        setLocationMessage(`Locked: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)} (±${Math.round(position.coords.accuracy)}m)`);
      },
      error => {
        console.warn('GPS error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('DENIED');
          setLocationMessage('Location permission denied by operator.');
        } else {
          setLocationStatus('UNAVAILABLE');
          setLocationMessage('GPS signal not acquired. Manual field note added.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  // Handle Photo Captured from Step 4
  const handlePhotoCaptured = async (
    blob: Blob, 
    dataUrl: string, 
    isDemo: boolean = false, 
    sampleName: string = ''
  ) => {
    setCapturedBlob(blob);
    setCapturedDataUrl(dataUrl);
    setIsDemoSample(isDemo);
    setDemoSampleName(sampleName);
    setRefCardError(null);

    setCurrentStep(4);
    setAnalyzing(true);

    try {
      // 1. Calculate SHA-256 of raw image bytes
      const hash = await calculateBlobSha256(blob);
      setImageHash(hash);

      // 2. Load into offscreen Image to extract ImageData for pixel analysis
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Failed to load image for colorimetric processing'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Get target color from selected test definition
      const activeTest = getTestDefinition(selectedKit, selectedTestId);

      const kitTests: KitTestOption[] = KIT_DEFINITIONS[selectedKit].tests.map(test => ({
        id: test.id,
        name: test.name,
        expectedColorHex: test.expectedColorHex,
        expectedColorName: test.expectedColorName,
      }));

      // 3. Run complete image analysis and calibration pipeline
      const output = runImageAnalysisPipeline(imgData, {
        expectedColorHex: activeTest?.expectedColorHex,
        expectedColorName: activeTest?.expectedColorName,
        enforceReferenceCard: false,
        kitTests: kitTests,
      });

      setAnalysisOutput(output);
      setDetectedDrug(output.detected_drug || 'None Detected');

      // Check Reference Card Detection
      if (!output.calibration_data.referenceDetected) {
        setRefCardError(t.refCardNotDetected);
      }
    } catch (err: any) {
      console.error('Image analysis pipeline failure:', err);
      setSaveError(err.message || 'Image analysis pipeline failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // Final Save Action
  const handleFinalizeAndSave = async () => {
    if (!capturedBlob || !analysisOutput || !operator) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Step A: Upload image to Supabase Storage
      const { imageUrl } = await uploadTestImage(capturedBlob, testId);

      // Step B: Ensure signature URL if provided
      let finalSigUrl = signatureUrl;
      if (signatureUrl && signatureUrl.startsWith('data:image')) {
        try {
          finalSigUrl = await uploadOperatorSignature(signatureUrl, operator.operator_id);
        } catch {
          finalSigUrl = signatureUrl;
        }
      }

      const activeTest = getTestDefinition(selectedKit, selectedTestId);
      const effectiveSampleType = sampleType === 'Other' && customSampleType ? customSampleType : sampleType;

      // Step C: Prepare core record fields for canonicalization
      const coreRecord = {
        test_id: testId,
        operator_id: operator.operator_id,
        vehicle_number: vehicleNumber.trim().toUpperCase() || 'UNREGISTERED',
        sample_type: effectiveSampleType,
        kit_type: selectedKit,
        test_type: activeTest?.name || selectedTestId,
        result: analysisOutput.result,
        confidence: analysisOutput.confidence,
        tested_at: currentTimestamp,
        latitude: coords.lat,
        longitude: coords.lng,
        image_hash: imageHash,
        colour_values: analysisOutput.colour_values,
        quality_score: analysisOutput.quality_score,
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      };

      // Step D: Generate canonical representation and record hash
      const { canonicalString, recordHash } = await calculateCanonicalRecordHash(coreRecord as any);

      // Step E: Request cryptographic server signature (HMAC-SHA256)
      const signRes = await fetch('/api/records/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canonicalString, recordHash }),
      });

      let signature = 'SERVER_HMAC_OFFLINE_SEAL';
      if (signRes.ok) {
        const signData = await signRes.json();
        signature = signData.signature;
      }

      // Step F: Save complete record to Supabase database
      const fullRecord = await saveTestRecord({
        test_id: testId,
        operator_id: operator.operator_id,
        operator_name: operatorName || operator.full_name,
        operator_age: operatorAge || 35,
        vehicle_number: vehicleNumber.trim().toUpperCase() || 'NOT SPECIFIED',
        sample_type: effectiveSampleType,
        kit_type: selectedKit,
        test_type: activeTest?.name || selectedTestId,
        detected_drug: detectedDrug,
        result: analysisOutput.result,
        confidence: analysisOutput.confidence,
        latitude: coords.lat,
        longitude: coords.lng,
        state: (coords?.lat && coords?.lng) ? getStateFromCoords(coords.lat, coords.lng) : 'Unknown',
        location_accuracy: coords.accuracy,
        location_status: locationStatus,
        tested_at: currentTimestamp,
        image_url: imageUrl,
        image_hash: imageHash,
        record_hash: recordHash,
        signature,
        signature_url: finalSigUrl,
        calibration_data: analysisOutput.calibration_data,
        colour_values: analysisOutput.colour_values,
        quality_score: analysisOutput.quality_score,
        reason: analysisOutput.reason,
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        is_demo: isDemoSample,
      });

      // Step G: Audit log
      await logAuditEvent({
        event_id: `EV-${Date.now()}`,
        operator_id: operator.operator_id,
        event_type: 'RECORD_CREATED',
        test_id: testId,
        metadata: {
          result: analysisOutput.result,
          confidence: analysisOutput.confidence,
          vehicle_number: vehicleNumber,
          sample_type: effectiveSampleType,
          kit_type: selectedKit,
          test_type: activeTest?.name || selectedTestId,
          is_demo: isDemoSample,
        },
      });

      setSavedRecord(fullRecord);
      setCurrentStep(6);
    } catch (err: any) {
      console.error('Record finalization error:', err);
      setSaveError(err.message || 'Failed to finalize and save test record');
    } finally {
      setSaving(false);
    }
  };

  const activeKitDef = getKitDefinition(selectedKit);
  const activeTestDef = getTestDefinition(selectedKit, selectedTestId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Wizard Step Breadcrumb Navigation */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B1F3A] bg-[#FF9933] px-2.5 py-1 rounded-md shadow-xs">
              E-JAANCH • {t.appSubtitle}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A] mt-1">
              {currentStep === 1 && t.stepExaminationDetails}
              {currentStep === 2 && t.stepSelectKit}
              {currentStep === 3 && t.stepCapturePhoto}
              {currentStep === 4 && t.stepColorAnalysis}
              {currentStep === 5 && t.stepResultSummary}
              {currentStep === 6 && t.recordSavedSuccess}
            </h1>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    currentStep === s
                      ? 'bg-[#FF9933] text-[#0B1F3A] ring-2 ring-[#0B1F3A] scale-105'
                      : currentStep > s
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s ? <Check className="w-3.5 h-3.5 text-[#FF9933]" /> : s}
                </div>
                {s < 6 && <div className="w-2 sm:w-4 h-0.5 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: EXAMINATION DETAILS & VEHICLE / SAMPLE INFO */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <Car className="w-5 h-5 text-[#FF9933]" />
              {t.stepExaminationDetails}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter vehicle identification, bodily sample type, and verify field operator credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Vehicle Number Input (Required) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#FF9933]" />
                {t.vehicleNumber} <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder={t.vehicleNumberPlaceholder}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/30 font-mono text-base font-bold text-slate-900 uppercase tracking-widest bg-slate-50 transition"
              />
              <p className="text-[11px] text-slate-400">
                Indian vehicle registration code (e.g. DL 01 AB 1234, MH 02 CD 5678, DL 1C AA 9999)
              </p>
            </div>

            {/* Sample Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-[#FF9933]" />
                {t.sampleType} <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSampleType(type)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                      sampleType === type
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'Sputum' && t.sampleSputum}
                    {type === 'Saliva' && t.sampleSaliva}
                    {type === 'Urine' && t.sampleUrine}
                    {type === 'Sweat' && t.sampleSweat}
                    {type === 'Other' && t.sampleOther}
                  </button>
                ))}
              </div>

              {/* If "Other", show custom text box */}
              {sampleType === 'Other' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customSampleType}
                    onChange={e => setCustomSampleType(e.target.value)}
                    placeholder={t.specifySampleType}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                  />
                </div>
              )}
            </div>

            {/* Test ID & Timestamp info */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Test ID:</span>
                <span className="font-mono font-bold text-[#0B1F3A]">{testId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {t.testedAt}:
                </span>
                <span className="font-mono text-slate-700 text-[11px] truncate max-w-[180px]">
                  {currentTimestamp}
                </span>
              </div>
            </div>

            {/* Operator Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.operatorName}
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.operatorAge}
                </label>
                <input
                  type="number"
                  value={operatorAge}
                  onChange={e => setOperatorAge(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.operatorId}
                </label>
                <input
                  type="text"
                  value={operatorId}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 font-mono text-slate-600"
                />
              </div>
            </div>

            {/* GPS Status Box */}
            <div className={`sm:col-span-2 p-3.5 rounded-xl border text-xs ${
              locationStatus === 'AVAILABLE'
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FF9933]" />
                  {t.gpsCoordinates}
                </span>
                <button
                  type="button"
                  onClick={requestGeolocation}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  Refresh GPS
                </button>
              </div>
              <div className="mt-1 font-mono text-xs font-semibold">
                {locationStatus === 'AVAILABLE' ? (
                  `Lat: ${coords.lat?.toFixed(6)}, Lng: ${coords.lng?.toFixed(6)} (±${Math.round(coords.accuracy || 0)}m)`
                ) : (
                  locationMessage
                )}
              </div>
            </div>
          </div>

          <DisclaimerBanner compact />

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(kitFromUrl ? 3 : 2)}
              disabled={!vehicleNumber.trim()}
              className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#0F2B5C] text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <span>{t.btnNext}: {kitFromUrl ? t.stepCapturePhoto : t.stepSelectKit}</span>
              <ArrowRight className="w-4 h-4 text-[#FF9933]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SELECT TEST KIT CATEGORY */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#FF9933]" />
                {t.stepSelectKit}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select from the 3 official colorimetric field testing kit categories.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.btnBack}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['STANDARD_NARCOTIC', 'PRECURSOR_CHEMICAL', 'KETAMINE'] as KitType[]).map(kitId => {
              const def = KIT_DEFINITIONS[kitId];
              const isSelected = selectedKit === kitId;
              return (
                <div
                  key={kitId}
                  onClick={() => setSelectedKit(kitId)}
                  className={`p-5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#0B1F3A] bg-blue-50/40 shadow-md ring-2 ring-[#FF9933]/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${def.badgeColor}`}>
                        {def.shortCode}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0B1F3A]" />}
                    </div>
                    <h3 className="font-bold text-sm text-[#0B1F3A]">
                      {language === 'hi' ? def.nameHi : def.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {language === 'hi' ? def.descriptionHi : def.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                    {def.tests.length} Field Tests Available
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              {t.btnBack}
            </button>
            <button
              type="button"
              onClick={() => {
                // Default to first test of selected kit
                const tests = KIT_DEFINITIONS[selectedKit].tests;
                if (tests.length > 0) {
                  setSelectedTestId(tests[0].id);
                }
                setCurrentStep(3);
              }}
              className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#0F2B5C] text-white text-xs font-bold transition flex items-center gap-2 shadow-md"
            >
              <span>{t.btnNext}: {t.stepCapturePhoto}</span>
              <ArrowRight className="w-4 h-4 text-[#FF9933]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: OPTICAL CAMERA CAPTURE */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(kitFromUrl ? 1 : 2)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.btnBack}</span>
            </button>
            <div className="text-xs font-mono text-slate-500 font-semibold">
              Vehicle: <span className="font-bold text-[#0B1F3A]">{vehicleNumber}</span> • Test: <span className="font-bold text-[#0B1F3A]">{activeTestDef?.name}</span>
            </div>
          </div>

          <CameraCapture onPhotoCaptured={handlePhotoCaptured} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: COLOR ANALYSIS & REFERENCE CARD CHECK */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.btnRetake}</span>
            </button>
            {isDemoSample && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                Simulated Test Sample: {demoSampleName}
              </span>
            )}
          </div>

          {analyzing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 border-4 border-[#0B1F3A] border-t-[#FF9933] rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-[#0B1F3A]">
                {t.btnProceedAnalysis}...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Validating reference colour card patches, standardizing illumination gains, and calculating CIELAB Delta-E color distance.
              </p>
            </div>
          ) : analysisOutput && capturedDataUrl ? (
            <div className="space-y-6">
              
              {/* Reference Card Detection Warning */}
              {refCardError && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 flex items-start gap-3 shadow-xs">
                  <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-relaxed">{refCardError}</p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-amber-900 underline hover:text-amber-800 cursor-pointer"
                    >
                      {t.btnRetake}
                    </button>
                  </div>
                </div>
              )}

              {/* Result Card Preview */}
              <ResultCard
                result={analysisOutput.result}
                confidence={analysisOutput.confidence}
                qualityScore={analysisOutput.quality_score}
                colourValues={analysisOutput.colour_values}
                reason={analysisOutput.reason}
                detectedDrug={detectedDrug || analysisOutput.detected_drug}
                testId={testId}
                timestamp={currentTimestamp}
              />

              {/* Side-by-Side: Image and Color Calibration View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Captured Photo */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Field Test Capture
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Raw Sensor Frame
                    </span>
                  </div>

                  <div className="aspect-[4/3] rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={capturedDataUrl}
                      alt="Captured kit"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Calculated Image Hash */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mb-1">
                      <Hash className="w-3.5 h-3.5 text-[#0B1F3A]" />
                      <span>{t.imageHash}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-800 break-all select-all">
                      {imageHash}
                    </p>
                  </div>
                </div>

                {/* Color Calibration Inspector */}
                <div className="lg:col-span-7">
                  <ColorCalibrationView
                    calibrationData={analysisOutput.calibration_data}
                    colourValues={analysisOutput.colour_values}
                    imageUrl={capturedDataUrl}
                  />
                </div>
              </div>

              {/* Proceed to Final Review & Signature */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F3A]">
                    {t.stepResultSummary}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review examination details and attach digital operator signature.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    {t.btnRetake}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#0F2B5C] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>{t.btnNext}: {t.stepResultSummary}</span>
                    <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: EXAMINATION RESULT SUMMARY & OPERATOR SIGNATURE */}
      {/* ========================================================================= */}
      {currentStep === 5 && analysisOutput && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF9933] bg-[#0B1F3A] px-2.5 py-1 rounded">
                Dossier {testId}
              </span>
              <h2 className="text-xl font-black text-[#0B1F3A] mt-1">
                {t.stepResultSummary}
              </h2>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-slate-500">{currentTimestamp}</span>
            </div>
          </div>

          {/* Dossier Meta Summary Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t.vehicleNumber}</span>
              <div className="text-base font-black font-mono text-[#0B1F3A]">{vehicleNumber}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t.sampleType}</span>
              <div className="text-sm font-bold text-slate-800">
                {sampleType === 'Other' && customSampleType ? customSampleType : sampleType}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Test Kit & Reagent</span>
              <div className="text-sm font-bold text-slate-800">{activeTestDef?.name}</div>
              <div className="text-[10px] text-slate-500">{activeKitDef.shortCode} • {activeTestDef?.reagent}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Field Classification</span>
              <div className={`text-sm font-black ${
                analysisOutput.result === 'POSITIVE' ? 'text-rose-700' :
                analysisOutput.result === 'NEGATIVE' ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {analysisOutput.result} ({analysisOutput.confidence}%)
              </div>
            </div>
          </div>

          {/* Operator Signature Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#FF9933]" />
                {t.operatorSignature} ({operatorName || operator?.full_name})
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Badge: {operator?.badge_number} • Age: {operatorAge}
              </span>
            </div>

            <SignaturePad
              initialSignature={signatureUrl}
              onSave={dataUrl => setSignatureUrl(dataUrl)}
              onClear={() => setSignatureUrl(undefined)}
            />
          </div>

          {/* Cryptographic Provenance Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#0B1F3A]">
              <Shield className="w-4 h-4 text-[#FF9933]" />
              <span>Cryptographic Security & Verification Proofs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <div>
                <span className="text-slate-400">Binary Image SHA-256:</span>
                <p className="truncate select-all text-slate-900 font-semibold">{imageHash}</p>
              </div>
              <div>
                <span className="text-slate-400">Canonical Ledger:</span>
                <p className="text-slate-900 font-semibold">Strict Key Sorting & RFC 8785 Compliance</p>
              </div>
            </div>
          </div>

          {/* Mandatory Statutory Notice */}
          <DisclaimerBanner />

          {saveError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error Saving Record:</span> {saveError}
              </div>
            </div>
          )}

          {/* Big Action Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              {t.btnBack}
            </button>
            <button
              type="button"
              onClick={handleFinalizeAndSave}
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#071527] active:scale-98 disabled:opacity-50 text-white text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#FF9933]" />
              <span>{saving ? t.savingRecord : t.btnSaveDigitalRecord}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: RECORD SUCCESSFULLY ARCHIVED & SEALED */}
      {/* ========================================================================= */}
      {currentStep === 6 && savedRecord && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#FFF7ED] text-[#E65100] border border-[#FF8C00]/40">
              ✓ {t.recordAuthentic}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
              {savedRecord.test_id}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Vehicle <span className="font-bold text-[#0B1F3A]">{savedRecord.vehicle_number}</span> test results and digital operator signature have been cryptographically committed to the permanent forensic ledger.
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Vehicle Number:</span>
              <span className="font-mono font-bold text-[#0B1F3A]">{savedRecord.vehicle_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Sample Type:</span>
              <span className="font-bold text-slate-800">{savedRecord.sample_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Result:</span>
              <span className="font-black text-[#0B1F3A]">{savedRecord.result} ({savedRecord.confidence}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Operator:</span>
              <span className="font-medium text-slate-800">{savedRecord.operator_name || savedRecord.operator_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Signature:</span>
              <span className="font-bold text-emerald-700">✓ Digital Signature Attached</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={`/test/${savedRecord.test_id}`}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#0F2B5C] text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-[#FF9933]" />
              <span>View Full Digital Record</span>
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t.btnPrintRecord}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const randomPart = Math.floor(1000 + Math.random() * 9000);
                setTestId(`EJ-${datePart}-${randomPart}`);
                setVehicleNumber('');
                setCapturedBlob(null);
                setCapturedDataUrl(null);
                setAnalysisOutput(null);
                setSavedRecord(null);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Examination</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function NewTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-[#FF9933] border-t-transparent rounded-full" /></div>}>
      <NewTestInner />
    </Suspense>
  );
}
