'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RotateCcw, 
  Check, 
  SwitchCamera, 
  AlertCircle, 
  FlaskConical, 
  Sparkles,
  Layers
} from 'lucide-react';
import { DEMO_SAMPLES, generateSyntheticTestKitImage } from '@/lib/demo/sample-kits';

interface CameraCaptureProps {
  onPhotoCaptured: (blob: Blob, dataUrl: string, isDemoSample?: boolean, sampleName?: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<{ blob: Blob; dataUrl: string; isDemo?: boolean; name?: string } | null>(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  // Start Camera Stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser. Please grant camera access.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please grant camera access in your browser settings. / कैमरा की अनुमति अस्वीकार कर दी गई है।');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. / इस डिवाइस पर कोई कैमरा नहीं मिला।');
      } else {
        setCameraError(err.message || 'Unable to open camera stream. / कैमरा स्ट्रीम खोलने में असमर्थ।');
      }
      setCameraActive(false);
    }
  }, [stream]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, []);

  // Toggle Camera
  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Capture Frame
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedPhoto({ blob, dataUrl, isDemo: false });
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  // Retake
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Confirm photo
  const handleUsePhoto = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto.blob, capturedPhoto.dataUrl, capturedPhoto.isDemo, capturedPhoto.name);
    }
  };

  // Load Demo Sample
  const handleLoadDemoSample = async (sampleId: string) => {
    const sample = DEMO_SAMPLES.find(s => s.id === sampleId);
    if (!sample) return;

    setIsGeneratingDemo(true);
    try {
      const blob = await generateSyntheticTestKitImage(sample);
      const dataUrl = URL.createObjectURL(blob);
      setCapturedPhoto({
        blob,
        dataUrl,
        isDemo: true,
        name: sample.name,
      });
      stopCamera();
    } catch (err) {
      console.error('Demo generation error:', err);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Instruction Banner */}
      <div className="p-4 bg-[#0A1E3F] border-b border-[#1E3A8A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#FFB077] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF7722] animate-pulse" />
            CAMERA SCAN / कैमरा स्कैन
          </div>
          <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
            Place the completed colorimetric test-kit paper and reference colour card inside the scanning frame.
          </h2>
          <p className="text-xs text-[#FFD4B2] mt-0.5 font-medium">
            पूर्ण किए गए कलरिमेट्रिक टेस्ट किट और रेफरेंस कलर कार्ड को स्कैनिंग फ्रेम के अंदर रखें।
          </p>
        </div>

        {/* Camera Toggle Button */}
        {cameraActive && !capturedPhoto && (
          <button
            onClick={toggleFacingMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F2B5C] hover:bg-[#163870] text-xs font-bold transition-colors border border-[#1E3A8A] text-white self-start sm:self-auto cursor-pointer"
          >
            <SwitchCamera className="w-3.5 h-3.5" />
            <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
          </button>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-[540px] bg-[#071326] flex items-center justify-center overflow-hidden">
        
        {/* State A: Photo Captured Preview */}
        {capturedPhoto ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPhoto.dataUrl}
              alt="Captured field test"
              className="max-h-full max-w-full object-contain"
            />
            {capturedPhoto.isDemo && (
              <div className="absolute top-4 left-4 bg-[#FF7722] text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Demo Sample Kit
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-[#0A1E3F]/90 border border-[#1E3A8A] text-white text-xs px-3 py-1.5 rounded-xl font-mono shadow-md">
              ✓ Image Captured • Ready for Colorimetric Analysis
            </div>
          </div>
        ) : cameraActive ? (
          /* State B: Live Camera Stream with Overlay HUD */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Visual Alignment Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-12 grid-rows-6 p-4 gap-2">
              
              {/* Left Zone: Reference Colour Card Target (Saffron Framing) */}
              <div className="col-start-2 col-span-4 row-start-2 row-span-4 border-2 border-dashed border-[#FF7722] rounded-xl bg-[#FF7722]/10 backdrop-blur-[1px] flex flex-col items-center justify-between p-3 shadow-inner">
                <span className="bg-[#FF7722] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                  Reference Card Target
                </span>
                
                {/* 3 Patch target guides */}
                <div className="w-full space-y-1.5 opacity-90">
                  <div className="h-5 rounded border border-white bg-white/70 flex items-center justify-center text-[9px] font-bold text-slate-900">
                    White (95%)
                  </div>
                  <div className="h-5 rounded border border-gray-400 bg-gray-500/70 flex items-center justify-center text-[9px] font-bold text-white">
                    18% Neutral Gray
                  </div>
                  <div className="h-5 rounded border border-black bg-black/80 flex items-center justify-center text-[9px] font-bold text-gray-200">
                    Black (3%)
                  </div>
                </div>

                <span className="text-[9px] font-mono text-[#FFD4B2] font-semibold">Position Calibration Card</span>
              </div>

              {/* Right Zone: Test Kit Reaction Well Target (Navy / Cyan Framing) */}
              <div className="col-start-7 col-span-5 row-start-2 row-span-4 border-2 border-dashed border-cyan-400 rounded-2xl bg-[#0A1E3F]/40 backdrop-blur-[1px] flex flex-col items-center justify-between p-3">
                <span className="bg-[#0A1E3F] border border-cyan-400 text-cyan-300 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Test Kit / Result Area
                </span>

                {/* Circular Target Reticle */}
                <div className="w-24 h-24 rounded-full border-2 border-cyan-400/90 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-cyan-300 bg-cyan-400/30 animate-pulse" />
                </div>

                <span className="text-[9px] font-mono text-cyan-200 font-semibold">Align Reaction Fluid / Well</span>
              </div>
            </div>

            {/* Instruction Overlay Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0A1E3F]/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-[#1E3A8A] pointer-events-none shadow-xl font-medium">
              Place the completed test and reference colour card inside the frame.
            </div>
          </div>
        ) : (
          /* State C: Camera Unavailable / Fallback Screen */
          <div className="p-8 text-center max-w-md">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#0F2B5C] text-[#FF7722] flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-white font-bold text-sm">Camera Unavailable / कैमरा उपलब्ध नहीं है</h3>
            <p className="text-slate-300 text-xs mt-1 mb-4 leading-relaxed">
              {cameraError || 'Browser camera permission was not granted, or device camera is in use. / ब्राउज़र कैमरे की अनुमति नहीं दी गई थी, या डिवाइस कैमरा उपयोग में है।'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => startCamera(facingMode)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FF7722] hover:bg-[#E65100] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Allow Camera Access / कैमरा की अनुमति दें
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Alternate Input Options */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-start">
          {/* Quick Demo Sample Selector */}
          <div className="relative inline-block text-left">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 pl-2 hidden sm:inline">
                Simulated Kits:
              </span>
              {DEMO_SAMPLES.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadDemoSample(sample.id)}
                  disabled={isGeneratingDemo}
                  title={sample.description}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    sample.expectedResult === 'POSITIVE'
                      ? 'bg-amber-50 text-[#E65100] border-[#FF8C00] hover:bg-amber-100'
                      : sample.expectedResult === 'NEGATIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : sample.expectedResult === 'INCONCLUSIVE'
                      ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sample.expectedResult === 'POSITIVE' ? 'Demo Positive' :
                   sample.expectedResult === 'NEGATIVE' ? 'Demo Negative' :
                   sample.expectedResult === 'INCONCLUSIVE' ? 'Demo Inconclusive' : 'Demo Invalid'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {capturedPhoto ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETAKE / पुनः लें</span>
              </button>
              <button
                onClick={handleUsePhoto}
                className="flex-1 md:flex-none px-7 py-2.5 rounded-xl bg-[#0A1E3F] hover:bg-[#0F2B5C] text-white text-xs font-bold transition-all shadow-md shadow-[#0A1E3F]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#FF7722]" />
                <span>USE SCAN / स्कैन उपयोग करें</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!cameraActive}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#FF7722] hover:bg-[#E65100] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black tracking-wide transition-all shadow-lg shadow-[#FF7722]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>SCAN / कैप्चर</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
