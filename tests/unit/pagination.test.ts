import { describe, it, expect } from "vitest";
import { parsePaginationInt } from "../../lib/pagination";

describe("parsePaginationInt", () => {
  it("parses a valid numeric string", () => {
    expect(parsePaginationInt("3", 1)).toBe(3);
  });

  it("falls back to the default for a non-numeric string", () => {
    expect(parsePaginationInt("abc", 1)).toBe(1);
  });

  it("falls back to the default for an empty string", () => {
    expect(parsePaginationInt("", 1)).toBe(1);
  });

  it("falls back to the default for null/undefined", () => {
    expect(parsePaginationInt(null, 1)).toBe(1);
    expect(parsePaginationInt(undefined, 1)).toBe(1);
  });

  it("clamps below the minimum", () => {
    expect(parsePaginationInt("0", 1)).toBe(1);
    expect(parsePaginationInt("-5", 1)).toBe(1);
  });

  it("clamps above the max when provided", () => {
    expect(parsePaginationInt("500", 20, { max: 100 })).toBe(100);
  });

  it("respects a custom min", () => {
    expect(parsePaginationInt("2", 5, { min: 3 })).toBe(3);
  });
});
