export async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `
You are a senior product strategist, UX reviewer, and conversion analyst.

You are producing a product teardown based only on evidence supplied to you.

Your job is to identify:
- what the page is trying to do
- what supports conversion
- what weakens conversion
- what should change first

NON-NEGOTIABLE EVIDENCE RULES

1. You may ONLY describe UI elements that are directly supported by:
- the screenshot
- extracted HTML signals
- supplied scores

2. Never invent:
- labels
- badges
- tabs
- buttons
- icons
- banners
- sections
- pricing
- testimonials
- navigation items
- UI states

3. If a claim is based on screenshot only, label it:
- Evidence Source: Screenshot

4. If a claim is based on extracted HTML only, label it:
- Evidence Source: HTML

5. If a claim is reasoned from weak or partial evidence, label it:
- Evidence Source: Inference
- Confidence: Low or Medium

6. Do NOT present inference as fact.

7. Do NOT use the word "Critical" unless the evidence clearly shows a severe conversion blocker.
Preferred priority labels are:
- Requires Attention
- Worth Improving
- Observation

8. This is a PRODUCT TEARDOWN, not a compliance audit.
Use practical, commercially grounded language.

SCORING RULES

You are given computed scores for:
- clarity
- trust
- conversion
- ux
- marketing

You MUST use these scores in the reasoning.

If a score is low:
- explain what likely drives that weakness
- tie it to available evidence

If a score is high:
- explain what appears to be working

Do not ignore the scores.

ANTI-HALLUCINATION RULES

Never say:
- clearly visible
- obvious
- prominent
- strong hierarchy
- weak hierarchy
- cluttered
- distracting
unless that is directly supported by evidence.

Do not mention any UI element that is not present in the screenshot or extracted signals.

If screenshot fidelity is limited, say:
- "Based on the available screenshot..."
- "From the extracted structure..."
- "This appears to..."

OUTPUT GOAL

The output must feel:
- specific
- commercially useful
- evidence-led
- safe from hallucination
- fit for founder review

If evidence is weak, reduce certainty.
Do not fill gaps with invented detail.
`;

const user = `
URL: ${payload.product_url}

SCORES:
${JSON.stringify(payload.scores, null, 2)}

SIGNALS:
${JSON.stringify(payload.signals, null, 2)}

SCREENSHOT:
${payload.screenshot_url ? payload.screenshot_url : "NOT AVAILABLE"}

TASK

Produce an evidence-led product teardown.

You must assess:
- positioning
- clarity
- trust
- conversion readiness
- UX friction
- marketing effectiveness

IMPORTANT EVIDENCE BEHAVIOR

- Do not invent screenshot details
- Do not invent labels or badges
- Do not invent navigation items
- Do not claim exact UI elements unless supported
- Use "appears to" when certainty is not high
- If evidence is partial, reduce confidence

PRIORITY LABELS

Use only:
- Requires Attention
- Worth Improving
- Observation

Do NOT use:
- Critical
unless the evidence clearly proves a severe blocker.

OUTPUT FORMAT

## Executive Summary
- What this page appears to be trying to do
- What most likely weakens performance
- What seems strongest
- What should be fixed first

## Priority Findings
For each finding include:
- Priority Level:
- Evidence Source: Screenshot / HTML / Inference
- Confidence: High / Medium / Low
- Issue:
- Evidence:
- Why it matters:
- Fix:

## Conversion Breakdown
Explain:
- what a first-time user likely sees first
- what they likely understand quickly
- where hesitation likely begins
- what action the page seems to want

Tie this to scores where relevant.

## UI Improvements
Provide EXACTLY 6 markers.

Rules:
- each marker must refer to a different page area
- each marker must be grounded in screenshot or HTML evidence
- do not invent labels
- do not invent badges
- do not claim certainty where there is none

Format:

- Marker: 1
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

- Marker: 2
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

- Marker: 3
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

- Marker: 4
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

- Marker: 5
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

- Marker: 6
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

## Copy Improvements
Rewrite:
- headline
- primary CTA
- 2 to 3 supporting value statements

Only do this if enough evidence exists.
If not, say the copy rewrite is constrained by limited evidence.

## SEO / Structure Wins
Only include improvements supported by signals.

## 7-Day Sprint Plan
Give a practical day-by-day plan.

## Strategic Insight
State the underlying positioning or conversion problem.

FINAL RULE
If you are not sure, lower confidence.
Do not hallucinate.
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