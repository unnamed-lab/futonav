import type { Poi } from "@futonav/shared";
import { runDeltaSync } from "@futonav/core";
import type { SyncSource } from "@futonav/core";
import { getSupabaseClient, createPoiRepository } from "@futonav/api-client";
import Constants from "expo-constants";
import { BASELINE_POIS } from "../data/baselinePois";
import { createSqliteSyncStore, getAllPois, clearCache } from "./sqliteCache";

const store = createSqliteSyncStore();

function getSource(): SyncSource {
  const url = (process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl || "") as string;
  const anonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey || "") as string;

  const client = getSupabaseClient(url, anonKey);
  const repo = createPoiRepository(client);
  return { fetchSince: (ts) => repo.fetchSince(ts) };
}

export async function seedBaseline(): Promise<void> {
  const existing = await store.getLastSyncAt();
  if (existing) return;
  await store.upsert(BASELINE_POIS);
  await store.setLastSyncAt("2024-01-01T00:00:00Z");
}

export async function syncPois(): Promise<{ synced: number; offline: boolean }> {
  return runDeltaSync(store, getSource());
}

export function subscribeToRealtimePois(onUpdate: () => void): () => void {
  // Triggers background check every 60s while the app is active
  const interval = setInterval(async () => {
    try {
      const res = await syncPois();
      if (!res.offline && res.synced > 0) {
        onUpdate();
      }
    } catch {
      // Background sync exception handled silently
    }
  }, 60000);

  return () => clearInterval(interval);
}

export function getCachedPois(): Promise<Poi[]> {
  return getAllPois();
}

export async function clearLocalCache(): Promise<void> {
  await clearCache();
}
