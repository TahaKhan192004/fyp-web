import React from 'react';
import Link from 'next/link';

export default function ProductCard({ phone }: { phone: any }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
      <div className="relative aspect-square bg-gray-900">
        <img 
          src={phone.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'} 
          alt={phone.model}
          className="w-full h-full object-cover"
        />
        {phone.verified && (
          <div className="absolute top-3 right-3 bg-[#f7f435] text-black px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <span className="text-xs">✓</span>
            Verified
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{phone.model}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#f7f435] text-2xl font-bold">Rs. {phone.price?.toLocaleString()}</span>
          {phone.condition_score && (
            <span className="text-sm text-gray-400">
              Score: {phone.condition_score}/20
            </span>
          )}
        </div>
        
        <div className="flex gap-2 text-xs text-gray-400 mb-4">
          {phone.storage && <span className="bg-gray-800 px-2 py-1 rounded">{phone.storage}</span>}
          {phone.battery_health && <span className="bg-gray-800 px-2 py-1 rounded">{phone.battery_health}% Battery</span>}
        </div>
        
        <Link 
          href={'/product?id=' + phone.id}
          className="block w-full text-center py-2 rounded-lg yellow-btn"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}