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
    Array.from(
      text.matchAll(
        /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      )
    ).map((m) => {
      const href = (m[1] || "").trim();
      const label = (m[2] || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return `${label} -> ${href}`;
    })
  )
    .filter((x) => !x.includes("-> #"))
    .slice(0, 30);

  const hasPricing = /pricing|price|plan|plans|billing|subscription/i.test(
    text
  );
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
  let browser: any = null;

  try {
    console.log("SCREENSHOT START", { url });

  browser = await playwright.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
});

    console.log("BROWSER LAUNCHED SUCCESSFULLY");
    console.log("SCREENSHOT BROWSER LAUNCHED", { url });

    const page = await browser.newPage({
      viewport: { width: 1440, height: 1600 },
      deviceScaleFactor: 1,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });

    console.log("SCREENSHOT PAGE CREATED", { url });

   let success = false;

for (let attempt = 1; attempt <= 2; attempt++) {
  try {
    console.log("SCREENSHOT NAV ATTEMPT", { url, attempt });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    // critical: controlled render wait
   

    success = true;
    break;
  } catch (err) {
    console.error("NAV FAILED", { url, attempt });
  }
}

if (!success) {
  throw new Error("NAVIGATION_FAILED");
}

// fallback wait — do NOT rely on networkidle in serverless
await page.waitForTimeout(2000);

console.log("SCREENSHOT PAGE GOTO OK", { url });

const raw = await page.screenshot({
  fullPage: true,
  type: "png",
});

    console.log("SCREENSHOT RAW CAPTURED", {
      url,
      bytes: raw.length,
    });

    const compressed = await sharp(raw)
      .resize({ width: 1440, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();

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
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function addScreenshotMarkers(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);

  if (!response.ok) {
    console.error(
      `Failed to fetch screenshot for markers: ${response.status}`
    );
    return imageUrl; 
  }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const meta = await sharp(buffer).metadata();
    const width = meta.width || 1440;
    const height = meta.height || 900;

    const markers = [
      { x: width * 0.12, y: height * 0.1, label: 1 },
      { x: width * 0.5, y: height * 0.1, label: 2 },
      { x: width * 0.86, y: height * 0.1, label: 3 },
      { x: width * 0.5, y: height * 0.4, label: 4 },
      { x: width * 0.2, y: height * 0.74, label: 5 },
      { x: width * 0.8, y: height * 0.74, label: 6 },
    ];

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${markers
          .map(
            (m) => `
          <circle cx="${m.x}" cy="${m.y}" r="34" fill="#FF5A1F"/>
          <circle cx="${m.x}" cy="${m.y}" r="40" fill="none" stroke="white" stroke-width="6"/>
          <text
            x="${m.x}"
            y="${m.y + 11}"
            text-anchor="middle"
            font-size="28"
            font-weight="800"
            fill="white"
            font-family="Arial, sans-serif"
          >${m.label}</text>
        `
          )
          .join("")}
      </svg>
    `;

    const out = await sharp(buffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    const key = `screenshots/marked/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.jpg`;

    const markedUrl = await uploadToR2(out, key);

    return markedUrl;
  } catch (err) {
    console.error("MARKER OVERLAY ERROR:", err);
    return imageUrl;
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

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `You are Elessen Labs' senior product/UX auditor.

Return a sharp, high-signal audit like a senior product designer reviewing a real product.

Rules:
- No generic advice
- No vague language like "improve", "optimize", "enhance", or "make clearer"
- Every point must be specific and grounded in visible UI or extracted signals
- Do not hallucinate analytics, user behavior, conversions, traffic, or missing features
- If something is unclear, say it is visually unclear instead of guessing
- Write like an experienced product designer and conversion strategist reviewing a real interface, not a template`;

  const screenshotState = payload.screenshot_url
    ? "Screenshot captured successfully and is available for visual review."
    : "Screenshot not available.";

  const user = `AUDIT REQUEST

URL: ${payload.product_url}
FOCUS PAGE: ${payload.focus_page_url || "Not provided"}
Notes: ${payload.notes || "—"}

SCREENSHOT STATUS
${screenshotState}

EXTRACTED SIGNALS (from HTML)
${JSON.stringify(payload.signals, null, 2)}

Use ONLY:
- extracted signals
- the fact that a screenshot exists when screenshot status says it is available

DO NOT:
- assume traffic, users, or analytics
- invent missing elements
- guess functionality not visible

If something is unclear, say it is unclear.

RETURN THE AUDIT IN CLEAN MARKDOWN USING THESE EXACT HEADINGS:

## Executive Summary
- Max 5 bullets
- Focus on product clarity, messaging, and conversion

## Critical Issues
For each issue use this exact format:

- Severity: Critical / High / Medium / Low
  Issue: short issue title
  Evidence: what proves this problem from the extracted signals
  Why it matters: why this hurts UX or conversion
  Recommended fix: specific action

## Conversion Improvements
For each improvement use this exact format:

- Issue: short issue title
  Evidence: what proves this problem
  Fix: recommended action
  Effort: Low / Medium / High
  Impact: Low / Medium / High

## UI Improvements

You MUST generate EXACTLY 6 UI improvements.

Use this exact marker sequence once each and in order:
1, 2, 3, 4, 5, 6

Every item MUST begin with:
- Marker: X

STRICT FORMAT FOR ALL 6 ITEMS:

- Marker: 1
  Issue: specific UI problem
  Evidence: specific visible or structurally inferred evidence
  Fix: one precise UI change

- Marker: 2
  Issue: specific UI problem
  Evidence: specific visible or structurally inferred evidence
  Fix: one precise UI change

- Marker: 3
  Issue: specific UI problem
  Evidence: specific visible or structurally inferred evidence
  Fix: one precise UI change

- Marker: 4
  Issue: specific UI problem
  Evidence: specific visible or structurally inferred evidence
  Fix: one precise UI change

- Marker: 5
  Issue: specific UI problem
  Evidence: specific visible or structurally inferred evidence
  Fix: one precise UI change

- Marker: 6
  Issue: specific UI problem
  Evidence: specific visible or structurally inferred evidence
  Fix: one precise UI change

Rules:
- Use each marker exactly once
- Do not skip any marker
- Do not repeat any marker
- Do not use generic phrases like "improve hierarchy"
- If the screenshot is unavailable or visual evidence is uncertain, explicitly say it is visually unclear
- Keep each field short, specific, and actionable

## Copy Improvements
- Main headline rewrite:
- Primary CTA rewrite:
- Messaging improvement:
- Messaging improvement:
- Messaging improvement:

## SEO Quick Wins
- One recommendation per bullet

## 7-Day Sprint Plan
- Day 1: task
- Day 2: task
- Day 3: task
- Day 4: task
- Day 5: task
- Day 6: task
- Day 7: task

## Questions / Assumptions
- Max 6 bullets`;

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
const evidenceText = evidenceMatch?.[1]?.trim() || "";
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

  const isNav =
    /nav|navigation|menu|header|top nav|top navigation/.test(text);

  const isHero =
    /hero|headline|subheadline|above the fold|first impression|value proposition|top section|main message|positioning/.test(
      text
    );

  const isCta =
    /cta|call to action|button|primary button|secondary button|download|apply|start|book|sign up|signup|join|request demo|demo|contact sales/.test(
      text
    );

  const isPricing =
    /pricing|price|plan|plans|billing|subscription|compare|comparison|tier|tiers|package|packages|table/.test(
      text
    );

  const isTrust =
    /trust|social proof|testimonial|testimonials|logo|logos|customer|customers|proof|credibility|review|reviews|case stud|brand|partner|partners/.test(
      text
    );

  const isForm =
    /form|input|field|email capture|lead capture|contact form|newsletter|subscribe/.test(
      text
    );

  const isGrid =
    /card|cards|grid|module|content block|resource|resources|feature block|feature grid|product block|product card|feature card|listing|section/.test(
      text
    );

  const isFooter =
    /footer|bottom|legal|privacy|terms|site links|site map|social links/.test(
      text
    );

  if (isNav) {
    return { x: 0.5, y: 0.08, width: 0.92, height: 0.14 };
  }

  if (isHero && isCta) {
    return { x: 0.5, y: 0.22, width: 0.9, height: 0.3 };
  }

  if (isHero) {
    return { x: 0.5, y: 0.2, width: 0.9, height: 0.28 };
  }

  if (isPricing) {
    return { x: 0.5, y: 0.48, width: 0.9, height: 0.28 };
  }

  if (isCta || isForm) {
    return { x: 0.5, y: 0.52, width: 0.8, height: 0.24 };
  }

  if (isTrust) {
    return { x: 0.5, y: 0.42, width: 0.86, height: 0.22 };
  }

  if (isGrid) {
    if (marker === 4) return { x: 0.5, y: 0.45, width: 0.9, height: 0.24 };
    if (marker === 5) return { x: 0.35, y: 0.62, width: 0.6, height: 0.24 };
    if (marker === 6) return { x: 0.65, y: 0.62, width: 0.6, height: 0.24 };
    return { x: 0.5, y: 0.5, width: 0.9, height: 0.24 };
  }

  if (isFooter) {
    return { x: 0.5, y: 0.86, width: 0.92, height: 0.18 };
  }

  const fallbackMap: Record<number, UiEvidence["position"]> = {
    1: { x: 0.5, y: 0.2, width: 0.9, height: 0.28 },
    2: { x: 0.5, y: 0.32, width: 0.9, height: 0.24 },
    3: { x: 0.5, y: 0.42, width: 0.9, height: 0.24 },
    4: { x: 0.5, y: 0.52, width: 0.9, height: 0.24 },
    5: { x: 0.35, y: 0.66, width: 0.6, height: 0.24 },
    6: { x: 0.65, y: 0.66, width: 0.6, height: 0.24 },
  };

  return fallbackMap[marker] || { x: 0.5, y: 0.5, width: 0.85, height: 0.24 };
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
        700,
        Math.round(item.position.width * imageWidth * 1.35)
      );

      const desiredHeight = Math.max(
        420,
        Math.round(item.position.height * imageHeight * 1.35)
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

    let markedScreenshotUrl: string | null = null;
      if (screenshotUrl) {
  try {
    const markerResult = await addScreenshotMarkers(screenshotUrl);

    markedScreenshotUrl = markerResult || screenshotUrl;

    console.log("AUDIT MARKER OVERLAY", {
      url,
      success: !!markerResult,
      fallbackUsed: !markerResult,
    });

  } catch (err) {
    console.error("AUDIT MARKER OVERLAY FAILED:", url, err);

    // HARD fallback — NEVER leave this null
    markedScreenshotUrl = screenshotUrl;
  }
}

      let auditMarkdown = "";
      let uiEvidence: UiEvidence[] = [];

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

        auditMarkdown = ensureUiImprovementMarkers(auditMarkdown);
        uiEvidence = extractUiEvidenceFromMarkdown(auditMarkdown);

      const baseImageForCrops =
       markedScreenshotUrl || screenshotUrl;

        if (baseImageForCrops && uiEvidence.length) {
          uiEvidence = await generateEvidenceCrops(
          baseImageForCrops,
          uiEvidence
        );
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