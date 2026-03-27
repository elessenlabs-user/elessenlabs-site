

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

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

async function addScreenshotMarkers(imageUrl: string) {
  return imageUrl;
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

  const user = `AUDIT REQUEST

URL: ${payload.product_url}
FOCUS PAGE: ${payload.focus_page_url || "Not provided"}
Notes: ${payload.notes || "—"}

SCREENSHOT
${payload.screenshot_url || "Not available"}

EXTRACTED SIGNALS (from HTML)
${JSON.stringify(payload.signals, null, 2)}

Use ONLY:
- extracted signals
- visible UI from screenshot

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

## UI Improvements

You MUST generate EXACTLY 6 UI improvements.

Each improvement MUST:
- Use Marker numbers 1 to 6
- Use each marker exactly once
- Refer to a distinct visible area of the screenshot
- Be grounded only in what is clearly visible

STRICT FORMAT:

- Marker: 1
  Issue: specific UI problem
  Evidence: describe exactly what is visible at that marker location in the screenshot
  Fix: one precise UI change

Rules:
- No generic phrases like "improve hierarchy" or "make it clearer"
- Every issue must be tied to something visible in the screenshot
- Do not guess hidden functionality
- If something is unclear, say what is visually unclear
- Keep each field short and specific

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

export async function runAuditPipeline(row: any) {
  const pages = Array.isArray(row.pages) && row.pages.length > 0
  ? row.pages
  : [row.product_url].filter(Boolean);

const processedPages = [];

for (const rawPage of pages) {
  const url =
    typeof rawPage === "string"
      ? rawPage
      : rawPage?.url || "";

  if (!url) continue;

  try {
    // 1. Fetch HTML
    const htmlRes = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "ElessenLabsAuditBot/1.0 (+https://elessenlabs.com)",
        Accept: "text/html,*/*",
      },
    });

    const html = await htmlRes.text();

    // 2. Extract signals
    const signals = extractSignals(html, url);

    // 3. Screenshot
    const screenshotUrl = await captureScreenshot(url);

    const markedScreenshotUrl = screenshotUrl
      ? await addScreenshotMarkers(screenshotUrl)
      : null;

      console.log("AUDIT SCREENSHOT RESULT", {
        url,
        screenshotUrl,
        markedScreenshotUrl,
      });

    // 4. Generate markdown (PER PAGE)
    const auditMarkdown = await generateAuditMarkdown({
      product_url: url,
      focus_page_url: "",
      notes: row.notes,
      signals,
      focus_signals: null,
      screenshot_url: screenshotUrl,
      focus_screenshot_url: null,
    });

    // 5. Split into sections
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

    processedPages.push({
      url,
      screenshot_url: screenshotUrl,
      marked_screenshot_url: markedScreenshotUrl,
      sections,
    });

  } catch (err) {
    console.error("PAGE AUDIT FAILED:", url, err);
  }
}

return {
  processedPages,
};
}