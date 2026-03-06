import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";

export const runtime = "nodejs";

function requireSecret(req: Request) {
  const expected = process.env.AUDIT_ENGINE_SECRET;
  if (!expected) return { ok: false, msg: "Missing AUDIT_ENGINE_SECRET env var." };

  const got = req.headers.get("x-audit-secret") || "";
  if (got !== expected) return { ok: false, msg: "Unauthorized." };

  return { ok: true, msg: "" };
}

function clip(s: string, max = 120000) {
  const t = (s || "").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

function extractSignals(html: string, url: string) {
  const text = html || "";

  const title =
    (text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim();

  const metaDescription =
    (text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || "").trim();

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
  ).filter((x) => x.length <= 60).slice(0, 20);

  const links = uniq(
    Array.from(text.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)).map((m) => {
      const href = (m[1] || "").trim();
      const label = (m[2] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return `${label} -> ${href}`;
    })
  ).filter((x) => !x.includes("-> #")).slice(0, 30);

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

async function generateAuditMarkdown(payload: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `# Audit (AI not configured)

We received your request for:

- URL: ${payload?.signals?.url}

Next: add OPENAI_API_KEY to generate full audits automatically.`;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const system = `You are Elessen Labs' senior product and UX auditor.
Return a practical, founder-friendly audit that is highly actionable.
No fluff. No generic advice. Use only the evidence visible in the extracted signals.`;

  const user = `AUDIT REQUEST

URL: ${payload.product_url}
Notes: ${payload.notes || "—"}

EXTRACTED SIGNALS
${JSON.stringify(payload.signals, null, 2)}

OUTPUT FORMAT (Markdown):
1. Executive summary (max 5 bullets)
2. Highest-impact issues (prioritized with severity and reason)
3. Conversion + UX fixes (table: Issue | Evidence | Fix | Effort | Expected impact)
4. Copy and CTA rewrite suggestions
5. SEO quick wins
6. 7-day action plan
7. Questions / assumptions to validate`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${errText}`);
  }

  const json = await res.json();
  return (json?.choices?.[0]?.message?.content || "").trim();
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
    const { data, error } = await supabaseAdmin
      .from("audit_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Audit request not found." }, { status: 404 });
    }

    row = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("audit_requests")
      .select("*")
      .eq("status", "paid_pending_audit")
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
    .update({ status: "generating" })
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

    const auditMarkdown = await generateAuditMarkdown({
      product_url: row.product_url,
      notes: row.notes,
      signals,
    });

    const { error: saveErr } = await supabaseAdmin
      .from("audit_requests")
      .update({
        audit_content: clip(auditMarkdown),
        status: "ready_for_review",
      })
      .eq("id", row.id);

    if (saveErr) {
      throw new Error(`Failed to save audit_content: ${saveErr.message}`);
    }

    return NextResponse.json({
      ok: true,
      id: row.id,
      status: "ready_for_review",
      title: signals.title,
      top_h1: signals.h1?.[0] || "",
      top_ctas: signals.ctas?.slice(0, 5) || [],
    });
  } catch (e: any) {
    await supabaseAdmin
      .from("audit_requests")
      .update({
        status: "failed",
        audit_content: clip(`Audit generation failed: ${e?.message || String(e)}`, 8000),
      })
      .eq("id", row.id);

    return NextResponse.json({ error: e?.message || "Audit generation failed." }, { status: 500 });
  }
}