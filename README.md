# BITSOL AI Assistant

The AI concierge and admin console for **BITSOL Marketing** — business services,
digital solutions, AI automation and software development.

On the website and on WhatsApp, the assistant talks like one of BITSOL
Marketing's customer service representatives: it answers from the company's own
knowledge base and, along the way, asks for the details the team needs — then
turns them into leads, consultation requests and support tickets, each with a
real reference number. In English, Urdu, Roman Urdu or Punjabi.

> **Powered by Artificial Intelligence**
> **Designed & Developed by [BITSOL MARKETING](https://bitsolmarketing.com)** —
> _Empowering Businesses with Artificial Intelligence._

---

## ✨ What's inside

**Public experience**
- 🏛️ A landing page and about page in bitsolmarketing.com's own palette
  (midnight `#050816`, cyan `#00D9FF`, violet `#7C3AED`) and Montserrat
- 💬 **AI concierge** at `/chat` — a service rail with one-tap quotes,
  consultations and support on desktop, a slide-over menu on mobile
- 🌐 **English · Urdu · Roman Urdu · Punjabi**, with RTL rendering and tolerance
  for spelling mistakes, abbreviations and mixed-language input
- 🙋 **No forms.** The representative asks for a name, a number, the business
  and the budget in conversation, one question at a time and in no fixed order;
  a receipt with the reference number appears once the team has the request
- 🎙️ Voice input & voice responses, image/PDF attachment, human handoff with ticketing
- 🟢 **The same assistant on WhatsApp** — Meta Cloud API webhook, quick-action
  buttons, the same conversational capture (it never asks for the number the
  customer is writing from), human handoff. Same knowledge base, same reference
  numbers. See [WhatsApp chatbot](#-whatsapp-chatbot).

**Business logic**
- 🏢 12 services, each with overview · benefits · features · process ·
  pricing placeholder · portfolio · FAQ · book meeting · request quote
- 🗂️ A knowledge base of hand-written company entries plus one entry derived
  from each service, stored in `knowledge_base_marketing`

**Admin console** (`/admin`)
- Dashboard with won and open pipeline value, win rate, today's chats, new
  leads, upcoming meetings, active projects, most-requested services and a live
  activity feed
- Leads, customers, quotations, meetings, follow-ups and reminders. Every lead
  carries its **source**, so web-chat and WhatsApp leads land in the same board
  and can be filtered apart
- **WhatsApp Inbox** — every number that has messaged the business line, whether
  the 24-hour reply window is still open, and the transcript it produced
- Services, projects, portfolio & reviews
- Knowledge Base CMS with publish states, versioning and AI indexing
- Support tickets, events, media & documents
- WhatsApp templates, broadcasts, notification queue
- Reports & analytics, users, roles & permissions, settings, integrations, logs, AI training

**Platform**
- 🔐 JWT auth, RBAC (roles + permissions), edge middleware, rate limiting, audit logging
- 🧠 Provider-agnostic AI — Claude (default), any OpenAI-compatible API, local
  Ollama, or Gemini — switched by one env var
- 🐳 Docker, docker-compose, health probe, deployment docs

---

## 🎓 About BITSOL Institute data

This product used to serve a second business, BITSOL Institute of Digital Media
& Artificial Intelligence. It has been retired from every screen, from the
assistant and from WhatsApp — **but nothing was deleted from the database.**

- The Institute tables (`courses`, `admissions`, `students`, `faculty`,
  `batches`, `enrollments`, `attendance`, `assignments`, `submissions`,
  `certificates`, `knowledge_base_institute`) are still in `schema.prisma` and
  untouched in PostgreSQL.
- Shared tables keep their `department` column. Everything the app writes is
  stamped `MARKETING`, and every console query filters to it, so Institute rows
  in shared tables (conversations, tickets, templates…) stay hidden.
- Staff accounts that belonged to the Institute can no longer sign in.

To remove that data permanently, export what you need, delete the Institute
models from `schema.prisma` and create a migration. That step is irreversible,
so it is deliberately not part of this codebase.

---

## 🧱 Tech stack

| Layer         | Technology                                                        |
| ------------- | ----------------------------------------------------------------- |
| Framework     | **Next.js 15** (App Router) · **React 19** · **TypeScript**        |
| UI            | **Tailwind CSS** · shadcn/ui-style primitives · **Framer Motion** · **Lucide** · self-hosted **Montserrat** |
| Backend       | Next.js **Route Handlers** (Node runtime)                          |
| Database      | **PostgreSQL** via **Prisma ORM**                                  |
| Cache / limit | **Redis** (optional; fails open in dev)                            |
| Auth          | **JWT** (`jose`) + **bcrypt**, RBAC                                |
| AI            | **Claude** (default) · OpenAI-compatible · Ollama · Gemini         |
| Deployment    | **Docker** · **PM2/Nginx** ready · GitHub Actions friendly         |

---

## 🚀 Quick start

### Prerequisites
- Node.js 20+ (22 recommended)
- PostgreSQL 14+ and (optionally) Redis — or use the provided Docker services

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
#    set at minimum: DATABASE_URL, JWT_SECRET, AI_PROVIDER + matching API key

# 3. Optional: start Postgres + Redis
docker compose up -d db redis

# 4. Create the schema and load content
npx prisma migrate dev --name init
npm run db:seed

# 5. Run
npm run dev
```

Open **http://localhost:3000** → **Speak with our AI concierge** (or go to `/chat`).
The admin console is at **/admin**.

Seeded accounts (change these before any real deploy):

| Account | Email |
| --- | --- |
| Super Admin | `admin@bitsol.local` |
| Sales Agent | `sales@bitsol.local` |

Passwords come from `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD`
(default `ChangeMe#2024`).

---

## 🤖 Choosing an AI provider

Set `AI_PROVIDER` in `.env`:

| `AI_PROVIDER` | Uses                              | Required env                          |
| ------------- | --------------------------------- | ------------------------------------- |
| `claude`      | Anthropic Claude (default)        | `ANTHROPIC_API_KEY`, `AI_MODEL`       |
| `claude` on AWS | Claude Platform on AWS          | `ANTHROPIC_API_KEY` (AWS console key), `ANTHROPIC_BASE_URL`, `ANTHROPIC_WORKSPACE_ID` |
| `openai`      | OpenAI / Azure / Together / etc.  | `OPENAI_API_KEY`, `OPENAI_BASE_URL`   |
| `ollama`      | Local Ollama (OpenAI-compatible)  | `OPENAI_BASE_URL=http://localhost:11434/v1` |
| `gemini`      | Google Gemini (free tier available) | `GEMINI_API_KEY`                    |

`AI_MODEL` is optional — each provider has a default (`claude-opus-4-8`,
`gemini-3.1-flash-lite`, `gpt-4o-mini`, `llama3.1`). Set `AI_THINKING=true` for
Claude adaptive thinking (deeper, slower).

**Running on Google's free tier.** Create a key at
[aistudio.google.com/api-keys](https://aistudio.google.com/api-keys) (a Google
account, no card) and set:

```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza…
```

That runs `gemini-3.1-flash-lite`, which Google serves free of charge with a
per-day request cap — Google AI Studio shows the current numbers for your
project. Two things to know before relying on it for real customers: the free
tier's conversations are used to improve Google's products, and the cap counts
every model call, of which each customer message makes two (the reply and the
details extraction). Attaching a billing account to the same key lifts the cap
and stops the data use; at Flash-Lite prices a thousand customer messages cost
well under a dollar. `GEMINI_THINKING=low` keeps a Gemini 3 model's thinking
short so it does not eat the reply's token budget.

**Claude Platform on AWS.** Keep `AI_PROVIDER=claude` and put the key generated
in the AWS console in `ANTHROPIC_API_KEY`. Set `ANTHROPIC_BASE_URL` to your
region's endpoint, `https://aws-external-anthropic.<region>.api.aws`, and
`ANTHROPIC_WORKSPACE_ID` to the `wrkspc_…` id of the workspace in that region.
Keys from Anthropic's own console don't work there, and AWS keys don't work
against Anthropic's API — the provider refuses either mismatch at startup with
a message naming the missing variable.

Every turn also makes a short, JSON-only call that reads the conversation for the
customer's details. It uses `AI_MODEL` unless `AI_EXTRACTION_MODEL` names a
cheaper model from the same provider (for Claude, `claude-haiku-4-5` is plenty).

Without a key the UI still runs — sending a message shows a graceful error.

---

## 🧭 How a turn is handled

```
User message
   │
   ├─ load the conversation's capture → what the customer has already told us
   ├─ detectLanguage()        → EN / UR / Roman UR / PA
   ├─ retrieveKnowledge()     → the best-matching knowledge-base entries
   ├─ buildSystemPrompt()     → identity, scope, services, contacts, entries,
   │                            known details and what the team still needs
   │
   ├─ stream the representative's reply (SSE)    ┐ in parallel
   ├─ extractCustomerDetails() → JSON details     ┘
   │
   ├─ shouldEscalate()?       → ticket + team notification
   ├─ suggestFollowUps()      → quick-reply chips (none when the reply asks a question)
   └─ syncCapture()           → lead / consultation request / ticket + receipt
```

**Why conversation instead of forms.** A form asks everyone the same eight
questions up front; a representative asks the one that fits the moment and
skips what it already knows. The prompt tells the model which details the team
still needs and the rules for asking — help first, one question per message, no
fixed order, never twice, no pressure.

**Why the details are extracted, not trusted to the reply.** The model writes the
prose; a separate JSON-only call reads the details back out, and
[`src/lib/ai/customer.ts`](src/lib/ai/customer.ts) validates them — a phone number
or email must appear in something the customer typed, BITSOL's own contact
details are refused, services must exist and meeting dates must be real future
days. [`src/lib/capture.ts`](src/lib/capture.ts) then creates each record once,
under a row lock, and afterwards writes back only what the customer changed, so
an edit made in the console survives the next message.

The system prompt keeps the assistant to BITSOL Marketing's scope — asked about
individual courses or admissions, it says those aren't offered and points to
Corporate Training for teams instead of inventing an answer.

---

## 🟢 WhatsApp chatbot

The WhatsApp channel is the same assistant, not a second one. A message arriving
on the business number goes through `planAssistantTurn()` exactly like a web
message: same knowledge base, same language detection.

```
Customer on WhatsApp
   │
   ▼
POST /webhook               ── X-Hub-Signature-256 verified, else 401
   │
   ├─ Message id already seen?  → stop (Meta retries are harmless)
   ├─ Contact upserted, thread resolved (24h window → same conversation)
   │
   ├─ "menu" / "hi"?            → welcome message + quick actions
   ├─ Asked for a human?        → ticket + team notification
   └─ Otherwise (incl. "Get a quote") → the representative replies,
                                  details are extracted and synced
   │
   ▼
Lead / meeting / ticket with source = WHATSAPP → visible in the console,
receipt with the reference sent to the customer
```

Every webhook delivery is a cold start, so what the customer has told us lives in
`conversations.capture` rather than in memory. The WhatsApp number and profile
name are passed to the representative as already known, so it never asks for a
number it has.

### Connecting a number

1. In [Meta for Developers](https://developers.facebook.com/), create a Business
   app and add the **WhatsApp** product.
2. From **WhatsApp ▸ API Setup**, copy the **Phone number ID** into
   `WHATSAPP_PHONE_ID`, and the **WhatsApp Business Account ID** shown just above
   it into `WHATSAPP_WABA_ID`. They are different ids: messages are sent from the
   number, but templates belong to the account.
3. Create a **System User** with the `whatsapp_business_messaging` permission and
   generate a **permanent** token → `WHATSAPP_TOKEN`. (The 24-hour token on the
   setup page is for testing only.) Add `whatsapp_business_management` as well if
   you want to sync and submit templates from the admin console — sending works
   without it, managing templates does not.
4. Copy the **App secret** from **App settings ▸ Basic** → `WHATSAPP_APP_SECRET`.
   Every inbound webhook is HMAC-verified against it; without it the webhook
   rejects all traffic, because the callback URL is public.
5. Invent any random string for `WHATSAPP_VERIFY_TOKEN`.
6. In **WhatsApp ▸ Configuration ▸ Webhook**, set the callback URL to
   `https://your-domain.com/webhook`, paste the same verify token, and
   **subscribe to the `messages` field**. Admin ▸ Integrations shows the exact
   URL and the status of every credential.

   `/webhook` is a rewrite of `/api/whatsapp/webhook` (see `next.config.mjs`), so
   either path is valid — a rewrite rather than a redirect, because Meta does not
   follow 3xx when delivering a webhook.

Locally, expose the dev server first (`ngrok http 3000`) and register the tunnel
URL — Meta only calls public HTTPS endpoints.

Set `WHATSAPP_AUTO_REPLY=false` to keep the number connected while your team
answers manually; inbound messages are still recorded and still appear in the
console, the bot just stops replying.

### Good to know

- **The 24-hour window.** WhatsApp only allows free-form replies within 24 hours
  of the customer's last message. After that an approved template is required —
  which is what Messaging ▸ Templates and Broadcasts are for. The WhatsApp Inbox
  shows which contacts are still inside the window.
- **Long answers** are split across bubbles at paragraph boundaries, and the
  assistant's markdown is converted to WhatsApp's `*bold*` / `_italic_`.
- **`menu`** returns anyone to the welcome message; **`stop`** opts them out of
  broadcasts (they can still chat).

---

## 📁 Project structure

```
.
├── prisma/
│   ├── schema.prisma              # domain model (+ retired Institute tables, kept)
│   └── seed.ts                    # RBAC, users, catalogue, KB, settings
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # staff sign-in / register
│   │   ├── (chat)/chat/           # the AI concierge
│   │   ├── (admin)/admin/         # admin console
│   │   ├── about/  page.tsx  layout.tsx  globals.css
│   │   └── api/
│   │       ├── chat/              # streaming chat (SSE)
│   │       ├── whatsapp/webhook/  # Meta Cloud API webhook (verify + receive)
│   │       ├── leads/ meetings/ tickets/
│   │       ├── catalog/ search/ health/ auth/
│   │       └── admin/             # record updates, CRM activities
│   ├── components/
│   │   ├── chat/                  # ChatWindow, MenuPanel, MessageBubble
│   │   ├── admin/                 # AdminShell, nav, tables, status controls
│   │   ├── branding/              # Logo, SiteHeader, Footer, attribution
│   │   ├── splash/ ui/
│   ├── data/
│   │   └── marketing/             # services · knowledge base · menu
│   ├── lib/
│   │   ├── brands.ts              # the BITSOL Marketing profile
│   │   ├── i18n.ts                # EN / UR / Roman UR / PA
│   │   ├── ai/                    # retrieval · prompt · intents · customer details · providers
│   │   ├── capture.ts             # conversation details → leads, meetings, tickets
│   │   ├── whatsapp/              # Cloud API client · parser · handler
│   │   ├── admin/queries.ts       # failure-tolerant data access, Institute filter
│   │   └── auth.ts db.ts redis.ts config.ts notify.ts api.ts session.ts
│   ├── middleware.ts              # admin console guard
│   └── types/
├── Dockerfile · docker-compose.yml · .env.example
└── docs/  (ARCHITECTURE.md · DEPLOYMENT.md · API.md)
```

---

## 🐳 Run with Docker

```bash
cp .env.example .env            # set secrets
docker compose up -d --build
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed
```
App on **http://localhost:3000**, Postgres on `5432`, Redis on `6379`.

---

## ⚠️ Before going live

Pricing ships as **clearly-labelled placeholders**, and contact details as
representative defaults. The assistant always presents prices as indicative and
offers a written quotation for the real figure — but they must still be reviewed:

1. `src/data/marketing/services.ts` — service pricing
2. `src/lib/brands.ts` — phone, WhatsApp, email, address and hours
3. Re-run `npm run db:seed` to push the changes into the database

---

## 📜 Scripts

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Start the dev server                      |
| `npm run build`         | Production build (runs `prisma generate`) |
| `npm start`             | Start the production server               |
| `npm run typecheck`     | TypeScript check                          |
| `npm run prisma:migrate`| Create/apply a dev migration              |
| `npm run db:seed`       | Seed RBAC, catalogue and knowledge base   |
| `npm run prisma:studio` | Open Prisma Studio                        |

---

<div align="center">

**Designed & Developed by [BITSOL MARKETING](https://bitsolmarketing.com)**
_Empowering Businesses with Artificial Intelligence._

</div>
