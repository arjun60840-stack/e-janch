'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FlaskConical, 
  ShieldCheck, 
  Camera, 
  Hash, 
  FileCheck2, 
  Sliders, 
  ArrowRight, 
  Sparkles,
  Search,
  Lock
} from 'lucide-react';
import { getCurrentOperator } from '@/lib/supabase/client';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const op = await getCurrentOperator();
      if (op) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Official Emblem */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full ring-4 ring-[#D4AF37] ring-offset-4 ring-offset-[#0A1E3F] shadow-2xl overflow-hidden bg-[#0A1E3F]">
            <img 
              src="/e-jaanch-emblem.jpg" 
              alt="E-Jaanch Traffic Police Emblem" 
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] text-[#E65100] text-xs font-bold uppercase tracking-wider border border-[#FF8C00]/40 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#FF7722]" />
            <span>Traffic Police Alcohol & Drug Field-Test Documentation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A1E3F] tracking-tight leading-tight">
            E-Jaanch <br />
            <span className="text-[#FF7722]">
              Digital Field Evidence Console
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            <strong>E-Jaanch</strong> standardizes roadside and field colorimetric assay capture using reference-card photometric calibration, deterministic CIELAB colorimetry, and SHA-256 tamper-evident digital sealing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FF7722] hover:bg-[#E65100] active:scale-98 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-[#FF7722]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Operator Terminal Login</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#0A1E3F] text-[#0A1E3F] font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#0A1E3F]" />
              <span>Verify Record by Test ID</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />
      </div>

      {/* 4 Pillars Architecture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Guided Optical Capture</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browser Camera API with real-time target reticle HUD to align reaction wells and NIST-traceable reference cards.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Photometric Calibration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates Von Kries chromatic white balance and illumination normalization against White, Gray, and Black standards.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">CIELAB Colorimetry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quantifies chromophore Delta-E color distance against configurable kit thresholds to classify Positive, Negative, or Inconclusive.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Hash className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">SHA-256 Tamper Evident</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every image file and canonical metadata record is cryptographically hashed and signed with server-side HMAC keys.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
