import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChannelBadge, PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { isOwn, safeQuery } from "@/lib/admin/queries";
import { cn, formatDateTime, isUrduScript } from "@/lib/utils";

export const metadata = { title: "Conversation" };

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const { data: conversation } = await safeQuery(
    () =>
      prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          tickets: { select: { reference: true, status: true } },
          leads: { select: { id: true, reference: true } },
        },
      }),
    null
  );

  // An archived Institute conversation is not part of this console.
  if (!conversation || !isOwn(conversation.department)) notFound();

  return (
    <>
      <Link
        href="/admin/conversations"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> All conversations
      </Link>

      <PageHeader
        title={conversation.reference}
        description={`${conversation.messages.length} messages · started ${formatDateTime(
          conversation.createdAt
        )} · language ${conversation.language}`}
        actions={<ChannelBadge value={conversation.channel} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="scroll-slim max-h-[70dvh] space-y-4 overflow-y-auto p-5 lg:col-span-2">
          {conversation.messages.map((message) => {
            const isUser = message.role === "USER";
            return (
              <div
                key={message.id}
                className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-secondary-foreground"
                  )}
                >
                  <p className={cn("whitespace-pre-wrap", isUrduScript(message.content) && "urdu")}>
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatDateTime(message.createdAt)}
                    {message.latencyMs ? ` · ${message.latencyMs}ms` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>

        <div className="space-y-4">
          {conversation.channel === "WHATSAPP" && conversation.contactPhone && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">WhatsApp contact</h2>
              <dl className="space-y-2 text-sm">
                <Detail label="Name" value={conversation.contactName ?? "Not shared"} />
                <Detail label="Number" value={conversation.contactPhone} />
              </dl>
              <a
                href={`https://wa.me/${conversation.contactPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Reply on WhatsApp
              </a>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Free-form replies are only possible within 24 hours of their last message.
                After that WhatsApp requires an approved template.
              </p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Outcome</h2>
            <dl className="space-y-2 text-sm">
              <Detail
                label="Handed off"
                value={conversation.handedOff ? "Yes — waiting on a human" : "No"}
              />
              <Detail
                label="Rating"
                value={conversation.rating ? `${conversation.rating} / 5` : "Not rated"}
              />
              <Detail label="Language" value={conversation.language} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Records created</h2>
            <ul className="space-y-1.5 text-xs">
              {conversation.leads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/crm/leads/${lead.id}`}
                    className="font-mono text-primary hover:underline"
                  >
                    {lead.reference}
                  </Link>{" "}
                  <span className="text-muted-foreground">lead</span>
                </li>
              ))}
              {conversation.tickets.map((ticket) => (
                <li key={ticket.reference} className="text-muted-foreground">
                  <span className="font-mono text-foreground">{ticket.reference}</span> ticket ·{" "}
                  {ticket.status}
                </li>
              ))}
              {!conversation.leads.length && !conversation.tickets.length && (
                <li className="text-muted-foreground">Nothing captured from this chat.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </>
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
