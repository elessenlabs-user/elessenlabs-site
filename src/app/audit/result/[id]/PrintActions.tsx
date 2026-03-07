"use client";

export default function PrintActions() {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Download PDF
      </button>

      <a
        href="/start"
        className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-100"
      >
        Book another audit
      </a>
    </div>
  );
}