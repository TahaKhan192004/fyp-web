'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation"

import ProductCard from '../../components/card/ProductCard';
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  ShoppingCart,
  MessageCircle,
  Flag,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { getOrCreateConversation } from '@/app/lib/chatService';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { supabase } from '@/app/lib/supabaseClient';

/* 🔹 Phone Schema */
interface Phone {
  id: string;
  uuid: string;
  user_id: string;
  model: string;
  company: string;
  storage?: string;
  ram?: string;
  price: number;
  pictures?: string[];
  description?: string;
  verified?: boolean;
  condition_score?: number;
  status?: string;
  damage_report_pdf?: string;
  pta_status?: 'approved' | 'non-approved';
  sensor_diagnostics_result?: unknown;
  'sensor-diagnostics-result'?: unknown;
}

interface PricePredictionResult {
  min_price: number;
  max_price: number;
}

function getSensorDiagnostics(phone: Phone): unknown[] {
  const raw = phone.sensor_diagnostics_result ?? phone['sensor-diagnostics-result'];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatPrimitive(value: unknown) {
  if (value === null) return 'null';
  if (value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return null;
}

/* 🔹 Price Prediction Modal */
function PricePredictionModal({
  phone,
  onClose,
}: {
  phone: Phone;
  onClose: () => void;
}) {
  const [screenCrack, setScreenCrack] = useState(false);
  const [panelDot, setPanelDot] = useState(false);
  const [panelLine, setPanelLine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricePredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('brand', phone.company ?? '');
      fd.append('model', phone.model ?? '');
      fd.append('ram', phone.ram ?? '');
      fd.append('storage', phone.storage ?? '');
      fd.append('condition_score', String(phone.condition_score ?? 10));
      const ptaApproved = phone.pta_status === 'approved';
      fd.append('pta_approved', ptaApproved ? 'true' : 'false');

      fd.append('screen_crack', String(screenCrack));
      fd.append('panel_dot', String(panelDot));
      fd.append('panel_line', String(panelLine));

      fd.append('is_panel_changed', 'false');
      fd.append('panel_shade', 'false');
      fd.append('camera_lens_ok', 'true');
      fd.append('fingerprint_ok', 'true');

      fd.append('ai_screen_crack', String(screenCrack));
      fd.append('ai_panel_dot', String(panelDot));
      fd.append('ai_panel_line', String(panelLine));

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Prediction failed.');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f7f435]" />
            <h2 className="text-lg font-bold">Get Suggested Price</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone info summary */}
        <div className="bg-white/5 border border-gray-800 rounded-xl px-4 py-3 space-y-1 text-sm text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-500">Model</span>
            <span className="font-medium">{phone.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Brand</span>
            <span className="font-medium">{phone.company}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Condition Score</span>
            <span className="font-medium text-[#f7f435]">{phone.condition_score ?? 'N/A'} / 20</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">PTA Approved</span>
            <span className="font-medium">
              {phone.pta_status === 'approved' ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Damage flags */}
        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">Select any visible damage:</p>
          <div className="space-y-2">
            {[
              { label: 'Screen Crack', value: screenCrack, set: setScreenCrack },
              { label: 'Panel Dot', value: panelDot, set: setPanelDot },
              { label: 'Panel Line', value: panelLine, set: setPanelLine },
            ].map(({ label, value, set }) => (
              <label
                key={label}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${
                  value
                    ? 'border-red-500/60 bg-red-500/10 text-red-300'
                    : 'border-gray-800 bg-white/5 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-sm">{label}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => set(e.target.checked)}
                  className="accent-[#f7f435] w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-[#f7f435]/10 border border-[#f7f435]/30 rounded-xl px-4 py-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Suggested Price Range</p>
            <p className="text-2xl font-bold text-[#f7f435]">
              Rs. {result.min_price?.toLocaleString()} – Rs. {result.max_price?.toLocaleString()}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-black bg-[#f7f435] hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {result ? 'Recalculate' : 'Get Suggested Price'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const phoneId = params.id as string;

  const [phones, setPhones] = useState<Phone[]>([]);
  const [phone, setPhone] = useState<Phone | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState('Loading...');
  const [sellerEmail, setSellerEmail] = useState('Loading...');
  const [showPriceModal, setShowPriceModal] = useState(false);

  /* 🔹 Fetch phones */
  useEffect(() => {
    async function fetchPhones() {
      try {
        const res = await fetch('/api/phones/list');
        const data: Phone[] = await res.json();

        setPhones(data);
        const selected = data.find((p) => p.id === phoneId);
        setPhone(selected ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (phoneId) fetchPhones();
  }, [phoneId]);

  /* 🔹 Fetch seller */
  useEffect(() => {
    async function fetchSeller() {
      if (!phone?.user_id) return;

      try {
        const res = await fetch(`/api/users/${phone.user_id}`);
        const data = await res.json();
        setSellerName(data.full_name || 'Unknown Seller');
        setSellerEmail(data.email || 'No Email');
      } catch (err) {
        console.error(err);
        setSellerName('Unknown Seller');
        setSellerEmail('No Email');
      }
    }

    fetchSeller();
  }, [phone]);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const router = useRouter();

  async function handleContact(receiverId: string) {
    const currentUserId = user?.id;
    if (!currentUserId) return;
    if (currentUserId === receiverId) return;

    const { data: rows } = await supabase
      .from("conversation")
      .select("id")
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${currentUserId})`
      )
      .limit(1);

    let conversationId = rows?.[0]?.id ?? null;

    if (!conversationId) {
      const { data: newConvo, error } = await supabase
        .from("conversation")
        .insert({ user1_id: currentUserId, user2_id: receiverId })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
      conversationId = newConvo.id;
    }

    router.push(`/chats?conversation=${conversationId}`);
  }

  /* 🔹 Add to Cart */
  function addToCart() {
    if (!phone) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cart.find((item: any) => item.id === phone.id)) {
      alert('Already in cart');
      return;
    }

    cart.push({
      id: phone.id,
      model: phone.model,
      price: phone.price,
      image: images[0],
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('saved');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#f7f435] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Phone not found
      </div>
    );
  }

  const images =
    phone.pictures?.length
      ? phone.pictures
      : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const similarPhones = phones
    .filter(
      (p) =>
        p.company === phone.company &&
        p.id !== phone.id &&
        p.status === 'active'
    )
    .slice(0, 4);

  const sensorDiagnostics = getSensorDiagnostics(phone);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Price Prediction Modal */}
        {showPriceModal && (
          <PricePredictionModal
            phone={phone}
            onClose={() => setShowPriceModal(false)}
          />
        )}

        {/* Back */}
        <Link
          href="/marketplace"
          className="flex items-center gap-2 text-gray-400 hover:text-[#f7f435] mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">

          {/* 🔹 IMAGE CAROUSEL */}
          <div>
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden">

              {phone.verified && (
                <div className="absolute top-4 left-4 bg-[#f7f435] text-black px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold z-10">
                  <CheckCircle className="w-4 h-4" />
                  AI Verified
                </div>
              )}

              <img
                src={images[currentImageIndex]}
                alt={phone.model}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border ${
                      i === currentImageIndex ? 'border-[#f7f435]' : 'border-gray-700'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{phone.model}</h1>

            <div className="flex gap-4 text-sm text-gray-400">
              <span>RAM: {phone.ram} GB</span>
              <span>Storage: {phone.storage} GB</span>
              <span>{phone.company}</span>
            </div>

            <div className="flex items-end gap-4 flex-wrap">
              <div className="text-4xl font-bold text-[#f7f435]">
                Rs. {phone.price.toLocaleString()}
              </div>
              <button
                onClick={() => setShowPriceModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f7f435]/40 bg-[#f7f435]/10 hover:bg-[#f7f435]/20 text-[#f7f435] text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get Suggested Price
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              Pakistan
            </div>

            {phone.description && (
              <div className="glass-panel p-4 rounded-xl">
                {phone.description}
              </div>
            )}

            {/* Sensor Diagnostics */}
            <div className="glass-panel p-4 rounded-xl space-y-3">
              <div className="flex items-end justify-between gap-3">
                <h3 className="font-semibold">Sensor Diagnostics</h3>
                <span className="text-xs text-gray-400">
                  {sensorDiagnostics.length > 0 ? `${sensorDiagnostics.length} result(s)` : 'Not provided'}
                </span>
              </div>

              {sensorDiagnostics.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No sensor diagnostics result found for this ad (web uploads usually don&apos;t include it).
                </p>
              ) : (
                <div className="space-y-3">
                  {sensorDiagnostics.map((item, idx) => {
                    const primitive = formatPrimitive(item);
                    return (
                      <div key={idx} className="rounded-xl border border-gray-800 bg-black/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-200">Test {idx + 1}</div>
                        </div>

                        {primitive !== null ? (
                          <div className="text-sm text-gray-300 break-words">{primitive}</div>
                        ) : typeof item === 'object' && item !== null && !Array.isArray(item) ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(item as Record<string, unknown>)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([key, value]) => {
                                const v = formatPrimitive(value);
                                return (
                                  <div key={key} className="flex items-start justify-between gap-3 rounded-lg border border-gray-800 bg-black/30 px-3 py-2">
                                    <div className="text-xs text-gray-400">{key}</div>
                                    {v !== null ? (
                                      <div className="text-xs text-gray-200 text-right break-words max-w-[70%]">{v}</div>
                                    ) : (
                                      <pre className="text-xs text-gray-200 text-right whitespace-pre-wrap break-words max-w-[70%]">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <pre className="text-xs text-gray-200 whitespace-pre-wrap break-words">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seller */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-semibold mb-3">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f7f435] text-black rounded-full flex items-center justify-center font-bold shrink-0">
                  {sellerName.charAt(0)}
                </div>
                {/* ✅ Now shows both name and email */}
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-white leading-tight">{sellerName}</span>
                  <span className="text-xs text-gray-400 truncate mt-0.5">{sellerEmail}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={addToCart}
                className="px-6 py-3.5 rounded-lg text-black font-semibold"
                style={{ backgroundColor: '#f7f434' }}
              >
                Save
              </button>

              {phone.damage_report_pdf && (
                <Link
                  href={phone.damage_report_pdf}
                  target="_blank"
                  className="px-6 py-3.5 rounded-lg glass-panel border border-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View AI Report
                </Link>
              )}

              <button
                onClick={() => handleContact(phone.user_id)}
                className="px-6 py-3.5 rounded-lg glass-panel border border-yellow-500 hover:bg-yellow-500 hover:text-black transition"
              >
                <MessageCircle />
              </button>

              <Link
                href={`/report/${phone.id}`}
                className="px-6 py-3.5 rounded-lg glass-panel border border-gray-700 hover:border-red-500"
              >
                <Flag />
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Phones */}
        {similarPhones.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Similar Phones <span className="text-[#f7f435]">You May Like</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarPhones.map((p) => (
                <ProductCard key={p.id} phone={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}