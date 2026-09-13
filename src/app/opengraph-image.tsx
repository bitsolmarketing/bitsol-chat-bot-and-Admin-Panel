import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brands";
import { SEO } from "@/lib/site";

export const alt = SEO.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card used by every public page: WhatsApp, LinkedIn, Facebook, X. */
/** Montserrat TTFs: the renderer cannot read the woff2 files the site itself uses. */
const font = (file: string) => readFile(join(process.cwd(), "src/assets/fonts", file));

export default async function OpengraphImage() {
  const [extraBold, medium] = await Promise.all([
    font("Montserrat-ExtraBold.ttf"),
    font("Montserrat-Medium.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "Montserrat",
          color: "white",
          backgroundColor: "#050816",
          backgroundImage:
            "radial-gradient(900px 520px at 10% -10%, rgba(0,217,255,0.22), transparent 60%), radial-gradient(900px 560px at 95% 0%, rgba(124,58,237,0.38), transparent 62%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800 }}>
          BITSOL<span style={{ color: "#00D9FF" }}>.</span>
          <span style={{ marginLeft: 16, fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
            Marketing
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#00D9FF" }}>
            AI Concierge · 24/7
          </div>
          <div style={{ marginTop: 20, fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            AI Chatbots, WhatsApp Automation & AI Agents
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: "rgba(255,255,255,0.65)" }}>{BRAND.tagline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(255,255,255,0.5)" }}>
          <span>ai.bitsolmarketing.com</span>
          <span>English · Urdu · Roman Urdu · Punjabi</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: extraBold, weight: 800, style: "normal" },
        { name: "Montserrat", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
