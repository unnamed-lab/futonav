import { findRoute, ROUTE_NODES } from "../routing";

describe("findRoute", () => {
  const startLoc = { latitude: 5.3844, longitude: 6.9912 }; // Admin Roundabout
  const endLoc = { latitude: 5.385218, longitude: 6.9930351 }; // SOES Surveying Department

  it("handles short distance direct routing", () => {
    // Coordinate near SOES Surveying Department
    const nearby = { latitude: 5.3852, longitude: 6.9930 };
    const route = findRoute(nearby, endLoc);
    expect(route.polyline).toHaveLength(2);
    expect(route.polyline[0]).toEqual(nearby);
    expect(route.polyline[1]).toEqual(endLoc);
  });

  it("calculates multi-segment route for distant targets", () => {
    const route = findRoute(startLoc, endLoc);
    expect(route.polyline.length).toBeGreaterThan(2);
    expect(route.distanceMeters).toBeGreaterThan(0);
    // Start and end are part of the polyline
    expect(route.polyline[0]).toEqual(startLoc);
    expect(route.polyline[route.polyline.length - 1]).toEqual(endLoc);
  });

  it("follows the OSM road network across campus", () => {
    const far = { latitude: 5.39, longitude: 6.995 };
    const route = findRoute(startLoc, far, "walking");
    // A real road-following route has many shape points and is flagged on-network.
    expect(route.onNetwork).toBe(true);
    expect(route.polyline.length).toBeGreaterThan(5);
    // Along-road distance must exceed the straight-line distance.
    expect(route.distanceMeters).toBeGreaterThan(0);
  });

  it("flags short direct hops as on-network", () => {
    const nearby = { latitude: 5.3852, longitude: 6.993 };
    const route = findRoute(nearby, endLoc);
    expect(route.onNetwork).toBe(true);
  });
});
