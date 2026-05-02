'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { PHONE_BRANDS, PHONE_MODELS_BY_BRAND, type PhoneBrand } from '../lib/phoneCatalog';

function extractNumber(value: string): string {
  const match = value.match(/\d+/);
  return match ? match[0] : '0';
}

export default function SellPhone() {
  const router = useRouter();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<{ id: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    company: '' as '' | PhoneBrand,
    ram: '',
    storage: '',
    description: '',
    price: '0',
    pta_status: 'approved',
  });

  const [frontImage, setFrontImage] = useState<{ file: File; preview: string } | null>(null);
  const [backImage, setBackImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const selectedModels = formData.company ? PHONE_MODELS_BY_BRAND[formData.company] : [];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/signin');
      else setUser({ id: data.user.id });
    });
  }, [router]);

  const handleImageChange = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (side === 'front') {
      if (frontImage) URL.revokeObjectURL(frontImage.preview);
      setFrontImage({ file, preview });
    } else {
      if (backImage) URL.revokeObjectURL(backImage.preview);
      setBackImage({ file, preview });
    }
    e.target.value = '';
  };

  const removeImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      if (frontImage) URL.revokeObjectURL(frontImage.preview);
      setFrontImage(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      if (backImage) URL.revokeObjectURL(backImage.preview);
      setBackImage(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^\w.-]/g, '');
    const fileName = `${Date.now()}-${sanitizedFileName}`;

    const { error } = await supabase.storage.from('phone-images').upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('phone-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!frontImage && !backImage) {
      alert('Upload at least 1 image.');
      return;
    }

    setUploading(true);
    try {
      const uploadedURLs: string[] = [];

      if (frontImage) uploadedURLs.push(await uploadImageToSupabase(frontImage.file));
      if (backImage) uploadedURLs.push(await uploadImageToSupabase(backImage.file));

      const payload = {
        user_id: user.id,
        formData: {
          ...formData,
          ram: extractNumber(formData.ram),
          storage: extractNumber(formData.storage),
        },
        pictureUrls: uploadedURLs,
      };

      const res = await fetch('/api/phones/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Something went wrong');
        return;
      }

      alert('Phone listed successfully!');
      router.push('/marketplace');
    } catch {
      alert('Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f7f435]">
            Create listing
          </p>
          <h1 className="text-4xl font-bold">Sell Your Mobile Phone</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
            Add a clear title, choose the exact brand and model, then set a realistic asking price.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* IMAGE UPLOAD */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/55 p-6 shadow-xl shadow-black/10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Upload Images</h2>
                <p className="mt-1 text-sm text-gray-400">Upload front and back photos of your phone.</p>
              </div>
              <span className="rounded-full border border-[#f7f435]/25 bg-[#f7f435]/10 px-3 py-1 text-xs text-[#f7f435]">
                At least 1 required
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
              {(['front', 'back'] as const).map((side) => {
                const image = side === 'front' ? frontImage : backImage;
                const inputRef = side === 'front' ? frontInputRef : backInputRef;

                return (
                  <div key={side} className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold capitalize text-gray-400 tracking-wide">{side}</p>

                    {image ? (
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                        <img
                          src={image.preview}
                          alt={side}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(side)}
                          disabled={uploading}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white text-xs px-2 py-0.5 rounded-md border border-gray-600 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-black/20 transition hover:border-[#f7f435] hover:bg-[#f7f435]/5">
                        <span className="text-2xl text-gray-400 mb-1">📷</span>
                        <span className="text-xs text-gray-400">Click to upload</span>
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(side, e)}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {uploading && (
              <div className="mt-4 text-yellow-400 flex gap-2 items-center text-sm">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/55 p-6 shadow-xl shadow-black/10">
            <h2 className="mb-5 text-xl font-bold">Listing Details</h2>

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Title</span>
                <input
                  className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white placeholder-gray-500 focus:border-[#f7f435] focus:outline-none"
                  placeholder="e.g. Pixel 6A in excellent condition with box"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-300">Company</span>
                  <select
                    className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white focus:border-[#f7f435] focus:outline-none"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: e.target.value as '' | PhoneBrand,
                        model: '',
                      })
                    }
                    required
                  >
                    <option value="">Select company</option>
                    {PHONE_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>

                {formData.company && (
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-gray-300">Model</span>
                    <select
                      className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white focus:border-[#f7f435] focus:outline-none"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    >
                      <option value="">Select {formData.company} model</option>
                      {selectedModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-300">RAM</span>
                  <input
                    className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white placeholder-gray-500 focus:border-[#f7f435] focus:outline-none"
                    placeholder="8GB"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-300">Storage</span>
                  <input
                    className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white placeholder-gray-500 focus:border-[#f7f435] focus:outline-none"
                    placeholder="128GB"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    required
                  />
                </label>

                <label className="space-y-2 lg:col-span-1">
                  <span className="text-sm font-medium text-gray-300">Price</span>
                  <div className="flex items-center rounded-xl border border-gray-700 bg-black focus-within:border-[#f7f435]">
                    <span className="border-r border-gray-800 px-3 text-sm text-gray-500">Rs.</span>
                    <input
                      className="min-w-0 flex-1 rounded-xl bg-transparent p-3 text-white placeholder-gray-500 focus:outline-none"
                      placeholder="130000"
                      inputMode="numeric"
                      value={formData.price === '0' ? '' : formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-300">PTA Status</span>
                  <select
                    className="w-full rounded-xl border border-gray-700 bg-black p-3 text-white focus:border-[#f7f435] focus:outline-none"
                    value={formData.pta_status}
                    onChange={(e) => setFormData({ ...formData, pta_status: e.target.value })}
                  >
                    <option value="approved">Approved</option>
                    <option value="non-approved">Not Approved</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Description</span>
                <textarea
                  className="w-full resize-none rounded-xl border border-gray-700 bg-black p-3 text-white placeholder-gray-500 focus:border-[#f7f435] focus:outline-none"
                  placeholder="Condition, accessories included, warranty, reason for selling..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full text-black py-3 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#f7f435' }}
          >
            {uploading ? 'Submitting...' : 'Submit Listing'}
          </button>

        </form>
      </div>
    </div>
  );
}
