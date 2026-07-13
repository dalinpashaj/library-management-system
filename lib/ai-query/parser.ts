import type { ParsedQuery, QueryIntent } from "./types";

interface Rule {
  patterns: RegExp[];
  intent: QueryIntent;
  extractParams?: (match: RegExpMatchArray, question: string) => Record<string, string | number>;
}

const rules: Rule[] = [
  {
    patterns: [
      /who (owns|has) the most books/i,
      /user with the most books/i,
      /which user has (the )?most/i,
    ],
    intent: "most_books_owner",
    extractParams: () => ({}),
  },
  {
    patterns: [
      /most popular book/i,
      /which book (is|appears) (the )?most/i,
      /most common book/i,
    ],
    intent: "most_popular_book",
    extractParams: () => ({}),
  },
  {
    patterns: [/how many users/i, /total (number of )?users/i, /user count/i],
    intent: "user_count",
    extractParams: () => ({}),
  },
  {
    patterns: [/how many books/i, /total (number of )?books/i, /book count/i],
    intent: "book_count",
    extractParams: () => ({}),
  },
  {
    patterns: [
      /books? (in|of) (the )?(genre |category )?(.+)/i,
      /list .*books?.*genre[:\s]+(.+)/i,
    ],
    intent: "books_by_genre",
    extractParams: (match) => {
      const genre = match[4] ?? match[1] ?? "";
      return { genre: genre.trim().replace(/[?.]$/, "") };
    },
  },
  {
    patterns: [
      /books? (with status|that are|marked as|being) (.+)/i,
      /books? (currently )?(.+ing|want.to.read|completed)/i,
    ],
    intent: "books_by_status",
    extractParams: (_match, question) => {
      if (/reading/i.test(question)) return { status: "reading" };
      if (/completed?/i.test(question)) return { status: "completed" };
      if (/want.to.read/i.test(question)) return { status: "want_to_read" };
      return { status: "want_to_read" };
    },
  },
  {
    patterns: [
      /books? by (author )?(.+)/i,
      /who wrote (.+)/i,
    ],
    intent: "books_by_author",
    extractParams: (match) => {
      const author = match[2] ?? match[1] ?? "";
      return { author: author.trim().replace(/[?.]$/, "") };
    },
  },
  {
    patterns: [
      /top (\d+) books?/i,
      /show (\d+) books?/i,
      /first (\d+) books?/i,
      /(\d+) most recent books?/i,
    ],
    intent: "top_n_books",
    extractParams: (match) => ({ n: parseInt(match[1] ?? "5") }),
  },
  {
    patterns: [/genre (breakdown|distribution|stats)/i, /books? per genre/i],
    intent: "genre_breakdown",
    extractParams: () => ({}),
  },
  {
    patterns: [/status (breakdown|distribution|stats)/i, /books? per status/i],
    intent: "status_breakdown",
    extractParams: () => ({}),
  },
  {
    patterns: [/recent books?/i, /latest books?/i, /newest books?/i],
    intent: "recent_books",
    extractParams: () => ({ n: 5 }),
  },
];

export function parseQuery(question: string): ParsedQuery | null {
  const q = question.trim();

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const match = q.match(pattern);
      if (match) {
        const params = rule.extractParams ? rule.extractParams(match, q) : {};
        return { intent: rule.intent, params };
      }
    }
  }

  return null;
}
