import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { ReadingStatus } from "@prisma/client";
import { detectHalfwayMilestone } from "@/lib/reading-progress";

const updateSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    author: z.string().min(1).max(255).optional(),
    genre: z.string().min(1).max(100).optional(),
    price: z.number().min(0).optional(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    totalPages: z.number().int().positive().nullable().optional(),
    currentPage: z.number().int().positive().nullable().optional(),
    readingStatus: z.nativeEnum(ReadingStatus).optional(),
  })
  .refine(
    (data) => data.totalPages == null || data.currentPage == null || data.currentPage <= data.totalPages,
    { message: "Current page cannot exceed total pages.", path: ["currentPage"] }
  );

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

    const effectiveTotalPages = parsed.data.totalPages !== undefined ? parsed.data.totalPages : book.totalPages;
    const effectiveCurrentPage = parsed.data.currentPage !== undefined ? parsed.data.currentPage : book.currentPage;
    const milestone = detectHalfwayMilestone(
      book.currentPage,
      book.totalPages,
      effectiveCurrentPage,
      effectiveTotalPages
    );

    const updated = await prisma.book.update({
      where: { id: params.id },
      data: parsed.data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(milestone ? { ...updated, milestone } : updated);
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
