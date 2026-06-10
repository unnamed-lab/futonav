"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deletePoiAction } from "../../actions";
import { Search, Edit2, Trash2, Plus, AlertCircle, MapPin, Tag } from "lucide-react";
import type { Poi, PoiCategoryType } from "@futonav/shared";

interface PoiTableClientProps {
  initialPois: Poi[];
}

const CATEGORY_COLORS: Record<PoiCategoryType, string> = {
  Department: "bg-sky-50 text-sky-700 border-sky-200",
  Hostel: "bg-teal-50 text-teal-700 border-teal-200",
  Admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Cafeteria: "bg-amber-50 text-amber-700 border-amber-200",
  Gate: "bg-slate-50 text-slate-700 border-slate-200",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medical: "bg-rose-50 text-rose-700 border-rose-200",
  Library: "bg-violet-50 text-violet-700 border-violet-200",
  Other: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function PoiTableClient({ initialPois }: PoiTableClientProps) {
  const [pois, setPois] = useState(initialPois);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      startTransition(async () => {
        try {
          await deletePoiAction(id);
          setPois(prev => prev.filter(p => p.id !== id));
        } catch (error) {
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
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Points of Interest Directory</h1>
          <p className="text-slate-500 mt-2">Manage the FUTO campus layout catalog.</p>
        </div>
        <Link
          href="/pois/new"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New POI</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, description, tags..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-900"
          />
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/10"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredPois.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 text-lg">No Results Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mt-1">
              Try adjusting your search criteria or categories filters.
            </p>
          </div>
          <div className="w-full">
            {/* Mobile Cards List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredPois.map((poi) => (
                <div key={poi.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base">{poi.name}</h3>
                      {poi.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {poi.description}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold border shrink-0 ${
                      CATEGORY_COLORS[poi.category as PoiCategoryType] || "bg-gray-100 text-gray-800"
                    }`}>
                      {poi.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>Lat: {poi.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Lng: {poi.longitude.toFixed(6)}</span>
                    </div>
                  </div>

                  {poi.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {poi.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                      href={`/pois/${poi.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(poi.id, poi.name)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">POI Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Coordinates</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPois.map((poi) => (
                    <tr key={poi.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name & Desc */}
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900">{poi.name}</div>
                        {poi.description && (
                          <div className="text-xs text-slate-400 mt-1 max-w-md line-clamp-2 leading-relaxed">
                            {poi.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold border ${
                          CATEGORY_COLORS[poi.category as PoiCategoryType] || "bg-gray-100 text-gray-800"
                        }`}>
                          {poi.category}
                        </span>
                      </td>

                      {/* Coordinates */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>Lat: {poi.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-1 pl-5">
                          <span>Lng: {poi.longitude.toFixed(6)}</span>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {poi.tags.length > 0 ? (
                            poi.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                <Tag className="h-2.5 w-2.5" />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-300 italic">No tags</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/pois/${poi.id}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Edit location"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(poi.id, poi.name)}
                            disabled={isPending}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Delete location"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
