import { searchPois } from "../search";
import type { Poi } from "@futonav/shared";

const mockPois: Poi[] = [
  {
    id: "1", name: "Computer Science Department", category: "Department",
    latitude: 5.39, longitude: 7.0, description: null, tags: ["CSC", "ICT"],
    imageUrl: null, updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2", name: "University Library", category: "Library",
    latitude: 5.39, longitude: 7.0, description: null, tags: ["library", "books"],
    imageUrl: null, updatedAt: "2024-01-01T00:00:00Z",
  },
];

describe("searchPois", () => {
  it("returns all POIs for empty query", () => {
    expect(searchPois("", mockPois)).toHaveLength(2);
  });

  it("finds by name", () => {
    const results = searchPois("Computer", mockPois);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Computer Science Department");
  });

  it("finds by tag abbreviation", () => {
    const results = searchPois("CSC", mockPois);
    expect(results).toHaveLength(1);
  });

  it("returns empty for no match", () => {
    expect(searchPois("zzzxxx", mockPois)).toHaveLength(0);
  });

  it("is case insensitive", () => {
    expect(searchPois("computer", mockPois)).toHaveLength(1);
  });
});
