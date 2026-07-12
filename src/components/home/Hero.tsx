"use client";

import Link from "next/link";
import EngineScene from "../engine/EngineScene";
import { openBookingPopup } from "../../lib/bookings";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#F8F9FB]"
    >
      <div className="mx-auto flex min-h-[680px] max-w-[1600px] flex-col items-center gap-10 px-6 py-16 lg:flex-row lg:px-8">
        {/* Copy */}

        <div className="w-full max-w-[680px]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FE5E04]">
            Founder-led Product Consultancy
          </p>

          <h1 className="mt-8 text-5xl font-bold leading-[1.02] tracking-tight text-[#4E5964] sm:text-6xl md:text-7xl">
            Product &amp; Service Design.
            <br />
            Product Development.
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-9 text-[#4E5964]/75">
            We design and build websites, apps, platforms
            and services—from the first idea to a live
            product.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={openBookingPopup}
              className="rounded-xl bg-[#FE5E04] px-6 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#E95404]"
            >
              Let&apos;s Talk
            </button>

            <Link
              href="#work"
              className="rounded-xl border border-[#4E5964]/20 bg-white px-6 py-4 font-semibold text-[#4E5964] transition hover:border-[#FE5E04]"
            >
              View Our Work
            </Link>
          </div>
        </div>

        {/* Hero processor */}

        <div className="flex w-full flex-1 items-center justify-center lg:justify-end">
          <div className="relative flex w-full justify-center">
            <EngineScene />
          </div>
        </div>
      </div>
    </section>
  );
}