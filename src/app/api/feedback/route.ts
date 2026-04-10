import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      auditId,
      rating,
      meaningfulImprovements,
      tailoredToProduct,
      unclearOrInaccurate,
      mostValuablePart,
      wouldUseAgain,
      wouldRecommend,
      perceivedValue,
      testimonial,
      referrals,
    } = body;

    if (
      !auditId ||
      !rating ||
      !unclearOrInaccurate ||
      !mostValuablePart ||
      !testimonial
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("audit_feedback")
      .insert({
        audit_id: auditId,
        rating,
        meaningful_improvements: meaningfulImprovements,
        tailored_to_product: tailoredToProduct,
        unclear_or_inaccurate: unclearOrInaccurate,
        most_valuable_part: mostValuablePart,
        would_use_again: wouldUseAgain,
        would_recommend: wouldRecommend,
        perceived_value: perceivedValue,
        testimonial,
        referrals,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("FEEDBACK INSERT ERROR:", error);
      return NextResponse.json(
        { error: "Failed to save feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("FEEDBACK API ERROR:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}