import { describe, it, expect } from "vitest";
import { parseQuery } from "../../lib/ai-query/parser";

describe("parseQuery — rule-based intent parser", () => {
  describe("most_books_owner", () => {
    it.each([
      "Who owns the most books?",
      "who has the most books",
      "Which user has most books?",
      "user with the most books",
    ])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("most_books_owner");
    });
  });

  describe("most_popular_book", () => {
    it.each([
      "What is the most popular book?",
      "which book is the most common",
      "Which is the most popular book?",
    ])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("most_popular_book");
    });
  });

  describe("most_expensive_books", () => {
    it("extracts n from 'show the 5 most expensive books'", () => {
      const result = parseQuery("Show the 5 most expensive books");
      expect(result?.intent).toBe("most_expensive_books");
      expect(result?.params.n).toBe(5);
    });

    it("defaults n to 1 for singular 'most expensive book'", () => {
      const result = parseQuery("What is the most expensive book?");
      expect(result?.intent).toBe("most_expensive_books");
      expect(result?.params.n).toBe(1);
    });

    it("defaults n to 5 for plural with no number", () => {
      const result = parseQuery("Show me the most expensive books");
      expect(result?.intent).toBe("most_expensive_books");
      expect(result?.params.n).toBe(5);
    });

    it.each(["priciest books", "highest-priced books"])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("most_expensive_books");
    });
  });

  describe("most_highly_rated_books", () => {
    it("extracts n from 'show the 5 highest rated books'", () => {
      const result = parseQuery("Show the 5 highest rated books");
      expect(result?.intent).toBe("most_highly_rated_books");
      expect(result?.params.n).toBe(5);
    });

    it("defaults n to 1 for singular 'highest rated book'", () => {
      const result = parseQuery("What is the highest rated book?");
      expect(result?.intent).toBe("most_highly_rated_books");
      expect(result?.params.n).toBe(1);
    });

    it("defaults n to 5 for plural with no number", () => {
      const result = parseQuery("Show me the top rated books");
      expect(result?.intent).toBe("most_highly_rated_books");
      expect(result?.params.n).toBe(5);
    });

    it.each(["my best books", "best rated books", "5 star books"])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("most_highly_rated_books");
    });
  });

  describe("user_count", () => {
    it.each([
      "How many users are there?",
      "total number of users",
      "user count",
    ])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("user_count");
    });
  });

  describe("book_count", () => {
    it.each([
      "How many books are there?",
      "total number of books",
      "book count",
    ])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("book_count");
    });
  });

  describe("books_by_genre", () => {
    it("extracts genre param", () => {
      const result = parseQuery("books in genre Fantasy");
      expect(result?.intent).toBe("books_by_genre");
      expect(result?.params.genre).toMatch(/fantasy/i);
    });
  });

  describe("books_by_status", () => {
    it("maps 'reading' status", () => {
      const result = parseQuery("books that are reading");
      expect(result?.intent).toBe("books_by_status");
      expect(result?.params.status).toBe("reading");
    });

    it("maps 'completed' status", () => {
      const result = parseQuery("books marked as completed");
      expect(result?.intent).toBe("books_by_status");
      expect(result?.params.status).toBe("completed");
    });
  });

  describe("top_n_books", () => {
    it("extracts n param", () => {
      const result = parseQuery("top 5 books");
      expect(result?.intent).toBe("top_n_books");
      expect(result?.params.n).toBe(5);
    });

    it("extracts n from 'show 10 books'", () => {
      const result = parseQuery("show 10 books");
      expect(result?.intent).toBe("top_n_books");
      expect(result?.params.n).toBe(10);
    });
  });

  describe("genre_breakdown", () => {
    it.each(["genre breakdown", "books per genre", "genre distribution"])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("genre_breakdown");
    });
  });

  describe("status_breakdown", () => {
    it.each(["status breakdown", "books per status"])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("status_breakdown");
    });
  });

  describe("recent_books", () => {
    it.each(["recent books", "latest books", "newest books"])('matches "%s"', (q) => {
      expect(parseQuery(q)?.intent).toBe("recent_books");
    });
  });

  describe("unrecognised questions", () => {
    it("returns null for gibberish", () => {
      expect(parseQuery("flargleblargle")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseQuery("")).toBeNull();
    });

    it("returns null for unrelated questions", () => {
      expect(parseQuery("What is the weather today?")).toBeNull();
    });
  });
});
