import { walkingEtaMinutes, calculateEtaMinutes, formatDistance } from "../eta";

describe("walkingEtaMinutes", () => {
  it("returns 1 for very short distances", () => {
    expect(walkingEtaMinutes(10)).toBe(1);
  });

  it("returns ~8 min for 650 m", () => {
    expect(walkingEtaMinutes(650)).toBe(8);
  });

  it("handles 0 distance", () => {
    expect(walkingEtaMinutes(0)).toBe(1);
  });
});

describe("calculateEtaMinutes", () => {
  it("adds fixed setup overhead for bike and car", () => {
    // ~1000 m: bike model ≈ 4.6 min + 1 setup; car model ≈ 2.7 min + 2 setup
    expect(calculateEtaMinutes(1000, "bike")).toBe(6);
    expect(calculateEtaMinutes(1000, "car")).toBe(5);
  });

  it("returns 0 for negative distance", () => {
    expect(calculateEtaMinutes(-5, "walking")).toBe(0);
  });

  it("trusts a real routing duration when within plausible bounds", () => {
    // 1000 m walking, real duration 780 s (13 min) is within the clamp band.
    expect(calculateEtaMinutes(1000, "walking", 780)).toBe(13);
  });

  it("clamps an implausibly large real duration to the upper bound", () => {
    // 1000 m walking model ≈ 12.5 min; upper clamp is 2.5x ≈ 31 min.
    // A bogus 2-hour duration must be reined in, not shown verbatim.
    expect(calculateEtaMinutes(1000, "walking", 7200)).toBe(31);
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
