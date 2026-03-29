
"use client";

import { useMemo, useState } from "react";

type AuditSection = {
  title: string;
  content: string;
};

type AuditPreviewTabsProps = {
  sections: AuditSection[];
  previewLimit?: number;
  mainScreenshot?: string | null;
  pageCount?: number;
};

function getPreviewSectionTitle(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes("executive")) return "Executive Summary";
  if (lower.includes("critical")) return "Critical Issues";
  if (lower === "ui improvements" || lower.includes("ui improvements")) {
  return "UI Improvements";
}

if (lower.includes("quick win")) {
  return "Quick Wins";
}
  if (lower.includes("conversion")) return "Conversion Opportunities";
  if (lower.includes("copy")) return "Copy & Messaging";
  if (lower.includes("seo")) return "SEO / Discoverability";
  if (lower.includes("implementation")) return "Implementation Roadmap";
  if (lower.includes("key takeaway")) return "Key Takeaway";
  if (lower.includes("question")) return "Questions / Assumptions";
  if (lower.includes("sprint")) return "7-Day Sprint Plan";

  return title;
}

function getPreviewSectionText(content: string) {
  return content
    .replace(/[#>*`\-\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function getShortPreviewText(content: string) {
  return getPreviewSectionText(content).slice(0, 180) + "...";
}
function getBulletLines(content: string) {
  return content
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*•]\s*/, "")
        .replace(/^#+\s*/, "")
        .trim()
    )
    .filter(Boolean)
    .slice(0, 6);
}

function getCriticalBullets(content: string) {
  return content
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*•]\s*/, "")
        .replace(/^#+\s*/, "")
        .trim()
    )
    .filter(Boolean)
    .slice(0, 8);
}
function getUiImprovementGroups(content: string) {
  const cleaned = getPreviewSectionText(content);

  const normalized = cleaned
    .replace(/Marker:/g, "|||Marker:")
    .replace(/Issue:/g, "|||Issue:")
    .replace(/Evidence:/g, "|||Evidence:")
    .replace(/Fix:/g, "|||Fix:")
    .replace(/Recommended fix:/g, "|||Fix:");

  const parts = normalized
    .split("|||")
    .map((item) => item.trim())
    .filter(Boolean);

  const groups: Array<{
    marker?: string;
    issue?: string;
    evidence?: string;
    fix?: string;
  }> = [];

  let current: {
    marker?: string;
    issue?: string;
    evidence?: string;
    fix?: string;
  } = {};

  for (const part of parts) {
    if (part.startsWith("Marker:")) {
      if (current.marker || current.issue || current.evidence || current.fix) {
        groups.push(current);
        current = {};
      }
      current.marker = part.replace("Marker:", "").trim();
    } else if (part.startsWith("Issue:")) {
      current.issue = part.replace("Issue:", "").trim();
    } else if (part.startsWith("Evidence:")) {
      current.evidence = part.replace("Evidence:", "").trim();
    } else if (part.startsWith("Fix:")) {
      current.fix = part.replace("Fix:", "").trim();
    }
  }

  if (current.marker || current.issue || current.evidence || current.fix) {
    groups.push(current);
  }

  return groups.slice(0, 6);
}
function getExecutivePoints(content: string) {
  const cleaned = getPreviewSectionText(content);

  return cleaned
    .split(/\s+-\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function getCriticalIssueGroups(content: string) {
  const cleaned = getPreviewSectionText(content);

  const normalized = cleaned
    .replace(/Severity:/g, "|||Severity:")
    .replace(/Issue:/g, "|||Issue:")
    .replace(/Evidence:/g, "|||Evidence:")
    .replace(/Why it matters:/g, "|||Why it matters:")
    .replace(/Recommended fix:/g, "|||Recommended fix:")
    .replace(/Fix:/g, "|||Fix:")
    .replace(/Impact:/g, "|||Impact:")
    .replace(/Expected Impact:/g, "|||Expected Impact:")
    .replace(/Effort:/g, "|||Effort:");

  const parts = normalized
    .split("|||")
    .map((item) => item.trim())
    .filter(Boolean);

  const groups: Array<{
    severity?: string;
    issue?: string;
    evidence?: string;
    why?: string;
    fix?: string;
  }> = [];

  let current: {
    severity?: string;
    issue?: string;
    evidence?: string;
    why?: string;
    fix?: string;
  } = {};

  for (const part of parts) {
    if (part.startsWith("Severity:")) {
      if (current.issue || current.evidence || current.why || current.fix) {
        groups.push(current);
        current = {};
      }
      current.severity = part.replace("Severity:", "").trim();
    } else if (part.startsWith("Issue:")) {
      current.issue = part.replace("Issue:", "").trim();
    } else if (part.startsWith("Evidence:")) {
      current.evidence = part.replace("Evidence:", "").trim();
    } else if (part.startsWith("Why it matters:")) {
      current.why = part.replace("Why it matters:", "").trim();
    } else if (part.startsWith("Recommended fix:")) {
      current.fix = part.replace("Recommended fix:", "").trim();
    } else if (part.startsWith("Fix:")) {
      current.fix = part.replace("Fix:", "").trim();
    }
  }

  if (current.issue || current.evidence || current.why || current.fix) {
    groups.push(current);
  }

  return groups.slice(0, 3);
}

function getGenericPoints(content: string) {
  const cleaned = getPreviewSectionText(content);

  return cleaned
    .split(/\s+-\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}
function getCardTone(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes("executive")) {
    return {
      card: "border-orange-300 bg-[#F5E9DF]",
      active: "border-orange-500 bg-[#EFD9C8] ring-2 ring-orange-300",
      panel: "border-orange-200 bg-[#FBF4EE]",
    };
  }

  if (lower.includes("critical")) {
    return {
      card: "border-red-200 bg-red-50",
      active: "border-red-500 bg-red-100 ring-2 ring-red-300",
      panel: "border-red-200 bg-red-50",
    };
  }

  if (lower === "ui improvements" || lower.includes("ui improvements")) {
    return {
      card: "border-purple-200 bg-purple-50",
      active: "border-purple-500 bg-purple-100 ring-2 ring-purple-300",
      panel: "border-purple-200 bg-purple-50",
    };
  }

  if (lower.includes("conversion")) {
    return {
      card: "border-orange-200 bg-orange-50",
      active: "border-orange-500 bg-orange-100 ring-2 ring-orange-300",
      panel: "border-orange-200 bg-orange-50",
    };
  }

  if (lower.includes("copy")) {
    return {
      card: "border-blue-200 bg-blue-50",
      active: "border-blue-500 bg-blue-100 ring-2 ring-blue-300",
      panel: "border-blue-200 bg-blue-50",
    };
  }

  if (lower.includes("seo")) {
    return {
      card: "border-green-200 bg-green-50",
      active: "border-green-500 bg-green-100 ring-2 ring-green-300",
      panel: "border-green-200 bg-green-50",
    };
  }

  if (lower.includes("implementation") || lower.includes("sprint")) {
    return {
      card: "border-yellow-200 bg-yellow-50",
      active: "border-yellow-500 bg-yellow-100 ring-2 ring-yellow-300",
      panel: "border-yellow-200 bg-yellow-50",
    };
  }

  if (lower.includes("question")) {
    return {
      card: "border-neutral-300 bg-neutral-50",
      active: "border-neutral-500 bg-neutral-100 ring-2 ring-neutral-300",
      panel: "border-neutral-300 bg-neutral-50",
    };
  }
  if (lower.includes("quick win")) {
   return {
    card: "border-sky-200 bg-sky-50",
    active: "border-sky-500 bg-sky-100 ring-2 ring-sky-300",
    panel: "border-sky-200 bg-sky-50",
    };
  }

  return {
    card: "border-black/10 bg-white",
    active: "border-black/30 bg-neutral-50 ring-2 ring-black/10",
    panel: "border-black/10 bg-white",
  };
}

export default function AuditPreviewTabs({
  sections,
  previewLimit = 2,
  mainScreenshot,
  pageCount = 1, // 👈 ADD THIS
}: AuditPreviewTabsProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
  const [activeLockedIndex, setActiveLockedIndex] = useState<number | null>(null);
  const isMultiOpen = pageCount <= 2;

  const normalized = useMemo(() => {
    return sections.map((section) => {
      const title = getPreviewSectionTitle(section.title);

    return {
  ...section,
  displayTitle: title,
  short: getShortPreviewText(section.content),
  full: getPreviewSectionText(section.content),
  tone: getCardTone(title),
  executivePoints: getExecutivePoints(section.content),
  criticalGroups: getCriticalIssueGroups(section.content),
  uiGroups: getUiImprovementGroups(section.content),
  genericPoints: getGenericPoints(section.content),
  bulletLines: getBulletLines(section.content),
  criticalBullets: getCriticalBullets(section.content),
};
    });
  }, [sections]);

  function toggle(index: number) {
  const isLocked = index >= previewLimit;

  if (isLocked) {
    setActiveLockedIndex((prev) => (prev === index ? null : index));
    return;
  }

  if (isMultiOpen) {
    // ✅ MULTI OPEN MODE (≤ 2 pages)
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  } else {
    // ✅ SINGLE OPEN MODE (> 2 pages)
    setOpenIndexes((prev) =>
      prev.includes(index) ? [] : [index]
    );
  }
}

  return (
    <div className="space-y-5">
      
      {/* CARDS */}
      <div className="grid gap-3 md:grid-cols-4">
        {normalized.map((section, i) => {
          const isLocked = i >= previewLimit;
          const isOpen = isLocked
            ? activeLockedIndex === i
            : openIndexes.includes(i);

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`relative min-h-[112px] rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                isOpen
                  ? `${section.tone.active} shadow-md`
                  : `${section.tone.card} hover:shadow-sm`
              }`}
            >
              <div className="text-xs uppercase text-black/40">Section</div>

              <div className="mt-2 text-[15px] font-semibold leading-5">
                {section.displayTitle}
              </div>

              <p className="mt-2 text-[11px] leading-5 text-black/55">
                {section.short}
              </p>

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                  <span className="bg-black text-white text-xs px-3 py-1 rounded-lg">
                    Buy Full Audit
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* PANELS */}
      {normalized.map((section, i) => {
        const isLocked = i >= previewLimit;
        const isOpen = isLocked
          ? activeLockedIndex === i
          : openIndexes.includes(i);

        if (!isOpen) return null;

        return (
          <div
            key={i}
            className={`rounded-2xl border p-5 shadow-sm ${section.tone.panel}`}
          >
            <h3 className="font-semibold text-lg">
              {section.displayTitle}
            </h3>

            {!isLocked ? (
  <div className="mt-4 space-y-3">

    {/* EXECUTIVE */}
    {section.displayTitle === "Executive Summary" && (
      <div className="mt-4 space-y-3">
        {section.bulletLines.map((line, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-[6px] h-1.5 w-1.5 rounded-full bg-black/70" />
            <p className="text-sm leading-6 text-black/75">{line}</p>
          </div>
        ))}
      </div>
    )}

    {/* CRITICAL */}
    {section.displayTitle === "Critical Issues" &&
      section.criticalGroups.map((g, idx) => (
        <div key={idx} className="rounded-xl border border-black/10 bg-white px-4 py-4">
          {g.severity && (
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">
              {g.severity}
            </div>
          )}

          {g.issue && (
            <div className="text-sm font-semibold leading-6 text-black/85">
              {g.issue}
            </div>
          )}

          {g.evidence && (
            <div className="mt-2 text-xs leading-5 text-black/60">
              {g.evidence}
            </div>
          )}

          {g.fix && (
            <div className="mt-3 rounded-lg bg-black/[0.03] px-3 py-2 text-xs leading-5 text-black/75">
              <span className="font-semibold text-black/80">Fix:</span> {g.fix}
            </div>
          )}
        </div>
      ))}

    {/* UI IMPROVEMENTS */}
{section.displayTitle === "UI Improvements" && (
  <div className="mt-4 space-y-4">

    {mainScreenshot && (
      <div className="rounded-xl border border-black/10 bg-white p-3">
        <img
          src={mainScreenshot}
          alt="UI reference"
          className="w-full h-auto max-h-none"
    />
  </div>
    )}

    {section.uiGroups.map((item, idx) => (
      <div
        key={idx}
        className="rounded-xl border border-black/10 bg-white px-4 py-4"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-xs font-semibold">
            {item.marker || idx + 1}
          </div>

          <div className="space-y-2">
            {item.issue && (
              <div className="text-sm font-semibold text-black/85">
                {item.issue}
              </div>
            )}

            {item.evidence && (
              <div className="text-xs text-black/60">
                {item.evidence}
              </div>
            )}

            {item.fix && (
              <div className="text-xs text-black/75 bg-black/[0.03] px-3 py-2 rounded-lg">
                <span className="font-semibold">Fix:</span> {item.fix}
              </div>
            )}
          </div>
        </div>
      </div>
    ))}

  </div>
)}

    {/* GENERIC */}
    {section.displayTitle !== "Executive Summary" &&
      section.displayTitle !== "Critical Issues" &&
      section.displayTitle !== "UI Improvements" && (
        <div className="mt-4 space-y-3">
          {section.bulletLines.map((line, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-black/10 bg-white px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-[6px] h-1.5 w-1.5 rounded-full bg-black/70" />
                <p className="text-sm leading-6 text-black/75">{line}</p>
              </div>
            </div>
          ))}
        </div>
      )}
  </div>
) : (
  <div className="mt-4">
    <p className="text-sm text-black/60">
      Unlock full insights, fixes, and implementation steps.
    </p>

    <button className="mt-4 bg-[#FF7A00] text-white px-4 py-2 rounded-xl text-sm font-semibold">
      Buy Full Audit — $199
    </button>
  </div>
)}
          </div>
        );
      })}
    </div>
  );
}