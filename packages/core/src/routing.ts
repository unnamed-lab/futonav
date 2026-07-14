import { haversineMeters } from "./haversine";
import type { LatLng } from "./haversine";

export interface RouteResult {
  polyline: LatLng[];
  distanceMeters: number;
}

// Key FUTO campus waypoints representing the road network layout
export const ROUTE_NODES: Record<string, LatLng> = {
  admin_roundabout: { latitude: 5.3844, longitude: 6.9912 },
  gst_junction: { latitude: 5.3855, longitude: 6.9918 },
  saat_junction: { latitude: 5.3840, longitude: 6.9934 },
  soes_junction: { latitude: 5.3851, longitude: 6.9932 },
  sosc_junction: { latitude: 5.3822, longitude: 6.9958 },
  north_road: { latitude: 5.3880, longitude: 6.9960 },
  unverified_center: { latitude: 5.3920, longitude: 7.0015 },
  unverified_east: { latitude: 5.3935, longitude: 7.0035 },
  unverified_west: { latitude: 5.3910, longitude: 7.0005 },
};

// Road connections (bidirectional edges) between waypoints
const ROUTE_EDGES: Record<string, string[]> = {
  admin_roundabout: ["gst_junction", "saat_junction", "soes_junction"],
  gst_junction: ["admin_roundabout", "saat_junction", "north_road"],
  saat_junction: ["admin_roundabout", "gst_junction", "soes_junction", "sosc_junction"],
  soes_junction: ["admin_roundabout", "saat_junction", "gst_junction"],
  sosc_junction: ["saat_junction", "north_road"],
  north_road: ["gst_junction", "sosc_junction", "unverified_center"],
  unverified_center: ["north_road", "unverified_east", "unverified_west"],
  unverified_east: ["unverified_center"],
  unverified_west: ["unverified_center"],
};

// Find the node in our graph that is closest to a given coordinate
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

// Compute shortest path between two nodes in the waypoint graph using Dijkstra's algorithm
function dijkstra(startKey: string, endKey: string): string[] {
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
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor)) continue;

      const dist = haversineMeters(ROUTE_NODES[currentKey], ROUTE_NODES[neighbor]);
      const alt = distances[currentKey] + dist;

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentKey;
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
 * Snaps to the nearest road network nodes, traverses edges via Dijkstra, and
 * returns the full polyline plus precise road-travel distance in meters.
 */
export function findRoute(start: LatLng, end: LatLng): RouteResult {
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

  const nodePath = dijkstra(startNode, endNode);

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
