# Architecture — BITSOL AI Assistant

_Designed & Developed by BITSOL MARKETING_

The AI concierge and admin console for **BITSOL Marketing** — business services,
digital solutions, AI automation and software development.

---

## 1. System overview

```
                        ┌──────────────────────────────┐
  Visitor ──────────────▶  /chat  (ChatWindow, client) │
                        └───────────────┬──────────────┘
                                        │ POST /api/chat  { messages, conversationRef }
                                        ▼
                        ┌──────────────────────────────┐
                        │  planAssistantTurn()         │
                        │   1. detectLanguage()        │  ← EN / UR / Roman UR / PA
                        │   2. retrieveKnowledge()     │  ← best-matching KB entries
                        │   3. buildSystemPrompt()     │  ← identity, scope, entries
                        └───────────────┬──────────────┘
                                        │
      SSE  meta → chunk… → done         ▼
   ◀────────────────────────  AI provider (Claude / OpenAI / Ollama / Gemini)
                                        │
                                        ▼
                        ┌──────────────────────────────┐
                        │  Persistence (best effort)   │
                        │  conversations · messages    │
                        │  tickets · notifications     │
                        │  system_logs                 │
                        └──────────────────────────────┘

  WhatsApp ──▶ /webhook ──▶ handler.ts ──▶ same planAssistantTurn()
  Staff ────▶ /admin  ──▶ middleware ──▶ requireAdmin() ──▶ Prisma queries
```

**Stack.** Next.js 15 App Router (React 19, TypeScript) serving both UI and API
route handlers on the Node runtime. PostgreSQL via Prisma is the system of
record; Redis provides rate limiting and caching.

---

## 2. The retired BITSOL Institute

The product originally served two businesses — BITSOL Marketing and BITSOL
Institute of Digital Media & AI — from one database. The Institute has been
removed from the product, **not from the database**:

| Where | What happened |
| --- | --- |
| Institute-only tables | `courses`, `admissions`, `students`, `faculty`, `batches`, `enrollments`, `attendance`, `assignments`, `submissions`, `certificates`, `knowledge_base_institute` remain in `schema.prisma` and in PostgreSQL. No code reads or writes them. |
| Shared tables | Keep their `department` column. `DEPARTMENT` in `src/lib/brands.ts` is the value stamped on everything the app writes. |
| Admin reads | `OWN` (required columns) and `OWN_OR_GLOBAL` (nullable columns — keeps unassigned rows) in `src/lib/admin/queries.ts` filter every list; `isOwn()` guards pages and API routes that load one record by id, so an archived record is a `404` even with its URL. |
| Staff | `isRetiredAccount()` in `src/lib/auth.ts` refuses Institute accounts at sign-in and on every console request, including sessions issued earlier. |
| Browsers | The chat transcript key moved to `bitsol.chat.v2`, so a saved Institute conversation is not restored. |
| WhatsApp | Buttons from the old two-business menu (`dept:*`) lead back to the welcome message; an Institute thread still inside its 24-hour window is not reused; leftover admission captures are ignored. |

Why keep the tables in `schema.prisma`: removing a model from the schema makes
the next `prisma migrate dev` generate a `DROP TABLE`. Dropping that data is an
irreversible business decision, so it is left as an explicit future migration
rather than something a routine schema change could do by accident.

---

## 3. Layers

### Presentation
- `src/app/page.tsx`, `about/` — public pages on the midnight surface.
- `src/app/(chat)/chat` — the concierge. `ChatWindow` owns the transcript, the
  streaming request and the open workflow form; on wide screens a rail offers
  the workflows and the service list, on phones `MenuPanel` does.
- `src/app/(admin)/admin` — server-component modules; all data fetching is
  server-side, with small client islands (`StatusSelect`, `ActivityComposer`,
  `BroadcastComposer`, `TemplateToolbar`) for mutations.
- `src/app/(auth)/login` — staff sign-in.

### Design system
bitsolmarketing.com's palette and type — midnight `#050816`, slate `#0F172A`,
cyan `#00D9FF`, violet `#7C3AED`, blue `#2563EB`, self-hosted Montserrat.

`globals.css` defines two HSL token sets: `:root` (light — the admin workspace,
where dense tables need contrast) and `.dark` (midnight — every public surface
and the admin sidebar). A page opts into a surface with `className="dark"` on a
wrapper rather than following the OS setting. Shared utilities: `brand-gradient`
(the lit midnight backdrop), `bg-brand` (blue → violet call to action),
`text-gradient`, `ring-gradient`, `bg-grid`, `eyebrow`. `Logo`/`LogoMark` in
`components/branding` reproduce the main site's mark.

### Domain content
`src/data/marketing` is the content source:

- `services.ts` — 12 services × (overview, benefits, features, process, pricing
  placeholder, portfolio, FAQs, keywords)
- `knowledge-base.ts` — hand-written company entries **plus** one auto-derived
  entry per service, so a catalogue edit updates the assistant's answers in
  exactly one place
- `menu.ts` — chat menu tree, welcome suggestions and quick replies

### AI
`src/lib/ai/` isolates every model detail behind one interface:

```ts
interface AIProvider {
  name: string;
  streamChat(opts): AsyncGenerator<string>;  // yields text chunks
}
```

- `knowledge.ts` — keyword-overlap retrieval. Dependency-free by design so the
  system runs anywhere; swapping in vector search touches only this file.
- `system-prompt.ts` — BITSOL Marketing's identity, scope, catalogue, contacts
  and the retrieved entries. It also tells the model that individual courses and
  admissions are not offered, so those questions get an honest answer rather
  than an invented one.
- `intents.ts` — deterministic detection of escalation and workflow forms, plus
  context-aware quick replies. The model writes prose; this module decides what
  the product *does*, so behaviour stays predictable and testable.
- `providers/` — Claude (default, `claude-opus-4-8`), OpenAI-compatible, Ollama
  and Gemini. Selection is by `AI_PROVIDER`; nothing else knows which model runs.

### Persistence
Prisma over PostgreSQL. Tables in use: `marketing_leads`, `marketing_services`,
`customers`, `projects`, `quotes`, `portfolio_items`, `reviews`,
`knowledge_base_marketing`, `tickets`, `meetings`, `conversations`, `messages`,
`crm_activities`, `media_assets`, `events`, `announcements`, `whatsapp_contacts`,
`whatsapp_templates`, `broadcasts`, `broadcast_recipients`, `notifications`,
`users`, `roles`, `permissions`, `settings`, `system_logs`, `analytics_daily`.

Chat persistence is **best effort**: a database outage degrades history and
analytics but never breaks a conversation.

---

## 4. Streaming protocol

`POST /api/chat` returns Server-Sent Events:

| Event | Payload | Purpose |
| --- | --- | --- |
| `meta` | `{ language }` | Sent **before** generation so the UI can set text direction while the model is still thinking |
| `chunk` | `{ text }` | Incremental response text |
| `done` | `{ ticketId?, suggestions?, action? }` | Final state: escalation reference, follow-up chips, and any workflow form to open |
| `error` | `{ message }` | Friendly failure |

`action` is what turns "I want a quote" into a form instead of nine
conversational turns. The client opens the matching `WorkflowForm`, which POSTs
to `/api/leads`, `/api/meetings` or `/api/tickets`.

---

## 5. Reference numbers

Every customer-facing record gets a readable reference:

```
BM-LEAD-7F3K2Q9A     Lead / quote request
BM-MTG-…             Meeting
BM-TKT-…             Support ticket
BM-CONV-…            Web conversation
WA-CONV-…            WhatsApp conversation
BM-BCAST-…           Broadcast
```

The alphabet excludes look-alike characters (`0/O`, `1/I/L`) so references can be
read aloud over the phone or WhatsApp without ambiguity. Records created before
the Institute was retired may carry `BX-` or `BI-` prefixes.

---

## 6. Multilingual support

`src/lib/i18n.ts` classifies each message as `en`, `ur`, `ur_roman` or `pa`:

- Arabic script present → Urdu, unless ≥2 Punjabi Shahmukhi markers → Punjabi
- Otherwise Roman-script keyword scoring, requiring either two distinct markers
  or one in a very short message — so an English sentence containing "hai" or
  "ap" isn't misclassified

The result drives the prompt's language directive, RTL rendering, the
speech-synthesis/recognition BCP-47 tag, and the small UI dictionary. Full page
copy stays in English; conversational content is generated in the user's
language by the model.

---

## 7. Security

| Concern | Control |
| --- | --- |
| Authentication | JWT (`jose`, HS256, Edge-safe) in an httpOnly, SameSite=Lax cookie; bcrypt password hashing |
| Authorisation | Coarse `UserRole` tier (`AGENT`, `ADMIN`, `SUPER_ADMIN` reach the console) + fine-grained `Role`/`Permission` RBAC |
| Admin access | Edge middleware → `requireAdmin()` in the layout → per-route checks (defence in depth) |
| Archived data | `OWN` / `OWN_OR_GLOBAL` on lists, `isOwn()` on single records, `isRetiredAccount()` on sessions |
| Input validation | Zod on every route handler; admin updates use a per-entity allow-list so no arbitrary field can be written |
| Rate limiting | Redis fixed-window — 30 chat messages/min per IP, 5–6 submissions per 10 min; fails open when Redis is absent |
| SQL injection | Prisma parameterised queries only |
| XSS | React escaping; no `dangerouslySetInnerHTML`; the message renderer is a safe text formatter |
| Secrets | Environment variables only; the Integrations page reports configured/not and never returns a value |
| Audit | `system_logs` records action, entity, actor, IP and metadata for every mutation |
| PII | The assistant is instructed never to request passwords, OTPs, card or CNIC numbers in chat |

---

## 8. Accessibility & performance

Keyboard-navigable controls, ARIA labels on icon buttons, screen-reader text on
the typing indicator, RTL rendering for Urdu and Punjabi, `prefers-reduced-motion`
respected globally, streaming responses for perceived speed, server components
throughout the admin console, a splash shown once per browser session, fonts
self-hosted (no build-time fetch), and SEO metadata in `layout.tsx`.

---

## 9. Extension points

- **Vector search** — replace the body of `retrieveKnowledge`; call sites unchanged.
- **Notification delivery** — a worker reads `notifications` (status `QUEUED`)
  and delivers via SMTP/SMS/WhatsApp. Queueing is already wired; transport is
  deliberately out-of-band so a slow provider can't block a request.
- **Another WhatsApp capture flow** — add a `CaptureFlow` and its steps in
  `lib/whatsapp/capture.ts`; the flow name is already stored with each capture.
- **Dropping the Institute data** — export it, delete the retired models from
  `schema.prisma`, and create a migration. Review the relations on `User` and
  `Conversation` that point at them first.
