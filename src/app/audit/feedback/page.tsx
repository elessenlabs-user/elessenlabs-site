export const dynamic = "force-dynamic";

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuditFeedbackPage() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id") || "";

  const [wouldUse, setWouldUse] = useState("");
  const [helpful, setHelpful] = useState("");
  const [shareTeam, setShareTeam] = useState("");
  const [sprintHelpful, setSprintHelpful] = useState("");
  const [feedback, setFeedback] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    wouldUse &&
    helpful &&
    shareTeam &&
    sprintHelpful &&
    feedback.trim().length > 0 &&
    testimonial.trim().length > 0 &&
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
          wouldUse,
          helpful,
          shareTeam,
          sprintHelpful,
          feedback,
          testimonial,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to submit feedback.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
            ELESSEN AUDIT ENGINE
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Thank you</h1>
          <p className="mt-3 text-sm leading-7 text-black/65">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF9F4] p-8 shadow-sm">
        <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00] shadow-sm">
          ELESSEN AUDIT ENGINE
        </div>

        <h1 className="mt-3 text-2xl font-semibold">Quick Feedback</h1>
        <p className="mt-3 text-sm leading-6 text-black/65">
          We’d really value your feedback on the audit.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium">Would you use this tool? *</label>
            <select
              value={wouldUse}
              onChange={(e) => setWouldUse(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Did you find it helpful? *</label>
            <select
              value={helpful}
              onChange={(e) => setHelpful(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="somewhat">Somewhat</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Would you share the findings with your team? *</label>
            <select
              value={shareTeam}
              onChange={(e) => setShareTeam(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Was the sprint plan helpful? *</label>
            <select
              value={sprintHelpful}
              onChange={(e) => setSprintHelpful(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="somewhat">Somewhat</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Feedback *</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
              placeholder="Tell us what worked well and what should improve."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Testimonial *</label>
            <textarea
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
              placeholder="Write a short testimonial about your experience."
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`rounded-2xl px-8 py-3 font-semibold text-white ${
                canSubmit
                  ? "bg-[#FF7A00] hover:brightness-95"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}