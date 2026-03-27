"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type UiEvidenceItem = {
  marker?: number;
  issue?: string;
  evidence?: string;
  fix?: string;
  screenshot_url?: string | null;
};

type SectionItem = {
  id: string;
  title: string;
  content: string;
};

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
  if (t.includes("critical")) return "border-red-200 bg-red-50";
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

function parseExecutiveBullets(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^- /, "").trim());
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

function SectionContent({
  title,
  content,
  uiEvidence,
  uiReferenceScreenshot,
}: {
  title: string;
  content: string;
  uiEvidence?: UiEvidenceItem[] | null;
  uiReferenceScreenshot?: string | null;
}) {
    const lowerTitle = title.toLowerCase();
    const isCritical = lowerTitle.includes("critical");
    const isExecutive = lowerTitle.includes("executive");
    const isUiSection =
      lowerTitle === "ui improvements" || lowerTitle.includes("ui improvements");
    const panelTone = getSectionPanelTone(title);
    const isCardSection =
      /conversion|critical|ui|copy|seo|sprint|question/i.test(title);
    const cards = parseBulletCards(content);
    const executiveBullets = parseExecutiveBullets(content);

  return (
    <section
      className={`rounded-2xl border p-6 shadow-sm ${panelTone} ${
        isCritical ? "ring-1 ring-red-100" : ""
      }`}
    >
     <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
        {isCritical && (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </span>
            Priority
          </span>
        )}
        <span>{title}</span>
      </div>

      {isUiSection && uiReferenceScreenshot && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] p-2">
          <img
            src={uiReferenceScreenshot}
            alt="UI improvements reference screenshot"
            className="h-auto w-full rounded-xl"
          />
        </div>
      )}

      {isUiSection && uiEvidence?.length ? (
                <div className="grid gap-4">
          {uiEvidence.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="min-w-0 text-sm leading-6 text-black/75">
                <div className="mb-3 flex items-center gap-2">
                  {item.marker ? (
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white shadow-sm">
                      {item.marker}
                    </span>
                  ) : null}

                  <span className="text-xs font-semibold uppercase tracking-wide text-black/45">
                    UI Issue
                  </span>
                </div>

                <div className="space-y-2">
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
  sections,
  uiEvidence,
  uiReferenceScreenshot,
}: {
  sections: SectionItem[];
  uiEvidence?: UiEvidenceItem[] | null;
  uiReferenceScreenshot?: string | null;
}) {
  const [activeId, setActiveId] = useState<string | null>("section-0");

  return (
        <div className="grid grid-cols-[260px_minmax(0,1fr)] items-start gap-8">
                  <div className="self-start">
                        <div className="sticky top-28 space-y-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          {sections.map((section) => {
            const tone = getSectionNavTone(section.title);
            const hoverTone = getSectionNavHoverTone(section.title);
            const isActive = activeId === section.id;

                        const isCriticalTab = section.title.toLowerCase().includes("critical");

            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setActiveId((prev) => (prev === section.id ? null : section.id))
                }
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm font-medium text-black transition ${
                  isActive ? tone : `border-black/10 bg-white ${hoverTone}`
                } ${isCriticalTab ? "relative" : ""}`}
              >
                <span className="relative inline-flex items-center gap-2">
                  {isCriticalTab && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                    </span>
                  )}
                  <span>{section.title}</span>
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
            />
          ))}
      </div>
    </div>
  );
}