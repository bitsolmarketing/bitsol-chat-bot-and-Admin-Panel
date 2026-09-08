import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canAccessAdmin, canAccessDepartment } from "@/lib/auth";
import { logEvent } from "@/lib/notify";
import { deleteTemplate } from "@/lib/whatsapp/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit the local-only fields of a template, or delete it from Meta.
 *
 * The body, header and footer are deliberately not editable: Meta approved
 * those exact words, and changing them here would leave the console showing
 * something different from what recipients actually receive. Editing a
 * template's content means submitting a new one.
 */
const patchSchema = z.object({
  /** Display name in the console. Meta never sees it. */
  name: z.string().min(1).max(120).optional(),
  /** Which business owns the template. Null leaves it available to both. */
  department: z.enum(["MARKETING", "INSTITUTE"]).nullable().optional(),
  /** Labels for `{{1}}`, `{{2}}`… shown in the broadcast composer. */
  variables: z.array(z.string().max(60)).max(20).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session)) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid update." }, { status: 400 });
  }
  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const template = await prisma.whatsappTemplate.findUnique({ where: { id } });
  if (!template) return Response.json({ error: "Template not found." }, { status: 404 });

  // Both the template's current owner and the business it is being handed to
  // have to be in reach, or a department-scoped user could move a template out
  // of the other business's list.
  if (template.department && !canAccessDepartment(session, template.department)) {
    return Response.json({ error: "That template belongs to the other business." }, { status: 403 });
  }
  if (data.department && !canAccessDepartment(session, data.department)) {
    return Response.json({ error: "That business is not yours to assign to." }, { status: 403 });
  }

  await prisma.whatsappTemplate.update({ where: { id }, data });

  await logEvent({
    action: "template.updated",
    department: data.department ?? template.department ?? undefined,
    entity: "whatsappTemplate",
    entityId: id,
    message: `${session.name} updated the template "${template.metaName}".`,
    metadata: data,
    userId: session.sub,
  });

  return Response.json({ ok: true });
}

/**
 * Delete a template from Meta and from the local mirror.
 *
 * Meta deletes every language variant sharing the name — its API takes a name,
 * not an id. Local rows for the other languages are removed to match, because
 * leaving them behind would offer the composer templates that no longer exist.
 *
 * A template that was never submitted is only a local row, so it is removed
 * without a Graph call.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session)) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.whatsappTemplate.findUnique({ where: { id } });
  if (!template) return Response.json({ error: "Template not found." }, { status: 404 });

  if (template.department && !canAccessDepartment(session, template.department)) {
    return Response.json({ error: "That template belongs to the other business." }, { status: 403 });
  }

  if (template.metaId) {
    const removed = await deleteTemplate(template.metaName);
    if (!removed.ok) {
      return Response.json(
        { error: removed.error ?? "Meta refused to delete the template." },
        { status: 502 }
      );
    }
  }

  const { count } = await prisma.whatsappTemplate.deleteMany({
    where: template.metaId ? { metaName: template.metaName } : { id },
  });

  await logEvent({
    level: "WARN",
    action: "template.deleted",
    department: template.department ?? undefined,
    entity: "whatsappTemplate",
    entityId: id,
    message: `${session.name} deleted the template "${template.metaName}" (${count} language variant${count === 1 ? "" : "s"}).`,
    userId: session.sub,
  });

  return Response.json({ ok: true, deleted: count });
}
