import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { AIQueryBox } from "@/components/AIQueryBox";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [userCount, bookCount, genreGroups, statusGroups] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.book.groupBy({ by: ["genre"], _count: { genre: true }, orderBy: { _count: { genre: "desc" } }, take: 5 }),
    prisma.book.groupBy({ by: ["readingStatus"], _count: { readingStatus: true } }),
  ]);

  const statusLabels: Record<string, string> = {
    reading: "Reading",
    completed: "Completed",
    want_to_read: "Want to Read",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-sm text-muted mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={userCount} />
        <StatCard label="Total Books" value={bookCount} />
        <StatCard label="Genres" value={genreGroups.length} />
        <StatCard label="Avg Books/User" value={userCount > 0 ? (bookCount / userCount).toFixed(1) : "0"} />
      </div>

      {/* Quick nav */}
      <div className="flex gap-4">
        <Link href="/admin/books" className="btn-primary">Manage Books</Link>
        <Link href="/admin/users" className="btn-secondary">Manage Users</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre breakdown */}
        <div className="card">
          <h2 className="font-heading font-semibold text-ink mb-4">Top Genres</h2>
          <div className="space-y-2">
            {genreGroups.map((g) => (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="text-sm text-ink w-32 truncate">{g.genre}</span>
                <div className="flex-1 bg-cream rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${(g._count.genre / bookCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-8 text-right">{g._count.genre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card">
          <h2 className="font-heading font-semibold text-ink mb-4">Reading Status</h2>
          <div className="space-y-2">
            {statusGroups.map((s) => (
              <div key={s.readingStatus} className="flex items-center gap-3">
                <span className="text-sm text-ink w-32">{statusLabels[s.readingStatus]}</span>
                <div className="flex-1 bg-cream rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${(s._count.readingStatus / bookCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-8 text-right">{s._count.readingStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Query */}
      <div className="card">
        <h2 className="font-heading font-semibold text-ink mb-4">AI Query Agent</h2>
        <p className="text-sm text-muted mb-4">
          Ask questions about the library.
        </p>
        <AIQueryBox />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-bold text-accent">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </div>
  );
}
