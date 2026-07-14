import { getAdminPoiRepository } from "@/lib/db";
import PoiTableClient from "./PoiTableClient";
import { ShieldAlert } from "lucide-react";
import type { Poi } from "@futonav/shared";

export const dynamic = "force-dynamic";

export default async function PoisPage() {
  let pois: Poi[] = [];
  let errorMsg = "";

  try {
    const repo = getAdminPoiRepository();
    pois = await repo.fetchAll();
  } catch (error: any) {
    console.error("Pois fetch error:", error);
    errorMsg = error.message || "Failed to load database points of interest.";
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex gap-4 items-start">
        <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 text-lg">Failed to Connect</h3>
          <p className="text-red-700 mt-1">{errorMsg}</p>
          <p className="text-xs text-red-500 mt-3">Make sure local Docker containers are running and exposed on port 54321.</p>
        </div>
      </div>
    );
  }

  return <PoiTableClient initialPois={pois} />;
}
