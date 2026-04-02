import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function withHttps(url: string) {
  const s = (url || "").trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export async function POST(req: Request) {
  try {
    const { auditRequestId } = await req.json();

    if (!auditRequestId) {
      return NextResponse.json(
        { error: "Missing auditRequestId." },
        { status: 400 }
      );
    }

    const { data: auditRow, error: auditErr } = await supabaseAdmin
      .from("audit_requests")
      .select("id, email")
      .eq("id", auditRequestId)
      .maybeSingle();

    if (auditErr || !auditRow) {
      return NextResponse.json(
        { error: "Audit request not found." },
        { status: 404 }
      );
    }

    const originFromReq =
      req.headers.get("origin") ||
      (req.headers.get("host") ? `https://${req.headers.get("host")}` : "");

    const siteUrl = withHttps(process.env.NEXT_PUBLIC_SITE_URL || originFromReq);

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Server misconfigured: NEXT_PUBLIC_SITE_URL is missing." },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_AUDIT_PRICE_ID) {
      return NextResponse.json(
        { error: "Server misconfigured: STRIPE_AUDIT_PRICE_ID is missing." },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: auditRow.email || undefined,
      line_items: [
        {
          price: process.env.STRIPE_AUDIT_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/audit/success?audit_id=${auditRequestId}`,
      cancel_url: `${siteUrl}/audit/result/${auditRequestId}?canceled=1`,
      metadata: {
        auditRequestId,
        intent: "full_audit_unlock",
      },
    });

    await supabaseAdmin
      .from("audit_requests")
      .update({ stripe_session_id: session.id })
      .eq("id", auditRequestId);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("checkout/full-audit error:", err);
    return NextResponse.json(
      { error: err?.message || "Checkout failed." },
      { status: 500 }
    );
  }
}