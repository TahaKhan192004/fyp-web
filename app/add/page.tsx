'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

function extractNumber(value: string): string {
  const match = value.match(/\d+/);
  return match ? match[0] : '0';
}

export default function SellPhone() {
  const router = useRouter();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    company: '',
    ram: '',
    storage: '',
    description: '',
    price: '0',
    pta_status: 'approved',
  });

  const [frontImage, setFrontImage] = useState<{ file: File; preview: string } | null>(null);
  const [backImage, setBackImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/signin');
      else setUser(data.user);
    });
  }, []);

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

  const handleSubmit = async (e: any) => {
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
    } catch (err) {
      alert('Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sell Your Mobile Phone</h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* IMAGE UPLOAD */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold mb-1">Upload Images</h2>
            <p className="text-gray-400 text-sm mb-4">Upload front and back photos of your phone.</p>

            <div className="flex gap-4">
              {(['front', 'back'] as const).map((side) => {
                const image = side === 'front' ? frontImage : backImage;
                const inputRef = side === 'front' ? frontInputRef : backInputRef;

                return (
                  <div key={side} className="flex flex-col gap-1.5 w-36">
                    <p className="text-xs font-semibold capitalize text-gray-400 tracking-wide">{side}</p>

                    {image ? (
                      <div className="relative rounded-xl overflow-hidden w-36 h-36">
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
                      <label className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition w-36 h-36">
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
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 space-y-4">
            <h2 className="text-xl font-bold mb-3">Phone Details</h2>

            <input
              className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="Phone Name"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <input
              className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="Model (exact name, e.g. Pixel 6A)"
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />

            <input
              className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="Company (exact name, e.g. Google)"
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                placeholder="RAM (e.g. 8GB)"
                value={formData.ram}
                onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                required
              />
              <input
                className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                placeholder="Storage (e.g. 128GB)"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                required
              />
            </div>

            <input
              className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="Price (in PKR)"
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />

            <textarea
              className="w-full bg-black border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Description (condition, accessories included, reason for selling...)"
              rows={4}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div>
              <label className="text-sm text-gray-400 mb-1 block">PTA Status</label>
              <select
                className="w-full bg-black border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-yellow-400"
                onChange={(e) => setFormData({ ...formData, pta_status: e.target.value })}
              >
                <option value="approved">Approved</option>
                <option value="non-approved">Not Approved</option>
              </select>
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