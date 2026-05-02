'use client';

import React from 'react';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabaseClient';
import { AlertTriangle, Camera, CheckCircle2, FileText, Gauge, XCircle } from 'lucide-react';

type DamageDetectionResponse = {
  pdf_url?: string;
  condition_score?: number;
  ai_detected?: Record<string, unknown>;
  error?: string;
};

type ImageItem = {
  file: File;
  previewUrl: string;
};

function isLikelyHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, '-');
}

const DAMAGE_LABELS: Record<string, string> = {
  panel_dot: 'Panel Dot',
  panel_line: 'Panel Line',
  screen_crack: 'Screen Crack',
};

const DAMAGE_DESCRIPTIONS: Record<string, string> = {
  panel_dot: 'Small bright or dark spots visible on the display panel.',
  panel_line: 'Vertical or horizontal display lines visible on the screen.',
  screen_crack: 'Visible crack or fracture on the front glass.',
};

const SCORE_TOTAL = 20;

function formatDamageLabel(key: string) {
  return DAMAGE_LABELS[key] ?? key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/\.?0+$/, '');
}

function scoreTone(score?: number) {
  if (typeof score !== 'number') return 'text-gray-300';
  if (score >= 16) return 'text-emerald-300';
  if (score >= 11) return 'text-[#f7f435]';
  return 'text-red-300';
}

export default function DamageDetectionTool() {
  const [frontImage, setFrontImage] = React.useState<ImageItem | null>(null);
  const [backImage, setBackImage] = React.useState<ImageItem | null>(null);
  const frontInputRef = React.useRef<HTMLInputElement>(null);
  const backInputRef = React.useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<DamageDetectionResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Revoke object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (frontImage) URL.revokeObjectURL(frontImage.previewUrl);
      if (backImage) URL.revokeObjectURL(backImage.previewUrl);
    };
  }, [frontImage, backImage]);

  const handleImageChange = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (side === 'front') {
      if (frontImage) URL.revokeObjectURL(frontImage.previewUrl);
      setFrontImage({ file, previewUrl });
    } else {
      if (backImage) URL.revokeObjectURL(backImage.previewUrl);
      setBackImage({ file, previewUrl });
    }
    e.target.value = '';
  };

  const removeImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      if (frontImage) URL.revokeObjectURL(frontImage.previewUrl);
      setFrontImage(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      if (backImage) URL.revokeObjectURL(backImage.previewUrl);
      setBackImage(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const uploadImagesToSupabase = async () => {
    const imagesToUpload = [frontImage, backImage].filter(Boolean) as ImageItem[];
    if (imagesToUpload.length === 0) throw new Error('Upload at least 1 image.');

    setUploading(true);
    try {
      const urls: string[] = [];

      for (const { file } of imagesToUpload) {
        const rand =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(16).slice(2);
        const path = `damage-detection/${Date.now()}-${rand}-${safeFileName(file.name)}`;

        const { error: uploadError } = await supabase.storage
          .from('phone-images')
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          throw new Error(uploadError.message || 'Image upload failed.');
        }

        const { data } = supabase.storage.from('phone-images').getPublicUrl(path);
        if (!data?.publicUrl) throw new Error('Failed to get public URL for uploaded image.');
        urls.push(data.publicUrl);
      }

      return urls;
    } finally {
      setUploading(false);
    }
  };

  const analyze = async () => {
    setError(null);
    setResult(null);

    setAnalyzing(true);
    try {
      const image_urls = await uploadImagesToSupabase();

      const res = await fetch('/api/damage-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_urls }),
      });

      const data = (await res.json()) as DamageDetectionResponse;
      if (!res.ok) {
        throw new Error('Server is busy, please try again later.');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze images.');
    } finally {
      setAnalyzing(false);
    }
  };

  const pdfUrl = result?.pdf_url;
  const aiDetected = result?.ai_detected && typeof result.ai_detected === 'object' ? result.ai_detected : null;
  const score = typeof result?.condition_score === 'number' ? result.condition_score : undefined;
  const detectedIssues = aiDetected
    ? Object.entries(aiDetected).filter(([, value]) => value === true).length
    : 0;
  const isDisabled = uploading || analyzing;
  const canAnalyze = (frontImage || backImage) && !isDisabled;

  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">AI Damage Detection</h1>
          <p className="text-gray-400 text-sm">
            Upload front and/or back images. The system uploads them and generates a PDF report.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">

          {/* Separate Front / Back upload slots */}
          <div className="grid grid-cols-2 gap-4">
            {(['front', 'back'] as const).map((side) => {
              const image = side === 'front' ? frontImage : backImage;
              const inputRef = side === 'front' ? frontInputRef : backInputRef;

              return (
                <div key={side} className="space-y-2">
                  <p className="text-sm font-semibold capitalize text-gray-300">{side}</p>

                  {image ? (
                    <div className="relative rounded-xl overflow-hidden aspect-square">
                      <Image
                        src={image.previewUrl}
                        alt={side}
                        fill
                        sizes="(max-width: 768px) 50vw, 400px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(side)}
                        disabled={isDisabled}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black px-2 py-1 rounded-lg text-xs border border-gray-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className={`border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition aspect-square ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Camera className="mb-2 h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-400">Click to upload</span>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(side, e)}
                        disabled={isDisabled}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={analyze}
              disabled={!canAnalyze}
              className="px-4 py-2 rounded-xl font-bold bg-[#f7f435] text-black disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f7f435]/30 bg-[#f7f435]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f7f435]">
                  <Gauge className="h-3.5 w-3.5" />
                  AI Inspection Result
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Damage analysis</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Review the condition score and detected screen or panel issues before opening the full report.
                  </p>
                </div>
              </div>

              {pdfUrl && isLikelyHttpUrl(pdfUrl) && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-gray-700 transition text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Open PDF report
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
              <div className="rounded-2xl border border-gray-800 bg-black/20 p-5">
                <p className="text-sm font-semibold text-gray-400">Condition score</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className={`text-5xl font-black leading-none ${scoreTone(score)}`}>
                    {typeof score === 'number' ? formatScore(score) : 'N/A'}
                  </span>
                  {typeof score === 'number' && (
                    <span className="pb-1 text-xl font-bold text-gray-300">/ {SCORE_TOTAL}</span>
                  )}
                </div>
                {typeof score === 'number' && (
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#f7f435]"
                      style={{ width: `${Math.max(0, Math.min(100, (score / SCORE_TOTAL) * 100))}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-800 bg-black/20 p-5">
                <p className="text-sm font-semibold text-gray-400">Detected issues</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className={detectedIssues > 0 ? 'text-5xl font-black leading-none text-red-300' : 'text-5xl font-black leading-none text-emerald-300'}>
                    {detectedIssues}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-gray-400">
                    {detectedIssues === 1 ? 'issue found' : 'issues found'}
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  {detectedIssues > 0
                    ? 'Detected items need attention before listing or pricing this phone.'
                    : 'No listed screen or panel issue was detected by the model.'}
                </p>
              </div>
            </div>

            {aiDetected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(aiDetected)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => {
                    const detected = value === true;
                    return (
                      <div key={key} className="rounded-xl border border-gray-800 bg-black/20 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {detected ? (
                                <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                              )}
                              <span className="text-sm font-semibold text-gray-100">{formatDamageLabel(key)}:</span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {DAMAGE_DESCRIPTIONS[key] ?? 'AI inspection signal returned by the damage detection model.'}
                            </p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                              detected
                                ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {detected ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            {typeof value === 'boolean' ? (detected ? 'Detected' : 'Clear') : String(value)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {pdfUrl && (
              <>
                {isLikelyHttpUrl(pdfUrl) ? (
                  <iframe
                    title="Damage report PDF"
                    src={pdfUrl}
                    className="w-full h-[75vh] rounded-xl border border-gray-800 bg-black"
                  />
                ) : (
                  <div className="text-sm text-yellow-200 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                    PDF generated on server but not publicly accessible: <span className="font-mono">{pdfUrl}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
