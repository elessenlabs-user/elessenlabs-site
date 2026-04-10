"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

/* ---------- STAR COMPONENT ---------- */
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
          className={`text-2xl ${
            star <= value ? "text-[#FF7A00]" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ---------- MAIN ---------- */
export default function AuditFeedbackPage() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id") || "";
  const urlName = searchParams.get("name") || "";

  const [name, setName] = useState("there");

  // SECTION STATES
  const [rating, setRating] = useState(0);
  const [meaningfulImprovements, setMeaningfulImprovements] = useState("");
  const [tailoredToProduct, setTailoredToProduct] = useState("");
  const [unclearOrInaccurate, setUnclearOrInaccurate] = useState("");
  const [mostValuablePart, setMostValuablePart] = useState("");
  const [wouldUseAgain, setWouldUseAgain] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState("");
  const [perceivedValue, setPerceivedValue] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [referrals, setReferrals] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  /* ---------- NAME LOGIC ---------- */
  useEffect(() => {
    if (urlName) {
      setName(decodeURIComponent(urlName));
    }
  }, [urlName]);

  /* ---------- VALIDATION ---------- */
  const canSubmit =
    rating > 0 &&
    unclearOrInaccurate.trim() &&
    mostValuablePart.trim() &&
    testimonial.trim() &&
    !submitting;

  /* ---------- SUBMIT ---------- */
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
          meaningfulImprovements,
          tailoredToProduct,
          unclearOrInaccurate,
          mostValuablePart,
          wouldUseAgain,
          wouldRecommend,
          perceivedValue,
          testimonial,
          referrals,
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

  /* ---------- SUCCESS ---------- */
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
          <h2 className="text-xl font-semibold">
            Thank you, {name}
          </h2>
          <p className="mt-2 text-sm text-black/65">
            Your feedback is helping us refine and elevate the Elessen Audit Engine.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">

        {/* HEADER */}
        <div className="mb-10">
          <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00]">
            ELESSEN AUDIT ENGINE
          </div>

          <h1 className="mt-4 text-3xl font-semibold">
            Hey there, {name}
          </h1>

          <p className="mt-3 text-[15px] text-black/65 max-w-xl">
            Thank you for being part of the Elessen Audit Engine.
            Your feedback helps us refine and elevate this product.
          </p>
        </div>

        {/* SECTION 1 */}
        <div className="mb-8">
          <label className="font-semibold">
            How would you rate your audit? *
          </label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* SECTION 2 */}
        <div className="mb-6">
          <label>Did this audit help you identify meaningful improvements?</label>
          <select onChange={(e) => setMeaningfulImprovements(e.target.value)} className="mt-2 w-full border rounded-xl p-3">
            <option value="">Select</option>
            <option>Yes</option>
            <option>Somewhat</option>
            <option>No</option>
          </select>
        </div>

        <div className="mb-8">
          <label>Did the recommendations feel tailored to your product?</label>
          <select onChange={(e) => setTailoredToProduct(e.target.value)} className="mt-2 w-full border rounded-xl p-3">
            <option value="">Select</option>
            <option>Yes</option>
            <option>Somewhat</option>
            <option>No</option>
          </select>
        </div>

        {/* SECTION 3 */}
        <div className="mb-8">
          <label className="font-semibold">
            What felt unclear, generic, or inaccurate? *
          </label>
          <textarea
            onChange={(e) => setUnclearOrInaccurate(e.target.value)}
            className="mt-2 w-full border rounded-xl p-3"
          />
        </div>

        {/* SECTION 4 */}
        <div className="mb-8">
          <label className="font-semibold">
            What was the most valuable part of the audit? *
          </label>
          <textarea
            onChange={(e) => setMostValuablePart(e.target.value)}
            className="mt-2 w-full border rounded-xl p-3"
          />
        </div>

        {/* SECTION 5 */}
        <div className="mb-6">
          <label>Would you use this again?</label>
          <select onChange={(e) => setWouldUseAgain(e.target.value)} className="mt-2 w-full border rounded-xl p-3">
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
            <option>Maybe</option>
          </select>
        </div>

        <div className="mb-8">
          <label>Would you recommend this?</label>
          <select onChange={(e) => setWouldRecommend(e.target.value)} className="mt-2 w-full border rounded-xl p-3">
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
            <option>Maybe</option>
          </select>
        </div>

        {/* SECTION 6 */}
        <div className="mb-8">
          <label>
            This audit combines automated analysis with expert validation. How valuable does this feel?
          </label>
          <select onChange={(e) => setPerceivedValue(e.target.value)} className="mt-2 w-full border rounded-xl p-3">
            <option value="">Select</option>
            <option>Very valuable</option>
            <option>Moderately valuable</option>
            <option>Not valuable</option>
          </select>
        </div>

        {/* SECTION 7 */}
        <div className="mb-8">
          <label className="font-semibold">
            Write a testimonial *
          </label>
          <textarea
            placeholder="1–2 sentences about your experience"
            onChange={(e) => setTestimonial(e.target.value)}
            className="mt-2 w-full border rounded-xl p-3"
          />
        </div>

        {/* SECTION 8 */}
        <div className="mb-8">
          <label>
            Invite 2 founders and we’ll send you an new audit code. (optional)
          </label>
          <input
            placeholder="email1, email2"
            onChange={(e) => setReferrals(e.target.value)}
            className="mt-2 w-full border rounded-xl p-3"
          />
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl text-white font-semibold ${
            canSubmit ? "bg-[#FF7A00]" : "bg-gray-400"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}