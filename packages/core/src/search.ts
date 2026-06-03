import Fuse from "fuse.js";
import type { Poi } from "@futonav/shared";

const fuseOptions: Fuse.IFuseOptions<Poi> = {
  keys: [
    { name: "name", weight: 2 },
    { name: "tags", weight: 1 },
    { name: "category", weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
};

export function searchPois(query: string, pois: Poi[]): Poi[] {
  if (!query.trim()) return pois;
  const fuse = new Fuse(pois, fuseOptions);
  return fuse.search(query).map((r) => r.item);
}
