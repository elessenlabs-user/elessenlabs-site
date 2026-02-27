// src/app/api/leads/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const full_name = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const company = String(body.company ?? "").trim();
    const budget_range = String(body.budget_range ?? "").trim();
    const message = String(body.message ?? "").trim();
    const page = String(body.page ?? "").trim();
    const utm_source = String(body.utm_source ?? "").trim();
    const utm_medium = String(body.utm_medium ?? "").trim();
    const utm_campaign = String(body.utm_campaign ?? "").trim();

   const intent = String(body.intent ?? "book").trim(); // default to book if missing

    // accept ALL possible token keys (Cloudflare sends different ones depending on render mode)
const turnstileToken = String(
  body.turnstileToken ??
  body["cf-turnstile-response"] ??
  body.turnstile_token ??
  ""
).trim();

    // Required fields (all required)
    if (!full_name || !email || !company || !budget_range || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

   // Captcha required ONLY for booking intent
if (intent === "book" && !turnstileToken) {
  return NextResponse.json(
    { error: "Please verify you are human." },
    { status: 400 }
  );
}

    // Env guard
    const secret = process.env.TURNSTILE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server misconfigured (missing env vars)." },
        { status: 500 }
      );
    }

/* ---------------- TURNSTILE VERIFY (book only) ---------------- */
if (intent === "book") {
  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: turnstileToken,
      }).toString(),
    }
  );

  const verification: { success?: boolean; ["error-codes"]?: string[] } =
    await verifyRes.json().catch(() => ({}));

  if (!verification?.success) {
    return NextResponse.json(
      {
        error: "Failed human verification",
        codes: verification?.["error-codes"] ?? [],
      },
      { status: 403 }
    );
  }
}
    /* ---------------- SUPABASE INSERT ---------------- */
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase.from("leads").insert([
      {
        full_name,
        email,
        company,
        budget_range,
        message,
        intent: intent || "book",
        page: page || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}