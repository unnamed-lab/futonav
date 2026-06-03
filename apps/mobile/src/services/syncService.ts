import type { Poi } from "@futonav/shared";
import { runDeltaSync } from "@futonav/core";
import type { SyncStore, SyncSource } from "@futonav/core";
import { getSupabaseClient } from "@futonav/api-client";
import { createPoiRepository } from "@futonav/api-client";
import Constants from "expo-constants";

// Memory-backed sync store for now; SQLite-backed in Phase G
class MemorySyncStore implements SyncStore {
  private pois: Poi[] = [];
  private lastSyncAt: string | null = null;

  async getAll(): Promise<Poi[]> {
    return this.pois;
  }

  async upsert(incoming: Poi[]): Promise<void> {
    const map = new Map(this.pois.map((p) => [p.id, p]));
    for (const p of incoming) map.set(p.id, p);
    this.pois = Array.from(map.values());
  }

  async getLastSyncAt(): Promise<string | null> {
    return this.lastSyncAt;
  }

  async setLastSyncAt(ts: string): Promise<void> {
    this.lastSyncAt = ts;
  }
}

let store: MemorySyncStore | null = null;

function getStore(): MemorySyncStore {
  if (!store) store = new MemorySyncStore();
  return store;
}

function getSource(): SyncSource {
  const url = Constants.expoConfig?.extra?.supabaseUrl as string;
  const anonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

  const client = getSupabaseClient(url, anonKey);
  const repo = createPoiRepository(client);

  return { fetchSince: (ts) => repo.fetchSince(ts) };
}

export async function syncPois(): Promise<{ synced: number; offline: boolean }> {
  return runDeltaSync(getStore(), getSource());
}

export function getCachedPois(): Promise<Poi[]> {
  return getStore().getAll();
}
