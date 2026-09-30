'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldAlert, ArrowRight, CheckCircle2, Languages } from 'lucide-react';
import { loginWithCredentials, DEMO_OPERATORS } from '@/lib/supabase/client';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [operatorIdOrEmail, setOperatorIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorIdOrEmail.trim()) {
      setError('Please enter your Operator ID or email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginWithCredentials(operatorIdOrEmail, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (operatorId: string) => {
    setOperatorIdOrEmail(operatorId);
    setPassword('DemoSecret2026!');
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithCredentials(operatorId);
      if (res.success) {
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0B1F3A] via-[#071527] to-[#0B1F3A] text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* Language switch at top of login */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-amber-200 transition cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className={language === 'en' ? 'font-bold text-white' : 'text-slate-400'}>EN</span>
            <span className="text-slate-400">|</span>
            <span className={language === 'hi' ? 'font-bold text-white' : 'text-slate-400'}>हिंदी</span>
          </button>
        </div>

        {/* Header Official Branding */}
        <div className="text-center space-y-3">
          <div className="inline-block relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full ring-4 ring-[#FF9933] ring-offset-4 ring-offset-[#0B1F3A] shadow-2xl shadow-black/50 overflow-hidden bg-[#0B1F3A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/e-jaanch-emblem.jpg" 
                alt="E-Jaanch Traffic Police Emblem" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#FF9933] text-[#0B1F3A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-white shadow-md font-mono">
              POLICE
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              {t.appName}
            </h1>
            <p className="text-xs font-black text-[#FFB077] uppercase tracking-widest mt-1">
              Traffic Police Alcohol & Drug Test
            </p>
            <p className="text-[11px] text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FFB077] to-[#0B1F3A]" />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-1.5">
                {t.operatorId} / Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-[#0B1F3A]" />
                </div>
                <input
                  type="text"
                  required
                  value={operatorIdOrEmail}
                  onChange={e => setOperatorIdOrEmail(e.target.value)}
                  placeholder="e.g. OP-DEL-8921 or operator@police.gov"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 text-sm font-semibold text-slate-900 transition outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-[#0B1F3A]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 text-sm font-semibold text-slate-900 transition outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#071527] active:scale-98 text-white font-black text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Operator...' : 'Sign In to Police Terminal'}</span>
              <ArrowRight className="w-4 h-4 text-[#FF9933] stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Demo Operator Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-center mb-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-white px-2">
                Fast Login for Field Evaluators
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_OPERATORS.map(op => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(op.operator_id)}
                  className="text-left p-3 rounded-xl border border-slate-200 hover:border-[#FF9933] hover:bg-amber-50/30 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1F3A] group-hover:text-[#FF9933] font-mono">
                      {op.operator_id}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9933] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">{op.operator_name || op.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">{op.department}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forensic Disclaimer */}
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}
