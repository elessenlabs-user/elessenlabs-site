"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const AUDIT_PRICE = "$149";
const TURNAROUND = "24 hours";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-black/70 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-black/30" />
      {children}
    </span>
  );
}

export default function AuditPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());
  }

  function normalizeUrl(v: string) {
  const s = v.trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  // If user pasted "www.example.com" or "example.com", assume https
  return `https://${s}`;
}

  function isValidUrl(v: string) {
    try {
      const u = new URL(v.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      isValidEmail(email) &&
      isValidUrl(normalizeUrl(productUrl)) &&
      !loading
    );
  }, [fullName, email, productUrl, loading]);

  async function onPay() {
    setStatus("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setStatus("Please enter your name.");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("Please enter a valid email.");
      return;
    }
    const normalizedProductUrl = normalizeUrl(productUrl);

if (!isValidUrl(normalizedProductUrl)) {
  setStatus("Please enter a valid website/app link (e.g., https://...).");
  return;
}

    setLoading(true);

    try {
      // 1) Log lead first (keep this – good practice)
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          company: "",
          budget_range: "",
          intent: "audit",
          page: "/audit",
          message: [
            "Audit request",
            `Name: ${fullName}`,
            `Email: ${email}`,
            `Product URL: ${productUrl}`,
            `Notes: ${notes || "—"}`,
            `Offer: 24-hour UX Conversion Blueprint (${AUDIT_PRICE})`,
          ].join("\n"),
          utm_source: "",
          utm_medium: "",
          utm_campaign: "",
        }),
      }).catch(() => {});

      // 2) Create Stripe Checkout Session on the server (so webhook has your form data)
      const res = await fetch("/api/checkout/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          productUrl: normalizedProductUrl,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Could not start checkout. Try again.");
        setLoading(false);
        return;
      }

      if (!data?.url) {
        setStatus("Checkout link missing. Try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      setStatus("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function scrollToForm() {
    // no navigation, no re-render—just jump to the form anchor
    window.location.hash = "audit-form";
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto max-w-5xl space-y-10"
      >
        {/* HERO */}
        <motion.section
          variants={fadeUp}
          className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
        >
          <div className="grid items-start gap-8 md:grid-cols-[1.15fr_.85fr]">
            {/* LEFT */}
            <div>
              <div className="text-xs font-semibold tracking-wide opacity-60">
                OFFER
              </div>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                24-Hour UX Conversion Blueprint
              </h1>

              <p className="mt-3 text-lg opacity-80">
                Send your website/app. We return a conversion-focused audit you
                can implement immediately.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[12px]">
                <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                  Delivery: {TURNAROUND}
                </span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                  Price: {AUDIT_PRICE}
                </span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                  Format: PDF + prioritized fixes
                </span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                  Includes: examples + copy tweaks
                </span>
              </div>

              {/* How it works */}
              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-black/10 p-4">
                  <div className="text-xs font-semibold opacity-60">STEP 1</div>
                  <div className="mt-1 text-sm font-semibold">
                    Submit your link
                  </div>
                  <div className="mt-1 text-sm opacity-75">
                    Website or app store link + what to focus on.
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 p-4">
                  <div className="text-xs font-semibold opacity-60">STEP 2</div>
                  <div className="mt-1 text-sm font-semibold">Pay & confirm</div>
                  <div className="mt-1 text-sm opacity-75">
                    You’ll receive a confirmation email immediately.
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 p-4">
                  <div className="text-xs font-semibold opacity-60">STEP 3</div>
                  <div className="mt-1 text-sm font-semibold">
                    Get your audit
                  </div>
                  <div className="mt-1 text-sm opacity-75">
                    A prioritized action plan + annotated fixes within 24h.
                  </div>
                </div>
              </div>

              {/* Desktop-only micro CTA row */}
              <div className="mt-7 hidden items-center justify-between gap-4 rounded-3xl border border-black/10 bg-gradient-to-br from-white to-black/[0.02] p-4 md:flex">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    Ready to start?{" "}
                    <span className="text-black/60">
                      We’ll audit your top flow + homepage.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TrustPill>Secure Stripe checkout</TrustPill>
                    <TrustPill>No calls required</TrustPill>
                    <TrustPill>PDF deliverable</TrustPill>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={scrollToForm}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="shrink-0 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
                >
                  Continue →
                </motion.button>
              </div>
            </div>

            {/* RIGHT: DELIVERABLE PREVIEW */}
            <div className="md:sticky md:top-24">
              <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Deliverable preview</div>
                  <div className="text-xs opacity-60">Sample PDF</div>
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-white to-black/[0.02]">
                  <Image
                    src="/audit-preview.png"
                    alt="UX Conversion Blueprint PDF preview"
                    width={900}
                    height={1200}
                    className="h-auto w-full"
                    priority
                  />
                </div>

                <div className="mt-3 text-xs opacity-60">
                  You’ll get a clean PDF with prioritized fixes, annotated
                  screenshots, and next steps.
                </div>

                {/* Desktop conversion bar (premium) */}
                <div className="mt-4 hidden rounded-2xl border border-black/10 bg-white p-4 md:block">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {AUDIT_PRICE} • {TURNAROUND}
                      </div>
                      <div className="mt-1 text-xs text-black/60">
                        Conversion blockers + exact fixes. Delivered as PDF.
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] font-semibold text-black/70">
                      Stripe
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <TrustPill>Verified checklist</TrustPill>
                    <TrustPill>Annotated screenshots</TrustPill>
                    <TrustPill>Prioritized actions</TrustPill>
                  </div>

                  <motion.button
                    type="button"
                    onClick={scrollToForm}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
                  >
                    Continue to checkout →
                  </motion.button>

                  <div className="mt-2 text-[11px] text-black/55">
                    No calls. No upsell. You get the deliverable.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* VALUE CARDS + SAMPLE */}
        <motion.section variants={fadeUp} className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-gray-50 p-6">
                <div className="text-sm font-semibold">What you get</div>
                <ul className="mt-4 space-y-2 text-sm text-black/70">
                  <li>• Top conversion blockers (prioritized)</li>
                  <li>• Exact UX/UI fixes (with examples)</li>
                  <li>• Homepage + key flow recommendations</li>
                  <li>• Copy tweaks + CTA improvements</li>
                  <li>• Quick wins + “bigger bets” roadmap</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-gray-50 p-6">
                <div className="text-sm font-semibold">What we need</div>
                <ul className="mt-4 space-y-2 text-sm text-black/70">
                  <li>• A live link (website or app store link)</li>
                  <li>• Key pages/flows you care about</li>
                  <li>• Your goal (sales, signups, bookings, retention)</li>
                  <li>• Constraints (stack, dev time, tools)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">Example insights</div>
            <div className="mt-4 space-y-3 text-sm text-black/70">
              <div className="rounded-2xl border border-black/10 bg-gray-50 p-4">
                <div className="font-semibold text-black/80">Pricing clarity</div>
                <div className="mt-1">
                  Mismatch between promise and pricing page CTA hierarchy.
                </div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-gray-50 p-4">
                <div className="font-semibold text-black/80">
                  Onboarding friction
                </div>
                <div className="mt-1">
                  Reduce form steps + add progressive disclosure at step 2.
                </div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-gray-50 p-4">
                <div className="font-semibold text-black/80">
                  Homepage messaging
                </div>
                <div className="mt-1">
                  Reframe headline to mirror the user’s intent, not your service.
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FORM */}
        <motion.section
          id="audit-form"
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm md:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white to-gray-50" />

          <div className="relative">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-black/50">
                  START CHECKOUT
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Submit details, then pay securely via Stripe
                </h2>
                <p className="mt-2 text-sm text-black/60">
                  You’ll receive a confirmation email instantly.
                </p>
              </div>

          <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold">
            You’ll receive: <span className="text-black/60">PDF audit + prioritized fixes</span>
          </div>
        
        <div className="flex flex-wrap gap-2 text-[11px] text-black/70">
          <span className="rounded-full border border-black/10 bg-white px-3 py-1">Secure Stripe</span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1">24h delivery</span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1">No calls required</span>
      </div>
  </div>
</div>

              <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm">
                <span className="font-semibold">{AUDIT_PRICE}</span>
                <span className="text-black/50">•</span>
                <span className="text-black/70">{TURNAROUND} delivery</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 outline-none transition
                            focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Website / Product link</label>
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://yourproduct.com or app store link"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What should we focus on? (checkout, onboarding, pricing page, etc.)"
                rows={4}
              />
            </div>

            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {status}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                className="text-sm underline underline-offset-4 text-black/60 hover:text-black"
                href="/start"
              >
                Prefer the free clarity call instead?
              </Link>

              <motion.button
                onClick={onPay}
                disabled={!canSubmit}
                whileHover={canSubmit ? { y: -1 } : undefined}
                whileTap={canSubmit ? { scale: 0.98 } : undefined}
                className={`rounded-2xl px-6 py-3 font-semibold text-white shadow-lg transition ${
                  canSubmit ? "bg-black hover:opacity-95" : "cursor-not-allowed bg-gray-400"
                }`}
              >
                {loading ? "Redirecting…" : `Pay ${AUDIT_PRICE} + Start`}
              </motion.button>
            </div>

            <div className="mt-4 text-xs text-black/55">
              Secure checkout by Stripe. We don’t store payment details.
            </div>
          </div>
        </motion.section>

        {/* Mobile safe-area spacer so the sticky bar never covers the button/inputs */}
        <div className="h-24 md:hidden" />
      </motion.div>

      {/* STICKY CONVERSION BAR (MOBILE ONLY) */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <div className="rounded-3xl border border-black/10 bg-white/80 p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold">
                  {AUDIT_PRICE} • {TURNAROUND}
                </div>
                <div className="mt-0.5 text-[11px] text-black/60">
                  Secure checkout • PDF deliverable
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-[12px] font-semibold text-black/80 shadow-sm hover:bg-black/[0.03]"
                >
                  Details
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // If the form isn't valid yet, take them to the form.
                    // If it is valid, start checkout immediately.
                    if (!canSubmit) {
                      scrollToForm();
                      return;
                    }
                    onPay();
                  }}
                  disabled={loading}
                  className={`rounded-2xl px-4 py-3 text-[12px] font-semibold text-white shadow-lg transition ${
                    loading ? "cursor-not-allowed bg-gray-400" : "bg-black hover:opacity-95"
                  }`}
                >
                  {loading ? "…" : "Start"}
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <TrustPill>No calls required</TrustPill>
              <TrustPill>Delivered in {TURNAROUND}</TrustPill>
              <TrustPill>Stripe secure</TrustPill>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}