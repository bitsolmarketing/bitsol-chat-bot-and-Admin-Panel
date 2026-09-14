# WhatsApp Growth Assistant — BITSOL Marketing

_How the WhatsApp assistant is built, what it does, and how to run and change it._

The assistant on BITSOL Marketing's WhatsApp number is a sales assistant,
support desk, lead qualification engine and handover system in one. Customers
can tap through menus or just write the way they talk. Either way, every
conversation heads for one of six outcomes: **lead captured, quote requested,
demo booked, strategy call booked, customer supported, or a person takes
over**.

---

## 1. Architecture

```
WhatsApp ─▶ Cloud API ─▶ POST /webhook ─▶ handler.ts
                                             │  signature, rate limit, contact,
                                             │  thread (24h), attribution, idempotency
                                             ▼
                                   engine.ts  runTurn()
                 ┌───────────────────────────┼──────────────────────────────┐
                 │ detect.ts                 │ flows (config)               │ scoring.ts
                 │ intents · industry ·      │ one question per message,    │ weights + bands
                 │ enterprise · frustration  │ skip what's known            │ from config
                 │ · opt-out · greetings     │                              │
                 └───────────────────────────┼──────────────────────────────┘
                                             │ Effects
                                             ▼
                        BotRuntime (whatsapp-runtime.ts)
          send ─▶ Cloud API + transcript     reply/extract ─▶ AI provider
          commit ─▶ leads · quotes · tickets · meetings · handovers · alerts ·
                    opt-out · bot_events ─▶ notifications per team
                                             │
                                             ▼
               Admin console: CRM · Chatbot Studio · Simulator · Analytics
```

| Layer | File | Responsibility |
| --- | --- | --- |
| Transport | `src/lib/whatsapp/handler.ts` | Contact, thread, attribution, idempotency; runs the engine; saves the turn |
| Engine | `src/lib/bot/engine.ts` | Routing, menus, flows, handover, enterprise mode, pricing, proof, scoring alerts |
| Detection | `src/lib/bot/detect.ts` | Intents (EN / Roman Urdu / Urdu), frustration, human request, opt-out, enterprise, industry |
| Scoring | `src/lib/bot/scoring.ts` | Points, bands, budget parsing |
| Country | `src/lib/bot/country.ts` | Stated country → website domain → phone code (US/Canada by area code) |
| Attribution | `src/lib/bot/source.ts` | Click-to-WhatsApp referral, `ref:` codes, broadcast replies |
| Rendering | `src/lib/bot/render.ts` | Buttons vs lists, paging, WhatsApp length limits, emoji-safe trimming |
| Runtime | `src/lib/bot/whatsapp-runtime.ts` | Every effect executed against WhatsApp, the model and the CRM |
| AI calls | `src/lib/bot/ai.ts` | Representative reply, detail extraction, translation, handover briefing |
| Config | `src/lib/bot/schema.ts`, `config.ts` | Validated sections, stored in `settings` as `bot.<section>` |
| Defaults | `src/data/marketing/bot/` | Menus, service explainers, flows, copy, pricing, scoring… |
| Follow-up | `src/lib/bot/followup.ts` | Check-ins for quiet qualified leads |
| Analytics | `src/lib/bot/analytics.ts` | Metrics for the six dashboards |

**Why an engine plus a runtime.** The engine decides *what happens*. The runtime
does the I/O. The same engine runs behind the webhook, inside the console
simulator (where nothing is sent or saved), and under `npm test` with a fake
runtime, so whole conversations are tested without Meta, a model or a database.

**Why keywords decide and the model talks.** Routing uses deterministic keyword
detection: whether to start a flow, open a ticket or enter enterprise mode.
It is instant, free and predictable. The model writes open-ended answers
from the knowledge base, and a separate JSON call reads the customer's details
back out. Those details are validated before they reach the CRM
(`src/lib/ai/customer.ts`).

---

## 2. Message precedence

For every inbound message, first match wins:

1. **Opt-out**: `STOP`, `UNSUBSCRIBE`, `DON'T MESSAGE`, `REMOVE ME`, `band karo`… (short messages only). The contact is opted out and the lead marked `OPTED_OUT` right away. `start` opts back in.
2. **A person has the thread.** Staff paused the assistant, or `handover.pauseBot` is on. The message is recorded and the assistant says nothing.
3. **Taps.** Menu rows, buttons and flow answers (ids below). Buttons from the previous bot version (`act:*`) still work.
4. **`menu` / greetings.** Main menu. A greeting in the middle of a flow re-asks the open question instead.
5. **Upset, or asking for a person.** Immediate handover with a full summary, to the team for the current topic. If there is no topic yet, the customer picks a team.
6. **Enterprise signals.** 200+ employees, 3+ branches, or phrases like "AI transformation", "large CRM" (all configurable). The customer gets the enterprise message, and the enterprise team gets a silent, urgent handover.
7. **An open flow.** The message answers the pending question. A *question* is answered first and then the flow resumes, and a new quote or demo request replaces the flow.
8. **Natural language.** "quote" starts the quote flow, "demo" the demo flow, and billing or support problems the support flow, with the message used as the issue. Anything else gets a representative's answer grounded in the matching service explainer, plus that intent's buttons. Buttons are held back when the answer ends on a question.

Reply ids: `n:<node>[:page]` menu node · `a:<action>` button · `c:<field>:<i>` flow choice · `q:<field>:<i>` quick answer · `s:<field>` skip · `y:name` / `o:name` name confirmation · `p:<field>:<page>` next page of choices.

---

## 3. Menu hierarchy

Menus are lists (up to 10 rows). A longer menu is paged behind "➡️ More options", and every sub-menu ends with 🏠 Main Menu. Service explainers use buttons (up to 3) with a "Type *menu* anytime" footer, or a list when there are four actions.

```
🏠 Main Menu
├─ 🚀 Grow My Business ── 🎯 Generate More Leads [flow lead_generation] · 💰 Increase Sales ·
│                         📣 Improve Advertising · 🔍 More Google Traffic · 📱 Grow Social Media ·
│                         🤖 Automate My Business · 🌐 Improve My Website · 🧠 Growth Strategy
│                         [flow growth, goal-specific questions] · 👨‍💻 Talk to an Expert
├─ 🤖 AI & Automation ── AI Agents · AI Chatbots · Business Automation · n8n · CRM Automation ·
│                         AI Sales Agent · AI Customer Support · AI Receptionist ·
│                         Workflow Automation · Custom AI  → [Book Consultation · Get Quote · Talk to Expert]
├─ 📱 WhatsApp Solutions ─ WhatsApp AI Chatbot · 🚀 WhatBot Pro · Team Inbox · Lead Management ·
│                         Broadcasts · Automation · Analytics · CRM Integration · Cloud API ·
│                         🎥 Book a Demo · 💰 Pricing · 👨‍💻 Talk to Sales
├─ 📈 Digital Marketing ── SEO (technical, local, international, e-commerce, enterprise, content,
│                         AI search, Google Maps) · Meta Ads · Google Ads (incl. YouTube) · TikTok ·
│                         LinkedIn · Social Media · Content · Lead Generation · Remarketing ·
│                         Marketing Analytics · Conversion (CRO)
├─ 🌐 Website & Software ─ Business Website · E-commerce · Web Application · Mobile App · AI Website ·
│                         Enterprise Platform · CRM Development · AI Software · Custom Software ·
│                         API Integration  → [📋 Plan My Project (project brief) · Consultation · Expert]
├─ 💼 Our Work & Results ─ Case Studies · Results · Websites · AI Projects · WhatsApp Projects ·
│                         Campaigns · Client Reviews · Industries  (verified entries only)
├─ 💰 Get a Quote          [flow quote]
├─ 👨‍💻 Talk to an Expert ── Sales · Marketing · AI & Automation · WhatsApp · Web & Software ·
│                         Enterprise · Support  (immediate handover)
└─ 🆘 Customer Support ─── WhatsApp · Existing Project · Technical · Campaign · WhatBot ·
                          Billing · Create Ticket [flow support] · 👨‍💻 Talk to Support
```

Every service explainer has five parts (what it does, who needs it, business benefits, example use cases, next step) and makes no claims about clients, figures or guaranteed results.

---

## 4. Flows

A flow asks one question per message and **skips any question already
answered**: earlier in the thread, in another flow, several at once ("I'm Sara
from Nova Clinics in Dubai"), from the website domain, or from the phone's
country code. Every question accepts free text; taps are a shortcut. Optional
questions offer ⏭️ Skip. A WhatsApp profile name is offered as a one-tap "Shall
I note your name as …?".

| Flow | Asks | Creates | Ends with |
| --- | --- | --- | --- |
| `lead_generation` | customers wanted, lead source, name, business, website, country, industry, monthly leads, current marketing | Lead | Growth Plan · Quote · Strategy Call · Expert |
| `growth` | goal-specific: industry, sales/ads/social channels, ad spend, website, processes to automate, team size, challenge, name, business, country | Lead | Strategy Call · Quote · Expert |
| `quote` | name, business, website, country, industry, service, goal, challenge, timeline, budget | Lead + draft Quotation | Strategy Call · Expert · Main Menu |
| `project_brief` | business, website, platform, objective, features, deadline, budget, country, name | Lead + structured brief shown to the customer | Strategy Call · Expert · Main Menu |
| `support` | name, company, project, issue | Ticket `#BM-TKT-…` (billing/technical: handed to the team) | Main Menu |
| `demo` / `strategy_call` | name, business, industry or goal, day & time, meeting type | Meeting request, or a follow-up task when the time can't be dated | Pricing / Quote · Main Menu |
| `whatbot_setup` | name, business, industry, website, email | Lead (next action: onboarding) | Demo · Main Menu |
| `enterprise_requirements` | organisation, size, industry, requirements, timeline, budget, name, email | Lead + brief + urgent enterprise handover | Strategy Call · Enterprise Team |

Budgets are offered in rupees for Pakistan and in US dollars otherwise. The
defaults are USD bands from Under $500 to $10,000+, and PKR bands up to Rs 2.8M+.
When the country is unknown, the country is asked first.

---

## 5. Intents

`LEAD_GENERATION` `SEO` `META_ADS` `GOOGLE_ADS` `TIKTOK_ADS` `SOCIAL_MEDIA`
`WHATSAPP_CHATBOT` `WHATBOT_PRO` `AI_AUTOMATION` `AI_AGENT` `AI_SALES_AGENT`
`AI_CUSTOMER_SUPPORT` `N8N_AUTOMATION` `CRM` `WEBSITE` `E_COMMERCE` `SOFTWARE`
`MOBILE_APP` `BRANDING` `CONTENT` `PRICING` `QUOTE` `DEMO` `SUPPORT` `BILLING`
`PARTNERSHIP` `CAREER` `GENERAL_INQUIRY` `HUMAN_HANDOVER` `ENTERPRISE`

Each message gets a **service** (what it's about) and a **request** (what should
happen), for example `"quotation for Google Ads"` → service `GOOGLE_ADS`, request
`QUOTE`. Studio ▸ Intents & routing sets, per intent, the team it routes to, the
catalogue service, the explainer node, the buttons under an answer and extra
detection keywords. The extractor also labels the whole conversation, and that
label is stored on the lead as `intent`.

Example: _"I need a WhatsApp chatbot for my real estate business"_ →
`WHATSAPP_CHATBOT`, industry Real estate. The assistant answers, then offers
🎥 See a Demo · 💰 Get Pricing · 📋 Build My Chatbot · 💬 Talk to Sales, in
Roman Urdu when the customer writes in Roman Urdu.

---

## 6. Lead scoring

| Signal | Points |
| --- | --- |
| Business identified (company or industry) | 10 |
| Website provided | 10 |
| Clear service requirement | 10 |
| Budget provided (not "not sure") | 10 |
| Immediate timeline (tap or words: ASAP, this week, foran…) | 10 |
| Enterprise | 15 |
| High budget ($10k+, or the equivalent — "Rs 28 lakh", "£8k") | 15 |
| Wants a strategy call | 10 |
| Wants a demo | 10 |

Bands: **0–30 Cold · 31–60 Warm · 61–80 Hot · 81–100 High Priority**. Weights,
thresholds and the dollar threshold are all configurable. The score, band and
reasons are written to the lead on every turn. When a lead first reaches a
notifying band (Hot, High Priority), the team gets a 🔥 alert with the full
summary. Priority rises (Hot → High, High Priority → Urgent), the stage moves to
`HOT` and an activity is logged.

---

## 7. CRM record

`marketing_leads` holds everything in the brief:

| Field | Column |
| --- | --- |
| lead_id | `id`, `reference` (BM-LEAD-…) |
| name, phone, email, company, website, country, city | same names |
| industry | `businessType` |
| service, sub_service, intent | `serviceSlug`, `subService`, `intent` |
| business_goal, challenge, budget, timeline | `businessGoal`, `challenge`, `budget`, `timeline` |
| lead_score, lead_temperature | `score`, `temperature`, `scoreReasons` |
| source, campaign, ad_id | `source` (channel), `trafficSource`, `campaign`, `adId` |
| conversation_id | `conversationId` |
| assigned_team, assigned_agent | `assignedTeam`, `ownerId` (least-busy owner from the team's `ownerEmails`) |
| status | `stage` |
| created_at, updated_at | same |
| last_message, conversation_summary, next_action | `lastMessage`, `lastMessageAt`, `conversationSummary`, `nextAction` |
| opt_in_status | `optInStatus` |
| follow-up tracking | `followUpCount`, `lastFollowUpAt` |

**Statuses:** `NEW` `CONTACTED` `QUALIFIED` `HOT` `PROPOSAL_SENT` (Proposal)
`NEGOTIATION` `WON` `LOST` `FOLLOW_UP` `SUPPORT` `SPAM` `OPTED_OUT`.

The assistant moves leads forward only: New → Qualified (Warm), → Hot, → Follow
up. It never moves a lead backwards, and never overrides a stage the team set
beyond those.

---

## 8. Human handover

Triggered by: an explicit request · frustration or complaint · billing and
technical tickets · enterprise signals · a finished enterprise requirements flow ·
two answers in a row the assistant was unsure of (the customer is *offered* a
person).

The team receives a notification (to the team's inboxes, or the sales inbox) and
a ticket containing:

```
CUSTOMER / COMPANY / COUNTRY / INTENT / SERVICE / REQUIREMENT / CHALLENGE /
BUDGET / TIMELINE / LEAD SCORE (+ reasons) / TEAM / WHY / PREVIOUS SELECTIONS
CONVERSATION SUMMARY: (model-written briefing, or the customer's last messages)
RECOMMENDED ACTION: (e.g. "Senior consultant to call within one business hour")
```

The customer gets the ticket reference and phone number. Outside business hours
they are told when the team is back. A second request to the same team within 12
hours reuses the first ticket.

**In the console** (Conversation page): reply to the customer as a person
(inside the 24-hour window), and pause or resume the assistant. Pausing keeps the
transcript and silences the assistant, and resuming closes the handover.

---

## 9. Smart follow-up

`GET /api/cron/follow-ups` with `Authorization: Bearer $CRON_SECRET`, every 15–30
minutes. Qualified leads (Warm, Hot, High Priority by default) that went quiet
get one check-in per step (defaults: 4 h and 22 h after their last message):

> Hi Sara 👋 Just checking in regarding your WhatsApp AI Chatbot requirement.
> Would you like us to: 📅 Schedule a Call · 💰 Get a Quote · 💬 Continue Here

It never sends to opted-out or blocked contacts, to a thread a person is handling,
when the customer is waiting on *us*, to won, lost, spam or support leads, or
outside business hours. Steps past WhatsApp's 24-hour window need an approved
template (`followUp.template`); without one they are skipped and reported. The
count resets whenever the customer writes again.

---

## 10. Source tracking

| Where | How it's detected | Stored |
| --- | --- | --- |
| Meta click-to-WhatsApp ad | `referral.source_type = ad` on the first message | `META_ADS`, `adId`, headline as `campaign`, raw `referral` |
| Boosted Facebook/Instagram post | `referral` without `ad` | `FACEBOOK` / `INSTAGRAM` |
| Website, QR code, Instagram bio, TikTok, Google Ads | `ref:<code>[:campaign]` in the prefilled text, e.g. `https://wa.me/923120141581?text=Hi%20BITSOL%20ref:qr:expo24` | code → source from Studio ▸ Source tracking; unknown codes → `CAMPAIGN` |
| Broadcast | contact messages within 7 days of receiving one | `BROADCAST`, broadcast title |
| Anything else | — | `DIRECT_WHATSAPP` |

The `ref:` code is removed before the assistant reads the message. Attribution is
copied onto the lead.

---

## 11. Admin control — Chatbot Studio (`/admin/chatbot`)

Every section is editable without code, validated as you type and again on save.
A save is refused if it would point at menus, flows or buttons that don't exist.
"Reset to default" restores the shipped section. Changes reach the assistant
within 30 seconds, and the website chat uses the same contact details, voice and
pricing.

| Business | Conversation | Automation |
| --- | --- | --- |
| Contact details & WhatsApp numbers | AI personality | Intents & routing |
| Business hours | Welcome & all messages | Lead scoring |
| Teams, departments & members | Menu items & services | Enterprise detection |
| **Pricing** (the only prices ever quoted) | Buttons | Human handover |
| Our work & results (verified only) | Qualification questions | Follow-up timing & template |
| | Answer options (services, budgets, timelines) | Source tracking |
| | Markets (countries, currencies) | Broadcast categories |

**Simulator** (`/admin/chatbot/simulator`): a WhatsApp-style chat with the live
config and model. Buttons and lists work as they do on a phone, and a side panel
shows the profile, flow and score, plus exactly what the team *would* receive.
Nothing is sent or saved.

---

## 12. Analytics (`/admin/chatbot/analytics`)

One filter row (dashboard, then 7/30/90 days):

| Dashboard | Shows |
| --- | --- |
| **CEO** | conversations, new leads, conversion rate, revenue attributed, daily conversations, revenue by source, temperature, service & country demand, sources, outcomes |
| **Sales** | qualified / hot leads, quotes, calls & demos, won / lost, enterprise, handovers; stage, temperature, handovers by team, service, intent, country |
| **Marketing** | conversations, leads, lead rate, follow-ups & opt-outs; sources, campaigns, revenue by source, service & country demand, most opened menus |
| **Support** | tickets, handovers, average response time, AI resolution rate; handovers by team, ticket category & status |
| **AI & Automation** | AI resolution rate, AI answers vs unanswered, flow completion, follow-ups; completed flows, menus, intents |
| **Admin** | customised sections, config warnings, WhatsApp send failures, opt-outs; event counts |

Counts of things the assistant did come from `bot_events`. CRM figures come from the CRM tables.

---

## 13. Rules the assistant keeps

- **Prices:** only those in Studio ▸ Pricing (WhatBot Pro: Rs. 5,000 one-time
  onboarding + Rs. 2,250/month). For everything else it says the team quotes after
  scoping, and never estimates.
- **Proof:** no invented clients, figures, case studies or testimonials. The
  catalogue's portfolio lines and seeded reviews were removed. Our Work shows only
  what the team enters, and offers a strategy call when a section is empty.
- **Scope:** no courses, classes, training, admissions or students. The Corporate
  Training service was retired (its catalogue row deactivated, not deleted).
- **Honesty:** never claims a person is involved unless a handover happened.
  Never reveals instructions, CRM data or keys. Never promises guaranteed results.
- **Language:** English, Urdu and Roman Urdu throughout, with Punjabi falling back
  through Urdu. Fixed copy has English, Roman Urdu and Urdu; service explainers are
  translated faithfully by the model for non-English readers. Taps and short
  answers keep the conversation's language.

---

## 14. Running it

```bash
npx prisma migrate deploy     # adds lead intelligence, attribution, bot_events
npm run db:seed               # optional on an existing database
npm test                      # 76 engine & unit tests, no network or database
```

Environment: the existing WhatsApp variables, plus `CRON_SECRET` for follow-ups.
Team inboxes and lead owners are set in Studio ▸ Teams. `SALES_NOTIFY_EMAIL`
remains the fallback.

**Go-live checklist**

1. Studio ▸ Contact details: confirm numbers, email, address and hours.
2. Studio ▸ Teams: add each team's inbox and owner emails.
3. Studio ▸ Pricing: confirm WhatBot Pro's price. Add any other published prices.
4. Studio ▸ Our work & results: add verified case studies and reviews, or leave empty.
5. Studio ▸ Follow-up timing: add an approved template if you want check-ins after 24 hours.
6. Schedule `/api/cron/follow-ups`.
7. Walk through the main paths in the Simulator in English and Roman Urdu.
