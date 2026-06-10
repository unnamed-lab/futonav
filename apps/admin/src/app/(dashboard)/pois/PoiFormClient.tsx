"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePoiAction } from "../../actions";
import { ArrowLeft, Save, MapPin, Sparkles, Locate } from "lucide-react";
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

  const [formData, setFormData] = useState({
    id: poi?.id || "",
    name: poi?.name || "",
    category: poi?.category || "Other",
    latitude: poi?.latitude !== undefined ? String(poi.latitude) : "5.3920",
    longitude: poi?.longitude !== undefined ? String(poi.longitude) : "7.0020",
    description: poi?.description || "",
    tags: poi?.tags ? poi.tags.join(", ") : "",
    imageUrl: poi?.imageUrl || "",
  });

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
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to save point of interest details.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link
          href="/pois"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {poi ? "Edit Point of Interest" : "Add Point of Interest"}
          </h1>
          <p className="text-slate-500 mt-1">
            {poi ? "Modify details and coordinates of this POI." : "Create a new surveyed location on FUTO campus."}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-slate-700">
            POI Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. School of Engineering and Engineering Technology"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors text-slate-900 font-semibold"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-bold text-slate-700">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors text-slate-900 font-semibold bg-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="text-sm font-bold text-slate-700">
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g. https://example.com/seet.jpg"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors text-slate-900 font-semibold"
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <MapPin className="h-4 w-4" />
              <span>Campus GPS Coordinates</span>
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/60 hover:bg-teal-100 hover:border-teal-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <Locate className={`h-3.5 w-3.5 ${locating ? "animate-spin text-teal-500" : "text-teal-600"}`} />
              <span>{locating ? "Locating..." : "Use Current Location"}</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="latitude" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Latitude *
              </label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                required
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 5.3915"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 bg-white transition-colors text-slate-900 font-mono font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="longitude" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Longitude *
              </label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                required
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 7.0025"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 bg-white transition-colors text-slate-900 font-mono font-semibold"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            FUTO coordinates fall around Latitude: 5.39xx and Longitude: 7.00xx. Please ensure accuracy for correct offline routing.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold text-slate-700">
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
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors text-slate-900 font-semibold resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="tags" className="text-sm font-bold text-slate-700">
              Fuzzy Search Tags
            </label>
            <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">
              <Sparkles className="h-3 w-3" />
              Helps find abbreviations
            </span>
          </div>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. SEET, engineering, dean, lecture hall"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors text-slate-900 font-semibold"
          />
          <p className="text-xs text-slate-400">Separate search keywords and abbreviation codes using commas.</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/pois"
            className="px-5 py-3 text-sm font-bold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Saving..." : "Save POI"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
