import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { canAccessAdmin, canAccessDepartment } from "@/lib/auth";
import { countAudience } from "@/lib/whatsapp/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * How many contacts an audience filter currently matches.
 *
 * Read-only, and the composer calls it on every change to the filter, so the
 * person choosing an audience sees the size of it before committing rather
 * than discovering it in the confirmation dialog.
 */
const schema = z.object({
  department: z.enum(["MARKETING", "INSTITUTE"]),
  includeUnrouted: z.boolean().default(false),
  activeWithinDays: z.number().int().positive().max(3650).nullable().default(null),
  limit: z.number().int().positive().max(5000).nullable().default(null),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session)) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid audience filter." }, { status: 400 });
  }

  if (!canAccessDepartment(session, parsed.data.department)) {
    return Response.json({ error: "That business is not yours." }, { status: 403 });
  }

  return Response.json({ ok: true, count: await countAudience(parsed.data) });
}
