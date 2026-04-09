export default async function AuditInviteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const name = params?.name?.trim() || "there";

  return (
    <div className="mx-auto max-w-2xl py-24 px-6">
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <div className="text-xs tracking-[0.2em] text-black/40 font-semibold">
          ELESSEN AUDIT ENGINE
        </div>

        <h1 className="mt-4 text-2xl font-semibold">
          Hello {name},
        </h1>

        <p className="mt-6 text-sm leading-7 text-black/70">
          Thanks for testing out our Elessen Audit Engine — I’m very excited to have you give it a spin.
          <br /><br />
          Your report is currently being reviewed and you’ll receive the link in your inbox shortly.
          Please keep an eye out for <strong>hello@elessenlabs.com</strong>.
          <br /><br />
          We’d really love your feedback — good or bad.
        </p>

        <div className="mt-8 text-sm text-black/80">
          <div className="font-semibold">— Tanya Emma</div>
          <div className="text-black/50">Founder, Elessen Labs</div>
        </div>
      </div>
    </div>
  );
}