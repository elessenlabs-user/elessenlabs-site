export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { sendAuditEmail } from "../../../../../lib/email/sendAuditEmail";
import { sendInviteAuditDelivery } from "../../../../../lib/email/sendEmail";
import { generateAuditPdfBuffer } from "../../../../../lib/audit/generatePdf";

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

  if (!action || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("audit_requests")
    .select("id, status, pages, audit_content, edited_audit_content, full_name, email, product_url, stripe_session_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message || "Failed to load audit." },
      { status: 500 }
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "Audit not found." },
      { status: 404 }
    );
  }

  if (action === "approve") {
    const finalAuditContent =
      typeof existing.edited_audit_content === "string" &&
      existing.edited_audit_content.trim().length > 0
        ? existing.edited_audit_content
        : typeof existing.audit_content === "string"
        ? existing.audit_content
        : buildMarkdownFromPages(Array.isArray(existing.pages) ? existing.pages : []);

    const pdfBuffer = await generateAuditPdfBuffer({
  auditId: id,
  fullName: existing.full_name || null,
  productUrl: existing.product_url || null,
  auditContent: finalAuditContent,
  pages: Array.isArray(existing.pages) ? existing.pages : [],
});

const filePath = `audits/${id}.pdf`;

const { error: uploadError } = await supabaseAdmin.storage
  .from("audit-pdfs")
  .upload(filePath, new Uint8Array(pdfBuffer), {
    contentType: "application/pdf",
    upsert: true,
  });

if (uploadError) {
  return NextResponse.json(
    { error: uploadError.message || "Failed to upload PDF." },
    { status: 500 }
  );
}

const { data: publicUrlData } = supabaseAdmin.storage
  .from("audit-pdfs")
  .getPublicUrl(filePath);

const auditPdfUrl = publicUrlData?.publicUrl || null;

if (!auditPdfUrl) {
  return NextResponse.json(
    { error: "Failed to generate PDF URL." },
    { status: 500 }
  );
}

const { error: updateError } = await supabaseAdmin
  .from("audit_requests")
  .update({
    audit_content: finalAuditContent,
    audit_pdf_url: auditPdfUrl,
    status: "delivered",
    delivered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq("id", id);

if (updateError) {
  return NextResponse.json(
    { error: updateError.message || "Failed to approve audit." },
    { status: 500 }
  );
}

   const { data: auditRow, error: auditRowError } = await supabaseAdmin
    .from("audit_requests")
    .select("id, full_name, email, stripe_session_id, audit_pdf_url")
    .eq("id", id)
    .maybeSingle();

if (auditRowError) {
  console.error("FAILED TO LOAD AUDIT FOR EMAIL:", auditRowError);
}

if (auditRow?.email) {
  try {
    if (auditRow.stripe_session_id) {
      await sendAuditEmail({
        email: auditRow.email,
        name: auditRow.full_name || "there",
        auditId: auditRow.id,
        auditPdfUrl: auditRow.audit_pdf_url || null,
      });

      console.log("PAID DELIVERY EMAIL SENT:", auditRow.id);
    } else {
      await sendInviteAuditDelivery({
        email: auditRow.email,
        name: auditRow.full_name || "there",
        auditId: auditRow.id,
        auditPdfUrl: auditRow.audit_pdf_url || null,
      });

      console.log("INVITE DELIVERY EMAIL SENT:", auditRow.id);
    }
  } catch (err) {
    console.error("DELIVERY EMAIL FAILED:", err);
  }
}

    return NextResponse.json({
      ok: true,
      id,
      status: "delivered",
    });
  }

    const { error } = await supabaseAdmin
    .from("audit_requests")
    .update({
      status: "paid_pending_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to return audit to review queue." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    id,
    status: "paid_pending_review",
  });
}