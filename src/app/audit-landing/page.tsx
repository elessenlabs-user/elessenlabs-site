"use client";

import Link from "next/link";
import { trackEvent } from "../../lib/analytics";
import { useEffect, useState } from "react";

function RotatingAuditText() {
  const messages = [
    "Discover critical issues",
    "Get UI improvements",
    "Spot where users drop off",
    "Find actions you can take today",
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
    <div className="min-h-[88px] text-2xl font-semibold leading-tight tracking-tight text-white md:min-h-[120px] md:text-5xl">
      {messages[index]}
    </div>
  );
}

export default function AuditLandingPage() {
  return (
    <main className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] min-h-screen w-screen overflow-x-hidden bg-[#00a7b9] text-white">
      {/* FULL PAGE BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* fallback static layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/background 2.png')" }}
        />

        {/* secondary image blend */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-screen"
          style={{ backgroundImage: "url('/img1.png')" }}
        />

        {/* video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/background 2.png"
          className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* readability overlays */}
        <div className="absolute inset-0 bg-[#00a7b9]/55" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a7b9]/35 via-[#009fb1]/30 to-[#007e8c]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_18%)]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen">
        <section className="flex min-h-screen items-start pt-6 md:pt-10">
          <div className="w-full px-6 pt-0 pb-16 md:px-10 lg:px-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.22em] text-white/95 backdrop-blur-sm">
                ELESSEN AUDIT ENGINE™
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.22)] md:text-6xl lg:text-7xl">
                Get Product Audit
                <br />
                for App Store
                <br />
                and Website
              </h1>

              <div className="mt-6 max-w-3xl">
                <RotatingAuditText />
              </div>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/95 md:text-xl md:leading-8">
                Your time is precious, find things you can action today, with our
                7 day sprint plan included in your report.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                Designer-led, AI-supported audits that highlight what needs
                attention now — clearly, quickly, and in a format you can use
                immediately.
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
    className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 font-semibold text-black shadow-lg transition hover:opacity-90"
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
    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
  >
    See what’s included
  </a>
</div>
</div>
</div>
</section>

<section id="what-you-get" className="relative z-10 px-6 pb-16 md:px-10 lg:px-16">
  <div className="max-w-6xl">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <div className="text-lg font-semibold text-white">Critical issues</div>
        <p className="mt-3 text-sm leading-7 text-white/85">
          See the biggest blockers affecting clarity, trust, and action.
        </p>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <div className="text-lg font-semibold text-white">UI improvements</div>
        <p className="mt-3 text-sm leading-7 text-white/85">
          Get practical design improvements you can review right away.
        </p>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <div className="text-lg font-semibold text-white">7 day sprint plan</div>
        <p className="mt-3 text-sm leading-7 text-white/85">
          Walk away with focused next steps your team can action this week.
        </p>
      </div>
    </div>

    <div className="mt-10">
      <Link
        href="/audit#audit-form"
        onClick={() =>
          trackEvent("audit_landing_final_cta", {
            page: "audit-landing",
            location: "final",
          })
        }
        className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#00a7b9] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:scale-[1.01] hover:bg-[#f7feff]"
      >
        Start your audit
      </Link>
    </div>
  </div>
</section>
</div>
</main>
  );
}
                     