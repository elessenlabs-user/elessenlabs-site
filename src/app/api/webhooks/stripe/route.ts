import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { sendAdminNotification } from "../../../../lib/email/sendEmail";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
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
      const paymentStatus = session.payment_status || "paid";

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
          status: "paid_pending_review",
      })
        .eq("id", auditRequestId);

      if (updateErr) {
        console.error("Supabase update error:", updateErr);
        return NextResponse.json(
          { error: "Failed to update audit request." },
          { status: 500 }
        );
      }

      const { data: auditRow } = await supabaseAdmin
        .from("audit_requests")
        .select("full_name, product_url")
        .eq("id", auditRequestId)
        .maybeSingle();

      if (auditRow) {
  await sendAdminNotification({
    name: auditRow.full_name || "Unknown",
    productUrl: auditRow.product_url || "",
  });

  // ✅ ADD THIS BLOCK RIGHT HERE
  const auditLink = `${process.env.NEXT_PUBLIC_SITE_URL}/audit/result/${auditRequestId}`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Elessen Labs <hello@elessenlabs.com>",
        to: [email],
        cc: ["hello@elessenlabs.com"],
        subject: "Your Elessen Audit payment is confirmed",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin-bottom: 8px;">Your payment is confirmed</h2>

            <p style="margin: 0 0 14px;">
              Thank you — your Elessen Audit Engine report is now being finalized and reviewed by Elessen.
            </p>

            <p style="margin: 0 0 14px;">
              This review ensures your audit is clear, accurate, and ready for execution.
            </p>

            <p style="margin: 0 0 14px;">
              Delivery can take up to 24 hours, although most audits are completed sooner.
            </p>

            <p style="margin: 0 0 18px;">
              You can return to your audit here:
            </p>

            <p style="margin: 0 0 20px;">
              <a href="${auditLink}" style="display:inline-block;padding:12px 18px;background:#FF7A00;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">
                View your audit
              </a>
            </p>

            <p style="margin: 0; font-size: 13px; color: #555;">
              If you have any questions, just reply to this email.
            </p>
          </div>
        `,
      }),
    });
  } catch (emailErr) {
    console.error("EMAIL ERROR:", emailErr);
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