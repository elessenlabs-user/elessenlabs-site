"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string | number;
      reset?: (widgetId?: string | number) => void;
      remove?: (widgetId?: string | number) => void;
    };
  }
}

type ProductType = "Mobile App" | "Website" | "Web Platform" | "SaaS Tool" | "Marketplace" | "AI Product" | "Not sure yet";

type Stage =
  | "Idea → need a clear MVP"
  | "Prototype exists → need UX/UI + plan"
  | "Already building → need design + build alignment"
  | "Live product → need improvements + growth"
  | "Not sure";

type Timeline = "ASAP" | "1–3 months" | "3–6 months" | "6+ months" | "Not sure";
type Budget = "Exploring ($0–$2k)" | "Starter ($2k–$7k)" | "Growth ($7k–$20k)" | "Serious ($20k+)";

type FormData = {
  fullName: string;
  email: string;
  company: string;
  productType: ProductType | "";
  stage: Stage | "";
  timeline: Timeline | "";
  budget: Budget | "";
  goal: string;
  details: string;
};

type FieldKey = keyof FormData;

const CALENDLY_URL = "https://calendly.com/elessenlabs/product_clarity_call";

const STEPS = 6;

const STEP_COLORS = [
  "bg-indigo-600", // step 1
  "bg-emerald-600", // step 2
  "bg-violet-600", // step 3
  "bg-sky-600", // step 4
  "bg-amber-600", // step 5
  "bg-black", // step 6
];

function isValidEmail(email: string) {
  // simple but strict-enough for UX: requires one @, domain, and a dot TLD
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

function minLen(s: string, n: number) {
  return s.trim().length >= n;
}

function buildRecommendation(data: FormData) {
  // Keep it deterministic + explainable (no “AI magic” yet)
  // You can expand these rules later.
  const { stage, timeline, budget, productType } = data;

  const fast = timeline === "ASAP" || timeline === "1–3 months";
  const lowBudget = budget === "Exploring ($0–$2k)";
  const midBudget = budget === "Starter ($2k–$7k)" || budget === "Growth ($7k–$20k)";
  const highBudget = budget === "Serious ($20k+)";
  const live = stage === "Live product → need improvements + growth";
  const early = stage === "Idea → need a clear MVP" || stage === "Prototype exists → need UX/UI + plan";

  // Default
  let title = "Product Clarity Sprint";
  let subtitle = "A short call + a clear plan for the next 30 days.";
  let why: string[] = [
    "You’ll get a realistic next step based on budget + timeline",
    "We’ll cut scope creep by defining what matters first",
    "You leave with a plan your team can execute",
  ];
  let next: string[] = ["15-min call", "Follow-up summary with next steps", "Optional roadmap + estimate"];

  if (lowBudget || timeline === "6+ months") {
    title = "MVP Blueprint (Prep for Build)";
    subtitle = "Best if you’re exploring or planning ahead and want clarity before spending.";
    why = [
      "You’ll avoid overbuilding by choosing the smallest viable v1",
      "You’ll clarify scope + priorities before hiring/quoting",
      "You’ll know what to do next even if you wait to build",
    ];
    next = ["MVP outline", "Feature prioritization", "Next-step checklist"];
  } else if (early && fast && midBudget) {
    title = "MVP Blueprint + UI System";
    subtitle = "Best if you need something buildable—fast, structured, dev-ready.";
    why = [
      "Define MVP scope (no fluff) + edge cases",
      "Map key flows end-to-end so behavior is predictable",
      "Design a clean UI system your devs can implement",
    ];
    next = ["MVP flow map + screen list", "UI components/system", "Dev-ready handoff + acceptance criteria"];
  } else if ((live && fast) || (highBudget && fast)) {
    title = "Build Sprint (MVP Delivery)";
    subtitle = "Best if you’re ready to move quickly and ship a real v1.";
    why = [
      "You need momentum and a tight shipping plan",
      "We reduce scope creep by locking priority features",
      "We align design + build so delivery doesn’t stall",
    ];
    next = ["Sprint plan + milestones", "Delivery-ready scope", "Weekly check-ins (optional)"];
  }

  // Light personalization by product type (small detail only)
  const productNote =
    productType === "Mobile App"
      ? "Mobile UX patterns + onboarding matter most."
      : productType === "Marketplace"
      ? "Supply + demand flows need extra clarity."
      : productType === "AI Product"
      ? "We’ll define the human-in-the-loop + guardrails early."
      : "";

  return { title, subtitle, why, next, productNote };
}

export default function StartPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [step, setStep] = useState(1);

  const [data, setData] = useState<FormData>({
    fullName: "",
    email: "",
    company: "",
    productType: "",
    stage: "",
    timeline: "",
    budget: "",
    goal: "",
    details: "",
  });

  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Turnstile
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const progressPct = Math.round((step / STEPS) * 100);
  const barColor = STEP_COLORS[Math.max(0, Math.min(STEP_COLORS.length - 1, step - 1))];

  const recommendation = useMemo(() => buildRecommendation(data), [data]);

  function setField<K extends FieldKey>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    // clear status on change
    if (status) setStatus("");
  }

  function validateField(key: FieldKey, value: FormData[FieldKey]): string {
    switch (key) {
      case "fullName":
        if (!minLen(String(value), 3)) return "Please enter at least 3 characters.";
        return "";
      case "email":
        if (!isValidEmail(String(value))) return "Please enter a valid email (e.g., name@company.com).";
        return "";
      case "company":
        if (!minLen(String(value), 2)) return "Please enter your company/startup name.";
        return "";
      case "productType":
        if (!String(value)) return "Please choose what you’re building.";
        return "";
      case "stage":
        if (!String(value)) return "Please choose a stage.";
        return "";
      case "timeline":
        if (!String(value)) return "Please choose a timeline.";
        return "";
      case "budget":
        if (!String(value)) return "Please select a budget.";
        return "";
      case "goal":
        if (!minLen(String(value), 8)) return "Please add a bit more detail (min 8 characters).";
        return "";
      case "details":
        if (!minLen(String(value), 10)) return "Please add a bit more detail (min 10 characters).";
        return "";
      default:
        return "";
    }
  }

  function markTouched(keys: FieldKey[]) {
    setTouched((prev) => {
      const next = { ...prev };
      for (const k of keys) next[k] = true;
      return next;
    });
  }

  function validateStep(currentStep: number): boolean {
    const stepFields: Record<number, FieldKey[]> = {
      1: ["fullName", "email", "company"],
      2: ["productType"],
      3: ["stage", "timeline", "budget"],
      4: ["goal"],
      5: ["details"],
      6: [], // final card + turnstile gating
    };

    const fields = stepFields[currentStep] ?? [];
    markTouched(fields);

    const nextErrors: Partial<Record<FieldKey, string>> = { ...errors };
    let ok = true;

    for (const f of fields) {
      const msg = validateField(f, data[f]);
      if (msg) ok = false;
      nextErrors[f] = msg;
    }

    setErrors(nextErrors);
    return ok;
  }

  function onContinue() {
    setStatus("");
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS, s + 1));
  }

  function onBack() {
    setStatus("");
    setStep((s) => Math.max(1, s - 1));
  }

  // ---------- TURNSTILE: mount correctly in React ----------
  useEffect(() => {
    // Only render on final step
    if (step !== 6) return;

    // need site key
    if (!siteKey) return;

    // Need container
    const el = turnstileContainerRef.current;
    if (!el) return;

    // If already rendered, don't render again
    if (turnstileWidgetIdRef.current != null) return;

    // Wait for script + window.turnstile
    const tryRender = () => {
      if (!window.turnstile?.render) return false;

      // Clear container contents before render (safety)
      el.innerHTML = "";

      const widgetId = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });

      turnstileWidgetIdRef.current = widgetId;
      return true;
    };

    // attempt now; if not ready, poll briefly
    if (tryRender()) return;

    const t = window.setInterval(() => {
      if (tryRender()) window.clearInterval(t);
    }, 150);

    return () => window.clearInterval(t);
  }, [step, siteKey]);

  // If user goes back and returns to final step, ensure widget is there
  useEffect(() => {
    if (step !== 6) return;
    // reset token display each time they arrive at step 6
    setTurnstileToken("");
    setStatus("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function submitLead(intent: "book" | "maybe_later") {
    setStatus("");
    setIsSubmitting(true);

    // Final gate: require Turnstile
    if (!turnstileToken) {
      setIsSubmitting(false);
      setStatus("Please complete the human verification to continue.");
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          company: data.company,
          // Keep compatibility with your current API/table fields:
          budget_range: data.budget || "",
          message:
            [
              `Product type: ${data.productType || "—"}`,
              `Stage: ${data.stage || "—"}`,
              `Timeline: ${data.timeline || "—"}`,
              `Goal: ${data.goal || "—"}`,
              `Details: ${data.details || "—"}`,
              `Recommendation: ${recommendation.title}`,
              `CTA intent: ${intent}`,
            ].join("\n"),
          page: "/start",
          utm_source: params.get("utm_source") ?? "",
          utm_medium: params.get("utm_medium") ?? "",
          utm_campaign: params.get("utm_campaign") ?? "",
          turnstileToken,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(payload?.error || "Something went wrong.");
        setIsSubmitting(false);
        return;
      }

      if (intent === "book") {
        // open Calendly in a new tab
        window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
        setStatus("Opened booking in a new tab.");
      } else {
        setStatus("No problem — we’ll follow up by email with next steps.");
        // Reset the flow to start
        setStep(1);
        setTouched({});
        setErrors({});
        setTurnstileToken("");
        // Reset widget so next time it works cleanly
        if (window.turnstile?.remove && turnstileWidgetIdRef.current != null) {
          window.turnstile.remove(turnstileWidgetIdRef.current);
        }
        turnstileWidgetIdRef.current = null;
      }

      setIsSubmitting(false);
    } catch (e) {
      console.error(e);
      setStatus("Network error. Please try again.");
      setIsSubmitting(false);
    }
  }

  // UI helpers
  const inputBase =
    "w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10 focus:border-black/40";
  const inputError = "border-red-500 focus:ring-red-200/60";
  const helpError = "mt-2 text-sm text-red-600";
  const card =
    "w-full max-w-3xl rounded-3xl border border-black/10 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)]";

  return (
    <>
      {/* Turnstile script (keeps it inside this page; no layout/global changes required) */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-10">
        {/* Header: show on steps 1–5 only; final step is “just the card” */}
        {step !== 6 && (
          <div className="w-full max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-tight">Start your product</h1>
            <p className="mt-3 text-lg text-gray-600">
              Answer a few quick questions so we can recommend the right next step — then book a 15-min Product Clarity Call.
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Step {step} of {STEPS}
            </div>
            <div>{progressPct}%</div>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-black/10">
            <div
              className={`h-2 rounded-full ${barColor} transition-all duration-500 ease-out`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className={card}>
          <div className="p-10 md:p-12">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold">Tell us about you</h2>
                  <p className="mt-2 text-gray-600">
                    Answer a few quick questions so we can understand your project and recommend the right approach.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Full name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full name</label>
                    <input
                      value={data.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, fullName: true }));
                        setErrors((er) => ({ ...er, fullName: validateField("fullName", data.fullName) }));
                      }}
                      className={`${inputBase} ${touched.fullName && errors.fullName ? inputError : "border-black/10"}`}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    {touched.fullName && errors.fullName && <div className={helpError}>{errors.fullName}</div>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      value={data.email}
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, email: true }));
                        setErrors((er) => ({ ...er, email: validateField("email", data.email) }));
                      }}
                      className={`${inputBase} ${touched.email && errors.email ? inputError : "border-black/10"}`}
                      placeholder="name@company.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                    {touched.email && errors.email && <div className={helpError}>{errors.email}</div>}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company / Startup name</label>
                    <input
                      value={data.company}
                      onChange={(e) => setField("company", e.target.value)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, company: true }));
                        setErrors((er) => ({ ...er, company: validateField("company", data.company) }));
                      }}
                      className={`${inputBase} ${touched.company && errors.company ? inputError : "border-black/10"}`}
                      placeholder="Startup / team / org"
                      autoComplete="organization"
                    />
                    {touched.company && errors.company && <div className={helpError}>{errors.company}</div>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={onContinue}
                    className="rounded-2xl bg-black px-7 py-3 font-semibold text-white shadow-lg shadow-black/10 hover:opacity-90"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold">What are you building?</h2>
                  <p className="mt-2 text-gray-600">Pick the closest match — this helps us recommend the best next step.</p>
                </div>

                <div>
                  <select
                    value={data.productType}
                    onChange={(e) => setField("productType", e.target.value as ProductType)}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, productType: true }));
                      setErrors((er) => ({ ...er, productType: validateField("productType", data.productType) }));
                    }}
                    className={`${inputBase} ${
                      touched.productType && errors.productType ? inputError : "border-black/10"
                    } bg-white`}
                  >
                    <option value="">Select one…</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Website">Website</option>
                    <option value="Web Platform">Web Platform</option>
                    <option value="SaaS Tool">SaaS Tool</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="AI Product">AI Product</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                  {touched.productType && errors.productType && <div className={helpError}>{errors.productType}</div>}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={onBack}
                    className="rounded-2xl border border-black/15 px-6 py-3 font-semibold text-gray-900 hover:bg-black/5"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={onContinue}
                    className="rounded-2xl bg-black px-7 py-3 font-semibold text-white shadow-lg shadow-black/10 hover:opacity-90"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold">Stage, timeline, budget</h2>
                  <p className="mt-2 text-gray-600">This helps us recommend the right delivery approach.</p>
                </div>

                <div className="space-y-6">
                  {/* Stage */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Where are you right now?</label>
                    <select
                      value={data.stage}
                      onChange={(e) => setField("stage", e.target.value as Stage)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, stage: true }));
                        setErrors((er) => ({ ...er, stage: validateField("stage", data.stage) }));
                      }}
                      className={`${inputBase} ${touched.stage && errors.stage ? inputError : "border-black/10"} bg-white`}
                    >
                      <option value="">Choose a stage…</option>
                      <option value="Idea → need a clear MVP">Idea → need a clear MVP</option>
                      <option value="Prototype exists → need UX/UI + plan">Prototype exists → need UX/UI + plan</option>
                      <option value="Already building → need design + build alignment">
                        Already building → need design + build alignment
                      </option>
                      <option value="Live product → need improvements + growth">Live product → need improvements + growth</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                    {touched.stage && errors.stage && <div className={helpError}>{errors.stage}</div>}
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timeline</label>
                    <select
                      value={data.timeline}
                      onChange={(e) => setField("timeline", e.target.value as Timeline)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, timeline: true }));
                        setErrors((er) => ({ ...er, timeline: validateField("timeline", data.timeline) }));
                      }}
                      className={`${inputBase} ${
                        touched.timeline && errors.timeline ? inputError : "border-black/10"
                      } bg-white`}
                    >
                      <option value="">Choose a timeline…</option>
                      <option value="ASAP">ASAP</option>
                      <option value="1–3 months">1–3 months</option>
                      <option value="3–6 months">3–6 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                    {touched.timeline && errors.timeline && <div className={helpError}>{errors.timeline}</div>}
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Budget</label>
                    <select
                      value={data.budget}
                      onChange={(e) => setField("budget", e.target.value as Budget)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, budget: true }));
                        setErrors((er) => ({ ...er, budget: validateField("budget", data.budget) }));
                      }}
                      className={`${inputBase} ${touched.budget && errors.budget ? inputError : "border-black/10"} bg-white`}
                    >
                      <option value="">Select budget…</option>
                      <option value="Exploring ($0–$2k)">Exploring ($0–$2k)</option>
                      <option value="Starter ($2k–$7k)">Starter ($2k–$7k)</option>
                      <option value="Growth ($7k–$20k)">Growth ($7k–$20k)</option>
                      <option value="Serious ($20k+)">Serious ($20k+)</option>
                    </select>
                    {touched.budget && errors.budget && <div className={helpError}>{errors.budget}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={onBack}
                    className="rounded-2xl border border-black/15 px-6 py-3 font-semibold text-gray-900 hover:bg-black/5"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={onContinue}
                    className="rounded-2xl bg-black px-7 py-3 font-semibold text-white shadow-lg shadow-black/10 hover:opacity-90"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold">What’s the primary goal?</h2>
                  <p className="mt-2 text-gray-600">One sentence is enough — we’ll use it to tailor the recommendation.</p>
                </div>

                <div>
                  <textarea
                    value={data.goal}
                    onChange={(e) => setField("goal", e.target.value)}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, goal: true }));
                      setErrors((er) => ({ ...er, goal: validateField("goal", data.goal) }));
                    }}
                    className={`${inputBase} ${touched.goal && errors.goal ? inputError : "border-black/10"} h-28 resize-none`}
                    placeholder="Example: Launch a v1 for early adopters and validate pricing."
                  />
                  {touched.goal && errors.goal && <div className={helpError}>{errors.goal}</div>}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={onBack}
                    className="rounded-2xl border border-black/15 px-6 py-3 font-semibold text-gray-900 hover:bg-black/5"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={onContinue}
                    className="rounded-2xl bg-black px-7 py-3 font-semibold text-white shadow-lg shadow-black/10 hover:opacity-90"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-semibold">Anything else we should know?</h2>
                  <p className="mt-2 text-gray-600">Key features, constraints, or links. Keep it short.</p>
                </div>

                <div>
                  <textarea
                    value={data.details}
                    onChange={(e) => setField("details", e.target.value)}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, details: true }));
                      setErrors((er) => ({ ...er, details: validateField("details", data.details) }));
                    }}
                    className={`${inputBase} ${touched.details && errors.details ? inputError : "border-black/10"} h-36 resize-none`}
                    placeholder="Example: Need onboarding, payments, admin panel. Already have a dev team."
                  />
                  {touched.details && errors.details && <div className={helpError}>{errors.details}</div>}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={onBack}
                    className="rounded-2xl border border-black/15 px-6 py-3 font-semibold text-gray-900 hover:bg-black/5"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      // validate step 5 first, then go to final
                      setStatus("");
                      if (!validateStep(5)) return;
                      setStep(6);
                    }}
                    className="rounded-2xl bg-black px-7 py-3 font-semibold text-white shadow-lg shadow-black/10 hover:opacity-90"
                  >
                    See recommendation →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 (FINAL): JUST THE CARD CONTENT */}
            {step === 6 && (
              <div className="space-y-8">
                <div>
                  <div className="text-sm font-semibold tracking-wide text-gray-500">Your recommendation</div>
                  <h2 className="mt-2 text-4xl font-semibold tracking-tight">{recommendation.title}</h2>
                  <p className="mt-3 text-lg text-gray-700">{recommendation.subtitle}</p>
                  {recommendation.productNote && <p className="mt-2 text-sm text-gray-500">{recommendation.productNote}</p>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-6">
                    <div className="font-semibold">Why this fits</div>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                      {recommendation.why.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-6">
                    <div className="font-semibold">What happens next</div>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                      {recommendation.next.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Turnstile */}
                <div className="mt-2 flex flex-col items-center gap-3">
                  {!siteKey ? (
                    <div className="text-sm text-red-600">
                      Turnstile site key is missing. Check <code>.env.local</code> and restart dev server.
                    </div>
                  ) : (
                    <>
                      <div ref={turnstileContainerRef} />
                      {!turnstileToken && (
                        <div className="text-sm text-gray-600">Please complete the human verification to continue.</div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
                  <button
                    disabled={isSubmitting || !turnstileToken}
                    onClick={() => submitLead("book")}
                    className={`rounded-2xl px-7 py-3 font-semibold text-white shadow-lg shadow-black/10 transition ${
                      isSubmitting || !turnstileToken ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:opacity-90"
                    }`}
                  >
                    Book Product Clarity Call (15 min)
                  </button>

                  <button
                    disabled={isSubmitting || !turnstileToken}
                    onClick={() => submitLead("maybe_later")}
                    className={`rounded-2xl border px-7 py-3 font-semibold transition ${
                      isSubmitting || !turnstileToken
                        ? "border-black/10 text-gray-400 cursor-not-allowed"
                        : "border-black/15 text-gray-900 hover:bg-black/5"
                    }`}
                  >
                    Maybe later
                  </button>
                </div>

                {status && <div className="text-center text-sm text-gray-700">{status}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}