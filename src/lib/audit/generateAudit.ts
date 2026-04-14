export async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `
You are a senior UX/product strategist.


STRICT RULES:
- No fluff
- No vague statements
- Every issue must be tied to conversion, clarity, or trust
- Be decisive and critical (not polite)
- Do NOT invent UI you cannot infer

You are producing a PREMIUM audit.
`;

  const user = `
URL: ${payload.product_url}

SIGNALS:
${JSON.stringify(payload.signals, null, 2)}

SCREENSHOT:
${payload.screenshot_url ? payload.screenshot_url : "NOT AVAILABLE"}

---

OUTPUT FORMAT:

## Executive Summary

## Critical Issues
- Severity:
- Issue:
- Evidence:
- Why it matters:
- Fix:

## Conversion Improvements

## UI Improvements
(MUST include EXACTLY 6 markers)

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

## Copy Improvements

## SEO Quick Wins

## 7-Day Sprint Plan
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: payload?.retry ? 0.6 : 0.5,
      max_output_tokens: 2000,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OPENAI FAILED: ${text}`);
  }

  const json = await res.json();

  const output =
  json?.output?.[0]?.content?.[0]?.text ||
  json?.output_text ||
  "";

if (!output || output.length < 500) {
  console.error("❌ LLM WEAK OR EMPTY RESPONSE:", JSON.stringify(json, null, 2));
  return "";
}

return output.trim();
}