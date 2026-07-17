import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { ReadingStatus } from "@prisma/client";

const bookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  genre: z.string().min(1).max(100),
  price: z.number().min(0).optional().default(0),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  readingStatus: z.nativeEnum(ReadingStatus).optional().default(ReadingStatus.want_to_read),
});

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;
  const genre = searchParams.get("genre");
  const status = searchParams.get("status") as ReadingStatus | null;
  const search = searchParams.get("search");

  const isAdmin = session!.user.role === "admin";

  const where = {
    ...(isAdmin ? {} : { ownerId: session!.user.id }),
    ...(genre ? { genre } : {}),
    ...(status ? { readingStatus: status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { author: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.book.count({ where }),
  ]);

  return NextResponse.json({ books, total, page, limit });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: { ...parsed.data, ownerId: session!.user.id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(book, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
