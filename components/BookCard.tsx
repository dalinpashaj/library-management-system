"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  rating: number | null;
  totalPages: number | null;
  currentPage: number | null;
  coverUrl: string | null;
  readingStatus: "reading" | "completed" | "want_to_read";
  owner?: { name: string };
}

const STATUS_STYLES = {
  reading: "bg-status-reading text-status-reading-text",
  completed: "bg-status-completed text-status-completed-text",
  want_to_read: "bg-status-want text-status-want-text",
};

const STATUS_LABELS = {
  reading: "Reading",
  completed: "Completed",
  want_to_read: "Want to Read",
};

export function BookCard({ book, showOwner = false }: { book: Book; showOwner?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm(`Delete "${book.title}"?`)) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to delete book.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="card flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {book.coverUrl && (
            <img
              src={book.coverUrl}
              alt=""
              className="w-10 h-14 object-cover rounded flex-shrink-0 bg-cream"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-ink truncate">{book.title}</h3>
            <p className="text-sm text-muted truncate">{book.author}</p>
          </div>
        </div>
        <span className={`badge ${STATUS_STYLES[book.readingStatus]} flex-shrink-0`}>
          {STATUS_LABELS[book.readingStatus]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="badge bg-cream text-muted">{book.genre}</span>
        <span className="text-muted">${book.price.toFixed(2)}</span>
        {book.rating != null && (
          <span className="text-yellow-500" aria-label={`Rated ${book.rating} out of 5`}>
            {"★".repeat(book.rating)}
            {"☆".repeat(5 - book.rating)}
          </span>
        )}
        {showOwner && book.owner && (
          <span className="text-muted">· {book.owner.name}</span>
        )}
      </div>

      {book.totalPages != null && book.currentPage != null && (
        <div>
          <div className="h-1.5 w-full rounded-full bg-divider overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {book.currentPage} / {book.totalPages} pages
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 mt-auto pt-2 border-t border-divider">
        <Link href={`/dashboard/books/${book.id}/edit`} className="btn-secondary text-xs px-3 py-1.5">
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger text-xs px-3 py-1.5"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
