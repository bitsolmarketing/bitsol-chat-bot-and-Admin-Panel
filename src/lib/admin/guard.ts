import { getSession } from "@/lib/session";
import { canAccessAdmin, type SessionPayload } from "@/lib/auth";
import { loadPermissions } from "./queries";

/**
 * Session check for admin API routes that need a specific permission.
 * Admin and Super Admin pass everything; other roles need the permission key.
 */
export async function requirePermission(
  permission: string
): Promise<{ session: SessionPayload } | { response: Response }> {
  const session = await getSession();
  if (!session || !canAccessAdmin(session)) {
    return { response: Response.json({ error: "Not authorised." }, { status: 401 }) };
  }
  const permissions = await loadPermissions(session);
  if (permissions && !permissions.has(permission)) {
    return { response: Response.json({ error: "Your role cannot do this." }, { status: 403 }) };
  }
  return { session };
}
