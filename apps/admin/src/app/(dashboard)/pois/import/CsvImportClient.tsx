"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkImportAction } from "../../actions";
import { Upload, AlertCircle, CheckCircle, FileText, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import type { PoiCategoryType } from "@futonav/shared";

interface ParsedPoi {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string | null;
  tags: string[];
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
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to parse CSV file. Please check formatting.");
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
      throw new Error(`Missing required headers in CSV: ${missing.join(", ")}. Format: name,category,latitude,longitude,description,tags`);
    }

    const nameIdx = headers.indexOf("name");
    const categoryIdx = headers.indexOf("category");
    const latIdx = headers.indexOf("latitude");
    const lngIdx = headers.indexOf("longitude");
    const descIdx = headers.indexOf("description");
    const tagsIdx = headers.indexOf("tags");

    const parsed: ParsedPoi[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Split by comma, respecting quotes if values have commas
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
      let category = categoryRaw;
      // Capitalize first letter to match Zod enum
      category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      if (!CATEGORY_SET.has(category)) {
        category = "Other"; // fallback
      }

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
      });
    }

    return parsed;
  };

  // Helper to parse CSV line respecting quotes
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
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to import points of interest.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bulk Import Locations</h1>
        <p className="text-slate-500 mt-2">
          Upload a CSV file containing campus building survey results to synchronize directories.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50 hover:bg-slate-100/50 transition-all relative">
          <Upload className="h-10 w-10 text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">Upload CSV File</h3>
          <p className="text-slate-400 text-xs mt-1">
            Ensure headers are: name, category, latitude, longitude, description, tags
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {fileName && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <FileText className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-bold text-slate-700">{fileName}</span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-2 items-start text-sm font-semibold text-red-800">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 flex gap-2 items-start text-sm font-semibold text-teal-800">
            <CheckCircle className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {parsedPois.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleImport}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
            >
              <span>{isPending ? "Importing..." : `Import ${parsedPois.length} Locations`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* CSV format guide */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Example CSV Template</h3>
          <pre className="text-xs bg-slate-950 text-slate-200 p-4 rounded-xl font-mono leading-relaxed overflow-x-auto">
{`name,category,latitude,longitude,description,tags
Senate Building,Admin,5.3925,7.0020,University Senate and VC office,school;administration
University Library,Library,5.3935,7.0015,Main library,library;books`}
          </pre>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            Formatting Guidelines
          </h3>
          <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
            <li><strong>category</strong> must resolve to one of the standard category types (Department, Hostel, Admin, Cafeteria, Gate, Sports, Medical, Library, Other). Unmatched categories default to Other.</li>
            <li><strong>latitude / longitude</strong> must be precise GPS decimal coordinates.</li>
            <li><strong>tags</strong> are semicolon-separated strings (e.g. <code className="bg-slate-100 px-1 rounded text-teal-700 font-semibold">SEET;engineering</code>).</li>
            <li>If values contain commas (e.g. building names), surround them with double quotes in the CSV.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
