"use server";

import { revalidatePath } from "next/cache";
import { getAdminPoiRepository } from "@/lib/db";
import { deletePoiImage, createSignedImageUpload, type SignedImageUpload } from "@/lib/storage";
import { PoiCategory, type PoiCategoryType } from "@futonav/shared";
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
  // Accept a valid URL or empty/null; the mobile app requires a valid URL, so
  // reject anything else here rather than syncing a value it will discard.
  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .nullable()
    .transform((v) => v || null),
});

/**
 * Returns a signed URL the browser uploads the image bytes to directly, so large
 * images bypass the serverless request-body limit (e.g. Vercel's ~4.5MB cap).
 * Only the small metadata request goes through the server.
 */
export async function createImageUploadUrlAction(mimeType: string): Promise<SignedImageUpload> {
  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error("A valid image content type is required.");
  }
  return createSignedImageUpload(mimeType);
}

export async function deletePoiAction(id: string) {
  const repo = getAdminPoiRepository();
  // Look up the image before deleting so we can clean up its storage object.
  const existing = await repo.fetchById(id).catch(() => null);
  await repo.remove(id);
  if (existing?.imageUrl) {
    await deletePoiImage(existing.imageUrl).catch(() => {});
  }
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

  // When editing, capture the previous image so we can clean it up if replaced.
  const previous = parsed.id ? await repo.fetchById(parsed.id).catch(() => null) : null;

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

  // Remove the old storage object if the image changed or was cleared.
  if (previous?.imageUrl && previous.imageUrl !== parsed.imageUrl) {
    await deletePoiImage(previous.imageUrl).catch(() => {});
  }

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
