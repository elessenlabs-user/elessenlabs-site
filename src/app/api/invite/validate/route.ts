import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Make sure these exist in your env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST be service role
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, email } = body;

    if (!code || !email) {
      return NextResponse.json({ error: "Missing code or email" }, { status: 400 });
    }

    // Get IP (basic)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 1. Check if code exists
    const { data: invite, error: inviteError } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // 2. Check usage limit
    if (invite.used_count >= invite.max_uses) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // 3. Check if already used by this email OR IP
    const { data: existing } = await supabase
      .from("invite_redemptions")
      .select("*")
      .eq("code", code)
      .or(`email.eq.${email},ip.eq.${ip}`);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Code already used" },
        { status: 400 }
      );
    }

    // 4. Record redemption
    const { error: insertError } = await supabase
      .from("invite_redemptions")
      .insert([
        {
          code,
          email,
          ip,
        },
      ]);

    if (insertError) {
      return NextResponse.json({ error: "Failed to record usage" }, { status: 500 });
    }

    // 5. Increment usage count
    await supabase
      .from("invite_codes")
      .update({ used_count: invite.used_count + 1 })
      .eq("code", code);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}