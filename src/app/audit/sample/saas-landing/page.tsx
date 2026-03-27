"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const sections = [
  { id: "executive", title: "Executive Summary", tone: "border-orange-300 bg-orange-50" },
  { id: "critical", title: "Critical Issues", tone: "border-red-300 bg-red-50" },
  { id: "conversion", title: "Conversion Improvements", tone: "border-amber-300 bg-amber-50" },
  { id: "ui", title: "UI Improvements", tone: "border-purple-300 bg-purple-50" },
  { id: "copy", title: "Copy Improvements", tone: "border-blue-300 bg-blue-50" },
  { id: "seo", title: "SEO Quick Wins", tone: "border-green-300 bg-green-50" },
  { id: "sprint", title: "7-Day Sprint Plan", tone: "border-indigo-300 bg-indigo-50" },
  { id: "questions", title: "Questions / Assumptions", tone: "border-gray-300 bg-gray-50" },
];

function SectionCard({
  id,
  title,
  tone,
  children,
}: {
  id: string;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  const isCritical = id === "critical";

  return (
    <section
      className={`rounded-3xl border p-6 shadow-sm ${tone} ${
        isCritical ? "ring-1 ring-red-100" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-3 text-xl font-semibold">
        {isCritical && (
          <>
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-200">
              Priority
            </span>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
          </>
        )}
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

function DetailCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/90 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] ${className}`}
    >
      <div className="text-sm leading-7 text-black/75">{children}</div>
    </div>
  );
}

export default function SampleAuditPage() {
  const [activeId, setActiveId] = useState("executive");

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 md:px-10">
      <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-white to-[#FFF8F3] p-6 shadow-sm md:p-10">
        <div className="mb-10 border-b border-black/10 pb-8">
          <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
            SAMPLE — ELESSEN AUDIT ENGINE
          </div>

          <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                SaaS Landing Page Audit
              </h1>
              <p className="mt-3 text-base leading-7 text-black/65">
                This sample shows the structure, clarity, and visual standard of
                the deliverable a client receives from the Elessen Audit Engine.
                It is AI-supported and refined through real product design
                judgment — not generic AI output.
              </p>
            </div>

            <div className="grid min-w-[280px] gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-black/45">
                  Audit Score
                </div>
                <div className="mt-2 text-3xl font-semibold">58</div>
                <div className="mt-1 text-sm text-black/55">
                  High priority fixes
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-black/45">
                  Audit Type
                </div>
                <div className="mt-2 text-lg font-semibold">
                  UX Conversion Audit
                </div>
                <div className="mt-1 text-sm text-black/55">
                  Structured review
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="lg:sticky lg:top-24">
            <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-3 shadow-sm">
              {sections.map((section) => {
                const isActive = activeId === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium text-black transition ${
                      isActive
                        ? section.tone
                        : "border-black/10 bg-white hover:bg-black/[0.03]"
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-6">
            {activeId === "executive" && (
              <SectionCard
                id="executive"
                title="Executive Summary"
                tone="border-orange-200 bg-orange-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    • Strong visual design foundation, but the page
                    underperforms from a conversion standpoint because priority
                    actions are not immediately obvious.
                  </DetailCard>
                  <DetailCard>
                    • Messaging is polished but generic. It does not quickly
                    tell the visitor why this product is the right choice or
                    what differentiates it.
                  </DetailCard>
                  <DetailCard>
                    • The CTA hierarchy, pricing clarity, and onboarding path
                    all need tightening to reduce friction and improve action
                    rate.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "critical" && (
              <SectionCard
                id="critical"
                title="Critical Issues"
                tone="border-red-200 bg-red-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    <strong>Severity:</strong> Critical
                    <br />
                    <strong>Issue:</strong> Weak primary CTA hierarchy
                    <br />
                    <strong>Evidence:</strong> The visitor sees multiple
                    possible actions, but no dominant next step stands out
                    immediately.
                    <br />
                    <strong>Why it matters:</strong> This slows decision-making
                    and reduces first-click conversion.
                    <br />
                    <strong>Fix:</strong> Introduce one dominant primary CTA
                    above the fold, repeat it lower on the page, and visually
                    subordinate secondary actions.
                  </DetailCard>

                  <DetailCard>
                    <strong>Severity:</strong> High
                    <br />
                    <strong>Issue:</strong> Pricing and offer structure are not
                    immediately clear
                    <br />
                    <strong>Evidence:</strong> The user must work too hard to
                    understand package differences and value tradeoffs.
                    <br />
                    <strong>Why it matters:</strong> Confusion here causes
                    hesitation, especially for colder traffic.
                    <br />
                    <strong>Fix:</strong> Simplify package comparison, highlight
                    the recommended choice, and bring pricing clarity closer to
                    the first CTA moment.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "conversion" && (
              <SectionCard
                id="conversion"
                title="Conversion Improvements"
                tone="border-amber-200 bg-amber-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    • Add trust indicators directly under the hero CTA instead
                    of burying them deeper in the page.
                  </DetailCard>
                  <DetailCard>
                    • Reduce competing actions in the first screen so the
                    visitor understands the intended next step instantly.
                  </DetailCard>
                  <DetailCard>
                    • Introduce clearer benefit-led subhead copy that explains
                    the outcome, not just the feature.
                  </DetailCard>
                  <DetailCard>
                    • Make pricing and the recommended plan more scannable to
                    reduce analysis friction.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "ui" && (
              <SectionCard
                id="ui"
                title="UI Improvements"
                tone="border-purple-200 bg-purple-50"
              >
                <div className="mb-6 overflow-hidden rounded-3xl border border-black/10 bg-white p-3 shadow-sm">
                  <Image
                    src="/a_digital_mockup_displays_a_saas_product_landing_p.png"
                    alt="Sample annotated UI improvement audit screenshot"
                    width={1536}
                    height={1024}
                    className="h-auto w-full rounded-2xl"
                    priority
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailCard>
                    <span className="mb-3 inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                      Marker: 1
                    </span>
                    <br />
                    <strong>Issue:</strong> Primary CTA lacks visual dominance
                    <br />
                    <strong>Evidence:</strong> The interface presents several
                    weighted actions, weakening the main conversion path.
                    <br />
                    <strong>Fix:</strong> Increase the size, contrast, and
                    spacing of the primary action and reduce the visual weight
                    of secondary controls.
                  </DetailCard>

                  <DetailCard>
                    <span className="mb-3 inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                      Marker: 2
                    </span>
                    <br />
                    <strong>Issue:</strong> Navigation density creates noise
                    <br />
                    <strong>Evidence:</strong> Too many equal-weight navigation
                    items compete with the product’s main action.
                    <br />
                    <strong>Fix:</strong> Group supporting links and keep the
                    top-level navigation focused around one core path.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "copy" && (
              <SectionCard
                id="copy"
                title="Copy Improvements"
                tone="border-blue-200 bg-blue-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    • Rewrite the headline to be more outcome-led and
                    category-specific.
                  </DetailCard>
                  <DetailCard>
                    • Replace vague supporting copy with sharper value framing
                    tied to user intent.
                  </DetailCard>
                  <DetailCard>
                    • Strengthen CTA language so it sounds action-oriented,
                    specific, and lower-friction.
                  </DetailCard>
                  <DetailCard>
                    • Add one line of trust or social reinforcement near the
                    first CTA moment.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "seo" && (
              <SectionCard
                id="seo"
                title="SEO Quick Wins"
                tone="border-green-200 bg-green-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    • Improve the meta description to align with higher-intent
                    search terms.
                  </DetailCard>
                  <DetailCard>
                    • Add more descriptive alt text and stronger semantic page
                    hierarchy.
                  </DetailCard>
                  <DetailCard>
                    • Strengthen internal linking around key commercial pages.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "sprint" && (
              <SectionCard
                id="sprint"
                title="7-Day Sprint Plan"
                tone="border-indigo-200 bg-indigo-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    <strong>Day 1:</strong> Clarify hero headline, CTA, and
                    primary value statement.
                  </DetailCard>
                  <DetailCard>
                    <strong>Day 2:</strong> Simplify top navigation and reduce
                    first-screen noise.
                  </DetailCard>
                  <DetailCard>
                    <strong>Day 3:</strong> Tighten pricing hierarchy and
                    recommended-plan emphasis.
                  </DetailCard>
                  <DetailCard>
                    <strong>Day 4:</strong> Add trust proof near the first CTA
                    and decision points.
                  </DetailCard>
                  <DetailCard>
                    <strong>Day 5–7:</strong> QA, polish, and ship updated
                    landing page variants.
                  </DetailCard>
                </div>
              </SectionCard>
            )}

            {activeId === "questions" && (
              <SectionCard
                id="questions"
                title="Questions / Assumptions"
                tone="border-gray-300 bg-gray-50"
              >
                <div className="grid gap-4">
                  <DetailCard>
                    • Is the primary goal signups, demo requests, or immediate
                    paid conversion?
                  </DetailCard>
                  <DetailCard>
                    • Are there internal constraints around pricing
                    restructuring or plan bundling?
                  </DetailCard>
                  <DetailCard>
                    • Which traffic source matters most right now: paid,
                    organic, or direct?
                  </DetailCard>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

            <div className="mt-10 rounded-[28px] bg-[#FF7A00] p-10 text-white shadow-[0_20px_60px_rgba(255,122,0,0.25)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          NEXT STEP
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Want this level of clarity for your product?
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
          Get a customized audit shaped around your product, your goals, and the
          highest-impact friction points affecting conversion.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/audit"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold !text-black shadow-sm transition hover:bg-neutral-100"
>
            Start My Audit
</Link>
          <a
            href="mailto:hello@elessenlabs.com"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Ask a question
          </a>
        </div>
      </div>
    </main>
  );
}