import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// Verify bcrypt round-trip — this logic is used in register & authorize
describe("password hashing", () => {
  it("hashes and verifies a password correctly", async () => {
    const password = "mysecretpassword";
    const hashed = await bcrypt.hash(password, 12);
    expect(await bcrypt.compare(password, hashed)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hashed = await bcrypt.hash("correct", 12);
    expect(await bcrypt.compare("wrong", hashed)).toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const hash1 = await bcrypt.hash("same", 12);
    const hash2 = await bcrypt.hash("same", 12);
    expect(hash1).not.toBe(hash2);
  });
});

// Test the authorize guard logic in isolation (no DB needed)
describe("authorize guard", () => {
  const mockFindUnique = vi.fn();

  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  async function fakeAuthorize(
    credentials: { email: string; password: string } | null,
    findUser: typeof mockFindUnique
  ) {
    if (!credentials?.email || !credentials?.password) return null;
    const user = await findUser({ where: { email: credentials.email } });
    if (!user) return null;
    const match = await bcrypt.compare(credentials.password, user.password);
    if (!match) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  it("returns null when credentials are missing", async () => {
    expect(await fakeAuthorize(null, mockFindUnique)).toBeNull();
  });

  it("returns null when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await fakeAuthorize({ email: "x@x.com", password: "pw" }, mockFindUnique)).toBeNull();
  });

  it("returns null when password is wrong", async () => {
    const hashed = await bcrypt.hash("correct", 12);
    mockFindUnique.mockResolvedValue({ id: "1", name: "A", email: "a@a.com", password: hashed, role: "user" });
    expect(await fakeAuthorize({ email: "a@a.com", password: "wrong" }, mockFindUnique)).toBeNull();
  });

  it("returns user object on valid credentials", async () => {
    const hashed = await bcrypt.hash("correct", 12);
    mockFindUnique.mockResolvedValue({ id: "1", name: "Alice", email: "alice@a.com", password: hashed, role: "user" });
    const result = await fakeAuthorize({ email: "alice@a.com", password: "correct" }, mockFindUnique);
    expect(result).toMatchObject({ id: "1", name: "Alice", role: "user" });
  });
});
