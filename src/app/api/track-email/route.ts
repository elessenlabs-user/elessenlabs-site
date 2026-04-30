import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PIXEL = Buffer.from(
  "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function sendOpenAlert(payload: {
  emailId: string;
  ip: string;
  userAgent: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.TRACKER_ALERT_EMAIL) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.TRACKER_FROM_EMAIL || "Elessen Tracker <tracker@elessenlabs.com>",
      to: process.env.TRACKER_ALERT_EMAIL,
      subject: `Email opened: ${payload.emailId}`,
      html: `
        <h2>Email opened</h2>
        <p><strong>ID:</strong> ${payload.emailId}</p>
        <p><strong>IP:</strong> ${payload.ip}</p>
        <p><strong>User Agent:</strong> ${payload.userAgent}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
    }),
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailId = searchParams.get("id") || "unknown";
  const ip = getIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";

 await supabase.from("email_tracking_events").insert({
  tracking_id: emailId,
  event_type: "open",
  target_url: null,
  ip_address: ip,
  user_agent: userAgent,
  referrer: req.headers.get("referer") || null,
});

  await sendOpenAlert({ emailId, ip, userAgent }).catch(() => null);

  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
