"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "../../lib/analytics";

export default function AuditInvitePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
    return isValidUrl(productUrl) && !loading;
  }, [productUrl, loading]);

  async function onRunAudit() {
    setStatus("");

    if (!isValidUrl(productUrl)) {
      setStatus("Please enter a valid website or app link.");
      return;
    }

    if (!fullName || !email || !inviteCode) {
  setStatus("Missing invite details. Please go back and use your invite link again.");
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
            inviteCode,
            productUrl,
            invite: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Failed to generate audit.");
        setLoading(false);
        return;
      }

      if (!data?.id) {
        setStatus("Audit ID missing.");
        setLoading(false);
        return;
      }

      // redirect to result page
      window.location.href = `/audit/result/${data.id}`;
    } catch (e) {
      setStatus("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">

        <div className="text-center">
          <div className="text-xs font-semibold tracking-[0.2em] text-white/50">
            ELESSEN AUDIT ENGINE
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-white">
            Run your audit
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Enter your product link to generate your audit.
          </p>
        </div>

        <div className="mt-6">
          <input
            type="text"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="yourwebsite.com or https://yourapp.com"
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20"
          />

          {productUrl.trim().length > 0 && !isValidUrl(productUrl) && (
            <p className="mt-2 text-xs text-red-400">
              Please enter a valid URL.
            </p>
          )}
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {status}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6">
          <button
            onClick={onRunAudit}
            disabled={!canSubmit}
            className={`w-full rounded-2xl px-6 py-3 font-semibold text-white transition ${
              canSubmit
                ? "bg-[#FF7A00] hover:brightness-95"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Generating your audit..." : "Start audit"}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-white/40">
          Your audit will be generated and delivered shortly.
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <div className="text-sm font-semibold tracking-wide text-black/50">
              ELESSEN AUDIT ENGINE
            </div>

            <h2 className="mt-2 text-lg font-semibold text-black">
              Generating your audit
            </h2>

            <p className="mt-2 text-sm text-black/60">
              Please wait while we analyze your product.
            </p>

            <div className="mt-4 h-2 w-full rounded-full bg-black/10">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-[#FF7A00]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}