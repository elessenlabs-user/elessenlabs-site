export default async function AuditInviteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const name = params?.name?.trim() || "there";

  return (
    <div className="mx-auto max-w-3xl py-20 px-6">
      <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF9F4] p-8 shadow-sm md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white to-gray-50" />

        <div className="relative text-center">
          <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00] shadow-sm">
            ELESSEN AUDIT ENGINE
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
            Hey {name}, thanks for testing out our Elessen Audit Engine
          </h1>

          <p className="mt-4 text-sm leading-7 text-black/65">
            I’m very excited to have you give it a spin.
          </p>

          <p className="mt-2 text-sm leading-7 text-black/65">
            Your report is being reviewed and the link will be in your inbox shortly.
            Please keep an eye out for <span className="font-semibold">hello@elessenlabs.com</span>.
          </p>

          <p className="mt-2 text-sm leading-7 text-black/65">
            We’re excited for you to give us your feedback — good or bad. 
            Best,
            Tanya Emma Elessen - Founder, Elessen Labs
          </p>
        </div>
      </section>
    </div>
  );
}