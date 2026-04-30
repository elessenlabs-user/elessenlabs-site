import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DESTINATIONS: Record<string, string> = {
  start: "https://www.elessenlabs.com/start",
  audit: "https://elessenlabs.com/audit",
  instagram: "https://instagram.com/elessenlabs",
  linkedin: "https://www.linkedin.com/company/elessenux/",
};

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailId = searchParams.get("id") || "unknown";
  const destinationKey = searchParams.get("to") || "start";
  const redirectTo = DESTINATIONS[destinationKey] || DESTINATIONS.start;

  await supabase.from("email_tracking_events").insert({
  tracking_id: emailId,
  event_type: "click",
  target_url: redirectTo,
  ip_address: getIp(req),
  user_agent: req.headers.get("user-agent") || "unknown",
  referrer: req.headers.get("referer") || null,
});

  return NextResponse.redirect(redirectTo, 302);
}
