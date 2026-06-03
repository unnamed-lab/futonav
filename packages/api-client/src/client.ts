import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(url: string, anonKey: string) {
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

export function resetClient() {
  client = null;
}
