import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { AdminUserRow } from "@/components/AdminUserRow";

interface SearchParams { search?: string; page?: string }

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = searchParams.search
    ? {
        OR: [
          { name: { contains: searchParams.search, mode: "insensitive" as const } },
          { email: { contains: searchParams.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { books: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">Admin</Link>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-900 font-medium">Users</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
        <p className="text-sm text-gray-500 mt-1">{total} user(s) total</p>
      </div>

      <form method="GET" action="/admin/users" className="flex gap-3 mb-6">
        <input type="text" name="search" className="input w-64" placeholder="Search by name or email…" defaultValue={searchParams.search} />
        <button type="submit" className="btn-secondary">Search</button>
        <Link href="/admin/users" className="btn-secondary">Clear</Link>
      </form>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Books</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Joined</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <AdminUserRow key={user.id} user={user} currentUserId={session.user.id} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-gray-500">No users found.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && <Link href={`/admin/users?page=${page - 1}`} className="btn-secondary">Previous</Link>}
          <span className="flex items-center px-4 text-sm text-gray-600">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`/admin/users?page=${page + 1}`} className="btn-secondary">Next</Link>}
        </div>
      )}
    </div>
  );
}
