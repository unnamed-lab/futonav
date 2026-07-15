"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { savePoiAction, uploadPoiImageAction } from "../../actions";
import {
  ArrowLeft,
  Save,
  MapPin,
  Sparkles,
  Locate,
  AlertTriangle,
  ImagePlus,
  Loader2,
  X,
  FileText,
  Tag as TagIcon
} from "lucide-react";
import Link from "next/link";
import type { Poi, PoiCategoryType } from "@futonav/shared";

interface PoiFormClientProps {
  poi?: Poi;
}

const CATEGORIES: PoiCategoryType[] = [
  "Department",
  "Hostel",
  "Admin",
  "Cafeteria",
  "Gate",
  "Sports",
  "Medical",
  "Library",
  "Other",
];

export default function PoiFormClient({ poi }: PoiFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: poi?.id || "",
    name: poi?.name || "",
    category: poi?.category || "Other",
    latitude: poi?.latitude !== undefined ? String(poi.latitude) : "5.392000",
    longitude: poi?.longitude !== undefined ? String(poi.longitude) : "7.002000",
    description: poi?.description || "",
    tags: poi?.tags ? poi.tags.join(", ") : "",
    imageUrl: poi?.imageUrl || "",
  });

  // Out-of-bounds warning check (FUTO typical bounds)
  const latVal = parseFloat(formData.latitude);
  const lngVal = parseFloat(formData.longitude);
  const isLatOutOfFuto = !isNaN(latVal) && (latVal < 5.37 || latVal > 5.41);
  const isLngOutOfFuto = !isNaN(lngVal) && (lngVal < 6.98 || lngVal > 7.02);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude.toFixed(6)),
          longitude: String(position.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Location access denied by user.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable. Please check your GPS settings.");
            break;
          case error.TIMEOUT:
            setErrorMsg("Location request timed out.");
            break;
          default:
            setErrorMsg("An unexpected error occurred while fetching location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image is too large. Please choose a file under 5MB.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadPoiImageAction(fd);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed. Please try again.";
      setErrorMsg(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMsg("Latitude must be a valid number between -90 and 90.");
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setErrorMsg("Longitude must be a valid number between -180 and 180.");
      return;
    }

    startTransition(async () => {
      try {
        await savePoiAction({
          id: formData.id || undefined,
          name: formData.name,
          category: formData.category,
          latitude: lat,
          longitude: lng,
          description: formData.description,
          tags: formData.tags,
          imageUrl: formData.imageUrl || null,
        });
        router.push("/pois");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save point of interest details.";
        setErrorMsg(message);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link
          href="/pois"
          className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-55 transition-colors shadow-2xs cursor-pointer border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            {poi ? "Edit Point of Interest" : "Add Point of Interest"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold">
            {poi ? "Modify details and coordinates of this POI." : "Create a new surveyed location on FUTO campus."}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-250 bg-red-50 p-4 text-sm font-bold text-red-800 animate-fadeIn">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-8 shadow-md">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-650" />
            <span>Basic Information</span>
          </h3>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Name */}
            <div className="sm:col-span-2 space-y-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                POI Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. SEET Lecture Hall"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all text-slate-800 font-semibold focus-ring-glow"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800 font-semibold cursor-pointer focus-ring-glow"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Description (Max 200 characters)
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={200}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. SEET administrative building housing engineering school dean and labs."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all text-slate-800 font-semibold resize-none focus-ring-glow"
            />
          </div>
        </div>

        {/* Section 2: Visual Asset */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-teal-650" />
            <span>Visual Asset</span>
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 items-start">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Upload Building Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-650 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-teal-605" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4.5 w-4.5 text-teal-650 animate-scale-pulse" />
                    <span>{formData.imageUrl ? "Replace uploaded image" : "Choose image file"}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Or paste an image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/seet.jpg"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all text-slate-800 font-semibold focus-ring-glow"
              />
            </div>
          </div>

          {formData.imageUrl && (
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 animate-fadeIn">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.imageUrl}
                alt="POI preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                title="Remove image"
                className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 border border-slate-200 text-slate-600 hover:text-red-650 hover:bg-white transition-colors cursor-pointer shadow-2xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Telemetry */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-650" />
            <span>Geographical Telemetry</span>
          </h3>

          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500 font-semibold leading-relaxed max-w-[280px]">
                FUTO coordinates typical range: Latitude: 5.39xx, Longitude: 7.00xx.
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100/70 px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
              >
                <Locate className={`h-4 w-4 ${locating ? "animate-spin text-teal-500" : "text-teal-650"}`} />
                <span>{locating ? "Locating..." : "Use Current Location"}</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Latitude *
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  required
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 5.391500"
                  className={`w-full px-4 py-3 border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all font-mono font-bold focus-ring-glow ${
                    isLatOutOfFuto 
                      ? "border-amber-300 bg-amber-50/40 text-amber-900" 
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                />
                {isLatOutOfFuto && (
                  <span className="text-[10px] text-amber-605 font-bold flex items-center gap-1 mt-1.5 leading-normal">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Outside FUTO boundary layout (5.37 to 5.41).
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="longitude" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Longitude *
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  required
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 7.002500"
                  className={`w-full px-4 py-3 border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all font-mono font-bold focus-ring-glow ${
                    isLngOutOfFuto 
                      ? "border-amber-300 bg-amber-50/40 text-amber-900" 
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                />
                {isLngOutOfFuto && (
                  <span className="text-[10px] text-amber-650 font-bold flex items-center gap-1 mt-1.5 leading-normal">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Outside FUTO boundary layout (6.98 to 7.02).
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Metadata & Indexing */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-teal-650" />
            <span>Metadata & Fuzzy Indexing</span>
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="tags" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Fuzzy Search Tags
              </label>
              <span className="inline-flex items-center gap-1 text-[9px] text-teal-700 bg-teal-55 px-2 py-0.5 rounded-md font-bold tracking-wide uppercase">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Index Abbreviation keywords
              </span>
            </div>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. SEET, engineering, dean, lecture hall"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all text-slate-800 font-semibold focus-ring-glow"
            />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Separate keywords using commas (helps mobile client search abbreviations).</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <Link
            href="/pois"
            className="px-5 py-3 text-sm font-bold border border-slate-250 rounded-xl text-slate-550 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-teal-650/10 hover:shadow-teal-500/20 active:scale-[0.98]"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{isPending ? "Saving..." : "Save POI"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
