import Link from "next/link";
import { getAdminPoiRepository } from "@/lib/db";
import { MapPin, Plus, Upload, Layers, Users, Building, ShieldAlert } from "lucide-react";
import type { PoiCategoryType } from "@futonav/shared";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let pois = [];
  let errorMsg = "";

  try {
    const repo = getAdminPoiRepository();
    pois = await repo.fetchAll();
  } catch (e: any) {
    console.error("Dashboard DB fetch error:", e);
    errorMsg = e.message || "Failed to connect to the database.";
  }

  // Calculate metrics
  const totalPois = pois.length;
  
  const categoryCount = pois.reduce((acc, poi) => {
    const cat = poi.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { name: "Department", count: categoryCount["Department"] || 0, color: "bg-sky-500", text: "text-sky-600" },
    { name: "Hostel", count: categoryCount["Hostel"] || 0, color: "bg-teal-500", text: "text-teal-600" },
    { name: "Admin", count: categoryCount["Admin"] || 0, color: "bg-indigo-500", text: "text-indigo-600" },
    { name: "Cafeteria", count: categoryCount["Cafeteria"] || 0, color: "bg-amber-500", text: "text-amber-600" },
    { name: "Library", count: categoryCount["Library"] || 0, color: "bg-violet-500", text: "text-violet-600" },
    { name: "Medical", count: categoryCount["Medical"] || 0, color: "bg-rose-500", text: "text-rose-600" },
    { name: "Sports", count: categoryCount["Sports"] || 0, color: "bg-emerald-500", text: "text-emerald-600" },
    { name: "Gate", count: categoryCount["Gate"] || 0, color: "bg-slate-500", text: "text-slate-600" },
    { name: "Other", count: categoryCount["Other"] || 0, color: "bg-gray-400", text: "text-gray-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Manage geographical coordinates and building details for FUTO campus.</p>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3 items-start">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Database Connection Mismatch</h3>
            <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
            <p className="text-xs text-red-500 mt-2">Make sure your Docker-compose containers are running on port 54321.</p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-teal-50 text-teal-600">
            <MapPin className="h-7 w-7" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400">Total Surveyed POIs</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{totalPois}</h2>
          </div>
        </div>

        {/* Sync Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400">Categories Configured</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{categories.filter(c => c.count > 0).length}</h2>
          </div>
        </div>

        {/* Action triggers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <Building className="h-7 w-7" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400">Active Sync Cluster</span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Local Docker Database</h2>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Category Distribution</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between h-28">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">{c.name}</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900">{c.count}</span>
                  <span className="text-xs text-slate-400 ml-1">locations</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Quick Operations</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/pois/new"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all font-semibold text-sm group"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-teal-600" />
                <span className="text-slate-800">Add New Building POI</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/pois/import"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all font-semibold text-sm group"
            >
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-teal-600" />
                <span className="text-slate-800">Bulk Import via CSV</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/pois"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all font-semibold text-sm group"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-teal-600" />
                <span className="text-slate-800">Manage Coordinates</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
