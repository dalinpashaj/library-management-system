"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReadingStatus } from "@prisma/client";

interface BookFormProps {
  bookId?: string;
  initial?: {
    title: string;
    author: string;
    genre: string;
    readingStatus: ReadingStatus;
  };
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  reading: "Currently Reading",
  completed: "Completed",
  want_to_read: "Want to Read",
};

const COMMON_GENRES = [
  "Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance",
  "Historical Fiction", "Literary Fiction", "Horror", "Biography",
  "Non-Fiction", "Self-Help", "Technology", "Classic", "Dystopian", "Other",
];

export function BookForm({ bookId, initial }: BookFormProps) {
  const router = useRouter();
  const isEdit = Boolean(bookId);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    genre: initial?.genre ?? "",
    readingStatus: initial?.readingStatus ?? ReadingStatus.want_to_read,
  });
  const [customGenre, setCustomGenre] = useState(
    initial?.genre && !COMMON_GENRES.includes(initial.genre) ? initial.genre : ""
  );
  const [useCustomGenre, setUseCustomGenre] = useState(
    Boolean(initial?.genre && !COMMON_GENRES.includes(initial.genre))
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveGenre = useCustomGenre ? customGenre : form.genre;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!effectiveGenre.trim()) {
      setError("Please select or enter a genre.");
      return;
    }

    setLoading(true);

    const payload = { ...form, genre: effectiveGenre.trim() };
    const url = isEdit ? `/api/books/${bookId}` : "/api/books";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save book.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          className="input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          maxLength={255}
        />
      </div>

      <div>
        <label className="label" htmlFor="author">Author</label>
        <input
          id="author"
          type="text"
          className="input"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          required
          maxLength={255}
        />
      </div>

      <div>
        <label className="label">Genre</label>
        {!useCustomGenre ? (
          <div className="flex gap-2">
            <select
              className="input flex-1"
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
            >
              <option value="">Select genre…</option>
              {COMMON_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary text-xs px-3"
              onClick={() => setUseCustomGenre(true)}
            >
              Custom
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="Enter genre…"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              maxLength={100}
            />
            <button
              type="button"
              className="btn-secondary text-xs px-3"
              onClick={() => setUseCustomGenre(false)}
            >
              Pick
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="status">Reading Status</label>
        <select
          id="status"
          className="input"
          value={form.readingStatus}
          onChange={(e) => setForm({ ...form, readingStatus: e.target.value as ReadingStatus })}
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Book"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
