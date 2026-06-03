import type { Poi } from "@futonav/shared";

export interface SyncStore {
  getAll(): Promise<Poi[]>;
  upsert(pois: Poi[]): Promise<void>;
  getLastSyncAt(): Promise<string | null>;
  setLastSyncAt(ts: string): Promise<void>;
}

export interface SyncSource {
  fetchSince(updatedAt: string | null): Promise<Poi[]>;
}

export async function runDeltaSync(store: SyncStore, source: SyncSource): Promise<{
  synced: number;
  offline: boolean;
}> {
  try {
    const lastSyncAt = await store.getLastSyncAt();
    const pois = await source.fetchSince(lastSyncAt);

    if (pois.length > 0) {
      await store.upsert(pois);
      const maxTs = pois.reduce(
        (max, p) => (p.updatedAt > max ? p.updatedAt : max),
        pois[0].updatedAt,
      );
      await store.setLastSyncAt(maxTs);
    }

    return { synced: pois.length, offline: false };
  } catch {
    return { synced: 0, offline: true };
  }
}
