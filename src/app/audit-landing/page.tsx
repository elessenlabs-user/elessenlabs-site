"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { trackEvent } from "../../lib/analytics";

export const metadata = {
  title: "Elessen Audit Engine | Product Design Audit by Elessen Labs",
  description:
    "A designer-led audit engine for websites, apps, and App Store pages. See what to improve, where users may drop off, and what to tackle first.",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function ScrollDepthTracker() {
  const milestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);
      const checks = [25, 50, 75, 90];

      checks.forEach((milestone) => {
        if (percent >= milestone && !milestones.current.has(milestone)) {
          milestones.current.add(milestone);
          trackEvent("audit_landing_scroll_depth", {
            page: "audit_landing",
            milestone,
          });
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}

export default function AuditLandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:py-14">
      <ScrollDepthTracker />

      <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#0B0B0B] px-6 py-12 text-white shadow-[0_20px_60px_rgba(0,0,0,0.24)] md:px-10 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_28%)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="relative grid gap-10 md:grid-cols-[1.1fr_.9fr] md:items-center"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/68">
              ELESSEN AUDIT ENGINE™
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              See exactly what to improve in your product
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">
              Analyze your website, app, or App Store page and uncover what needs
              redesign, where users may drop off, and what to improve first.
            </p>

            <p className="mt-4 text-sm text-white/55">
              Built by product designers, powered by AI
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/audit"
                onClick={() =>
                  trackEvent("audit_landing_primary_cta", {
                    page: "audit_landing",
                    location: "hero",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,122,0,0.24)] transition hover:brightness-95"
              >
                Run your audit
              </Link>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });

                  trackEvent("audit_landing_secondary_cta", {
                    page: "audit_landing",
                    location: "hero",
                  });
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                See how it works
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
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
                  height={1600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>

              <div className="mt-3 text-xs leading-5 text-white/50">
                A fast first look before entering the full audit flow.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Identifies where users drop off",
            "Highlights what needs redesign",
            "Shows what to improve first",
          ].map((item, index) => (
            <motion.div
              key={item}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-semibold text-black">{item}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-2 md:py-6">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-black">What it works on</div>

          <div className="mt-4 flex flex-wrap gap-3">
            {["Websites", "Apps", "App Store pages"].map((item) => (
              <div
                key={item}
                className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm text-black/75"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-10 md:py-14">
        <div className="grid gap-8 rounded-[2rem] border border-black/10 bg-[#111111] px-6 py-8 text-white md:grid-cols-[.95fr_1.05fr] md:px-10 md:py-10">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] text-white/45">
              WHY IT’S DIFFERENT
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Not generic AI output. Structured for real design decisions.
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-white/72">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Built from real product audit methodology
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Combines human product design thinking with AI speed
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Designed to help founders move from guesswork to action
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="grid gap-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-[1fr_.95fr] md:p-8">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
              WHAT YOU’LL GET
            </div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-black/70">
              <p>Critical issues that may be hurting clarity or conversion</p>
              <p>UI improvement areas to review next</p>
              <p>Key insights and a practical 7-day sprint focus</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
            <Image
              src="/audit-preview.png"
              alt="Audit report preview"
              width={1200}
              height={1600}
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="rounded-[2rem] border border-orange-200 bg-gradient-to-br from-[#FFF8F3] to-white px-6 py-10 text-center shadow-sm md:px-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-black">
              Ready to see what to improve?
            </h2>

            <p className="mt-4 text-sm leading-7 text-black/65 md:text-base">
              Continue into the full audit flow and run your product through the
              Elessen Audit Engine™.
            </p>

            <div className="mt-8">
              <Link
                href="/audit"
                onClick={() =>
                  trackEvent("audit_landing_final_cta", {
                    page: "audit_landing",
                    location: "final",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF7A00] px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,122,0,0.20)] transition hover:brightness-95"
              >
                Start your audit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}