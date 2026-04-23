import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendStartFlowRecommendationEmail } from "../../../lib/email/sendEmail";

export const runtime = "nodejs";

const DEFAULT_BOOKING_URL =
  "https://calendly.com/elessenlabs/product_clarity_call";

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
    const intent = String(body.intent ?? "book").trim();

    const recommendation_title = String(body.recommendation_title ?? "").trim();
    const recommendation_subtitle = String(body.recommendation_subtitle ?? "").trim();
    const recommendation_why = Array.isArray(body.recommendation_why)
      ? body.recommendation_why.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const recommendation_next = Array.isArray(body.recommendation_next)
      ? body.recommendation_next.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const booking_url = String(body.booking_url ?? DEFAULT_BOOKING_URL).trim();

    const turnstileToken = String(
      body.turnstileToken ??
        body["cf-turnstile-response"] ??
        body.turnstile_token ??
        ""
    ).trim();

    if (!full_name || !email || !company || !budget_range || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      !recommendation_title ||
      !recommendation_subtitle ||
      recommendation_why.length === 0 ||
      recommendation_next.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing recommendation details" },
        { status: 400 }
      );
    }

    if (intent === "book" && !turnstileToken) {
      return NextResponse.json(
        { error: "Please verify you are human." },
        { status: 400 }
      );
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server misconfigured (missing Supabase env vars)." },
        { status: 500 }
      );
    }

    if (intent === "book") {
      if (!secret) {
        return NextResponse.json(
          { error: "Server misconfigured (missing Turnstile env var)." },
          { status: 500 }
        );
      }

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

    const supabase = createClient(supabaseUrl, serviceKey);

    const insertPayload = {
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
      email_sent: false,
      email_sent_at: null,
    };

    const { data: insertedLead, error: insertError } = await supabase
      .from("leads")
      .insert([insertPayload])
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    let emailSent = false;
    let emailSendError = "";

    try {
      await sendStartFlowRecommendationEmail({
        email,
        name: full_name,
        recommendationTitle: recommendation_title,
        recommendationSubtitle: recommendation_subtitle,
        recommendationWhy: recommendation_why,
        recommendationNext: recommendation_next,
        bookingUrl: booking_url || DEFAULT_BOOKING_URL,
      });

      emailSent = true;
    } catch (err) {
      emailSendError =
        err instanceof Error ? err.message : "Unknown email send error";
      console.error("START FLOW EMAIL SEND FAILED", {
        email,
        leadId: insertedLead?.id,
        error: emailSendError,
      });
    }

    if (insertedLead?.id && emailSent) {
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", insertedLead.id);

      if (updateError) {
        console.error("LEAD EMAIL STATUS UPDATE FAILED", {
          leadId: insertedLead.id,
          error: updateError.message,
        });
      }
    }

    if (!emailSent) {
      return NextResponse.json(
        {
          ok: false,
          error: "Lead saved but recommendation email failed to send.",
          leadId: insertedLead?.id ?? null,
          emailError: emailSendError || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        leadId: insertedLead?.id ?? null,
        emailSent: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("LEADS ROUTE ERROR", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}