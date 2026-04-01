import { NextResponse } from "next/server";
//import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabase-admin";


export const runtime = "nodejs";

//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function withHttps(url: string) {
  const s = (url || "").trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export async function POST(req: Request) {
  try {
    const { fullName, email, productUrl, focusPageUrl, extraPageUrls, notes } = await req.json();


    if (!fullName || !email || !productUrl) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const normalizedProductUrl = withHttps(String(productUrl).replace(/\s+/g, ""));

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

    //if (!process.env.STRIPE_AUDIT_PRICE_ID) {
    //  return NextResponse.json(
      //  { error: "Server misconfigured: STRIPE_AUDIT_PRICE_ID is missing." },
      //  { status: 500 }
     // );
   // }

    const { data: created, error: createErr } = await supabaseAdmin
      .from("audit_requests")
            .insert({
        full_name: fullName,
        email,
        product_url: normalizedProductUrl,
        focus_page_url: focusPageUrl
          ? withHttps(String(focusPageUrl).replace(/\s+/g, ""))
          : null,
        pages: [
          { url: normalizedProductUrl },
          ...(focusPageUrl
            ? [{ url: withHttps(String(focusPageUrl).replace(/\s+/g, "")) }]
            : []),
          ...((extraPageUrls || [])
            .map((url: string) => withHttps(String(url).replace(/\s+/g, "")))
            .filter(Boolean)
            .map((url: string) => ({ url }))),
        ],
        notes: notes || "",
        status: "preview_ready",
      })
      .select("id")
      .single();

    if (createErr || !created?.id) {
      console.error("audit_requests insert failed:", createErr);
      return NextResponse.json(
        { error: "Failed to create audit request." },
        { status: 500 }
      );
    }

    const auditRequestId = created.id as string;

    const secret = process.env.AUDIT_ENGINE_SECRET;

  //  const isLocal =
      //  process.env.NODE_ENV === "development" &&
      //  req.headers.get("host")?.includes("localhost");

    // if (isLocal) {
  // const secret = process.env.AUDIT_ENGINE_SECRET;

  // try {
    // await fetch(
     // `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/audit/generate?id=${auditRequestId}`,
     // {
      //  method: "POST",
      //  headers: {
       //   "x-audit-secret": secret || "",
      //  },
     // }
   // );
  // } catch (e) {
  //  console.error("LOCAL GENERATE ERROR:", e);
 // }

  // return NextResponse.json({
  //  url: `/audit/result/${auditRequestId}?test_checkout=1`,
  // });
// }

  // const session = await stripe.checkout.sessions.create({
    // mode: "payment",
    // customer_email: email,
    // line_items: [{ price: process.env.STRIPE_AUDIT_PRICE_ID, quantity: 1 }],
    //  success_url: `${siteUrl}/audit/success?session_id={CHECKOUT_SESSION_ID}`,
    //  cancel_url: `${siteUrl}/audit?canceled=1`,
    //  metadata: {
    //  auditRequestId,
    //    intent: "audit",
    //  },
    // });

   // await supabaseAdmin
   //   .from("audit_requests")
   //   .update({ stripe_session_id: session.id })
   //   .eq("id", auditRequestId);

    // return NextResponse.json({ url: session.url });

   try {
      await fetch(`${siteUrl}/api/audit/generate?id=${auditRequestId}`, {
        method: "POST",
        headers: {
          "x-audit-secret": secret || "",
        },
      });
    } catch (e) {
      console.error("PREVIEW GENERATE ERROR:", e);
    }

    return NextResponse.json({ id: auditRequestId })

   


  } catch (err: any) {
    console.error("checkout/audit error:", err);
    return NextResponse.json(
      { error: err?.message || "Checkout failed." },
      { status: 500 }
    );
  }
}