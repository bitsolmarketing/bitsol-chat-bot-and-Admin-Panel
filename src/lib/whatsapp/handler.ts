import { Prisma } from "@prisma/client";
import type { Language as PrismaLanguage } from "@prisma/client";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { rateLimit } from "@/lib/redis";
import { logEvent, notifyTeam } from "@/lib/notify";
import { generateReference, shortId } from "@/lib/utils";
import { detectLanguage, type Language } from "@/lib/i18n";
import { BRAND, DEPARTMENT } from "@/lib/brands";
import {
  detectAction,
  planAssistantTurn,
  shouldEscalate,
  streamAssistantReply,
  type ChatTurn,
} from "@/lib/ai";
import { findService } from "@/data/marketing/services";
import { markAsRead, sendButtons, sendList, sendText, toDisplayPhone } from "./client";
import {
  advanceCapture,
  asCaptureState,
  beginCapture,
  isCaptureStale,
  seedFromWaId,
  type CapturePrompt,
  type CaptureState,
} from "./capture";
import {
  ACTION_BUTTON_PREFIX,
  busyNotice,
  captureCancelled,
  captureConfirmation,
  escalationNotice,
  mediaAcknowledgement,
  optOutConfirmation,
  quickActions,
  welcomeMessage,
} from "./copy";
import type { InboundMessage } from "./types";

/**
 * =============================================================================
 *  WhatsApp conversation handler
 * =============================================================================
 *
 *  The WhatsApp equivalent of `app/api/chat/route.ts`. It reuses the exact same
 *  brain — `planAssistantTurn` retrieves from the knowledge base and builds the
 *  system prompt — so an answer given on WhatsApp and the same answer given in
 *  the web widget cannot drift apart.
 *
 *  What differs is everything around the model:
 *
 *    • **No streaming.** WhatsApp takes one finished message, so the stream is
 *      accumulated and sent as one (or several, past 4096 characters).
 *    • **No forms.** Structured capture happens through `capture.ts`, one
 *      question per message, resumed from the database on every delivery.
 *    • **No session.** A phone number is the identity, and the same thread can
 *      span months — so the conversation is resolved from the number.
 *
 *  Every path is defensive: this runs inside a webhook Meta will retry on any
 *  non-200, so a failure here must be logged and swallowed, never thrown.
 * =============================================================================
 */

const LANGUAGE_MAP: Record<Language, PrismaLanguage> = {
  en: "EN",
  ur: "UR",
  ur_roman: "UR_ROMAN",
  pa: "PA",
};

/**
 * A WhatsApp thread stays "the same conversation" for this long after the last
 * message. Matched to Meta's own 24-hour customer service window: past it the
 * business must open with a template anyway, so it is a natural thread break.
 */
const THREAD_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Words that always return the visitor to the top-level menu. */
const MENU_WORDS = ["menu", "start", "restart", "hi", "hello", "hey", "salam", "assalam o alaikum", "assalamualaikum", "aoa", "السلام علیکم", "مینو"];
const STOP_WORDS = ["stop", "unsubscribe", "opt out", "band karo"];

/**
 * Button ids from the old two-business welcome menu (`dept:MARKETING`,
 * `dept:INSTITUTE`). Those messages are still sitting in people's chats, and a
 * tap on one should land somewhere sensible rather than reach the model as
 * "Institute".
 */
const LEGACY_DEPARTMENT_BUTTON_PREFIX = "dept:";

/** Handle one inbound customer message end to end. */
export async function handleInbound(message: InboundMessage): Promise<void> {
  try {
    await route(message);
  } catch (error) {
    console.error("[whatsapp] handler failed:", error);
    await logEvent({
      level: "ERROR",
      action: "whatsapp.handler.failed",
      entity: "WhatsappContact",
      entityId: message.waId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function route(message: InboundMessage): Promise<void> {
  const waId = message.waId;
  const phone = toDisplayPhone(waId);

  // A runaway sender must not be able to burn the AI budget. Fails open when
  // Redis is absent, exactly like the web chat.
  const { allowed } = await rateLimit(`whatsapp:${waId}`, 20, 60);
  if (!allowed) {
    console.warn("[whatsapp] rate limited:", waId);
    return;
  }

  const contact = await upsertContact(message, phone);
  // Staff can silence a number without disconnecting the integration.
  if (contact.isBlocked) return;

  const conversation = await resolveConversation(waId, phone, contact.profileName);

  // Idempotency gate. Meta redelivers until it sees a 200, and this insert is
  // the thing that makes a redelivery harmless: the second attempt violates the
  // unique index on `externalId` and we stop before answering twice.
  const stored = await recordInbound(conversation.id, message);
  if (!stored) return;

  void markAsRead(message.id).catch(() => {});

  const language = resolveLanguage(message, conversation.language);
  const context: Context = {
    waId,
    phone,
    language,
    conversationId: conversation.id,
    profileName: contact.profileName ?? undefined,
  };

  const answer = message.replyId ?? message.text;
  const lowered = answer.trim().toLowerCase();

  // --- Subscription controls ------------------------------------------------
  if (STOP_WORDS.includes(lowered)) {
    await prisma.whatsappContact.update({ where: { waId }, data: { optedOut: true } });
    await say(context, optOutConfirmation(language));
    return;
  }
  if (contact.optedOut && MENU_WORDS.includes(lowered)) {
    await prisma.whatsappContact.update({ where: { waId }, data: { optedOut: false } });
  }

  // --- Media and empty messages ---------------------------------------------
  if (message.kind === "media" && !message.text) {
    await say(context, mediaAcknowledgement(language));
    return;
  }
  if (message.kind === "unsupported" || (!answer && !message.text)) {
    await sendMenu(context);
    return;
  }

  // --- Menu -----------------------------------------------------------------
  if (
    answer === `${ACTION_BUTTON_PREFIX}menu` ||
    answer.startsWith(LEGACY_DEPARTMENT_BUTTON_PREFIX) ||
    MENU_WORDS.includes(lowered)
  ) {
    await clearCapture(conversation.id);
    return sendMenu(context);
  }

  // --- An in-progress capture owns the turn ---------------------------------
  const active = asCaptureState(conversation.capture);
  if (active && !isCaptureStale(active)) {
    return continueCapture(context, active, answer);
  }
  if (active) await clearCapture(conversation.id);

  // --- Explicit "start the form" tap ----------------------------------------
  if (answer === `${ACTION_BUTTON_PREFIX}capture`) {
    return startCapture(context);
  }

  // --- Human handoff --------------------------------------------------------
  if (answer === `${ACTION_BUTTON_PREFIX}human` || shouldEscalate(message.text)) {
    return escalate(context, message.text);
  }

  // --- Intent that deserves a structured capture ----------------------------
  const action = detectAction(message.text);
  if (action?.kind === "QUOTE_FORM" || action?.kind === "MEETING_FORM") {
    return startCapture(context, action.subject);
  }
  if (action?.kind === "SUPPORT_FORM") {
    return escalate(context, message.text);
  }

  // --- Ordinary question: answer it with the same brain as the web chat -----
  const history = await loadHistory(conversation.id);
  await answerWithAssistant(context, history, planAssistantTurn(history));
}

// ------------------------------------------------------------------ Context --

interface Context {
  waId: string;
  phone: string;
  language: Language;
  conversationId: string;
  profileName?: string;
}

// ------------------------------------------------------------- Conversation --

async function upsertContact(message: InboundMessage, phone: string) {
  return prisma.whatsappContact.upsert({
    where: { waId: message.waId },
    update: {
      lastInboundAt: message.timestamp,
      // Only overwrite the stored name when WhatsApp actually sent one.
      ...(message.profileName ? { profileName: message.profileName } : {}),
    },
    create: {
      waId: message.waId,
      phone,
      profileName: message.profileName,
      department: DEPARTMENT,
      lastInboundAt: message.timestamp,
    },
  });
}

/**
 * Find the live thread for this number, or open a new one.
 *
 * Reusing a recent conversation is what gives WhatsApp genuine memory: the
 * assistant recalls the service discussed an hour ago, and the CRM shows one
 * coherent transcript instead of a row per message.
 *
 * A thread that belonged to the retired BITSOL Institute is never reused — the
 * console hides it, so continuing it would file new messages where nobody on
 * the team can see them.
 */
async function resolveConversation(waId: string, phone: string, profileName: string | null) {
  const since = new Date(Date.now() - THREAD_WINDOW_MS);

  const existing = await prisma.conversation.findFirst({
    where: {
      channel: "WHATSAPP",
      contactPhone: phone,
      updatedAt: { gte: since },
      OR: [{ department: DEPARTMENT }, { department: null }],
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    // The profile name often only arrives on a later delivery; backfill it so
    // the console shows a person rather than a number.
    if (profileName && !existing.contactName) {
      return prisma.conversation.update({
        where: { id: existing.id },
        data: { contactName: profileName, title: `WhatsApp · ${profileName}` },
      });
    }
    return existing;
  }

  return prisma.conversation.create({
    data: {
      reference: `WA-CONV-${shortId(10)}`,
      channel: "WHATSAPP",
      contactPhone: phone,
      contactName: profileName,
      department: DEPARTMENT,
      title: profileName ? `WhatsApp · ${profileName}` : `WhatsApp · ${phone}`,
    },
  });
}

/**
 * Store the customer's message, keyed by Meta's message id.
 *
 * Returns false when the id is already present, which means this is a webhook
 * redelivery of something already answered.
 */
async function recordInbound(conversationId: string, message: InboundMessage): Promise<boolean> {
  const content =
    message.text ||
    (message.kind === "media" ? `[${message.mediaKind ?? "attachment"}]` : "[unsupported message]");

  try {
    await prisma.message.create({
      data: {
        conversationId,
        role: "USER",
        content,
        department: DEPARTMENT,
        language: LANGUAGE_MAP[detectLanguage(message.text)],
        externalId: message.id,
      },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.info("[whatsapp] duplicate delivery ignored:", message.id);
      return false;
    }
    throw error;
  }
}

/** The last turns of this thread, in the shape the AI layer expects. */
async function loadHistory(conversationId: string): Promise<ChatTurn[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { role: true, content: true },
  });

  return rows
    .reverse()
    .map((row) => ({
      role: row.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: row.content,
    }))
    .filter((turn) => turn.content.trim().length > 0);
}

/**
 * Language for this turn.
 *
 * A button tap carries no language signal — its id is always English — so the
 * conversation's stored language wins there; free text re-detects, which lets
 * someone switch from English to Urdu mid-thread.
 */
function resolveLanguage(message: InboundMessage, stored: PrismaLanguage): Language {
  if (message.kind === "reply" || !message.text.trim()) {
    const entry = Object.entries(LANGUAGE_MAP).find(([, value]) => value === stored);
    return (entry?.[0] as Language) ?? "en";
  }
  return detectLanguage(message.text);
}

// -------------------------------------------------------------- Responding --

/** Send a reply and record it on the transcript, so the console shows both sides. */
async function say(
  context: Context,
  text: string,
  options?: { buttons?: CapturePrompt["buttons"]; list?: CapturePrompt["list"]; footer?: string }
): Promise<void> {
  const result = options?.list
    ? await sendList(context.waId, text, options.list.label, options.list.rows)
    : options?.buttons?.length
      ? await sendButtons(context.waId, text, options.buttons, options.footer)
      : await sendText(context.waId, text);

  await prisma.message
    .create({
      data: {
        conversationId: context.conversationId,
        role: "ASSISTANT",
        content: text,
        department: DEPARTMENT,
        language: LANGUAGE_MAP[context.language],
        externalId: result.messageId,
      },
    })
    .catch((error) => console.warn("[whatsapp] transcript write skipped:", error?.message));

  await prisma.conversation
    .update({
      where: { id: context.conversationId },
      data: { language: LANGUAGE_MAP[context.language], updatedAt: new Date() },
    })
    .catch(() => {});

  if (result.ok) {
    await prisma.whatsappContact
      .update({ where: { waId: context.waId }, data: { lastOutboundAt: new Date() } })
      .catch(() => {});
    return;
  }

  // A failed send is the one failure mode that is completely invisible from the
  // outside: the customer simply gets no reply, while the transcript in the
  // console shows the assistant answering perfectly. Recording it makes the
  // difference between "the bot is broken" and a specific, fixable cause —
  // an expired token, a blocked outbound connection, a rejected message.
  await logEvent({
    level: "ERROR",
    action: "whatsapp.send.failed",
    entity: "WhatsappContact",
    entityId: context.waId,
    message: result.error ?? "Unknown error sending to the WhatsApp Cloud API.",
    metadata: {
      to: context.phone,
      shape: options?.list ? "list" : options?.buttons?.length ? "buttons" : "text",
    },
  });
}

async function sendMenu(context: Context): Promise<void> {
  const welcome = welcomeMessage(context.language);
  await say(context, welcome.text, { buttons: welcome.buttons, footer: welcome.footer });
}

/** Generate an answer with the shared assistant brain and send it. */
async function answerWithAssistant(
  context: Context,
  history: ChatTurn[],
  plan: ReturnType<typeof planAssistantTurn>
): Promise<void> {
  let text = "";
  try {
    for await (const chunk of streamAssistantReply(history, plan)) text += chunk;
  } catch (error) {
    console.error("[whatsapp] model error:", error);
    await say(context, busyNotice(context.language));
    return;
  }

  if (!text.trim()) {
    await say(context, busyNotice(context.language));
    return;
  }

  // The chips under an answer are what turn a question into a lead — without
  // them the visitor has to know to type "I want a quote".
  await say(context, text, { buttons: quickActions(context.language) });
}

// ---------------------------------------------------------------- Capture ---

async function startCapture(context: Context, subject?: string): Promise<void> {
  // Pre-fill what we already know: the service they asked about. Every
  // pre-filled field is a question skipped.
  const seed: Record<string, string> = {};
  const service = subject ? findService(subject) : undefined;
  if (service) {
    seed.serviceGroup = service.group;
    seed.service = service.slug;
  }

  const outcome = beginCapture("LEAD", context.language, seed);
  if (outcome.status !== "ask") return;

  await saveCapture(context.conversationId, outcome.state);
  await say(context, outcome.prompt.text, {
    buttons: outcome.prompt.buttons,
    list: outcome.prompt.list,
  });
}

async function continueCapture(
  context: Context,
  state: CaptureState,
  answer: string
): Promise<void> {
  const outcome = advanceCapture(state, answer, context.language, seedFromWaId(context.waId));

  if (outcome.status === "cancelled") {
    await clearCapture(context.conversationId);
    await say(context, captureCancelled(context.language));
    return;
  }

  if (outcome.status === "ask") {
    await saveCapture(context.conversationId, outcome.state);
    await say(context, outcome.prompt.text, {
      buttons: outcome.prompt.buttons,
      list: outcome.prompt.list,
    });
    return;
  }

  await clearCapture(context.conversationId);
  await completeCapture(context, outcome.answers);
}

async function saveCapture(conversationId: string, state: CaptureState): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { capture: state as unknown as Prisma.InputJsonValue },
  });
}

async function clearCapture(conversationId: string): Promise<void> {
  await prisma.conversation
    .update({ where: { id: conversationId }, data: { capture: Prisma.DbNull } })
    .catch(() => {});
}

/** Write the finished capture into the CRM and confirm it to the customer. */
async function completeCapture(
  context: Context,
  answers: Record<string, string>
): Promise<void> {
  const created = await createLead(context, answers);

  if (!created) {
    await say(context, busyNotice(context.language));
    return;
  }

  await say(
    context,
    captureConfirmation(context.language, {
      name: created.name,
      reference: created.reference,
      phone: created.phone,
    }),
    { buttons: quickActions(context.language) }
  );
}

interface CreatedRecord {
  id: string;
  reference: string;
  name: string;
  phone: string;
}

async function createLead(
  context: Context,
  answers: Record<string, string>
): Promise<CreatedRecord | null> {
  const reference = generateReference("LEAD");
  const service = answers.service ? findService(answers.service) : undefined;
  const name = answers.name || context.profileName || context.phone;
  const phone = answers.phone || context.phone;

  // "Something else" is a real answer, not a missing one — keep it where the
  // sales team will read it rather than dropping it on the floor.
  const requirements = [
    answers.requirements,
    !service && answers.serviceGroup
      ? `\n\nArea of interest: ${answers.serviceGroup === "other" ? "Not in the standard catalogue" : answers.serviceGroup}`
      : null,
  ]
    .filter(Boolean)
    .join("");

  try {
    const lead = await prisma.marketingLead.create({
      data: {
        reference,
        name,
        company: answers.company || null,
        phone,
        serviceSlug: service?.slug ?? null,
        budget: answers.budget || null,
        timeline: answers.timeline || null,
        requirements: requirements || "Captured on WhatsApp.",
        source: "WHATSAPP",
        stage: "NEW",
        conversationId: context.conversationId,
      },
      select: { id: true },
    });

    await notifyTeam({
      subject: `New WhatsApp lead ${reference} — ${name}${answers.company ? ` (${answers.company})` : ""}`,
      body: [
        `Reference: ${reference}`,
        `Source: WhatsApp (${context.phone})`,
        `Name: ${name}`,
        answers.company ? `Company: ${answers.company}` : null,
        `Phone: ${phone}`,
        service ? `Service: ${service.name}` : `Area: ${answers.serviceGroup ?? "Unspecified"}`,
        answers.budget ? `Budget: ${answers.budget}` : null,
        answers.timeline ? `Timeline: ${answers.timeline}` : null,
        "",
        "Requirements:",
        answers.requirements || "—",
      ]
        .filter(Boolean)
        .join("\n"),
      link: `/admin/crm/leads/${lead.id}`,
    });

    await logEvent({
      action: "lead.created",
      entity: "MarketingLead",
      entityId: lead.id,
      message: `Lead ${reference} captured on WhatsApp from ${context.phone}.`,
      metadata: { reference, channel: "WHATSAPP", service: service?.slug },
    });

    return { id: lead.id, reference, name, phone };
  } catch (error) {
    console.error("[whatsapp] lead create failed:", error);
    return null;
  }
}

// -------------------------------------------------------------- Escalation --

async function escalate(context: Context, request: string): Promise<void> {
  const reference = generateReference("TKT");

  try {
    await prisma.ticket.create({
      data: {
        reference,
        department: DEPARTMENT,
        category: "GENERAL",
        status: "OPEN",
        subject: "Human requested on WhatsApp",
        description: request || "The customer asked to speak to a person.",
        contactName: context.profileName ?? null,
        contactPhone: context.phone,
        conversationId: context.conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: context.conversationId },
      data: { handedOff: true },
    });

    await notifyTeam({
      subject: `WhatsApp handoff ${reference} — ${context.profileName ?? context.phone}`,
      body: [
        `A WhatsApp customer asked for a human.`,
        ``,
        `Ticket: ${reference}`,
        `WhatsApp: ${context.phone}`,
        context.profileName ? `Name: ${context.profileName}` : null,
        ``,
        `Their message:`,
        request || "—",
        ``,
        `Reply from ${BRAND.contact.whatsapp} within 24 hours, or a template message will be required.`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
      link: `/admin/support/tickets`,
    });

    await logEvent({
      action: "chat.escalated",
      entity: "Ticket",
      entityId: reference,
      message: `WhatsApp conversation handed to a human (${context.phone}).`,
      metadata: { channel: "WHATSAPP" },
    });
  } catch (error) {
    console.error("[whatsapp] escalation failed:", error);
  }

  await say(context, escalationNotice(context.language, reference));
}

/** Whether the bot should reply at all — the kill switch on the integration. */
export function autoReplyEnabled(): boolean {
  return config.whatsapp.enabled && config.whatsapp.autoReply;
}
