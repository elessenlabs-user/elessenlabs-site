"use client";

import { openBookingPopup } from "../../lib/bookings";

export default function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-32 bg-[#F8F9FB] py-24"
    >
      <div className="mx-auto max-w-5xl px-8">
        <div className="overflow-hidden rounded-[40px] border border-[#E4E9EF] bg-white shadow-[0_24px_80px_rgba(39,48,60,0.12)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* Main message */}

            <div className="p-10 sm:p-12 lg:p-16">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                PRODUCT DISCOVERY SESSION
              </p>

              <h2 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight text-[#4E5964]">
                Let&apos;s build it.
              </h2>

              <p className="mt-7 max-w-2xl text-xl leading-9 text-[#4E5964]/70">
                Book a focused 30-minute conversation about the product,
                service or platform you want to design, build or improve.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F5F7FA] p-5">
                  <p className="font-bold text-[#4E5964]">
                    Bring your idea
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#4E5964]/60">
                    No presentation, brief or preparation is required.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F5F7FA] p-5">
                  <p className="font-bold text-[#4E5964]">
                    Leave with direction
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#4E5964]/60">
                    We&apos;ll discuss the challenge and practical next steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Booking action */}

            <div className="flex flex-col justify-center bg-[#4E5964] p-10 text-white sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                30 MINUTES
              </p>

              <h3 className="mt-4 text-3xl font-bold">
                Choose a time that works.
              </h3>

              <p className="mt-5 leading-8 text-white/65">
               Choose a convenient time and we'll meet over Microsoft Teams to discuss your product, service or platform.
              </p>

              <button
                type="button"
                onClick={openBookingPopup}
                className="mt-9 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE5E04] px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E95404] hover:shadow-[0_16px_40px_rgba(254,94,4,0.25)]"
              >
                Book a Discovery Session
                <span aria-hidden="true">→</span>
              </button>

              <p className="mt-5 text-center text-xs text-white/40">
                Opens Microsoft Bookings securely
              </p>

              <a
                href="mailto:hello@elessenlabs.com"
                className="mt-7 text-center text-sm font-semibold text-white/65 transition hover:text-[#FE5E04]"
              >
                Or email hello@elessenlabs.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}