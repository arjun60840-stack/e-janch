'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ArrowUpDown, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  RotateCcw,
  MapPin,
  Car,
  Beaker,
  Filter
} from 'lucide-react';
import { fetchTestRecords } from '@/lib/supabase/client';
import { TestRecord, KitType } from '@/types';
import { Pagination } from '@/components/Pagination';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TestHistoryPage() {
  const { language, t } = useLanguage();
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [kitFilter, setKitFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTestRecords({
        search: search.trim() || undefined,
        result: resultFilter,
        kitType: kitFilter !== 'ALL' ? kitFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: currentPage,
        pageSize,
      });

      let sorted = [...data.tests];
      if (sortOrder === 'asc') {
        sorted.sort((a, b) => new Date(a.tested_at).getTime() - new Date(b.tested_at).getTime());
      } else {
        sorted.sort((a, b) => new Date(b.tested_at).getTime() - new Date(a.tested_at).getTime());
      }

      setTests(sorted);
      setTotal(data.total);
    } catch (e) {
      console.error('Failed to fetch test records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, resultFilter, kitFilter, dateFrom, dateTo, sortOrder, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setResultFilter('ALL');
    setKitFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#FF9933] text-[#0B1F3A] shadow-xs">
            POLICE FORENSIC ARCHIVE
          </span>
          <h1 className="text-2xl font-black text-[#0B1F3A] mt-1">
            {t.navHistory}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Searchable ledger of verified field tests indexed by vehicle registration, sample type, and kit type.
          </p>
        </div>

        <Link
          href="/new-test"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9933] hover:bg-[#e68a2e] text-[#0B1F3A] font-bold text-xs shadow-md transition cursor-pointer self-start md:self-auto"
        >
          <span>+ {t.navNewTest}</span>
        </Link>
      </div>

      <DisclaimerBanner compact />

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-[#0B1F3A]" />
            </div>
            <input
              type="text"
              placeholder={`${t.btnSearch} (${t.vehicleNumber}, Test ID, Operator)...`}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition bg-slate-50"
            />
          </div>

          {/* Kit Type Filter */}
          <div>
            <select
              value={kitFilter}
              onChange={e => {
                setKitFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-[#FF9933] bg-white cursor-pointer text-slate-700"
            >
              <option value="ALL">All Kits (Filter)</option>
              <option value="STANDARD_NARCOTIC">Standard Narcotic (SNDK)</option>
              <option value="PRECURSOR_CHEMICAL">Precursor Chemicals (PCK)</option>
              <option value="KETAMINE">Ketamine Kit (KET)</option>
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={e => {
                setResultFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-[#FF9933] bg-white cursor-pointer text-slate-700"
            >
              <option value="ALL">All Results (Filter)</option>
              <option value="POSITIVE">{t.statusPositive}</option>
              <option value="NEGATIVE">{t.statusNegative}</option>
              <option value="INCONCLUSIVE">{t.statusInconclusive}</option>
              <option value="INVALID_IMAGE">{t.statusInvalidImage}</option>
            </select>
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              title={t.btnReset}
              className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#0B1F3A] border-t-[#FF9933] rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Querying police database records...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No records found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No field examination records match the current search filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              {t.btnReset}
            </button>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1F3A] text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">{t.vehicleNumber}</th>
                    <th className="py-3 px-4">{t.sampleType}</th>
                    <th className="py-3 px-4">{t.historyColDetectedDrug}</th>
                    <th className="py-3 px-4">Test ID</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Signature</th>
                    <th className="py-3 px-4 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {tests.map(test => (
                    <tr key={test.test_id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Vehicle Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-amber-50 border border-amber-300 text-amber-950 px-2 py-0.5 rounded font-black tracking-wider text-[11px]">
                          {test.vehicle_number || 'UNSPECIFIED'}
                        </span>
                      </td>

                      {/* Sample Type */}
                      <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Beaker className="w-3 h-3 text-[#FF9933]" />
                          {test.sample_type || 'Saliva'}
                        </span>
                      </td>

                      {/* Detected Drug */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#0B1F3A]">{test.detected_drug || 'None Detected'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{test.kit_type || 'STANDARD_NARCOTIC'}</div>
                      </td>

                      {/* Test ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link href={`/test/${test.test_id}`} className="font-mono font-bold text-[#0B1F3A] hover:text-[#FF9933]">
                          {test.test_id}
                        </Link>
                        <div className="text-[10px] text-slate-400">
                          {new Date(test.tested_at).toLocaleString('en-GB')}
                        </div>
                      </td>

                      {/* Result */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          test.result === 'POSITIVE' ? 'bg-rose-100 text-rose-800' :
                          test.result === 'NEGATIVE' ? 'bg-emerald-100 text-emerald-800' :
                          test.result === 'INCONCLUSIVE' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {test.result} ({test.confidence}%)
                        </span>
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        <div>{test.operator_name || test.operator_id}</div>
                        <div className="text-[10px] text-slate-400">{test.operator_id}</div>
                      </td>

                      {/* Signature Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {test.signature_url ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Signed
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Unsigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/test/${test.test_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1F3A] hover:text-[#FF9933]"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={p => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

    </div>
  );
}
