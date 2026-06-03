import type { SupabaseClient } from "@supabase/supabase-js";
import { PoiSchema } from "@futonav/shared";
import type { Poi } from "@futonav/shared";

export function createPoiRepository(client: SupabaseClient) {
  const TABLE = "public.pois";

  async function fetchAll(): Promise<Poi[]> {
    const { data, error } = await client.from(TABLE).select("*");
    if (error) throw error;
    return data.map((row) => PoiSchema.parse(row));
  }

  async function fetchSince(updatedAt: string | null): Promise<Poi[]> {
    if (!updatedAt) return fetchAll();
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .gt("updated_at", updatedAt);
    if (error) throw error;
    return data.map((row) => PoiSchema.parse(row));
  }

  async function upsert(poi: Omit<Poi, "id" | "updatedAt">): Promise<Poi> {
    const { data, error } = await client
      .from(TABLE)
      .upsert(poi)
      .select()
      .single();
    if (error) throw error;
    return PoiSchema.parse(data);
  }

  async function remove(id: string): Promise<void> {
    const { error } = await client.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }

  return { fetchAll, fetchSince, upsert, remove };
}
