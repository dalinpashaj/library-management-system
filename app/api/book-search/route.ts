import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { searchOpenLibrary } from "@/lib/open-library";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  const results = await searchOpenLibrary(q);
  return NextResponse.json({ results });
}
