'use client';

import React from 'react';
import { supabase } from '@/app/lib/supabaseClient';

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

export default function DamageDetectionTool() {
  const [images, setImages] = React.useState<ImageItem[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<DamageDetectionResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const imagesRef = React.useRef<ImageItem[]>([]);

  React.useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  React.useEffect(() => {
    return () => {
      for (const img of imagesRef.current) URL.revokeObjectURL(img.previewUrl);
    };
  }, []);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);

    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    const remaining = 2 - images.length;
    const allowed = picked.slice(0, Math.max(0, remaining));

    if (allowed.length < picked.length) {
      setError('Maximum 2 images allowed.');
    }

    const nextItems: ImageItem[] = allowed.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...nextItems]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImagesToSupabase = async () => {
    if (images.length === 0) throw new Error('Upload at least 1 image.');
    if (images.length > 2) throw new Error('Maximum 2 images allowed.');

    setUploading(true);
    try {
      const urls: string[] = [];

      for (const { file } of images) {
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

  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">AI Damage Detection</h1>
          <p className="text-gray-400 text-sm">
            Upload up to 6 images (front, back, left, right, top, bottom). The system uploads them and generates a PDF report.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-700 bg-black/30 hover:bg-black/50 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickFiles}
                disabled={uploading || analyzing || images.length >= 6}
              />
              <span className="text-sm font-semibold">Select images</span>
            </label>

            <button
              type="button"
              onClick={analyze}
              disabled={images.length === 0 || uploading || analyzing}
              className="px-4 py-2 rounded-xl font-bold bg-[#f7f435] text-black disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={img.previewUrl} className="relative rounded-xl overflow-hidden border border-gray-800">
                  <img src={img.previewUrl} alt={`Upload ${idx + 1}`} className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black px-2 py-1 rounded-lg text-xs border border-gray-700"
                    disabled={uploading || analyzing}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Result</h2>
                <div className="text-gray-300 text-sm">
                  Condition score:{' '}
                  <span className="font-semibold">
                    {typeof result.condition_score === 'number' ? result.condition_score : 'N/A'}
                  </span>
                </div>
              </div>

              {pdfUrl && isLikelyHttpUrl(pdfUrl) && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-gray-700 transition text-sm"
                >
                  Open PDF report
                </a>
              )}
            </div>

            {aiDetected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(aiDetected)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-800 bg-black/20">
                      <span className="text-sm text-gray-300">{key}</span>
                      <span className="text-sm font-semibold">
                        {typeof value === 'boolean' ? (value ? 'True' : 'False') : String(value)}
                      </span>
                    </div>
                  ))}
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
