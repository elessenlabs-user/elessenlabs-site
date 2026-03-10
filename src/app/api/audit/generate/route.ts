// src/app/api/audit/generate/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Protect this route with a secret so random users can't trigger generation.
 * Vercel env vars (Production + Preview):
 *   AUDIT_ENGINE_SECRET = <long-random-string>
 *
 * Call:
 *   curl -i -X POST "https://www.elessenlabs.com/api/audit/generate" \
 *     -H "x-audit-secret: <YOUR_SECRET>"
 */

export async function GET() {
  return NextResponse.json({ ok: true, message: "audit generator alive" });
}

function requireSecret(req: Request) {
  const expected = process.env.AUDIT_ENGINE_SECRET;
  if (!expected) return { ok: false, msg: "Missing AUDIT_ENGINE_SECRET env var." };

  const got = req.headers.get("x-audit-secret") || "";
  if (got !== expected) return { ok: false, msg: "Unauthorized." };

  return { ok: true, msg: "" };
}

function clip(s: string, max = 4000) {
  const t = (s || "").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

// very lightweight HTML signal extraction (no extra deps)
function extractSignals(html: string, url: string) {
  const text = html || "";

  const title =
    (text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
      .replace(/\s+/g, " ")
      .trim();

  const metaDescription =
    (text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || "")
      .trim();

  const h1 = uniq(
    Array.from(text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) =>
      m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    )
  ).slice(0, 5);

  const h2 = uniq(
    Array.from(text.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)).map((m) =>
      m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    )
  ).slice(0, 12);

  const ctas = uniq(
    Array.from(text.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)).map((m) =>
      m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    )
  )
    .filter((x) => x.length <= 60)
    .slice(0, 20);

  const links = uniq(
    Array.from(text.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)).map((m) => {
      const href = (m[1] || "").trim();
      const label = (m[2] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return `${label} -> ${href}`;
    })
  )
    .filter((x) => !x.includes("-> #"))
    .slice(0, 30);

  const hasPricing = /pricing|price|plan|plans|billing|subscription/i.test(text);
  const hasCheckout = /checkout|pay|payment|stripe/i.test(text);
  const hasEmailCapture = /type=["']email["']|newsletter|subscribe/i.test(text);

  const inputCount = (text.match(/<input\b/gi) || []).length;
  const formCount = (text.match(/<form\b/gi) || []).length;

  return {
    url,
    title,
    metaDescription,
    h1,
    h2,
    ctas,
    links,
    flags: { hasPricing, hasCheckout, hasEmailCapture },
    counts: { inputCount, formCount },
  };
}

async function captureScreenshot(url: string) {
  try {
    const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(
      url
    )}&screenshot=true&meta=false`;

    const res = await fetch(endpoint);
    const data = await res.json();

    return data?.data?.screenshot?.url || null;
  } catch {
    return null;
  }
}

const MARKERS = [
  { x: 200, y: 150, label: 1 },
  { x: 700, y: 150, label: 2 },
  { x: 1100, y: 150, label: 3 },
  { x: 650, y: 450, label: 4 },
  { x: 300, y: 720, label: 5 },
  { x: 1080, y: 720, label: 6 },
];

function clampMarker(marker: number) {
  if (!Number.isFinite(marker)) return 1;
  return Math.min(Math.max(Math.trunc(marker), 1), MARKERS.length);
}

function getMarkerConfig(marker: number) {
  return MARKERS[clampMarker(marker) - 1];
}

async function addScreenshotMarkers(imageUrl: string) {
  try {
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    const markersSvg = MARKERS.map(
      (m) => `
        <circle cx="${m.x}" cy="${m.y}" r="22" fill="#FF4D4F"/>
        <text x="${m.x}" y="${m.y + 8}" text-anchor="middle" font-size="18" font-weight="700" fill="white">${m.label}</text>
      `
    ).join("");

    const svg = `
      <svg width="1440" height="900" xmlns="http://www.w3.org/2000/svg">
        ${markersSvg}
      </svg>
    `;

    const out = await sharp(buffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png()
      .toBuffer();

    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return imageUrl;
  }
}

async function addSingleScreenshotMarker(imageUrl: string, marker: number) {
  try {
    const active = getMarkerConfig(marker);
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    const markersSvg = MARKERS.map((m) => {
      const isActive = m.label === active.label;
      return `
        <circle cx="${m.x}" cy="${m.y}" r="${isActive ? 26 : 20}" fill="${
          isActive ? "#FF4D4F" : "#D1D5DB"
        }" opacity="${isActive ? "1" : "0.45"}"/>
        <text x="${m.x}" y="${m.y + 8}" text-anchor="middle" font-size="${
          isActive ? "20" : "17"
        }" font-weight="700" fill="white" opacity="${isActive ? "1" : "0.65"}">${m.label}</text>
      `;
    }).join("");

    const calloutX = Math.min(active.x + 30, 1280);
    const calloutY = Math.max(active.y - 24, 24);

    const svg = `
      <svg width="1440" height="900" xmlns="http://www.w3.org/2000/svg">
        ${markersSvg}
        <rect x="${calloutX}" y="${calloutY}" rx="10" ry="10" width="120" height="36" fill="#111827" opacity="0.92"/>
        <text x="${calloutX + 60}" y="${calloutY + 24}" text-anchor="middle" font-size="16" font-weight="700" fill="white">Issue ${active.label}</text>
      </svg>
    `;

    const out = await sharp(buffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png()
      .toBuffer();

    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return imageUrl;
  }
}

type UiEvidenceItem = {
  marker: number;
  issue: string;
  evidence: string;
  fix: string;
};

function parseUiEvidence(markdown: string): UiEvidenceItem[] {
  const sectionMatch = markdown.match(/##\s*UI Improvements([\s\S]*?)(?=\n##\s|$)/i);
  if (!sectionMatch?.[1]) return [];

  const section = sectionMatch[1].trim();

  const blocks = section
    .split(/\n(?=- )/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const items: UiEvidenceItem[] = [];

  for (const block of blocks) {
    const clean = block.replace(/^- /, "").trim();

    const markerMatch = clean.match(/Marker:\s*(\d+)/i);
    const issueMatch = clean.match(/Issue:\s*(.*?)(?=\n|Evidence:|Fix:|$)/i);
    const evidenceMatch = clean.match(/Evidence:\s*(.*?)(?=\n|Fix:|$)/i);
    const fixMatch = clean.match(/Fix:\s*(.*?)(?=\n|$)/i);

    const issue = issueMatch?.[1]?.trim() || "";
    const evidence = evidenceMatch?.[1]?.trim() || "";
    const fix = fixMatch?.[1]?.trim() || "";

    if (!issue && !evidence && !fix) continue;

    items.push({
      marker: clampMarker(Number(markerMatch?.[1] || items.length + 1)),
      issue,
      evidence,
      fix,
    });
  }

  return items.slice(0, MARKERS.length);
}

async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `# Audit (AI not configured)

We received your request for:

- URL: ${payload?.signals?.url}

**Next:** Add OPENAI_API_KEY to generate full audits automatically.`;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `You are Elessen Labs' senior product/UX auditor.
Return a practical, founder-friendly audit that is highly actionable.
No fluff. No generic advice.
Use only the evidence visible in the extracted signals and screenshot.
Do not hallucinate analytics, user behavior, conversions, or traffic data.
Write like an experienced product designer and conversion strategist.`;

  const user = `AUDIT REQUEST

URL: ${payload.product_url}
Notes: ${payload.notes || "—"}

SCREENSHOT
${payload.screenshot_url || "Not available"}

EXTRACTED SIGNALS (from HTML)
${JSON.stringify(payload.signals, null, 2)}

RETURN THE AUDIT IN CLEAN MARKDOWN USING THESE EXACT HEADINGS:

## Executive Summary
- Max 5 bullets
- Focus on product clarity, messaging, and conversion

## Critical Issues
For each issue use this exact format:

- Severity: Critical / High / Medium / Low
  Issue: short issue title
  Evidence: what proves this problem from the extracted signals or screenshot
  Why it matters: why this hurts UX or conversion
  Recommended fix: specific action

## Conversion Improvements
For each improvement use this exact format:

- Issue: short issue title
  Evidence: what proves this problem
  Fix: recommended action
  Effort: Low / Medium / High
  Impact: Low / Medium / High

Do NOT use tables.
Do NOT use ASCII formatting.
Do NOT use pipes or separators.

## UI Improvements

For each improvement use EXACTLY this format:

- Marker: 1-6
  Issue: short issue title
  Evidence: reference something visible in the screenshot and match it to the chosen marker
  Fix: specific UI change

Rules:
- Each improvement must contain Marker, Issue, Evidence, and Fix.
- Marker must be a number from 1 to 6.
- Reuse a marker only if two issues genuinely point to the same area.
- The issue, evidence, and fix must match the chosen marker.
- Do not return simple bullet points.

## Copy Improvements
- Main headline rewrite:
- Primary CTA rewrite:
- Messaging improvement:
- Messaging improvement:
- Messaging improvement:

## SEO Quick Wins
- One recommendation per bullet

## 7-Day Sprint Plan
Use exactly this format:

- Day 1: task
- Day 2: task
- Day 3: task
- Day 4: task
- Day 5: task
- Day 6: task
- Day 7: task

Only one line per day.
Do NOT add sub-bullets.

## Questions / Assumptions
- Max 6 bullets

IMPORTANT:
You MUST return ALL sections listed below.

Never omit a section even if evidence is limited.

Use exactly these headings in this order:

## Executive Summary
## Critical Issues
## Conversion Improvements
## UI Improvements
## Copy Improvements
## SEO Quick Wins
## 7-Day Sprint Plan
## Questions / Assumptions

For UI Improvements specifically:
- Use the screenshot as visual evidence when possible.
- Each improvement MUST include Marker, Issue, Evidence, and Fix.
- Marker must align with the area referenced in Evidence.
- Do not return simple bullet points.

Formatting rules:
- Use bullet lists only
- Do not use markdown tables
- Do not use code fences
- Keep the report concise and implementation-ready`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.25,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content || "";
  return content.trim();
}

export async function POST(req: Request) {
  const auth = requireSecret(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.msg }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let row: any = null;

if (id) {
  const cleanId = String(id).trim();

  const { data, error } = await supabaseAdmin
    .from("audit_requests")
    .select("id, full_name, product_url, payment_status")
    .eq("id", cleanId)
    .maybeSingle();

  return NextResponse.json({
    debug: true,
    cleanId,
    found: !!data,
    data,
    error,
  });
}
 else {
    const { data, error } = await supabaseAdmin
      .from("audit_requests")
      .select("*")
      .eq("payment_status", "paid_pending_audit")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    row = data?.[0];

    if (!row) {
      return NextResponse.json({ ok: true, message: "No pending audits." });
    }
  }

  const { error: lockErr } = await supabaseAdmin
    .from("audit_requests")
    .update({ payment_status: "generating" })
    .eq("id", row.id);

  if (lockErr) {
    return NextResponse.json({ error: "Failed to lock audit request." }, { status: 500 });
  }

  try {
    const url = String(row.product_url || "").trim();

    const htmlRes = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "ElessenLabsAuditBot/1.0 (+https://elessenlabs.com)",
        Accept: "text/html,*/*",
      },
    });

    const html = await htmlRes.text();
    const signals = extractSignals(html, url);

    const screenshotUrl = await captureScreenshot(url);
    const markedScreenshotUrl = screenshotUrl
      ? await addScreenshotMarkers(screenshotUrl)
      : null;

    const auditMarkdown = await generateAuditMarkdown({
      product_url: row.product_url,
      notes: row.notes,
      signals,
      screenshot_url: screenshotUrl,
    });

    const uiEvidence = parseUiEvidence(auditMarkdown);

    const uiScreenshotUrls =
      screenshotUrl && uiEvidence.length > 0
        ? await Promise.all(
            uiEvidence.map((item) =>
              addSingleScreenshotMarker(screenshotUrl, item.marker)
            )
          )
        : [];

    const uiEvidenceWithScreenshots = uiEvidence.map((item, index) => ({
      ...item,
      screenshot_url: uiScreenshotUrls[index] || null,
    }));

    const { error: saveErr } = await supabaseAdmin
      .from("audit_requests")
      .update({
        audit_content: clip(auditMarkdown, 250000),
        screenshot_url: screenshotUrl,
        marked_screenshot_url: markedScreenshotUrl,
        ui_screenshot_urls: uiScreenshotUrls,
        ui_evidence: uiEvidenceWithScreenshots,
        payment_status: "ready_for_review",
        completed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (saveErr) {
      throw new Error(`Failed to save audit_content: ${saveErr.message}`);
    }

    return NextResponse.json({
      ok: true,
      id: row.id,
      payment_status: "ready_for_review",
      signals_summary: {
        title: signals.title,
        h1: signals.h1?.[0] || "",
        ctas: signals.ctas?.slice(0, 5) || [],
      },
      ui_evidence_count: uiEvidenceWithScreenshots.length,
    });
  } catch (e: any) {
    console.error("AUDIT_GENERATE_ERROR", e);

    await supabaseAdmin
      .from("audit_requests")
      .update({
        payment_status: "failed",
        audit_content: clip(
          `Audit generation failed: ${e?.message || String(e)}`,
          8000
        ),
      })
      .eq("id", row.id);

    return NextResponse.json(
      {
        error: "Audit generation failed.",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}