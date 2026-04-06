"use client";

import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "../../lib/analytics";

export default function AuditLandingPage() {
  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-8 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white/70">
              ELESSEN AUDIT ENGINE™
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              See exactly what to improve in your product
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/72 md:text-lg">
              A designer-led audit engine for websites, apps, and App Store pages.
              Built to show what needs redesign, where users may drop off, and what
              to improve first.
            </p>

            <p className="mt-4 text-sm text-white/52">
              Built by product designers. Powered by AI.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/audit#audit-form"
                onClick={() =>
                  trackEvent("audit_landing_primary_cta", {
                    page: "audit-landing",
                    location: "hero",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,122,0,0.22)] transition hover:brightness-95"
              >
                Run your audit
              </Link>

              <a
                href="#what-you-get"
                onClick={() =>
                  trackEvent("audit_landing_secondary_cta", {
                    page: "audit-landing",
                    location: "hero",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>

                <div className="text-[11px] font-medium tracking-wide text-white/45">
                  audit-preview.elessen
                </div>

                <div className="h-2 w-2 rounded-full bg-white/10" />
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <Image
                  src="/audit-preview.png"
                  alt="Elessen Audit Engine preview"
                  width={1200}
                  height={1500}
                  priority
                  className="h-auto w-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-you-get" className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Identifies where users drop off</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Highlights what needs redesign</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Shows what to improve first</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4 md:px-8 md:py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs font-semibold tracking-[0.16em] text-white/45">
            WORKS ON
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {["Websites", "Apps", "App Store pages"].map((item) => (
              <div
                key={item}
                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/78"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-[.95fr_1.05fr] md:p-8">
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-white/45">
              WHY IT’S DIFFERENT
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Not generic AI output. Structured for real decisions.
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-white/72">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              Built from real product audit methodology
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              Combines human product design thinking with AI speed
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              Designed to help founders move from guesswork to action
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-2 md:px-8 md:pb-24">
        <div className="rounded-[2rem] border border-orange-300/20 bg-gradient-to-br from-[#141922] to-[#0B0F1A] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to run your audit?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
            Go directly into the audit flow and jump straight to the form section.
          </p>

          <div className="mt-8">
            <Link
              href="/audit#audit-form"
              onClick={() =>
                trackEvent("audit_landing_final_cta", {
                  page: "audit-landing",
                  location: "final",
                })
              }
              className="inline-flex items-center justify-center rounded-2xl bg-[#FF7A00] px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,122,0,0.22)] transition hover:brightness-95"
            >
              Start your audit
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}