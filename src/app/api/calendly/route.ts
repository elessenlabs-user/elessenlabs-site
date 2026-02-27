import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function safeJson(res: Response) {
  return res.json().catch(() => ({}));
}

export async function POST(req: Request) {
  try {
    // Calendly sends JSON
    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Minimal env guard
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    /**
     * Typical Calendly webhook shape:
     * payload.event = "invitee.created" | "invitee.canceled" | ...
     * payload.payload.invitee.email
     * payload.payload.event (uri)
     * payload.payload.invitee (uri)
     * payload.payload.event.start_time
     */
    const eventType = String(payload?.event ?? "");
    const inviteeEmail = String(payload?.payload?.invitee?.email ?? "").trim().toLowerCase();
    const eventUri = String(payload?.payload?.event ?? "");
    const inviteeUri = String(payload?.payload?.invitee?.uri ?? "");
    const startTime = payload?.payload?.event?.start_time ?? null;

    if (!eventType) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    // We only update if we can identify the lead
    if (!inviteeEmail) {
      return NextResponse.json({ ok: true, note: "No invitee email; ignored" }, { status: 200 });
    }

    // Find the most recent lead with same email (prefer ones that clicked book)
    const { data: leadRow, error: findErr } = await supabase
      .from("leads")
      .select("id, intent, booked_at, created_at")
      .eq("email", inviteeEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: 500 });
    }

    if (!leadRow?.id) {
      return NextResponse.json({ ok: true, note: "No matching lead found" }, { status: 200 });
    }

    // Map Calendly event → our status
    let booking_status: string | null = null;

    if (eventType === "invitee.created") booking_status = "scheduled";
    else if (eventType === "invitee.canceled") booking_status = "canceled";
    else if (eventType === "invitee.rescheduled") booking_status = "rescheduled";
    else {
      // ignore other event types safely
      return NextResponse.json({ ok: true, note: "Event ignored", eventType }, { status: 200 });
    }

    const update: any = {
      booking_status,
      calendly_event_uri: eventUri || null,
      calendly_invitee_uri: inviteeUri || null,
    };

    // Set booked_at only when scheduled; clear it if canceled (optional)
    if (booking_status === "scheduled") {
      update.booked_at = new Date().toISOString();
      update.calendly_event_start = startTime ? new Date(startTime).toISOString() : null;
    } else if (booking_status === "canceled") {
      // optional: keep booked_at for historical, or clear it
      // update.booked_at = null;
    }

    const { error: updErr } = await supabase
      .from("leads")
      .update(update)
      .eq("id", leadRow.id);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}