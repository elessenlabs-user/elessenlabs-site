import { createClient } from "@supabase/supabase-js"
import ReactMarkdown from "react-markdown"

export default async function AuditResult({ params }: any) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from("audit_requests")
    .select("audit_content, product_url, full_name")
    .eq("id", params.id)
    .single()

  if (!data) {
    return <div>Audit not found</div>
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">

      <h1 className="text-3xl font-semibold mb-6">
        UX Conversion Audit
      </h1>

      <div className="prose prose-neutral max-w-none">
        <ReactMarkdown>
          {data.audit_content}
        </ReactMarkdown>
      </div>

    </main>
  )
}