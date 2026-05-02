"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/card/ProductCard";
import { Slider } from "../../components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";

interface Phone {
  id: string;
  uuid: string;
  name?: string;
  model: string;
  company?: string;
  ram?: string;
  storage?: string | number;
  pictures?: string[];
  condition_score?: number;
  description?: string;
  pta_status?: "approved" | "non-approved";
  price?: number;
  sensor_diagnostics_result?: unknown;
  "sensor-diagnostics-result"?: unknown;
}

const BRANDS: { label: string; pattern: RegExp }[] = [
  { label: "Apple",    pattern: /apple|iphone/i },
  { label: "Samsung",  pattern: /samsung/i },
  { label: "Google",   pattern: /\bgoogle\b|pixel/i },
  { label: "OnePlus",  pattern: /oneplus|one\+/i },
  { label: "Xiaomi",   pattern: /xiaomi|redmi|poco/i },
  { label: "Oppo",     pattern: /\boppo\b/i },
  { label: "Vivo",     pattern: /\bvivo\b/i },
  { label: "Realme",   pattern: /realme/i },
  { label: "Huawei",   pattern: /huawei|honor/i },
  { label: "Nokia",    pattern: /\bnokia\b/i },
  { label: "Motorola", pattern: /motorola|moto\b/i },
  { label: "Sony",     pattern: /\bsony\b|xperia/i },
  { label: "Nothing",  pattern: /\bnothing\b/i },
  { label: "Infinix",  pattern: /infinix/i },
  { label: "Tecno",    pattern: /\btecno\b/i },
];

const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

function normalizeStorage(raw?: string | number): string {
  if (raw === null || raw === undefined || raw === "") return "";
  const str = String(raw);
  const num = str.replace(/[^0-9]/g, "");
  if (!num) return "";
  const gb = parseInt(num, 10);
  if (gb >= 1000) return "1TB";
  return `${gb}GB`;
}

const DEFAULT_FILTERS = {
  brand: "all",
  storage: "all",
  priceMin: 0,
  priceMax: 500000,
};

type MarketplaceFilters = typeof DEFAULT_FILTERS;

interface FilterPanelProps {
  filters: MarketplaceFilters;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  setFilters: React.Dispatch<React.SetStateAction<MarketplaceFilters>>;
}

function FilterPanel({
  filters,
  hasActiveFilters,
  resetFilters,
  setFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#f7f435]" />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-[#f7f435] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Brand</label>
        <div className="space-y-1">
          <button
            onClick={() => setFilters({ ...filters, brand: "all" })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.brand === "all"
                ? "bg-[#f7f435] text-black font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            All Brands
          </button>
          {BRANDS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setFilters({ ...filters, brand: label })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.brand === label
                  ? "bg-[#f7f435] text-black font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Storage</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFilters({ ...filters, storage: "all" })}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.storage === "all"
                ? "bg-[#f7f435] text-black font-semibold"
                : "glass-panel border border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            All
          </button>
          {STORAGE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilters({ ...filters, storage: s })}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.storage === s
                  ? "bg-[#f7f435] text-black font-semibold"
                  : "glass-panel border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
        <div className="text-xs text-[#f7f435] mb-4">
          Rs. {filters.priceMin.toLocaleString()} - Rs. {filters.priceMax.toLocaleString()}
        </div>
        <Slider
          min={0}
          max={500000}
          step={10000}
          value={[filters.priceMin, filters.priceMax]}
          onValueChange={([min, max]) =>
            setFilters({ ...filters, priceMin: min, priceMax: max })
          }
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Rs. 0</span>
          <span>Rs. 5,00,000</span>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const itemsPerPage = 1000;

  const { data: allPhones = [], isLoading } = useQuery<Phone[]>({
    queryKey: ["marketplace-phones"],
    queryFn: async () => {
      const res = await fetch("/api/phones/list");
      return res.json();
    },
  });

  const filteredPhones = allPhones.filter((phone) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      phone.model?.toLowerCase().includes(search) ||
      phone.company?.toLowerCase().includes(search);

    const matchesBrand = (() => {
      if (filters.brand === "all") return true;
      const brand = BRANDS.find((b) => b.label === filters.brand);
      if (!brand) return false;
      const haystack = `${phone.company ?? ""} ${phone.model ?? ""}`;
      return brand.pattern.test(haystack);
    })();

    const matchesStorage =
      filters.storage === "all" ||
      normalizeStorage(phone.storage) === filters.storage;

    const matchesPrice =
      (phone.price ?? 0) >= filters.priceMin &&
      (phone.price ?? 0) <= filters.priceMax;

    return matchesSearch && matchesBrand && matchesStorage && matchesPrice;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const totalPages = Math.ceil(filteredPhones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPhones = filteredPhones.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters =
    filters.brand !== "all" ||
    filters.storage !== "all" ||
    filters.priceMin !== 0 ||
    filters.priceMax !== 500000;

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold">Marketplace</h1>
          {/* Mobile filter button */}
          <button
            className="lg:hidden flex items-center gap-2 px-4 py-2 glass-panel border border-gray-700 rounded-xl text-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#f7f435]" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#f7f435]" />
            )}
          </button>
        </div>

        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="glass-panel rounded-2xl border border-gray-800 p-6 sticky top-8">
              <FilterPanel
                filters={filters}
                hasActiveFilters={hasActiveFilters}
                resetFilters={resetFilters}
                setFilters={setFilters}
              />
            </div>
          </aside>

          {/* Mobile Drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative w-72 h-full bg-[#0d0d0d] border-r border-gray-800 p-6 overflow-y-auto">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <FilterPanel
                  filters={filters}
                  hasActiveFilters={hasActiveFilters}
                  resetFilters={resetFilters}
                  setFilters={setFilters}
                />
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Result count + search */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-sm text-gray-400 shrink-0">
                {filteredPhones.length} phone{filteredPhones.length !== 1 ? "s" : ""} found
              </p>
              <input
                type="text"
                placeholder="Search model or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xs bg-black border border-gray-800 rounded-xl px-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#f7f435]/50"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-[#f7f435] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : paginatedPhones.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-8">
                {paginatedPhones.map((phone) => (
                  <ProductCard key={phone.id} phone={phone} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">No phones found matching your criteria</p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-sm text-[#f7f435] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "yellow-btn"
                        : "glass-panel hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
