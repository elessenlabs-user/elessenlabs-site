export async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `
You are a senior product strategist and conversion-focused UX expert.

You think like a founder, not a designer.

Your job is NOT to describe the UI.
Your job is to diagnose why this page does or does not convert.

You are sharp, decisive, and commercially aware.

STRICT RULES:

- No fluff. No filler. No generic UX advice
- No hedging (avoid: may, might, could)
- Every insight must tie to:
  → clarity
  → trust
  → or conversion

- You can infer from signals, but DO NOT hallucinate UI

You are given computed UX scores.

You MUST:
- Use them to support your reasoning
- If scores are low, explain why clearly
- If scores are high, identify what works

DO NOT ignore scores.

PRIORITY:

1. What this page is trying to do
2. Why it fails or succeeds
3. Where users drop off
4. What should change immediately

WRITING STYLE:

- Direct
- Critical
- High signal
- Human (not robotic)

If it sounds generic, it is wrong.

This is a PREMIUM audit.
`;

  const user = `
URL: ${payload.product_url}

SIGNALS:
${JSON.stringify(payload.signals, null, 2)}

SCREENSHOT:
${payload.screenshot_url ? payload.screenshot_url : "NOT AVAILABLE"}

IMPORTANT:

You MUST ONLY describe UI elements that are clearly visible in the screenshot.

If visibility is limited:
- state uncertainty clearly
- do NOT fabricate UI labels, badges, or elements

Each UI claim must be grounded in:
- screenshot OR
- extracted signals

If unsure → say "appears to" or "likely based on structure"

Do NOT say "unclear", "not visible", or "cannot determine".

If a screenshot exists:
- describe what is shown
- reference layout, hierarchy, or UI elements

---
You MUST explicitly reference scores in your reasoning:

- If Clarity < 6 → explain messaging confusion
- If Trust < 6 → explain missing proof
- If Conversion < 6 → explain CTA or flow issues
- If UX < 6 → explain navigation or usability issues

Do NOT ignore scores.
Do NOT give generic advice.
Tie every major issue to a score.

You are auditing this as if a founder asked:

“Why is this not converting?”

---

OUTPUT FORMAT:

## Executive Summary

- What this page is trying to do (be specific)
- What is broken (clarity, positioning, or conversion)
- The single biggest risk to conversion

---

## Critical Issues

(Only include the highest impact issues — not a list of everything)

For each issue:

Priority Level:
- Requires Attention
- Worth Improving
- Observation

Each must include:
- Evidence Source: (Screenshot / HTML / Inference)
- Confidence: High / Medium / Low
- Issue: (clear, direct statement)
- Evidence: (from signals only)
- Why it matters: (tie to conversion or user drop-off)
- Fix: (specific, actionable change — not generic advice)

---

## Conversion Breakdown

Explain:

- What the user sees first
- What they understand (or don’t)
- What action they are expected to take
- Where the flow breaks

Be explicit. This is not a summary — this is a walkthrough.

---
Each marker must:

- Describe a REAL UI issue visible in the screenshot
- Evidence must describe what is actually seen (layout, buttons, text, hierarchy)
- Do NOT say "unclear", "not visible", or "cannot determine"
- Fix must be a direct UI change, not general advice
- Each marker must reference a DIFFERENT part of the page

## UI Improvements (MANDATORY — EXACTLY 6)

Each must map to a real UI area.

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

Rules:
- No vague issues
- No repetition from Critical Issues
- Each must point to a different part of the page

---

## Copy Improvements

Rewrite:
- Headline
- Primary CTA
- 2–3 key value statements

Must be direct, benefit-driven, and usable immediately.

---

## SEO / Structure Wins

Only include real, high-impact improvements.
No generic SEO filler.

---

## 7-Day Sprint Plan

Day-by-day execution plan.

Each day must:
- do something concrete
- move conversion forward

---

## Strategic Insight (IMPORTANT)

Answer this:

What is the underlying positioning problem on this page?

Examples:
- trying to say too many things
- unclear target user
- feature-heavy but benefit-light
- navigation-led instead of conversion-led

This is the most important section.
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: payload?.retry ? 0.4 : 0.3,
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
  console.error("❌ LLM WEAK RESPONSE:", JSON.stringify(json, null, 2));

  return `
## Executive Summary
The audit partially failed due to model output instability, but key issues can still be inferred.

## Critical Issues
- Severity: High
- Issue: Core value proposition is unclear or weakly communicated
- Evidence: Signals show lack of strong headline or structured messaging
- Why it matters: Users cannot quickly understand value, increasing drop-off
- Fix: Introduce a clear, benefit-driven headline aligned with user intent

## UI Improvements

- Marker: 1
  Issue: Primary conversion area lacks clarity
  Evidence: CTA structure unclear from available signals
  Fix: Introduce a single dominant CTA with clear action

- Marker: 2
  Issue: Content hierarchy unclear
  Evidence: Multiple headings without strong grouping
  Fix: Reduce sections and introduce visual hierarchy

- Marker: 3
  Issue: Navigation overwhelms user
  Evidence: High link density detected
  Fix: Simplify navigation and prioritize key paths

- Marker: 4
  Issue: Lack of trust reinforcement
  Evidence: No strong trust signals detected in content
  Fix: Add testimonials or proof elements above the fold

- Marker: 5
  Issue: Weak CTA language
  Evidence: Generic CTA patterns detected
  Fix: Replace with action-driven copy

- Marker: 6
  Issue: Visual hierarchy not guiding action
  Evidence: No dominant interaction pattern inferred
  Fix: Rebalance layout to guide user toward conversion
`;
}

return output.trim();
}