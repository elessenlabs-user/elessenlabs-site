import Link from "next/link";

export default async function AuditSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ audit_id?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const auditId = resolvedSearchParams?.audit_id || "";

  return (
    <main className="mx-auto max-w-4xl px-10 py-20">
      <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
          PAYMENT RECEIVED
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-black">
          Your audit is now in review
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/65">
          Thank you. Your payment has been received and your Elessen Audit Engine™
          report is now being reviewed by Elessen before delivery.
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/65">
          This helps us make sure the final output is clear, useful, and ready
          for action. Delivery can take up to 24 hours, although it is often
          completed sooner.
        </p>

        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm leading-6 text-black/75">
          We will send your completed audit to the email address you provided.
          If you need any help in the meantime, contact us at{" "}
          <a
            href="mailto:hello@elessenlabs.com"
            className="font-medium text-black underline underline-offset-4"
          >
            hello@elessenlabs.com
          </a>
          .
        </div>

        {auditId ? (
          <div className="mt-6 text-sm text-black/55">
            Audit reference:{" "}
            <span className="font-medium text-black">{auditId}</span>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {auditId ? (
            <Link
              href={`/audit/result/${auditId}`}
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-black/[0.03]"
            >
              Return to preview
            </Link>
          ) : null}

          <a
            href="mailto:hello@elessenlabs.com?subject=Question%20about%20my%20audit"
            className="inline-flex items-center justify-center rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Contact Elessen
          </a>
        </div>
      </div>
    </main>
  );
}