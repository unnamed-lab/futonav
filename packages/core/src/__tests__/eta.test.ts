import { walkingEtaMinutes, formatDistance } from "../eta";

describe("walkingEtaMinutes", () => {
  it("returns 1 for very short distances", () => {
    expect(walkingEtaMinutes(10)).toBe(1);
  });

  it("returns ~8 min for 650 m at 5 km/h", () => {
    expect(walkingEtaMinutes(650)).toBe(8);
  });

  it("handles 0 distance", () => {
    expect(walkingEtaMinutes(0)).toBe(1);
  });
});

describe("formatDistance", () => {
  it("formats meters under 1000", () => {
    expect(formatDistance(650)).toBe("650 m");
  });

  it("formats kilometers above 1000", () => {
    expect(formatDistance(1200)).toBe("1.20 km");
  });
});
