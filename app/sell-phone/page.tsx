'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { PHONE_BRANDS, PHONE_MODELS_BY_BRAND, type PhoneBrand } from '../lib/phoneCatalog';

const DEFAULT_CONDITIONS = {
  is_panel_changed: false,
  screen_crack: false,
  panel_dot: false,
  panel_line: false,
  panel_shade: false,
  camera_lens_ok: true,
  fingerprint_ok: true,
  pta_approved: true,
};

const CONDITION_LABELS: Record<string, string> = {
  is_panel_changed: 'Panel Changed',
  screen_crack: 'Screen Crack',
  panel_dot: 'Panel Dot',
  panel_line: 'Panel Line',
  panel_shade: 'Panel Shade',
  camera_lens_ok: 'Camera Lens OK',
  fingerprint_ok: 'Fingerprint OK',
  pta_approved: 'PTA Approved',
};

type PriceResult = {
  min_price: number;
  max_price: number;
};

type VerificationResult = {
  condition_score: number;
  ai_flags: Record<string, boolean>;
  price_range: PriceResult;
  damage_detection: unknown;
};

type FormDataState = {
  brand: '' | PhoneBrand;
  model: string;
  ram: string;
  storage: string;
};

export default function SellPhone() {
  const router = useRouter();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataState>({
    brand: '',
    model: '',
    ram: '',
    storage: '',
  });

  const [frontImage, setFrontImage] = useState<{ file: File; preview: string } | null>(null);
  const [backImage, setBackImage] = useState<{ file: File; preview: string } | null>(null);

  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedModels = formData.brand ? PHONE_MODELS_BY_BRAND[formData.brand] : [];

  /* -------------------- AUTH -------------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/signin');
    });
  }, [router]);

  /* -------------------- IMAGE HANDLERS -------------------- */
  const handleImageChange = (
    side: 'front' | 'back',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (side === 'front') setFrontImage({ file, preview });
    else setBackImage({ file, preview });
  };

  const removeImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setBackImage(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  /* -------------------- FORM VALIDATION -------------------- */
  const isFormValid = () => {
    return (
      formData.brand.trim() &&
      formData.model.trim() &&
      formData.ram.trim() &&
      formData.storage.trim() &&
      frontImage &&
      backImage
    );
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('Please fill all fields and upload both front and back images.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();

      // Phone details
      fd.append('brand', formData.brand.trim());
      fd.append('model', formData.model.trim());
      fd.append('ram', formData.ram.trim());
      fd.append('storage', formData.storage.trim());

      // Condition flags
      Object.entries(conditions).forEach(([key, value]) => {
        fd.append(key, String(value));
      });

      // Images — must match FastAPI param names: front, back
      fd.append('front', frontImage!.file, frontImage!.file.name);
      fd.append('back', backImage!.file, backImage!.file.name);

      const res = await fetch('/api/full-verification', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? 'Verification failed. Please try again.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Sell Your Phone</h1>

        {/* IMAGE UPLOAD */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 space-y-4">
          <h2 className="text-xl font-bold">Upload Images</h2>
          <p className="text-sm text-gray-400">Front and back photos are required for AI damage detection.</p>

          <div className="grid grid-cols-2 gap-4">
            {(['front', 'back'] as const).map((side) => {
              const image = side === 'front' ? frontImage : backImage;
              const inputRef = side === 'front' ? frontInputRef : backInputRef;

              return (
                <div key={side} className="space-y-2">
                  <p className="text-sm font-semibold capitalize text-gray-300">{side}</p>

                  {image ? (
                    <div className="relative rounded-xl overflow-hidden aspect-square">
                      <img
                        src={image.preview}
                        alt={side}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(side)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-full"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition aspect-square">
                      <span className="text-3xl text-gray-400 mb-2">📷</span>
                      <span className="text-sm text-gray-400">Click to upload</span>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(side, e)}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PHONE DETAILS */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 space-y-3">
          <h2 className="text-xl font-bold">Phone Details</h2>

          <select
            className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-[#f7f435]"
            value={formData.brand}
            onChange={(e) =>
              setFormData({
                ...formData,
                brand: e.target.value as FormDataState['brand'],
                model: '',
              })
            }
          >
            <option value="">Select brand</option>
            {PHONE_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          {formData.brand && (
            <select
              className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white focus:outline-none focus:border-[#f7f435]"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            >
              <option value="">Select {formData.brand} model</option>
              {selectedModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f7f435]"
              placeholder="RAM (e.g. 8GB)"
              value={formData.ram}
              onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
            />
            <input
              className="w-full bg-black border border-gray-700 p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f7f435]"
              placeholder="Storage (e.g. 128GB)"
              value={formData.storage}
              onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
            />
          </div>
        </div>

        {/* CONDITION FLAGS */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 space-y-3">
          <h2 className="text-xl font-bold">Phone Condition</h2>
          <p className="text-sm text-gray-400">
            Check anything that applies. AI will also detect damage from your images.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {Object.keys(conditions).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conditions[key as keyof typeof conditions]}
                  onChange={(e) =>
                    setConditions({ ...conditions, [key]: e.target.checked })
                  }
                  className="accent-yellow-400 w-4 h-4"
                />
                <span className="text-sm text-gray-300">
                  {CONDITION_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-black py-4 rounded-xl font-bold text-lg transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing & Predicting...
            </span>
          ) : (
            'Analyze & Get Price Estimate'
          )}
        </button>

        {/* RESULTS */}
        {result && (
          <div className="space-y-4">

            {/* Condition Score */}
            <div className="bg-gray-900 border border-gray-700 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-1">Condition Score</h3>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-yellow-400">
                  {result.condition_score}
                </div>
                <div className="text-gray-400 text-sm">/20</div>
              </div>
            </div>

            {/* AI Detected Flags */}
            {result.ai_flags && Object.keys(result.ai_flags).length > 0 && (
              <div className="bg-gray-900 border border-gray-700 p-5 rounded-xl">
                <h3 className="text-lg font-bold mb-3">AI Detected Issues</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.ai_flags).map(([key, val]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                        val
                          ? 'bg-red-900/30 border border-red-600 text-red-300'
                          : 'bg-green-900/20 border border-green-700 text-green-400'
                      }`}
                    >
                      <span>{val ? '✗' : '✓'}</span>
                      <span>{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="bg-green-900/20 border border-green-500 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-1">Estimated Price</h3>
              <p className="text-3xl font-bold text-green-400">
                {result.price_range?.min_price?.toLocaleString()} –{' '}
                {result.price_range?.max_price?.toLocaleString()} PKR
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
