'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Upload, Trash2, CheckCircle2, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SignaturePadProps {
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  readOnly?: boolean;
}

export default function SignaturePad({
  initialSignature,
  onSave,
  onClear,
  readOnly = false,
}: SignaturePadProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | null>(initialSignature || null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialSignature) {
      setCurrentSignature(initialSignature);
    }
  }, [initialSignature]);

  // Canvas setup
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0B1F3A'; // Navy Blue stroke
    ctx.lineWidth = 2.5;

    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    if (mode === 'draw' && !readOnly) {
      initCanvas();
    }
  }, [mode, initCanvas, readOnly]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setSavedSuccess(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    e.preventDefault(); // Prevent scrolling while signing
    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }
    setHasDrawn(false);
    setSavedSuccess(false);
    if (!currentSignature) {
      onClear?.();
    }
  };

  const handleConfirmDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setCurrentSignature(dataUrl);
    setSavedSuccess(true);
    onSave(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (.png, .jpg, .jpeg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCurrentSignature(result);
      setSavedSuccess(true);
      onSave(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setCurrentSignature(null);
    setHasDrawn(false);
    setSavedSuccess(false);
    onClear?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (mode === 'draw') {
      setTimeout(initCanvas, 50);
    }
  };

  if (readOnly) {
    return (
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col items-center justify-center min-h-[140px]">
        {currentSignature ? (
          <div className="space-y-1 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSignature}
              alt="Operator Signature"
              className="max-h-24 max-w-full object-contain mx-auto border-b border-slate-300 pb-1"
            />
            <p className="text-xs text-slate-500 font-mono tracking-wider">{t.operatorSignature}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">{t.noSignatureProvided}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-sm font-semibold text-[#0B1F3A] flex items-center gap-2">
          <Pen className="w-4 h-4 text-[#FF9933]" />
          {t.operatorSignature}
        </span>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => { setMode('draw'); setSavedSuccess(false); }}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
              mode === 'draw' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            {t.drawSignature}
          </button>
          <button
            type="button"
            onClick={() => { setMode('upload'); setSavedSuccess(false); }}
            className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
              mode === 'upload' ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {t.uploadSignature}
          </button>
        </div>
      </div>

      {/* Active Signature View or Drawing Pad */}
      {currentSignature && !isDrawing && savedSuccess ? (
        <div className="p-3 bg-slate-50 rounded-lg border border-emerald-200 space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t.signaturePreview} (Attached)
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSignature}
            alt="Current Signature"
            className="max-h-24 max-w-[280px] object-contain mx-auto bg-white p-2 rounded border border-slate-200 shadow-xs"
          />
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setSavedSuccess(false);
                if (mode === 'draw') {
                  setTimeout(initCanvas, 50);
                }
              }}
              className="text-xs px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-md transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              {t.replaceSignature}
            </button>
            <button
              type="button"
              onClick={handleRemoveSignature}
              className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-md transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              {t.removeSignature}
            </button>
          </div>
        </div>
      ) : mode === 'draw' ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 italic">{t.signatureCanvasPrompt}</p>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 cursor-crosshair block"
            />
            {!hasDrawn && !currentSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-mono">
                [ SIGN HERE / यहाँ हस्ताक्षर करें ]
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasDrawn}
              className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition disabled:opacity-40"
            >
              {t.clearSignature}
            </button>
            <button
              type="button"
              onClick={handleConfirmDraw}
              disabled={!hasDrawn}
              className="text-xs px-4 py-1.5 bg-[#FF9933] hover:bg-[#e68a2e] text-[#0B1F3A] font-semibold rounded-md shadow-xs transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.saveSignature}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#FF9933] rounded-lg p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-amber-50/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-700">
                {t.uploadSignature}
              </p>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, or WEBP (Clear scanned image recommended)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
