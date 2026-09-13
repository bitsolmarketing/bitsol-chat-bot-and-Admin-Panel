import { NextRequest } from "next/server";
import { z } from "zod";
import {
  planAssistantTurn,
  streamAssistantReply,
  detectAction,
  shouldEscalate,
  suggestFollowUps,
} from "@/lib/ai";
import { BRAND, DEPARTMENT } from "@/lib/brands";
import { generateReference, generateConversationReference } from "@/lib/utils";
import { rateLimit } from "@/lib/redis";
import { prisma } from "@/lib/db";
import { logEvent, notifyTeam } from "@/lib/notify";
import type { ChatStreamEvent } from "@/types";
import type { Language as PrismaLanguage } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(50),
  conversationRef: z.string().max(64).optional(),
});

function sse(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

const LANGUAGE_MAP = {
  en: "EN",
  ur: "UR",
  ur_roman: "UR_ROMAN",
  pa: "PA",
} as const;

export async function POST(req: NextRequest) {
  // --- Rate limit (fails open when Redis is absent) -------------------------
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";
  const { allowed } = await rateLimit(`chat:${ip}`, 30, 60);
  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  // --- Validate -------------------------------------------------------------
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { messages, conversationRef } = parsed.data;

  const plan = planAssistantTurn(messages);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content ?? "";

  const ticketId = shouldEscalate(userText) ? generateReference("TKT") : undefined;
  const action = detectAction(userText);

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let assistantText = "";

      // Tell the client the detected language immediately so it can switch
      // text direction while the model is still generating.
      controller.enqueue(encoder.encode(sse({ type: "meta", language: plan.language })));

      try {
        for await (const chunk of streamAssistantReply(messages, plan)) {
          assistantText += chunk;
          controller.enqueue(encoder.encode(sse({ type: "chunk", text: chunk })));
        }

        if (ticketId) {
          const note = `\n\n🎫 I've created ticket **${ticketId}** and passed this to the ${BRAND.name} team. Keep this reference for follow-up — you can also reach them on ${BRAND.contact.phone}.`;
          assistantText += note;
          controller.enqueue(encoder.encode(sse({ type: "chunk", text: note })));
        }

        controller.enqueue(
          encoder.encode(
            sse({
              type: "done",
              ticketId,
              suggestions: suggestFollowUps(userText),
              action,
            })
          )
        );
      } catch (err) {
        console.error("[chat] stream error:", err);
        controller.enqueue(
          encoder.encode(
            sse({
              type: "error",
              message:
                "Sorry, I'm having trouble responding right now. Please try again in a moment.",
            })
          )
        );
      } finally {
        controller.close();
      }

      // --- Best-effort persistence (skips silently if the DB is down) -------
      void persist({
        conversationRef,
        language: LANGUAGE_MAP[plan.language],
        userText,
        assistantText,
        ticketId,
        latencyMs: Date.now() - startedAt,
      }).catch((e) =>
        console.warn("[chat] persistence skipped:", e?.message ?? e)
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/** Store the exchange for chat history, CRM context and analytics. */
async function persist(opts: {
  conversationRef?: string;
  language: PrismaLanguage;
  userText: string;
  assistantText: string;
  ticketId?: string;
  latencyMs: number;
}) {
  const { conversationRef, language, userText, assistantText, ticketId, latencyMs } = opts;

  const reference = conversationRef ?? generateConversationReference();

  const conversation = await prisma.conversation.upsert({
    where: { reference },
    update: { updatedAt: new Date(), language },
    create: {
      reference,
      department: DEPARTMENT,
      language,
      title: userText.slice(0, 80),
    },
  });

  if (userText) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: userText,
        department: DEPARTMENT,
        language,
      },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: assistantText,
      department: DEPARTMENT,
      language,
      latencyMs,
    },
  });

  if (ticketId) {
    await prisma.ticket.create({
      data: {
        reference: ticketId,
        department: DEPARTMENT,
        category: "GENERAL",
        subject: "Escalated from the BITSOL AI Assistant",
        description: userText,
        conversationId: conversation.id,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { handedOff: true },
    });

    await notifyTeam({
      subject: `Human handoff requested — ${ticketId}`,
      body: `A visitor asked for a human.\n\nTicket: ${ticketId}\nConversation: ${reference}\n\nTheir message:\n${userText}`,
      link: `/admin/support/tickets`,
    });

    await logEvent({
      action: "chat.escalated",
      entity: "Ticket",
      entityId: ticketId,
      message: "Assistant escalated a conversation to a human.",
    });
  }
}
