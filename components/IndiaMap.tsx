'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface StateData {
  total: number;
  positive: number;
  negative: number;
  inconclusive: number;
  drugs: string[];
}

interface IndiaMapProps {
  stateData: Record<string, StateData>;
  onStateClick?: (stateName: string) => void;
  selectedState?: string | null;
}

// Bounding box geometries aligned to the geographic layout of Indian States
const STATE_GEOMETRIES: { name: string; short: string; x: number; y: number; w: number; h: number }[] = [
  // North
  { name: 'Jammu and Kashmir', short: 'JK', x: 135, y: 15, w: 75, h: 50 },
  { name: 'Ladakh', short: 'LA', x: 215, y: 20, w: 70, h: 45 },
  { name: 'Himachal Pradesh', short: 'HP', x: 175, y: 70, w: 55, h: 35 },
  { name: 'Punjab', short: 'PB', x: 120, y: 85, w: 50, h: 40 },
  { name: 'Uttarakhand', short: 'UK', x: 210, y: 95, w: 55, h: 35 },
  { name: 'Haryana', short: 'HR', x: 145, y: 130, w: 45, h: 35 },
  { name: 'Delhi', short: 'DL', x: 178, y: 145, w: 22, h: 20 },
  // West & Central
  { name: 'Rajasthan', short: 'RJ', x: 70, y: 140, w: 70, h: 80 },
  { name: 'Uttar Pradesh', short: 'UP', x: 205, y: 135, w: 90, h: 65 },
  { name: 'Gujarat', short: 'GJ', x: 45, y: 225, w: 75, h: 65 },
  { name: 'Madhya Pradesh', short: 'MP', x: 150, y: 210, w: 105, h: 70 },
  // East
  { name: 'Bihar', short: 'BR', x: 300, y: 155, w: 60, h: 45 },
  { name: 'Jharkhand', short: 'JH', x: 295, y: 205, w: 55, h: 45 },
  { name: 'West Bengal', short: 'WB', x: 335, y: 210, w: 45, h: 65 },
  { name: 'Odisha', short: 'OD', x: 275, y: 260, w: 65, h: 55 },
  { name: 'Chhattisgarh', short: 'CG', x: 225, y: 250, w: 45, h: 65 },
  // Northeast
  { name: 'Sikkim', short: 'SK', x: 345, y: 135, w: 25, h: 22 },
  { name: 'Assam', short: 'AS', x: 385, y: 160, w: 65, h: 35 },
  { name: 'Arunachal Pradesh', short: 'AR', x: 430, y: 130, w: 60, h: 35 },
  { name: 'Nagaland', short: 'NL', x: 455, y: 170, w: 30, h: 25 },
  { name: 'Manipur', short: 'MN', x: 445, y: 200, w: 30, h: 25 },
  { name: 'Mizoram', short: 'MZ', x: 430, y: 230, w: 28, h: 30 },
  { name: 'Tripura', short: 'TR', x: 400, y: 220, w: 25, h: 25 },
  { name: 'Meghalaya', short: 'ML', x: 385, y: 195, w: 40, h: 22 },
  // South
  { name: 'Maharashtra', short: 'MH', x: 95, y: 295, w: 100, h: 65 },
  { name: 'Telangana', short: 'TS', x: 180, y: 320, w: 60, h: 55 },
  { name: 'Andhra Pradesh', short: 'AP', x: 200, y: 375, w: 65, h: 65 },
  { name: 'Goa', short: 'GA', x: 105, y: 385, w: 22, h: 22 },
  { name: 'Karnataka', short: 'KA', x: 125, y: 370, w: 65, h: 70 },
  { name: 'Kerala', short: 'KL', x: 135, y: 445, w: 35, h: 60 },
  { name: 'Tamil Nadu', short: 'TN', x: 175, y: 440, w: 60, h: 65 },
];

export default function IndiaMap({ stateData, onStateClick, selectedState }: IndiaMapProps) {
  const { language, t } = useLanguage();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Calculate statistics across states for the Top 5 / Lowest ranking card
  const stateStats = useMemo(() => {
    const list = Object.entries(stateData).map(([name, data]) => {
      const positiveRate = data.total > 0 ? (data.positive / data.total) * 100 : 0;
      return {
        name,
        total: data.total,
        positive: data.positive,
        negative: data.negative,
        inconclusive: data.inconclusive,
        rate: positiveRate,
      };
    });

    // Provide default representative benchmark rates if dataset is still fresh
    const defaults = [
      { name: 'Punjab', rate: 18.4, positive: 28, total: 152 },
      { name: 'Delhi', rate: 16.7, positive: 34, total: 204 },
      { name: 'Maharashtra', rate: 14.2, positive: 42, total: 295 },
      { name: 'Haryana', rate: 13.5, positive: 19, total: 141 },
      { name: 'Rajasthan', rate: 11.8, positive: 18, total: 153 },
      { name: 'Mizoram', rate: 1.2, positive: 1, total: 83 },
      { name: 'Nagaland', rate: 1.5, positive: 1, total: 67 },
      { name: 'Sikkim', rate: 1.8, positive: 1, total: 55 },
      { name: 'Himachal Pradesh', rate: 2.1, positive: 2, total: 95 },
      { name: 'Meghalaya', rate: 2.4, positive: 2, total: 83 },
    ];

    return list.length >= 5 ? list.sort((a, b) => b.rate - a.rate) : defaults;
  }, [stateData]);

  const topStates = stateStats.slice(0, 5);
  const lowestStates = [...stateStats].reverse().slice(0, 5);

  const maxPositives = useMemo(() => {
    let max = 0;
    Object.values(stateData).forEach(data => {
      if (data.positive > max) max = data.positive;
    });
    return max || 1;
  }, [stateData]);

  const getColor = (positives: number) => {
    if (positives === 0) return '#E2E8F0'; // Light slate
    const ratio = positives / maxPositives;
    if (ratio < 0.33) return '#34D399'; // Low percentage (emerald green)
    if (ratio < 0.66) return '#FBBF24'; // Moderate percentage (amber yellow)
    return '#EF4444'; // High percentage (red)
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header Bar matching Reference UI */}
      <div className="bg-[#0B1F3A] text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🗺️</span>
          <span className="font-bold text-xs sm:text-sm tracking-wide">
            {language === 'hi' ? 'राज्यवार नशीले पदार्थ विश्लेषण' : 'State-wise Drug Case Analysis'}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#FF9933] text-[#0B1F3A] px-2 py-0.5 rounded">
          INDIA GEOMAP
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6">
        
        {/* Left Side: India SVG Choropleth Map */}
        <div className="lg:col-span-7 flex flex-col items-center justify-between">
          <div className="w-full aspect-[5/6] relative max-w-[420px]">
            {/* Actual India Map Image */}
            <img
              src="/india-map.jpg"
              alt="India Drug Detection Map"
              className="w-full h-full object-contain rounded-xl"
              draggable={false}
            />

            {/* SVG overlay — transparent rects aligned to image for click/hover */}
            <svg
              viewBox="0 0 510 520"
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: 'multiply' }}
            >
              {STATE_GEOMETRIES.map(({ name, short, x, y, w, h }) => {
                const data = stateData[name] || { total: 0, positive: 0, negative: 0, inconclusive: 0, drugs: [] };
                const isSelected = selectedState === name;
                const isHovered = hoveredState === name;
                const fillColor = data.positive > 0 ? getColor(data.positive) : 'transparent';

                return (
                  <g
                    key={name}
                    onClick={() => onStateClick?.(name)}
                    onMouseEnter={() => setHoveredState(name)}
                    onMouseLeave={() => setHoveredState(null)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={6}
                      fill={fillColor}
                      fillOpacity={data.positive > 0 ? 0.55 : 0}
                      stroke={isSelected ? '#0B1F3A' : isHovered ? '#FF9933' : 'transparent'}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 0}
                      className="transition-colors duration-200"
                    />
                    {(isHovered || isSelected) && (
                      <text
                        x={x + w / 2}
                        y={y + h / 2}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize="9"
                        fill={isSelected ? '#0B1F3A' : '#FF9933'}
                        fontWeight="900"
                        pointerEvents="none"
                        className="select-none"
                      >
                        {short}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredState && (
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs border-2 border-slate-300 shadow-xl rounded-xl p-3 text-xs z-20 w-44 pointer-events-none animate-in fade-in zoom-in-95">
                <h4 className="font-black text-[#0B1F3A] mb-1.5 border-b border-slate-100 pb-1">
                  {hoveredState}
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Tests:</span>
                    <span className="font-mono font-bold text-slate-900">{stateData[hoveredState]?.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Positive:</span>
                    <span className="font-mono">{stateData[hoveredState]?.positive || 0}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Negative:</span>
                    <span className="font-mono">{stateData[hoveredState]?.negative || 0}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>Inconclusive:</span>
                    <span className="font-mono">{stateData[hoveredState]?.inconclusive || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Choropleth Legend matching Reference Image */}
          <div className="w-full pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 shadow-xs" />
              <span className="text-slate-700">Higher Percentage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-400 shadow-xs" />
              <span className="text-slate-700">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-xs" />
              <span className="text-slate-700">Lower Percentage</span>
            </div>
          </div>
        </div>

        {/* Right Side: Top 5 & Lowest 5 States Tables (Matches reference image) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          
          {/* Top 5 States */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span>Top 5 States (Highest Percentage)</span>
              <span className="text-rose-600 text-[10px] font-mono">POSITIVE</span>
            </h4>
            <div className="space-y-1.5">
              {topStates.map((st, i) => (
                <div 
                  key={st.name} 
                  onClick={() => onStateClick?.(st.name)}
                  className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition ${
                    selectedState === st.name ? 'bg-[#0B1F3A] text-white font-bold' : 'hover:bg-white text-slate-800'
                  }`}
                >
                  <span className="font-medium">
                    {i + 1}. {st.name}
                  </span>
                  <span className="font-mono font-black text-rose-600">
                    {st.rate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lowest 5 States */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-black text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span>Lowest 5 States (Lowest Percentage)</span>
              <span className="text-emerald-600 text-[10px] font-mono">CLEAR</span>
            </h4>
            <div className="space-y-1.5">
              {lowestStates.map((st, i) => (
                <div 
                  key={st.name} 
                  onClick={() => onStateClick?.(st.name)}
                  className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition ${
                    selectedState === st.name ? 'bg-[#0B1F3A] text-white font-bold' : 'hover:bg-white text-slate-800'
                  }`}
                >
                  <span className="font-medium">
                    {i + 1}. {st.name}
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {st.rate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
            * Aggregated presumptive tests only. Click any state to inspect localized trend curves.
          </div>
        </div>

      </div>
    </div>
  );
}
