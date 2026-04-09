import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, email } = body;

    if (!code || !email) {
      return NextResponse.json(
        { error: "Missing code or email" },
        { status: 400 }
      );
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const { data: invite, error: inviteError } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (invite.used_count >= invite.max_uses) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // ✅ special test code: reusable up to max_uses regardless of same email
    if (normalizedCode === "ELSN-TEST") {
      return NextResponse.json({ success: true });
    }

    // Standard codes: one use per email
    const { data: existing } = await supabase
      .from("invite_redemptions")
      .select("id")
      .eq("code", normalizedCode)
      .eq("email", email)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Code already used for this email" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}