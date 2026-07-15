// Builds the offline campus routing graph from OpenStreetMap data.
//
// Queries the Overpass API for every `highway` way inside the campus bounding
// box, then reduces the ways into a connected node/edge graph that the offline
// Dijkstra fallback (src/routing.ts) consumes. Node coordinates and topology
// come straight from OSM, so nothing here is hand-placed — refresh the data by
// re-running `npm run build:graph` in packages/core.
//
// Usage:
//   node scripts/build-campus-graph.mjs [south west north east]
//   node scripts/build-campus-graph.mjs --file <overpass.json>   # offline rebuild
//
// Output: src/data/campusGraph.json

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../src/data/campusGraph.json");

// Default bounding box covering the FUTO campus (south, west, north, east).
const DEFAULT_BBOX = [5.375, 6.978, 5.398, 7.005];

// Transport mode bitmask. Keep in sync with src/routing.ts.
const WALK = 1;
const BIKE = 2;
const CAR = 4;
const ALL = WALK | BIKE | CAR;

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

/**
 * Determines which transport modes are allowed on a way from its OSM tags.
 * Falls back to permissive defaults for drivable road classes.
 */
function modesForWay(tags = {}) {
  const h = tags.highway;
  let modes;

  if (h === "steps") {
    modes = WALK;
  } else if (h === "footway" || h === "pedestrian" || h === "path") {
    modes = WALK | BIKE;
  } else if (h === "cycleway") {
    modes = WALK | BIKE;
  } else if (h === "track") {
    // Unpaved campus tracks: fine on foot/bike, not treated as drivable.
    modes = WALK | BIKE;
  } else {
    // secondary/tertiary/residential/unclassified/service and friends.
    modes = ALL;
  }

  // Explicit access tags override the class-based default.
  if (tags.foot === "no") modes &= ~WALK;
  if (tags.bicycle === "no") modes &= ~BIKE;
  if (
    tags.motor_vehicle === "no" ||
    tags.motorcar === "no" ||
    tags.access === "no" ||
    tags.access === "private"
  ) {
    modes &= ~CAR;
  }

  return modes;
}

async function fetchOverpass(query) {
  let lastErr;
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "futonav-campus-graph/1.0",
        },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) {
        lastErr = new Error(`${mirror} -> HTTP ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("All Overpass mirrors failed");
}

async function main() {
  const fileArg = process.argv.indexOf("--file");
  let bbox = DEFAULT_BBOX;
  let data;

  if (fileArg !== -1) {
    // Offline rebuild from a previously saved Overpass `out geom` JSON dump.
    const path = process.argv[fileArg + 1];
    console.log(`Reading cached Overpass data from ${path}...`);
    data = JSON.parse(readFileSync(path, "utf8"));
    if (data.bbox) bbox = data.bbox;
  } else {
    bbox = process.argv.length >= 6 ? process.argv.slice(2, 6).map(Number) : DEFAULT_BBOX;
    const [s, w, n, e] = bbox;
    const query = `[out:json][timeout:90];(way["highway"](${s},${w},${n},${e}););out geom;`;
    console.log(`Fetching campus highways for bbox [${bbox.join(", ")}]...`);
    data = await fetchOverpass(query);
  }

  const ways = data.elements.filter((el) => el.type === "way");
  console.log(`Received ${ways.length} ways.`);

  /** @type {Record<string, [number, number]>} */
  const nodes = {};
  /** node-pair key -> mode bitmask (deduplicated, modes OR-ed together) */
  const edgeMap = new Map();

  for (const way of ways) {
    const modes = modesForWay(way.tags);
    if (modes === 0) continue;

    const ids = way.nodes || [];
    const geom = way.geometry || [];
    if (ids.length !== geom.length) continue; // guard against malformed data

    for (let i = 0; i < ids.length; i++) {
      const id = String(ids[i]);
      if (!nodes[id]) {
        nodes[id] = [Number(geom[i].lat.toFixed(6)), Number(geom[i].lon.toFixed(6))];
      }
    }

    for (let i = 0; i < ids.length - 1; i++) {
      const a = String(ids[i]);
      const b = String(ids[i + 1]);
      if (a === b) continue;
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      edgeMap.set(key, (edgeMap.get(key) || 0) | modes);
    }
  }

  const edges = [...edgeMap.entries()].map(([key, modes]) => {
    const [a, b] = key.split("|");
    return [a, b, modes];
  });

  const graph = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "OpenStreetMap contributors, via Overpass API",
    bbox,
    modeBits: { walking: WALK, bike: BIKE, car: CAR },
    nodes,
    edges,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(graph));
  console.log(
    `Wrote ${Object.keys(nodes).length} nodes and ${edges.length} edges to ${OUT_PATH}`,
  );
}

main().catch((err) => {
  console.error("Failed to build campus graph:", err);
  process.exit(1);
});
