import * as SQLite from "expo-sqlite";
import type { Poi } from "@futonav/shared";

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("futonav.db");

    await db.execAsync(`
      create table if not exists pois (
        id text primary key,
        name text not null,
        category text not null,
        latitude real not null,
        longitude real not null,
        description text,
        tags text not null default '[]',
        image_url text,
        updated_at text not null
      );
      create table if not exists meta (
        key text primary key,
        value text
      );
      create table if not exists routes (
        key text primary key,
        data text not null,
        created_at integer not null
      );
    `);
  }
  return db;
}

export async function getAllPois(): Promise<Poi[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    "select * from pois",
  );
  return rows.map(rowToPoi);
}

export async function upsertPois(pois: Poi[]): Promise<void> {
  const database = await getDb();

  for (const p of pois) {
    await database.runAsync(
      `insert or replace into pois (id, name, category, latitude, longitude, description, tags, image_url, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.name,
        p.category,
        p.latitude,
        p.longitude,
        p.description,
        JSON.stringify(p.tags),
        p.imageUrl,
        p.updatedAt,
      ],
    );
  }
}

export async function getLastSyncAt(): Promise<string | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: string }>(
    "select value from meta where key = 'last_sync_at'",
  );
  return row?.value ?? null;
}

export async function setLastSyncAt(ts: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "insert or replace into meta (key, value) values ('last_sync_at', ?)",
    ts,
  );
}

export interface CachedRoute {
  data: string;
  createdAt: number;
}

export async function getCachedRoute(key: string): Promise<CachedRoute | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ data: string; created_at: number }>(
    "select data, created_at from routes where key = ?",
    key,
  );
  return row ? { data: row.data, createdAt: row.created_at } : null;
}

export async function putCachedRoute(
  key: string,
  data: string,
  maxAgeMs?: number,
): Promise<void> {
  const database = await getDb();
  const now = Date.now();
  await database.runAsync(
    "insert or replace into routes (key, data, created_at) values (?, ?, ?)",
    [key, data, now],
  );
  // Opportunistic prune so the cache can't grow without bound over time.
  if (maxAgeMs && maxAgeMs > 0) {
    await database.runAsync("delete from routes where created_at < ?", now - maxAgeMs);
  }
}

function rowToPoi(row: Record<string, unknown>): Poi {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Poi["category"],
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    description: (row.description as string) ?? null,
    tags: JSON.parse((row.tags as string) || "[]"),
    imageUrl: (row.image_url as string) ?? null,
    updatedAt: row.updated_at as string,
  };
}

export async function clearCache(): Promise<void> {
  const database = await getDb();
  await database.runAsync("delete from pois");
  await database.runAsync("delete from meta where key = 'last_sync_at'");
}

export function createSqliteSyncStore() {
  return {
    getAll: getAllPois,
    upsert: upsertPois,
    getLastSyncAt,
    setLastSyncAt,
    clearCache,
  };
}
