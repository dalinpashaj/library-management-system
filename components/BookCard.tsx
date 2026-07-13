"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  readingStatus: "reading" | "completed" | "want_to_read";
  owner?: { name: string };
}

const STATUS_STYLES = {
  reading: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  want_to_read: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS = {
  reading: "Reading",
  completed: "Completed",
  want_to_read: "Want to Read",
};

export function BookCard({ book, showOwner = false }: { book: Book; showOwner?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${book.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
          <p className="text-sm text-gray-600 truncate">{book.author}</p>
        </div>
        <span className={`badge ${STATUS_STYLES[book.readingStatus]} flex-shrink-0`}>
          {STATUS_LABELS[book.readingStatus]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="badge bg-gray-100 text-gray-700">{book.genre}</span>
        {showOwner && book.owner && (
          <span className="text-gray-400">· {book.owner.name}</span>
        )}
      </div>

      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
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
