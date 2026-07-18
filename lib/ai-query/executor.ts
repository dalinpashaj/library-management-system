import { prisma } from "@/lib/db";
import type { ParsedQuery } from "./types";

export async function executeQuery(parsed: ParsedQuery): Promise<{ data: unknown; summary: string }> {
  const { intent, params } = parsed;

  switch (intent) {
    case "most_books_owner": {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, _count: { select: { books: true } } },
        orderBy: { books: { _count: "desc" } },
        take: 1,
      });
      const top = users[0];
      if (!top) return { data: [], summary: "No users found." };
      return {
        data: top,
        summary: `${top.name} owns the most books with ${top._count.books} book(s).`,
      };
    }

    case "most_popular_book": {
      const books = await prisma.book.groupBy({
        by: ["title", "author"],
        _count: { title: true },
        orderBy: { _count: { title: "desc" } },
        take: 1,
      });
      const top = books[0];
      if (!top) return { data: [], summary: "No books found." };
      return {
        data: top,
        summary: `"${top.title}" by ${top.author} appears most often (${top._count.title} copy/copies).`,
      };
    }

    case "most_expensive_books": {
      const n = Number(params.n ?? 5);
      const books = await prisma.book.findMany({
        include: { owner: { select: { name: true } } },
        orderBy: { price: "desc" },
        take: n,
      });
      if (books.length === 0) return { data: [], summary: "No books found." };
      const summary =
        n === 1
          ? `The most expensive book is "${books[0].title}" by ${books[0].author} at $${books[0].price.toFixed(2)}.`
          : `Here are the ${books.length} most expensive book(s), sorted by price (highest first).`;
      return { data: books, summary };
    }

    case "most_highly_rated_books": {
      const n = Number(params.n ?? 5);
      const books = await prisma.book.findMany({
        where: { rating: { not: null } },
        include: { owner: { select: { name: true } } },
        orderBy: { rating: "desc" },
        take: n,
      });
      if (books.length === 0) return { data: [], summary: "No rated books found." };
      const summary =
        n === 1
          ? `The highest rated book is "${books[0].title}" by ${books[0].author} at ${books[0].rating}/5.`
          : `Here are the ${books.length} highest rated book(s), sorted by rating (highest first).`;
      return { data: books, summary };
    }

    case "longest_books": {
      const n = Number(params.n ?? 5);
      const books = await prisma.book.findMany({
        where: { totalPages: { not: null } },
        include: { owner: { select: { name: true } } },
        orderBy: { totalPages: "desc" },
        take: n,
      });
      if (books.length === 0) return { data: [], summary: "No books with page counts found." };
      const summary =
        n === 1
          ? `The longest book is "${books[0].title}" by ${books[0].author} at ${books[0].totalPages} pages.`
          : `Here are the ${books.length} longest book(s), sorted by page count (highest first).`;
      return { data: books, summary };
    }

    case "shortest_books": {
      const n = Number(params.n ?? 5);
      const books = await prisma.book.findMany({
        where: { totalPages: { not: null } },
        include: { owner: { select: { name: true } } },
        orderBy: { totalPages: "asc" },
        take: n,
      });
      if (books.length === 0) return { data: [], summary: "No books with page counts found." };
      const summary =
        n === 1
          ? `The shortest book is "${books[0].title}" by ${books[0].author} at ${books[0].totalPages} pages.`
          : `Here are the ${books.length} shortest book(s), sorted by page count (lowest first).`;
      return { data: books, summary };
    }

    case "user_count": {
      const count = await prisma.user.count();
      return { data: { count }, summary: `There are ${count} registered user(s) in the system.` };
    }

    case "book_count": {
      const count = await prisma.book.count();
      return { data: { count }, summary: `There are ${count} book(s) in the library.` };
    }

    case "books_by_genre": {
      const genre = String(params.genre ?? "");
      const books = await prisma.book.findMany({
        where: { genre: { contains: genre, mode: "insensitive" } },
        include: { owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      return {
        data: books,
        summary: `Found ${books.length} book(s) in the "${genre}" genre.`,
      };
    }

    case "books_by_status": {
      const status = String(params.status ?? "want_to_read") as "reading" | "completed" | "want_to_read";
      const books = await prisma.book.findMany({
        where: { readingStatus: status },
        include: { owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      const label = { reading: "Reading", completed: "Completed", want_to_read: "Want to Read" }[status];
      return { data: books, summary: `Found ${books.length} book(s) with status "${label}".` };
    }

    case "books_by_author": {
      const author = String(params.author ?? "");
      const books = await prisma.book.findMany({
        where: { author: { contains: author, mode: "insensitive" } },
        include: { owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      return { data: books, summary: `Found ${books.length} book(s) by "${author}".` };
    }

    case "top_n_books": {
      const n = Number(params.n ?? 5);
      const books = await prisma.book.findMany({
        include: { owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: n,
      });
      return { data: books, summary: `Here are the ${books.length} most recently added book(s).` };
    }

    case "genre_breakdown": {
      const groups = await prisma.book.groupBy({
        by: ["genre"],
        _count: { genre: true },
        orderBy: { _count: { genre: "desc" } },
      });
      const summary = groups.map((g) => `${g.genre}: ${g._count.genre}`).join(", ");
      return { data: groups, summary: `Genre breakdown — ${summary}.` };
    }

    case "status_breakdown": {
      const groups = await prisma.book.groupBy({
        by: ["readingStatus"],
        _count: { readingStatus: true },
        orderBy: { _count: { readingStatus: "desc" } },
      });
      const labels: Record<string, string> = {
        reading: "Reading",
        completed: "Completed",
        want_to_read: "Want to Read",
      };
      const summary = groups.map((g) => `${labels[g.readingStatus] ?? g.readingStatus}: ${g._count.readingStatus}`).join(", ");
      return { data: groups, summary: `Status breakdown — ${summary}.` };
    }

    case "recent_books": {
      const n = Number(params.n ?? 5);
      const books = await prisma.book.findMany({
        include: { owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: n,
      });
      return { data: books, summary: `Here are the ${books.length} most recently added book(s).` };
    }

    default:
      return { data: null, summary: "Unknown intent." };
  }
}
