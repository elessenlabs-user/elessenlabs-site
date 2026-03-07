import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

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

function Section({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <details className="mb-6 rounded-2xl border border-black/10 bg-white shadow-sm" open>
      <summary className="cursor-pointer px-6 py-4 text-lg font-semibold">
        {title}
      </summary>

      <div className="px-6 pb-6 pt-2 prose prose-lg max-w-none prose-p:text-gray-700 prose-strong:text-black prose-li:marker:text-black">
        <ReactMarkdown>{content}</ReactMarkdown>
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
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
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
    </main>
  );
}