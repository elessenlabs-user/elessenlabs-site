import Link from "next/link";

export default function Start() {
  const calendlyUrl = "https://calendly.com/elessenlabs/product_clarity_call";

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="rounded-3xl border bg-white p-10 md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-medium opacity-70">Start here</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Start your product with clarity, not guesswork.
          </h1>
          <p className="max-w-2xl text-lg opacity-80">
            This is a 30-minute Product Clarity Call. We’ll quickly align on scope, define the core user journey,
            and identify the smallest lovable MVP plan—so your build doesn’t drift or blow budget.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            className="btn-primary"
            href={calendlyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Book the 30-min call
          </a>

          <Link className="btn-secondary" href="/how-we-help">
            See the process first
          </Link>
        </div>

        <div className="mt-6 text-sm opacity-70">
          Prefer to email first?{" "}
          <a className="link" href="mailto:hello@elessenux.com?subject=Project%20inquiry%20—%20Elessen%20Labs">
            hello@elessenux.com
          </a>
        </div>
      </section>

      {/* What you get */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">What you’ll leave with</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <h3 className="font-semibold">A clear MVP scope</h3>
            <p className="mt-2 opacity-80">
              The smallest lovable feature set that actually reaches value.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold">Core user journey</h3>
            <p className="mt-2 opacity-80">
              The key flow(s) your product must nail to convert and retain.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold">Next-step plan</h3>
            <p className="mt-2 opacity-80">
              Exactly what to do next—design sprint, MVP blueprint, or fixes before building.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for / not for */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold">This is for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 opacity-80">
            <li>Founders preparing to build an MVP</li>
            <li>Teams redesigning or restructuring an existing product</li>
            <li>Organizations needing product scope before dev</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold">Not a fit if</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 opacity-80">
            <li>You want a “free consulting” call with no build intent</li>
            <li>You need only a logo/branding engagement</li>
            <li>There’s no timeline or owner for the project</li>
          </ul>
        </div>
      </section>

      {/* Trust strip */}
      <section className="rounded-3xl border bg-white p-8 md:p-10">
        <h2 className="text-xl font-semibold">Trusted experience</h2>
        <p className="mt-2 max-w-3xl opacity-80">
          Experience across PwC, Oliver Wyman, BDO, ENMAX, Revie.Homes, and Club76. Many projects are under NDA—
          we focus on outcomes, decision-making, and execution.
        </p>

        <div className="mt-6">
          <a className="btn-primary" href={calendlyUrl} target="_blank" rel="noreferrer">
            Book the 30-min call
          </a>
        </div>
      </section>
    </div>
  );
}