import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

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

  if (error) {
    console.error("Audit fetch error:", error);
  }

  if (!data || !data.audit_content) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-semibold">Audit not found</h1>
          <p className="mt-3 text-black/60">
            No audit content exists yet for this ID.
          </p>
          <p className="mt-2 break-all text-sm text-black/40">ID: {id}</p>
          {error && (
            <pre className="mt-6 overflow-auto rounded-2xl bg-black/5 p-4 text-xs text-red-700">
              {JSON.stringify(error, null, 2)}
            </pre>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
        <main className="mx-auto max-w-4xl px-6 py-16">
  <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
    <div className="mb-10 border-b border-black/10 pb-6">
      <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
        UX CONVERSION BLUEPRINT
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Audit for {data.full_name || "Client"}
      </h1>

      <div className="mt-4 space-y-1 text-sm text-black/60">
        <div><strong className="text-black/75">Product:</strong> {data.product_url}</div>
        <div><strong className="text-black/75">Status:</strong> {data.payment_status}</div>
        {data.completed_at && (
          <div><strong className="text-black/75">Generated:</strong> {data.completed_at}</div>
        )}
      </div>
    </div>

    <article
      className="prose prose-lg max-w-none
      prose-h1:text-3xl
      prose-h2:text-2xl
      prose-h3:text-xl
      prose-p:text-gray-700
      prose-strong:text-black
      prose-table:border
      prose-th:bg-gray-100
      prose-td:border
      prose-li:marker:text-black"
    >
      <ReactMarkdown>{data.audit_content}</ReactMarkdown>
    </article>
  </div>
</main>

        <article className="prose prose-lg max-w-none
        prose-h1:text-3xl
        prose-h2:text-2xl
        prose-h3:text-xl
        prose-p:text-gray-700
        prose-strong:text-black
        prose-table:border
        prose-th:bg-gray-100
        prose-td:border
        prose-li:marker:text-black">
            <ReactMarkdown>{data.audit_content}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}