import { NextRequest } from "next/server";
import { findService, MARKETING_SERVICES } from "@/data/marketing/services";

export const runtime = "nodejs";

/**
 * Public service catalogue.
 *
 *   GET /api/catalog                 → all services
 *   GET /api/catalog?slug=seo        → one service
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    const item = findService(slug);
    if (!item) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }
    return Response.json({ item });
  }

  return Response.json({ count: MARKETING_SERVICES.length, items: MARKETING_SERVICES });
}
