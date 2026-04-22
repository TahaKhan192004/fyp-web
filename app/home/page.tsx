"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileCheck,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  Waves,
} from 'lucide-react';
import ProductCard from '../components/card/ProductCard';
import SearchBar from '../components/SearchBar';

const capabilityCards = [
  {
    title: 'AI Damage Detection',
    description: 'Upload images, let the verification pipeline inspect them, and get damage visibility before a listing goes live.',
    icon: SearchCheck,
    href: '/damage-detection',
    accent: 'from-[#f7f435]/30 to-transparent',
  },
  {
    title: 'Condition Scoring',
    description: 'Detected issues are converted into condition signals so buyers understand quality at a glance.',
    icon: ShieldCheck,
    href: '/damage-detection',
    accent: 'from-emerald-400/20 to-transparent',
  },
  {
    title: 'Price Prediction',
    description: 'Pricing is guided by market data and AI analysis instead of rough guesswork.',
    icon: CircleDollarSign,
    href: '/recommendation',
    accent: 'from-sky-400/20 to-transparent',
  },
  {
    title: 'Smart Recommendations',
    description: 'Budget and priority based recommendations help buyers find phones that actually fit their needs.',
    icon: BrainCircuit,
    href: '/recommendation',
    accent: 'from-fuchsia-400/20 to-transparent',
  },
  {
    title: 'Buyer-Seller Chat',
    description: 'Realtime inbox flows keep negotiation and follow-up inside the marketplace.',
    icon: MessageSquareText,
    href: '/chats',
    accent: 'from-orange-400/20 to-transparent',
  },
  {
    title: 'AI Assistant',
    description: 'An assistant layer helps users explore, compare, and ask product questions conversationally.',
    icon: Bot,
    href: '/chat',
    accent: 'from-violet-400/20 to-transparent',
  },
];

const journeySteps = [
  {
    title: 'Upload your phone',
    description: 'Sellers add phone details and images through the marketplace flow.',
    icon: Upload,
  },
  {
    title: 'Verify with AI',
    description: 'Damage detection, scoring, and report generation build trust into every listing.',
    icon: FileCheck,
  },
  {
    title: 'Price it smarter',
    description: 'Prediction is informed by scraped used-market data and condition context.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Connect and close',
    description: 'Buyers browse, save, chat, and decide with more confidence.',
    icon: Waves,
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  className = '',
  delayClass = '',
}: {
  children: React.ReactNode;
  className?: string;
  delayClass?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? `scroll-reveal-visible ${delayClass}` : 'scroll-reveal'}`.trim()}
    >
      {children}
    </div>
  );
}

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
  const featuredCount = phones.length;

  return (
    <div className="min-h-screen pb-12">
      <section className="relative overflow-hidden pt-8">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(247,244,53,0.12),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative z-10">
          <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] gap-10 lg:gap-14 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 mb-6 backdrop-blur">
                <Sparkles className="w-4 h-4 text-[#f7f435]" />
                AI marketplace, verification, pricing, and chat in one flow
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[4.15rem] font-bold mb-5 leading-[0.98] max-w-[12ch]">
                Buy & Sell Used Phones <span className="text-[#f7f435] font-accent">with Confidence</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
                AI-powered verification ensures every phone is checked, graded, and guaranteed. Trade smarter with IntelliFone.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up-delay">
                <Link
                  href="/marketplace"
                  className="px-7 py-3.5 rounded-2xl text-base neon-glow text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition hover:-translate-y-0.5"
                  style={{ backgroundColor: '#f7f434' }}
                >
                  Explore Marketplace
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/add"
                  className="px-7 py-3.5 rounded-2xl glass-panel border border-[#f7f435]/60 font-semibold text-base hover:bg-white/5 transition"
                >
                  Sell Your Phone
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 animate-fade-up-delay-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                  <div className="font-metric text-2xl text-white">{featuredCount}+</div>
                  <div className="text-xs text-gray-400 uppercase tracking-[0.18em] mt-1">Live Listings</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                  <div className="font-metric text-2xl text-white">AI</div>
                  <div className="text-xs text-gray-400 uppercase tracking-[0.18em] mt-1">Verification</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                  <div className="font-metric text-2xl text-white">PDF</div>
                  <div className="text-xs text-gray-400 uppercase tracking-[0.18em] mt-1">Damage Reports</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                  <div className="font-metric text-2xl text-white">Chat</div>
                  <div className="text-xs text-gray-400 uppercase tracking-[0.18em] mt-1">Realtime Inbox</div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-3 md:p-6 animate-fade-up-delay">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f7f435]/20 via-black to-black rounded-[2.5rem] blur-3xl"></div>
              <div className="absolute left-2 top-8 h-24 w-24 rounded-full bg-[#f7f435]/12 blur-2xl"></div>
              <div className="absolute right-4 bottom-8 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl"></div>
              <div className="relative w-full max-w-[320px] animate-float-soft">
                <div className="absolute -inset-4 rounded-[2.75rem] bg-[#f7f435]/10 blur-2xl"></div>
                <div className="absolute -left-10 top-14 hidden md:flex rounded-2xl border border-white/10 bg-[#09111b]/85 px-4 py-3 backdrop-blur animate-pulse-glow">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Verification</div>
                    <div className="mt-1 font-semibold text-white">Condition, price, and report</div>
                  </div>
                </div>
                <div className="absolute -right-8 bottom-16 hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-[#09111b]/85 px-4 py-3 backdrop-blur">
                  <Bot className="w-5 h-5 text-[#f7f435]" />
                  <div>
                    <div className="text-xs text-gray-400">AI assistant</div>
                    <div className="text-sm font-semibold text-white">Recommendations on demand</div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[#05090f] shadow-[0_24px_70px_rgba(0,0,0,0.52)]">
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
        <Reveal className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3">Platform Capabilities</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Built on more than listings</h2>
          </div>
          <p className="hidden lg:block max-w-xl text-gray-400">
            IntelliFone combines marketplace flows with AI verification, price intelligence, recommendations, and two chat systems for different user journeys.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {capabilityCards.map((card) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delayClass="scroll-delay-1">
                <Link
                  href={card.href}
                  className="group relative block overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#f7f435]/40"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-70`} />
                  <div className="relative">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/35 border border-white/10">
                      <Icon className="w-5 h-5 text-[#f7f435]" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3">{card.title}</h3>
                    <p className="text-gray-300 leading-7 mb-5">{card.description}</p>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#f7f435]">
                      Explore
                      <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="flex items-center justify-between mb-8">
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
        </Reveal>

        <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visiblePhones.map((phone) => (
            <ProductCard key={phone.id} phone={phone} />
          ))}
        </Reveal>

        <Reveal className="text-center">
          <Link
            href="/marketplace"
            className="inline-block px-8 py-3 rounded-xl yellow-btn"
          >
            View All Phones
          </Link>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          <Reveal className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3">Seller Journey</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              From upload to verified listing
            </h2>
            <p className="text-gray-400 leading-7 mb-8">
              The backend is doing real work behind the scenes: image analysis, condition scoring, report generation, market-based pricing, and recommendation support.
            </p>

            <div className="space-y-4">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f435]/15 text-[#f7f435]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Step {index + 1}</div>
                      <div className="font-semibold text-white mb-1">{step.title}</div>
                      <div className="text-sm text-gray-400 leading-6">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            <Reveal delayClass="scroll-delay-1">
              <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#f7f435]/10 to-white/5 p-6">
                <Smartphone className="w-6 h-6 text-[#f7f435] mb-4" />
                <h3 className="font-display text-2xl font-bold mb-3">Marketplace + Profiles</h3>
                <p className="text-gray-300 leading-7">
                  Listings, seller profiles, saves, and product detail pages are connected to Supabase-backed marketplace data.
                </p>
              </div>
            </Reveal>

            <Reveal delayClass="scroll-delay-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-emerald-400/10 to-white/5 p-6">
                <FileCheck className="w-6 h-6 text-emerald-300 mb-4" />
                <h3 className="font-display text-2xl font-bold mb-3">Damage Reports</h3>
                <p className="text-gray-300 leading-7">
                  AI-generated PDF reports and condition outputs make listings more trustworthy and easier to compare.
                </p>
              </div>
            </Reveal>

            <Reveal delayClass="scroll-delay-1">
              <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-sky-400/10 to-white/5 p-6">
                <ChartNoAxesCombined className="w-6 h-6 text-sky-300 mb-4" />
                <h3 className="font-display text-2xl font-bold mb-3">Prediction Engine</h3>
                <p className="text-gray-300 leading-7">
                  Used-market data from OLX feeds pricing decisions, helping sellers list smarter and buyers spot fair value.
                </p>
              </div>
            </Reveal>

            <Reveal delayClass="scroll-delay-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-fuchsia-400/10 to-white/5 p-6">
                <Bot className="w-6 h-6 text-fuchsia-300 mb-4" />
                <h3 className="font-display text-2xl font-bold mb-3">Assistant + Realtime Chat</h3>
                <p className="text-gray-300 leading-7">
                  Recommendation chat and buyer-seller messaging support both product discovery and actual transaction flow.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,244,53,0.12),transparent_28%)]"></div>
          <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3">Next Step</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to start trading smarter?</h2>
              <p className="text-lg text-gray-400 max-w-2xl">
                Browse verified listings, run AI recommendation flows, or start your own seller journey with pricing and report support.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/add"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-black text-base font-semibold neon-glow hover:-translate-y-0.5 transition"
                style={{ backgroundColor: '#f7f434' }}
              >
                Sell Your Phone
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-black/20 text-white text-base font-semibold hover:bg-white/5 transition"
              >
                Ask IntelliFone AI
                <Sparkles className="w-4 h-4 text-[#f7f435]" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
