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
    <div className="glass-panel rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
      <div className="relative aspect-square bg-gray-900">
        <img
          src={phone.pictures?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"}
          alt={phone.model}
          className="w-full h-full object-cover"
        />
        {phone.pta_status && (
          <div className="absolute top-3 right-3 bg-[#f7f435] text-black px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <CheckCircle className="w-3 h-3" /> Verified
          </div>
        )}

        <div
          className={`absolute bottom-3 left-3 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold border ${
            sensorsTested
              ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/25"
              : "bg-gray-900/50 text-gray-200 border-gray-700/60"
          }`}
          title={sensorsTested ? "Sensor diagnostics available" : "Sensor diagnostics not provided"}
        >
          <Activity className="w-3 h-3" />
          {sensorsTested ? `Sensors tested (${diagnostics.length})` : "Sensors untested"}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-lg mb-2">{phone.model}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="font-metric text-[#f7f435] text-2xl font-bold">
            Rs. {phone.price?.toLocaleString()}
          </span>
          {phone.condition_score && (
            <span className="text-sm text-gray-400">Score: {phone.condition_score}/20</span>
          )}
        </div>

        <div className="flex gap-2 text-xs text-gray-400 mb-4">
          {phone.storage && <span className="bg-gray-800 px-2 py-1 rounded">{phone.storage} GBs</span>}
          {phone.ram && (
            <span className="bg-gray-800 px-2 py-1 rounded">{phone.ram} GBs</span>
          )}
        </div>

          <Link
            href={`/phones/${phone.id}`}
            className="block w-full text-center py-2 rounded-lg  text-black font-semibold hover:bg-yellow-500 transition"
            style={{backgroundColor: "#f7f434"}}
          >
            View Details
          </Link>



      </div>
    </div>
  );
}