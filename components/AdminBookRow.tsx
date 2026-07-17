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
  reading: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  want_to_read: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS = {
  reading: "Reading",
  completed: "Completed",
  want_to_read: "Want to Read",
};

export function AdminBookRow({ book }: { book: Book }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${book.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{book.title}</td>
      <td className="px-4 py-3 text-gray-700">{book.author}</td>
      <td className="px-4 py-3">
        <span className="badge bg-gray-100 text-gray-700">{book.genre}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${STATUS_STYLES[book.readingStatus]}`}>
          {STATUS_LABELS[book.readingStatus]}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700">${book.price.toFixed(2)}</td>
      <td className="px-4 py-3 text-yellow-500">
        {book.rating != null ? (
          <span aria-label={`Rated ${book.rating} out of 5`}>
            {"★".repeat(book.rating)}
            {"☆".repeat(5 - book.rating)}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600 text-xs">
        {book.owner.name}<br />
        <span className="text-gray-400">{book.owner.email}</span>
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
      </td>
    </tr>
  );
}
