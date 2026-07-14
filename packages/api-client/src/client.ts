import { PostgrestClient } from "@supabase/postgrest-js";

let client: PostgrestClient | null = null;

export function getSupabaseClient(url: string, anonKey: string) {
  if (!client) {
    client = new PostgrestClient(url, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
  }
  return client;
}

export function resetClient() {
  client = null;
}
