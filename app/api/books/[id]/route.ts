import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { ReadingStatus } from "@prisma/client";

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  author: z.string().min(1).max(255).optional(),
  genre: z.string().min(1).max(100).optional(),
  readingStatus: z.nativeEnum(ReadingStatus).optional(),
});

async function resolveBook(id: string, userId: string, isAdmin: boolean) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return { book: null, forbidden: false };
  if (!isAdmin && book.ownerId !== userId) return { book: null, forbidden: true };
  return { book, forbidden: false };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { book, forbidden } = await resolveBook(
    params.id,
    session!.user.id,
    session!.user.role === "admin"
  );
  if (forbidden) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const full = await prisma.book.findUnique({
    where: { id: params.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(full);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { book, forbidden } = await resolveBook(
    params.id,
    session!.user.id,
    session!.user.role === "admin"
  );
  if (forbidden) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.book.update({
      where: { id: params.id },
      data: parsed.data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { book, forbidden } = await resolveBook(
    params.id,
    session!.user.id,
    session!.user.role === "admin"
  );
  if (forbidden) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.book.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
