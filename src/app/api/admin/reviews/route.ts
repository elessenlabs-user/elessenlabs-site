import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

function buildMarkdownFromPages(pages: any[]) {
  return (pages || [])
    .flatMap((page) => page.sections || [])
    .map((section) => `## ${section.title}\n${section.content}`)
    .join("\n\n");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const pages = Array.isArray(body.pages) ? body.pages : [];
  const editedAuditContent =
    typeof body.editedAuditContent === "string"
      ? body.editedAuditContent
      : buildMarkdownFromPages(pages);

  const { error } = await supabaseAdmin
    .from("audit_requests")
    .update({
      pages,
      edited_audit_content: editedAuditContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save edits." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const action = body?.action;

  if (action === "approve") {
    const { error } = await supabaseAdmin
      .from("audit_requests")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to approve audit." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("audit_requests")
      .update({
        status: "paid_in_review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to reject audit." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Invalid action." },
    { status: 400 }
  );
}