import React from 'react';
import Link from 'next/link';
import {
  Scan,
  Zap,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Award,
  Upload,
  ClipboardList,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-[#f7f435]">IntelliFone</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Revolutionizing the used phone marketplace with AI-powered verification,
            fair pricing, and smart recommendations.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-panel rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-400 leading-relaxed mb-4">
            At IntelliFone, we believe buying and selling used phones should be transparent,
            trustworthy, and hassle-free. Traditional marketplaces lack proper verification,
            leading to disputes and dissatisfaction.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed">
            We leverage cutting-edge AI technology to analyze every device, detect damage,
            verify sensor functionality, and provide accurate pricing—giving both buyers
            and sellers complete confidence in every transaction.
          </p>
        </div>
      </section>

      {/* Why Different */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why IntelliFone is Different</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Scan className="w-6 h-6 text-[#f7f435]" />,
              title: 'AI Damage Detection',
              desc: 'Advanced computer vision analyzes every millimeter of your device to detect scratches, cracks, and hidden damage invisible to the naked eye.',
            },
            {
              icon: <Zap className="w-6 h-6 text-[#f7f435]" />,
              title: 'Sensor Diagnostics',
              desc: 'Comprehensive testing of all sensors including camera, microphone, GPS, gyroscope, and more—ensuring full functionality before purchase.',
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-[#f7f435]" />,
              title: 'Fair Price Prediction',
              desc: 'Machine learning models analyze market data, condition scores, and sensor health to provide accurate, fair pricing for every device.',
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-[#f7f435]" />,
              title: 'Trust & Safety',
              desc: 'Every listing is verified by AI before going live. Buyers can trust the condition scores and sellers get fair evaluations.',
            },
            {
              icon: <Sparkles className="w-6 h-6 text-[#f7f435]" />,
              title: 'Smart Recommendations',
              desc: 'AI-powered recommendations help buyers find the perfect phone based on their budget, priorities, and usage patterns.',
            },
            {
              icon: <Award className="w-6 h-6 text-[#f7f435]" />,
              title: 'Quality Guarantee',
              desc: 'All verified devices come with detailed reports. Know exactly what you are getting—no surprises, no hidden issues.',
            },
          ].map(({ icon, title, desc }, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-8">
              <div className="w-14 h-14 rounded-full bg-[#f7f435]/10 border border-[#f7f435]/20 flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>

        <div className="space-y-8">
          {[
            {
              title: 'Transparency',
              body: 'Every device gets a complete condition report. No hidden details, no misleading descriptions—just honest, AI-verified information.',
            },
            {
              title: 'Innovation',
              body: 'We continuously improve our AI models to provide better verification, more accurate pricing, and smarter recommendations.',
            },
            {
              title: 'Customer First',
              body: 'Your satisfaction is our priority. We build tools that make buying and selling phones easier, safer, and more reliable for everyone.',
            },
          ].map(({ title, body }, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-3">{title}</h3>
              <p className="text-gray-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-gray-400 mb-14">
          From listing to sale in three simple steps
        </p>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%-1px)] right-[calc(16.66%-1px)] h-px border-t border-dashed border-[#f7f435]/30 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                step: '01',
                icon: <Upload className="w-7 h-7 text-[#f7f435]" />,
                title: 'List Your Phone',
                desc: 'Upload photos and basic details. Our AI instantly starts analyzing your device for damage and condition.',
              },
              {
                step: '02',
                icon: <ClipboardList className="w-7 h-7 text-[#f7f435]" />,
                title: 'Get Your AI Report',
                desc: 'Receive a full diagnostic — damage score, sensor health, and a fair market price suggested by our model.',
              },
              {
                step: '03',
                icon: <BadgeCheck className="w-7 h-7 text-[#f7f435]" />,
                title: 'Sell with Confidence',
                desc: 'Your verified listing goes live. Buyers see the full report, building instant trust and speeding up your sale.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="glass-panel rounded-2xl p-8 border border-gray-800 flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#f7f435]/10 border border-[#f7f435]/30 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#f7f435] text-black text-xs font-bold flex items-center justify-center">
                    {step.replace('0', '')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buyer flow note */}
        <div className="mt-10 glass-panel rounded-2xl p-6 border border-[#f7f435]/20 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#f7f435]/10 border border-[#f7f435]/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#f7f435]" />
          </div>
          <p className="text-gray-300 text-sm text-center sm:text-left">
            <span className="text-white font-semibold">Buying?</span> Browse verified listings, filter by condition score, and read the full AI report before you commit — no guesswork, no surprises.
          </p>
          <Link
            href="/marketplace"
            className="ml-auto shrink-0 flex items-center gap-2 px-5 py-2 rounded-xl border border-[#f7f435]/40 text-[#f7f435] text-sm hover:bg-[#f7f435]/10 transition-colors"
          >
            Browse <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-panel rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#f7f435]/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Experience the Difference?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Join the smarter way to buy and sell used phones — powered by AI
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/marketplace"
                className="px-8 py-4 rounded-xl yellow-btn text-black font-semibold text-lg"
                style={{ backgroundColor: '#f7f434' }}
              >
                Browse Marketplace
              </Link>
              <Link
                href="/add"
                className="px-8 py-4 rounded-xl glass-panel border border-[#f7f435] hover:bg-[#f7f435] hover:text-black transition-all text-lg"
              >
                Sell Your Phone
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}