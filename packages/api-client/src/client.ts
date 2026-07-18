import { PostgrestClient } from "@supabase/postgrest-js";

let client: PostgrestClient | null = null;

/**
 * Supabase serves PostgREST under `/rest/v1`. Callers pass the base project URL
 * (e.g. https://xxx.supabase.co or http://localhost:54321), so normalize it to
 * the REST endpoint — mirroring what @supabase/supabase-js does internally.
 * Idempotent if `/rest/v1` is already present.
 */
function toRestUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}

export function getSupabaseClient(url: string, anonKey: string) {
  if (!client) {
    client = new PostgrestClient(toRestUrl(url), {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
  }
  return client;
}

export function resetClient() {
  client = null;
}
