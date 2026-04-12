import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import sharp from "sharp";
import { uploadToR2 } from "../../lib/r2/upload";

type UiEvidence = {
  marker: number;
  issue: string;
  evidence: string;
  fix: string;
  crop_url?: string | null;
  region_label?: string;
  region_confidence?: "low" | "medium";
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}
function extractSignals(html: string, url: string) {
  const text = html || "";

  const clean = (str: string) =>
    str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const uniq = (arr: string[]) =>
    Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));

  const title = (text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
    .replace(/\s+/g, " ")
    .trim();

  const metaDescription = (
    text.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    )?.[1] || ""
  ).trim();

  const h1 = uniq(
    Array.from(text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) =>
      clean(m[1])
    )
  ).slice(0, 5);

  const h2 = uniq(
    Array.from(text.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)).map((m) =>
      clean(m[1])
    )
  ).slice(0, 12);

  const paragraphs = uniq(
    Array.from(text.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map((m) =>
      clean(m[1])
    )
  )
    .filter((p) => p.length > 40)
    .slice(0, 20);

  const buttons = uniq(
    Array.from(text.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)).map((m) =>
      clean(m[1])
    )
  )
    .filter((x) => x.length <= 60)
    .slice(0, 20);

  const links = uniq(
    Array.from(
      text.matchAll(
        /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      )
    ).map((m) => clean(m[2]))
  )
    .filter((x) => x.length > 0 && x.length < 80)
    .slice(0, 40);

  const navLabels = links
    .filter((l) =>
      /home|product|features|pricing|about|contact|login|sign|dashboard/i.test(
        l
      )
    )
    .slice(0, 10);

  const ctas = [...buttons, ...links]
    .filter((x) =>
      /start|book|get|try|download|sign up|signup|join|request|demo|contact/i.test(
        x.toLowerCase()
      )
    )
    .slice(0, 15);

  const trustSignals = paragraphs
    .filter((p) =>
      /trusted|customers|companies|users|reviews|testimonials|rated|used by|clients/i.test(
        p.toLowerCase()
      )
    )
    .slice(0, 10);

  const pricingSignals = paragraphs
    .filter((p) =>
      /price|pricing|plan|plans|per month|subscription|free|trial|cost/i.test(
        p.toLowerCase()
      )
    )
    .slice(0, 10);

  const featureSnippets = [...h2, ...paragraphs]
    .filter((t) =>
      /feature|tool|platform|solution|service|manage|track|build|create|automate/i.test(
        t.toLowerCase()
      )
    )
    .slice(0, 12);

  const inputCount = (text.match(/<input\b/gi) || []).length;
  const formCount = (text.match(/<form\b/gi) || []).length;

  const hasPricing = /pricing|price|plan|plans/i.test(text);
  const hasCheckout = /checkout|pay|payment|stripe/i.test(text);
  const hasEmailCapture = /type=["']email["']|newsletter|subscribe/i.test(text);

  // ADD THIS RIGHT BEFORE return
const heroGuess = {
  headline: h1[0] || "",
  subhead: paragraphs[0] || "",
  primaryCTA: ctas[0] || "",
};

const structureHints = {
  hasMultipleCTAs: ctas.length > 3,
  hasWeakCTA: ctas.length === 0,
  hasTrustSignals: trustSignals.length > 0,
  hasClearNav: navLabels.length > 0,
};

  return {
  url,
  title,
  metaDescription,
  h1,
  h2,
  paragraphs,
  navLabels,
  ctas,
  trustSignals,
  pricingSignals,
  featureSnippets,
  links,
  heroGuess,
  structureHints,
  flags: { hasPricing, hasCheckout, hasEmailCapture },
  counts: { inputCount, formCount },
};
}


async function handleCookieBanner(page: any) {
  const candidates = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Allow all")',
    'button:has-text("I agree")',
    'button:has-text("Agree")',
    'button:has-text("Got it")',
    'button:has-text("Continue")',
    '[aria-label="Accept"]',
    '[id*="accept"]',
    '[class*="accept"]',
  ];

  for (const selector of candidates) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 500 })) {
        await el.click({ timeout: 1000 });
        await page.waitForTimeout(1200);
        console.log("COOKIE BANNER HANDLED", { selector });
        return true;
      }
    } catch {
      // continue
    }
  }

  return false;
}


async function captureScreenshot(url: string) {
  let browser: any = null;

  try {
    console.log("SCREENSHOT START", { url });
    console.log("CHROMIUM PATH CHECK", {
      isVercel: !!process.env.VERCEL,
    });

  browser = await playwright.launch({
  args: chromium.args,
  executablePath:
    process.env.VERCEL
      ? await chromium.executablePath()
      : undefined,
  headless: true,
});

    console.log("BROWSER LAUNCHED SUCCESSFULLY");
    console.log("SCREENSHOT BROWSER LAUNCHED", { url }

    );
    

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1600 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

    console.log("SCREENSHOT PAGE CREATED", { url });

   let success = false;

for (let attempt = 1; attempt <= 2; attempt++) {
  try {
    console.log("SCREENSHOT NAV ATTEMPT", { url, attempt });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    await page.waitForTimeout(1800);

    try {
      await page.waitForLoadState("load", { timeout: 8000 });
    } catch {
      console.log("LOAD STATE TIMEOUT - continuing", { url, attempt });
    }

    try {
      await handleCookieBanner(page);
    } catch {
      console.log("COOKIE HANDLER SKIPPED", { url, attempt });
    }

    try {
      await page.evaluate(async () => {
        window.scrollTo({ top: document.body.scrollHeight * 0.45, behavior: "instant" as ScrollBehavior });
      });
      await page.waitForTimeout(900);

      await page.evaluate(async () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" as ScrollBehavior });
      });
      await page.waitForTimeout(900);

      await page.evaluate(async () => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      });
      await page.waitForTimeout(1200);
    } catch {
      console.log("SCROLL STABILIZATION SKIPPED", { url, attempt });
    }

    success = true;
    break;
  } catch (err) {
    console.error("NAV FAILED", { url, attempt, err });
  }
}

if (!success) {
  try {
    console.log("FALLBACK NAV", { url });

    await page.goto(`http://${new URL(url).hostname}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    await page.waitForTimeout(1800);

    try {
      await page.waitForLoadState("load", { timeout: 8000 });
    } catch {
      console.log("FALLBACK LOAD STATE TIMEOUT - continuing", { url });
    }

    try {
      await handleCookieBanner(page);
    } catch {
      console.log("FALLBACK COOKIE HANDLER SKIPPED", { url });
    }

    await page.waitForTimeout(1200);

    success = true;
  } catch (err) {
    console.error("FALLBACK FAILED", err);
  }
}

if (!success) {
  throw new Error("NAVIGATION_FAILED");
}

await page.waitForTimeout(1200);

console.log("SCREENSHOT PAGE GOTO OK", { url });

const raw = await page.screenshot({
  fullPage: true,
  type: "png",
});

    console.log("SCREENSHOT RAW CAPTURED", {
      url,
      bytes: raw.length,
    });

    console.log("SCREENSHOT COMPRESS START", { url });

    const compressed = await sharp(raw)
      .resize({ width: 1440, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();

    console.log("SCREENSHOT COMPRESS DONE", {
      url,
      bytes: compressed.length,
     });

    const key = `screenshots/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.jpg`;

    const uploadedUrl = await uploadToR2(compressed, key);

    console.log("SCREENSHOT UPLOADED", {
      url,
      key,
      uploadedUrl,
    });

    return uploadedUrl;
  } catch (err) {
  console.error("PLAYWRIGHT SCREENSHOT ERROR:", {
    url,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : null,
  });

  try {
    console.log("SCREENSHOT FALLBACK START", { url });

    const fallbackEndpoint = `https://image.thum.io/get/fullpage/noanimate/${encodeURIComponent(
      url
    )}`;

    const response = await fetch(fallbackEndpoint);

    if (!response.ok) {
      console.error("SCREENSHOT FALLBACK FAILED", {
        url,
        status: response.status,
      });
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const compressed = await sharp(buffer)
      .resize({ width: 1440, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();

    const key = `screenshots/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.jpg`;

    const uploadedUrl = await uploadToR2(compressed, key);

    console.log("SCREENSHOT FALLBACK UPLOADED", {
      url,
      key,
      uploadedUrl,
    });

    return uploadedUrl;
  } catch (fallbackErr) {
    console.error("SCREENSHOT FALLBACK ERROR:", {
      url,
      message:
        fallbackErr instanceof Error
          ? fallbackErr.message
          : String(fallbackErr),
    });
    return null;
  }
} finally {

    if (browser) {
      await browser.close();
    }
  }
}

async function addScreenshotMarkers(
  imageUrl: string,
  evidenceItems: UiEvidence[]
): Promise<Record<number, string>> {
  const result: Record<number, string> = {};

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error(
        `Failed to fetch screenshot for markers: ${response.status}`
      );
      return result;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const meta = await sharp(buffer).metadata();
    const width = meta.width || 1440;
    const height = meta.height || 900;

    for (const item of evidenceItems) {
      if (!item.marker || !item.position) continue;

      const x = Math.round(item.position.x * width);
      const y = Math.round(item.position.y * height);

      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${x}" cy="${y}" r="34" fill="#FF5A1F"/>
          <circle cx="${x}" cy="${y}" r="40" fill="none" stroke="white" stroke-width="6"/>
          <text
            x="${x}"
            y="${y + 11}"
            text-anchor="middle"
            font-size="28"
            font-weight="800"
            fill="white"
            font-family="Arial, sans-serif"
          >${item.marker}</text>
        </svg>
      `;

      const out = await sharp(buffer)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();

      const key = `screenshots/marked/${Date.now()}-${item.marker}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`;

      const markedUrl = await uploadToR2(out, key);
      result[item.marker] = markedUrl;
    }

    return result;
  } catch (err) {
    console.error("MARKER OVERLAY ERROR:", err);
    return result;
  }
}

async function fetchImageBuffer(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image buffer: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `# Audit (AI not configured)

We received your request for:

- URL: ${payload?.signals?.url}

**Next:** Add OPENAI_API_KEY to generate full audits automatically.`;
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.3";

  const PIPELINE_VERSION = "v2.1-STRUCTURE-ENFORCED";

console.log("AUDIT PIPELINE VERSION:", PIPELINE_VERSION);
console.log("MODEL USED:", model);

    const system = `You are Elessen Labs' senior product designer and conversion strategist.

You are reviewing a real product for a founder who expects high-quality, commercially relevant insight — not generic UX feedback.

This audit must feel like it was written by a senior human consultant who understands product, user behavior, and conversion — not an AI.

----------------------------------
CORE EXPECTATION
----------------------------------
Every section must deliver:
- Clear reasoning
- Specific observations
- Commercial relevance (why this matters for conversion, trust, or decision-making)

Avoid surface-level commentary.

----------------------------------
NON-NEGOTIABLE RULES
----------------------------------
- Do NOT hallucinate features, data, or behavior
- Do NOT assume traffic, analytics, or user intent
- Do NOT claim something is missing unless signals support it
- If uncertain, say:
  "Visually unclear from available signals" or "Not clearly confirmed from extracted signals"

----------------------------------
ANTI-GENERIC RULES
----------------------------------
Never say:
- "Improve UX"
- "Enhance design"
- "Optimize layout"
- "Make CTA better"

Every recommendation must describe a specific, implementable change.

BAD:
"Improve CTA visibility"

GOOD:
"Move the primary CTA directly below the value proposition and increase contrast so it becomes the dominant action in the hero section"

----------------------------------
THINK LIKE A PRODUCT CONSULTANT
----------------------------------
Continuously evaluate:

1. CLARITY
- Is the product immediately understandable?
- Can a cold user explain what this does within 5 seconds?

2. HIERARCHY
- What draws attention first?
- Is the visual flow guiding the user or creating friction?

3. TRUST
- Does the page reduce hesitation?
- Are there signals that build or weaken credibility?

4. DECISION FRICTION
- What slows the user down?
- What questions remain unanswered?

5. ACTION MOMENT
- Is it obvious what to do next?
- Is the action compelling or easy to ignore?

----------------------------------
SECTION QUALITY REQUIREMENTS
----------------------------------

## Executive Summary
- Identify the 3–5 most important problems affecting clarity, trust, or conversion
- Do NOT restate everything — prioritize
- Each bullet should feel like a key insight, not a description

## Critical Issues
- Only include issues that materially impact:
  - understanding
  - trust
  - conversion
- Each issue must explain:
  - what is wrong
  - why it matters commercially
  - what should change

## Conversion Improvements
- Focus on user journey friction
- Think in terms of:
  - hesitation
  - drop-off risk
  - unclear next steps
- Prioritize high-impact changes

## UI Improvements

Generate 4–6 improvements based on importance.

Prioritize:
- clarity
- hierarchy
- visual dominance

Do NOT force 6 if not justified.

## Copy Improvements
- Rewrite with intent
- Make messaging sharper, clearer, and more outcome-driven
- Avoid repeating criticism — improve it

## SEO Quick Wins
- Tactical only
- No generic SEO advice

## 7-Day Sprint Plan
- Must feel executable
- Each day should move the product forward meaningfully

## Questions / Assumptions
- Only include real uncertainties that limit confidence
- Avoid filler questions

----------------------------------
ANTI-REPETITION RULES
----------------------------------
- Do NOT repeat the same issue across sections
- Each section must add new value
- If repeated, it must be from a different perspective

----------------------------------
EVIDENCE RULES
----------------------------------
- Ground observations in extracted signals
- If visual certainty is weak, explicitly say so
- Do NOT fabricate behavioral claims

----------------------------------
TONE
----------------------------------
- Direct
- Senior
- Insightful
- Commercially aware
- Implementation-ready

----------------------------------
OUTPUT RULES
----------------------------------
- Follow the required section structure exactly
- Keep writing natural and professional
- Avoid fluff
- Avoid filler
- Avoid generic phrasing
- Do not output placeholders or template variables

The final output should feel like:
A real UX/product consultant reviewed this product and wrote a focused, high-value audit that a founder would take seriously.`;

  const screenshotState = payload.screenshot_url
    ? "Screenshot captured successfully and is available for visual review."
    : "Screenshot not available.";

  const user = `AUDIT REQUEST

  PIPELINE VERSION: ${PIPELINE_VERSION}
  MODEL: ${model}

URL: ${payload.product_url}
FOCUS PAGE: ${payload.focus_page_url || "Not provided"}
Notes: ${payload.notes || "—"}

SCREENSHOT STATUS
${screenshotState}

EXTRACTED SIGNALS (from HTML)
${JSON.stringify(payload.signals, null, 2)}

----------------------------------
DERIVED STRUCTURE (HIGH SIGNAL)
----------------------------------
Hero:
${JSON.stringify(payload.signals?.heroGuess, null, 2)}

Structure:
${JSON.stringify(payload.signals?.structureHints, null, 2)}

----------------------------------
STEP 1 — INTERPRET THE PRODUCT FIRST
----------------------------------

Before writing the audit, you MUST internally determine:

- What this product appears to do
- Who it is likely for
- What the user is trying to accomplish on this page
- What action the page is trying (or failing) to drive

Do NOT output this as a separate section, but USE it to inform all insights.

If unclear, explicitly say:
"Positioning is not clearly communicated from available signals"

----------------------------------
STEP 2 — IDENTIFY REAL BREAKDOWNS
----------------------------------

Focus on:

- Where understanding breaks
- Where trust is weakened
- Where decision-making slows down
- Where the user would hesitate or drop off

Avoid surface-level observations.

Every issue must answer:
→ “Why does this actually hurt conversion or user confidence?”

----------------------------------
STEP 3 — WRITE LIKE A SENIOR REVIEWING A LIVE PRODUCT
----------------------------------

Assume:
- This is a real company
- This affects real revenue
- The team could ship fixes this week

Your tone should reflect:
- Commercial awareness
- Product thinking
- UX depth
- Clarity of reasoning

----------------------------------
STRICT RULES
----------------------------------

- DO NOT repeat the same issue across sections
- DO NOT restate the same idea in different wording
- EACH section must add new insight

- DO NOT rely only on counts (e.g. "10 H2s")
- ALWAYS interpret what that means for the user

BAD:
"Too many headings cause cognitive overload"

GOOD:
"Multiple peer-level headings compete for attention, making it unclear where the user should focus first or what step to take next"

- DO NOT give generic fixes

BAD:
"Improve CTA"

GOOD:
"Replace 'Menu' with a primary action like 'Book a Consultation' and position it directly in the hero to create a clear next step"

----------------------------------
DIFFERENTIATION CHECK
----------------------------------

Evaluate whether the product feels:
- generic
- interchangeable
- clearly differentiated

If differentiation is weak, explicitly explain:
- why it feels generic
- how that impacts conversion

----------------------------------
MANDATORY INTERNAL REASONING (DO NOT SKIP)
----------------------------------

Before writing the audit:

1. Reconstruct the page mentally using:
   - title
   - headings
   - CTAs
   - signals

2. Determine:
   - What the product is
   - Who it's for
   - What action is expected

3. Identify:
   - What is unclear within 5 seconds
   - What weakens trust
   - What slows decision-making

4. Rank the top 5 issues by:
   - impact on clarity
   - impact on trust
   - impact on conversion

Only AFTER this, write the audit.

DO NOT output this reasoning.

----------------------------------
OUTPUT FORMAT (MANDATORY)
----------------------------------

## Executive Summary
- Max 5 bullets
- Each bullet = a high-level insight about:
  - clarity
  - trust
  - conversion
- No repetition

## Critical Issues
For each issue:

- Severity: Critical / High / Medium / Low
  Issue: specific breakdown (NOT generic)
  Evidence: what proves it (signals or visible structure)
  Why it matters: explain user impact + conversion impact
  Recommended fix: specific action

ONLY include issues that materially affect conversion.

## Conversion Improvements
- Focus ONLY on user decision-making and funnel friction
- Do NOT repeat Critical Issues

For each:

- Issue:
- Evidence:
- Fix:
- Effort: Low / Medium / High
- Impact: Low / Medium / High

## UI Improvements

You MUST generate EXACTLY 6 improvements.

Each must be:
- visual
- layout-related
- hierarchy-related
- non-repetitive

STRICT FORMAT:

- Marker: 1
  Issue:
  Evidence:
  Fix:

- Marker: 2
  Issue:
  Evidence:
  Fix:

- Marker: 3
  Issue:
  Evidence:
  Fix:

- Marker: 4
  Issue:
  Evidence:
  Fix:

- Marker: 5
  Issue:
  Evidence:
  Fix:

- Marker: 6
  Issue:
  Evidence:
  Fix:

RULES:
- Each marker must be unique
- Each issue must describe a REAL UI problem
- No vague language

## Copy Improvements
- Main headline rewrite:
- Primary CTA rewrite:
- Messaging improvement:
- Messaging improvement:
- Messaging improvement:

Make rewrites sharper, clearer, and outcome-driven.

## SEO Quick Wins
- Only tactical recommendations
- No generic SEO advice

## 7-Day Sprint Plan
- Each day must move the product forward meaningfully
- No fluff tasks

## Questions / Assumptions
- Only include real uncertainties that limit confidence
- Max 6 bullets

----------------------------------
FINAL CHECK BEFORE OUTPUT
----------------------------------

Before returning the audit, ensure:

- It does NOT feel generic
- It does NOT repeat itself
- It reads like a human expert wrote it
- It includes reasoning, not just observations

If it feels templated, rewrite it.

----------------------------------
CRITICAL: PRODUCT CONTEXT HYPOTHESIS
----------------------------------

Before writing the audit, you MUST determine:

- What type of product this is:
  (SaaS / marketplace / enterprise / agency / e-commerce / informational)

- What the likely conversion model is:
  (self-serve / sales-led / lead generation / awareness)

- Whether the page is intended to:
  (convert immediately OR build trust OR educate)

You MUST use this to guide your audit.

If the page appears to be sales-led or enterprise:

- Do NOT assume missing pricing is a problem
- Do NOT assume lack of direct CTA is a flaw
- Evaluate based on trust, clarity, and credibility instead

If uncertain, explicitly state the uncertainty.

RETURN FINAL MARKDOWN ONLY.`;

  const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    temperature: 0.2,

    input: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
  }),
});

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const content = json?.output_text || "";
  return content.trim();
}

function ensureUiImprovementMarkers(markdown: string) {
  if (!markdown || !markdown.includes("## UI Improvements")) {
    return markdown;
  }

  const parts = markdown.split("## UI Improvements");
  if (parts.length < 2) return markdown;

  const before = parts[0];
  const after = parts[1];

  const nextHeadingMatch = after.match(/\n##\s+/);
  const uiBody = nextHeadingMatch
    ? after.slice(0, nextHeadingMatch.index)
    : after;

  const rest = nextHeadingMatch ? after.slice(nextHeadingMatch.index) : "";

  let normalized = uiBody;

  for (let i = 1; i <= 6; i++) {
    const hasMarker = new RegExp(`Marker:\\s*${i}\\b`, "i").test(normalized);

    if (!hasMarker) {
      normalized += `

- Marker: ${i}
  Issue: Visual review required for this marker area
  Evidence: The current output did not generate a specific marker entry for this location
  Fix: Review this section manually and add a precise UI recommendation`;
    }
  }

  return `${before}## UI Improvements${normalized}${rest}`;
}

function extractUiEvidenceFromMarkdown(markdown: string): UiEvidence[] {
  if (!markdown.includes("## UI Improvements")) return [];

  const section = markdown.split("## UI Improvements")[1];
  if (!section) return [];

  const nextHeading = section.split(/\n## /)[0];

  const blocks = nextHeading
    .split(/\n(?=- Marker:)/g)
    .map((b) => b.trim())
    .filter(Boolean);

  const results: UiEvidence[] = [];

  for (const block of blocks) {
    const markerMatch = block.match(/Marker:\s*(\d+)/i);
    const issueMatch = block.match(/Issue:\s*([\s\S]*?)(?=\n|Evidence:|$)/i);
    const evidenceMatch = block.match(/Evidence:\s*([\s\S]*?)(?=\n|Fix:|$)/i);
    const fixMatch = block.match(/Fix:\s*([\s\S]*?)$/i);

    const marker = markerMatch ? parseInt(markerMatch[1], 10) : undefined;

    if (!marker) continue;

    const issueText = issueMatch?.[1]?.trim() || "";
let evidenceText = evidenceMatch?.[1]?.trim() || "";

if (
  /\$\{.*?\}/.test(evidenceText) ||
  evidenceText.length < 12 ||
  /undefined|null|\[\]|\{\}/.test(evidenceText) ||
  /no clear|not clear|unclear/i.test(evidenceText) ||
  evidenceText.split(" ").length < 4
) {
  evidenceText = "Visually unclear from available UI signals";
}

const region = getEvidenceRegion(issueText, evidenceText);

results.push({
  marker,
  issue: issueText,
  evidence: evidenceText,
  fix: fixMatch?.[1]?.trim() || "",
  crop_url: null,
  region_label: region.region_label,
  region_confidence: region.region_confidence,
  position: getEvidencePosition(marker, issueText, evidenceText),
  });
}

  return results.slice(0, 6);
}
function getEvidenceRegion(issue: string, evidence: string) {
  const text = `${issue} ${evidence}`.toLowerCase();

  const mentionsHero =
    /hero|headline|subheadline|first impression|above the fold|top section|top message|value proposition|main message|positioning|header copy/.test(
      text
    );

  const mentionsNav =
    /navigation|nav|menu|header|top nav|top navigation/.test(text);

  const mentionsCta =
    /cta|call to action|button|primary button|secondary button|download|apply|start|book|sign up|signup|join|request demo|demo|contact sales/.test(
      text
    );

  const mentionsTrust =
    /trust|social proof|testimonial|testimonials|logo|logos|customer|customers|proof|credibility|review|reviews|case stud|brand|partner|partners/.test(
      text
    );

  const mentionsPricing =
    /pricing|price|plan|plans|billing|subscription|compare|comparison|tier|tiers|package|packages|table/.test(
      text
    );

  const mentionsForm =
    /form|input|field|email capture|lead capture|contact form|newsletter|subscribe/.test(
      text
    );

  const mentionsFooter =
    /footer|bottom|legal|privacy|terms|language selector|secondary nav|secondary navigation|site links|site map|social links/.test(
      text
    );

  const mentionsCardOrGrid =
    /card|cards|grid|module|content block|resource|resources|feature block|feature grid|product block|product card|feature card|listing/.test(
      text
    );

  if (mentionsHero && mentionsCta) {
    return {
      region_label: "Hero / CTA area",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsHero) {
    return {
      region_label: "Hero / top section",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsNav) {
    return {
      region_label: "Navigation / header area",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsCta || mentionsForm) {
    return {
      region_label: "CTA / conversion area",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsPricing) {
    return {
      region_label: "Pricing / comparison area",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsTrust) {
    return {
      region_label: "Trust / proof area",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsCardOrGrid) {
    return {
      region_label: "Feature / content grid",
      region_confidence: "medium" as const,
    };
  }

  if (mentionsFooter) {
    return {
      region_label: "Footer / lower page area",
      region_confidence: "medium" as const,
    };
  }

  return {
    region_label: "General page region",
    region_confidence: "low" as const,
  };
}

function getEvidencePosition(
  marker: number,
  issue: string,
  evidence: string
): UiEvidence["position"] {
  const text = `${issue} ${evidence}`.toLowerCase();

  // STRONGER explicit mapping
  if (/navigation|nav|menu|header/.test(text)) {
    return { x: 0.5, y: 0.08, width: 0.9, height: 0.12 };
  }

  if (/hero|headline|title|top section|above the fold/.test(text)) {
    return { x: 0.5, y: 0.22, width: 0.9, height: 0.25 };
  }

  if (/cta|button|call to action|signup|book|start/.test(text)) {
    return { x: 0.5, y: 0.45, width: 0.7, height: 0.2 };
  }

  if (/grid|cards|listing|results|gallery/.test(text)) {
    return { x: 0.5, y: 0.55, width: 0.9, height: 0.25 };
  }

  if (/form|input|field|email/.test(text)) {
    return { x: 0.5, y: 0.6, width: 0.7, height: 0.25 };
  }

  if (/footer|bottom/.test(text)) {
    return { x: 0.5, y: 0.85, width: 0.9, height: 0.2 };
  }

  // ⚠️ CRITICAL FIX — fallback tied to marker index
  const fallbackMap: Record<number, UiEvidence["position"]> = {
    1: { x: 0.5, y: 0.2, width: 0.9, height: 0.25 },
    2: { x: 0.5, y: 0.35, width: 0.9, height: 0.25 },
    3: { x: 0.5, y: 0.5, width: 0.9, height: 0.25 },
    4: { x: 0.5, y: 0.65, width: 0.9, height: 0.25 },
    5: { x: 0.35, y: 0.8, width: 0.6, height: 0.2 },
    6: { x: 0.65, y: 0.8, width: 0.6, height: 0.2 },
  };

  return fallbackMap[marker] || { x: 0.5, y: 0.5, width: 0.85, height: 0.25 };
}

async function generateEvidenceCrops(
  screenshotUrl: string,
  evidenceItems: UiEvidence[]
): Promise<UiEvidence[]> {
  if (!screenshotUrl || !evidenceItems.length) {
    return evidenceItems;
  }

  const buffer = await fetchImageBuffer(screenshotUrl);
  const meta = await sharp(buffer).metadata();

  const imageWidth = meta.width || 1440;
  const imageHeight = meta.height || 2200;

  const nextEvidence: UiEvidence[] = [];

  for (const item of evidenceItems) {
    if (!item.position) {
      nextEvidence.push(item);
      continue;
    }

    try {
      const desiredWidth = Math.max(
        520,
      Math.round(item.position.width * imageWidth * 1.1)
      );

      const desiredHeight = Math.max(
        320,
      Math.round(item.position.height * imageHeight * 1.1)
      );

      const centerX = Math.round(item.position.x * imageWidth);
      const centerY = Math.round(item.position.y * imageHeight);

      const left = Math.max(
        0,
        Math.min(
          imageWidth - desiredWidth,
          Math.round(centerX - desiredWidth / 2)
        )
      );

      const top = Math.max(
        0,
        Math.min(
          imageHeight - desiredHeight,
          Math.round(centerY - desiredHeight / 2)
        )
      );

      const width = Math.min(desiredWidth, imageWidth - left);
      const height = Math.min(desiredHeight, imageHeight - top);

      const cropBuffer = await sharp(buffer)
        .extract({
          left,
          top,
          width,
          height,
        })
        .resize({
          width: Math.min(width, 1100),
          withoutEnlargement: true,
        })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();

      const key = `screenshots/crops/${Date.now()}-${item.marker}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`;

      const cropUrl = await uploadToR2(cropBuffer, key);

      nextEvidence.push({
        ...item,
        crop_url: cropUrl,
      });
    } catch (err) {
      console.error("EVIDENCE CROP FAILED:", {
        marker: item.marker,
        err,
      });

      nextEvidence.push({
        ...item,
        crop_url: null,
      });
    }
  }

  return nextEvidence;
}

function buildAuditPages(row: any): string[] {
  const candidates: string[] = [];

  if (row?.product_url) candidates.push(row.product_url);
  if (row?.focus_page_url) candidates.push(row.focus_page_url);

  if (Array.isArray(row?.pages)) {
    for (const item of row.pages) {
      if (typeof item === "string" && item.trim()) {
        candidates.push(item.trim());
      } else if (item?.url && typeof item.url === "string") {
        candidates.push(item.url.trim());
      }
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

export async function runAuditPipeline(row: any) {
  console.log("🚨 PIPELINE EXECUTION STARTED 🚨");
  console.log("ROW ID:", row?.id);
  console.log("PRODUCT URL:", row?.product_url);
  const pageUrls = buildAuditPages(row);
  const processedPages = [];

  for (const url of pageUrls) {
    if (!url) continue;

    try {
      console.log("AUDIT PAGE START", { url });

      let html = "";
      let signals: any = null;

      try {
        const htmlRes = await fetch(url, {
          redirect: "follow",
          headers: {
            "User-Agent": "ElessenLabsAuditBot/1.0 (+https://elessenlabs.com)",
            Accept: "text/html,*/*",
          },
        });

        console.log("AUDIT HTML FETCH", {
          url,
          ok: htmlRes.ok,
          status: htmlRes.status,
          contentType: htmlRes.headers.get("content-type"),
        });

        html = await htmlRes.text();
        signals = extractSignals(html, url);
      } catch (err) {
        console.error("AUDIT HTML FETCH FAILED:", url, err);
        throw new Error(`HTML_FETCH_FAILED for ${url}`);
      }

          let screenshotUrl: string | null = null;

      try {
        screenshotUrl = await captureScreenshot(url);

        console.log("AUDIT SCREENSHOT CAPTURE", {
          url,
          success: !!screenshotUrl,
        });

        if (!screenshotUrl) {
          console.error(
            "AUDIT STEP FAILED, continuing:",
            `SCREENSHOT_FAILED for ${url}`
          );
        }
      } catch (err) {
        console.error("AUDIT STEP FAILED, continuing:", err);
        screenshotUrl = null;
      }

      let auditMarkdown = "";
      let uiEvidence: UiEvidence[] = [];
      let markedScreenshotUrl: string | null = screenshotUrl;
      let markedScreenshotMap: Record<number, string> = {};

      try {
       auditMarkdown = await generateAuditMarkdown({
  product_url: row.product_url || url,
  focus_page_url: row.focus_page_url || "",
  notes: row.notes,
  signals,
  focus_signals: null,
  screenshot_url: screenshotUrl,
  focus_screenshot_url: null,
});

console.log("🧠 NEW MARKDOWN GENERATED");
console.log("MARKDOWN LENGTH:", auditMarkdown.length);
console.log("MARKDOWN PREVIEW:", auditMarkdown.substring(0, 300));
        // auditMarkdown = ensureUiImprovementMarkers(auditMarkdown);
        uiEvidence = extractUiEvidenceFromMarkdown(auditMarkdown);

        if (screenshotUrl && uiEvidence.length) {
          try {
            markedScreenshotMap = await addScreenshotMarkers(
              screenshotUrl,
              uiEvidence
            );

            const firstMarked = markedScreenshotMap[uiEvidence[0]?.marker];
            markedScreenshotUrl = firstMarked || screenshotUrl;

            console.log("AUDIT MARKER OVERLAY", {
              url,
              success: Object.keys(markedScreenshotMap).length > 0,
              count: Object.keys(markedScreenshotMap).length,
            });
          } catch (err) {
            console.error("AUDIT MARKER OVERLAY FAILED:", url, err);
            markedScreenshotMap = {};
            markedScreenshotUrl = screenshotUrl;
          }
        }

        if (uiEvidence.length) {
          const nextEvidence: UiEvidence[] = [];

          for (const item of uiEvidence) {
            const imageForThisIssue =
              markedScreenshotMap[item.marker] || screenshotUrl;

            if (imageForThisIssue) {
              const cropped = await generateEvidenceCrops(imageForThisIssue, [item]);
              nextEvidence.push(cropped[0]);
            } else {
              nextEvidence.push(item);
            }
          }

          uiEvidence = nextEvidence;
        }

        console.log("AUDIT MARKDOWN GENERATED", {
          url,
          hasContent: !!auditMarkdown,
          length: auditMarkdown?.length || 0,
          uiEvidenceCount: uiEvidence.length,
          cropCount: uiEvidence.filter((item) => !!item.crop_url).length,
        });
      } catch (err) {
        console.error("AUDIT MARKDOWN FAILED:", url, err);
        throw err;
      }

      const sections = auditMarkdown
        .split(/(?=## )/g)
        .map((section) => {
          const match = section.match(/^##\s+(.*)/);
          return {
            title: match ? match[1].trim() : "Section",
            content: section.replace(/^##\s+.*\n?/, "").trim(),
          };
        })
        .filter((s) => s.content);

            console.log("AUDIT PAGE SUCCESS", {
        url,
        sectionCount: sections.length,
      });

      processedPages.push({
        url,
        screenshot_url: screenshotUrl,
        marked_screenshot_url: markedScreenshotUrl,
        sections,
        evidence: uiEvidence,
      });
    } catch (err) {
      console.error("PAGE AUDIT FAILED:", url, err);

      const failureMessage =
        err instanceof Error
          ? err.message
          : String(err || "Unknown processing error");

      let failureReason = "Processing failed";
      if (failureMessage.includes("HTML_FETCH_FAILED")) {
        failureReason = "HTML fetch failed";
      } else if (failureMessage.includes("SCREENSHOT_FAILED")) {
        failureReason = "Screenshot capture failed";
      }

      processedPages.push({
        url,
        screenshot_url: null,
        marked_screenshot_url: null,
        sections: [
          {
            title: "Processing Status",
            content: "This page could not be processed automatically.",
          },
          {
            title: "Failure Details",
            content: `- Failure reason: ${failureReason}
          - Technical detail: ${failureMessage}
          - Suggested next step: Check whether the page blocks automated access, redirects unusually, or is temporarily unavailable.`,
          },
        ],
        evidence: [],
        processing_failed: true,
        failure_reason: failureReason,
        failure_detail: failureMessage,
      });
    }
  }

  return {
    processedPages,
  };
}