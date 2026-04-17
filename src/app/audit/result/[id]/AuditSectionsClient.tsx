"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

type UiEvidenceItem = {
  marker?: number;
  issue?: string;
  evidence?: string;
  fix?: string;
  screenshot_url?: string | null;
  crop_url?: string | null;
  region_label?: string;
  region_confidence?: "low" | "medium";
};

type SectionItem = {
  id: string;
  title: string;
  content: string;
};

function getSectionNavTone(title: string) {
  const t = title.toLowerCase();

  if (t.includes("executive")) return "border-orange-300 bg-orange-50";
  if (t.includes("requires attention") || t.includes("critical")) {
  return "border-orange-300 bg-orange-50";
}
  if (t.includes("conversion")) return "border-amber-300 bg-amber-50";
  if (t === "ui improvements" || t.includes("ui improvements")) return "border-purple-300 bg-purple-50";
  if (t.includes("copy")) return "border-blue-300 bg-blue-50";
  if (t.includes("seo")) return "border-green-300 bg-green-50";
  if (t.includes("sprint")) return "border-indigo-300 bg-indigo-50";
  if (t.includes("question")) return "border-neutral-400 bg-neutral-100";

  return "border-black/10 bg-white";
}

function getSectionNavHoverTone(title: string) {
  const t = title.toLowerCase();

  if (t.includes("executive")) return "hover:border-orange-300 hover:bg-orange-50";
  if (t.includes("critical")) return "hover:border-red-300 hover:bg-red-50";
  if (t.includes("conversion")) return "hover:border-amber-300 hover:bg-amber-50";
  if (t === "ui improvements" || t.includes("ui improvements")) return "hover:border-purple-300 hover:bg-purple-50";
  if (t.includes("copy")) return "hover:border-blue-300 hover:bg-blue-50";
  if (t.includes("seo")) return "hover:border-green-300 hover:bg-green-50";
  if (t.includes("sprint")) return "hover:border-indigo-300 hover:bg-indigo-50";
  if (t.includes("question")) return "hover:border-gray-300 hover:bg-gray-50";

  return "hover:border-black/20 hover:bg-black/[0.03]";
}

function getSectionPanelTone(title: string) {
  const t = title.toLowerCase();

  if (t.includes("executive")) return "border-orange-200 bg-orange-50";
  if (t.includes("requires attention") || t.includes("critical")) {
  return "border-orange-200 bg-orange-50";
}
  if (t.includes("conversion")) return "border-yellow-200 bg-yellow-50";
  if (t === "ui improvements" || t.includes("ui improvements")) return "border-purple-200 bg-purple-50";
  if (t.includes("copy")) return "border-blue-200 bg-blue-50";
  if (t.includes("seo")) return "border-green-200 bg-green-50";
  if (t.includes("sprint")) return "border-indigo-200 bg-indigo-50";
  if (t.includes("question")) return "border-gray-300 bg-gray-50";

  return "border-black/10 bg-white";
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
    const priorityLevelMatch = clean.match(
      /Priority Level:\s*(.*?)(?=\n|Issue:|Evidence:|Why it matters:|Recommended fix:|Fix:|Effort:|Impact:|Expected Impact:|$)/i
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

    return {
      raw: clean,
      severity: priorityLevelMatch?.[1]?.trim() || severityMatch?.[1]?.trim() || "",
      issue: issueMatch?.[1]?.trim() || "",
      evidence: evidenceMatch?.[1]?.trim() || "",
      why: whyMatch?.[1]?.trim() || "",
      fix: recommendedFixMatch?.[1]?.trim() || fixMatch?.[1]?.trim() || "",
      effort: effortMatch?.[1]?.trim() || "",
      impact: impactMatch?.[1]?.trim() || "",
    };
  });
}

function parseExecutiveBullets(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^- /, "").trim());
}

function badgeColor(value: string) {
  const v = value.toLowerCase();

  if (v === "requires attention" || v === "high" || v === "critical") {
  return "bg-orange-50 text-orange-700 ring-orange-200";
}

  if (v === "medium") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  if (v === "low") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  return "bg-gray-50 text-gray-700 ring-gray-200";
}

function isUnlockedSection(title: string) {
  const t = title.toLowerCase();
  return t.includes("executive") || t.includes("requires attention") || t.includes("critical");
}

function LockedSection({
  title,
  currentStatus,
  auditRequestId,
}: {
  title: string;
  currentStatus?: string;
  auditRequestId?: string;
}) {
    const isPreviewReady = currentStatus === "preview_ready";
    const isReviewState =
      currentStatus === "paid_pending_review" ||
      currentStatus === "paid_in_review" ||
      currentStatus === "in_review" ||
      currentStatus === "ready_for_review" ||
      currentStatus === "review_ready";
    const [isStartingCheckout, setIsStartingCheckout] = useState(false);
   
    
  async function handleFullAuditCheckout() {
  if (!auditRequestId) return;

  try {
    setIsStartingCheckout(true);

    const res = await fetch("/api/checkout/full-audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auditRequestId }),
    });

    const data = await res.json();

    if (!res.ok || !data?.url) {
      console.error("FULL AUDIT CHECKOUT ERROR:", data);
      setIsStartingCheckout(false);
      return;
    }

    window.location.href = data.url;
  } catch (err) {
    console.error("FULL AUDIT CHECKOUT ERROR:", err);
    setIsStartingCheckout(false);
  }
}    
  
      return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-4 text-lg font-semibold">{title}</div>

      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] p-8">
        <div className="pointer-events-none select-none blur-[4px] opacity-50">
          <div className="space-y-4">
            <div className="h-24 rounded-2xl bg-white border border-black/10" />
            <div className="h-24 rounded-2xl bg-white border border-black/10" />
            <div className="h-24 rounded-2xl bg-white border border-black/10" />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-md rounded-3xl border border-orange-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-2xl">
              🔒
            </div>

            <h3 className="text-xl font-semibold text-black">
              {isReviewState ? "Your audit is being prepared" : "Unlock the full audit"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-black/60">
              {isReviewState
                ? "Your payment has been received. Executive Summary and Requires Attention sections remain visible while the rest of the report is finalized for delivery."
                : "Executive Summary and Requires Attention sections are visible in preview. Proceed to unlock the full Elessen Audit Engine™ report."}
          </p>

            <p className="mt-2 text-xs leading-5 text-black/50">
              {isReviewState
                ? "We are now reviewing and preparing your completed audit for delivery. This can take up to 24 hours, although it is often much faster."
                : "Once unlocked, your audit is reviewed by Elessen before delivery to ensure quality and accuracy. Delivery can take up to 24 hours, though it is often much faster."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
        {isPreviewReady ? (
          <button
            type="button"
            onClick={handleFullAuditCheckout}
            disabled={isStartingCheckout || !auditRequestId}
            className="inline-flex items-center justify-center rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
          {isStartingCheckout ? "Redirecting…" : "Pay for Full Report"}
        </button>
      ) : isReviewState ? (
        <div className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">
          In Review
        </div>
      ) : null}

              <a
                href="mailto:hello@elessenlabs.com?subject=Question%20about%20unlocking%20audit"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-black/[0.03]"
              >
                Ask a question
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function filterUiEvidence(items?: UiEvidenceItem[] | null) {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    const text = `${item.issue || ""} ${item.evidence || ""}`.toLowerCase();

    return !(
      text.includes("visually unclear") ||
      text.includes("not visible") ||
      text.includes("unable to determine") ||
      text.includes("no indication of") ||
      text.includes("visual review required")
    );
  });
}

function SectionContent({
  title,
  content,
  uiEvidence,
  uiReferenceScreenshot,
  locked,
  onOpenImage,
  currentStatus,
  auditRequestId,
}: {
  title: string;
  content: string;
  auditRequestId?: string;
  uiEvidence?: UiEvidenceItem[] | null;
  uiReferenceScreenshot?: string | null;
  locked?: boolean;
  onOpenImage?: (src: string) => void;
  currentStatus?: string;
}) {

  const lowerTitle = title.toLowerCase();
const isRequiresAttention =
  lowerTitle.includes("requires attention") || lowerTitle.includes("critical");
const isExecutive = lowerTitle.includes("executive");
const isUiSection =
  lowerTitle === "ui improvements" || lowerTitle.includes("ui improvements");
const panelTone = getSectionPanelTone(title);
const isCardSection =
  /conversion|requires attention|critical|ui|copy|seo|sprint|question/i.test(title);
const cards = parseBulletCards(content);
const executiveBullets = parseExecutiveBullets(content);
const filteredEvidence = filterUiEvidence(uiEvidence);

  if (locked) {
    return (
     <LockedSection
       title={title}
       currentStatus={currentStatus}
       auditRequestId={auditRequestId}
     />
   );
}

  return (
    <section
      className={`rounded-2xl border p-6 shadow-sm ${panelTone} ${
  isRequiresAttention ? "ring-1 ring-orange-100" : ""
}`}
    >
      <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
        {isRequiresAttention && (
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200">
          <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
          </span>
          Requires Attention
          </span>
        )}
        <span>{title}</span>
      </div>
   {isUiSection && filteredEvidence.length ? (
      <div className="grid gap-6">

        {/* ⚠️ Screenshot disclaimer */}
        <div className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-xs leading-5 text-black/60">
          Screenshots are automatically captured during analysis. In some cases, elements may appear slightly misaligned or differ due to dynamic content, cookies, or environment variations.
        </div>
          {filteredEvidence.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
        {(item.crop_url || uiReferenceScreenshot) ? (
          <button
            type="button"
            onClick={() => onOpenImage?.(item.crop_url || uiReferenceScreenshot || "")}
            className="mb-4 block w-full overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:shadow-sm"
          >
          <div className="relative bg-white p-3">
            <img
              src={item.crop_url || uiReferenceScreenshot || ""}
              alt={`UI issue ${item.marker || index + 1}`}
              className="block h-[160px] w-full rounded-xl object-cover object-top sm:h-[180px]"
            />

          <div className="absolute left-5 top-5 inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-bold text-white shadow-lg ring-2 ring-white">
            {item.marker || index + 1}
          </div>
        </div>

        <div className="border-t border-black/10 bg-black/[0.02] px-3 py-2 text-[11px] text-black/55">
          Click to enlarge evidence
        </div>
      </button>
    ) : null}

              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-bold text-white">
                  {item.marker || index + 1}
                </span>

                <span className="text-xs font-semibold uppercase tracking-wide text-black/45">
                  UI Issue #{item.marker || index + 1}
                </span>

                {item.region_label ? (
                  <span className="rounded-full bg-black/[0.04] px-2 py-1 text-[11px] text-black/60">
                    {item.region_label}
                  </span>
                ) : null}
              </div>

              <div className="space-y-2 text-sm leading-6 text-black/75">
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
                  <div className="rounded-xl bg-black/[0.04] px-3 py-3">
                    <strong>Fix:</strong> {item.fix}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : isCardSection ? (
        <div className="grid gap-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/10 bg-white/70 p-4"
            >
              <div className="min-w-0 flex-1 text-sm leading-6 text-black/75">
                <div className="flex flex-wrap gap-2">
                  {card.severity && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${badgeColor(
                        card.severity
                      )}`}
                    >
                      Severity: {card.severity}
                    </span>
                  )}

                  {card.effort && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${badgeColor(
                        card.effort
                      )}`}
                    >
                      Effort: {card.effort}
                    </span>
                  )}

                  {card.impact && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${badgeColor(
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
          ))}
        </div>
      ) : isExecutive ? (
        <div className="grid gap-4">
          {executiveBullets.map((line, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/10 bg-white p-5 text-sm leading-7 text-black/75"
            >
              <div className="flex items-start gap-3">
                <div className="mt-[9px] h-2 w-2 rounded-full bg-orange-500" />
                <div className="flex-1">{line}</div>
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
    </section>
  );
}

export default function AuditSectionsClient({
  auditRequestId,
  sections,
  uiEvidence,
  uiReferenceScreenshot,
  previewMode = false,
  currentStatus,
}: {
  sections: SectionItem[];
  auditRequestId?: string;
  uiEvidence?: UiEvidenceItem[] | null;
  uiReferenceScreenshot?: string | null;
  previewMode?: boolean;
  currentStatus?: string;
}) {
  const defaultSectionId = useMemo(() => {
    if (!sections.length) return null;

    if (!previewMode) return sections[0].id;

    const executive = sections.find((s) =>
      s.title.toLowerCase().includes("executive")
    );

    return executive ? executive.id : sections[0].id;
  }, [sections, previewMode]);

  const [activeId, setActiveId] = useState<string | null>(defaultSectionId);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    useEffect(() => {
    setActiveId(defaultSectionId);
  }, [defaultSectionId]);

    return (
  <>
    {/* SCREEN VERSION */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8 print:hidden">
    <div className="self-start">
      <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm lg:sticky lg:top-28">
          {sections.map((section) => {
            const tone = getSectionNavTone(section.title);
            const hoverTone = getSectionNavHoverTone(section.title);
            const isActive = activeId === section.id;
            const isRequiresAttentionTab =
              section.title.toLowerCase().includes("requires attention") ||
              section.title.toLowerCase().includes("critical");
            const locked = previewMode && !isUnlockedSection(section.title);

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveId(section.id)}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm font-medium text-black transition break-words ${
                  isActive ? tone : `border-black/10 bg-white ${hoverTone}`
                  } ${isRequiresAttentionTab ? "relative" : ""}`}
          >
                <span className="relative inline-flex items-center gap-2">
                  {isRequiresAttentionTab && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                    </span>
                  )}

                  <span>{section.title}</span>

                  {locked && (
                    <span className="ml-1 text-xs text-black/45">🔒</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0">
        {sections
          .filter((section) => section.id === activeId)
          .map((section) => (
            <SectionContent
              key={section.id}
              title={section.title}
              content={section.content}
              uiEvidence={uiEvidence}
              uiReferenceScreenshot={uiReferenceScreenshot}
              locked={previewMode && !isUnlockedSection(section.title)}
              currentStatus={currentStatus}
              auditRequestId={auditRequestId}
              onOpenImage={(src) => {
                setLightboxSrc(src);
                setLightboxOpen(true);
              }}
            />
          ))}
      </div>    

      {lightboxOpen && lightboxSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6">
          <div
            className="absolute inset-0"
            onClick={() => {
              setLightboxOpen(false);
              setLightboxSrc(null);
            }}
          />

          <div
            className="relative max-h-[90vh] max-w-[95vw] overflow-auto rounded-2xl bg-white p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-black">
                Evidence Image
              </div>

              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setLightboxSrc(null);
                }}
                className="rounded-lg border border-black/10 px-3 py-1 text-sm text-black hover:bg-black/[0.04]"
              >
                Close
              </button>
            </div>

            <div className="relative">
              <img
                src={lightboxSrc}
                alt="Enlarged evidence image"
                className="h-auto max-w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>

    {/* PRINT / PDF VERSION */}
    <div className="hidden print:block">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="break-inside-avoid">
            <SectionContent
              title={section.title}
              content={section.content}
              uiEvidence={uiEvidence}
              uiReferenceScreenshot={uiReferenceScreenshot}
              locked={false}
              currentStatus={currentStatus}
              auditRequestId={auditRequestId}
            />
          </div>
        ))}
      </div>
    </div>
  </>
);
}