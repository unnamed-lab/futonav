import { getAdminPoiRepository } from "@/lib/db";
import PoiFormClient from "../PoiFormClient";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

interface EditPoiPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPoiPage({ params }: EditPoiPageProps) {
  const { id } = await params;
  let poi = null;
  let errorMsg = "";

  try {
    const repo = getAdminPoiRepository();
    const pois = await repo.fetchAll();
    poi = pois.find((p) => p.id === id) || null;
  } catch (error) {
    errorMsg = error instanceof Error ? error.message : "Failed to load database POI.";
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex gap-4 items-start">
        <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 text-lg">Error Loading POI</h3>
          <p className="text-red-700 mt-1">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!poi) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
        <h2 className="text-2xl font-black text-slate-800">Point of Interest Not Found</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          The requested surveyed campus location does not exist in the database or has been deleted.
        </p>
      </div>
    );
  }

  return <PoiFormClient poi={poi} />;
}
