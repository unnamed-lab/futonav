"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { bulkImportAction } from "../../../actions";
import { Upload, AlertCircle, CheckCircle, FileText, ArrowRight, ShieldAlert, Sparkles, AlertTriangle, Trash2, HelpCircle } from "lucide-react";
import type { PoiCategoryType } from "@futonav/shared";

interface ParsedPoi {
  name: string;
  category: PoiCategoryType;
  latitude: number;
  longitude: number;
  description: string | null;
  tags: string[];
  isCategoryFallback?: boolean;
}

const CATEGORY_SET = new Set([
  "Department",
  "Hostel",
  "Admin",
  "Cafeteria",
  "Gate",
  "Sports",
  "Medical",
  "Library",
  "Other",
]);

export default function CsvImportClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState("");
  const [parsedPois, setParsedPois] = useState<ParsedPoi[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg("");
    setSuccessMsg("");
    setParsedPois([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setErrorMsg("The CSV file seems to be empty or contains no records.");
        } else {
          setParsedPois(rows);
          setSuccessMsg(`Successfully parsed ${rows.length} points of interest from the file.`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse CSV file. Please check formatting.";
        setErrorMsg(message);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string): ParsedPoi[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header row
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const expectedHeaders = ["name", "category", "latitude", "longitude", "description", "tags"];
    const missing = expectedHeaders.filter(h => !headers.includes(h));

    if (missing.length > 0) {
      throw new Error(`Missing required headers in CSV: ${missing.join(", ")}. Required format: name, category, latitude, longitude, description, tags`);
    }

    const nameIdx = headers.indexOf("name");
    const categoryIdx = headers.indexOf("category");
    const latIdx = headers.indexOf("latitude");
    const lngIdx = headers.indexOf("longitude");
    const descIdx = headers.indexOf("description");
    const tagsIdx = headers.indexOf("tags");

    const parsed: ParsedPoi[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCsvLine(line);

      const name = values[nameIdx]?.trim();
      const categoryRaw = values[categoryIdx]?.trim();
      const latRaw = values[latIdx]?.trim();
      const lngRaw = values[lngIdx]?.trim();
      const description = values[descIdx]?.trim() || null;
      const tagsRaw = values[tagsIdx]?.trim() || "";

      if (!name || !categoryRaw || !latRaw || !lngRaw) {
        throw new Error(`Row ${i + 1} is missing required fields (name, category, latitude, or longitude).`);
      }

      // Validate Category
      let normalizedCategory = categoryRaw;
      normalizedCategory = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();
      let isCategoryFallback = false;
      if (!CATEGORY_SET.has(normalizedCategory)) {
        normalizedCategory = "Other";
        isCategoryFallback = true;
      }
      const category = normalizedCategory as PoiCategoryType;

      const latitude = parseFloat(latRaw);
      const longitude = parseFloat(lngRaw);

      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error(`Row ${i + 1} has an invalid latitude "${latRaw}". Must be a number between -90 and 90.`);
      }
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error(`Row ${i + 1} has an invalid longitude "${lngRaw}". Must be a number between -180 and 180.`);
      }

      const tags = tagsRaw
        .split(";")
        .map(t => t.trim())
        .filter(Boolean);

      parsed.push({
        name,
        category,
        latitude,
        longitude,
        description,
        tags,
        isCategoryFallback,
      });
    }

    return parsed;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleImport = () => {
    if (parsedPois.length === 0) return;

    startTransition(async () => {
      try {
        await bulkImportAction(parsedPois);
        setSuccessMsg(`Successfully imported ${parsedPois.length} locations to the database!`);
        setParsedPois([]);
        setFileName("");
        router.push("/pois");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to import points of interest.";
        setErrorMsg(message);
      }
    });
  };

  const handleClear = () => {
    setFileName("");
    setParsedPois([]);
    setErrorMsg("");
    setSuccessMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Inspect for FUTO bounds coordinates
  const isOutOfFutoBounds = (lat: number, lng: number) => {
    return lat < 5.37 || lat > 5.41 || lng < 6.98 || lng > 7.02;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200/60">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Bulk Import Locations</h1>
        <p className="text-slate-500 mt-2 text-sm font-semibold">
          Upload a CSV file containing campus building survey results to synchronize directories.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-panel bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        {!fileName ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50/50 hover:bg-slate-100/50 hover:border-teal-400 transition-all relative group cursor-pointer">
            <Upload className="h-10 w-10 text-slate-400 mb-3 group-hover:text-teal-650 group-hover:scale-105 transition-all duration-300" />
            <h3 className="font-bold text-slate-700 text-sm">Select or Drag CSV File</h3>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">
              Required headers: name, category, latitude, longitude, description, tags
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-650 rounded-lg border border-teal-150">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">{fileName}</span>
                <span className="text-[10px] text-slate-450 font-bold block mt-0.5 uppercase">
                  {parsedPois.length} locations parsed
                </span>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              title="Remove file"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-2.5 items-start text-sm font-bold text-red-800">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-650 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 flex gap-2.5 items-start text-sm font-bold text-teal-800 animate-fadeIn">
            <CheckCircle className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Spreadsheet Preview */}
        {parsedPois.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-teal-650 animate-pulse" />
              <span>Import Data Preview & Warnings check</span>
            </h3>
            
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-3xs max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                    <th className="px-4 py-3">POI Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Latitude</th>
                    <th className="px-4 py-3">Longitude</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3 text-right">Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {parsedPois.map((poi, idx) => {
                    const isCoordinatesWarning = isOutOfFutoBounds(poi.latitude, poi.longitude);
                    const isWarning = isCoordinatesWarning || poi.isCategoryFallback;
                    return (
                      <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isWarning ? "bg-amber-50/15" : ""}`}>
                        <td className="px-4 py-3 font-bold text-slate-800">{poi.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold border tracking-wide uppercase ${
                            poi.isCategoryFallback ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                            {poi.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-650">{poi.latitude.toFixed(6)}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-655">{poi.longitude.toFixed(6)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {poi.tags.map(t => (
                              <span key={t} className="bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-lg text-[9px] border border-slate-200/50">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isCoordinatesWarning && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200" title="Outside typical FUTO bounds (5.37-5.41, 6.98-7.02)">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Out of Bounds</span>
                              </span>
                            )}
                            {poi.isCategoryFallback && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-655 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200" title="Category unrecognized; defaulted to 'Other'">
                                <AlertCircle className="h-3 w-3" />
                                <span>Unrecognized</span>
                              </span>
                            )}
                            {!isWarning && (
                              <span className="text-teal-605 font-bold text-[9px] uppercase tracking-wide">Ready</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleImport}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/10 cursor-pointer hover:shadow-teal-500/20 active:scale-[0.98]"
              >
                <span>{isPending ? "Importing Data..." : `Import ${parsedPois.length} Locations`}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSV format guide */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-3 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-slate-500" />
            <span>Example CSV Template</span>
          </h3>
          <pre className="text-xs bg-slate-950 text-slate-200 p-4 rounded-xl font-mono leading-relaxed overflow-x-auto shadow-inner">
{`name,category,latitude,longitude,description,tags
Senate Building,Admin,5.392500,7.002000,University Senate and VC office,school;administration
University Library,Library,5.393500,7.001500,Main library,library;books`}
          </pre>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-teal-655" />
            <span>Formatting Guidelines</span>
          </h3>
          <ul className="text-xs text-slate-500 space-y-2.5 list-disc pl-4 leading-relaxed font-semibold">
            <li>
              <strong>category</strong> must resolve to one of: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Department</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Hostel</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Admin</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Cafeteria</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Gate</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Sports</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Medical</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Library</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">Other</code>. Unmatched categories fallback to Other.
            </li>
            <li><strong>latitude / longitude</strong> must be precise GPS decimal coordinates.</li>
            <li><strong>tags</strong> are semicolon-separated strings (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-700 font-bold">SEET;engineering</code>).</li>
            <li>If values contain commas (e.g. building names), surround them with double quotes in the CSV.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
