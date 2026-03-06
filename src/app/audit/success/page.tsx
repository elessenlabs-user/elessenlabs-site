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
          A confirmation email and delivery flow will be connected next.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Back to homepage
        </a>
      </div>
    </main>
  );
}