"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user.role === "admin";

  const navLinks = session
    ? [
        { href: "/dashboard", label: "My Books" },
        ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [];

  return (
    <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 h-16 flex items-center px-4 md:px-8 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold text-primary-700">
          <BookOpen className="h-5 w-5" />
          LibraryMS
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-primary-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary text-xs px-3 py-1.5">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-xs px-3 py-1.5">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
