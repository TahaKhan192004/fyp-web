"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '../components/card/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [phones, setPhones] = React.useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    async function loadPhones() {
      try {
        const res = await fetch('/api/phones/list');

        if (!res.ok) {
          throw new Error('Failed to fetch phones');
        }

        const data = await res.json();
        if (isMounted) {
          setPhones(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error loading phones:', err);
        if (isMounted) {
          setPhones([]);
        }
      }
    }

    loadPhones();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    window.location.href = '/marketplace?search=' + encodeURIComponent(query);
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.max(1, phones.length - 2));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Math.max(1, phones.length - 2)) % Math.max(1, phones.length - 2));
  };

  const visiblePhones = phones.slice(carouselIndex, carouselIndex + 3);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Buy & Sell Used Phones <span className="text-[#f7f435] font-accent">with Confidence</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                AI-powered verification ensures every phone is checked, graded, and guaranteed. Trade smarter with IntelliFone.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/marketplace"
                  className="px-8 py-4 rounded-xl text-lg neon-glow text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
                  style={{ backgroundColor: '#f7f434' }}
                >
                  Get Started
                </Link>
                <Link
                  href="/sell-phone"
                  className="px-8 py-4 rounded-xl glass-panel border border-[#f7f435] font-semibold text-lg"
                >
                  Evaluate Your Phone
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-4 md:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f7f435]/20 via-black to-black rounded-[2.5rem] blur-3xl"></div>
              <div className="relative w-full max-w-[380px]">
                <div className="absolute -inset-5 rounded-[3rem] bg-[#f7f435]/15 blur-2xl"></div>
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#05090f] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                  <Image
                    src="/hero-mobile-ui.png"
                    alt="IntelliFone mobile app interface preview"
                    width={1080}
                    height={2400}
                    priority
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <SearchBar onSearch={handleSearch} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl font-bold">Featured Phones</h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-3 rounded-lg yellow-btn"
              disabled={phones.length <= 3}
            >
              &larr;
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-lg yellow-btn"
              disabled={phones.length <= 3}
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visiblePhones.map((phone) => (
            <ProductCard key={phone.id} phone={phone} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/marketplace"
            className="inline-block px-8 py-3 rounded-xl yellow-btn"
          >
            View All Phones
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Why Choose <span className="font-accent">IntelliFone</span>?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 rounded-full bg-[#f7f435]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">AI</span>
            </div>
            <h3 className="text-xl font-bold mb-3">AI Damage Detection</h3>
            <p className="text-gray-400">
              Our advanced AI analyzes every inch of your phone to detect scratches, cracks, and hidden damage.
            </p>
          </div>

          <div className="rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 rounded-full bg-[#f7f435]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">Rs</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Fair Price Prediction</h3>
            <p className="text-gray-400">
              Get accurate market prices based on real-time data, condition scores, and sensor diagnostics.
            </p>
          </div>

          <div className="rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 rounded-full bg-[#f7f435]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">UX</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Recommendations</h3>
            <p className="text-gray-400">
              Find the perfect phone based on your budget, priorities, and usage patterns with AI recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#f7f435]/5"></div>
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-xl text-gray-400 mb-8">
              List your phone in minutes and get instant AI verification
            </p>
            <Link
              href="/add"
              className="inline-block px-10 py-4 rounded-xl text-black text-lg font-semibold neon-glow"
              style={{ backgroundColor: '#f7f434' }}
            >
              Sell Your Phone
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
