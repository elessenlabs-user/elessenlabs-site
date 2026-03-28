"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


const AUDIT_PRICE = "$149";
const TURNAROUND = "24 hours";
const BASE_AUDIT_PRICE = 149;
const EXTRA_PAGE_PRICE = 20;
const INCLUDED_PAGES = 2;
const MAX_EXTRA_PAGES = 3;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AuditPage() {
    const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [focusPageUrl, setFocusPageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [extraPageUrls, setExtraPageUrls] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());
  }

 function isValidUrl(v: string) {
  const raw = v.trim().toLowerCase();
  if (!raw) return false;

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const u = new URL(normalized);
    const hostname = u.hostname.toLowerCase();

    // must contain at least one dot
    if (!hostname.includes(".")) return false;

    const parts = hostname.split(".").filter(Boolean);

    // need at least domain + tld
    if (parts.length < 2) return false;

    // if it starts with www, require at least 3 parts: www + domain + tld
    if (parts[0] === "www" && parts.length < 3) return false;

    const tld = parts[parts.length - 1];

    // tld must be letters only and reasonable length
    if (!/^[a-z]{2,24}$/i.test(tld)) return false;

    return true;
  } catch {
    return false;
  }
}

    const totalPrice = BASE_AUDIT_PRICE + extraPageUrls.length * EXTRA_PAGE_PRICE;

  const canSubmit = useMemo(() => {

    return (
      fullName.trim().length >= 2 &&
      isValidEmail(email) &&
      isValidUrl(productUrl) &&
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
    if (!isValidUrl(productUrl)) {
      setStatus("Please enter a valid website/app link (https://...).");
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
            `Focus URL / flow: ${focusPageUrl || "—"}`,
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
          productUrl,
          focusPageUrl,
          extraPageUrls,
          notes,
          totalPrice,
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="mx-auto max-w-5xl space-y-10"
    >
{/* HERO */}
<div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF8F3] p-8 shadow-sm">
  <div className="grid items-start gap-8 md:grid-cols-[1.15fr_.85fr]">
    {/* LEFT */}
    <div>
      <div className="text-xs font-semibold tracking-wide opacity-60">OFFER</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Elessen Audit Engine
      </h1>
      <p className="mt-3 text-lg opacity-80">
        A conversion-focused UX audit customized for your product, powered by AI and sharpened by 15+ years of hands-on product design experience. This is not generic AI output — it is a structured, expert-guided review built to help you act fast.
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-[12px]">
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">
          Limited intro rate: {AUDIT_PRICE}
        </span>
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">
          Standard audit range: $3,000–$30,000
        </span>
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">
          Delivery: {TURNAROUND}
        </span>
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">
          AI-supported + expert-reviewed
        </span>
      </div>

            <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/audit/sample/saas-landing"
          className="inline-flex items-center justify-center rounded-2xl border border-orange-300 bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-orange-50"
        >
          View Sample Audit
        </Link>

        <a
          href="#audit-form"
          className="inline-flex items-center justify-center rounded-2xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,122,0,0.28)] transition hover:brightness-95"
        >
          Start My Audit
        </a>
      </div>

      {/* How it works */}
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 p-4">
          <div className="text-xs font-semibold opacity-60">STEP 1</div>
          <div className="mt-1 text-sm font-semibold">Submit your link</div>
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
          <div className="mt-1 text-sm font-semibold">Get your audit</div>
          <div className="mt-1 text-sm opacity-75">
            A prioritized action plan + annotated fixes within 24h.
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT: DELIVERABLE PREVIEW */}
    <div className="md:sticky md:top-24">
      <div className="rounded-3xl border border-orange-200 bg-[#FFF8F3] p-4 shadow-sm">
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
            View the style of output generated by the Elessen Audit Engine before purchase.
          </div>
      </div>
    </div>
  </div>
</div>

      {/* VALUE CARDS + SAMPLE */}
      <motion.section variants={fadeUp} className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF9F4] p-6 shadow-sm md:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
<div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">              <div className="text-sm font-semibold">What you get</div>
              <ul className="mt-4 space-y-2 text-sm text-black/70">
                <li>• Top conversion blockers (prioritized)</li>
                <li>• Exact UX/UI fixes (with examples)</li>
                <li>• Homepage + key flow recommendations</li>
                <li>• Copy tweaks + CTA improvements</li>
                <li>• Quick wins + “bigger bets” roadmap</li>
              </ul>
            </div>

<div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
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

        <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF9F4] p-6 shadow-sm">
          <div className="text-sm font-semibold">Example insights</div>
          <div className="mt-4 space-y-3 text-sm text-black/70">
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="font-semibold text-black/80">Pricing clarity</div>
              <div className="mt-1">Mismatch between promise and pricing page CTA hierarchy.</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-gray-50 p-4">
              <div className="font-semibold text-black/80">Onboarding friction</div>
              <div className="mt-1">Reduce form steps + add progressive disclosure at step 2.</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-gray-50 p-4">
              <div className="font-semibold text-black/80">Homepage messaging</div>
              <div className="mt-1">Reframe headline to mirror the user’s intent, not your service.</div>
            </div>
          </div>
        </div>
      </motion.section>

            {/* FORM */}
      <motion.section
        id="audit-form"
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF9F4] p-8 shadow-sm md:p-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white to-gray-50" />

        <div className="relative">
          <div className="flex flex-col gap-3">
            <div>
              <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00] shadow-sm">
                ELLESSEN AUDIT ENGINE
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Get your customized Elessen Audit Engine review
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">
                Share your product link and we’ll return a focused, conversion-driven audit shaped by AI-supported analysis and real product design experience — not generic output.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-orange-200 focus:border-orange-300"
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
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:ring-4 ${
                  email.trim().length > 0 && !isValidEmail(email)
                    ? "border-red-300 focus:ring-red-100"
                    : "border-black/10 focus:ring-black/10"
                } focus:border-orange-300`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                inputMode="email"
              />
              {email.trim().length > 0 && !isValidEmail(email) && (
                <p className="mt-2 text-xs text-red-600">
                  Please enter a valid email address.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Website / Product link</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-orange-200 focus:border-orange-300"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="yoursite.com, www.yourstite.com, or https://yoursite.com"
            />
            {productUrl.trim().length > 0 && !isValidUrl(productUrl) && (
              <p className="mt-2 text-xs text-red-600">
                Please enter a valid website URL, such as airbnb.com.
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">
              Included additional page, screen, or flow
            </label>
            <input
              type="url"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-orange-200 focus:border-orange-300"
              value={focusPageUrl}
              onChange={(e) => setFocusPageUrl(e.target.value)}
              placeholder="https://yourproduct.com/pricing, app store link, onboarding page, or shared flow URL"
            />
            <p className="mt-2 text-xs text-black/55">
              Your audit includes your main page plus 1 additional page or key flow at no extra cost.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-orange-200 bg-[#FFF4E8] p-5 shadow-[0_8px_24px_rgba(255,122,0,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-black">Add more pages</div>
                <p className="mt-1 text-xs text-black/60">
                  Your audit includes your main page plus 1 additional page free. Add up to {MAX_EXTRA_PAGES} more pages at ${EXTRA_PAGE_PRICE} each.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-black/45">
                  Current total
                </div>
                <div className="mt-1 text-lg font-semibold">${totalPrice}</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {extraPageUrls.map((url, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-black/10 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-medium text-black/60">
                      Extra page {index + 3}
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setExtraPageUrls((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={url}
                    onChange={(e) =>
                      setExtraPageUrls((prev) =>
                        prev.map((item, i) => (i === index ? e.target.value : item))
                      )
                    }
                    placeholder="https://yourproduct.com/page"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-orange-200"
                  />
                </div>
              ))}

              {extraPageUrls.length < MAX_EXTRA_PAGES && (
                <button
                  type="button"
                  onClick={() => setExtraPageUrls((prev) => [...prev, ""])}
                  className="inline-flex items-center justify-center rounded-2xl border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-50"
                >
                  + Add another page (${EXTRA_PAGE_PRICE})
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-orange-200 focus:border-orange-300"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What should we focus on? (checkout, onboarding, pricing page, etc.)"
              rows={5}
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

          <div className="mt-8 border-t border-black/10 pt-6">
  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

    {/* LEFT */}
    <div className="text-sm text-black/70">
      <Link
        className="underline underline-offset-4 hover:text-black"
        href="/start"
      >
        Prefer the free clarity call instead?
      </Link>
    </div>

    {/* RIGHT */}
    <div className="flex flex-col items-end gap-3 text-right">

      <div className="text-sm font-medium text-black/80">
        Full audit unlock: ${totalPrice}
      </div>

      <p className="text-sm text-black/60 leading-6">
        Preview first. Pay only if you want the full audit.
      </p>

      <motion.button
        onClick={onPay}
        disabled={!canSubmit}
        whileHover={canSubmit ? { y: -1 } : undefined}
        whileTap={canSubmit ? { scale: 0.98 } : undefined}
        className={`rounded-2xl px-8 py-3 font-semibold text-white shadow-lg transition ${
          canSubmit
            ? "bg-[#FF7A00] hover:brightness-95 shadow-[0_10px_30px_rgba(255,122,0,0.28)]"
            : "cursor-not-allowed bg-gray-400"
        }`}
      >
        {loading ? "Generating Preview…" : "Generate Preview"}
      </motion.button>
    </div>

  </div>

  <div className="mt-4 text-xs text-black/55">
    Secure checkout by Stripe. We don’t store payment details.
  </div>
</div>
        </div>
      </motion.section>
    </motion.div>
  );
}
