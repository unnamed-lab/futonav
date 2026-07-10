"use client";

import { useState, useMemo } from "react";
import { MapPin, Info, Tag, Search, Compass } from "lucide-react";
import type { Poi, PoiCategoryType } from "@futonav/shared";
import Link from "next/link";

interface TelemetryMapProps {
  pois: Poi[];
}

const CATEGORY_COLORS: Record<PoiCategoryType, string> = {
  Department: "#0284c7", // sky-600
  Hostel: "#0d9488",     // teal-600
  Admin: "#4f46e5",      // indigo-600
  Cafeteria: "#d97706",  // amber-600
  Gate: "#475569",       // slate-600
  Sports: "#059669",     // emerald-600
  Medical: "#e11d48",    // rose-600
  Library: "#7c3aed",    // violet-600
  Other: "#4b5563",      // gray-600
};

export default function TelemetryMap({ pois }: TelemetryMapProps) {
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<Poi | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate coordinates bounds
  const bounds = useMemo(() => {
    if (pois.length === 0) {
      return { minLat: 5.37, maxLat: 5.41, minLng: 6.98, maxLng: 7.02, latRange: 0.04, lngRange: 0.04 };
    }
    const lats = pois.map(p => p.latitude);
    const lngs = pois.map(p => p.longitude);
    const minLat = Math.min(...lats) - 0.002;
    const maxLat = Math.max(...lats) + 0.002;
    const minLng = Math.min(...lngs) - 0.002;
    const maxLng = Math.max(...lngs) + 0.002;
    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
      latRange: maxLat - minLat || 0.01,
      lngRange: maxLng - minLng || 0.01,
    };
  }, [pois]);

  // Project lat/lng to SVG percentage coordinates
  const nodes = useMemo(() => {
    return pois.map(poi => {
      // Map to 8% to 92% of the SVG space to leave a nice margin
      const x = 8 + 84 * ((poi.longitude - bounds.minLng) / bounds.lngRange);
      const y = 92 - 84 * ((poi.latitude - bounds.minLat) / bounds.latRange);
      return {
        poi,
        x,
        y,
        color: CATEGORY_COLORS[poi.category as PoiCategoryType] || "#4b5563",
      };
    });
  }, [pois, bounds]);

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    const query = searchQuery.toLowerCase();
    return nodes.filter(n => 
      n.poi.name.toLowerCase().includes(query) ||
      n.poi.category.toLowerCase().includes(query) ||
      (n.poi.description && n.poi.description.toLowerCase().includes(query)) ||
      n.poi.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [nodes, searchQuery]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden grid lg:grid-cols-3 border border-slate-200/80">
      {/* Map visualization area */}
      <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-slate-200/60 flex flex-col relative min-h-[400px]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between mb-4 z-10">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-teal-600 animate-spin-slow" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">POI Telemetry Grid</h3>
          </div>
          {/* Legend indicator */}
          <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-lg font-mono font-semibold">
            Scale Range: {bounds.minLat.toFixed(4)}N to {bounds.maxLat.toFixed(4)}N
          </span>
        </div>

        {/* Search inside map */}
        <div className="relative mb-4 z-10 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search map nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-semibold"
          />
        </div>

        {/* SVG Grid Map */}
        <div className="flex-1 relative bg-slate-100/30 rounded-xl border border-slate-200/60 overflow-hidden flex items-center justify-center min-h-[300px]">
          {/* Radial grid line background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px), linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                 backgroundSize: '24px 24px, 48px 48px, 48px 48px',
                 backgroundPosition: 'center'
               }} 
          />

          <svg className="w-full h-full min-h-[300px] z-10 absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid coordinates indicators */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.25" strokeDasharray="1 1" />
            
            {/* Connection lines to hovered or selected nodes */}
            {(hoveredPoi || selectedPoi) && (
              (() => {
                const target = hoveredPoi || selectedPoi;
                const node = nodes.find(n => n.poi.id === target?.id);
                if (!node) return null;
                return (
                  <>
                    <line x1="0" y1={node.y} x2="100" y2={node.y} stroke={node.color} strokeWidth="0.15" strokeDasharray="1 2" className="opacity-40" />
                    <line x1={node.x} y1="0" x2={node.x} y2="100" stroke={node.color} strokeWidth="0.15" strokeDasharray="1 2" className="opacity-40" />
                    <circle cx={node.x} cy={node.y} r="5" fill="none" stroke={node.color} strokeWidth="0.2" className="animate-ping opacity-35" />
                  </>
                );
              })()
            )}

            {/* Render Nodes */}
            {filteredNodes.map(({ poi, x, y, color }) => {
              const isSelected = selectedPoi?.id === poi.id;
              const isHovered = hoveredPoi?.id === poi.id;
              return (
                <g key={poi.id}>
                  {/* Outer glowing layer */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "2.2" : isHovered ? "1.8" : "1.2"}
                    fill={color}
                    className="opacity-40 transition-all duration-300 cursor-pointer"
                    style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                    onClick={() => setSelectedPoi(poi)}
                    onMouseEnter={() => setHoveredPoi(poi)}
                    onMouseLeave={() => setHoveredPoi(null)}
                  />
                  {/* Inner interactive core */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "1.2" : isHovered ? "1.0" : "0.7"}
                    fill="#ffffff"
                    className="transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPoi(poi)}
                    onMouseEnter={() => setHoveredPoi(poi)}
                    onMouseLeave={() => setHoveredPoi(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Fallback empty view */}
          {pois.length === 0 && (
            <div className="text-center p-6 text-slate-400 font-bold z-20 text-xs">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-slate-300" />
              <span>No GPS nodes registered to map</span>
            </div>
          )}
        </div>

        {/* Hover / Quick Preview Overlay */}
        {hoveredPoi && (
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3.5 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded" style={{ color: CATEGORY_COLORS[hoveredPoi.category as PoiCategoryType], backgroundColor: `${CATEGORY_COLORS[hoveredPoi.category as PoiCategoryType]}15` }}>
                {hoveredPoi.category}
              </span>
              <span className="font-extrabold text-sm text-slate-800">{hoveredPoi.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">
              {hoveredPoi.latitude.toFixed(5)}, {hoveredPoi.longitude.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {/* Detail inspect panel */}
      <div className="p-6 flex flex-col justify-between bg-slate-50/50">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
            <Info className="h-4 w-4 text-teal-600" />
            <span>Telemetry Inspector</span>
          </h3>

          {selectedPoi ? (
            <div className="space-y-5 animate-fadeIn">
              {/* Category & Title */}
              <div>
                <span className="inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold border" 
                      style={{ 
                        color: CATEGORY_COLORS[selectedPoi.category as PoiCategoryType], 
                        borderColor: `${CATEGORY_COLORS[selectedPoi.category as PoiCategoryType]}20`,
                        backgroundColor: `${CATEGORY_COLORS[selectedPoi.category as PoiCategoryType]}10`
                      }}>
                  {selectedPoi.category}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2 leading-tight">{selectedPoi.name}</h4>
              </div>

              {/* Coordinates box */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-2 font-mono text-xs shadow-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Latitude</span>
                  <span className="font-semibold text-slate-700">{selectedPoi.latitude.toFixed(6)}° N</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-100 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Longitude</span>
                  <span className="font-semibold text-slate-700">{selectedPoi.longitude.toFixed(6)}° E</span>
                </div>
              </div>

              {/* Description */}
              {selectedPoi.description && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                    {selectedPoi.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedPoi.tags && selectedPoi.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Search Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedPoi.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        <Tag className="h-2.5 w-2.5 text-slate-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 rounded-xl bg-white/40">
              <MapPin className="h-8 w-8 text-slate-400 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-slate-400 leading-relaxed">Select a coordinates node on the grid to inspect surveyed details.</p>
            </div>
          )}
        </div>

        {selectedPoi && (
          <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between">
            <Link
              href={`/pois/${selectedPoi.id}`}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1.5"
            >
              <span>Edit Coordinates</span>
              <span>→</span>
            </Link>
            <button
              onClick={() => setSelectedPoi(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-500 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
