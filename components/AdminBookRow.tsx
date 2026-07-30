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
  readingStatus: "reading" | "completed" | "want_to_read";
  owner: { name: string; email: string };
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

export function AdminBookRow({ book }: { book: Book }) {
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
    <tr className="border-b border-divider hover:bg-cream">
      <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{book.title}</td>
      <td className="px-4 py-3 text-ink">{book.author}</td>
      <td className="px-4 py-3">
        <span className="badge bg-cream text-muted">{book.genre}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${STATUS_STYLES[book.readingStatus]}`}>
          {STATUS_LABELS[book.readingStatus]}
        </span>
      </td>
      <td className="px-4 py-3 text-ink">${book.price.toFixed(2)}</td>
      <td className="px-4 py-3 text-yellow-500">
        {book.rating != null ? (
          <span aria-label={`Rated ${book.rating} out of 5`}>
            {"★".repeat(book.rating)}
            {"☆".repeat(5 - book.rating)}
          </span>
        ) : (
          <span className="text-divider">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted text-xs">
        {book.owner.name}<br />
        <span className="text-muted">{book.owner.email}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link href={`/dashboard/books/${book.id}/edit`} className="btn-secondary text-xs px-2 py-1">
            Edit
          </Link>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger text-xs px-2 py-1">
            {deleting ? "…" : "Delete"}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}
