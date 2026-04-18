import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import sharp from "sharp";
import { uploadToR2 } from "../../lib/r2/upload";
import { generateAuditMarkdown } from "../../lib/audit/generateAudit";

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
    (str || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const uniq = (arr: string[]) =>
    Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));

  const clipText = (arr: string[], max = 20) => uniq(arr).slice(0, max);

  const title = (text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
    .replace(/\s+/g, " ")
    .trim();

  const metaDescription = (
    text.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    )?.[1] || ""
  ).trim();

  const h1 = clipText(
    Array.from(text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) =>
      clean(m[1])
    ),
    5
  );

  const h2 = clipText(
    Array.from(text.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)).map((m) =>
      clean(m[1])
    ),
    12
  );

  const h3 = clipText(
    Array.from(text.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)).map((m) =>
      clean(m[1])
    ),
    16
  );

  const paragraphs = clipText(
    Array.from(text.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map((m) =>
      clean(m[1])
    ).filter((p) => p.length > 40),
    24
  );

  const listItems = clipText(
    Array.from(text.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((m) =>
      clean(m[1])
    ).filter((item) => item.length > 8),
    30
  );

  const buttons = clipText(
    Array.from(text.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)).map((m) =>
      clean(m[1])
    ).filter((x) => x.length > 0 && x.length <= 80),
    24
  );

  const linksDetailed = clipText(
    Array.from(
      text.matchAll(
        /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      )
    )
      .map((m) => {
        const href = (m[1] || "").trim();
        const label = clean(m[2]);
        if (!label || label.length > 100) return "";
        return `${label} -> ${href}`;
      })
      .filter(Boolean),
    50
  );

  const links = clipText(
    linksDetailed.map((item) => item.split(" -> ")[0]).filter(Boolean),
    40
  );

  const imageAltText = clipText(
    Array.from(
      text.matchAll(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi)
    ).map((m) => clean(m[1])).filter((x) => x.length > 2),
    20
  );

  const inputPlaceholders = clipText(
    Array.from(
      text.matchAll(/<input[^>]*placeholder=["']([^"']+)["'][^>]*>/gi)
    ).map((m) => clean(m[1])).filter((x) => x.length > 1),
    20
  );

  const ariaLabels = clipText(
    Array.from(
      text.matchAll(
        /<(?:button|a|input)[^>]*aria-label=["']([^"']+)["'][^>]*>/gi
      )
    ).map((m) => clean(m[1])).filter((x) => x.length > 1),
    20
  );

  const formLabels = clipText(
    Array.from(text.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/gi)).map((m) =>
      clean(m[1])
    ).filter((x) => x.length > 1),
    20
  );

  const navLabels = clipText(
    [...links, ...ariaLabels].filter((l) =>
      /home|product|products|features|solutions|pricing|about|contact|login|log in|sign in|sign up|dashboard|docs|documentation|resources|blog|book|demo|get started/i.test(
        l
      )
    ),
    12
  );

  const ctas = clipText(
    [...buttons, ...links, ...ariaLabels].filter((x) =>
      /start|get started|get demo|book|buy|shop|try|download|sign up|signup|sign in|join|request|demo|contact|talk to sales|contact sales|schedule|apply|subscribe|claim|launch|explore/i.test(
        x.toLowerCase()
      )
    ),
    20
  );

  const trustSignals = clipText(
    [...paragraphs, ...listItems, ...h2, ...h3].filter((p) =>
      /trusted|customers|companies|businesses|teams|reviews|testimonials|rated|used by|clients|case stud|partner|partners|featured in|as seen in|secure|compliance|gdpr|soc 2|iso|money-back|guarantee/i.test(
        p.toLowerCase()
      )
    ),
    16
  );

  const pricingSignals = clipText(
    [...paragraphs, ...listItems, ...h2, ...links].filter((p) =>
      /price|pricing|plan|plans|per month|subscription|free|trial|cost|billing|enterprise|starter|pro/i.test(
        p.toLowerCase()
      )
    ),
    16
  );

  const featureSnippets = clipText(
    [...h2, ...h3, ...paragraphs, ...listItems].filter((t) =>
      /feature|tool|platform|solution|service|manage|track|build|create|automate|workflow|analytics|dashboard|reporting|integration|integrations|secure|custom/i.test(
        t.toLowerCase()
      )
    ),
    16
  );

  const headlineCandidates = clipText([...h1, ...h2], 8);

  const heroGuess = {
    headline: h1[0] || h2[0] || title || "",
    subhead:
      paragraphs[0] ||
      listItems[0] ||
      metaDescription ||
      "",
    primaryCTA: ctas[0] || buttons[0] || "",
  };

  const inputCount = (text.match(/<input\b/gi) || []).length;
  const formCount = (text.match(/<form\b/gi) || []).length;
  const imageCount = (text.match(/<img\b/gi) || []).length;
  const buttonCount = (text.match(/<button\b/gi) || []).length;
  const linkCount = (text.match(/<a\b/gi) || []).length;

  const hasPricing = /pricing|price|plan|plans|billing/i.test(text);
  const hasCheckout = /checkout|pay|payment|stripe|paddle/i.test(text);
  const hasEmailCapture =
    /type=["']email["']|newsletter|subscribe|join our list|get updates/i.test(
      text
    );

  const structureHints = {
    hasMultipleCTAs: ctas.length > 3,
    hasWeakCTA: ctas.length === 0,
    hasTrustSignals: trustSignals.length > 0,
    hasClearNav: navLabels.length > 0,
    hasLists: listItems.length > 0,
    hasForms: formCount > 0,
    hasImages: imageCount > 0,
    hasFeatureDepth: featureSnippets.length >= 3,
  };

  const uxAnalysis = {
    clarityScore: h1.length > 0 ? 1 : 0,
    hasCTA: ctas.length > 0,
    ctaStrength: ctas.length > 2 ? "strong" : ctas.length > 0 ? "weak" : "none",
    trustScore: trustSignals.length,
    contentDepth: paragraphs.length + listItems.length,
    navClarity: navLabels.length > 0,
    frictionIndicators: {
      noCTA: ctas.length === 0,
      noTrust: trustSignals.length === 0,
      thinContent: paragraphs.length + listItems.length < 4,
      noNav: navLabels.length === 0,
    },
  };

  const metrics = {
    wordCount: clean(text).split(" ").filter(Boolean).length,
    ctaCount: ctas.length,
    navCount: navLabels.length,
    trustCount: trustSignals.length,
    headingCount: h1.length + h2.length + h3.length,
    paragraphCount: paragraphs.length,
    listItemCount: listItems.length,
    imageCount,
    buttonCount,
    linkCount,
    formLabelCount: formLabels.length,
    imageAltCount: imageAltText.length,

    hasSingleCTA: ctas.length === 1,
    hasTooManyCTAs: ctas.length > 5,
    contentToCTAImbalance: paragraphs.length + listItems.length > 8 && ctas.length < 2,
    trustDeficit: trustSignals.length === 0,
    weakStructure: h1.length === 0 || paragraphs.length + listItems.length < 2,

    conversionReadinessScore: (() => {
      let score = 0;
      if (ctas.length > 0) score += 2;
      if (ctas.length === 1) score += 2;
      if (trustSignals.length > 0) score += 2;
      if (paragraphs.length + listItems.length > 3) score += 2;
      if (navLabels.length > 0) score += 2;
      return score;
    })(),
  };

  return {
    uxAnalysis,
    metrics,
    url,
    title,
    metaDescription,
    h1,
    h2,
    h3,
    paragraphs,
    listItems,
    navLabels,
    ctas,
    trustSignals,
    pricingSignals,
    featureSnippets,
    links,
    linksDetailed,
    imageAltText,
    inputPlaceholders,
    ariaLabels,
    formLabels,
    headlineCandidates,
    heroGuess,
    structureHints,
    flags: { hasPricing, hasCheckout, hasEmailCapture },
    counts: { inputCount, formCount },
  };
}

function computeAuditScores(signals: any) {
  const metrics = signals?.metrics || {};
  const flags = signals?.flags || {};
  const paragraphs = signals?.paragraphs || [];
  const h1 = signals?.h1 || [];
  const trustSignals = signals?.trustSignals || [];
  const navLabels = signals?.navLabels || [];
  const heroGuess = signals?.heroGuess || {};

  const hasCTA =
    (metrics.ctaCount || 0) > 0 || !!heroGuess.primaryCTA;

  const hasTrust =
    (metrics.trustCount || 0) > 0 || trustSignals.length > 0;

  const hasClearHeadline =
    h1.length > 0 &&
    typeof heroGuess.headline === "string" &&
    heroGuess.headline.trim().length >= 8;

  let score = {
    clarity: 6,
    trust: 6,
    conversion: 6,
    ux: 6,
    marketing: 6,
  };

  // clarity
  if (!hasClearHeadline) score.clarity -= 2;
  if ((metrics.paragraphCount || paragraphs.length || 0) < 3) score.clarity -= 1;
  if ((metrics.wordCount || 0) < 120) score.clarity -= 1;
  if (h1.length > 0) score.clarity += 1;
  if ((metrics.paragraphCount || paragraphs.length || 0) >= 5) score.clarity += 1;

  // trust
  if (!hasTrust) score.trust -= 2;
  if ((signals?.links?.length || 0) < 5) score.trust -= 1;
  if ((metrics.trustCount || trustSignals.length || 0) >= 2) score.trust += 1;
  if ((metrics.trustCount || trustSignals.length || 0) >= 5) score.trust += 1;

  // conversion
  if (!hasCTA) score.conversion -= 2;
  if ((metrics.ctaCount || 0) === 0) score.conversion -= 1;
  if ((metrics.ctaCount || 0) > 5) score.conversion -= 1;
  if (flags?.hasEmailCapture) score.conversion += 1;
  if (flags?.hasCheckout) score.conversion += 1;
  if (flags?.hasPricing) score.conversion += 1;

  // ux
  if ((metrics.navCount || navLabels.length || 0) === 0) score.ux -= 2;
  if ((metrics.navCount || navLabels.length || 0) >= 1) score.ux += 1;
  if ((signals?.counts?.formCount || 0) > 0 && (signals?.counts?.inputCount || 0) > 0) {
    score.ux += 1;
  }

  // marketing
  if (!signals?.metaDescription) score.marketing -= 1;
  if (!signals?.title) score.marketing -= 1;
  if ((metrics.wordCount || 0) < 120) score.marketing -= 1;
  if (flags?.hasPricing) score.marketing += 1;
  if ((signals?.pricingSignals?.length || 0) > 0) score.marketing += 1;
  if (signals?.metaDescription) score.marketing += 1;
  if (signals?.title) score.marketing += 1;

  const clamp = (v: number) => Math.max(0, Math.min(10, Math.round(v)));

  return {
    clarity: clamp(score.clarity),
    trust: clamp(score.trust),
    conversion: clamp(score.conversion),
    ux: clamp(score.ux),
    marketing: clamp(score.marketing),
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

    const fallbackEndpoint = `https://image.thum.io/get/fullpage/noanimate/${encodeURIComponent(url)}`;

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
      console.error(`Failed to fetch screenshot for markers: ${response.status}`);
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
 async function generateRestrictedAudit(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "Restricted audit unavailable (AI not configured)";

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `
You are a senior product designer generating a RESTRICTED audit.

The page could not be fully accessed due to:
- bot protection OR
- dynamic rendering OR
- blocked HTML signals

You MUST:
- Be transparent about limitations
- Use ONLY available signals
- Still produce valuable insight

DO NOT:
- Hallucinate UI
- Pretend you saw the full page

FOCUS ON:
- clarity risks
- messaging gaps
- likely conversion friction
`;

  const user = `
RESTRICTED AUDIT MODE

URL: ${payload.product_url}

AVAILABLE SIGNALS:
${JSON.stringify(payload.signals, null, 2)}
SCORES:
${JSON.stringify(payload.scores, null, 2)}

SCREENSHOT:
${payload.screenshot_url ? "Available (may be partial)" : "Not available"}

---

OUTPUT FORMAT:

## Executive Summary
Explain what could and could NOT be analyzed

## What We Can Confirm
Only facts from signals

## Likely Issues (Inference-Based)
Clearly label assumptions

## Conversion Risks
Where users likely drop off

## Priority Fixes
Concrete actions despite limited visibility

## Limitations
Explain what blocked analysis

## Recommended Next Step
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const json = await res.json();

const output =
  json?.output?.[0]?.content?.[0]?.text ||
  json?.output_text ||
  "";
 

if (!output || output.length < 200) {
  console.error("LLM BAD RESPONSE:", JSON.stringify(json, null, 2));
  return "";
}

return output.trim();
 }
function ensureUiImprovementMarkers(markdown: string) {
  return markdown;
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
    const issueMatch = block.match(/Issue:\s*([\s\S]*?)(?=\n(?:Evidence Source|Confidence|Evidence|Fix):|$)/i);
    const evidenceMatch = block.match(/Evidence:\s*([\s\S]*?)(?=\n(?:Fix|$):|$)/i);
    const fixMatch = block.match(/Fix:\s*([\s\S]*?)$/i);

    const marker = markerMatch ? parseInt(markerMatch[1], 10) : undefined;
    if (!marker) continue;

    const issueText = issueMatch?.[1]?.trim() || "";
    let evidenceText = evidenceMatch?.[1]?.trim() || "";
    const fixText = fixMatch?.[1]?.trim() || "";

    const weakEvidencePattern =
      /\$\{.*?\}|undefined|null|\[\]|\{\}|visually unclear|not visible|unable to determine|no indication of|manual review|needs manual review|review required|similar styling|visual differentiation|equal visual weight|appears as standard text links/i;

    const weakIssuePattern =
      /manual review|needs manual review|review required|improve ux|enhance design|optimize layout|make clearer|improve hierarchy/i;

    if (weakEvidencePattern.test(evidenceText)) {
      evidenceText = "";
    }

    const combinedText = `${issueText} ${evidenceText}`.toLowerCase();

    if (!issueText || weakIssuePattern.test(issueText) || !fixText) {
      continue;
    }

    if (
      /visually unclear|not visible|unable to determine|visual review required|manual review/.test(
        combinedText
      )
    ) {
      continue;
    }

    const region = getEvidenceRegion(issueText, evidenceText);

    results.push({
      marker,
      issue: issueText,
      evidence: evidenceText,
      fix: fixText,
      crop_url: null,
      region_label: region.region_label,
      region_confidence: region.region_confidence,
      position: getEvidencePosition(marker, issueText, evidenceText),
    });
  }

  return results.slice(0, 6);
}

function dedupeUiEvidence(items: UiEvidence[]): UiEvidence[] {
  const seen = new Set<string>();
  const results: UiEvidence[] = [];

  for (const item of items) {
    const region = item.region_label || "unknown";

    const normalizedIssue = (item.issue || "")
      .toLowerCase()
      .replace(/["“”]/g, "")
      .replace(/\b(primary|secondary|main|visual|clear|clearer|more|prominent|stronger)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const normalizedFix = (item.fix || "")
      .toLowerCase()
      .replace(/["“”]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const key = `${region}::${normalizedIssue}::${normalizedFix}`;

    if (seen.has(key)) continue;

    seen.add(key);
    results.push(item);

    if (results.length >= 6) break;
  }

  return results;
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
async function getMarketContext(url: string) {
  try {
    const domain = new URL(url).hostname;

    // BASIC GOOGLE SEARCH FOR COMPETITORS
    const searchRes = await fetch(
      `https://serpapi.com/search.json?q=${domain}+alternatives&api_key=${process.env.SERP_API_KEY}`
    );

    const searchJson = await searchRes.json();

    const competitors =
      searchJson?.organic_results?.slice(0, 5).map((r: any) => ({
        title: r.title,
        link: r.link,
      })) || [];

    return {
      domain,
      competitors,
      traffic_estimate: "unknown", // placeholder for now
    };
  } catch (err) {
    console.error("MARKET CONTEXT FAILED", err);
    return null;
  }
}

function normalizeLegacyAuditLanguage(markdown: string) {
  if (!markdown) return markdown;

  return markdown
    .replace(/^##\s*Critical Issues\b/gim, "## Requires Attention")
    .replace(/\bSeverity:\s*Critical\b/gim, "Priority Level: Requires Attention")
    .replace(/\bSeverity:\s*High\b/gim, "Priority Level: Requires Attention")
    .replace(/\bSeverity:\s*Medium\b/gim, "Priority Level: Worth Improving")
    .replace(/\bSeverity:\s*Low\b/gim, "Priority Level: Observation");
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
       let htmlRes;

try {
  htmlRes = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
  });
} catch (err) {
  console.error("FETCH PRIMARY FAILED — retrying without https", err);

  try {
    htmlRes = await fetch(`http://${new URL(url).hostname}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      },
    });
  } catch (err2) {
    console.error("FETCH FALLBACK FAILED", err2);
    throw err;
  }
}


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
        html = "";
        signals = extractSignals("", url);
        signals.restricted_reason = "HTML blocked or inaccessible";
      }

 // ✅ SCREENSHOT (DEFINE BEFORE ANY USAGE)
const screenshotUrl: string | null = await (async () => {
  try {
    const shot = await captureScreenshot(url);

    console.log("AUDIT SCREENSHOT CAPTURE", {
      url,
      success: !!shot,
    });

    return shot;
  } catch (err) {
    console.error("SCREENSHOT ERROR", url, err);
    return null;
  }
})();

// ✅ PLAYWRIGHT HTML EXTRACTION (STRONGER THAN FETCH)
// Run this even if screenshot capture failed.
try {
  console.log("PLAYWRIGHT HTML EXTRACTION START", { url });

  let htmlBrowser: any = null;

  try {
    htmlBrowser = await playwright.launch({
      args: chromium.args,
      executablePath:
        process.env.VERCEL
          ? await chromium.executablePath()
          : undefined,
      headless: true,
    });

    const context = await htmlBrowser.newContext({
      viewport: { width: 1440, height: 1600 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    await page.waitForTimeout(1800);

    try {
      await page.waitForLoadState("load", { timeout: 8000 });
    } catch {
      console.log("PLAYWRIGHT HTML LOAD STATE TIMEOUT - continuing", { url });
    }

    try {
      await handleCookieBanner(page);
    } catch {
      console.log("PLAYWRIGHT HTML COOKIE HANDLER SKIPPED", { url });
    }

    const renderedHtml = await page.content();

    if (renderedHtml && renderedHtml.length > 1000) {
      console.log("PLAYWRIGHT HTML SUCCESS — overriding fetch HTML", {
        url,
        length: renderedHtml.length,
      });

      html = renderedHtml;
      signals = extractSignals(html, url);
    } else {
      console.log("PLAYWRIGHT HTML TOO WEAK — keeping existing version", {
        url,
        length: renderedHtml?.length || 0,
      });
    }
  } finally {
    if (htmlBrowser) {
      await htmlBrowser.close();
    }
  }
} catch (err) {
  console.error("PLAYWRIGHT HTML FAILED — fallback to fetch", err);
}

// ✅ DEFINE ALL VARIABLES AFTER screenshot exists
let restrictedMode = false;
let auditMarkdown: string = "";
let uiEvidence: UiEvidence[] = [];
let markedScreenshotUrl: string | null = null;
let markedScreenshotMap: Record<number, string> = {};
let sections: any[] = [];
let scores: ReturnType<typeof computeAuditScores> | null = null;

try {
  scores = computeAuditScores(signals);
  const marketContext = await getMarketContext(url);
  const auditPayload = {
    product_url: row.product_url || url,
    focus_page_url: row.focus_page_url || "",
    notes: row.notes,
    signals,
    scores,
    marketContext,
    focus_signals: null,
    screenshot_url: screenshotUrl,
    focus_screenshot_url: null,
  };


  auditMarkdown = await generateAuditMarkdown(auditPayload);

  if (!auditMarkdown || auditMarkdown.length < 1200) {
    auditMarkdown = await generateAuditMarkdown({
      ...auditPayload,
      retry: true,
    });
  }

  auditMarkdown = normalizeLegacyAuditLanguage(auditMarkdown);

  if (!auditMarkdown || auditMarkdown.length < 800) {
    restrictedMode = true;

    auditMarkdown = await generateRestrictedAudit({
      product_url: row.product_url || url,
      signals,
      scores,
      screenshot_url: screenshotUrl,
});
  }

  auditMarkdown = normalizeLegacyAuditLanguage(auditMarkdown);

} catch (err) {
  console.error("AUDIT MARKDOWN FAILED:", url, err);

  auditMarkdown = `
## Executive Summary
Audit failed during processing.

## Processing Status
This page could not be fully analyzed during the automated run.

## Recommended Next Step
Retry the audit after confirming the page is reachable and does not block automated access.
`;
}

// POST PROCESS
auditMarkdown = ensureUiImprovementMarkers(auditMarkdown);
uiEvidence = dedupeUiEvidence(
  extractUiEvidenceFromMarkdown(auditMarkdown)
);

// If the model produced weak UI evidence, do not force filler.
if (uiEvidence.length === 0) {
  console.log("NO STRONG UI EVIDENCE EXTRACTED", { url });
}

// MARKERS
if (screenshotUrl && uiEvidence.length) {
  try {
    markedScreenshotMap = await addScreenshotMarkers(
      screenshotUrl,
      uiEvidence
    );

    markedScreenshotUrl =
      markedScreenshotMap[uiEvidence[0]?.marker] || screenshotUrl;

  } catch {
    markedScreenshotUrl = screenshotUrl;
  }
}

// CROPS
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

// SECTIONS
sections = auditMarkdown
  .split(/(?=## )/g)
  .map((section) => {
    const match = section.match(/^##\s+(.*)/);
    return {
      title: match ? match[1].trim() : "Section",
      content: section.replace(/^##\s+.*\n?/, "").trim(),
    };
  })
  .filter((s) => s.content);

// BUILD INFO
sections.unshift({
  title: "Audit Build Info",
  content: `
Environment: ${process.env.VERCEL_ENV || "unknown"}
Model: ${process.env.OPENAI_MODEL || "gpt-4.1"}
Generated At: ${new Date().toISOString()}
Mode: ${restrictedMode ? "Restricted" : "Full"}
`,
});

// FINAL PUSH
processedPages.push({
  url,
  screenshot_url: screenshotUrl,
  marked_screenshot_url: markedScreenshotUrl,
  sections,
  evidence: uiEvidence,
  scores,
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
