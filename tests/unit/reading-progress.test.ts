import { describe, it, expect } from "vitest";
import { computeProgressPercent, detectHalfwayMilestone } from "../../lib/reading-progress";

describe("computeProgressPercent", () => {
  it("computes a percentage from currentPage and totalPages", () => {
    expect(computeProgressPercent(150, 300)).toBe(50);
  });

  it("treats a missing currentPage as 0 pages read", () => {
    expect(computeProgressPercent(null, 300)).toBe(0);
    expect(computeProgressPercent(undefined, 300)).toBe(0);
  });

  it("returns null when totalPages is missing", () => {
    expect(computeProgressPercent(150, null)).toBeNull();
    expect(computeProgressPercent(150, undefined)).toBeNull();
  });

  it("returns null when totalPages is zero or negative", () => {
    expect(computeProgressPercent(10, 0)).toBeNull();
    expect(computeProgressPercent(10, -5)).toBeNull();
  });
});

describe("detectHalfwayMilestone", () => {
  it("fires when crossing from 40% to 60%", () => {
    // 40% of 200 pages = 80, 60% of 200 pages = 120
    const milestone = detectHalfwayMilestone(80, 200, 120, 200);
    expect(milestone).toBe("halfway");
  });

  it("does not fire when already past halfway (60% -> 70%)", () => {
    const milestone = detectHalfwayMilestone(120, 200, 140, 200);
    expect(milestone).toBeUndefined();
  });

  it("does not fire when staying below halfway (10% -> 40%)", () => {
    const milestone = detectHalfwayMilestone(20, 200, 80, 200);
    expect(milestone).toBeUndefined();
  });

  it("fires exactly at the 50% boundary", () => {
    const milestone = detectHalfwayMilestone(90, 200, 100, 200);
    expect(milestone).toBe("halfway");
  });

  it("does not fire when moving backwards across 50% (60% -> 40%)", () => {
    const milestone = detectHalfwayMilestone(120, 200, 80, 200);
    expect(milestone).toBeUndefined();
  });

  it("does not fire when there was no prior totalPages to compare against", () => {
    // Book had no page tracking before this edit — nothing to "cross" from.
    const milestone = detectHalfwayMilestone(null, null, 150, 200);
    expect(milestone).toBeUndefined();
  });

  it("does not fire when the new state has no totalPages", () => {
    const milestone = detectHalfwayMilestone(80, 200, 150, null);
    expect(milestone).toBeUndefined();
  });
});
