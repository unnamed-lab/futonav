import type { PostgrestClient } from "@supabase/postgrest-js";
import { PoiSchema } from "@futonav/shared";
import type { Poi } from "@futonav/shared";

function toPoi(row: any): Poi {
  return PoiSchema.parse({
    id: row.id,
    name: row.name,
    category: row.category,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    description: row.description || null,
    tags: row.tags || [],
    imageUrl: row.image_url || null,
    updatedAt: row.updated_at,
  });
}

function toRow(poi: any) {
  const row: any = {};
  if (poi.id !== undefined) row.id = poi.id;
  if (poi.name !== undefined) row.name = poi.name;
  if (poi.category !== undefined) row.category = poi.category;
  if (poi.latitude !== undefined) row.latitude = poi.latitude;
  if (poi.longitude !== undefined) row.longitude = poi.longitude;
  if (poi.description !== undefined) row.description = poi.description;
  if (poi.tags !== undefined) row.tags = poi.tags;
  if (poi.imageUrl !== undefined) row.image_url = poi.imageUrl;
  if (poi.updatedAt !== undefined) row.updated_at = poi.updatedAt;
  return row;
}

export function createPoiRepository(client: PostgrestClient) {
  const TABLE = "pois";

  async function fetchAll(): Promise<Poi[]> {
    const { data, error } = await client.from(TABLE).select("*");
    if (error) throw error;
    return (data || []).map(toPoi);
  }

  async function fetchSince(updatedAt: string | null): Promise<Poi[]> {
    if (!updatedAt) return fetchAll();
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .gt("updated_at", updatedAt);
    if (error) throw error;
    return (data || []).map(toPoi);
  }

  async function upsert(poi: Omit<Poi, "id" | "updatedAt" | "imageUrl"> & Partial<Pick<Poi, "id" | "imageUrl">>): Promise<Poi> {
    const row = toRow(poi);
    const { data, error } = await client
      .from(TABLE)
      .upsert(row)
      .select()
      .single();
    if (error) throw error;
    return toPoi(data);
  }

  async function remove(id: string): Promise<void> {
    const { error } = await client.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }

  return { fetchAll, fetchSince, upsert, remove };
}
