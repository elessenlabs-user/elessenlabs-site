export async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `
You are a senior product strategist, UX reviewer, and conversion analyst.

You are producing a PRODUCT TEARDOWN based only on supplied evidence.

Your job is to identify:
- what the page appears to be trying to do
- what supports conversion
- what weakens conversion
- what should change first
- how the product appears positioned against alternatives when marketContext exists

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

3. Every finding MUST include:
- Evidence Source
- Confidence

4. Evidence Source must be one of:
- Screenshot
- HTML
- Inference

5. Confidence must be one of:
- High
- Medium
- Low

6. If a claim depends on weak evidence:
- mark as Inference
- reduce confidence

7. Do NOT present inference as fact

PRIORITY RULES

Use ONLY:
- Requires Attention
- Worth Improving
- Observation

DO NOT use:
- Critical
- Severe
- Major blocker

SCORING RULES

Use the scores provided:
- clarity
- trust
- conversion
- ux
- marketing

If a score is low:
- explain why based on evidence

If a score is high:
- explain what is working

Do not ignore scores.

ANTI-HALLUCINATION RULES

Never claim UI elements that are not visible or extractable.

If uncertain, say:
- "Based on available screenshot..."
- "From extracted structure..."
- "This appears to..."

Reduce confidence when unsure.

STYLE

- Direct
- Evidence-led
- No fluff
- No generic UX jargon
`;

  const user = `
URL: ${payload.product_url}

SCORES:
${JSON.stringify(payload.scores, null, 2)}

CORE SIGNALS:
- H1: ${payload.signals.h1?.join(" | ") || "none"}
- Primary CTA: ${payload.signals.heroGuess?.primaryCTA || "none"}
- CTA Count: ${payload.signals.metrics?.ctaCount || 0}
- Trust Signals: ${payload.signals.metrics?.trustCount || 0}
- Paragraph Count: ${payload.signals.metrics?.paragraphCount || 0}
- Word Count: ${payload.signals.metrics?.wordCount || 0}
- Navigation Labels: ${payload.signals.navLabels?.join(", ") || "none"}

UX DIAGNOSTICS:
${JSON.stringify(payload.signals.uxAnalysis, null, 2)}

METRICS:
${JSON.stringify(payload.signals.metrics, null, 2)}

MARKET CONTEXT:
${JSON.stringify(payload.marketContext, null, 2)}

SCREENSHOT:
${payload.screenshot_url ? payload.screenshot_url : "NOT AVAILABLE"}

TASK

Produce an evidence-led product teardown.

OUTPUT FORMAT

## Executive Summary
- What this page appears to be trying to do
- What weakens performance
- What seems strongest
- What should be fixed first

## Score Interpretation
Explain each:
- Clarity
- Trust
- Conversion
- UX
- Marketing

Tie explanation to evidence.

## Priority Findings (RANKED — EXECUTION ORDER)

You MUST rank findings in order of execution priority.

Each finding must include:

- Priority Rank: (1 = highest impact)
- Priority Level: Requires Attention / Worth Improving / Observation
- Evidence Source: Screenshot / HTML / Inference
- Confidence: High / Medium / Low
- Issue:
- Evidence:
- Why it matters:
- Fix:
- Expected Impact: (High / Medium / Low)

STRICT RULES:

1. Rank based on:
   - conversion impact
   - severity of friction
   - presence of measurable signals (CTA, trust, content)

2. Highest priority issues MUST be:
   - missing CTA
   - no trust signals
   - weak or missing headline
   - broken conversion path

3. DO NOT:
   - list randomly
   - mix severity without ranking
   - repeat similar issues

4. Each finding must clearly justify its rank.

EXAMPLE:

- Priority Rank: 1
  Priority Level: Requires Attention
  Issue: No primary CTA detected (ctaCount = 0)
  Expected Impact: High

## Conversion Breakdown
Explain:
- first impression
- what user understands
- where hesitation starts
- expected action

## UI Improvements (STRICT — NO GENERIC OUTPUT)

You MUST generate EXACTLY 6 markers.

Each marker must be tied to REAL evidence from:
- screenshot OR
- extracted signals OR
- computed metrics

STRICT RULES:

1. Each marker MUST reference something concrete:
   - CTA count
   - missing CTA
   - weak headline (if no H1 or empty heroGuess)
   - lack of trust signals (if trustCount = 0)
   - low paragraphCount (thin content)
   - too many CTAs (ctaCount > 5)
   - no navigation (navCount = 0)

2. DO NOT say:
- improve UX
- improve hierarchy
- make clearer
- enhance design
- optimize layout

3. Each issue MUST include a measurable or observable problem

BAD:
"Issue: Layout is unclear"

GOOD:
"Issue: No primary CTA detected (ctaCount = 0)"

---

FORMAT (MANDATORY):

- Marker: 1
  Evidence Source:
  Confidence:
  Issue:
  Evidence:
  Fix:

---

Each marker must:
- reference a DIFFERENT problem
- NOT repeat the same issue in different words
- NOT overlap with another marker

---

If signals are weak:
- reduce confidence
- but still tie issue to metrics

---

EXAMPLES OF VALID ISSUES:

- "CTA count is 0 → no conversion path"
- "Trust signals count is 0 → no credibility support"
- "Paragraph count < 3 → insufficient explanation"
- "Multiple CTAs (>5) → decision friction"
- "No navigation labels detected → weak structure"

---

FINAL RULE:
If the issue cannot be tied to a signal or metric → DO NOT INCLUDE IT

## Copy Improvements
Rewrite only if evidence supports it.

## SEO / Structure Wins
Only include evidence-backed improvements.

## 7-Day Sprint Plan
Concrete daily actions.

## Market & Competitive Insight

If marketContext is available:

- Identify how this product likely compares to competitors
- Highlight positioning gaps
- Identify missed differentiation opportunities

If not available:
- Skip this section

## What To Fix First (Action Plan)

Provide a short, decisive execution plan:

- Top 3 fixes only
- Must be tied to highest priority findings
- Must be specific (not generic UX advice)

Format:

1. Fix:
   Why:
   Expected Impact:

2. Fix:
   Why:
   Expected Impact:

3. Fix:
   Why:
   Expected Impact:

## Strategic Insight
Core positioning or conversion issue.

FINAL RULE
If unsure → lower confidence.
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
    temperature: payload?.retry ? 0.35 : 0.25,
    max_output_tokens: 2200,
    input: [
      {
        role: "system",
        content: [{ type: "text", text: system }],
      },
      {
        role: "user",
        content: [{ type: "text", text: user }],
      },
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

if (!output || output.length < 700) {
  console.error("LLM WEAK RESPONSE:", JSON.stringify(json, null, 2));

  return `
## Executive Summary
The audit could not be generated at full depth due to unstable output. Signals suggest issues in clarity, conversion flow, and trust.

## Score Interpretation
- Clarity: Likely weak messaging
- Trust: Likely insufficient proof
- Conversion: Likely unclear action
- UX: Likely structural friction
- Marketing: Likely positioning gaps

## Priority Findings
- Priority Level: Requires Attention
  Evidence Source: HTML
  Confidence: Medium
  Issue: Value proposition not clearly communicated
  Evidence: Weak structure in extracted signals
  Why it matters: Users cannot quickly understand the offer
  Fix: Introduce clear headline and simplify message

## Conversion Breakdown
User likely struggles to understand value and next step clearly.

## UI Improvements
- Marker: 1
  Evidence Source: HTML
  Confidence: Medium
  Issue: Weak headline clarity
  Evidence: Signals lack strong message
  Fix: Rewrite headline

- Marker: 2
  Evidence Source: HTML
  Confidence: Medium
  Issue: CTA unclear
  Evidence: CTA intent not strong
  Fix: Add clear action copy

- Marker: 3
  Evidence Source: Inference
  Confidence: Low
  Issue: Messaging overload
  Evidence: Weak structure stability
  Fix: Simplify sections

- Marker: 4
  Evidence Source: HTML
  Confidence: Medium
  Issue: Weak trust signals
  Evidence: No strong trust indicators
  Fix: Add proof elements

- Marker: 5
  Evidence Source: Inference
  Confidence: Low
  Issue: Flow unclear
  Evidence: Weak conversion mapping
  Fix: Clarify journey

- Marker: 6
  Evidence Source: HTML
  Confidence: Medium
  Issue: Structure unclear
  Evidence: Weak grouping
  Fix: Improve hierarchy

## Copy Improvements
Constrained due to limited evidence.

## SEO / Structure Wins
- Improve meta/title
- Improve headings

## 7-Day Sprint Plan
Day 1–7: Improve clarity, CTA, structure, trust

## Strategic Insight
Core issue is weak alignment between messaging and conversion.
`;
}

return output.trim();
}