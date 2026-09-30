'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD
  positive: number;
  negative: number;
  inconclusive: number;
}

export interface DetectionTrendChartProps {
  data: TrendDataPoint[];
  selectedState?: string | null;
  timePeriod: '7d' | '30d' | '90d' | 'all';
  onTimePeriodChange: (period: '7d' | '30d' | '90d' | 'all') => void;
}

export default function DetectionTrendChart({
  data,
  selectedState,
  timePeriod,
  onTimePeriodChange
}: DetectionTrendChartProps) {
  const { t } = useLanguage();

  const formattedData = useMemo(() => {
    return data.map(point => {
      // Parse YYYY-MM-DD to DD/MM for display
      const dateObj = new Date(point.date);
      // Handle potential invalid dates safely
      if (isNaN(dateObj.getTime())) {
         return {
            ...point,
            displayDate: point.date,
         }
      }
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      return {
        ...point,
        displayDate: `${day}/${month}`,
      };
    });
  }, [data]);

  const timePeriods = [
    { value: '7d', label: t.dashboardChartFilter7d || 'Last 7 Days' },
    { value: '30d', label: t.dashboardChartFilter30d || 'Last 30 Days' },
    { value: '90d', label: t.dashboardChartFilter90d || 'Last 90 Days' },
    { value: 'all', label: t.dashboardChartFilterAll || 'All Time' }
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F3A]">
            {t.dashboardChartTitle || 'Detection Trends'}
            {selectedState && <span className="text-slate-500 font-normal ml-2">({selectedState})</span>}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {timePeriods.map((period) => (
            <button
              key={period.value}
              onClick={() => onTimePeriodChange(period.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timePeriod === period.value
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow w-full h-[300px] min-h-[300px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            {t.dashboardChartNoData || 'No trend data available'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0B1F3A', marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                name={t.resultPositive || 'Positive'}
                dataKey="positive" 
                stroke="#FF9933" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                name={t.resultNegative || 'Negative'}
                dataKey="negative" 
                stroke="#0B1F3A" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                name={t.resultInconclusive || 'Inconclusive'}
                dataKey="inconclusive" 
                stroke="#94A3B8" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
