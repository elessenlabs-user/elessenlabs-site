"use client";

export default function PrintActions() {
  const handlePrint = () => {
    const sections = Array.from(document.querySelectorAll("details"));

    const prev = sections.map((el) => el.hasAttribute("open"));

    sections.forEach((el) => el.setAttribute("open", ""));

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        sections.forEach((el, i) => {
          if (!prev[i]) el.removeAttribute("open");
        });
      }, 300);
    }, 50);
  };

  return (
    <div className="mt-6 flex gap-3 print-hide">
      <button onClick={handlePrint} className="btn-primary">
        Download PDF
      </button>

      <a
  href="/audit"
  className="inline-flex items-center justify-center rounded-2xl bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
>
  Start a New Audit
</a>
    </div>
  );
}