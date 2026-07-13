import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { parseQuery } from "@/lib/ai-query/parser";
import { llmFallback } from "@/lib/ai-query/llm-fallback";
import { executeQuery } from "@/lib/ai-query/executor";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { question } = await req.json() as { question?: string };

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (question.trim().length > 500) {
      return NextResponse.json({ error: "Question too long" }, { status: 400 });
    }

    let parsed = parseQuery(question);

    if (!parsed) {
      parsed = await llmFallback(question);
    }

    if (!parsed) {
      return NextResponse.json({
        intent: "unknown",
        params: {},
        data: null,
        naturalLanguageSummary:
          "I couldn't understand that question. Try asking things like: \"Who owns the most books?\", \"How many books are there?\", or \"Show books by genre Fantasy\".",
      });
    }

    const { data, summary } = await executeQuery(parsed);

    return NextResponse.json({
      intent: parsed.intent,
      params: parsed.params,
      data,
      naturalLanguageSummary: summary,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
