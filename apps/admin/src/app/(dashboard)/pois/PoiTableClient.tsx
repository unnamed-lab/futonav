"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deletePoiAction } from "../../actions";
import { Search, Edit2, Trash2, Plus, AlertCircle, MapPin, Tag, Copy, Check } from "lucide-react";
import type { Poi, PoiCategoryType } from "@futonav/shared";

interface PoiTableClientProps {
  initialPois: Poi[];
}

const CATEGORY_COLORS: Record<PoiCategoryType, { bg: string; text: string; border: string }> = {
  Department: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  Hostel: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  Admin: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  Cafeteria: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Gate: { bg: "bg-slate-100/60", text: "text-slate-700", border: "border-slate-200" },
  Sports: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Medical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  Library: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  Other: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-250" },
};

export default function PoiTableClient({ initialPois }: PoiTableClientProps) {
  const [pois, setPois] = useState(initialPois);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCopy = (id: string, lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      startTransition(async () => {
        try {
          await deletePoiAction(id);
          setPois(prev => prev.filter(p => p.id !== id));
        } catch {
          alert("Failed to delete point of interest.");
        }
      });
    }
  };

  // Filter logic
  const filteredPois = pois.filter((poi) => {
    const matchesSearch = 
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (poi.description && poi.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      poi.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || poi.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Object.keys(CATEGORY_COLORS)];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header operations */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            Points of Interest Directory
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold">
            Manage geographical catalog coordinates, survey descriptions, and fuzzy tags.
          </p>
        </div>
        <Link
          href="/pois/new"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-all shadow-md shadow-teal-600/10 cursor-pointer text-center hover:shadow-teal-500/20 hover:-translate-y-0.5"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New POI</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, description, abbreviations..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 focus-ring-glow font-semibold"
          />
        </div>

        {/* Category selector pills */}
        <div className="flex flex-wrap gap-1.5 max-w-xl">
          {categories.map((cat) => {
            const hasPois = cat === "All" || pois.some(p => p.category === cat);
            if (!hasPois) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-teal-50 text-teal-600 border-teal-200/60 shadow-2xs"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/60">
        {filteredPois.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
            <h3 className="font-bold text-slate-700 text-lg">No Results Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mt-1 font-semibold">
              Try adjusting your search query or selecting a different category.
            </p>
          </div>
        ) : (
          <div className="w-full bg-white/40">
            {/* Mobile Cards List */}
            <div className="block md:hidden divide-y divide-slate-200/40">
              {filteredPois.map((poi) => {
                const colors = CATEGORY_COLORS[poi.category as PoiCategoryType] || { bg: "bg-slate-100", text: "text-slate-650", border: "border-slate-200" };
                const isCopied = copiedId === poi.id;
                return (
                  <div key={poi.id} className="p-5 space-y-4 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{poi.name}</h3>
                        {poi.description && (
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {poi.description}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold border shrink-0 tracking-wide uppercase ${colors.bg} ${colors.text} ${colors.border}`}>
                        {poi.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-200/65">
                      <div className="flex items-center gap-1.5 font-mono">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{poi.latitude.toFixed(6)}, {poi.longitude.toFixed(6)}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(poi.id, poi.latitude, poi.longitude)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy coordinates"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-teal-650 animate-scale-pulse" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {poi.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {poi.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            <Tag className="h-2.5 w-2.5 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Link
                        href={`/pois/${poi.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 transition-all text-xs font-bold cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(poi.id, poi.name)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-red-650 bg-red-50 hover:bg-red-100/50 transition-all text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200/80">
                    <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">POI Details</th>
                    <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordinates</th>
                    <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</th>
                    <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/30">
                  {filteredPois.map((poi) => {
                    const colors = CATEGORY_COLORS[poi.category as PoiCategoryType] || { bg: "bg-slate-100", text: "text-slate-650", border: "border-slate-200" };
                    const isCopied = copiedId === poi.id;
                    return (
                      <tr key={poi.id} className="hover:bg-slate-50/40 transition-colors duration-200">
                        {/* Name & Desc */}
                        <td className="px-6 py-4.5">
                          <div className="font-bold text-slate-900 text-sm leading-tight">{poi.name}</div>
                          {poi.description && (
                            <div className="text-xs text-slate-550 mt-1 max-w-sm line-clamp-2 leading-relaxed font-semibold">
                              {poi.description}
                            </div>
                          )}
                        </td>

                        {/* Category badge */}
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-bold border tracking-wide uppercase ${colors.bg} ${colors.text} ${colors.border}`}>
                            {poi.category}
                          </span>
                        </td>

                        {/* Coordinates telemetry */}
                        <td className="px-6 py-4.5">
                          <div className="inline-flex items-center gap-2 bg-slate-50/80 border border-slate-200/60 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600 shadow-3xs hover:bg-slate-100/50 transition-colors">
                            <span className="text-slate-405 font-bold">N</span>
                            <span>{poi.latitude.toFixed(6)}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-405 font-bold">E</span>
                            <span>{poi.longitude.toFixed(6)}</span>
                            <button
                              onClick={() => handleCopy(poi.id, poi.latitude, poi.longitude)}
                              className="ml-1.5 p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                              title="Copy standard coordinates"
                            >
                              {isCopied ? <Check className="h-3 w-3 text-teal-655 animate-scale-pulse" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="px-6 py-4.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {poi.tags.length > 0 ? (
                              poi.tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                                  <Tag className="h-2.5 w-2.5 text-slate-400" />
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No tags</span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link
                              href={`/pois/${poi.id}`}
                              className="p-2 rounded-xl text-slate-400 hover:text-teal-650 hover:bg-slate-50 hover:border-slate-200 border border-transparent transition-all cursor-pointer"
                              title="Edit POI properties"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(poi.id, poi.name)}
                              disabled={isPending}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-50 hover:border-slate-200 border border-transparent transition-all cursor-pointer"
                              title="Delete location"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
