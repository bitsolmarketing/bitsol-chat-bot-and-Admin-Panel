import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/session";
import { loadPermissions, navCounts } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · BITSOL Admin" },
  robots: { index: false, follow: false },
};

/** Admin pages read live data on every request. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole console here so no page can be reached without a session.
  const session = await requireAdmin();

  const [permissions, badges] = await Promise.all([
    loadPermissions(session),
    navCounts(),
  ]);

  return (
    <AdminShell
      user={{ name: session.name, role: session.role }}
      // Only serializable values cross into the client component — the nav
      // tree is built there, since each item carries a Lucide icon function.
      permissions={permissions ? [...permissions] : null}
      badges={badges}
    >
      {children}
    </AdminShell>
  );
}
