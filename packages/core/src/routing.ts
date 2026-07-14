import { haversineMeters } from "./haversine";
import type { LatLng } from "./haversine";

export interface RouteResult {
  polyline: LatLng[];
  distanceMeters: number;
}

export interface Edge {
  target: string;
  allowedModes: ("walking" | "bike" | "car")[];
}

// Detailed FUTO campus waypoints tracing the road network and curves
export const ROUTE_NODES: Record<string, LatLng> = {
  // Main diagonal road waypoints (NW to SE)
  main_road_nw: { latitude: 5.3890, longitude: 6.9880 },
  main_road_bend1: { latitude: 5.3865, longitude: 6.9905 },
  main_road_bend2: { latitude: 5.3840, longitude: 6.9930 },
  main_road_se: { latitude: 5.3815, longitude: 6.9955 },

  // Admin branch junction on the main road
  admin_branch_junc: { latitude: 5.3852, longitude: 6.9918 },

  // Admin / Architecture area nodes
  admin_roundabout: { latitude: 5.3844, longitude: 6.9912 },
  archi_dept: { latitude: 5.3842, longitude: 6.9912 },
  entrepreneur_studies: { latitude: 5.3838, longitude: 6.9902 },
  archi_studio_5: { latitude: 5.3829, longitude: 6.9904 },

  // GST / SOES branch nodes
  gst_junction: { latitude: 5.3855, longitude: 6.9922 },
  soes_junction: { latitude: 5.3851, longitude: 6.9932 },

  // SAAT branch junction on the main road
  saat_branch_junc: { latitude: 5.3835, longitude: 6.9935 },

  // SAAT / Biochemistry area nodes
  saat_junction: { latitude: 5.3840, longitude: 6.9934 },
  biochem_dept: { latitude: 5.3833, longitude: 6.9922 },
  sosc_junction: { latitude: 5.3822, longitude: 6.9958 },

  // Northern unverified area nodes
  unverified_west: { latitude: 5.3910, longitude: 7.0005 },
  unverified_center: { latitude: 5.3920, longitude: 7.0015 },
  unverified_east: { latitude: 5.3935, longitude: 7.0035 },
};

// Road connections with mode-specific access permissions
const ROUTE_EDGES: Record<string, Edge[]> = {
  main_road_nw: [
    { target: "main_road_bend1", allowedModes: ["walking", "bike", "car"] },
    { target: "unverified_west", allowedModes: ["walking", "bike", "car"] },
  ],
  main_road_bend1: [
    { target: "main_road_nw", allowedModes: ["walking", "bike", "car"] },
    { target: "admin_branch_junc", allowedModes: ["walking", "bike", "car"] },
  ],
  admin_branch_junc: [
    { target: "main_road_bend1", allowedModes: ["walking", "bike", "car"] },
    { target: "main_road_bend2", allowedModes: ["walking", "bike", "car"] },
    { target: "admin_roundabout", allowedModes: ["walking", "bike", "car"] },
    { target: "gst_junction", allowedModes: ["walking", "bike", "car"] },
  ],
  main_road_bend2: [
    { target: "admin_branch_junc", allowedModes: ["walking", "bike", "car"] },
    { target: "saat_branch_junc", allowedModes: ["walking", "bike", "car"] },
  ],
  saat_branch_junc: [
    { target: "main_road_bend2", allowedModes: ["walking", "bike", "car"] },
    { target: "main_road_se", allowedModes: ["walking", "bike", "car"] },
    { target: "saat_junction", allowedModes: ["walking", "bike", "car"] },
  ],
  main_road_se: [
    { target: "saat_branch_junc", allowedModes: ["walking", "bike", "car"] },
    { target: "sosc_junction", allowedModes: ["walking", "bike", "car"] },
  ],
  admin_roundabout: [
    { target: "admin_branch_junc", allowedModes: ["walking", "bike", "car"] },
    { target: "archi_dept", allowedModes: ["walking", "bike", "car"] },
  ],
  archi_dept: [
    { target: "admin_roundabout", allowedModes: ["walking", "bike", "car"] },
    { target: "archi_studio_5", allowedModes: ["walking", "bike", "car"] },
    { target: "entrepreneur_studies", allowedModes: ["walking", "bike", "car"] },
  ],
  entrepreneur_studies: [
    { target: "archi_dept", allowedModes: ["walking", "bike", "car"] },
    { target: "archi_studio_5", allowedModes: ["walking", "bike", "car"] },
  ],
  archi_studio_5: [
    { target: "archi_dept", allowedModes: ["walking", "bike", "car"] },
    { target: "entrepreneur_studies", allowedModes: ["walking", "bike", "car"] },
  ],
  gst_junction: [
    { target: "admin_branch_junc", allowedModes: ["walking", "bike", "car"] },
    { target: "soes_junction", allowedModes: ["walking", "bike", "car"] },
  ],
  soes_junction: [
    { target: "gst_junction", allowedModes: ["walking", "bike", "car"] },
    // Pedestrian-only walkway shortcut linking SOES and SAAT departments
    { target: "saat_junction", allowedModes: ["walking", "bike"] },
  ],
  saat_junction: [
    { target: "saat_branch_junc", allowedModes: ["walking", "bike", "car"] },
    { target: "soes_junction", allowedModes: ["walking", "bike"] },
    { target: "biochem_dept", allowedModes: ["walking", "bike", "car"] },
  ],
  biochem_dept: [
    { target: "saat_junction", allowedModes: ["walking", "bike", "car"] },
    { target: "sosc_junction", allowedModes: ["walking", "bike", "car"] },
  ],
  sosc_junction: [
    { target: "biochem_dept", allowedModes: ["walking", "bike", "car"] },
    { target: "main_road_se", allowedModes: ["walking", "bike", "car"] },
  ],
  unverified_west: [
    { target: "main_road_nw", allowedModes: ["walking", "bike", "car"] },
    { target: "unverified_center", allowedModes: ["walking", "bike", "car"] },
  ],
  unverified_center: [
    { target: "unverified_west", allowedModes: ["walking", "bike", "car"] },
    { target: "unverified_east", allowedModes: ["walking", "bike", "car"] },
  ],
  unverified_east: [
    { target: "unverified_center", allowedModes: ["walking", "bike", "car"] },
  ],
};

function findClosestNode(point: LatLng): string {
  let closestKey = "";
  let minDistance = Infinity;

  for (const [key, coord] of Object.entries(ROUTE_NODES)) {
    const dist = haversineMeters(point, coord);
    if (dist < minDistance) {
      minDistance = dist;
      closestKey = key;
    }
  }

  return closestKey;
}

function dijkstra(startKey: string, endKey: string, mode: "walking" | "bike" | "car"): string[] {
  if (startKey === endKey) return [startKey];

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const key of Object.keys(ROUTE_NODES)) {
    distances[key] = Infinity;
    previous[key] = null;
    unvisited.add(key);
  }

  distances[startKey] = 0;

  while (unvisited.size > 0) {
    let currentKey: string | null = null;
    let minDistance = Infinity;

    for (const key of unvisited) {
      if (distances[key] < minDistance) {
        minDistance = distances[key];
        currentKey = key;
      }
    }

    if (currentKey === null || currentKey === endKey) {
      break;
    }

    unvisited.delete(currentKey);

    const neighbors = ROUTE_EDGES[currentKey] || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.target)) continue;
      
      // Filter out connection if mode of transport is restricted on this edge
      if (!edge.allowedModes.includes(mode)) continue;

      const dist = haversineMeters(ROUTE_NODES[currentKey], ROUTE_NODES[edge.target]);
      const alt = distances[currentKey] + dist;

      if (alt < distances[edge.target]) {
        distances[edge.target] = alt;
        previous[edge.target] = currentKey;
      }
    }
  }

  if (distances[endKey] === Infinity) {
    return []; // No path found
  }

  const path: string[] = [];
  let current: string | null = endKey;
  while (current !== null) {
    path.push(current);
    current = previous[current];
  }

  return path.reverse();
}

/**
 * Finds a road-network route from standard start point to standard end point.
 * Snaps to the nearest road network nodes, traverses edges via Dijkstra (filtering
 * by allowed transport mode), and returns the full polyline plus precise road-travel distance.
 */
export function findRoute(start: LatLng, end: LatLng, mode: "walking" | "bike" | "car" = "walking"): RouteResult {
  const directDist = haversineMeters(start, end);

  // If the target is close (e.g. within 150m), return direct line to avoid detour artifacts
  if (directDist < 150) {
    return {
      polyline: [start, end],
      distanceMeters: Math.round(directDist),
    };
  }

  const startNode = findClosestNode(start);
  const endNode = findClosestNode(end);

  const nodePath = dijkstra(startNode, endNode, mode);

  if (nodePath.length === 0) {
    return {
      polyline: [start, end],
      distanceMeters: Math.round(directDist),
    };
  }

  // Build the complete polyline path
  const polyline: LatLng[] = [start];
  for (const nodeKey of nodePath) {
    polyline.push(ROUTE_NODES[nodeKey]);
  }
  polyline.push(end);

  // Calculate actual distance along the route
  let distanceMeters = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    distanceMeters += haversineMeters(polyline[i], polyline[i + 1]);
  }

  return {
    polyline,
    distanceMeters: Math.round(distanceMeters),
  };
}
