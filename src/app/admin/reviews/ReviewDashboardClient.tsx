"use client";

import { useEffect, useMemo, useRef, useState } from "react";


type SectionItem = {
  title: string;
  content: string;
};

type EvidenceItem = {
  marker?: number;
  issue?: string;
  evidence?: string;
  fix?: string;
  crop_url?: string | null;
  region_label?: string;
  region_confidence?: "low" | "medium";
};

type PageItem = {
  url?: string;
  screenshot_url?: string | null;
  marked_screenshot_url?: string | null;
  sections?: SectionItem[];
  evidence?: EvidenceItem[];
};

type AuditItem = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  product_url?: string | null;
  focus_page_url?: string | null;
  status?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  audit_content?: string | null;
  edited_audit_content?: string | null;
  pages?: PageItem[] | null;
  screenshot_url?: string | null;
  marked_screenshot_url?: string | null;
};

type SaveResponse = {
  ok?: boolean;
  error?: string;
};

function splitSections(markdown: string | null | undefined): SectionItem[] {
  if (!markdown || !markdown.trim()) return [];

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

function buildMarkdownFromPages(pages: PageItem[]) {
  return pages
    .flatMap((page) => page.sections || [])
    .map((section) => `## ${section.title}\n${section.content}`)
    .join("\n\n");
}

function normalizePages(audit: AuditItem): PageItem[] {
  if (Array.isArray(audit.pages) && audit.pages.length > 0) {
        return audit.pages.map((page, index) => ({
      url:
        page?.url ||
        (index === 0 ? audit.product_url || "" : `Additional Page ${index}`),
      screenshot_url: page?.screenshot_url || null,
      marked_screenshot_url: page?.marked_screenshot_url || null,
      sections: Array.isArray(page?.sections)
        ? page.sections.map((section) => ({
            title: section.title || "Section",
            content: section.content || "",
          }))
        : [],
      evidence: Array.isArray((page as any)?.evidence)
        ? (page as any).evidence.map((item: any) => ({
            marker: item?.marker,
            issue: item?.issue || "",
            evidence: item?.evidence || "",
            fix: item?.fix || "",
            crop_url: item?.crop_url || null,
            region_label: item?.region_label || "",
            region_confidence: item?.region_confidence,
          }))
        : [],
    }));
  }

   const fallbackSections = splitSections(
    audit.edited_audit_content || audit.audit_content
  );

    return [
    {
      url: audit.product_url || "",
      screenshot_url: audit.screenshot_url || null,
      marked_screenshot_url: audit.marked_screenshot_url || null,
      sections: fallbackSections,
      evidence: [],
    },
  ];
}

function labelForPage(page: PageItem, index: number) {
  if (index === 0) return "Main Page";
  return `Additional Page ${index}`;
}

export default function ReviewDashboardClient({
  audits,
}: {
  audits: AuditItem[];
}) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [auditList, setAuditList] = useState<AuditItem[]>(audits);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(
    audits[0]?.id || null
  );
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const activeAudit = useMemo(
    () => auditList.find((audit) => audit.id === activeAuditId) || null,
    [auditList, activeAuditId]
  );

  const normalizedPages = useMemo(
    () => (activeAudit ? normalizePages(activeAudit) : []),
    [activeAudit]
  );

  const activePage = normalizedPages[activePageIndex] || null;
  const activeSections = activePage?.sections || [];
  const activeSection = activeSections[activeSectionIndex] || null;
  const isDelivered = activeAudit?.status === "delivered";
  const isUiSection = 
    activeSection?.title?.toLowerCase() === "ui improvements" ||
    activeSection?.title?.toLowerCase().includes("ui improvements");

    useEffect(() => {
    setActivePageIndex(0);
    setActiveSectionIndex(0);
  }, [activeAuditId]);

  useEffect(() => {
    setActiveSectionIndex(0);
  }, [activePageIndex]);

  useEffect(() => {
    setEditorHtml(activeSection?.content || "");
  }, [activeSection?.title, activeSection?.content]);

  function updateCurrentSectionContent(nextContent: string) {
    if (!activeAudit) return;

    const nextPages = normalizePages(activeAudit).map((page, pageIndex) => ({
      ...page,
      sections: (page.sections || []).map((section, sectionIndex) => {
        if (pageIndex === activePageIndex && sectionIndex === activeSectionIndex) {
          return { ...section, content: nextContent };
        }
        return section;
      }),
    }));

    const nextMarkdown = buildMarkdownFromPages(nextPages);

    setAuditList((prev) =>
      prev.map((audit) =>
        audit.id === activeAudit.id
          ? {
              ...audit,
              pages: nextPages,
              edited_audit_content: nextMarkdown,
            }
          : audit
      )
    );
  }

  function exec(command: string, value?: string) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    const html = editorRef.current.innerHTML;
    setEditorHtml(html);
    updateCurrentSectionContent(html);
  }

  function updateEvidenceField(
  pageIndex: number,
  evidenceIndex: number,
  field: "issue" | "evidence" | "fix" | "crop_url",
  value: string
) {
  if (!activeAudit) return;

  const nextPages = normalizePages(activeAudit).map((page, pIndex) => {
    if (pIndex !== pageIndex) return page;

    return {
      ...page,
      evidence: (page.evidence || []).map((item, eIndex) => {
        if (eIndex !== evidenceIndex) return item;

        return {
          ...item,
          [field]: value,
        };
      }),
    };
  });

  setAuditList((prev) =>
    prev.map((audit) =>
      audit.id === activeAudit.id
        ? { ...audit, pages: nextPages }
        : audit
    )
  );
}

  async function saveEdits() {
    if (!activeAudit) return;

    setIsSaving(true);
    setStatusMessage("");

    try {
      const pages = normalizePages(activeAudit);
      const editedAuditContent = buildMarkdownFromPages(pages);

      const res = await fetch(`/api/admin/reviews/${activeAudit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages,
          editedAuditContent,
        }),
      });

      const json: SaveResponse = await res.json();

      if (!res.ok) {
        setStatusMessage(json.error || "Failed to save edits.");
        setIsSaving(false);
        return;
      }

      setStatusMessage("Edits saved.");
    } catch {
      setStatusMessage("Failed to save edits.");
    } finally {
      setIsSaving(false);
    }
  }

  async function runAction(action: "approve" | "reject") {
    if (!activeAudit) return;

    setIsSaving(true);
    setStatusMessage("");

    try {
      const res = await fetch(`/api/admin/reviews/${activeAudit.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json: SaveResponse = await res.json();

      if (!res.ok) {
        setStatusMessage(json.error || `Failed to ${action}.`);
        setIsSaving(false);
        return;
      }

            setAuditList((prev) =>
        prev.map((audit) =>
          audit.id === activeAudit.id
            ? {
                ...audit,
                status: action === "approve" ? "delivered" : "paid_pending_review",
              }
            : audit
        )
      );

      setStatusMessage(
        action === "approve"
          ? "Audit approved and delivered."
          : "Audit returned to the review queue."
      );
    } catch {
      setStatusMessage(`Failed to ${action}.`);
    } finally {
      setIsSaving(false);
    }
  }

  if (!auditList.length) {
  return (
    <main className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen bg-[#F6F6F4]">
      <div className="grid min-h-screen w-full grid-cols-[280px_320px_1fr]">
        <div className="w-[280px] border-r bg-white p-4 overflow-y-auto">
          <div className="text-xs font-semibold uppercase text-black/50 mb-4">
            Review Queue
          </div>
        </div>

        <div className="w-[320px] border-r bg-[#FBFBFB] p-4 overflow-y-auto">
          <div className="text-xs font-semibold uppercase text-black/50 mb-4">
            Structure
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
            <div className="text-lg font-semibold text-black">
              No audits ready for review
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
  <main className="w-full min-h-screen bg-[#F7F7F5]">
    <div className="grid min-h-screen w-full grid-cols-[260px_300px_minmax(0,1fr)]">

  {/* LEFT — AUDIT QUEUE */}

  {/* LEFT — AUDIT QUEUE */}
  <aside className="min-h-screen shrink-0 border-r border-black/10 bg-white px-4 py-6 overflow-y-auto">
    <div className="mb-5">
  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
    Review Queue
  </div>
  <div className="mt-2 text-sm text-black/55">
    Select an audit to review
  </div>
</div>

    <div className="space-y-3">
      {auditList.map((audit) => {
        const isActive = audit.id === activeAuditId;

        return (
          <button
            key={audit.id}
            type="button"
            onClick={() => setActiveAuditId(audit.id)}
            className={`w-full rounded-2xl border p-4 text-left transition shadow-sm ${
              isActive
                ? "border-orange-300 bg-orange-50"
                : "border-black/10 bg-white hover:bg-black/[0.03]"
            }`}
          >
            <div className="text-sm font-semibold break-all text-black">
              {audit.product_url}
            </div>
            <div className="mt-2 text-xs text-black/55">
              {audit.status === "preview_ready"
                ? "Preview Ready"
                : audit.status === "paid_pending_review"
                ? "Pending Review"
                : audit.status === "in_review"
                ? "In Review"
                : audit.status === "delivered"
                ? "Delivered"
                : audit.status}
            </div>
            <div className="mt-1 text-xs text-black/45">{audit.id}</div>
          </button>
        );
      })}
    </div>
  </aside>

  {/* CENTER — PAGES + SECTIONS */}
  <aside className="min-h-screen shrink-0 border-r border-black/10 bg-[#FBFBFB] px-4 py-6 overflow-y-auto">
    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
      Pages
    </div>

    <div className="space-y-2">
      {normalizedPages.map((page, index) => (
        <button
          key={`${page.url || "page"}-${index}`}
          type="button"
          onClick={() => setActivePageIndex(index)}
          className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
            activePageIndex === index
              ? "border-orange-300 bg-orange-50"
              : "border-black/10 bg-white hover:bg-black/[0.03]"
          }`}
        >
          <div className="font-semibold text-black">
            {labelForPage(page, index)}
          </div>
          <div className="mt-1 break-all text-xs text-black/50">
            {page.url}
          </div>
        </button>
      ))}
    </div>

      <div className="mt-6 mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
  Sections
</div>

    <div className="space-y-2">
      {activeSections.map((section, index) => (
        <button
          key={`${section.title}-${index}`}
          type="button"
          onClick={() => setActiveSectionIndex(index)}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition shadow-sm ${
            activeSectionIndex === index
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white hover:bg-black/[0.03]"
          }`}
        >
          {section.title}
        </button>
      ))}
    </div>
  </aside>

  {/* RIGHT — EDITOR */}
  <div className="min-h-screen min-w-0 overflow-y-auto bg-white px-12 py-10">
   <div className="mb-12 flex items-start justify-between">
    <div>
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
      Internal Review
    </div>
    <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-black">
      Elessen Audit Engine™ Review Dashboard
    </h1>
   <p className="mt-2 max-w-2xl text-[15px] leading-7 text-black/50">
      Review reports inline, switch between audits, pages, and sections, then
      save, approve, or return for rework.
    </p>
  </div>

  <div className="shrink-0 rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3 text-sm text-black/70 shadow-sm">
    CMS Review Mode
  </div>
</div>
       
        {/* Editor */}
        <section className="min-h-[calc(100vh-140px)] w-full rounded-[20px] border border-black/10 bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
          {activeAudit ? (
            <>
              <div className="mb-6 border-b border-black/10 pb-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                  Review Item
                </div>

                <h2 className="mt-3 text-2xl font-semibold break-all text-black">
                  {activeAudit.product_url}
                </h2>

                <div className="mt-4 grid gap-2 text-sm text-black/60">
                {isDelivered ? (
                  <div className="mt-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  This audit has been delivered. Editing is locked in admin view.
  </div>
) : null}
                  <div>
                    <strong className="text-black/75">Status:</strong>{" "}
                    {activeAudit.status === "preview_ready"
                      ? "Preview Ready"
                      : activeAudit.status === "paid_pending_review"
                      ? "Pending Review"
                      : activeAudit.status === "in_review"
                      ? "In Review"
                      : activeAudit.status === "delivered"
                      ? "Delivered"
                      : activeAudit.status}
                  </div>
                  {activeAudit.focus_page_url ? (
                    <div>
                      <strong className="text-black/75">Focus page:</strong>{" "}
                      {activeAudit.focus_page_url}
                    </div>
                  ) : null}
                  <div>
                    <strong className="text-black/75">Created:</strong>{" "}
                    {activeAudit.created_at}
                  </div>
                  <div>
                    <strong className="text-black/75">Audit ID:</strong>{" "}
                    {activeAudit.id}
                  </div>
                </div>
              </div>

              {activePage ? (
                <>
                  <div className="mb-4 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Active Page
                    </div>
                    <div className="mt-2 break-all text-sm font-medium text-black">
                      {activePage.url}
                    </div>
                  </div>
                {isUiSection && Array.isArray(activePage.evidence) && activePage.evidence.length > 0 ? (
                    <div className="mb-6 rounded-2xl border border-black/10 bg-[#FAFAFA] p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-black">
                          Evidence Review
                        </div>

                        {(activePage.marked_screenshot_url ||
                          activePage.screenshot_url ||
                          activeAudit.marked_screenshot_url ||
                          activeAudit.screenshot_url) && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxSrc(
                                activePage.marked_screenshot_url ||
                                  activePage.screenshot_url ||
                                  activeAudit.marked_screenshot_url ||
                                  activeAudit.screenshot_url ||
                                  null
                              )
                            }
                            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"
                          >
                            View Full Screenshot
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        {activePage.evidence.map((item, index) => {
                          const key = `${activePageIndex}-${index}`;
                          return (
                          <div
                            key={`${item.marker || index}-${index}`}
                            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                          >
                            {(item.crop_url || activePage?.marked_screenshot_url || activePage?.screenshot_url) ? (
                              <button
                                type="button"
                                onClick={() => setLightboxSrc(item.crop_url || null)}
                                className="mb-4 block w-full overflow-hidden rounded-xl border border-black/10 bg-black/[0.02] text-left transition hover:shadow-sm"
                              >
                    <div className="flex justify-center bg-white">
                      <div className="relative inline-block">
                  <img
                    src={
                      item.crop_url ||
                      activePage?.marked_screenshot_url ||
                      activePage?.screenshot_url ||
                      ""
                    }
                          alt={`Evidence ${item.marker || index + 1}`}
                          className="max-w-full h-auto block"
                  />

                    {/* MARKER — NOW CORRECTLY ON IMAGE */}
                  <div
                    className="absolute inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-bold text-white shadow-lg ring-2 ring-white"
                    style={{
                      top: "10%",
                      left: "10%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {item.marker || index + 1}
                  </div>
              </div>
            </div>
                                <div className="border-t border-black/10 bg-white px-3 py-2 text-[11px] text-black/50">
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

    <div className="space-y-3 text-sm leading-6 text-black/75">

      {/* ISSUE */}
      <div>
        <div className="text-xs font-semibold text-black/60 mb-1">Issue</div>
        <textarea
          value={item.issue || ""}
          disabled={isDelivered}
          onChange={(e) =>
            updateEvidenceField(activePageIndex, index, "issue", e.target.value)
          }
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
      />
    </div>

      {/* EVIDENCE */}
      <div>
        <div className="text-xs font-semibold text-black/60 mb-1">Evidence</div>
        <textarea
          value={item.evidence || ""}
          disabled={isDelivered}
          onChange={(e) =>
            updateEvidenceField(activePageIndex, index, "evidence", e.target.value)
          }
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
      />
    </div>

      {/* FIX */}
    <div>
      <div className="text-xs font-semibold text-black/60 mb-1">Fix</div>
      <textarea
        value={item.fix || ""}
        disabled={isDelivered}
        onChange={(e) =>
          updateEvidenceField(activePageIndex, index, "fix", e.target.value)
        }
        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-black/[0.02]"
      />

  </div>

  <input
    type="file"
    accept="image/*"
    disabled={isDelivered}
    className="mt-2 text-xs"
    onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeAudit) return;

    const formData = new FormData();
    formData.append("file", file);

    setStatusMessage("Uploading image...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setStatusMessage("Upload failed.");
        return;
      }

      updateEvidenceField(
        activePageIndex,
        index,
        "crop_url",
        data.url
      );

      setStatusMessage("Image uploaded.");
    } catch {
      setStatusMessage("Upload error.");
    }
  }}
/>


<button
  type="button"
  disabled={savingKey === key || isDelivered}
  onClick={async () => {
    if (!activeAudit) return;

    setSavingKey(key);
    setSavedKey(null);

    try {
      const pages = normalizePages(activeAudit);
      const editedAuditContent = buildMarkdownFromPages(pages);

      const res = await fetch(`/api/admin/reviews/${activeAudit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages,
          editedAuditContent,
        }),
      });

      if (!res.ok) {
        setStatusMessage("Failed to save issue.");
        setSavingKey(null);
        return;
      }

      setSavedKey(key);

      setTimeout(() => {
        setSavedKey(null);
      }, 2000);

    } catch {
      setStatusMessage("Error saving issue.");
    } finally {
      setSavingKey(null);
    }
  }}
  className={`mt-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${
    savingKey === key
      ? "bg-gray-400"
      : savedKey === key
      ? "bg-green-600"
      : "bg-black hover:bg-black/80"
  }`}
>
  {savingKey === key
    ? "Saving..."
    : savedKey === key
    ? "Saved ✓"
    : "Save Issue"}
</button>

  </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              <div className="mb-3 text-lg font-semibold text-black">
                {activeSection?.title || "Section"}
              </div>

              <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                <button
                  type="button"
                  onClick={() => exec("bold")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => exec("italic")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => exec("underline")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  Underline
                </button>
                <button
                  type="button"
                  onClick={() => exec("insertUnorderedList")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  Bullets
                </button>
                <button
                  type="button"
                  onClick={() => exec("formatBlock", "<h2>")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => exec("formatBlock", "<p>")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  Paragraph
                </button>

                <label className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                  Text color
                  <input
                    type="color"
                    onChange={(e) => exec("foreColor", e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => exec("insertText", "✅")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  ✅
                </button>
                <button
                  type="button"
                  onClick={() => exec("insertText", "🚨")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  🚨
                </button>
                <button
                  type="button"
                  onClick={() => exec("insertText", "🎯")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  🎯
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const imageUrl = window.prompt("Paste image URL");
                    if (imageUrl) exec("insertImage", imageUrl);
                  }}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  Insert Image
                </button>
                
              <button
                type="button"
                onClick={() => {
                  const audioUrl = window.prompt("Paste audio URL");
                  if (!audioUrl || !editorRef.current) return;
                  editorRef.current.focus();
                  document.execCommand(
                    "insertHTML",
                    false,
                    `<audio controls src="${audioUrl}" style="width:100%; margin:12px 0;"></audio>`
                  );
                  const html = editorRef.current.innerHTML;
                  setEditorHtml(html);
                  updateCurrentSectionContent(html);
              }}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
              >
                Insert Audio
              </button>
              </div>

              <div
                ref={editorRef}
                contentEditable={!isDelivered}
                suppressContentEditableWarning
                className={`min-h-[720px] w-full rounded-2xl border border-black/10 p-10 text-[16px] leading-8 text-black outline-none ${
                  isDelivered ? "bg-neutral-50 opacity-90" : "bg-white"
                  }`}                
                dangerouslySetInnerHTML={{ __html: editorHtml }}
                onInput={(e) => {
                  const html = (e.currentTarget as HTMLDivElement).innerHTML;
                  setEditorHtml(html);
                  updateCurrentSectionContent(html);
                }}
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isSaving || isDelivered}
                  onClick={saveEdits}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                  Save Edits
              </button>

                <button
                  type="button"
                  disabled={isSaving || isDelivered}
                  onClick={() => runAction("approve")}
                  className="rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Approve & Deliver
                </button>

                <button
                  type="button"
                  disabled={isSaving || isDelivered}
                  onClick={() => runAction("reject")}
                  className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-50"
                >
                  Reject / Rework
                </button>
              </div>

              {statusMessage && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black/75">
                  {statusMessage}
                </div>
              )}
            </>
          ) : null}
        </section>
      </div>

      {lightboxSrc && (
        <div className="fixed inset-0 z-[100] bg-black/80 p-6">
          <div
            className="absolute inset-0"
            onClick={() => setLightboxSrc(null)}
        />
          <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center">
            <div className="max-h-[92vh] w-full overflow-auto rounded-3xl bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-black">
                  Screenshot Review
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxSrc(null)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  Close
                </button>
              </div>

              <img
                src={lightboxSrc}
                alt="Enlarged screenshot"
                className="w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
           )}
    </div>
  </main>
  );
}