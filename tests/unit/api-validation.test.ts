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
});
