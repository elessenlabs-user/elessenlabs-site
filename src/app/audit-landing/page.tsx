"use client";

import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "../../lib/analytics";
import { useEffect, useState } from "react";

function RotatingAuditText() {
  const messages = [
    "Discover critical issues",
    "Get UI improvements",
    "Spot where users drop off",
    "Find actions for this week",
    "Prioritize what to fix first",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-[92px] text-3xl font-semibold leading-tight tracking-tight text-white md:min-h-[132px] md:text-5xl">
      {messages[index]}
    </div>
  );
}

export default function AuditLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#00a7b9] text-white">
      <section className="relative min-h-screen overflow-hidden">
        {/* background image fallback */}
        <div className="absolute inset-0">
          <Image
            src="/img1.png"
            alt="Elessen Audit Engine background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* video layer */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            poster="/img1.png"
          >
            <source src="/landing.mp4" type="video/mp4" />
          </video>
        </div>

        {/* overlays */}
        <div className="absolute inset-0 bg-[#00a7b9]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00a7b9]/28 via-[#00a7b9]/16 to-[#00a7b9]/38" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_20%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-white/90 backdrop-blur-sm">
              ELESSEN AUDIT ENGINE™
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.2)] md:text-7xl">
              Get Product Audit
              <br />
              for App Store
              <br />
              and Website
            </h1>

            <div className="mt-6">
              <RotatingAuditText />
            </div>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/95 md:text-xl md:leading-8">
              Your time is precious, find things you can action today, with our
              7 day sprint plan included in your report.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
              Designer-led, AI-supported audits that show what needs attention
              now — clearly, quickly, and in a format you can use immediately.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/audit#audit-form"
                onClick={() =>
                  trackEvent("audit_landing_primary_cta", {
                    page: "audit-landing",
                    location: "hero",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#0099aa] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:scale-[1.01] hover:bg-[#f7feff]"
              >
                Get Product Audit
              </Link>

              <a
                href="#what-you-get"
                onClick={() =>
                  trackEvent("audit_landing_secondary_cta", {
                    page: "audit-landing",
                    location: "hero",
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/16"
              >
                See what’s included
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="what-you-get"
        className="relative border-t border-white/15 bg-[#00a7b9] px-6 py-14 md:px-8 md:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-xs font-semibold tracking-[0.18em] text-white/75">
            WHAT YOU GET
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="text-lg font-semibold text-white">
                Critical issues
              </div>
              <p className="mt-3 text-sm leading-7 text-white/85">
                See the biggest blockers affecting clarity, trust, and action.
              </p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="text-lg font-semibold text-white">
                UI improvements
              </div>
              <p className="mt-3 text-sm leading-7 text-white/85">
                Get practical design improvements you can review right away.
              </p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="text-lg font-semibold text-white">
                7 day sprint plan
              </div>
              <p className="mt-3 text-sm leading-7 text-white/85">
                Walk away with focused next steps your team can action this week.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm md:p-6">
            <div className="overflow-hidden rounded-[1.5rem]">
              <Image
                src="/img1.png"
                alt="Elessen Audit Engine visual"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#00a7b9] px-6 pb-20 pt-4 md:px-8 md:pb-28">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/20 bg-white/12 p-8 text-center backdrop-blur-sm md:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Ready to see what you can improve today?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-white/88 md:text-lg md:leading-8">
            Go directly to the audit form and get a focused product audit for
            your website or App Store page.
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
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#0099aa] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:scale-[1.01] hover:bg-[#f7feff]"
            >
              Start your audit
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}