import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ReadingStatus } from "@prisma/client";

// Re-test the same zod schemas used in API routes — ensures validation contracts are correct

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const bookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  genre: z.string().min(1).max(100),
  price: z.number().min(0).optional().default(0),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  readingStatus: z.nativeEnum(ReadingStatus).optional().default(ReadingStatus.want_to_read),
});

describe("register schema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({ name: "Alice", email: "alice@x.com", password: "password1" });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(registerSchema.safeParse({ email: "a@a.com", password: "password1" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ name: "A", email: "not-an-email", password: "password1" }).success).toBe(false);
  });

  it("rejects short password", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@a.com", password: "short" }).success).toBe(false);
  });
});

describe("book schema", () => {
  it("accepts valid book data", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi" });
    expect(result.success).toBe(true);
    expect(result.data?.readingStatus).toBe("want_to_read");
  });

  it("defaults price to 0 when omitted", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi" });
    expect(result.success).toBe(true);
    expect(result.data?.price).toBe(0);
  });

  it("accepts an explicit price", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", price: 18.5 });
    expect(result.success).toBe(true);
    expect(result.data?.price).toBe(18.5);
  });

  it("rejects a negative price", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", price: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts all reading statuses", () => {
    for (const status of ["reading", "completed", "want_to_read"] as ReadingStatus[]) {
      const r = bookSchema.safeParse({ title: "T", author: "A", genre: "G", readingStatus: status });
      expect(r.success).toBe(true);
    }
  });

  it("rejects invalid reading status", () => {
    const r = bookSchema.safeParse({ title: "T", author: "A", genre: "G", readingStatus: "unknown_status" });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(bookSchema.safeParse({ title: "", author: "A", genre: "G" }).success).toBe(false);
  });

  it("leaves rating undefined when omitted", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi" });
    expect(result.success).toBe(true);
    expect(result.data?.rating).toBeUndefined();
  });

  it("accepts an explicit rating between 1 and 5", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", rating: 4 });
    expect(result.success).toBe(true);
    expect(result.data?.rating).toBe(4);
  });

  it("accepts an explicit null rating", () => {
    const result = bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", rating: null });
    expect(result.success).toBe(true);
    expect(result.data?.rating).toBeNull();
  });

  it("rejects a rating of 0", () => {
    expect(bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", rating: 0 }).success).toBe(false);
  });

  it("rejects a rating above 5", () => {
    expect(bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", rating: 6 }).success).toBe(false);
  });

  it("rejects a non-integer rating", () => {
    expect(bookSchema.safeParse({ title: "Dune", author: "Herbert", genre: "SciFi", rating: 3.5 }).success).toBe(false);
  });
});
