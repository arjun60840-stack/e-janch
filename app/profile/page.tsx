'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Shield, 
  Database, 
  LogOut, 
  FileText,
  Save,
  CheckCircle2,
  Pen,
  Languages
} from 'lucide-react';
import { 
  getCurrentOperator, 
  logoutCurrentOperator, 
  updateOperatorProfile,
  isLiveSupabaseConfigured, 
  fetchTestRecords, 
  fetchAuditLogs 
} from '@/lib/supabase/client';
import { OperatorProfile, AuditLogEntry } from '@/types';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import SignaturePad from '@/components/SignaturePad';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProfilePage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [operator, setOperator] = useState<OperatorProfile | null>(null);
  const [operatorName, setOperatorName] = useState('');
  const [operatorAge, setOperatorAge] = useState<number | string>(35);
  const [department, setDepartment] = useState('');
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined);

  const [testCount, setTestCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const op = await getCurrentOperator();
      if (!op) {
        router.push('/login');
        return;
      }
      setOperator(op);
      setOperatorName(op.operator_name || op.full_name || '');
      setOperatorAge(op.operator_age || 35);
      setDepartment(op.department || '');
      setSignatureUrl(op.signature_url);

      const [res, logs] = await Promise.all([
        fetchTestRecords({ operator: op.operator_id }),
        fetchAuditLogs(),
      ]);
      setTestCount(res.total);
      setAuditLogs(logs.slice(0, 15));
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator) return;

    const updated = await updateOperatorProfile({
      operator_name: operatorName,
      full_name: operatorName,
      operator_age: operatorAge,
      department,
      signature_url: signatureUrl,
      preferred_language: language,
    });

    setOperator(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleLogout = async () => {
    await logoutCurrentOperator();
    router.push('/login');
  };

  if (loading || !operator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading Operator Dossier...</p>
      </div>
    );
  }

  const isLive = isLiveSupabaseConfigured();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full ring-2 ring-[#FF9933] overflow-hidden bg-[#0B1F3A] shrink-0 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/e-jaanch-emblem.jpg" 
              alt="Police Emblem" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
                {operator.operator_name || operator.full_name}
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono font-medium mt-0.5">
              Operator ID: <span className="font-bold text-[#0B1F3A]">{operator.operator_id}</span> • Badge: {operator.badge_number}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.navLogout}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operator Profile and Digital Signature saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Operator Information */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#FF9933]" />
              <span>{t.navProfile} & Credentials</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">{t.operatorName}</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">{t.operatorAge}</label>
                  <input
                    type="number"
                    value={operatorAge}
                    onChange={e => setOperatorAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">{t.operatorId}</label>
                  <input
                    type="text"
                    value={operator.operator_id}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">{t.department}</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Documented Field Tests:</span>
                <span className="font-bold text-[#FF9933] font-mono text-sm">{testCount} Records</span>
              </div>
            </div>
          </div>

          {/* System Settings & Language */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-[#FF9933]" />
              <span>{t.navLanguage} & Persistence</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1.5">{t.navLanguage}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      language === 'en'
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      language === 'hi'
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Supabase Database:</span>
                <span className={`font-bold flex items-center gap-1.5 ${isLive ? 'text-emerald-700' : 'text-[#0B1F3A]'}`}>
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#FF9933]'}`} />
                  {isLive ? 'Live Remote' : 'Offline High-Fidelity'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500 font-medium">Signature Storage Bucket:</span>
                <span className="font-mono font-bold text-[#0B1F3A]">operator-signatures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Signature Management */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
              <Pen className="w-4 h-4 text-[#FF9933]" />
              <span>{t.operatorSignature}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Attached to all certified field test dossiers
            </span>
          </div>

          <SignaturePad
            initialSignature={signatureUrl}
            onSave={dataUrl => setSignatureUrl(dataUrl)}
            onClear={() => setSignatureUrl(undefined)}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#FF9933]" />
            <span>Save Profile & Signature</span>
          </button>
        </div>
      </form>

      {/* Forensic Audit Log Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#FF9933]" />
            <span>Operator Security & Forensic Audit Log</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {auditLogs.length} Recent Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No audit entries recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Associated Test ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id || log.event_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        log.event_type === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                        log.event_type === 'RECORD_CREATED' || log.event_type === 'TEST_STARTED' ? 'bg-emerald-100 text-emerald-800' :
                        log.event_type === 'RECORD_VERIFIED' ? 'bg-purple-100 text-purple-800' :
                        log.event_type === 'LOGOUT' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {log.operator_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#0B1F3A]">
                      {log.test_id ? (
                        <Link href={`/test/${log.test_id}`} className="hover:text-[#FF9933] hover:underline font-bold">
                          {log.test_id}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DisclaimerBanner />

    </div>
  );
}
