'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { fetchDashboardMetrics, fetchStateMetrics, fetchTrendData, fetchTestRecords, getCurrentOperator } from '@/lib/supabase/client';
import IndiaMap from '@/components/IndiaMap';
import DetectionTrendChart from '@/components/DetectionTrendChart';

import Link from 'next/link';
import { Activity, MapPin, TrendingUp, Shield, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { OperatorProfile, TestRecord } from '@/types';

export default function DashboardPage() {
  const { t, language } = useLanguage();

  const [operator, setOperator] = useState<OperatorProfile | null>(null);
  const [metrics, setMetrics] = useState({ total: 0, positive: 0, negative: 0, inconclusive: 0, invalid: 0 });
  const [stateData, setStateData] = useState<Record<string, { total: number; positive: number; negative: number; inconclusive: number; drugs: string[] }>>({});
  const [trendData, setTrendData] = useState<Array<{ date: string; positive: number; negative: number; inconclusive: number }>>([]);
  const [recentTests, setRecentTests] = useState<TestRecord[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setLoading(true);
      try {
        const op = await getCurrentOperator();
        const m = await fetchDashboardMetrics();
        const sd = await fetchStateMetrics();
        const td = await fetchTrendData({ period: timePeriod, state: selectedState || undefined });
        const rt = await fetchTestRecords({ pageSize: 5 });

        if (isMounted) {
          if (op) setOperator(op);
          if (m) setMetrics(m);
          if (sd) setStateData(sd);
          if (td) setTrendData(td);
          if (rt?.tests) setRecentTests(rt.tests);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInitialData();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    let isMounted = true;
    async function updateTrendData() {
      try {
        const td = await fetchTrendData({ period: timePeriod, state: selectedState || undefined });
        if (isMounted && td) setTrendData(td);
      } catch (err) {
        console.error("Error updating trend data:", err);
      }
    }
    updateTrendData();
    return () => { isMounted = false; };
  }, [timePeriod, selectedState, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1F3A]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF9933] bg-[#0B1F3A] px-2.5 py-1 rounded">
              OFFICER TERMINAL
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F3A] mt-2">
              {t.dashboardWelcome || 'Welcome'}, {operator?.full_name || operator?.operator_name || 'Inspector'}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-xs">
              <Shield className="w-4 h-4 text-[#FF9933]" />
              {operator?.badge_number || 'BADGE-001'} • {operator?.department || 'Traffic & Narcotics Inspection Squad'}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-xs border-l-4 border-[#0B1F3A] border-t border-r border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboardStatTotal || 'Total Tests'}</p>
                <p className="text-3xl font-black text-[#0B1F3A] mt-2">{metrics.total}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <Activity className="w-6 h-6 text-[#0B1F3A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border-l-4 border-rose-600 border-t border-r border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboardStatPositive || 'Positive'}</p>
                <p className="text-3xl font-black text-rose-600 mt-2">{metrics.positive}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border-l-4 border-emerald-600 border-t border-r border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboardStatNegative || 'Negative'}</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">{metrics.negative}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border-l-4 border-amber-500 border-t border-r border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dashboardStatInconclusive || 'Inconclusive'}</p>
                <p className="text-3xl font-black text-amber-600 mt-2">{metrics.inconclusive}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Map and Regional Trends Section */}
        <div className="space-y-6">
          {/* India Geomap and Top 5 / Lowest 5 Case Analysis */}
          <IndiaMap 
            stateData={stateData} 
            selectedState={selectedState} 
            onStateClick={setSelectedState} 
          />

          {/* Regional Trends Line Chart */}
          <div className="bg-white rounded-2xl shadow-xs p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-[#0B1F3A] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF9933]" />
                {t.dashboardSubtitle || 'Drug Detection Trends Across Regions'}
              </h2>
            </div>
            <div className="min-h-[300px]">
              <DetectionTrendChart 
                data={trendData} 
                selectedState={selectedState} 
                timePeriod={timePeriod} 
                onTimePeriodChange={setTimePeriod} 
              />
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Examinations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs p-6 overflow-hidden border border-slate-200">
            <h2 className="text-base font-bold text-[#0B1F3A] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF9933]" />
              {t.dashboardRecentTitle || 'Recent Examinations'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#0B1F3A] text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">{t.resultTestId || 'Test ID'}</th>
                    <th className="px-4 py-3 font-semibold">{t.resultDate || 'Date'}</th>
                    <th className="px-4 py-3 font-semibold">{t.vehicleNumber || 'Vehicle No.'}</th>
                    <th className="px-4 py-3 font-semibold">{t.resultDetectedDrug || 'Detected Substance'}</th>
                    <th className="px-4 py-3 font-semibold">{t.historyFilterResult || 'Result'}</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">{t.operatorName || 'Operator'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTests.map((test) => (
                    <tr key={test.test_id || test.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold">
                        <Link href={`/test/${test.test_id || test.id}`} className="text-[#0B1F3A] hover:text-[#FF9933]">
                          {(test.test_id || test.id)}
                        </Link>
                        {test.is_demo && <span className="ml-2 text-[10px] font-bold bg-[#FFF7ED] text-[#E65100] border border-[#FF8C00]/40 px-1.5 py-0.5 rounded">DEMO</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(test.tested_at || test.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{test.vehicle_number || '-'}</td>
                      <td className="px-4 py-3 font-bold text-[#0B1F3A]">{test.detected_drug || 'None Detected'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase
                          ${test.result === 'POSITIVE' ? 'bg-rose-100 text-rose-800' : 
                            test.result === 'NEGATIVE' ? 'bg-emerald-100 text-emerald-800' : 
                            'bg-amber-100 text-amber-800'}`}>
                          {test.result === 'POSITIVE' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {test.result === 'NEGATIVE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {test.result === 'INCONCLUSIVE' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {test.result === 'POSITIVE' ? t.resultPositive : test.result === 'NEGATIVE' ? t.resultNegative : t.resultInconclusive}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{test.operator_name || test.operator_id}</td>
                    </tr>
                  ))}
                  {recentTests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        {t.historyNoResults || 'No records found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs p-6 border border-slate-200">
            <h2 className="text-base font-bold text-[#0B1F3A] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF9933]" />
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <Link 
                href="/select-kit" 
                className="w-full flex items-center justify-center gap-2 bg-[#FF9933] hover:bg-[#e68a2e] text-[#0B1F3A] py-3.5 px-4 rounded-xl font-black text-xs transition-colors shadow-md"
              >
                <Activity className="w-4 h-4" />
                <span>+ {t.btnNewTest || 'NEW SCAN'} / नया परीक्षण</span>
              </Link>
              
              <Link 
                href="/history" 
                className="w-full flex items-center justify-center gap-2 bg-[#0B1F3A] hover:bg-[#0F2B5C] text-white py-3 px-4 rounded-xl font-bold text-xs transition-colors shadow-md"
              >
                <FileText className="w-4 h-4 text-[#FF9933]" />
                <span>{t.navHistory || 'TEST HISTORY'}</span>
              </Link>
              
              <Link 
                href="/verify" 
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 py-3 px-4 rounded-xl font-bold text-xs transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-600" />
                <span>{t.navVerify || 'VERIFY RECORD'}</span>
              </Link>
            </div>
          </div>
          
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center border-t border-slate-200 pt-6 pb-2">
          <p className="text-xs text-slate-500 max-w-4xl mx-auto">
            {t.dashboardDisclaimer || 'PRESUMPTIVE TEST RESULTS ONLY. This system provides preliminary colorimetric analysis for field screening. All positive samples must be forwarded to an accredited forensic laboratory for confirmatory analysis.'}
          </p>
        </div>

      </main>
    </div>
  );
}
