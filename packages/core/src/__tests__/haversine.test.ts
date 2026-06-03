import { haversineMeters } from "../haversine";

describe("haversineMeters", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineMeters({ latitude: 5.3927, longitude: 7.0009 }, { latitude: 5.3927, longitude: 7.0009 })).toBe(0);
  });

  it("computes approximate distance between known points", () => {
    const futo = { latitude: 5.3927, longitude: 7.0009 };
    const imt = { latitude: 5.486, longitude: 7.023 };
    const dist = haversineMeters(futo, imt);
    expect(dist).toBeGreaterThan(10_000);
    expect(dist).toBeLessThan(12_000);
  });

  it("is symmetric", () => {
    const a = { latitude: 5.5, longitude: 7.0 };
    const b = { latitude: 5.3, longitude: 7.1 };
    expect(haversineMeters(a, b)).toBe(haversineMeters(b, a));
  });
});
