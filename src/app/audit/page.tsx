"use client";

import { useState } from "react";
import Link from "next/link";

const AUDIT_PRICE = "$149";
const TURNAROUND = "24 hours";

export default function AuditPage() {
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_AUDIT_LINK;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());
  }

  function isValidUrl(v: string) {
    try {
      const u = new URL(v.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

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
    if (!stripeLink) {
      setStatus("Stripe link is missing. Set NEXT_PUBLIC_STRIPE_AUDIT_LINK in .env.local + Vercel.");
      return;
    }

    setLoading(true);

    // ✅ Log lead before sending to Stripe (so you keep the lead even if payment fails)
    try {
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
    } finally {
      // ✅ Go to Stripe no matter what (don’t block checkout)
      const url = new URL(stripeLink);
      // Optional: prefill email if Stripe supports it for your link
      url.searchParams.set("prefilled_email", email);
      window.location.href = url.toString();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Top */}
      <div className="space-y-3">
        <div className="text-xs font-medium opacity-70">Offer</div>
        <h1 className="text-4xl font-semibold tracking-tight">24-Hour UX Conversion Blueprint</h1>
        <p className="text-lg opacity-80">
          You send your website/app. We return a conversion-focused audit you can implement immediately.
        </p>

        <div className="flex flex-wrap gap-2 text-[12px]">
          <span className="rounded-full border border-black/10 bg-white px-3 py-1">
            Delivery: {TURNAROUND}
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1">
            Price: {AUDIT_PRICE}
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1">
            Format: PDF + prioritized fixes
          </span>
        </div>
      </div>

      {/* What they get */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="text-sm font-semibold">What you get</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm opacity-80">
            <li>Top conversion blockers (prioritized)</li>
            <li>Exact UX/UI fixes (with examples)</li>
            <li>Homepage + key flow recommendations</li>
            <li>Quick wins + “bigger bets”</li>
          </ul>
        </div>

        <div className="card">
          <div className="text-sm font-semibold">What we need</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm opacity-80">
            <li>A live link (website or app store link)</li>
            <li>Any key pages/flows you care about</li>
            <li>Your goal (sales, signups, bookings, retention)</li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
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
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://yourproduct.com or app store link"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:ring-4 focus:ring-black/10"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What should we focus on? (checkout, onboarding, pricing page, etc.)"
            rows={4}
          />
        </div>

        {status && <div className="mt-4 text-sm text-red-600">{status}</div>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100" href="/start">
            Prefer the free clarity call instead?
          </Link>

          {/* ✅ THIS is the correct placement: replaces your <a> so we log lead + redirect */}
          <button
            onClick={onPay}
            disabled={loading}
            className={`rounded-2xl px-6 py-3 font-semibold text-white shadow-md transition ${
              loading ? "cursor-not-allowed bg-gray-400" : "bg-black hover:opacity-95"
            }`}
          >
            {loading ? "Redirecting…" : `Pay ${AUDIT_PRICE} + Start`}
          </button>
        </div>
      </div>
    </div>
  );
}