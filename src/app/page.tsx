import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border px-8 py-12 md:px-12 md:py-14 hero-surface">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl hero-glow animate-float" />
        <div className="pointer-events-none absolute inset-0 hero-grain opacity-30" />

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          {/* Left: headline + CTA */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-black/70 backdrop-blur">
              Founder-led studio • Product-first delivery
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              Product design and MVP delivery for teams building real software.
            </h1>

            <p className="mt-5 text-base leading-relaxed opacity-80 md:text-lg">
              Elessen Labs helps founders and organizations clarify scope, design end-to-end flows,
              and ship launch-ready interfaces—fast, structured, and execution-ready.
            </p>

            {/* CTAs (you had removed these accidentally) */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/start" className="btn-primary">
                Start your product
              </Link>

              <Link href="/how-we-help" className="btn-secondary">
                See how we work
              </Link>
            </div>

            {/* Colored pills (keep subtle + differentiated) */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2 py-1 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                You’re building — ship fast
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2 py-1 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                You’re fixing — reduce UX debt
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2 py-1 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                You’re scaling — workflow clarity
              </span>
            </div>

            <div className="mt-8 text-xs opacity-60">
              Trusted by teams at PwC • Oliver Wyman • BDO • ENMAX • Revie.Homes • Club76
            </div>
          </div>

          {/* Right: illustrative preview */}
          <div className="relative">
            <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur app-window">
              {/* window chrome */}
              <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
                {/* macOS dots */}
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>

                {/* window title */}
                <div className="text-[11px] font-medium tracking-wide text-black/50">
                  product-dashboard.elessen
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 opacity-60">
                  <div className="h-2 w-2 rounded-full bg-black/10" />
                  <div className="h-2 w-2 rounded-full bg-black/10" />
                </div>
              </div>

              {/* Delivery preview header (THIS must be inside app-window) */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium opacity-70">
                    Delivery preview (sample screens)
                  </div>
                  <div className="mt-1 text-[11px] opacity-60">
                    Illustrative UI — not live data.
                  </div>
                </div>

                <span className="rounded-full border border-black/10 bg-white/80 px-2 py-1 text-[11px] opacity-70">
                  example
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Booking created</div>
                    <span className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] opacity-70">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      live
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-3/4 rounded-full bg-black/5" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-black/5" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-sm font-semibold">Dashboard</div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="h-10 rounded-xl bg-black/5" />
                      <div className="h-10 rounded-xl bg-black/5" />
                      <div className="h-10 rounded-xl bg-black/5" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-sm font-semibold">Notification</div>
                    <div className="mt-3 rounded-xl bg-black/5 p-3 text-xs opacity-70">
                      “New request received — review details”
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Form submitted</div>
                    <span className="rounded-full bg-black/5 px-2 py-1 text-[11px] opacity-70">
                      100%
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-black/5">
                    <div className="h-2 w-[92%] rounded-full bg-black/20 animate-progress" />
                  </div>
                </div>
              </div>
            </div>

            {/* subtle floating glow behind preview */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] hero-glow opacity-70 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Founder recognition */}
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <div className="text-xs font-medium opacity-70">You’re building</div>
            <h2 className="mt-2 text-lg font-semibold">An MVP that must ship</h2>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              You need fast decisions, tight scope, and UI that developers can build without
              ambiguity.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">You’re fixing</div>
            <h2 className="mt-2 text-lg font-semibold">A product that’s gotten messy</h2>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              Flows are inconsistent, UX debt is stacking, and every change feels like it breaks
              something else.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">You’re scaling</div>
            <h2 className="mt-2 text-lg font-semibold">A platform with real users</h2>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              You need workflow clarity, predictable delivery, and a design partner that thinks in
              systems — not screens.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm opacity-70">If any of these feel familiar, we should talk.</div>

          <div className="flex gap-3">
            <Link href="/start" className="btn-primary">
              Book the 30-min call
            </Link>
            <Link href="/how-we-help" className="btn-secondary">
              View the process
            </Link>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card hover:-translate-y-[2px] transition-transform">
          <h2 className="text-xl font-semibold">For founders & startups</h2>
          <p className="mt-2 opacity-80">
            Turn an idea into a structured MVP—flows, UX architecture, UI, and dev-ready handoff.
          </p>
          <div className="mt-4">
            <Link className="link" href="/start">
              Create a brief →
            </Link>
          </div>
        </div>

        <div className="card hover:-translate-y-[2px] transition-transform">
          <h2 className="text-xl font-semibold">For companies & teams</h2>
          <p className="mt-2 opacity-80">
            Improve existing platforms—workflow clarity, redesigns, UX strategy, and fractional product leadership.
          </p>
          <div className="mt-4">
            <Link className="link" href="/start">
              Discuss a project →
            </Link>
          </div>
        </div>
      </section>

      {/* Process strip */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">A simple, founder-safe process</h2>
            <p className="mt-2 max-w-2xl opacity-80">
              No design theater. Clear decisions, clean execution, and dev-ready output.
            </p>
          </div>

          <Link className="link text-sm" href="/how-we-help">
            View full process →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="card">
            <div className="text-xs font-medium opacity-70">Step 1</div>
            <div className="mt-2 font-semibold">Clarity</div>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              Define scope, constraints, and success metrics. Kill ambiguity early.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">Step 2</div>
            <div className="mt-2 font-semibold">Flows</div>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              Map the experience end-to-end so the product behaves predictably.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">Step 3</div>
            <div className="mt-2 font-semibold">UI system</div>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              Build a cohesive visual language that scales across screens.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">Step 4</div>
            <div className="mt-2 font-semibold">Handoff + support</div>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">
              Dev-ready specs, QA guidance, and fast iteration until it ships.
            </p>
          </div>
        </div>
      </section>

      {/* Proof / Outcomes */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Outcomes we optimize for</h2>
            <p className="mt-2 max-w-2xl opacity-80">
              Less rework. Faster shipping. Higher conversion. A product that feels inevitable.
            </p>
          </div>

          <Link className="link text-sm" href="/experience">
            See experience →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <div className="text-xs font-medium opacity-70">Delivery</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">2–6 weeks</div>
            <p className="mt-3 text-sm opacity-80 leading-relaxed">
              Typical timeline for an MVP UX + UI system + dev-ready handoff.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">Execution</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">1 source of truth</div>
            <p className="mt-3 text-sm opacity-80 leading-relaxed">
              Flows, states, components, and edge cases—documented once, implemented cleanly.
            </p>
          </div>

          <div className="card">
            <div className="text-xs font-medium opacity-70">Quality</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">Fewer cycles</div>
            <p className="mt-3 text-sm opacity-80 leading-relaxed">
              Reduce churn between product/design/dev with structured decisions and constraints.
            </p>
          </div>
        </div>

        <div className="relative rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur ring-1 ring-black/5">
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/40" />
          <div className="grid gap-6 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <div className="text-xs font-medium opacity-70">Trusted by</div>
              <div className="mt-2 text-sm opacity-80 leading-relaxed">
                Teams at <span className="font-medium">PwC</span>, <span className="font-medium">Oliver Wyman</span>,{" "}
                <span className="font-medium">BDO</span>, <span className="font-medium">ENMAX</span>,{" "}
                <span className="font-medium">Revie.Homes</span>, <span className="font-medium">Club76</span>.
              </div>
              <div className="mt-3 text-[11px] opacity-60">
                Logos shown only where usage is permitted.
              </div>
            </div>

            <div className="flex md:justify-end">
              <Link href="/start" className="btn-primary">
                Get a delivery plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we deliver */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-2xl font-semibold">What we deliver</h2>
          <Link className="link text-sm" href="/how-we-help">
            View process →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card hover:-translate-y-[2px] transition-transform">
            <h3 className="font-semibold">MVP blueprint</h3>
            <p className="mt-2 opacity-80">
              Scope, flows, and product structure before development starts.
            </p>
          </div>

          <div className="card hover:-translate-y-[2px] transition-transform">
            <h3 className="font-semibold">UX/UI design</h3>
            <p className="mt-2 opacity-80">
              End-to-end experience design with dev-ready handoff.
            </p>
          </div>

          <div className="card hover:-translate-y-[2px] transition-transform">
            <h3 className="font-semibold">Launch support</h3>
            <p className="mt-2 opacity-80">
              Sprint guidance, QA, and product decisions through release.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-black/10 bg-white p-10 md:p-12">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Ready to move?</h2>
            <p className="max-w-xl opacity-80">
              Book a 30-minute Product Clarity Call. You’ll leave with a concrete next step—MVP plan,
              redesign direction, or confirmation of what to fix first.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link href="/start" className="btn-primary">
              Book the 30-min call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}