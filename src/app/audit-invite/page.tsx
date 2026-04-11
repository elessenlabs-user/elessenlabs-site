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

  const [checkingCode, setCheckingCode] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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
      codeValid &&
      !loading
    );
  }, [fullName, email, productUrl, inviteCode, codeValid, loading]);

  async function validateCode(codeArg?: string, emailArg?: string) {
  const normalizedCode = (codeArg ?? inviteCode).trim().toUpperCase();
  const normalizedEmail = (emailArg ?? email).trim();

  if (!normalizedCode) {
    setStatus("");
    setCodeValid(false);
    setCheckingCode(false);
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    setStatus("");
    setCodeValid(false);
    setCheckingCode(false);
    return;
  }

  setCheckingCode(true);

  try {
    const res = await fetch("/api/invite/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: normalizedCode,
        email: normalizedEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data?.error || "Invalid or expired code.");
      setCodeValid(false);
      setCheckingCode(false);
      return;
    }

    setStatus("");
    setInviteCode(normalizedCode);
    setCodeValid(true);
    setCheckingCode(false);
  } catch {
    setStatus("Could not validate code right now.");
    setCodeValid(false);
    setCheckingCode(false);
  }
}

  async function onRunAudit() {
    setStatus("");

    const normalizedCode = inviteCode.trim().toUpperCase();

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

    if (!normalizedCode) {
      setStatus("Please enter your access code.");
      return;
    }

    if (!codeValid) {
      setStatus("Please validate your access code first.");
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
          inviteCode: normalizedCode,
          invite: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Invalid or expired code.");
        setLoading(false);
        return;
      }

      const successName = encodeURIComponent(fullName.trim());
    setTimeout(() => {
        window.location.href = `/audit-invite/success?name=${successName}`;
    }, 1800);
    
    } catch {
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
          <div>
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#FF7A00] shadow-sm">
              ELESSEN AUDIT ENGINE
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Run Your Elessen Audit Engine™
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">
              Share your product link and we’ll generate your audit.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-orange-200 focus:border-orange-300"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
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
                onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    setCodeValid(false);

                if (inviteCode.trim().length >= 6 && isValidEmail(val)) {
                validateCode(inviteCode.trim(), val.trim());
                    }
                }}
                
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
            <label className="text-sm font-medium flex items-center gap-2">
                Website / Product link

                <span className="relative group cursor-pointer">
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full border border-black/30 text-black/40">
                i
                </span>

                <span className="absolute left-1/2 -translate-x-1/2 top-6 w-64 rounded-lg bg-black text-white text-[11px] leading-5 px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 shadow-lg">
                    Some websites may render differently due to cookie banners, bot protection, or dynamic content. This may slightly affect screenshot accuracy.
                </span>
            </span>
        </label>
            <input
              type="text"
              className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:ring-4 ${
                productUrl.trim().length > 0 && !isValidUrl(productUrl)
                  ? "border-red-300 focus:ring-red-100"
                  : "border-black/10 focus:ring-orange-200"
              } focus:border-orange-300`}
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="yoursite.com, www.yoursite.com, or https://yoursite.com"
            />
            {productUrl.trim().length > 0 && !isValidUrl(productUrl) && (
              <p className="mt-2 text-xs text-red-600">
                Enter a valid URL (e.g. airbnb.com, www.airbnb.com, or https://airbnb.com)
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Access code</label>
            <div className="relative">
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 outline-none transition focus:ring-4 focus:ring-orange-200 focus:border-orange-300"
                value={inviteCode}
                

            onChange={(e) => {
  const val = e.target.value.toUpperCase();

  setInviteCode(val);
  setCodeValid(false);
  setStatus("");

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const timer = setTimeout(() => {
  if (val.trim().length >= 6 && isValidEmail(email)) {
    validateCode(val.trim(), email.trim());
  }
}, 500);

  setDebounceTimer(timer);
}}
                placeholder="Enter your code"
              />

              {checkingCode && (
                <div className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs text-black/45">
                  ...
                </div>
              )}

              {!checkingCode && codeValid && (
                <div className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-green-600 text-lg">
                  ✓
                </div>
              )}
            </div>
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
              {loading ? "Generating Free Report..." : "Generate Free Report"}
            </motion.button>
          </div>
        </div>
      </motion.section>

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="text-sm font-semibold tracking-[0.18em] text-black/45">
              ELESSEN AUDIT ENGINE
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              Generating your free report
            </h2>

            <p className="mt-3 text-sm text-black/60 leading-6">
              We’re analyzing your product and preparing your report. This can take upto 2 minutes.
            </p>
            <p> Do Not Close This Window </p>
            <div className="mt-6 overflow-hidden rounded-full border border-black/10 bg-black/[0.06]">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-[#FF7A00]" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}