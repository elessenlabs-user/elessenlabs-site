import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const eventType = String(body.event_type ?? "").trim();
    const eventTime = String(body.start_time ?? "").trim();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Missing required Calendly fields." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server misconfigured." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase.from("leads").insert([
      {
        full_name: fullName,
        email,
        company: null,
        budget_range: "Booked",
        message: `Calendly booking confirmed${eventTime ? ` for ${eventTime}` : ""}`,
        intent: "book",
        page: "calendly",
        utm_source: "calendly",
        utm_medium: eventType || null,
        utm_campaign: null,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}