"use server";

import { revalidatePath } from "next/cache";
import { getAdminPoiRepository } from "@/lib/db";
import { uploadPoiImage } from "@/lib/storage";
import { PoiCategory, type PoiCategoryType } from "@futonav/shared";
import { z } from "zod";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

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
  // Accept a valid URL or empty/null; the mobile app requires a valid URL, so
  // reject anything else here rather than syncing a value it will discard.
  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .nullable()
    .transform((v) => v || null),
});

export async function uploadPoiImageAction(formData: FormData): Promise<string> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No image file was provided.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Uploaded file must be an image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please upload a file under 5MB.");
  }

  return uploadPoiImage(file);
}

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
  category: PoiCategoryType;
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
