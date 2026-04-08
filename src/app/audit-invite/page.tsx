"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "../../lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export default function AuditInvitePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

      if (!hostname.includes(".")) return false;

      const parts = hostname.split(".").filter(Boolean);
      if (parts.length < 2) return false;

      if (parts[0] === "www" && parts.length < 3) return false;

      const tld = parts[parts.length - 1];
      if (!/^[a-z]{2,24}$/i.test(tld)) return false;

      return true;
    } catch {
      return false;
    }
  }

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      isValidEmail(email) &&
      isValidUrl(productUrl) &&
      inviteCode.trim().length > 0 &&
      !loading
    );
  }, [fullName, email, productUrl, inviteCode, loading]);

  async function onRunAudit() {
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
      setStatus("Please enter a valid website/app link.");
      return;
    }

    if (!inviteCode.trim()) {
      setStatus("Please enter your access code.");
      return;
    }

    setLoading(true);

    trackEvent("audit_invite_started", {
      page: "audit-invite",
    });

    try {
      const res = await fetch("/api/checkout/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          productUrl,
          inviteCode,
          invite: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Invalid or expired code.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (e) {
      setStatus("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto max-w-3xl py-20 px-6"
    >
      <motion.section
        id="audit-form"
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-[#FFF9F4] p-8 shadow-sm md:p-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white to-gray-50" />

        <div className="relative">
          {!submitted ? (
            <>
              {/* HEADER */}
              <div>
                <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00] shadow-sm">
                  ELLESSEN AUDIT ENGINE
                </div>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  Run Your Elessen Audit Engine™
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">
                  Share your product link and we’ll generate your audit.
                </p>
              </div>

              {/* FORM */}
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Full name</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">
                  Website / Product link
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="yoursite.com or https://yourapp.com"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Access code</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your code"
                />
              </div>

              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {status}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex justify-end">
                <motion.button
                  onClick={onRunAudit}
                  disabled={!canSubmit}
                  className={`rounded-2xl px-8 py-3 font-semibold text-white ${
                    canSubmit
                      ? "bg-[#FF7A00] hover:brightness-95"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading
                    ? "Generating..."
                    : "Generate Free Report"}
                </motion.button>
              </div>
            </>
          ) : (
            /* SUCCESS STATE */
            <div className="text-center py-10">
              <div className="text-sm font-semibold tracking-[0.18em] text-black/40">
                ELLESSEN AUDIT ENGINE
              </div>

              <h2 className="mt-3 text-2xl font-semibold">
                Your audit is being generated
              </h2>

              <p className="mt-3 text-sm text-black/60">
                We’re analyzing your product.  
                You’ll receive your report shortly.
              </p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}