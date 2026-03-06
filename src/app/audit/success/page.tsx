export default function AuditSuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
        <div className="text-sm font-semibold tracking-[0.18em] text-black/50">
          PAYMENT RECEIVED
        </div>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Your UX audit request is confirmed
        </h1>

        <p className="mt-4 text-lg text-black/70">
          Thank you — we’ve received your payment and your audit request is now in queue.
        </p>

        <div className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
          <div className="text-sm font-semibold">What happens next</div>
          <ul className="mt-3 space-y-2 text-sm text-black/70">
            <li>• We review your submitted website or product link</li>
            <li>• We generate your UX Conversion Blueprint</li>
            <li>• You’ll receive your audit within 24 hours</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-black/55">
          You’ll receive a confirmation email shortly. Your audit will be delivered within 24 hours.
        </p>

        <div className="mt-6 flex gap-4">
          <a
            href="/audit"
            className="rounded-lg bg-[#F97316] px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Submit another audit
          </a>

          <a
  href="/"
  className="rounded-lg px-6 py-3 transition hover:bg-neutral-800"
  style={{
    backgroundColor: "#000000",
    color: "#ffffff",
    textDecoration: "none",
    display: "inline-block",
     }}
    >
        Return to Elessen
    </a>
        </div>
      </div>
    </main>
  );
}