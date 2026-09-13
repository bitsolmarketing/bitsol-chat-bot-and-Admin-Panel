import { NextRequest } from "next/server";
import { retrieveKnowledge } from "@/lib/ai";

export const runtime = "nodejs";

/**
 * Natural-language knowledge search.
 *
 *   GET /api/search?q=whatsapp automation price
 *
 * Powers the "Knowledge Search" feature and the admin console's content lookup.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ query, count: 0, results: [] });
  }

  const limit = Math.min(Number(params.get("limit") ?? 10) || 10, 25);
  const results = retrieveKnowledge(query, limit).map((entry) => ({
    id: entry.id,
    category: entry.category,
    kind: entry.kind,
    question: entry.question,
    answer: entry.answer,
  }));

  return Response.json({ query, count: results.length, results });
}
