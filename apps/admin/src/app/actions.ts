"use server";

import { revalidatePath } from "next/cache";
import { getAdminPoiRepository } from "@/lib/db";
import { PoiCategory } from "@futonav/shared";
import { z } from "zod";

const FormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  category: PoiCategory,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  description: z.string().max(200).transform(v => v || null).nullable(),
  tags: z.string().transform(v => 
    v.split(",")
     .map(t => t.trim())
     .filter(Boolean)
  ).default(""),
  imageUrl: z.string().transform(v => v || null).nullable(),
});

export async function deletePoiAction(id: string) {
  const repo = getAdminPoiRepository();
  await repo.remove(id);
  revalidatePath("/pois");
  revalidatePath("/");
}

export async function savePoiAction(formData: {
  id?: string;
  name: string;
  category: string;
  latitude: string | number;
  longitude: string | number;
  description: string | null;
  tags: string | string[];
  imageUrl: string | null;
}) {
  const parsed = FormSchema.parse(formData);
  const repo = getAdminPoiRepository();

  await repo.upsert({
    id: parsed.id,
    name: parsed.name,
    category: parsed.category,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    description: parsed.description,
    tags: parsed.tags as string[],
    imageUrl: parsed.imageUrl,
  });

  revalidatePath("/pois");
  revalidatePath("/");
}

export async function bulkImportAction(poisList: Array<{
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string | null;
  tags: string[];
}>) {
  const repo = getAdminPoiRepository();
  for (const poi of poisList) {
    await repo.upsert(poi);
  }
  revalidatePath("/pois");
  revalidatePath("/");
}
