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
  "How many books are there?",
  "Show genre breakdown",
  "Show books by genre Fantasy",
  "Show the 5 most recent books",
  "How many users are there?",
];

function renderData(data: QueryResult["data"]) {
  if (!data) return null;

  if (Array.isArray(data) && data.length > 0) {
    const columns = Object.keys(data[0]).filter(
      (k) => k !== "_count" && typeof data[0][k] !== "object"
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((key) => (
                <th key={key} className="px-4 py-2 text-left font-medium text-gray-700">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((key) => (
                  <td key={key} className="px-4 py-2 text-gray-800">
                    {row[key] == null ? "—" : String(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!Array.isArray(data) && typeof data === "object" && data !== null) {
    const entries = Object.entries(data).filter(([, v]) => typeof v !== "object");
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([key, val]) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-700 w-1/3">{key}</td>
                <td className="px-4 py-2 text-gray-800">{val == null ? "—" : String(val)}</td>
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
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900">{result.naturalLanguageSummary}</p>
          </div>

          {renderData(result.data)}
        </div>
      )}
    </div>
  );
}
