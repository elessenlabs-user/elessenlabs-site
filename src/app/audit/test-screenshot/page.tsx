"use client";

import { useState } from "react";

const TEST_URL = "https://www.airbnb.com/host";

export default function TestScreenshotPage() {
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [markedImage, setMarkedImage] = useState<string | null>(null);
  const [loadingRaw, setLoadingRaw] = useState(false);
  const [loadingMarked, setLoadingMarked] = useState(false);
  const [error, setError] = useState("");

  async function generateRawScreenshot() {
    setLoadingRaw(true);
    setError("");
    setRawImage(null);

    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: TEST_URL,
          marked: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to generate raw screenshot.");
      } else if (data?.image) {
        setRawImage(data.image);
      } else {
        setError("No raw screenshot returned.");
      }
    } catch {
      setError("Something went wrong while generating the raw screenshot.");
    }

    setLoadingRaw(false);
  }

  async function generateMarkedScreenshot() {
    setLoadingMarked(true);
    setError("");
    setMarkedImage(null);

    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: TEST_URL,
          marked: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to generate marked screenshot.");
      } else if (data?.image) {
        setMarkedImage(data.image);
      } else {
        setError("No marked screenshot returned.");
      }
    } catch {
      setError("Something went wrong while generating the marked screenshot.");
    }

    setLoadingMarked(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-8 py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold tracking-[0.18em] text-black/45">
          QA PAGE
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Screenshot Capture Test
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">
          This page tests the screenshot output from the same Playwright capture
          flow used by the audit engine.
        </p>

        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-black/75">
          <strong>Test URL:</strong> {TEST_URL}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateRawScreenshot}
            disabled={loadingRaw || loadingMarked}
            className={`inline-flex min-h-[48px] items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition ${
              loadingRaw || loadingMarked
                ? "cursor-not-allowed bg-gray-400"
                : "bg-black hover:opacity-90"
            }`}
          >
            {loadingRaw ? "Generating raw screenshot…" : "Generate Raw Screenshot"}
          </button>

          <button
            type="button"
            onClick={generateMarkedScreenshot}
            disabled={loadingRaw || loadingMarked}
            className={`inline-flex min-h-[48px] items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition ${
              loadingRaw || loadingMarked
                ? "cursor-not-allowed bg-gray-400"
                : "bg-[#FF7A00] hover:brightness-95"
            }`}
          >
            {loadingMarked
              ? "Generating marked screenshot…"
              : "Generate Marked Screenshot"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-sm font-semibold">Raw Screenshot</div>
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-black/[0.02] p-3">
              {rawImage ? (
                <img
                  src={rawImage}
                  alt="Raw screenshot output"
                  className="h-auto w-full rounded-2xl"
                />
              ) : (
                <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-black/45">
                  No raw screenshot generated yet.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold">Marked Screenshot</div>
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-black/[0.02] p-3">
              {markedImage ? (
                <img
                  src={markedImage}
                  alt="Marked screenshot output"
                  className="h-auto w-full rounded-2xl"
                />
              ) : (
                <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-black/45">
                  No marked screenshot generated yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}