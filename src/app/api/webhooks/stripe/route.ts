import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase-admin";

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
        console.error("Missing auditRequestId in Stripe session metadata:", session.id);
        return NextResponse.json(
          { error: "Missing auditRequestId in metadata." },
          { status: 400 }
        );
      }

      // Update the row that was already created during checkout session creation
      const { error: updateErr } = await supabaseAdmin
        .from("audit_requests")
        .update({
          stripe_session_id: session.id,
          email,
          payment_status: paymentStatus,
          status: "paid_pending_audit",
        })
        .eq("id", auditRequestId);

      if (updateErr) {
        console.error("Supabase update error:", updateErr);
        return NextResponse.json(
          { error: "Failed to update audit request." },
          { status: 500 }
        );
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