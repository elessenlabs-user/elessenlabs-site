import { createClient } from "@supabase/supabase-js";
import ReviewDashboardClient from "./ReviewDashboardClient";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminReviewsPage() {
  const { data, error } = await supabase
    .from("audit_requests")
    .select(
      "id, full_name, email, product_url, focus_page_url, status, created_at, completed_at, audit_content, edited_audit_content, pages, screenshot_url, marked_screenshot_url"
    )
    .in("status", ["preview_ready", "paid_pending_review", "in_review"])
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-10 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error loading review queue: {error.message}
        </div>
      </main>
    );
  }

  return <ReviewDashboardClient audits={data || []} />;
}