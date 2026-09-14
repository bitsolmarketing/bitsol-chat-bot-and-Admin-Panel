# API Reference — BITSOL AI Assistant

_Designed & Developed by BITSOL MARKETING_

Base URL: `${APP_URL}` (e.g. `http://localhost:3000`). All endpoints are
Next.js Route Handlers running on the Node.js runtime.

---

## POST `/api/chat`

Stream an assistant reply. The response is **Server-Sent Events**
(`text/event-stream`); each event is a `data:` line containing JSON.

### Request body
```json
{
  "conversationRef": "BM-CONV-AB12CD34EF",
  "messages": [
    { "role": "user", "content": "SEO ka rate kya hai?" }
  ]
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `messages` | ✅ | 1–50 turns; each `content` 1–4000 chars |
| `conversationRef` | | Groups turns into one conversation; generated if absent |

### Response stream

```
data: {"type":"meta","language":"ur_roman"}
data: {"type":"chunk","text":"SEO monthly retainer par hota hai, "}
data: {"type":"chunk","text":"indicative price PKR 60,000/month se shuru…"}
data: {"type":"done","suggestions":[]}
data: {"type":"capture","records":[{"kind":"LEAD","reference":"BM-LEAD-7F3K2Q9A"}]}
```

| `type` | Fields | Meaning |
| --- | --- | --- |
| `meta` | `language` | Detected language, sent **before** generation so the UI can set text direction |
| `chunk` | `text` | Incremental assistant text |
| `done` | `ticketId?`, `suggestions?` | The reply is complete — re-enable the composer here |
| `capture` | `records` | CRM records this turn created from what the customer said; sent after `done` |
| `error` | `message` | A recoverable error to show the user |

`suggestions` is an empty list when the reply ends with a question to the
customer: chips would pull them away from answering it.

After `done` the stream stays open briefly while the turn is stored and the
customer's details are synced to the CRM. `capture.records[].kind` is `LEAD`,
`MEETING` or `TICKET`; each record is reported once, in the turn that created it.
Always send the same `conversationRef` for one conversation — the details are
keyed to it.

### Status codes
`200` stream started · `400` invalid body · `429` rate limited (30 req / 60 s per IP)

```bash
curl -N http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need a chatbot for my business"}]}'
```

---

## POST `/api/leads` — lead capture

The assistant does not call this — it captures leads in conversation (see
`capture` above). The endpoint remains for other clients, such as a contact form
on the main website.

```json
{
  "name": "Ali Raza",
  "company": "Raza Traders",
  "phone": "03001234567",
  "email": "ali@example.com",
  "businessType": "Retail",
  "service": "ai-chatbots",
  "budget": "PKR 100,000 – 300,000",
  "timeline": "Within 1 month",
  "requirements": "WhatsApp bot that books orders and answers pricing.",
  "conversationRef": "BM-CONV-AB12CD34EF"
}
```

Required: `name`, `phone`, `requirements`. `service` is a slug from
`/api/catalog`.

`201` → `{ "ok": true, "reference": "BM-LEAD-7F3K2Q9A", "message": "…" }`

Creates the lead at stage `NEW`, links it to the conversation, queues a sales
notification and writes an audit entry.

---

## POST `/api/meetings` — consultation booking

```json
{
  "name": "Ali Raza",
  "phone": "03001234567",
  "email": "ali@example.com",
  "businessName": "Raza Traders",
  "preferredDate": "2026-08-14",
  "preferredTime": "3:00 PM",
  "mode": "ZOOM",
  "topic": "AI automation for order handling",
  "conversationRef": "BM-CONV-AB12CD34EF"
}
```

`mode` ∈ `OFFICE` | `ZOOM` | `GOOGLE_MEET` | `WHATSAPP`. Dates in the past are
rejected with `400`.

`201` → `{ "ok": true, "reference": "BM-MTG-…", "message": "…" }`

---

## POST `/api/tickets` — support ticket

```json
{
  "category": "TECHNICAL",
  "name": "Ali Raza",
  "phone": "03001234567",
  "email": "ali@example.com",
  "subject": "Chatbot not replying on WhatsApp",
  "description": "Since this morning the bot stopped answering.",
  "conversationRef": "BM-CONV-AB12CD34EF"
}
```

`category` ∈ `TECHNICAL` | `BILLING` | `SALES` | `COMPLAINT` | `GENERAL`.
Complaints are raised at `HIGH` priority automatically.

`201` → `{ "ok": true, "reference": "BM-TKT-…", "message": "…" }`

---

## GET `/api/catalog`

```
GET /api/catalog              → all services
GET /api/catalog?slug=seo     → one service
```

`200` → `{ "count", "items": [...] }` or `{ "item" }` · `404` unknown slug

---

## GET `/api/search`

Natural-language search over the knowledge base.

```
GET /api/search?q=whatsapp%20automation%20price&limit=10
```

`200` → `{ "query", "count", "results": [{ id, category, kind, question, answer }] }`

---

## Auth

| Endpoint | Body | Result |
| --- | --- | --- |
| `POST /api/auth/register` | `{ name, email, password, phone? }` | `200` + `Set-Cookie: bitsol_session` · `409` email taken |
| `POST /api/auth/login` | `{ email, password }` | `200` + cookie · `401` invalid (generic message) · `403` a former BITSOL Institute account |
| `POST /api/auth/logout` | — | `200`, clears the cookie |

The user object includes `role`, which the client uses to route
staff to `/admin` and everyone else to `/chat`.

---

## Admin (authenticated)

All admin endpoints require a session with role `AGENT`, `ADMIN` or
`SUPER_ADMIN`. Records archived from the retired BITSOL Institute are answered
with `404`, even when addressed by id.

### PATCH `/api/admin/{entity}/{id}`

`entity` ∈ `leads` | `tickets` | `meetings` | `knowledge`

Each entity has its own allow-list schema — no arbitrary field can be written.

```bash
curl -X PATCH http://localhost:3000/api/admin/leads/clx123 \
  -H 'Content-Type: application/json' \
  -d '{"stage":"QUALIFIED"}'
```

| Entity | Writable fields |
| --- | --- |
| `leads` | `stage` (incl. `HOT`, `FOLLOW_UP`, `SUPPORT`, `SPAM`, `OPTED_OUT`), `priority`, `estimatedValue`, `lostReason`, `ownerId` |
| `tickets` | `status`, `priority`, `resolution`, `assigneeId` |
| `meetings` | `status`, `meetingLink`, `notes` |
| `knowledge` | `state` |

`200` → `{ "ok": true }` · `401` no session · `404` unknown entity/record

### PUT · DELETE `/api/admin/bot-config/{section}`

Chatbot Studio. `PUT` saves one configuration section (body: the section's JSON);
`DELETE` resets it to the built-in default. Requires `settings.manage`.
Sections: `contact` `businessHours` `personality` `messages` `menu` `actions`
`flows` `intents` `options` `countries` `pricing` `teams` `scoring` `enterprise`
`handover` `followUp` `sources` `proof` `broadcastCategories`.

`200` → `{ "ok": true, "warnings": [] }` · `422` → `{ "ok": false, "issues": ["open: Use 24-hour HH:MM"] }`
(also returned when a change would reference a menu, flow or button that does not exist)

### POST `/api/admin/bot/simulate`

Runs one WhatsApp turn through the real engine, live configuration and model,
without sending anything or writing to the CRM. The browser keeps the state and
sends it back each turn. Requires `settings.manage`.

```json
{ "input": { "kind": "reply", "text": "WhatBot Pro", "replyId": "n:whatbot" },
  "phone": "+971501234567", "profileName": "Sara", "history": [], "details": {},
  "state": null, "records": {}, "turns": 1 }
```

→ `{ sent: Outgoing[], effects: [{ type, summary, detail }], details, state, records, history, language, optedOut }`

### POST `/api/admin/conversations/{id}/reply`

A person replies to a WhatsApp customer from the console: `{ "text": "…", "pauseBot": true }`.
`409` once the 24-hour window has closed, `502` with Meta's reason if WhatsApp refuses.

### PATCH `/api/admin/conversations/{id}`

`{ "botPaused": true }` silences the assistant on the thread; `{ "botPaused": false, "handedOff": false }`
resumes it and closes the handover.

### POST `/api/admin/activities`

Adds a note, follow-up or reminder to a CRM record's timeline.

```json
{
  "entityType": "MarketingLead",
  "entityId": "clx123",
  "type": "FOLLOW_UP",
  "body": "Called — wants a revised quote for the WhatsApp module.",
  "dueAt": "2026-08-05T10:00:00+05:00"
}
```

`PATCH /api/admin/activities` with `{ id, completed }` marks one complete.

---

## `/webhook` — WhatsApp Cloud API

Called by Meta, not by your front end. Register it at
**Meta ▸ WhatsApp ▸ Configuration ▸ Webhook** and subscribe to `messages`.

`/webhook` is the public callback path; it is rewritten to
`/api/whatsapp/webhook` in `next.config.mjs`, and both answer identically. It is
a rewrite rather than a redirect because Meta does not follow 3xx responses when
delivering a webhook.

### GET — subscription handshake

Meta calls this once when you save the webhook.

| Query param        | Meaning                                        |
| ------------------ | ---------------------------------------------- |
| `hub.mode`         | Always `subscribe`                             |
| `hub.verify_token` | Must equal `WHATSAPP_VERIFY_TOKEN`             |
| `hub.challenge`    | Echoed back verbatim as `text/plain` on success |

`200` challenge echoed · `403` token mismatch · `500` `WHATSAPP_VERIFY_TOKEN` unset.

### POST — inbound messages and delivery receipts

Every request must carry a valid `X-Hub-Signature-256` header — an HMAC-SHA256
of the **raw** body keyed with `WHATSAPP_APP_SECRET`. Unsigned or mis-signed
requests are rejected with `401` and logged as `whatsapp.webhook.rejected`.

```jsonc
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "metadata": { "phone_number_id": "…" },
        "contacts": [{ "wa_id": "923001234567", "profile": { "name": "Ali" } }],
        "messages": [{
          "id": "wamid.HBgM…",
          "from": "923001234567",
          "timestamp": "1785000000",
          "type": "text",
          "text": { "body": "mujhe apne business ke liye chatbot chahiye" }
        }]
      }
    }]
  }]
}
```

Handled message types: `text`, `interactive` (button and list replies),
`button`, `image` / `document` / `video` / `audio` / `sticker` (acknowledged,
caption read), `location`. Anything else returns the welcome message.

**Always responds `200`** once the signature checks out, including when
processing fails — Meta redelivers on any other status, and a redelivery of an
answered message would message the customer twice. Idempotency comes from the
unique `messages.externalId` column instead: the second delivery of a `wamid`
stops before the assistant is invoked.

### What it produces

| Outcome                   | Record written                                          |
| ------------------------- | ------------------------------------------------------- |
| Any message               | `Conversation` (`channel = WHATSAPP`) + `Message` rows   |
| Name, need and interest shared in conversation | `MarketingLead`, `source = WHATSAPP`, stage `NEW` |
| A consultation day and time shared | `Meeting` (`REQUESTED`), linked to the lead |
| An existing client's problem described | `Ticket` (`OPEN`) with the customer's contact details |
| "Talk to a human"         | `Ticket` (`OPEN`) + conversation marked `handedOff`      |
| Every one of the above    | `Notification` for the sales team + `SystemLog` entry    |

All of them appear in the admin console under Clients ▸ Leads (filterable by
source), Live Conversations, and Support & Messaging ▸ WhatsApp Inbox.

---

## GET · POST `/api/cron/follow-ups`

Smart follow-up scheduler. `Authorization: Bearer $CRON_SECRET` (or `?secret=`).

```json
{ "checked": 12, "sent": 3, "skipped": { "not due yet": 7, "opted out or blocked": 2 } }
```

`401` wrong secret · `503` `CRON_SECRET` or WhatsApp not configured.
See [WHATSAPP_ASSISTANT.md §9](WHATSAPP_ASSISTANT.md#9-smart-follow-up).

## GET `/api/health`

Liveness + dependency probe for Docker/Nginx/monitoring.

```json
{
  "status": "healthy",
  "provider": "claude",
  "model": "claude-opus-4-8",
  "checks": { "app": "ok", "database": "ok", "redis": "ok" },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

`200` healthy · `503` degraded (a dependency is down).

---

## Notes

- Auth cookies are `HttpOnly; SameSite=Lax`, and `Secure` in production.
- Submission endpoints are rate limited to 5–6 per 10 minutes per IP; chat to 30
  per minute. Rate limiting fails open when Redis is absent.
- The chat endpoint persists conversations best-effort — it never fails a
  response because persistence failed.
- Provider selection is server-side via `AI_PROVIDER`; clients never send model
  names or keys.
- WhatsApp is rate limited to 20 inbound messages per minute per sender, and
  replies are suppressed entirely when `WHATSAPP_AUTO_REPLY=false` (messages are
  still recorded).
