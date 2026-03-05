import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

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
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    const auditRequestId = meta.auditRequestId;

    if (auditRequestId) {
      const { error } = await supabaseAdmin
        .from("audit_requests")
        .update({
          payment_status: "paid",
          status: "paid_pending_audit",
          completed_at: new Date().toISOString(),
        })
        .eq("id", auditRequestId);

      if (error) console.error("Supabase update error:", error);
    } else {
      console.warn("Missing auditRequestId in Stripe metadata");
    }
  }

  return NextResponse.json({ received: true });
}