"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuditFeedbackPage() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id") || "";

  const [feedback, setFeedback] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ auditId, feedback, testimonial }),
      });

      setSubmitted(true);
    } catch {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <div className="p-10">Thank you — feedback submitted.</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-xl font-semibold mb-4">Feedback</h1>

      <textarea
        className="border p-3 w-full mb-4"
        placeholder="Your feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <textarea
        className="border p-3 w-full mb-4"
        placeholder="Testimonial"
        value={testimonial}
        onChange={(e) => setTestimonial(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-orange-500 text-white px-6 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}