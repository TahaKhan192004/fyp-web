import React from "react";
import Link from "next/link";
import { Activity, CheckCircle } from "lucide-react";

interface Phone {
  id: string;
  uuid:string;
  name?: string;
  model: string;
  company?: string;
  ram?: string;
  storage?: string | number;
  pictures?: string[];
  condition_score?: number;
  description?: string;
  pta_status?: 'approved' | 'non-approved';
  price?: number;
  sensor_diagnostics_result?: unknown;
  'sensor-diagnostics-result'?: unknown;
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

export default function ProductCard({ phone }: { phone: Phone }) {
  const diagnostics = getSensorDiagnostics(phone);
  const sensorsTested = diagnostics.length > 0;

  return (
    <div className="glass-panel overflow-hidden rounded-xl border border-white/10 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#f7f435]/35 hover:shadow-xl hover:shadow-black/20">
      <div className="relative aspect-[4/3] bg-gray-900">
        <img
          src={phone.pictures?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"}
          alt={phone.model}
          className="w-full h-full object-cover"
        />
        {phone.pta_status && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#f7f435] px-2 py-1 text-[11px] font-semibold text-black">
            <CheckCircle className="w-3 h-3" /> Verified
          </div>
        )}

        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold backdrop-blur ${
            sensorsTested
              ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/25"
              : "bg-gray-900/50 text-gray-200 border-gray-700/60"
          }`}
          title={sensorsTested ? "Sensor diagnostics available" : "Sensor diagnostics not provided"}
        >
          <Activity className="w-3 h-3" />
          {sensorsTested ? `${diagnostics.length} sensors` : "Untested"}
        </div>
      </div>

      <div className="p-3">
        <h3 className="mb-1 truncate font-display text-base font-bold" title={phone.name || phone.model}>
          {phone.name || phone.model}
        </h3>
        {(phone.company || phone.name) && (
          <p className="mb-2 truncate text-xs text-gray-500">
            {[phone.company, phone.name ? phone.model : null].filter(Boolean).join(' • ')}
          </p>
        )}
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-metric text-xl font-bold text-[#f7f435]">
            Rs. {phone.price?.toLocaleString()}
          </span>
          {phone.condition_score && (
            <span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs text-gray-400">
              {phone.condition_score}/20
            </span>
          )}
        </div>

        <div className="mb-3 flex gap-2 text-xs text-gray-400">
          {phone.storage && <span className="rounded bg-gray-800 px-2 py-1">{phone.storage} GBs</span>}
          {phone.ram && (
            <span className="rounded bg-gray-800 px-2 py-1">{phone.ram} GBs</span>
          )}
        </div>

          <Link
            href={`/phones/${phone.id}`}
            className="block w-full rounded-lg py-2 text-center text-sm font-semibold text-black transition hover:bg-yellow-500"
            style={{backgroundColor: "#f7f434"}}
          >
            View Details
          </Link>



      </div>
    </div>
  );
}
