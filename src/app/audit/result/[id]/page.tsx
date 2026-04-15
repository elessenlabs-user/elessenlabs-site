import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import PrintActions from "./PrintActions";
import AuditSectionsClient from "./AuditSectionsClient";

export const dynamic = "force-dynamic";

type UiEvidenceItem = {
  marker?: number;
  issue?: string;
  evidence?: string;
  fix?: string;
  screenshot_url?: string | null;
};

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

function parseBulletCards(content: string) {
  const blocks = content
    .split(/\n(?=- )/g)
    .map((item) => item.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const clean = block.replace(/^- /, "").trim();

    const severityMatch = clean.match(
      /Severity:\s*(.*?)(?=\n|Issue:|Evidence:|Why it matters:|Recommended fix:|Fix:|Effort:|Impact:|Expected Impact:|$)/i
    );
    const issueMatch = clean.match(
      /Issue:\s*(.*?)(?=\n|Evidence:|Why it matters:|Recommended fix:|Fix:|Effort:|Impact:|Expected Impact:|$)/i
    );
    const evidenceMatch = clean.match(
      /Evidence:\s*(.*?)(?=\n|Why it matters:|Recommended fix:|Fix:|Effort:|Impact:|Expected Impact:|$)/i
    );
    const whyMatch = clean.match(
      /Why it matters:\s*(.*?)(?=\n|Recommended fix:|Fix:|Effort:|Impact:|Expected Impact:|$)/i
    );
    const recommendedFixMatch = clean.match(
      /Recommended fix:\s*(.*?)(?=\n|Fix:|Effort:|Impact:|Expected Impact:|$)/i
    );
    const fixMatch = clean.match(
      /Fix:\s*(.*?)(?=\n|Effort:|Impact:|Expected Impact:|$)/i
    );
    const effortMatch = clean.match(/Effort:\s*(Low|Medium|High)/i);
    const impactMatch = clean.match(/(?:Impact|Expected Impact):\s*(Low|Medium|High)/i);

    let icon = "•";
    if (/critical|severity/i.test(clean)) icon = "🚨";
    else if (/ui|layout|design|navigation|hierarchy|spacing/i.test(clean)) icon = "🎨";
    else if (/copy|headline|messaging|cta/i.test(clean)) icon = "✍️";
    else if (/conversion|pricing|capture|form|email/i.test(clean)) icon = "📈";
    else if (/seo|meta|search|keyword/i.test(clean)) icon = "🔎";
    else if (/sprint|day/i.test(clean)) icon = "🗓️";

    return {
      icon,
      raw: clean,
      severity: severityMatch?.[1]?.trim() || "",
      issue: issueMatch?.[1]?.trim() || "",
      evidence: evidenceMatch?.[1]?.trim() || "",
      why: whyMatch?.[1]?.trim() || "",
      fix: recommendedFixMatch?.[1]?.trim() || fixMatch?.[1]?.trim() || "",
      effort: effortMatch?.[1]?.trim() || "",
      impact: impactMatch?.[1]?.trim() || "",
    };
  });
}

function badgeColor(value: string) {
  const v = value.toLowerCase();

  if (v === "critical" || v === "high") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (v === "medium") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  if (v === "low") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  return "bg-gray-50 text-gray-700 ring-gray-200";
}

function computeAuditScore(auditContent: string) {
  let score = 78;

  if (/no email capture|no forms|no input/i.test(auditContent)) score -= 10;
  if (/no pricing|unclear pricing/i.test(auditContent)) score -= 10;
  if (/weak cta|vague cta|not prominent/i.test(auditContent)) score -= 8;
  if (/poor navigation|minimal links|no sticky nav/i.test(auditContent)) score -= 6;
  if (/no trust signals|no testimonials|no social proof/i.test(auditContent)) score -= 8;

  if (score < 35) score = 35;
  if (score > 95) score = 95;

  if (score >= 75) return { score, label: "Strong base" };
  if (score >= 60) return { score, label: "Needs improvement" };
  return { score, label: "High priority fixes" };
}
function getSectionNavTone(title: string) {
  const t = title.toLowerCase();

  if (t.includes("executive")) return "border-orange-300 bg-orange-50";
  if (t.includes("critical")) return "border-red-300 bg-red-50";
  if (t.includes("conversion")) return "border-amber-300 bg-amber-50";
  if (t === "ui improvements" || t.includes("ui improvements")) return "border-purple-300 bg-purple-50";
  if (t.includes("copy")) return "border-blue-300 bg-blue-50";
  if (t.includes("seo")) return "border-green-300 bg-green-50";
  if (t.includes("sprint")) return "border-indigo-300 bg-indigo-50";
  if (t.includes("question")) return "border-neutral-400 bg-neutral-100";

  return "border-black/10 bg-white";
}
function Section({
  id,
  title,
  content,
  uiEvidence,
  uiReferenceScreenshot,
}: {
  id: string;
  title: string;
  content: string;
  uiEvidence?: UiEvidenceItem[] | null;
  uiReferenceScreenshot?: string | null;
}) {

  const lowerTitle = title.toLowerCase();
  const isCritical = lowerTitle.includes("critical");
  const isUi = lowerTitle.includes("ui");
  const isUiSection =
    lowerTitle === "ui improvements" || lowerTitle.includes("ui improvements");
  const isCardSection =
    /conversion|critical|ui|copy|seo|sprint|question/i.test(title);

  const cards = parseBulletCards(content);

  return (
            <section
      id={id}
      className={`mb-6 scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm ${
        isCritical ? "border-red-200 ring-1 ring-red-100" : "border-black/10"
      }`}
    >
      <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
        {isCritical && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-200">
            Priority
          </span>
        )}
        <span>{title}</span>
      </div>

      <div>
        {isUiSection && uiEvidence?.length ? (
  <div className="space-y-6">
    {uiReferenceScreenshot && (
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] p-2">
        <img
          src={uiReferenceScreenshot}
          alt="UI improvements reference screenshot"
          className="h-auto w-full rounded-xl"
        />
      </div>
    )}

    <div className="grid gap-4">
      {uiEvidence.map((item, index) => (
        <div
          key={index}
          className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="pt-0.5 text-lg">🎨</div>

            <div className="min-w-0 flex-1 text-sm leading-6 text-black/75">
              <div className="flex flex-wrap gap-2">
                {item.marker ? (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold ring-1 bg-red-50 text-red-700 ring-red-200">
                    Marker: {item.marker}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {item.issue && (
                  <div>
                    <strong>Issue:</strong> {item.issue}
                  </div>
                )}

                {item.evidence && (
                  <div>
                    <strong>Evidence:</strong> {item.evidence}
                  </div>
                )}

                {item.fix && (
                  <div>
                    <strong>Fix:</strong> {item.fix}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
) : isCardSection ? (
          <div className="grid gap-4">
            {cards.map((card, index) => (
              <div
                key={index}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5 text-lg">
                    {card.icon !== "•"
                      ? card.icon
                      : isUi
                      ? "🎨"
                      : isCritical
                      ? "🚨"
                      : "📌"}
                  </div>

                  <div className="min-w-0 flex-1 text-sm leading-6 text-black/75">
                    <div className="flex flex-wrap gap-2">
                      {card.severity && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ${badgeColor(
                            card.severity
                          )}`}
                        >
                          Severity: {card.severity}
                        </span>
                      )}

                      {card.effort && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ${badgeColor(
                            card.effort
                          )}`}
                        >
                          Effort: {card.effort}
                        </span>
                      )}

                      {card.impact && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ${badgeColor(
                            card.impact
                          )}`}
                        >
                          Impact: {card.impact}
                        </span>
                      )}
                    </div>

                    {card.issue || card.evidence || card.fix || card.why ? (
                      <div className="mt-3 space-y-2">
                        {card.issue && (
                          <div>
                            <strong>Issue:</strong> {card.issue}
                          </div>
                        )}

                        {card.evidence && (
                          <div>
                            <strong>Evidence:</strong> {card.evidence}
                          </div>
                        )}

                        {card.why && (
                          <div>
                            <strong>Why it matters:</strong> {card.why}
                          </div>
                        )}

                        {card.fix && (
                          <div>
                            <strong>Fix:</strong> {card.fix}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3">{card.raw}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-lg max-w-none prose-p:leading-7 prose-p:text-gray-700 prose-strong:text-black prose-li:marker:text-black prose-ul:space-y-2">
            <ReactMarkdown
              components={{
                table: ({ ...props }) => (
                  <table className="w-full border-collapse text-sm" {...props} />
                ),
                th: ({ ...props }) => (
                  <th
                    className="border border-black/10 bg-gray-50 px-3 py-2 text-left font-semibold"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td className="border border-black/10 px-3 py-2" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
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
    ? data.pages.map((page: any, pageIndex: number) => ({
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
        sections: Array.isArray(page.sections) ? page.sections : [],
        evidence: Array.isArray(page.evidence) ? page.evidence : [],
        scores: page.scores || null,
        processing_failed: !!page.processing_failed,
        failure_reason: page.failure_reason || null,
        failure_detail: page.failure_detail || null,
      }))
      
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

const auditScore = computeAuditScore(finalAuditContent || "");

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
    <div className="mt-2 text-2xl font-semibold">{scores?.clarity ?? "-"}</div>
  </div>

  {/* ✅ NEW: TRUST */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Trust</div>
    <div className="mt-2 text-2xl font-semibold">{scores?.trust ?? "-"}</div>
  </div>

  {/* ✅ NEW: CONVERSION */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Conversion</div>
    <div className="mt-2 text-2xl font-semibold">{scores?.conversion ?? "-"}</div>
  </div>

  {/* ✅ NEW: UX */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">UX</div>
    <div className="mt-2 text-2xl font-semibold">{scores?.ux ?? "-"}</div>
  </div>

  {/* ✅ NEW: MARKETING */}
  <div className="rounded-2xl border border-black/10 p-5">
    <div className="text-xs uppercase tracking-wide text-black/45">Marketing</div>
    <div className="mt-2 text-2xl font-semibold">{scores?.marketing ?? "-"}</div>
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