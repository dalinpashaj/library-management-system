import { describe, it, expect } from "vitest";
import { isValidReadingStatus } from "../../lib/reading-status";

describe("isValidReadingStatus", () => {
  it.each(["reading", "completed", "want_to_read"])("accepts valid status %s", (status) => {
    expect(isValidReadingStatus(status)).toBe(true);
  });

  it("rejects an unrecognized string", () => {
    expect(isValidReadingStatus("bogus")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(isValidReadingStatus(null)).toBe(false);
    expect(isValidReadingStatus(undefined)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidReadingStatus("")).toBe(false);
  });
});
