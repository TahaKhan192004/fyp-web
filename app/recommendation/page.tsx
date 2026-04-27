"use client";

import React from 'react';
import { Sparkles, Battery, Camera, Gamepad2, Star, TrendingUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import ReactMarkdown from 'react-markdown';

export default function Recommendations() {
  const [maxBudget, setMaxBudget] = React.useState(150000);  // single value now
  const [selectedPriority, setSelectedPriority] = React.useState('overall');
  const [aiResponse, setAiResponse] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  const priorities = [
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'battery', label: 'Battery', icon: Battery },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'overall', label: 'Overall', icon: Star },
  ];

  const fetchAIRecommendations = async () => {
    setLoading(true);
    setAiResponse('');
    setShowResults(true);

    try {
      const params = new URLSearchParams({
        max_price: String(maxBudget),
        priority: selectedPriority,
      });

      const res = await fetch(`/api/phones/recommend?${params}`, {
        cache: 'no-store',
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setLoading(false);

      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          setAiResponse((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (error) {
      setAiResponse('Failed to get recommendations. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Find <span className="text-[#f7f435]">Best Phones</span> for You
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered phone recommendations based on your budget and priority
          </p>
        </div>

        {/* Preferences */}
        <div className="glass-panel rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#f7f435]" />
            <h2 className="text-xl font-semibold">Your Preferences</h2>
          </div>

          {/* Budget */}
          <div className="mb-8">
            <label className="block font-semibold mb-4">
              Max Budget:{' '}
              <span className="text-[#f7f435]">
                Rs. {maxBudget.toLocaleString()}
              </span>
            </label>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Slider
                min={15000}
                max={300000}
                step={5000}
                value={[maxBudget]}
                onValueChange={(val) => setMaxBudget(val[0])}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-4">
                <span>Rs. 10,000</span>
                <span>Rs. 300,000</span>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="mb-8">
            <label className="block font-semibold mb-4">
              Select Your Main Priority
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {priorities.map((priority) => {
                const Icon = priority.icon;
                const active = selectedPriority === priority.id;

                return (
                  <button
                    key={priority.id}
                    onClick={() => setSelectedPriority(priority.id)}
                    className={`p-6 rounded-xl border-2 transition-all relative ${
                      active
                        ? 'border-[#f7f435] bg-[#f7f435]/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    }`}
                  >
                    {active && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#f7f435] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    )}

                    <Icon
                      className={`w-8 h-8 mx-auto mb-3 ${
                        active ? 'text-[#f7f435]' : 'text-gray-400'
                      }`}
                    />
                    <span className="block text-sm font-semibold">
                      {priority.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={fetchAIRecommendations}
            disabled={loading}
            className="w-full py-4 rounded-xl yellow-btn text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: "#f7f434" }}
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'AI is thinking...' : 'Get AI Recommendation'}
          </button>
        </div>

        {/* AI Result */}
        {showResults && (
          <div className="glass-panel rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f7f435]" />
              AI Recommendation
            </h2>

            {loading ? (
              <p className="text-gray-400 animate-pulse">
                Analyzing phones and generating recommendation...
              </p>
            ) : (
              <div className="text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 text-gray-300">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 mb-3 text-gray-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-white mb-3 mt-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-white mb-2 mt-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-white mb-2 mt-3">{children}</h3>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-900 text-[#f7f435] px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-[#f7f435] pl-4 text-gray-400 italic my-3">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="border-gray-700 my-4" />,
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}