import { vi } from "vitest";

// Suppress console.error in tests unless explicitly tested
vi.spyOn(console, "error").mockImplementation(() => {});
