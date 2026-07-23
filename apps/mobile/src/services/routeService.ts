import { findRoute, calculateEtaMinutes } from "@futonav/core";
import type { TransportMode } from "@futonav/shared";
import { fetchGoogleRoute, type LatLng } from "./directionsService";
import { getCachedRoute, putCachedRoute } from "./sqliteCache";

export type RouteSource = "network" | "cache" | "offline-cache" | "offline-graph";

export interface ResolvedRoute {
  polyline: LatLng[];
  distanceMeters: number;
  etaMinutes: number;
  source: RouteSource;
}

// A cached route is reused without a network call for this long. Campus routes
// are stable, so a week keeps API usage low while bounding ETA staleness.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Discard cache entries older than this on write, so the table can't grow forever.
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// Quantize coordinates to ~11 m (4 decimal places) so nearby start points share
// a cache entry instead of missing on every GPS jitter.
const GRID = 1e4;

function quantize(value: number): number {
  return Math.round(value * GRID) / GRID;
}

function routeKey(start: LatLng, end: LatLng, mode: TransportMode): string {
  const s = `${quantize(start.latitude)},${quantize(start.longitude)}`;
  const e = `${quantize(end.latitude)},${quantize(end.longitude)}`;
  return `${s}|${e}|${mode}`;
}

interface StoredRoute {
  polyline: LatLng[];
  distanceMeters: number;
  etaMinutes: number;
}

/**
 * Resolves a route with graceful degradation:
 *   1. Fresh SQLite cache hit  -> instant, no API call (saves cost + latency).
 *   2. Google Routes API        -> cached for next time.
 *   3. Stale cache (offline)    -> replays a previously-fetched route with no signal.
 *   4. Offline OSM road graph   -> on-network routes only (never a straight line).
 * Returns null when nothing trustworthy is available (caller draws no polyline).
 */
export async function resolveRoute(
  start: LatLng,
  end: LatLng,
  mode: TransportMode,
  forceFresh = false,
): Promise<ResolvedRoute | null> {
  const key = routeKey(start, end, mode);

  if (!forceFresh) {
    const cached = await getCachedRoute(key).catch(() => null);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      const stored = safeParse(cached.data);
      if (stored) return { ...stored, source: "cache" };
    }
  }

  const google = await fetchGoogleRoute(start, end, mode);
  if (google) {
    const stored: StoredRoute = {
      polyline: google.polyline,
      distanceMeters: google.distanceMeters,
      etaMinutes: google.etaMinutes,
    };
    // Fire-and-forget: a cache write must never block or fail navigation.
    putCachedRoute(key, JSON.stringify(stored), CACHE_MAX_AGE_MS).catch(() => {});
    return { ...stored, source: "network" };
  }

  // Network failed — replay a stale cached route if we have one (offline nav).
  if (!forceFresh) {
    const cached = await getCachedRoute(key).catch(() => null);
    if (cached) {
      const stored = safeParse(cached.data);
      if (stored) return { ...stored, source: "offline-cache" };
    }
  }

  // Last resort: the offline OSM campus graph, but only when it genuinely
  // follows the road network (never a straight line through buildings).
  const local = findRoute(start, end, mode);
  if (local.onNetwork) {
    return {
      polyline: local.polyline,
      distanceMeters: local.distanceMeters,
      etaMinutes: calculateEtaMinutes(local.distanceMeters, mode),
      source: "offline-graph",
    };
  }

  return null;
}

function safeParse(data: string): StoredRoute | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed && Array.isArray(parsed.polyline)) return parsed as StoredRoute;
  } catch {
    // corrupt entry — ignore
  }
  return null;
}
