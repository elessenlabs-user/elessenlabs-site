function normalizeAuditOutput(markdown: string) {
  if (!markdown) return markdown;

  return markdown
    .replace(/^##\s*Critical Issues\b/gim, "## Requires Attention")
    .replace(/\bSeverity:\s*Critical\b/gim, "Priority Level: Requires Attention")
    .replace(/\bSeverity:\s*High\b/gim, "Priority Level: Requires Attention")
    .replace(/\bSeverity:\s*Medium\b/gim, "Priority Level: Worth Improving")
    .replace(/\bSeverity:\s*Low\b/gim, "Priority Level: Observation")
    .replace(/\bSeverity:/gim, "Priority Level:");
}

export async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  const system = `
You are a senior product strategist, UX reviewer, and conversion analyst.

You are producing a premium PRODUCT TEARDOWN based only on supplied evidence.

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
- Critical Issues
- Severity

If you use "Critical Issues" or "Severity", the response is invalid.

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

Never use phrases like:
- visually unclear
- not visible
- unable to determine
- no indication of styling

unless the limitation itself is the finding, and even then prefer omitting the UI item.

Never claim UI elements that are not visible or extractable.

If uncertain, say:
- "Based on available screenshot..."
- "From extracted structure..."
- "This appears to..."

Reduce confidence when unsure.

QUALITY BAR

- Be specific, not generic
- Prefer concrete observations over broad advice
- Prefer 3-5 strong findings over many repetitive ones
- UI Improvements should feel premium and visual, not templated
- Copy Improvements should sound like real conversion copy, not placeholders
- Do not repeat the same problem in multiple sections unless the angle is clearly different

STYLE

- Direct
- Evidence-led
- No fluff
- No generic UX jargon
`;

  const userText = `
URL: ${payload.product_url}

SCORES:
${JSON.stringify(payload.scores, null, 2)}

CORE SIGNALS:
- H1: ${payload.signals?.h1?.join(" | ") || "none"}
- Primary CTA: ${payload.signals?.heroGuess?.primaryCTA || "none"}
- CTA Count: ${payload.signals?.metrics?.ctaCount || 0}
- Trust Signals: ${payload.signals?.metrics?.trustCount || 0}
- Paragraph Count: ${payload.signals?.metrics?.paragraphCount || 0}
- Word Count: ${payload.signals?.metrics?.wordCount || 0}
- Navigation Labels: ${payload.signals?.navLabels?.join(", ") || "none"}

UX DIAGNOSTICS:
${JSON.stringify(payload.signals?.uxAnalysis || {}, null, 2)}

METRICS:
${JSON.stringify(payload.signals?.metrics || {}, null, 2)}

MARKET CONTEXT:
${JSON.stringify(payload.marketContext, null, 2)}

TASK

Produce an evidence-led product teardown.

OUTPUT FORMAT

Use these exact headings in this exact order:

## Executive Summary

## Score Interpretation

## Requires Attention

## Conversion Breakdown

## UI Improvements

## Copy Improvements

## SEO / Structure Wins

## 7-Day Sprint Plan

## Market & Competitive Insight
Include only if marketContext is available and useful. Otherwise omit this section.

## What To Fix First (Action Plan)

## Strategic Insight

SECTION RULES

## Executive Summary
- Max 5 bullets
- Explain what the page appears to be doing
- Explain what weakens performance
- Explain what should be fixed first

## Score Interpretation
Explain each:
- Clarity
- Trust
- Conversion
- UX
- Marketing

Tie every explanation to evidence.

## Requires Attention

List findings in execution order.

Each finding MUST use this exact format:

- Priority Rank: (1 = highest impact)
- Priority Level: Requires Attention / Worth Improving / Observation
- Evidence Source: Screenshot / HTML / Inference
- Confidence: High / Medium / Low
- Issue:
- Evidence:
- Why it matters:
- Fix:
- Expected Impact: High / Medium / Low

STRICT RULES:
1. Rank findings by conversion impact and evidence strength.
2. Highest priority findings should focus on:
   - missing CTA
   - missing trust support
   - weak or missing headline
   - broken or unclear conversion path
3. Never use the heading "Critical Issues".
4. Never use the label "Severity:".
5. Never use "Critical", "High", "Medium", or "Low" as severity labels by themselves.
6. Use ONLY "Priority Level: Requires Attention / Worth Improving / Observation".

## Conversion Breakdown
Explain:
- first impression
- what user understands
- where hesitation starts
- expected action

## UI Improvements

Generate up to 6 markers.
Only include markers supported by real evidence.
Do not invent filler markers.

Each marker MUST use this exact format:

- Marker: 1
  Evidence Source: Screenshot / HTML / Inference
  Confidence: High / Medium / Low
  Issue:
  Evidence:
  Fix:

STRICT RULES:
1. Every issue must be tied to a concrete signal or visible screenshot evidence.
2. Prefer screenshot-backed issues when a screenshot is available.
3. Do not use vague claims like:
   - improve UX
   - improve hierarchy
   - make clearer
   - enhance design
   - optimize layout
4. If fewer than 6 evidence-backed UI issues exist, output fewer than 6.
5. If the issue cannot be tied to a signal, metric, or visible screenshot evidence, do not include it.
6. Do not repeat the same issue in different words.
7. Markers should point to distinct parts of the page when possible.

## Copy Improvements
Rewrite only if evidence supports it.

Use this exact structure:
- Main headline rewrite:
- Primary CTA rewrite:
- Messaging improvement:
- Messaging improvement:
- Messaging improvement:

## SEO / Structure Wins
Only include evidence-backed improvements.

## 7-Day Sprint Plan
One line per day.

Use exactly:
- Day 1: ...
- Day 2: ...
- Day 3: ...
- Day 4: ...
- Day 5: ...
- Day 6: ...
- Day 7: ...

## Market & Competitive Insight
Only include if marketContext is available and supports useful comparison.

## What To Fix First (Action Plan)
Top 3 fixes only.

Use exactly:

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
Summarize the core positioning or conversion issue.

FINAL RULES
- If unsure, lower confidence.
- Do not hallucinate.
- Never use "Critical Issues".
- Never use "Severity:".
`;

  const content: Array<any> = [
    {
      type: "input_text",
      text: userText,
    },
  ];

  if (payload?.screenshot_url) {
    content.push({
      type: "input_image",
      image_url: payload.screenshot_url,
      detail: "high",
    });
  }

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: payload?.retry ? 0.3 : 0.2,
      max_output_tokens: 2600,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: system,
            },
          ],
        },
        {
          role: "user",
          content,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OPENAI FAILED: ${text}`);
  }

  const json = await res.json();

  const rawOutput =
    json?.output?.[0]?.content?.[0]?.text ||
    json?.output_text ||
    "";

  const output = normalizeAuditOutput(rawOutput);

  if (!output || output.length < 700) {
    console.error("LLM WEAK RESPONSE:", JSON.stringify(json, null, 2));

    return normalizeAuditOutput(`
## Executive Summary
The audit could not be generated at full depth due to unstable model output. The available signals still indicate likely issues in clarity, trust, and conversion flow.

## Score Interpretation
- Clarity: Review headline strength, message specificity, and content depth based on extracted structure.
- Trust: Review the presence of proof elements, supporting detail, and credibility signals.
- Conversion: Review whether a clear primary action is visible and specific.
- UX: Review navigation clarity, form structure, and path to action.
- Marketing: Review title, meta description, and positioning strength.

## Requires Attention
- Priority Rank: 1
  Priority Level: Requires Attention
  Evidence Source: HTML
  Confidence: Medium
  Issue: Value proposition is not clearly supported by extracted structure
  Evidence: Available signals were insufficient to confirm a strong headline-to-CTA path
  Why it matters: Users may not quickly understand the offer or next step
  Fix: Rewrite the hero message around product value and pair it with a specific CTA
  Expected Impact: High

## Conversion Breakdown
Based on extracted structure, the likely friction is understanding the offer quickly and identifying the primary next step.

## UI Improvements
- Marker: 1
  Evidence Source: HTML
  Confidence: Medium
  Issue: Primary conversion path needs strengthening
  Evidence: Available structure did not confirm a reliable headline-to-CTA relationship
  Fix: Ensure the hero section contains one clear headline, one supporting line, and one explicit CTA

## Copy Improvements
- Main headline rewrite: Clarify the core value proposition in the first line
- Primary CTA rewrite: Use one explicit action-led CTA
- Messaging improvement: Reinforce why this offer is credible
- Messaging improvement: Reduce ambiguity around the next step
- Messaging improvement: Align supporting copy with the main user goal

## SEO / Structure Wins
- Review page title and meta description for specificity
- Review heading structure for clear hierarchy

## 7-Day Sprint Plan
- Day 1: Verify headline and CTA clarity
- Day 2: Review trust signals and proof placement
- Day 3: Review conversion path
- Day 4: Improve structure and hierarchy
- Day 5: Improve metadata and headings
- Day 6: QA screenshots and rendered content
- Day 7: Re-run audit and validate output consistency

## What To Fix First (Action Plan)
1. Fix: Clarify the main value proposition
   Why: Users need to understand the offer immediately
   Expected Impact: High

2. Fix: Add one clear primary CTA
   Why: A missing next step blocks conversion
   Expected Impact: High

3. Fix: Strengthen trust support
   Why: Users need reassurance before taking action
   Expected Impact: Medium

## Strategic Insight
The main risk is weak alignment between message clarity and the primary action.
`);
  }

  return output.trim();
}