import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const { fullName, email, productUrl, notes } = await req.json();

    if (!fullName || !email || !productUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1) Create audit request immediately (pending payment)
    const { data: created, error: createErr } = await supabaseAdmin
      .from("audit_requests")
      .insert({
        full_name: fullName,
        email,
        product_url: productUrl,
        notes: notes || "",
        status: "pending_payment",
        payment_status: "unpaid",
      })
      .select("id")
      .single();

    if (createErr || !created?.id) {
      console.error("audit_requests insert failed:", createErr);
      return NextResponse.json({ error: "Failed to create audit request." }, { status: 500 });
    }

    const auditRequestId = created.id as string;

    // 2) Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_AUDIT_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit?canceled=1`,
      metadata: {
        auditRequestId,
        intent: "audit",
      },
    });

    // 3) Update row with stripe session id
    await supabaseAdmin
      .from("audit_requests")
      .update({
        stripe_session_id: session.id,
      })
      .eq("id", auditRequestId);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "Checkout failed." }, { status: 500 });
  }
}