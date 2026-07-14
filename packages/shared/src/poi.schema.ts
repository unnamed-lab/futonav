import { z } from "zod";

export const PoiCategory = z.enum([
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

export const PoiSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: PoiCategory,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(200).nullable(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url().nullable(),
  updatedAt: z.string().datetime({ offset: true }),
});

export type Poi = z.infer<typeof PoiSchema>;
export type PoiCategoryType = z.infer<typeof PoiCategory>;
