import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import {
  sendAdminNotification,
  sendAuditPaymentConfirmation,
} from "../../../../lib/email/sendEmail";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  console.log("WEBHOOK HIT");
  console.log("WEBHOOK SIGNATURE EXISTS:", !!sig);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("WEBHOOK EVENT TYPE:", event.type);

  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  const auditRequestId = session.metadata?.auditRequestId || "";
  const email = session.customer_details?.email || "";

  if (!auditRequestId) {
    console.error("Missing auditRequestId in session metadata:", session.id);
    return NextResponse.json(
      { error: "Missing auditRequestId in metadata." },
      { status: 400 }
    );
  }

  const { error: updateErr } = await supabaseAdmin
    .from("audit_requests")
    .update({
      stripe_session_id: session.id,
      email,
      status: "paid_in_review",
    })
    .eq("id", auditRequestId);

  if (updateErr) {
    console.error("Supabase update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to update audit request." },
      { status: 500 }
    );
  }
    console.log("WEBHOOK DB UPDATED:", {
      auditRequestId,
      status: "paid_in_review",
      email,
    });

  const { data: auditRow } = await supabaseAdmin
    .from("audit_requests")
    .select("id, full_name, email, product_url")
    .eq("id", auditRequestId)
    .maybeSingle();

  if (auditRow) {
    await sendAdminNotification({
      name: auditRow.full_name || "Unknown",
      productUrl: auditRow.product_url || "",
    });

    if (auditRow.email) {
      await sendAuditPaymentConfirmation({
        email: auditRow.email,
        name: auditRow.full_name || "there",
        productUrl: auditRow.product_url || "",
        auditId: auditRow.id,
      });
    }
  }

  const secret = process.env.AUDIT_ENGINE_SECRET;

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/audit/generate?id=${auditRequestId}`,
      {
        method: "POST",
        headers: {
          "x-audit-secret": secret || "",
        },
      }
    );
  } catch (e) {
    console.error("PAID GENERATE ERROR:", e);
  }

  console.log("Audit request marked paid:", {
    auditRequestId,
    stripeSessionId: session.id,
    email,
  });
}

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook processing failed." },
      { status: 500 }
    );
  }
}