import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import PrintActions from "./PrintActions";

export const dynamic = "force-dynamic";

function splitSections(markdown: string) {
  return markdown
    .split(/(?=## )/g)
    .map((section) => {
      const match = section.match(/^##\s+(.*)/);
      return {
        title: match ? match[1].trim() : "Section",
        content: section.replace(/^##\s+.*\n?/, "").trim(),
      };
    })
    .filter((s) => s.content);
}

function parseBulletCards(content: string) {
  return content
    .split(/\n(?=- )/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const clean = item.replace(/^- /, "").trim();

      let icon = "•";
      if (/copy|headline|cta|messaging/i.test(clean)) icon = "✍️";
      else if (/ui|layout|design|hierarchy|spacing|navigation/i.test(clean)) icon = "🎨";
      else if (/conversion|pricing|email|form|capture|impact/i.test(clean)) icon = "📈";
      else if (/seo|meta|search|keyword/i.test(clean)) icon = "🔎";
      else if (/sprint|day/i.test(clean)) icon = "🗓️";
      else if (/critical|issue|severity/i.test(clean)) icon = "🚨";

      return { icon, text: clean };
    });
}

function computeAuditScore(auditContent: string) {
  let score = 78;

  if (/no email capture|no forms|no input/i.test(auditContent)) score -= 10;
  if (/no pricing|unclear pricing/i.test(auditContent)) score -= 10;
  if (/weak cta|vague cta|not prominent/i.test(auditContent)) score -= 8;
  if (/poor navigation|minimal links|no sticky nav/i.test(auditContent)) score -= 6;
  if (/no trust signals|no testimonials|no social proof/i.test(auditContent)) score -= 8;

  if (score < 35) score = 35;
  if (score > 95) score = 95;

  if (score >= 75) return { score, label: "Strong base" };
  if (score >= 60) return { score, label: "Needs improvement" };
  return { score, label: "High priority fixes" };
}

function Section({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const isCritical = title.toLowerCase().includes("critical");
  const isCardSection =
    /critical|conversion|ui|copy|seo|sprint|question/i.test(title);

  const cards = parseBulletCards(content);

  return (
    <details
      className={`mb-6 rounded-2xl border bg-white shadow-sm ${
        isCritical ? "border-red-200 ring-1 ring-red-100" : "border-black/10"
      }`}
      open={isCritical}
    >
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-semibold list-none">
        <div className="flex items-center gap-3">
          {isCritical && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-200">
              Priority
            </span>
          )}
          <span>{title}</span>
        </div>

        {isCritical && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        )}
      </summary>

      <div className="px-6 pb-6 pt-2">
        {isCardSection ? (
          <div className="grid gap-3">
            {cards.map((card, index) => (
              <div
                key={index}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="text-lg">{card.icon}</div>
                  <div className="text-sm leading-6 text-black/75">{card.text}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-lg max-w-none prose-p:leading-7 prose-p:text-gray-700 prose-strong:text-black prose-li:marker:text-black prose-ul:space-y-2">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </details>
  );
}

export default async function AuditResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("audit_requests")
    .select("id, full_name, product_url, payment_status, audit_content, completed_at")
    .eq("id", id)
    .single();

  if (error || !data || !data.audit_content) {
    return (
      <main className="mx-auto max-w-5xl px-10 py-24">
        <div className="rounded-3xl border border-black/10 bg-white p-14 shadow-sm">
          <h1 className="text-2xl font-semibold">Audit not found</h1>
          <p className="mt-3 text-black/60">
            No audit content exists yet for this ID.
          </p>
          <p className="mt-2 break-all text-sm text-black/40">ID: {id}</p>
        </div>
      </main>
    );
  }

  const sections = splitSections(data.audit_content);
  const auditScore = computeAuditScore(data.audit_content || "");

  return (
    <main className="mx-auto max-w-7xl px-10 py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
        <div className="mb-10 border-b border-black/10 pb-6">
          <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
            UX CONVERSION BLUEPRINT
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Audit for {data.full_name || "Client"}
          </h1>

          <div className="mt-4 space-y-1 text-sm text-black/60">
            <div>
              <strong className="text-black/75">Product:</strong> {data.product_url}
            </div>
            <div>
              <strong className="text-black/75">Status:</strong> {data.payment_status}
            </div>
            {data.completed_at && (
              <div>
                <strong className="text-black/75">Generated:</strong> {data.completed_at}
              </div>
            )}
          </div>
          {/* PRINT + ACTION BUTTONS */}
          <PrintActions />
        </div>

      <div className="mb-10 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-black/10 p-5">
          <div className="text-xs uppercase tracking-wide text-black/45">Audit Score</div>
          <div className="mt-2 text-3xl font-semibold">{auditScore.score}</div>
          <div className="mt-1 text-sm text-black/55">{auditScore.label}</div>
        </div>

     <div className="rounded-2xl border border-black/10 p-5">
        <div className="text-xs uppercase tracking-wide text-black/45">Audit Type</div>
        <div className="mt-2 text-lg font-semibold">UX Conversion Audit</div>
    </div>

    <div className="rounded-2xl border border-black/10 p-5">
        <div className="text-xs uppercase tracking-wide text-black/45">Status</div>
        <div className="mt-2 text-lg font-semibold">{data.payment_status}</div>
    </div>

    <div className="rounded-2xl border border-black/10 p-5">
        <div className="text-xs uppercase tracking-wide text-black/45">Report Format</div>
        <div className="mt-2 text-lg font-semibold">Structured Review</div>
    </div>
</div>

        {sections.map((section, index) => (
          <Section key={index} title={section.title} content={section.content} />
        ))}
    </div>

    <div className="mt-10 rounded-3xl border border-orange-200 bg-[#FF7A00] p-8 text-black shadow-lg">
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
      NEXT STEP
    </div>

    <h2 className="mt-3 text-2xl font-semibold text-black">
    Want Elessen to fix these issues for you?
    </h2>

    <p className="mt-3 max-w-2xl text-sm leading-6 text-black/75">
      Turn this audit into an execution plan. We can help refine the UX,
      improve conversion, tighten the messaging, and turn the highest-impact
      recommendations into a practical sprint.
    </p>

    <div className="mt-6 flex flex-wrap gap-3">
      <a
        href="mailto:hello@elessenlabs.com?subject=Need%20Implementation%20Support"
        className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-100"
      >
        Contact us for implementation
      </a>

      <a
        href="/how-we-help"
        className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Explore implementation support
      </a>
    </div>
</div>
    </main>
  );
}