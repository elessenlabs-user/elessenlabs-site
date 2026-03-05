import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

// ✅ Do NOT pin apiVersion — fixes TS mismatch on Vercel
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
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const meta = session.metadata || {};
    const email = session.customer_details?.email || meta.email || "";
    const productUrl = meta.productUrl || "";
    const fullName = meta.fullName || "";
    const notes = meta.notes || "";

    try {
      await supabaseAdmin.from("audit_requests").insert({
        stripe_session_id: session.id,
        payment_status: "paid",
        full_name: fullName,
        email,
        product_url: productUrl,
        notes,
      });
    } catch (err) {
      console.error("Supabase insert error:", err);
    }
  }

  return NextResponse.json({ received: true });
}