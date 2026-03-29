import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { runAuditPipeline } from "../../../../lib/audit/pipeline";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, message: "audit generator alive" });
}

function requireSecret(req: Request) {
  const expected = process.env.AUDIT_ENGINE_SECRET;
  if (!expected) {
    return { ok: false, msg: "Missing AUDIT_ENGINE_SECRET env var." };
  }

  const got = req.headers.get("x-audit-secret") || "";
  if (got !== expected) {
    return { ok: false, msg: "Unauthorized." };
  }

  return { ok: true, msg: "" };
}

function clip(s: string, max = 4000) {
  const t = (s || "").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function getNextStatus(currentStatus: string | null | undefined) {
  if (
    currentStatus === "paid_pending_review" ||
    currentStatus === "in_review"
  ) {
    return "paid_pending_review";
  }

  return "preview_ready";
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
    const cleanId = String(id).trim();

    const { data, error } = await supabaseAdmin
      .from("audit_requests")
      .select("*")
      .eq("id", cleanId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Audit request not found." },
        { status: 404 }
      );
    }

    if (data.status === "generating") {
      return NextResponse.json({
        ok: true,
        id: data.id,
        status: data.status,
        message: "Audit is already generating.",
      });
    }

    if (data.status === "ready_for_review") {
      return NextResponse.json({
        ok: true,
        id: data.id,
        status: data.status,
        message: "Audit is already ready for review.",
      });
    }

    if (data.status === "delivered") {
      return NextResponse.json({
        ok: true,
        id: data.id,
        status: data.status,
        message: "Audit is already delivered.",
      });
    }

    row = data;
  } else {
        const { data, error } = await supabaseAdmin
      .from("audit_requests")
      .select("*")
      .eq("status", "paid_pending_review")
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

  const lockQuery = supabaseAdmin
    .from("audit_requests")
    .update({
      status: "generating",
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

    if (!id) {
     lockQuery.eq("status", "paid_pending_review");
  }

  const { data: lockedRows, error: lockErr } = await lockQuery.select("id");

  if (lockErr) {
    return NextResponse.json(
      { error: "Failed to lock audit request." },
      { status: 500 }
    );
  }

  if (!lockedRows || lockedRows.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "Audit request was already claimed by another run.",
    });
  }

  try {
    const { processedPages } = await runAuditPipeline(row);

    if (!processedPages?.length) {
      throw new Error("Pipeline returned no processed pages.");
    }

    const firstPage = processedPages[0];
    const nextStatus = getNextStatus(row.status);

    const auditContent = clip(
      processedPages
        .flatMap((page: any) => page.sections || [])
        .map((section: any) => `## ${section.title}\n${section.content}`)
        .join("\n\n"),
      250000
    );

    const { error: saveErr } = await supabaseAdmin
      .from("audit_requests")
      .update({
        pages: processedPages,
        screenshot_url: firstPage?.screenshot_url || null,
        marked_screenshot_url: firstPage?.marked_screenshot_url || null,
        audit_content: auditContent,
        status: nextStatus,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (saveErr) {
      throw new Error(`Failed to save processed pages: ${saveErr.message}`);
    }

    return NextResponse.json({
      ok: true,
      id: row.id,
      status: nextStatus,
      pageCount: processedPages.length,
    });
  } catch (e: any) {
    console.error("AUDIT_GENERATE_ERROR", e);

    await supabaseAdmin
      .from("audit_requests")
      .update({
        status: "failed",
        audit_content: clip(
          `Audit generation failed: ${e?.message || String(e)}`,
          8000
        ),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    return NextResponse.json(
      {
        error: "Audit generation failed.",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}