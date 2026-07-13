import type { ParsedQuery, QueryIntent } from "./types";

const VALID_INTENTS: QueryIntent[] = [
  "most_books_owner",
  "most_popular_book",
  "books_by_genre",
  "books_by_status",
  "books_by_author",
  "top_n_books",
  "user_count",
  "book_count",
  "genre_breakdown",
  "status_breakdown",
  "recent_books",
];

const SYSTEM_PROMPT = `You are a query classifier for a library management system.
Given a natural language question, respond with a JSON object matching this schema:
{
  "intent": "<one of the valid intents>",
  "params": { "<key>": "<value>" }
}

Valid intents and their params:
- most_books_owner: no params
- most_popular_book: no params
- books_by_genre: { "genre": "<genre name>" }
- books_by_status: { "status": "reading" | "completed" | "want_to_read" }
- books_by_author: { "author": "<author name>" }
- top_n_books: { "n": <number> }
- user_count: no params
- book_count: no params
- genre_breakdown: no params
- status_breakdown: no params
- recent_books: { "n": <number> }

If the question doesn't match any intent, respond with: { "intent": null, "params": {} }
Respond with raw JSON only, no explanation.`;

export async function llmFallback(question: string): Promise<ParsedQuery | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { intent: QueryIntent | null; params: Record<string, string | number> };

    if (!parsed.intent || !VALID_INTENTS.includes(parsed.intent)) return null;

    return { intent: parsed.intent, params: parsed.params ?? {} };
  } catch {
    return null;
  }
}
