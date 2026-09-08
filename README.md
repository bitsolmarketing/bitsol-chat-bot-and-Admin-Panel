# BITSOL AI Assistant

One enterprise-grade AI assistant serving **two businesses** under the BITSOL
umbrella, with a strict wall between them:

| | |
| --- | --- |
| 🏢 **BITSOL Marketing** | Business services, digital solutions, AI automation, software development |
| 🎓 **BITSOL Institute of Digital Media & Artificial Intelligence** | Admissions, learning, student services, career guidance |

The assistant works out which business a visitor needs, remembers that choice
for the rest of the conversation, lets them switch at any time — and never mixes
information between the two.

> **Powered by Artificial Intelligence**
> **Designed & Developed by [BITSOL MARKETING](https://bitsolmarketing.com)** —
> _Empowering Businesses & Learners with Artificial Intelligence._

---

## ✨ What's inside

**Conversational layer**
- 👋 Welcome screen: *"Please choose how I can assist you today — 🏢 BITSOL Marketing / 🎓 BITSOL Institute"*
- 🧭 **Department router** — infers the business from the message, sticks to it,
  detects switches, and asks the clarifying question when it genuinely can't tell
- 🌐 **English · Urdu · Roman Urdu · Punjabi**, with RTL rendering and tolerance
  for spelling mistakes, abbreviations and mixed-language input
- 🎨 The whole UI re-themes to the routed brand (blue for Marketing, emerald for Institute)
- 📋 Per-business menu panel, suggestions and quick replies
- 📝 In-chat workflow forms — quote request, consultation booking, admission
  inquiry, support ticket, career guidance — each issuing a real reference number
- 🎙️ Voice input & voice responses, image/PDF attachment, human handoff with ticketing
- 🟢 **The same assistant on WhatsApp** — Meta Cloud API webhook, tappable menus
  and lists, one-question-at-a-time lead & admission capture, human handoff.
  Same router, same knowledge bases, same reference numbers. See
  [WhatsApp chatbot](#-whatsapp-chatbot).

**Business logic**
- 🏢 11 marketing services, each with overview · benefits · features · process ·
  pricing placeholder · portfolio · FAQ · book meeting · request quote
- 🎓 16 institute courses, each with overview · curriculum · duration · fees ·
  instalments · trainer · careers · projects · certification · enroll
- 🗂️ Two physically separate knowledge bases (`knowledge_base_marketing`,
  `knowledge_base_institute`)

**Admin console** (`/admin`)
- Dashboard with today's chats, both lead pipelines, revenue, popular
  services/courses, open tickets, upcoming meetings & batches, conversion rate,
  satisfaction and a live activity feed
- CRM with **separate pipelines** — marketing leads and admission inquiries —
  plus customers, students, notes, follow-ups and reminders. Every row carries
  its **source**, so web-chat and WhatsApp leads land in the same board and can
  be filtered apart
- **WhatsApp Inbox** — every number that has messaged the business line, whether
  the 24-hour reply window is still open, and the transcript it produced
- Catalogue: services, projects, portfolio, courses, batches, faculty
- Knowledge Base CMS with publish states, versioning and AI indexing
- Support tickets, meetings, quotations, events, media & documents
- WhatsApp templates, broadcasts, notification queue
- Reports & analytics, users, roles & permissions, settings, integrations, logs, AI training

**Platform**
- 🔐 JWT auth, RBAC (roles + permissions), **department-scoped access** enforced
  in the data layer, edge middleware, rate limiting, audit logging
- 🧠 Provider-agnostic AI — Claude (default), any OpenAI-compatible API, local
  Ollama, or Gemini — switched by one env var
- 🐳 Docker, docker-compose, health probe, deployment docs

---

## 🧱 Tech stack

| Layer         | Technology                                                        |
| ------------- | ----------------------------------------------------------------- |
| Framework     | **Next.js 15** (App Router) · **React 19** · **TypeScript**        |
| UI            | **Tailwind CSS** · shadcn/ui-style primitives · **Framer Motion** · **Lucide** |
| Backend       | Next.js **Route Handlers** (Node runtime)                          |
| Database      | **PostgreSQL** via **Prisma ORM**                                  |
| Cache / limit | **Redis** (optional; fails open in dev)                            |
| Auth          | **JWT** (`jose`) + **bcrypt**, RBAC, department scoping            |
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

Open **http://localhost:3000** → **Start a conversation** (or go to `/chat`).
The admin console is at **/admin**.

Seeded accounts (change these before any real deploy):

| Account | Email | Scope |
| --- | --- | --- |
| Super Admin | `admin@bitsol.local` | Both businesses |
| Sales Agent | `sales@bitsol.local` | BITSOL Marketing only |
| Admissions Officer | `admissions@bitsol.local` | BITSOL Institute only |

Passwords come from `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD`
(default `ChangeMe#2024`).

---

## 🤖 Choosing an AI provider

Set `AI_PROVIDER` in `.env`:

| `AI_PROVIDER` | Uses                              | Required env                          |
| ------------- | --------------------------------- | ------------------------------------- |
| `claude`      | Anthropic Claude (default)        | `ANTHROPIC_API_KEY`, `AI_MODEL`       |
| `openai`      | OpenAI / Azure / Together / etc.  | `OPENAI_API_KEY`, `OPENAI_BASE_URL`   |
| `ollama`      | Local Ollama (OpenAI-compatible)  | `OPENAI_BASE_URL=http://localhost:11434/v1` |
| `gemini`      | Google Gemini                     | `GEMINI_API_KEY`, `AI_MODEL`          |

`AI_MODEL` defaults to `claude-opus-4-8`. Set `AI_THINKING=true` for Claude
adaptive thinking (deeper, slower).

Without a key the UI still runs — sending a message shows a graceful error.

---

## 🧭 How department routing works

```
User message
   │
   ├─ Explicit pick from the welcome menu / switcher?      → use it
   ├─ Names a business ("BITSOL Institute", 🎓)?           → use it
   ├─ Strong keyword signal in this message?               → use it
   │     (and if it contradicts the current department by a
   │      wide margin, treat it as a department switch)
   ├─ Department already pinned to the conversation?       → keep it
   ├─ Signal anywhere in recent history?                   → use it
   └─ Otherwise                                            → ask:
        "Would you like help with BITSOL Marketing services
         or BITSOL Institute admissions and courses?"
```

The decision is made in [`src/lib/ai/router.ts`](src/lib/ai/router.ts) before any
tokens are generated, streamed to the browser as a `meta` SSE event (so the UI
re-themes immediately), and persisted on the conversation.

Separation is enforced at three layers:

1. **Data** — `retrieveKnowledge(department, …)` has no unscoped mode, and the two
   knowledge bases are different tables.
2. **Prompt** — the department system prompt forbids discussing the other
   business beyond offering to switch.
3. **Access** — staff scoped to one business cannot read the other's records,
   checked in `src/lib/admin/queries.ts` and every admin API route.

---

## 🟢 WhatsApp chatbot

The WhatsApp channel is the same assistant, not a second one. A message arriving
on the business number goes through `planAssistantTurn()` exactly like a web
message: same department router, same knowledge bases, same language detection.

```
Customer on WhatsApp
   │
   ▼
POST /webhook               ── X-Hub-Signature-256 verified, else 401
   │
   ├─ Message id already seen?  → stop (Meta retries are harmless)
   ├─ Contact upserted, thread resolved (24h window → same conversation)
   │
   ├─ Mid-capture?              → next form question   (capture.ts)
   ├─ Tapped a menu button?     → department / quote / handoff
   ├─ Asked for a human?        → ticket + team notification
   ├─ Quote / admission intent? → start capture
   └─ Otherwise                 → AI answer + quick-action buttons
   │
   ▼
Lead or Admission written with source = WHATSAPP → visible in /admin/crm/*
```

**Why the capture is a state machine, not a prompt.** WhatsApp has no forms, so
the eight fields the CRM needs are asked one message at a time and the progress
is stored in `conversations.capture`. Every webhook delivery is a cold start, so
the step index has to live in the database. Most steps are tappable buttons or
lists — nobody types a budget range correctly in four languages. See
[`src/lib/whatsapp/capture.ts`](src/lib/whatsapp/capture.ts).

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
- **`menu`** returns anyone to the business picker; **`stop`** opts them out of
  broadcasts (they can still chat).

---

## 📁 Project structure

```
.
├── prisma/
│   ├── schema.prisma              # dual-department domain model
│   └── seed.ts                    # RBAC, users, catalogues, KBs, settings
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # staff sign-in / register
│   │   ├── (chat)/chat/           # the assistant
│   │   ├── (admin)/admin/         # admin console (26 modules)
│   │   ├── about/  page.tsx  layout.tsx  globals.css
│   │   └── api/
│   │       ├── chat/              # streaming chat (SSE) + routing
│   │       ├── whatsapp/webhook/  # Meta Cloud API webhook (verify + receive)
│   │       ├── leads/ admissions/ meetings/ tickets/
│   │       ├── catalog/ search/ health/ auth/
│   │       └── admin/             # record updates, CRM activities
│   ├── components/
│   │   ├── chat/                  # ChatWindow, DepartmentPicker, MenuPanel, WorkflowForm
│   │   ├── admin/                 # AdminShell, nav, tables, status controls
│   │   ├── branding/ splash/ ui/
│   ├── data/
│   │   ├── marketing/             # services · knowledge base · menu
│   │   ├── institute/             # courses  · knowledge base · menu
│   │   └── index.ts               # department content registry
│   ├── lib/
│   │   ├── brands.ts              # the two business profiles
│   │   ├── i18n.ts                # EN / UR / Roman UR / PA
│   │   ├── ai/                    # router · retrieval · prompts · intents · providers
│   │   ├── whatsapp/              # Cloud API client · parser · capture · handler
│   │   ├── admin/queries.ts       # scoped, failure-tolerant data access
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

Pricing and fees ship as **clearly-labelled placeholders**, and contact details
as representative defaults. The assistant always presents them as indicative and
offers a written quotation or an admissions call for the real figure — but they
must still be reviewed:

1. `src/data/marketing/services.ts` — service pricing
2. `src/data/institute/courses.ts` — course fees and instalment plans
3. `src/lib/brands.ts` — phone, WhatsApp, email, address and hours for both businesses
4. Re-run `npm run db:seed` to push the changes into the database

---

## 📜 Scripts

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Start the dev server                      |
| `npm run build`         | Production build (runs `prisma generate`) |
| `npm start`             | Start the production server               |
| `npm run typecheck`     | TypeScript check                          |
| `npm run prisma:migrate`| Create/apply a dev migration              |
| `npm run db:seed`       | Seed RBAC, catalogues and knowledge bases |
| `npm run prisma:studio` | Open Prisma Studio                        |

---

<div align="center">

**Designed & Developed by [BITSOL MARKETING](https://bitsolmarketing.com)**
_Empowering Businesses & Learners with Artificial Intelligence._

</div>
