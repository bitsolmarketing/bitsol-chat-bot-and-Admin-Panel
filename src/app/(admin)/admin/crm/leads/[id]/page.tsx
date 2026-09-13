import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { ActivityComposer } from "@/components/admin/ActivityComposer";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { safeQuery } from "@/lib/admin/queries";
import { findService } from "@/data/marketing/services";
import { formatDateTime, formatPkr, humanise } from "@/lib/utils";

export const metadata = { title: "Lead" };

const STAGES = [
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST",
] as const;
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const { data } = await safeQuery(
    async () => {
      const [lead, activities] = await Promise.all([
        prisma.marketingLead.findUnique({
          where: { id },
          include: {
            owner: { select: { name: true } },
            conversation: { select: { reference: true } },
            meetings: { orderBy: { preferredDate: "asc" } },
            quotes: { orderBy: { createdAt: "desc" } },
          },
        }),
        prisma.crmActivity.findMany({
          where: { entityType: "MarketingLead", entityId: id },
          orderBy: { createdAt: "desc" },
          include: { owner: { select: { name: true } } },
        }),
      ]);
      return { lead, activities };
    },
    { lead: null, activities: [] as never[] }
  );

  const lead = data.lead;
  if (!lead) notFound();

  const service = lead.serviceSlug ? findService(lead.serviceSlug) : undefined;

  return (
    <>
      <Link
        href="/admin/crm/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> All leads
      </Link>

      <PageHeader
        eyebrow="Lead"
        title={lead.name}
        description={`Lead ${lead.reference} · captured ${formatDateTime(lead.createdAt)} from ${humanise(lead.source)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusSelect entity="leads" id={lead.id} field="stage" value={lead.stage} options={STAGES} />
            <StatusSelect
              entity="leads"
              id={lead.id}
              field="priority"
              value={lead.priority}
              options={PRIORITIES}
            />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Requirements</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{lead.requirements}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Activity & follow-ups</h2>
            <ActivityComposer entityType="MarketingLead" entityId={lead.id} />

            {data.activities.length ? (
              <ul className="mt-4 space-y-3">
                {data.activities.map((activity) => (
                  <li key={activity.id} className="flex gap-3 border-l-2 border-secondary pl-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge value={activity.type} />
                        <span className="text-[11px] text-muted-foreground">
                          {activity.owner?.name ?? "System"} · {formatDateTime(activity.createdAt)}
                        </span>
                        {activity.dueAt && (
                          <span className="text-[11px] font-medium text-accent">
                            Due {formatDateTime(activity.dueAt)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{activity.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                No notes yet. Add the first one after your call.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Contact</h2>
            <dl className="space-y-2.5 text-sm">
              <Row icon={Phone} label="Phone" value={lead.phone || "—"} />
              <Row icon={Mail} label="Email" value={lead.email ?? "—"} />
              <Row icon={Building2} label="Company" value={lead.company ?? "—"} />
              <Row icon={Sparkles} label="Business" value={lead.businessType ?? "—"} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Deal</h2>
            <dl className="space-y-2 text-sm">
              <Detail label="Service" value={service?.name ?? lead.serviceSlug ?? "—"} />
              <Detail label="Budget" value={lead.budget ?? "—"} />
              <Detail label="Timeline" value={lead.timeline ?? "—"} />
              <Detail label="Estimated value" value={formatPkr(Number(lead.estimatedValue ?? 0))} />
              <Detail label="Owner" value={lead.owner?.name ?? "Unassigned"} />
              {lead.lostReason && <Detail label="Lost reason" value={lead.lostReason} />}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Linked records</h2>
            <ul className="space-y-1.5 text-xs">
              <li className="text-muted-foreground">
                Conversation:{" "}
                <span className="font-mono text-foreground">
                  {lead.conversation?.reference ?? "—"}
                </span>
              </li>
              <li className="text-muted-foreground">
                Meetings: <span className="text-foreground">{lead.meetings.length}</span>
              </li>
              <li className="text-muted-foreground">
                Quotations: <span className="text-foreground">{lead.quotes.length}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd className="break-words font-medium">{value}</dd>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
