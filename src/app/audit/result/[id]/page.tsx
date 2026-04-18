import { createClient } from "@supabase/supabase-js";
import PrintActions from "./PrintActions";
import AuditSectionsClient from "./AuditSectionsClient";

export const dynamic = "force-dynamic";


type PageGroup = {
  id: string;
  title: string;
  url: string;
  screenshot_url: string | null;
  marked_screenshot_url: string | null;
  sections: any[];
  evidence: any[];
  processing_failed: boolean;
  failure_reason: string | null;
  failure_detail: string | null;
  scores?: {
  clarity: number;
  trust: number;
  conversion: number;
  ux: number;
  marketing: number;
} | null;
};

function splitSections(markdown: string | null | undefined) {
  if (!markdown || !markdown.trim()) {
    return [];
  }

  return markdown
    .split(/(?=## )/g)
    .map((section) => {
      const match = section.match(/^##\s+(.*)/);
      return {
        title: match ? match[1].trim() : "Section",
        content: section.replace(/^##\s+.*\n?/, "").trim(),
      };
    })
    .filter((s) => s.content);
}

export default async function AuditResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ unlock?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const searchUnlock = resolvedSearchParams?.unlock === "999";

  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

  const { data, error } = await supabase
    .from("audit_requests")
    .select(
  "id, full_name, product_url, focus_page_url, pages, status, audit_content, edited_audit_content, screenshot_url, marked_screenshot_url, ui_evidence, completed_at"
)
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="mx-auto max-w-5xl px-10 py-24">
        <div className="rounded-3xl border border-black/10 bg-white p-14 shadow-sm">
          <h1 className="text-2xl font-semibold">Audit not found</h1>
          <p className="mt-3 text-black/60">
            No audit content exists yet for this ID.
          </p>
          <p className="mt-2 break-all text-sm text-black/40">ID: {id}</p>
        </div>
      </main>
    );
  }

  const finalAuditContent =
  
  data.edited_audit_content || data.audit_content;

    if (!finalAuditContent) {
    return (
      <main className="mx-auto max-w-5xl px-10 py-24">
        <div className="rounded-3xl border border-black/10 bg-white p-14 shadow-sm">
          <h1 className="text-2xl font-semibold">Audit not ready yet</h1>
          <p className="mt-3 text-black/60">
            This audit exists, but no report content is available yet.
          </p>
          <p className="mt-2 text-sm text-black/45">
            Status: {data.status || "pending"}
          </p>
          <p className="mt-2 break-all text-sm text-black/40">ID: {id}</p>
        </div>
      </main>
    );
  }
    const pageGroups: PageGroup[] =
  Array.isArray(data.pages) && data.pages.length > 0
    ? data.pages.map((page: any, pageIndex: number) => {
        const hasValidSections =
          Array.isArray(page.sections) &&
          page.sections.length > 1 &&
          !page.sections.every(
            (s: any) =>
              typeof s?.title === "string" &&
              s.title.toLowerCase().includes("audit build info")
          );

        return {
          id: `page-${pageIndex + 1}`,
          title:
            pageIndex === 0
              ? "Main Page"
              : page.url
              ? `Additional Page ${pageIndex}: ${page.url}`
              : `Additional Page ${pageIndex}`,
          url: page.url || "",
          screenshot_url: page.screenshot_url || null,
          marked_screenshot_url: page.marked_screenshot_url || null,
          sections: hasValidSections
            ? page.sections
            : splitSections(finalAuditContent),
          evidence: Array.isArray(page.evidence) ? page.evidence : [],
          scores: page.scores || null,
          processing_failed: !!page.processing_failed,
          failure_reason: page.failure_reason || null,
          failure_detail: page.failure_detail || null,
        };
      })
    : [
        {
          id: "page-1",
          title: "Main Page",
          url: data.product_url || "",
          screenshot_url: data.screenshot_url || null,
          marked_screenshot_url: data.marked_screenshot_url || null,
          sections: splitSections(finalAuditContent),
          evidence: [],
          scores: null,
          processing_failed: false,
          failure_reason: null,
          failure_detail: null,
        },
      ];
const firstPage = pageGroups?.[0];
const scores = firstPage?.scores || null;

const auditScore = scores
  ? (() => {
      const values = [
        scores.clarity,
        scores.trust,
        scores.conversion,
        scores.ux,
        scores.marketing,
      ].filter((v) => typeof v === "number");

      if (!values.length) {
        return { score: 0, label: "Needs review" };
      }

      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      return {
        score: Math.round(avg * 10),
        label:
          avg >= 7
            ? "Strong base"
            : avg >= 5
            ? "Needs improvement"
            : "High priority fixes",
      };
    })()
  : { score: 0, label: "Needs review" };

const isPreviewOnly = data.status === "preview_ready";

const isInReview =
  data.status === "paid_pending_review" ||
  data.status === "paid_in_review" ||
  data.status === "in_review" ||
  data.status === "ready_for_review" ||
  data.status === "review_ready";

const isUnlocked =
  data.status === "delivered" || searchUnlock;

const previewMode = !isUnlocked;
const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.elessenlabs.com"}/audit/result/${id}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 lg:p-10">
        <div className="mb-10 border-b border-black/10 pb-6">

      {/* ✅ LOGO — THIS IS WHAT MAKES IT APPEAR IN PDF */}
      <div className="mb-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Elessen Labs"
          className="h-10 object-contain"
      />
  </div>

    <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
      ELESSEN AUDIT ENGINE™
  </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Audit for {data.full_name || "Client"}
          </h1>

          <div className="mt-4 space-y-2 text-sm text-black/60">
  <div>
    <strong className="text-black/75">Product:</strong> {data.product_url}
  </div>

  {data.focus_page_url && (
    <div>
      <strong className="text-black/75">Focus page:</strong> {data.focus_page_url}
    </div>
  )}

  <div>
    <strong className="text-black/75">Status:</strong>{" "}
    {data.status === "preview_ready"
      ? "Preview Ready"
      : data.status === "paid_pending_review"
      ? "Pending Review"
      : data.status === "in_review"
      ? "In Review"
      : data.status === "delivered"
      ? "Delivered"
      : data.status}
  </div>

  <div className="pt-3 print:pt-4">
    <strong className="text-black/75">Report URL:</strong>{" "}
    <a
      href={reportUrl}
      className="break-all underline underline-offset-4"
    >
      {reportUrl}
    </a>
  </div>

  <div className="text-xs text-black/50">
    This audit link remains available for 30 days from delivery.
  </div>

  {isPreviewOnly && (

  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm leading-6 text-black/75">
    <div className="font-semibold text-black">
      This is your preview report.
    </div>
    <div className="mt-2">
      You are viewing the preview version of your Elessen Audit Engine™ audit.
      Full access is unlocked after payment.
    </div>
  </div>
)}

{isInReview && (
  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm leading-6 text-black/75">
    <div className="font-semibold text-black">
      Your full audit is currently in review.
    </div>
    <div className="mt-2">
      Payment has been received and your audit is now being finalized by Elessen.
      The delivered version will replace this page once review is complete.
    </div>
  </div>
)}

        {data.completed_at && (
          <div>
            <strong className="text-black/75">Generated:</strong> {data.completed_at}
          </div>
      )}
    </div>

          <PrintActions />
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

  {/* EXISTING AUDIT SCORE */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Audit Score</div>
    <div className="mt-2 text-3xl font-semibold">{auditScore.score}</div>
    <div className="mt-1 text-sm text-black/55">{auditScore.label}</div>
  </div>

  {/* ✅ NEW: CLARITY */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Clarity</div>
    <div className="mt-2 text-2xl font-semibold">{typeof scores?.clarity === "number" ? scores.clarity : 0}</div>
  </div>

  {/* ✅ NEW: TRUST */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Trust</div>
    <div className="mt-2 text-2xl font-semibold">{typeof scores?.trust === "number" ? scores.trust : 0}</div>
  </div>

  {/* ✅ NEW: CONVERSION */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Conversion</div>
    <div className="mt-2 text-2xl font-semibold">{typeof scores?.conversion === "number" ? scores.conversion : 0}</div>
  </div>

  {/* ✅ NEW: UX */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">UX</div>
    <div className="mt-2 text-2xl font-semibold">{typeof scores?.ux === "number" ? scores.ux : 0}</div>
  </div>

  {/* ✅ NEW: MARKETING */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Marketing</div>
    <div className="mt-2 text-2xl font-semibold">{typeof scores?.marketing === "number" ? scores.marketing : 0}</div>
  </div>

</div>

       {pageGroups.map((page) => (
  <div key={page.id} className="mb-12 print:mb-16 break-before-page">
    <div className="mb-6 border-b border-black/10 pb-4">
      <div className="text-xs uppercase tracking-[0.18em] text-black/45">
        {page.title}
    </div>

      {page.url && (
        <div className="mt-2 break-all text-sm text-black/65">
          <strong className="text-black/75">Page URL:</strong> {page.url}
      </div>
  )} 
    </div>

    {page.processing_failed ? (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          Page processing failed
        </div>

        <h3 className="mt-3 text-xl font-semibold text-black">
          This page could not be processed automatically
        </h3>

        <div className="mt-4 space-y-2 text-sm leading-7 text-black/70">
          <div>
            <strong className="text-black/80">Reason:</strong>{" "}
            {page.failure_reason || "Unknown processing failure"}
          </div>

          {page.failure_detail ? (
            <div className="break-all">
              <strong className="text-black/80">Detail:</strong>{" "}
              {page.failure_detail}
            </div>
          ) : null}

          <div>
            <strong className="text-black/80">What this means:</strong> This
            page was not fully analyzable during the automated audit run, so no
            reliable UI evidence should be inferred from this result.
          </div>
        </div>
      </div>
    ) : (
      <AuditSectionsClient
        auditRequestId={data.id}
        sections={(page.sections || []).map((section: any, index: number) => ({
          id: `${page.id}-section-${index}`,
          title: section.title,
          content: section.content,
        }))}
        uiEvidence={page.evidence || []}
        uiReferenceScreenshot={
          page.marked_screenshot_url || page.screenshot_url || null
        }
        previewMode={previewMode}
        currentStatus={data.status}
      />
    )}
  </div>
))}

      </div>

      <div className="mt-10 rounded-3xl border border-orange-200 bg-[#FF7A00] p-5 text-black shadow-lg print:hidden sm:p-6 lg:p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
          NEXT STEP
        </div>

        <h2 className="mt-3 text-2xl font-semibold text-black">
          Want Elessen to fix these issues for you?
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/75">
          Turn this audit into an execution plan. We can help refine the UX,
          improve conversion, tighten the messaging, and turn the highest-impact
          recommendations into a practical sprint.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:hello@elessenlabs.com?subject=Need%20Implementation%20Support"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-100"
          >
            Contact us for implementation
          </a>

          <a
            href="/how-we-help"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium !text-white transition hover:opacity-90"
          >
            Explore implementation support
          </a>
        </div>
      </div>
    </main>
  );
}