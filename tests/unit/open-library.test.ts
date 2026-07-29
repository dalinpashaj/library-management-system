import { describe, it, expect, vi, afterEach } from "vitest";
import { mapOpenLibraryDocs, searchOpenLibrary } from "../../lib/open-library";

describe("mapOpenLibraryDocs", () => {
  it("maps a full doc correctly, building the cover URL from cover_i", () => {
    const result = mapOpenLibraryDocs([
      { title: "The Hobbit", author_name: ["J.R.R. Tolkien"], cover_i: 14627509, number_of_pages_median: 310 },
    ]);
    expect(result).toEqual([
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        totalPages: 310,
        coverUrl: "https://covers.openlibrary.org/b/id/14627509-M.jpg",
      },
    ]);
  });

  it("returns null totalPages when number_of_pages_median is missing", () => {
    const result = mapOpenLibraryDocs([{ title: "Some Book", author_name: ["Someone"], cover_i: 123 }]);
    expect(result[0].totalPages).toBeNull();
  });

  it("returns null coverUrl when cover_i is missing, instead of building a broken URL", () => {
    const result = mapOpenLibraryDocs([
      { title: "Some Book", author_name: ["Someone"], number_of_pages_median: 200 },
    ]);
    expect(result[0].coverUrl).toBeNull();
  });

  it("falls back to 'Unknown author' when author_name is missing", () => {
    const result = mapOpenLibraryDocs([{ title: "Anonymous Work" }]);
    expect(result[0].author).toBe("Unknown author");
  });

  it("filters out docs with no title", () => {
    const result = mapOpenLibraryDocs([{ author_name: ["Someone"] }, { title: "Has Title" }]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Has Title");
  });

  it("caps results at 8 even if more docs are passed", () => {
    const docs = Array.from({ length: 20 }, (_, i) => ({ title: `Book ${i}` }));
    expect(mapOpenLibraryDocs(docs)).toHaveLength(8);
  });

  it("returns an empty array for an empty docs array (zero Open Library results)", () => {
    expect(mapOpenLibraryDocs([])).toEqual([]);
  });
});

describe("searchOpenLibrary", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns mapped results on a successful response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        docs: [{ title: "Dune", author_name: ["Frank Herbert"], cover_i: 1, number_of_pages_median: 412 }],
      }),
    }) as unknown as typeof fetch;

    const results = await searchOpenLibrary("dune");
    expect(results).toEqual([
      {
        title: "Dune",
        author: "Frank Herbert",
        totalPages: 412,
        coverUrl: "https://covers.openlibrary.org/b/id/1-M.jpg",
      },
    ]);
  });

  it("returns an empty array (not a throw) when Open Library responds non-ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    await expect(searchOpenLibrary("anything")).resolves.toEqual([]);
  });

  it("returns an empty array (not a throw) when the fetch itself rejects (network error / timeout)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"));
    await expect(searchOpenLibrary("anything")).resolves.toEqual([]);
  });

  it("returns an empty array when Open Library's JSON shape is unexpected (no docs array)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: "shape" }),
    }) as unknown as typeof fetch;
    await expect(searchOpenLibrary("anything")).resolves.toEqual([]);
  });

  it("returns an empty array when the response body isn't valid JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("invalid json");
      },
    }) as unknown as typeof fetch;
    await expect(searchOpenLibrary("anything")).resolves.toEqual([]);
  });
});
