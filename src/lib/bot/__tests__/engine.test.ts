import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TestConversation, ids, textOf, titles } from "./harness";

describe("welcome and menus", () => {
  it("greets a new conversation with the welcome message and the nine main menu options", async () => {
    const chat = new TestConversation();
    const out = await chat.send("Hi");

    assert.equal(out.length, 1);
    assert.equal(out[0].type, "list");
    assert.match(textOf(out), /Welcome to BITSOL Marketing/);
    assert.deepEqual(ids(out), [
      "n:grow", "n:ai", "n:whatsapp", "n:marketing", "n:web", "n:work", "n:quote", "n:expert", "n:support",
    ]);
  });

  it("pages a menu longer than ten rows and ends every sub-menu with Main Menu", async () => {
    const chat = new TestConversation();
    const first = await chat.tap("n:whatsapp");
    const rows = ids(first);
    assert.equal(rows.length, 10);
    assert.equal(rows[9], "n:whatsapp:1");
    assert.match(textOf(first), /Turn WhatsApp into an intelligent sales/);

    const second = await chat.tap("n:whatsapp:1");
    assert.deepEqual(ids(second), ["n:wa_demo", "n:wa_pricing", "n:wa_sales", "a:main_menu"]);
  });

  it("explains a service in five parts with next-step buttons", async () => {
    const chat = new TestConversation();
    const out = await chat.tap("n:ai_agents");
    const body = textOf(out);
    for (const part of ["What it does", "Who needs it", "Business benefits", "Example use cases", "Next step"]) {
      assert.match(body, new RegExp(part));
    }
    assert.deepEqual(ids(out), ["a:book_consultation", "a:get_quote", "a:talk_to_expert"]);
    assert.equal(chat.details.service, "ai-agents");
    assert.equal(chat.state.intent, "AI_AGENT");
  });

  it("returns to the main menu on 'menu' and abandons an open flow", async () => {
    const chat = new TestConversation();
    await chat.tap("a:get_quote");
    assert.equal(chat.state.flow?.id, "quote");
    const out = await chat.send("menu");
    assert.equal(chat.state.flow, undefined);
    assert.ok(ids(out).includes("n:grow"));
  });

  it("answers a stale button with the main menu instead of failing", async () => {
    const chat = new TestConversation();
    const out = await chat.tap("n:does_not_exist");
    assert.match(textOf(out), /isn't available any more/);
    assert.ok(ids(out).includes("n:grow"));
  });

  it("maps buttons from the previous version of the bot", async () => {
    const chat = new TestConversation();
    const out = await chat.tap("act:human");
    assert.ok(ids(out).includes("n:expert_sales"));
  });
});

describe("natural language", () => {
  it("understands a WhatsApp chatbot request for a real estate business", async () => {
    const chat = new TestConversation();
    chat.aiReply = () =>
      "Absolutely. We can build a WhatsApp AI system for your real estate business that handles inquiries and qualifies buyers.";
    const out = await chat.send("I need a WhatsApp chatbot for my real estate business");

    assert.equal(chat.details.topic, "WHATSAPP_CHATBOT");
    assert.equal(chat.details.businessType, "Real estate");
    assert.equal(chat.replies[0].intent, "WHATSAPP_CHATBOT");
    assert.ok(chat.replies[0].knowledge[0]?.body.includes("WhatsApp AI Chatbot"));
    assert.match(textOf(out), /real estate business/);
    assert.deepEqual(ids(out), ["a:see_demo", "a:get_pricing", "a:build_my_chatbot", "a:talk_to_sales"]);
  });

  it("offers Roman Urdu buttons to a customer writing in Roman Urdu", async () => {
    const chat = new TestConversation({ language: "ur_roman" });
    chat.aiReply = () => "Bilkul! BITSOL aap ke business ke liye AI-powered WhatsApp chatbot bana sakta hai.";
    const out = await chat.send("mujhe apne business ke liye whatsapp chatbot chahiye");
    assert.ok(titles(out).includes("🎥 Demo Dekhein"));
    assert.equal(chat.details.topic, "WHATSAPP_CHATBOT");
  });

  it("holds back buttons when the reply is waiting on an answer", async () => {
    const chat = new TestConversation();
    chat.aiReply = () => "Happy to help with SEO. What's your website?";
    const out = await chat.send("I want better SEO for my shop");
    assert.equal(out.length, 1);
    assert.equal(out[0].type, "text");
  });

  it("starts the quote flow from a typed request and keeps the service mentioned", async () => {
    const chat = new TestConversation();
    await chat.send("Can I get a quote for SEO?");
    assert.equal(chat.state.flow?.id, "quote");
    assert.equal(chat.details.service, "seo");
    assert.ok(chat.events().includes("QUOTE_REQUESTED"));
  });

  it("remembers the company from earlier and never asks for it again", async () => {
    const chat = new TestConversation({ profileName: "Adeel" });
    chat.extractor = (text) => (/ABC Realtors/.test(text) ? { company: "ABC Realtors" } : {});
    await chat.send("My company is ABC Realtors.");
    await chat.send("I need WhatsApp automation.");
    assert.equal(chat.details.company, "ABC Realtors");

    await chat.tap("a:get_quote");
    await chat.tap("y:name");
    const asked = chat.sent.map((message) => textOf([message])).join("\n");
    assert.doesNotMatch(asked, /name of your business/);
  });

  it("offers a person after repeated answers the assistant was unsure of", async () => {
    const chat = new TestConversation();
    chat.aiReply = () => "I'm not sure about that — I can connect you with our team.";
    await chat.send("Do you integrate with our in-house ERP from 1998?");
    const out = await chat.send("What about the old mainframe?");
    assert.match(textOf(out), /bring in someone from our team/);
  });
});

describe("quote flow", () => {
  it("collects requirements one question at a time, skipping what it already knows", async () => {
    const chat = new TestConversation({ profileName: "Sara Khan", phone: "+971501234567" });

    let out = await chat.tap("a:get_quote");
    assert.match(textOf(out), /Let's understand your requirements/);
    assert.match(textOf(out), /Sara Khan/);
    assert.deepEqual(ids(out), ["y:name", "o:name"]);

    out = await chat.tap("y:name");
    assert.equal(chat.details.name, "Sara Khan");
    assert.match(textOf(out), /name of your business/);

    await chat.send("Nova Clinics");
    // "Clinics" already says healthcare, and the +971 number says UAE.
    assert.equal(chat.details.businessType, "Healthcare");
    assert.equal(chat.details.country, "UAE");

    out = await chat.send("novaclinics.ae");
    assert.equal(chat.details.website, "novaclinics.ae");
    // So neither the country nor the industry is asked: straight to the service.
    assert.doesNotMatch(textOf(out), /country|industry/i);
    assert.ok(ids(out).some((id) => id.startsWith("c:service:")));

    out = await chat.tap("c:service:5", "🤖 WhatsApp Chatbot");
    assert.equal(chat.details.service, "whatsapp-automation");
    assert.match(textOf(out), /main business goal/);

    await chat.send("Book more patient appointments");
    out = await chat.send("We miss messages after hours");
    assert.match(textOf(out), /get started/);

    out = await chat.tap("c:timeline:0", "⚡ Immediately");
    // UAE is not a PKR country, so budgets are offered in US dollars.
    assert.ok(titles(out).includes("$10,000+"));

    out = await chat.tap("c:budget:4", "$10,000+");
    assert.equal(chat.state.flow, undefined);
    assert.match(textOf(out), /Your requirements have been received/);
    assert.match(textOf(out), /BM-QTE-TEST/);
    assert.deepEqual(ids(out), ["a:book_strategy_call", "a:talk_to_expert", "a:main_menu"]);

    const quote = chat.effectsOf("quote")[0];
    assert.ok(quote, "a quote record is created");
    assert.equal(quote.score.value, 65);
    assert.equal(quote.score.temperature, "HOT");
    assert.ok(chat.events().includes("FLOW_COMPLETED"));
    assert.equal(chat.effectsOf("alert").length, 1, "the sales team is alerted to a hot lead once");
  });

  it("offers budgets in rupees to a business in Pakistan", async () => {
    const chat = new TestConversation({ phone: "+923001234567" });
    chat.details = { name: "Ali", company: "Ali Traders", website: "No website yet", businessType: "Retail", service: "seo", subService: "SEO", businessGoal: "More sales", challenge: "Low traffic", timeline: "1–3 months" };
    const out = await chat.tap("a:get_quote");
    assert.equal(chat.details.country, undefined);
    // Country is still unknown here (no typed message yet), so it is asked first.
    assert.ok(ids(out).some((id) => id.startsWith("c:country:")));
    const next = await chat.tap("c:country:0", "🇵🇰 Pakistan");
    assert.ok(titles(next).includes("Rs 2.8M+"));
  });

  it("answers a question asked mid-flow, then asks the pending question again", async () => {
    const chat = new TestConversation();
    await chat.tap("a:get_quote");
    await chat.send("Bilal");
    chat.aiReply = () => "Yes — we build WhatsApp systems for clinics.";
    const out = await chat.send("Do you work with clinics?");
    const body = textOf(out);
    assert.match(body, /we build WhatsApp systems for clinics/);
    assert.match(body, /Coming back to where we were/);
    assert.match(body, /name of your business/);
    assert.equal(chat.replies.at(-1)?.pendingQuestion, "What's the name of your business?");
  });

  it("accepts a typed option and a number instead of a tap", async () => {
    const chat = new TestConversation({ phone: "+923001234567" });
    chat.details = { name: "Ali", company: "Ali Traders", website: "No website yet", businessType: "Retail", country: "Pakistan" };
    await chat.tap("a:get_quote");
    await chat.send("google ads");
    assert.equal(chat.details.subService, "Google Ads");
    await chat.send("Grow sales");
    await chat.send("Too few leads");
    await chat.send("2");
    assert.equal(chat.details.timeline, "Within 2 weeks");
  });

  it("uses the welcome-back prompt when the customer greets mid-flow", async () => {
    const chat = new TestConversation();
    await chat.tap("a:get_quote");
    const out = await chat.send("hello");
    assert.match(textOf(out), /Coming back to where we were/);
  });
});

describe("other flows", () => {
  it("runs the lead generation flow and offers the four next steps", async () => {
    const chat = new TestConversation({ phone: "+923001234567" });
    await chat.tap("n:grow_leads");
    await chat.tap("c:customerType:0");
    await chat.tap("c:leadChannel:0");
    await chat.send("Hamza");
    await chat.send("Hamza Motors");
    await chat.tap("q:website:0");
    // Country came from the +92 number.
    assert.equal(chat.details.country, "Pakistan");
    await chat.send("Automotive dealership");
    await chat.tap("c:monthlyLeads:1");
    const out = await chat.tap("s:currentMarketing");

    assert.match(textOf(out), /clear picture of your business/);
    assert.deepEqual(ids(out), ["a:growth_plan", "a:get_quote", "a:book_strategy_call", "a:talk_to_expert"]);
    assert.equal(chat.details.businessGoal, "Generate more leads");

    const growth = await chat.tap("a:growth_plan");
    assert.match(textOf(growth), /prepare a plan/);
    assert.ok(chat.events().includes("GROWTH_PLAN_REQUESTED"));
  });

  it("creates a billing ticket, hands it to the billing team and quotes the ticket number", async () => {
    const chat = new TestConversation();
    await chat.tap("n:support");
    await chat.tap("n:support_billing");
    await chat.send("Ayesha");
    await chat.send("Glow Salon");
    await chat.send("WhatBot Pro subscription");
    const out = await chat.send("I was charged twice for September");

    assert.match(textOf(out), /Your support request has been created/);
    assert.match(textOf(out), /#BM-TKT-TEST/);
    const ticket = chat.effectsOf("ticket")[0];
    assert.equal(ticket.team, "BILLING");
    assert.equal(ticket.context.supportCategory, "BILLING");
    assert.equal(ticket.details.requirements, "I was charged twice for September");
    assert.ok(ticket.handover, "billing issues are handed to a person");
  });

  it("books a demo and records the demo signal for scoring", async () => {
    const chat = new TestConversation();
    chat.extractor = (text) => (/tomorrow/.test(text) ? { meetingDate: "2026-09-15", meetingTime: "3:00 PM" } : {});
    await chat.tap("n:wa_demo");
    await chat.send("Omar");
    await chat.send("Omar Foods");
    await chat.send("Restaurant");
    await chat.send("tomorrow at 3pm");
    const out = await chat.tap("c:meetingMode:0");

    assert.match(textOf(out), /Demo request received/);
    assert.match(textOf(out), /BM-MTG-TEST/);
    assert.equal(chat.state.signals.wantsDemo, true);
    assert.ok(chat.events().includes("DEMO_REQUESTED"));
  });

  it("keeps the customer's words when a meeting time cannot be dated", async () => {
    const chat = new TestConversation();
    await chat.tap("a:book_strategy_call");
    await chat.send("Nadia");
    await chat.send("Nadia Interiors");
    await chat.send("More premium clients");
    let out = await chat.send("sometime next week maybe");
    assert.match(textOf(out), /day and a time/);
    out = await chat.send("any evening works");
    const meeting = chat.effectsOf("meeting");
    assert.equal(meeting.length, 0, "not complete until the meeting type is answered or skipped");
    out = await chat.tap("s:meetingMode");
    assert.equal(chat.effectsOf("meeting")[0]?.note, "any evening works");
    assert.match(textOf(out), /Call request received/);
  });
});

describe("handover", () => {
  it("shows the team picker when nobody knows what the customer is about", async () => {
    const chat = new TestConversation();
    const out = await chat.send("I want to talk to a human");
    assert.ok(ids(out).includes("n:expert_enterprise"));
    assert.equal(chat.effectsOf("handover").length, 0);
  });

  it("hands over to the team for the service being discussed, with a full summary", async () => {
    const chat = new TestConversation({ profileName: "Kamran" });
    await chat.tap("n:wa_chatbot");
    const out = await chat.send("Can I talk to someone please");

    const handover = chat.effectsOf("handover")[0];
    assert.equal(handover.summary.team, "WHATSAPP");
    assert.match(handover.summary.text, /CUSTOMER: Kamran/);
    assert.match(handover.summary.text, /RECOMMENDED ACTION:/);
    assert.match(textOf(out), /WhatsApp Solutions\* team/);
    assert.match(textOf(out), /BM-TKT-HAND/);
  });

  it("does not open a second ticket for a repeated request", async () => {
    const chat = new TestConversation();
    await chat.tap("n:expert_sales");
    const out = await chat.tap("n:expert_sales");
    assert.equal(chat.effectsOf("handover").length, 1);
    assert.match(textOf(out), /already with our/);
  });

  it("escalates an upset customer straight away", async () => {
    const chat = new TestConversation();
    await chat.send("This is useless, nobody replied to my complaint");
    assert.equal(chat.effectsOf("handover").length, 1);
    assert.match(chat.effectsOf("handover")[0].summary.recommendedAction, /de-escalate/);
  });

  it("does not treat a job title as a request for a person", async () => {
    const chat = new TestConversation();
    await chat.send("I am the marketing manager at a hotel and we need more bookings");
    assert.equal(chat.effectsOf("handover").length, 0);
  });

  it("tells the customer when the team is back if it is outside business hours", async () => {
    const chat = new TestConversation();
    chat.now = new Date("2026-09-13T08:00:00Z"); // Sunday
    const out = await chat.tap("n:expert_marketing");
    assert.match(textOf(out), /offline right now — they're back tomorrow at 10:00/);
  });

  it("stays silent while a person has taken over the thread", async () => {
    const chat = new TestConversation();
    chat.botPaused = true;
    const out = await chat.send("Hello?");
    assert.equal(out.length, 0);
  });
});

describe("enterprise mode", () => {
  it("activates on headcount, alerts the enterprise team and offers enterprise next steps", async () => {
    const chat = new TestConversation();
    const out = await chat.send("We have 500 employees and need an AI transformation strategy");

    assert.match(textOf(out), /enterprise-level solution/);
    assert.deepEqual(ids(out), ["a:book_strategy_call", "a:submit_requirements", "a:enterprise_expert"]);
    assert.equal(chat.state.signals.enterprise, true);
    const handover = chat.effectsOf("handover")[0];
    assert.equal(handover.silent, true);
    assert.equal(handover.summary.team, "ENTERPRISE");
  });
});

describe("pricing and proof", () => {
  it("quotes WhatBot Pro's published price", async () => {
    const chat = new TestConversation();
    await chat.tap("n:whatbot");
    const out = await chat.tap("a:view_pricing");
    assert.match(textOf(out), /Rs\. 5,000 one-time onboarding/);
    assert.match(textOf(out), /Rs\. 2,250\/month/);
    assert.ok(chat.events().includes("PRICING_VIEWED"));
  });

  it("never invents a price for a service without published pricing", async () => {
    const chat = new TestConversation();
    await chat.tap("n:seo");
    const out = await chat.tap("a:view_pricing");
    assert.match(textOf(out), /Pricing for SEO depends on your scope/);
    assert.doesNotMatch(textOf(out), /Rs\.|\$\d/);
  });

  it("offers a strategy call rather than inventing case studies", async () => {
    const chat = new TestConversation();
    const out = await chat.tap("n:work_case_studies");
    assert.match(textOf(out), /rather show you work that's relevant/);
  });
});

describe("subscription", () => {
  it("honours STOP immediately and records the opt-out", async () => {
    const chat = new TestConversation();
    await chat.tap("a:get_quote");
    const out = await chat.send("STOP");
    assert.equal(chat.optedOut, true);
    assert.equal(chat.state.flow, undefined);
    assert.match(textOf(out), /won't receive any more marketing messages/);
    assert.ok(chat.events().includes("OPTED_OUT"));
  });

  it("recognises the other opt-out phrasings", async () => {
    for (const phrase of ["UNSUBSCRIBE", "Don't message me", "remove me", "please stop messaging"]) {
      const chat = new TestConversation();
      await chat.send(phrase);
      assert.equal(chat.optedOut, true, phrase);
    }
  });

  it("opts back in on start", async () => {
    const chat = new TestConversation();
    await chat.send("stop");
    await chat.send("start");
    assert.equal(chat.optedOut, false);
  });
});
