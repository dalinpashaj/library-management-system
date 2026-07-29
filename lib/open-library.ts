const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const RESULT_LIMIT = 8;
const USER_AGENT = "LibraryManagementSystem/1.0 (educational project; add-book search feature)";

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
}

export interface BookSearchResult {
  title: string;
  author: string;
  totalPages: number | null;
  coverUrl: string | null;
}

export function mapOpenLibraryDocs(docs: OpenLibraryDoc[]): BookSearchResult[] {
  return docs
    .filter((doc) => typeof doc.title === "string" && doc.title.trim().length > 0)
    .slice(0, RESULT_LIMIT)
    .map((doc) => ({
      title: doc.title as string,
      author: doc.author_name?.[0] ?? "Unknown author",
      totalPages: typeof doc.number_of_pages_median === "number" ? doc.number_of_pages_median : null,
      coverUrl:
        typeof doc.cover_i === "number" ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    }));
}

export async function searchOpenLibrary(query: string): Promise<BookSearchResult[]> {
  try {
    const url = `${OPEN_LIBRARY_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${RESULT_LIMIT}&fields=title,author_name,cover_i,number_of_pages_median`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const docs = Array.isArray(data?.docs) ? data.docs : [];

    return mapOpenLibraryDocs(docs);
  } catch {
    return [];
  }
}
