import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_BOT_CONFIG } from "@/data/marketing/bot";
import { acceptText, matchOption } from "../engine";
import { countryFromPhone, countryFromWebsite, detectCountry } from "../country";
import { classify, detectEnterprise, detectIndustry, isFrustrated, isGreetingOnly, isOptOut, isQuestion, wantsHuman } from "../detect";
import { isOpen, nextOpening } from "../hours";
import { clampText, offer } from "../render";
import { botConfigSchema, crossReferenceIssues, sectionSchemas } from "../schema";
import { budgetInUsd, scoreLead, temperatureFor } from "../scoring";
import { attribute, stripRefCode } from "../source";
import { fill, pick } from "../text";
import { emptyBotState, readBotState } from "../types";

const config = DEFAULT_BOT_CONFIG;

describe("default configuration", () => {
  it("passes its own schema with no dangling references", () => {
    const parsed = botConfigSchema.safeParse(config);
    assert.ok(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3)));
    assert.deepEqual(crossReferenceIssues(parsed.data), []);
  });

  it("keeps every title inside WhatsApp's limits", () => {
    for (const [id, node] of Object.entries(config.menu.nodes)) {
      for (const title of Object.values(node.title)) assert.ok(!title || title.length <= 24, `${id}: ${title}`);
    }
    for (const [id, action] of Object.entries(config.actions)) {
      for (const title of Object.values(action.title)) assert.ok(!title || title.length <= 20, `${id}: ${title}`);
    }
  });

  it("publishes WhatBot Pro's price and no other", () => {
    assert.deepEqual(config.pricing.map((entry) => entry.id), ["whatbot_pro"]);
    assert.match(config.pricing[0].summary.en, /Rs\. 5,000 one-time onboarding/);
    assert.match(config.pricing[0].summary.en, /Rs\. 2,250\/month/);
  });

  it("contains no training, course or admissions content", () => {
    // The personality instructions are the one place that names them — to say they are not offered.
    const { personality: _instructions, ...content } = config;
    const everything = JSON.stringify(content).toLowerCase().replaceAll("of course", "");
    for (const word of ["course", "admission", "student", "institute", "enrol", "classes", "training"]) {
      assert.ok(!everything.includes(word), `found "${word}"`);
    }
  });

  it("rejects a section with a broken value", () => {
    const result = sectionSchemas.businessHours.safeParse({ ...config.businessHours, open: "25:00" });
    assert.equal(result.success, false);
  });
});

describe("classification", () => {
  const cases: Array<[string, string, string | undefined, string | undefined]> = [
    ["I need a WhatsApp chatbot for my real estate business", "WHATSAPP_CHATBOT", "WHATSAPP_CHATBOT", undefined],
    ["How much does WhatBot Pro cost?", "WHATBOT_PRO", "WHATBOT_PRO", "PRICING"],
    ["Can you send me a quotation for Google Ads", "QUOTE", "GOOGLE_ADS", "QUOTE"],
    ["seo krwana hai apni website ki", "SEO", "SEO", undefined],
    ["We want to automate our workflows with n8n", "N8N_AUTOMATION", "N8N_AUTOMATION", undefined],
    ["My invoice is wrong", "BILLING", undefined, "BILLING"],
    ["Our chatbot you built is not working since yesterday", "SUPPORT", "AI_CUSTOMER_SUPPORT", "SUPPORT"],
    ["Are you hiring? I want to send my CV", "CAREER", undefined, "CAREER"],
    ["Can we become a reseller partner for WhatBot", "PARTNERSHIP", "WHATBOT_PRO", "PARTNERSHIP"],
    ["Hello, tell me about your company", "GENERAL_INQUIRY", undefined, undefined],
  ];
  for (const [message, primary, service, request] of cases) {
    it(message, () => {
      const result = classify(message, config);
      assert.equal(result.primary, primary);
      assert.equal(result.service, service);
      assert.equal(result.request, request);
    });
  }

  it("adds keywords configured by an administrator", () => {
    const custom = structuredClone(config);
    custom.intents.BRANDING!.keywords = ["visual identity refresh"];
    assert.equal(classify("We need a visual identity refresh", custom).primary, "BRANDING");
  });
});

describe("conversation signals", () => {
  it("detects requests for a person without tripping on job titles", () => {
    assert.ok(wantsHuman("Can I talk to someone?"));
    assert.ok(wantsHuman("kisi insaan se baat karwao"));
    assert.ok(!wantsHuman("I am the operations manager"));
  });

  it("detects frustration in English and Roman Urdu", () => {
    assert.ok(isFrustrated("this is a scam"));
    assert.ok(isFrustrated("bilkul bakwas service hai"));
  });

  it("only treats short messages as opt-outs", () => {
    assert.ok(isOptOut("STOP"));
    assert.ok(isOptOut("message mat karo"));
    assert.ok(!isOptOut("please don't stop the campaign we are running for the whole month"));
    assert.ok(!isOptOut("dont stop"));
  });

  it("recognises greetings and questions", () => {
    assert.ok(isGreetingOnly("Assalam o Alaikum"));
    assert.ok(isGreetingOnly("hi there!"));
    assert.ok(!isGreetingOnly("hi I need a website"));
    assert.ok(isQuestion("Do you work with clinics"));
    assert.ok(isQuestion("price?"));
    assert.ok(!isQuestion("ABC Realtors"));
  });

  it("labels industries", () => {
    assert.equal(detectIndustry("we run a dental clinic in Lahore"), "Healthcare");
    assert.equal(detectIndustry("ABC Realtors"), "Real estate");
    assert.equal(detectIndustry("Just looking"), undefined);
  });

  it("detects enterprises by headcount, branches and phrasing", () => {
    const rules = config.enterprise;
    assert.ok(detectEnterprise("We have 500 employees.", undefined, rules).enterprise);
    assert.equal(detectEnterprise("we have 1.2k staff", undefined, rules).reason, "1.2k staff");
    assert.ok(detectEnterprise("We operate 12 branches across Pakistan", undefined, rules).enterprise);
    assert.ok(detectEnterprise("We need a large CRM", undefined, rules).enterprise);
    assert.ok(detectEnterprise("tell me more", "1,000+ employees", rules).enterprise);
    assert.ok(!detectEnterprise("We are a team of 8 people", undefined, rules).enterprise);
  });
});

describe("countries", () => {
  const countries = config.countries;
  it("reads the country code of a number, telling the US and Canada apart", () => {
    assert.equal(countryFromPhone("+923001234567", countries)?.code, "PK");
    assert.equal(countryFromPhone("+971501234567", countries)?.code, "AE");
    assert.equal(countryFromPhone("+14165550123", countries)?.code, "CA");
    assert.equal(countryFromPhone("+12125550123", countries)?.code, "US");
    assert.equal(countryFromPhone("+33612345678", countries), undefined);
  });

  it("reads the website domain", () => {
    assert.equal(countryFromWebsite("https://shop.example.co.uk/about", countries)?.code, "GB");
    assert.equal(countryFromWebsite("example.com", countries), undefined);
  });

  it("prefers what the customer said over their number", () => {
    const match = detectCountry({ message: "our office is in Dubai", phone: "+923001234567" }, countries);
    assert.equal(match?.country.code, "AE");
    assert.equal(match?.via, "stated");
  });
});

describe("scoring", () => {
  it("converts budgets to dollars", () => {
    const rules = config.scoring;
    assert.equal(budgetInUsd("$10k", rules), 10_000);
    assert.equal(budgetInUsd("Rs 28 lakh", rules), 10_000);
    assert.equal(budgetInUsd("around 5,000 USD", rules), 5_000);
    assert.equal(budgetInUsd("Not sure", rules), null);
  });

  it("applies the bands", () => {
    assert.equal(temperatureFor(30, config.scoring.bands), "COLD");
    assert.equal(temperatureFor(31, config.scoring.bands), "WARM");
    assert.equal(temperatureFor(61, config.scoring.bands), "HOT");
    assert.equal(temperatureFor(81, config.scoring.bands), "HIGH_PRIORITY");
  });

  it("scores the example from the brief as high priority", () => {
    const state = emptyBotState();
    state.signals = { enterprise: true, wantsCall: true, wantsDemo: true };
    const score = scoreLead(
      {
        company: "ABC Group",
        website: "abcgroup.com",
        service: "software-development",
        budget: "$10,000+",
        timeline: "Immediately",
      },
      state,
      config
    );
    assert.equal(score.value, 100);
    assert.equal(score.temperature, "HIGH_PRIORITY");
    assert.equal(score.reasons.length, 9);
  });

  it("does not reward 'no website' or an unsure budget", () => {
    const score = scoreLead({ website: "No website yet", budget: "Not sure" }, emptyBotState(), config);
    assert.equal(score.value, 0);
  });
});

describe("attribution", () => {
  it("attributes a click-to-WhatsApp ad", () => {
    const result = attribute(
      { text: "Hi", referral: { source_type: "ad", source_id: "120200", headline: "Free WhatsApp demo" } },
      config.sources
    );
    assert.deepEqual([result.source, result.adId, result.campaign], ["META_ADS", "120200", "Free WhatsApp demo"]);
  });

  it("reads and strips a ref code", () => {
    const text = "Hi BITSOL ref:qr:expo24 I want a demo";
    const result = attribute({ text }, config.sources);
    assert.deepEqual([result.source, result.campaign], ["QR_CODE", "expo24"]);
    assert.equal(stripRefCode(text), "Hi BITSOL I want a demo");
  });

  it("attributes a reply to a recent broadcast, and falls back to direct", () => {
    assert.equal(attribute({ text: "yes", recentBroadcast: { title: "Eid offer", reference: "B1" } }, config.sources).source, "BROADCAST");
    assert.equal(attribute({ text: "hello" }, config.sources).source, "DIRECT_WHATSAPP");
  });
});

describe("rendering", () => {
  const options = { listButton: "View options", moreTitle: "More options" };

  it("uses buttons for up to three short choices and a list otherwise", () => {
    const three = offer("Pick", [1, 2, 3].map((n) => ({ id: `${n}`, title: `Option ${n}` })), options);
    assert.equal(three[0].type, "buttons");
    const four = offer("Pick", [1, 2, 3, 4].map((n) => ({ id: `${n}`, title: `Option ${n}` })), options);
    assert.equal(four[0].type, "list");
  });

  it("moves a long body into its own message", () => {
    const out = offer("x".repeat(1500), [{ id: "a", title: "A" }], options);
    assert.deepEqual(out.map((message) => message.type), ["text", "buttons"]);
  });

  it("never splits an emoji when shortening a title", () => {
    const clamped = clampText("👨‍💻 Talk to an Expert about everything", 20);
    assert.ok(clamped.startsWith("👨‍💻"));
    assert.ok(clamped.length <= 20);
    assert.ok(!/[\uD800-\uDBFF]…$/.test(clamped));
  });
});

describe("text", () => {
  it("drops optional segments whose placeholders are empty", () => {
    assert.equal(fill("Thanks[[, {name}]]!", { name: "Sara" }), "Thanks, Sara!");
    assert.equal(fill("Thanks[[, {name}]]!", {}), "Thanks!");
  });

  it("falls back from Urdu script to Roman Urdu before English", () => {
    assert.equal(pick({ en: "Hello", ur_roman: "Salam" }, "ur"), "Salam");
    assert.equal(pick({ en: "Hello" }, "pa"), "Hello");
  });

  it("reads stored state defensively", () => {
    const state = readBotState({ flow: { id: "quote" }, trail: ["a", 3] });
    assert.deepEqual(state.trail, ["a"]);
    assert.deepEqual(state.signals, {});
  });
});

describe("answers", () => {
  it("matches typed options by number, value and title", () => {
    const options = config.options.timelines;
    assert.equal(matchOption("1", options, "en")?.value, "Immediately");
    assert.equal(matchOption("just exploring", options, "en")?.value, "Just exploring");
    assert.equal(matchOption("foran", options, "ur_roman")?.value, "Immediately");
    assert.equal(matchOption("next year", options, "en"), undefined);
  });

  it("validates typed answers", () => {
    assert.equal(acceptText("name", "My name is Sara Khan"), "Sara Khan");
    assert.equal(acceptText("name", "call me on 0300 1234567"), null);
    assert.equal(acceptText("website", "nahi hai"), "No website yet");
    assert.equal(acceptText("website", "no.com"), "no.com");
    assert.equal(acceptText("website", "novaclinics.ae"), "novaclinics.ae");
    assert.equal(acceptText("website", "we sell shoes"), null);
    assert.equal(acceptText("email", "sara@nova.ae"), "sara@nova.ae");
  });
});

describe("business hours", () => {
  const hours = config.businessHours;
  it("is open on a weekday afternoon in Pakistan and closed on Sunday", () => {
    assert.ok(isOpen(hours, new Date("2026-09-14T08:00:00Z")));
    assert.ok(!isOpen(hours, new Date("2026-09-13T08:00:00Z")));
    assert.equal(nextOpening(hours, new Date("2026-09-14T03:00:00Z")), "today at 10:00");
  });
});
