"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 mt-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition ${
            star <= value ? "text-[#FF7A00]" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function AuditFeedbackPage() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id") || "";

  const [name, setName] = useState<string>("there");

  const [rating, setRating] = useState(0);
  const [valueClarity, setValueClarity] = useState("");
  const [tailored, setTailored] = useState("");
  const [trustIssue, setTrustIssue] = useState("");
  const [mostValuable, setMostValuable] = useState("");
  const [wouldUse, setWouldUse] = useState("");
  const [recommend, setRecommend] = useState("");
  const [feedback, setFeedback] = useState("");
  const [testimonial, setTestimonial] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Fetch name (backend if available)
  useEffect(() => {
    async function fetchName() {
      if (!auditId) return;

      try {
        const res = await fetch(`/api/audit/meta?id=${auditId}`);
        const data = await res.json();
        if (data?.name) setName(data.name);
      } catch {}
    }

    fetchName();
  }, [auditId]);

  // Fallback from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get("name");
    if (urlName) setName(decodeURIComponent(urlName));
  }, []);

  const canSubmit =
    rating > 0 &&
    trustIssue.trim() &&
    mostValuable.trim() &&
    testimonial.trim() &&
    !submitting;

  async function handleSubmit() {
    setError("");

    if (!canSubmit) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auditId,
          rating,
          valueClarity,
          tailored,
          trustIssue,
          mostValuable,
          wouldUse,
          recommend,
          feedback,
          testimonial,
        }),
      });

      if (!res.ok) {
        setError("Failed to submit feedback.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong.");
      setSubmitting(false);
    }
  }

  // SUCCESS STATE
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
          <h2 className="text-xl font-semibold">Thank you, {name}</h2>
          <p className="mt-2 text-sm text-black/65">
            Your feedback will directly shape how we improve the audit engine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">

        {/* HEADER */}
        <div className="mb-10">
          <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00] shadow-sm">
            ELESSEN AUDIT ENGINE
          </div>

          <h1 className="mt-4 text-3xl font-semibold">
            Hey {name},
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-black/65 max-w-xl">
            Thank you for being part of the Elessen Audit Engine.
            Your feedback helps us refine and elevate this product.
          </p>
        </div>

        {/* RATING */}
        <div className="mb-8">
          <label className="text-sm font-semibold">
            How would you rate your audit? <span className="text-red-500">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* VALUE */}
        <div className="mb-8">
          <label className="text-sm font-semibold">
            Did the audit help you identify meaningful improvements?
          </label>
          <select
            value={valueClarity}
            onChange={(e) => setValueClarity(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="somewhat">Somewhat</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* TRUST */}
        <div className="mb-8">
          <label className="text-sm font-semibold">
            What felt unclear or inaccurate? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={trustIssue}
            onChange={(e) => setTrustIssue(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </div>

        {/* VALUE PART */}
        <div className="mb-8">
          <label className="text-sm font-semibold">
            What was the most valuable part? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={mostValuable}
            onChange={(e) => setMostValuable(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </div>

        {/* TESTIMONIAL */}
        <div className="mb-8">
          <label className="text-sm font-semibold">
            Write a testimonial <span className="text-red-500">*</span>
          </label>
          <textarea
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </div>

        {error && (
          <div className="mb-6 text-red-600 text-sm">{error}</div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-2xl px-8 py-4 font-semibold text-white ${
            canSubmit
              ? "bg-[#FF7A00]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}