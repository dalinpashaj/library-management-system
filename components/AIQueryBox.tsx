"use client";

import { useState } from "react";

type RowData = Record<string, string | number | boolean | null>;

interface QueryResult {
  intent: string;
  params: Record<string, string | number>;
  data: RowData[] | RowData | null;
  naturalLanguageSummary: string;
}

const EXAMPLE_QUESTIONS = [
  "Who owns the most books?",
  "Which is the most popular book?",
  "Show the 5 most expensive books",
  "How many books are there?",
  "Show genre breakdown",
  "Show books by genre Fantasy",
  "Show the 5 most recent books",
  "How many users are there?",
];

const BOOK_COLUMNS = ["title", "author", "genre", "price"] as const;

function isBookRow(row: RowData): boolean {
  return "title" in row && "author" in row;
}

function formatCellValue(key: string, value: RowData[string]): string {
  if (value == null) return "—";
  if (key === "price" && typeof value === "number") return `$${value.toFixed(2)}`;
  return String(value);
}

function renderData(data: QueryResult["data"]) {
  if (data == null) return null;

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <p className="py-6 text-center text-sm text-muted">No results found.</p>;
    }

    const columns: string[] = isBookRow(data[0])
      ? [...BOOK_COLUMNS]
      : Object.keys(data[0]).filter((k) => k !== "_count" && typeof data[0][k] !== "object");

    return (
      <div className="overflow-x-auto rounded-lg border border-divider">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream border-b border-divider">
              {columns.map((key) => (
                <th key={key} className="px-4 py-3 text-left font-medium text-muted">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-cream">
                {columns.map((key) => (
                  <td key={key} className="px-4 py-3 text-ink">
                    {formatCellValue(key, row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data).filter(([, v]) => typeof v !== "object");
    return (
      <div className="overflow-x-auto rounded-lg border border-divider">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-divider">
            {entries.map(([key, val]) => (
              <tr key={key}>
                <td className="px-4 py-3 font-medium text-muted w-1/3">{key}</td>
                <td className="px-4 py-3 text-ink">{val == null ? "—" : String(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export function AIQueryBox() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/ai-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Query failed.");
      return;
    }

    setResult(await res.json());
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          placeholder='Ask a question, e.g. "Who owns the most books?"'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="btn-primary" disabled={loading || !question.trim()}>
          {loading ? "…" : "Ask"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            className="text-xs px-2 py-1 bg-cream hover:bg-divider text-muted rounded-full transition-colors"
            onClick={() => setQuestion(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-ink">{result.naturalLanguageSummary}</p>
          </div>

          {renderData(result.data)}
        </div>
      )}
    </div>
  );
}
