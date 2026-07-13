export type QueryIntent =
  | "most_books_owner"
  | "most_popular_book"
  | "books_by_genre"
  | "books_by_status"
  | "books_by_author"
  | "top_n_books"
  | "user_count"
  | "book_count"
  | "genre_breakdown"
  | "status_breakdown"
  | "recent_books";

export interface ParsedQuery {
  intent: QueryIntent;
  params: Record<string, string | number>;
}

export interface QueryResult {
  intent: QueryIntent | "unknown";
  params: Record<string, string | number>;
  data: unknown;
  naturalLanguageSummary: string;
}
