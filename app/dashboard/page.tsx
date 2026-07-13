import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookCard } from "@/components/BookCard";

interface SearchParams {
  genre?: string;
  status?: string;
  search?: string;
  page?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    ownerId: session.user.id,
    ...(searchParams.genre ? { genre: searchParams.genre } : {}),
    ...(searchParams.status ? { readingStatus: searchParams.status as "reading" | "completed" | "want_to_read" } : {}),
    ...(searchParams.search
      ? {
          OR: [
            { title: { contains: searchParams.search, mode: "insensitive" as const } },
            { author: { contains: searchParams.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [books, total, genres] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.count({ where }),
    prisma.book.findMany({
      where: { ownerId: session.user.id },
      select: { genre: true },
      distinct: ["genre"],
      orderBy: { genre: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    sp.delete("page");
    return `/dashboard?${sp.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
          <p className="text-sm text-gray-500 mt-1">{total} book(s) total</p>
        </div>
        <Link href="/dashboard/books/new" className="btn-primary">
          + Add Book
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" action="/dashboard" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="search"
          className="input w-48"
          placeholder="Search title / author…"
          defaultValue={searchParams.search}
        />
        <select name="genre" className="input w-40" defaultValue={searchParams.genre}>
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.genre} value={g.genre}>{g.genre}</option>
          ))}
        </select>
        <select name="status" className="input w-44" defaultValue={searchParams.status}>
          <option value="">All statuses</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="want_to_read">Want to Read</option>
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
        <Link href="/dashboard" className="btn-secondary">Clear</Link>
      </form>

      {books.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No books found.</p>
          <Link href="/dashboard/books/new" className="btn-primary">Add your first book</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })} className="btn-secondary">
              Previous
            </Link>
          )}
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })} className="btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
