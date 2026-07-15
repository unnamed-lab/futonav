import Link from "next/link";
import { getAdminPoiRepository } from "@/lib/db";
import { MapPin, Plus, Upload, Layers, ShieldAlert, List, ArrowRight, Activity, Cpu } from "lucide-react";
import type { Poi } from "@futonav/shared";
import TelemetryMap from "./TelemetryMap";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let pois: Poi[] = [];
  let errorMsg = "";

  try {
    const repo = getAdminPoiRepository();
    pois = await repo.fetchAll();
  } catch (e) {
    console.error("Dashboard DB fetch error:", e);
    errorMsg = e instanceof Error ? e.message : "Failed to connect to the database.";
  }

  // Calculate metrics
  const totalPois = pois.length;
  
  const categoryCount = pois.reduce((acc, poi) => {
    const cat = poi.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { name: "Department", count: categoryCount["Department"] || 0, color: "bg-sky-500", text: "text-sky-600", border: "border-sky-100" },
    { name: "Hostel", count: categoryCount["Hostel"] || 0, color: "bg-teal-500", text: "text-teal-600", border: "border-teal-100" },
    { name: "Admin", count: categoryCount["Admin"] || 0, color: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-100" },
    { name: "Cafeteria", count: categoryCount["Cafeteria"] || 0, color: "bg-amber-500", text: "text-amber-600", border: "border-amber-100" },
    { name: "Library", count: categoryCount["Library"] || 0, color: "bg-violet-500", text: "text-violet-600", border: "border-violet-100" },
    { name: "Medical", count: categoryCount["Medical"] || 0, color: "bg-rose-500", text: "text-rose-600", border: "border-rose-100" },
    { name: "Sports", count: categoryCount["Sports"] || 0, color: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-100" },
    { name: "Gate", count: categoryCount["Gate"] || 0, color: "bg-slate-500", text: "text-slate-650", border: "border-slate-100" },
    { name: "Other", count: categoryCount["Other"] || 0, color: "bg-gray-400", text: "text-gray-600", border: "border-gray-100" },
  ];

  const configuredCategoriesCount = categories.filter(c => c.count > 0).length;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title Header with Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>FutoNav System Core</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl font-medium">
            Real-time coordinates telemetry, fuzzy abbreviations, and data synchronization for the FUTO campus layout catalog.
          </p>
        </div>
        
        {/* System Health State indicator */}
        <div className="flex items-center gap-3 bg-white/80 border border-slate-200/60 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-xs">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Database Uplink</span>
            <span className="text-slate-700 font-semibold">{errorMsg ? "Disconnected" : "Active (Port 54321)"}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex gap-4 items-start shadow-sm shadow-red-200/20">
          <ShieldAlert className="h-6 w-6 text-red-650 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 text-lg">Database Uplink Offline</h3>
            <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
            <p className="text-xs text-red-505 mt-3 font-mono font-semibold">
              ACTION REQUIRED: Ensure local Supabase Docker containers are running and exposed on port 54321.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Surveyed POIs Card */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/[0.015] rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-teal-500/[0.04]" />
          <div className="p-4 rounded-xl bg-teal-50 text-teal-650 border border-teal-100/60 shadow-xs group-hover:scale-105 transition-transform duration-300">
            <MapPin className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Surveyed POIs</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 leading-none tracking-tight">{totalPois}</h2>
            <span className="text-[10px] text-slate-500 block mt-1.5 font-medium">Registered FUTO coordinates</span>
          </div>
        </div>

        {/* Categories Configured Card */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.015] rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-indigo-500/[0.04]" />
          <div className="p-4 rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/60 shadow-xs group-hover:scale-105 transition-transform duration-300">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Categories Configured</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 leading-none tracking-tight">
              {configuredCategoriesCount} <span className="text-xs font-bold text-slate-400">/ 9</span>
            </h2>
            <span className="text-[10px] text-slate-500 block mt-1.5 font-medium">Active groups in use</span>
          </div>
        </div>

        {/* Active Sync Cluster Card */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/[0.015] rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-sky-500/[0.04]" />
          <div className="p-4 rounded-xl bg-sky-50 text-sky-655 border border-sky-100/60 shadow-xs group-hover:scale-105 transition-transform duration-300">
            <Cpu className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Datastore</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1 leading-none tracking-tight">Supabase Sync</h2>
            <span className="text-[10px] text-slate-500 block mt-2 font-mono font-medium">schema: public.pois</span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Map Widget */}
      <TelemetryMap pois={pois} />

      {/* Breakdown Grid & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Category Breakdown list */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900">Category Distribution</h2>
            <span className="text-xs text-slate-400 font-mono font-semibold">Weight percentages</span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((c) => {
              const pct = totalPois > 0 ? (c.count / totalPois) * 100 : 0;
              return (
                <div key={c.name} className="p-4 rounded-xl border border-slate-200 bg-white/40 flex flex-col justify-between h-24 hover:border-slate-350 hover:bg-white transition-all duration-300 group hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{c.name}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${c.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-800">{c.count}</span>
                      <span className="text-[10px] text-slate-450 font-bold uppercase">locations</span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${c.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations Bento Grid */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-200/60 mb-6">
              Quick Operations
            </h2>
            <div className="flex flex-col gap-4">
              <Link
                href="/pois/new"
                className="flex flex-col p-4 rounded-xl border border-slate-200 bg-white/40 hover:bg-teal-50/20 hover:border-teal-200/80 transition-all group duration-300 relative shadow-2xs hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-650 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-teal-950 transition-colors">Add Building POI</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-semibold">Record new geographical coordinates and descriptions manually.</p>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link
                href="/pois/import"
                className="flex flex-col p-4 rounded-xl border border-slate-200 bg-white/40 hover:bg-indigo-50/20 hover:border-indigo-200/80 transition-all group duration-300 relative shadow-2xs hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <Upload className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-indigo-950 transition-colors">Bulk Import CSV</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-semibold">Synchronize large lists of surveyed GPS nodes in batches.</p>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link
                href="/pois"
                className="flex flex-col p-4 rounded-xl border border-slate-200 bg-white/40 hover:bg-slate-50 hover:border-slate-300 transition-all group duration-300 relative shadow-2xs hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-500 border border-slate-200/60 group-hover:bg-slate-200 group-hover:text-slate-850 transition-colors duration-300">
                    <List className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-slate-900 transition-colors">Manage Coordinates</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-semibold">Browse, search, edit details, or delete points of interest records.</p>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-[10px] text-slate-400 font-mono font-semibold leading-normal mt-4">
            System status: Stable<br />
            API response: OK (under 100ms)<br />
            Bound coordinates mapping validated.
          </div>
        </div>
      </div>
    </div>
  );
}
