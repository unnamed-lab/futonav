import { haversineMeters, distanceToSegment, projectPointOntoSegment } from "./haversine";
import type { LatLng } from "./haversine";
import campusGraph from "./data/campusGraph.json";
import type { TransportMode } from "@futonav/shared";
import { calculateEtaMinutes } from "./eta";

export interface RouteResult {
  polyline: LatLng[];
  distanceMeters: number;
  // True when the polyline follows the real campus road network (or is a short,
  // accurate direct hop). False when no network path could be found and the line
  // is a straight-line guess — callers should avoid drawing those.
  onNetwork: boolean;
}

// Transport-mode bitmask, matching scripts/build-campus-graph.mjs.
const MODE_BIT: Record<TransportMode, number> = { walking: 1, bike: 2, car: 4 };

// Below this straight-line distance a direct segment is accurate enough that
// snapping to the road network only introduces detour artifacts.
const DIRECT_ROUTE_THRESHOLD_M = 150;

interface GraphAdjacency {
  target: string;
  modes: number;
}

/**
 * Campus road network derived from OpenStreetMap (see scripts/build-campus-graph.mjs).
 * Node coordinates and connectivity come straight from OSM — none are hand-placed.
 */
export const ROUTE_NODES: Record<string, LatLng> = {};
for (const [id, coord] of Object.entries(campusGraph.nodes as Record<string, number[]>)) {
  ROUTE_NODES[id] = { latitude: coord[0], longitude: coord[1] };
}

const ADJACENCY: Record<string, GraphAdjacency[]> = {};
for (const [a, b, modes] of campusGraph.edges as unknown as [string, string, number][]) {
  (ADJACENCY[a] ||= []).push({ target: b, modes });
  (ADJACENCY[b] ||= []).push({ target: a, modes });
}

const NODE_IDS = Object.keys(ROUTE_NODES);

function findClosestNode(point: LatLng): string {
  let closestKey = "";
  let minDistance = Infinity;

  for (const key of NODE_IDS) {
    const dist = haversineMeters(point, ROUTE_NODES[key]);
    if (dist < minDistance) {
      minDistance = dist;
      closestKey = key;
    }
  }

  return closestKey;
}

/**
 * Dijkstra shortest path over the OSM road graph, filtered to edges that permit
 * the requested transport mode. Returns the node-id path, or [] if unreachable.
 */
function dijkstra(startKey: string, endKey: string, mode: TransportMode): string[] {
  if (startKey === endKey) return [startKey];

  const modeBit = MODE_BIT[mode];
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  // Frontier of nodes with a known tentative distance, scanned linearly for the
  // minimum. The campus graph is small enough that this stays well under budget.
  const frontier = new Set<string>();

  distances[startKey] = 0;
  frontier.add(startKey);

  while (frontier.size > 0) {
    let currentKey: string | null = null;
    let minDistance = Infinity;
    for (const key of frontier) {
      if (distances[key] < minDistance) {
        minDistance = distances[key];
        currentKey = key;
      }
    }

    if (currentKey === null) break;
    if (currentKey === endKey) break;

    frontier.delete(currentKey);
    visited.add(currentKey);

    for (const edge of ADJACENCY[currentKey] || []) {
      if (visited.has(edge.target)) continue;
      if ((edge.modes & modeBit) === 0) continue;

      const alt = distances[currentKey] + haversineMeters(ROUTE_NODES[currentKey], ROUTE_NODES[edge.target]);
      if (alt < (distances[edge.target] ?? Infinity)) {
        distances[edge.target] = alt;
        previous[edge.target] = currentKey;
        frontier.add(edge.target);
      }
    }
  }

  if (distances[endKey] === undefined) return [];

  const path: string[] = [];
  let current: string | null = endKey;
  while (current !== null && current !== undefined) {
    path.push(current);
    current = previous[current] ?? null;
  }

  return path.reverse();
}

/**
 * Finds a road-following route between two points over the OSM campus network.
 * Snaps the endpoints to the nearest road nodes, runs mode-aware Dijkstra, and
 * returns the stitched polyline plus the true along-road distance.
 */
export function findRoute(start: LatLng, end: LatLng, mode: TransportMode = "walking"): RouteResult {
  const directDist = haversineMeters(start, end);

  if (directDist < DIRECT_ROUTE_THRESHOLD_M) {
    return { polyline: [start, end], distanceMeters: Math.round(directDist), onNetwork: true };
  }

  const startNode = findClosestNode(start);
  const endNode = findClosestNode(end);
  const nodePath = startNode && endNode ? dijkstra(startNode, endNode, mode) : [];

  if (nodePath.length === 0) {
    // No connected path for this mode — return a direct line but flag it so the
    // caller can decline to draw a road-crossing straight line.
    return { polyline: [start, end], distanceMeters: Math.round(directDist), onNetwork: false };
  }

  const polyline: LatLng[] = [start];
  for (const nodeKey of nodePath) {
    polyline.push(ROUTE_NODES[nodeKey]);
  }
  polyline.push(end);

  let distanceMeters = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    distanceMeters += haversineMeters(polyline[i], polyline[i + 1]);
  }

  return { polyline, distanceMeters: Math.round(distanceMeters), onNetwork: true };
}

export type ManeuverType = "straight" | "turn-left" | "turn-right" | "sharp-left" | "sharp-right" | "arrive";

export interface Maneuver {
  type: ManeuverType;
  instruction: string;
  distanceMeters: number;
  location: LatLng;
}

function calculateBearing(start: LatLng, end: LatLng): number {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLng = (start.longitude * Math.PI) / 180;
  const endLat = (end.latitude * Math.PI) / 180;
  const endLng = (end.longitude * Math.PI) / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function calculateManeuvers(polyline: LatLng[]): Maneuver[] {
  if (polyline.length < 2) return [];

  const maneuvers: Maneuver[] = [];
  let currentDist = haversineMeters(polyline[0], polyline[1]);

  for (let i = 0; i < polyline.length - 2; i++) {
    const b1 = calculateBearing(polyline[i], polyline[i + 1]);
    const b2 = calculateBearing(polyline[i + 1], polyline[i + 2]);
    let diff = b2 - b1;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    let type: ManeuverType = "straight";
    let instruction = "Continue straight";

    if (diff > 60) {
      type = "sharp-right";
      instruction = "Turn sharp right";
    } else if (diff > 25) {
      type = "turn-right";
      instruction = "Turn right";
    } else if (diff < -60) {
      type = "sharp-left";
      instruction = "Turn sharp left";
    } else if (diff < -25) {
      type = "turn-left";
      instruction = "Turn left";
    }

    if (type !== "straight") {
      maneuvers.push({
        type,
        instruction,
        distanceMeters: Math.round(currentDist),
        location: polyline[i + 1],
      });
      currentDist = haversineMeters(polyline[i + 1], polyline[i + 2]);
    } else {
      currentDist += haversineMeters(polyline[i + 1], polyline[i + 2]);
    }
  }

  const lastDist = haversineMeters(polyline[polyline.length - 2], polyline[polyline.length - 1]);
  maneuvers.push({
    type: "arrive",
    instruction: "Arrive at destination",
    distanceMeters: Math.round(lastDist),
    location: polyline[polyline.length - 1],
  });

  return maneuvers;
}

export interface ActiveNavigationProgress {
  remainingPolyline: LatLng[];
  remainingDistanceMeters: number;
  remainingEtaMinutes: number;
  distanceToRoute: number;
  isOffRoute: boolean;
  nextManeuver: Maneuver | null;
}

export function getRemainingRoute(
  userPos: LatLng,
  fullPolyline: LatLng[],
  mode: TransportMode = "walking",
): ActiveNavigationProgress {
  if (!fullPolyline || fullPolyline.length < 2) {
    return {
      remainingPolyline: fullPolyline ? [...fullPolyline] : [],
      remainingDistanceMeters: 0,
      remainingEtaMinutes: 0,
      distanceToRoute: 0,
      isOffRoute: false,
      nextManeuver: null,
    };
  }

  let minSegDist = Infinity;
  let bestSegIndex = 0;
  let bestProj: LatLng = fullPolyline[0];

  for (let i = 0; i < fullPolyline.length - 1; i++) {
    const a = fullPolyline[i];
    const b = fullPolyline[i + 1];
    const proj = projectPointOntoSegment(userPos, a, b);
    const segDist = haversineMeters(userPos, proj);

    if (segDist < minSegDist) {
      minSegDist = segDist;
      bestSegIndex = i;
      bestProj = proj;
    }
  }

  const distanceToRoute = Math.round(minSegDist);
  const isOffRoute = distanceToRoute > 30;

  const remainingPolyline: LatLng[] = [userPos];
  for (let k = bestSegIndex + 1; k < fullPolyline.length; k++) {
    remainingPolyline.push(fullPolyline[k]);
  }

  let remainingDistanceMeters = 0;
  for (let k = 0; k < remainingPolyline.length - 1; k++) {
    remainingDistanceMeters += haversineMeters(remainingPolyline[k], remainingPolyline[k + 1]);
  }
  remainingDistanceMeters = Math.round(remainingDistanceMeters);

  const remainingEtaMinutes = calculateEtaMinutes(remainingDistanceMeters, mode);
  const maneuvers = calculateManeuvers(remainingPolyline);
  const nextManeuver = maneuvers.length > 0 ? maneuvers[0] : null;

  return {
    remainingPolyline,
    remainingDistanceMeters,
    remainingEtaMinutes,
    distanceToRoute,
    isOffRoute,
    nextManeuver,
  };
}
