"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReadingStatus } from "@prisma/client";

interface BookFormProps {
  bookId?: string;
  initial?: {
    title: string;
    author: string;
    genre: string;
    price: number;
    rating: number | null;
    totalPages: number | null;
    currentPage: number | null;
    readingStatus: ReadingStatus;
  };
}

interface BookSearchResult {
  title: string;
  author: string;
  totalPages: number | null;
  coverUrl: string | null;
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
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [totalPages, setTotalPages] = useState(initial?.totalPages != null ? String(initial.totalPages) : "");
  const [currentPage, setCurrentPage] = useState(initial?.currentPage != null ? String(initial.currentPage) : "");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [customGenre, setCustomGenre] = useState(
    initial?.genre && !COMMON_GENRES.includes(initial.genre) ? initial.genre : ""
  );
  const [useCustomGenre, setUseCustomGenre] = useState(
    Boolean(initial?.genre && !COMMON_GENRES.includes(initial.genre))
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveGenre = useCustomGenre ? customGenre : form.genre;

  useEffect(() => {
    if (isEdit) return;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }

    setSearching(true);
    setSearchError("");

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/book-search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) {
          setSearchResults([]);
          setSearchError("Search is unavailable right now — you can still fill in the details below yourself.");
          return;
        }
        const data = await res.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setSearchResults([]);
        setSearchError("Search is unavailable right now — you can still fill in the details below yourself.");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isEdit]);

  function handleSelectResult(result: BookSearchResult) {
    setForm((f) => ({ ...f, title: result.title, author: result.author }));
    if (result.totalPages != null) {
      setTotalPages(String(result.totalPages));
    }
    setCoverUrl(result.coverUrl);
    setSearchResults([]);
    setSearchQuery("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!effectiveGenre.trim()) {
      setError("Please select or enter a genre.");
      return;
    }

    const parsedPrice = price.trim() === "" ? 0 : Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a positive number.");
      return;
    }

    const parsedTotalPages = totalPages.trim() === "" ? null : Number(totalPages);
    if (parsedTotalPages !== null && (!Number.isInteger(parsedTotalPages) || parsedTotalPages <= 0)) {
      setError("Total pages must be a positive whole number.");
      return;
    }

    const parsedCurrentPage = currentPage.trim() === "" ? null : Number(currentPage);
    if (parsedCurrentPage !== null && (!Number.isInteger(parsedCurrentPage) || parsedCurrentPage <= 0)) {
      setError("Current page must be a positive whole number.");
      return;
    }

    if (parsedTotalPages !== null && parsedCurrentPage !== null && parsedCurrentPage > parsedTotalPages) {
      setError("Current page cannot exceed total pages.");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      genre: effectiveGenre.trim(),
      price: parsedPrice,
      rating,
      totalPages: parsedTotalPages,
      currentPage: parsedCurrentPage,
      ...(isEdit ? {} : { coverUrl }),
    };
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

    const data = await res.json();
    if (data.milestone === "halfway") {
      setMilestone("halfway");
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

      {milestone === "halfway" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-blue-900">Halfway there — keep going!</p>
          <button
            type="button"
            className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
          >
            Back to My Books
          </button>
        </div>
      )}

      {!isEdit && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-3">
          <div>
            <label className="label" htmlFor="book-search">Search for a book (optional)</label>
            <input
              id="book-search"
              type="text"
              className="input"
              placeholder="e.g. The Hobbit"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Powered by Open Library. Pick a result to pre-fill the fields below, or just type them in yourself.
            </p>
          </div>

          {searching && <p className="text-xs text-gray-500">Searching…</p>}

          {searchError && <p className="text-xs text-red-600">{searchError}</p>}

          {!searching && searchResults.length > 0 && (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white max-h-64 overflow-y-auto">
              {searchResults.map((result, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    {result.coverUrl ? (
                      <>
                        <img
                          src={result.coverUrl}
                          alt=""
                          className="w-10 h-14 object-cover rounded flex-shrink-0 bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="hidden w-10 h-14 rounded flex-shrink-0 bg-gray-200" />
                      </>
                    ) : (
                      <div className="w-10 h-14 rounded flex-shrink-0 bg-gray-200" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                      <p className="text-xs text-gray-600 truncate">{result.author}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
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
        <label className="label" htmlFor="price">Price ($)</label>
        <input
          id="price"
          type="number"
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min={0}
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="totalPages">Total Pages</label>
          <input
            id="totalPages"
            type="number"
            className="input"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            min={1}
            step="1"
            placeholder="e.g. 320"
          />
        </div>
        <div>
          <label className="label" htmlFor="currentPage">Current Page</label>
          <input
            id="currentPage"
            type="number"
            className="input"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            min={1}
            step="1"
            placeholder="e.g. 120"
          />
        </div>
      </div>

      <div>
        <label className="label">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="text-2xl leading-none text-yellow-500"
              onClick={() => setRating(rating === star ? null : star)}
            >
              {rating != null && star <= rating ? "★" : "☆"}
            </button>
          ))}
          {rating != null && (
            <button
              type="button"
              className="ml-2 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setRating(null)}
            >
              Clear
            </button>
          )}
        </div>
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
