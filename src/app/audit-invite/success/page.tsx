export default async function AuditInviteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const name = params?.name?.trim() || "there";

  return (
    <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-24">
<div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-orange-200 bg-white p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-14 soft-orange-border">        <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-orange-100" />

        <div className="mx-auto inline-flex items-center rounded-full border border-orange-200 bg-[#FFF8F2] px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#FF7A00] shadow-sm">
          ELESSEN AUDIT ENGINE™
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-black md:text-4xl">
          Hello {name},
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-black/70 md:text-[17px]">
          Thank you for trying the Elessen Audit Engine. Your report is now being
          reviewed and will be sent to your inbox shortly.
          <br />
          <br />
          Please keep an eye out for <strong>hello@elessenlabs.com</strong>.
          Your delivery email will include your report link, along with a feedback
          link we’d really appreciate you taking a moment to complete.
        </p>

        <div className="mt-10 text-[15px] text-black/80">
          <div className="font-semibold">— Tanya Emma</div>
          <div className="text-black/50">Founder, Elessen Labs</div>
        </div>
      </div>
    </div>
  );
}