import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { AdminBookRow } from "@/components/AdminBookRow";

interface SearchParams { search?: string; genre?: string; status?: string; page?: string }

export default async function AdminBooksPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
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
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.book.count({ where }),
    prisma.book.findMany({ select: { genre: true }, distinct: ["genre"], orderBy: { genre: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">Admin</Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-900 font-medium">Books</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">All Books</h1>
          <p className="text-sm text-gray-500 mt-1">{total} book(s) total</p>
        </div>
      </div>

      <form method="GET" action="/admin/books" className="flex flex-wrap gap-3 mb-6">
        <input type="text" name="search" className="input w-48" placeholder="Search…" defaultValue={searchParams.search} />
        <select name="genre" className="input w-40" defaultValue={searchParams.genre}>
          <option value="">All genres</option>
          {genres.map((g) => <option key={g.genre} value={g.genre}>{g.genre}</option>)}
        </select>
        <select name="status" className="input w-44" defaultValue={searchParams.status}>
          <option value="">All statuses</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="want_to_read">Want to Read</option>
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
        <Link href="/admin/books" className="btn-secondary">Clear</Link>
      </form>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Author</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Genre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Rating</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Owner</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <AdminBookRow key={book.id} book={book} />
            ))}
          </tbody>
        </table>
        {books.length === 0 && (
          <div className="py-12 text-center text-gray-500">No books found.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/admin/books?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`} className="btn-secondary">Previous</Link>
          )}
          <span className="flex items-center px-4 text-sm text-gray-600">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/books?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`} className="btn-secondary">Next</Link>
          )}
        </div>
      )}
    </div>
  );
}
