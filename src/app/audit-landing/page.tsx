"use client";

import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "../../lib/analytics";
import { useEffect, useState } from "react";

function RotatingAuditText() {
  const messages = [
    "Discover critical issues in your product",
    "Uncover where users drop off",
    "Get clear UI improvements",
    "Fix what’s hurting your conversion",
    "See what to improve first",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="text-3xl md:text-5xl font-semibold leading-tight transition-all duration-500">
      {messages[index]}
    </div>
  );
}

export default function AuditLandingPage() {
  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.25),transparent_35%)]" />

  <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">

    {/* LEFT */}
    <div className="space-y-6">
      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-widest text-white/70">
        ELESSEN AUDIT ENGINE™
      </div>

      <RotatingAuditText />

      <p className="text-white/70 max-w-lg text-base md:text-lg leading-relaxed">
        A designer-led audit engine for websites, apps, and App Store pages.
        Built to show what needs redesign, where users drop off, and what to fix first.
      </p>

      <div className="flex gap-3 flex-wrap">
        <Link
          href="/audit#audit-form"
          onClick={() =>
            trackEvent("audit_landing_primary_cta", {
              page: "audit-landing",
              location: "hero",
            })
          }
          className="bg-[#FF7A00] text-white px-7 py-3 rounded-xl font-semibold shadow-lg hover:brightness-95 transition"
        >
          Run your audit
        </Link>

        <a
          href="#what-you-get"
          className="border border-white/20 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
        >
          See how it works
        </a>
      </div>
    </div>

    {/* RIGHT */}
    <div className="relative">
      <div className="rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
        <Image
          src="/audit-preview.png"
          alt="Audit preview"
          width={1200}
          height={1400}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* glow */}
      <div className="absolute -inset-6 -z-10 bg-orange-500/20 blur-3xl rounded-full" />
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