"use client";

import { openBookingPopup } from "../../lib/bookings";
import AboutMotionPanel from "./AboutMotionPanel";

export default function Founder() {
  return (
    <section
      id="about"
      className="scroll-mt-32 bg-[var(--background)] py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-8">
        <div className="relative overflow-hidden rounded-[40px] bg-[#4E5964] px-8 py-14 text-white shadow-[0_30px_90px_rgba(39,48,60,0.2)] sm:px-12 lg:px-14 lg:py-16">
          {/* Ambient glow */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[440px] w-[440px] rounded-full bg-[#FE5E04]/10 blur-3xl"
          />

          <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            {/* Left column */}

            <div className="flex flex-col">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                  FOUNDER-LED
                </p>

                <h2 className="mt-5 max-w-xl text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">
                  Senior thinking,
                  <br />
                  directly involved.
                </h2>
              </div>

              <AboutMotionPanel />
            </div>

            {/* Right column */}

            <div className="lg:border-l lg:border-white/15 lg:pl-12">
              <p className="max-w-2xl text-xl leading-9 text-white/85">
                Elessen is intentionally small. Every
                engagement is led from discovery through
                delivery by senior product and service
                design leadership, not passed through layers
                of account management.
              </p>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
                We work closely with your team and bring in
                trusted specialists when the work requires
                it. That means faster decisions, clearer
                communication and delivery that stays
                connected to the original business problem.
              </p>

              {/* Proof points */}

              <div className="mt-10 grid gap-6 border-y border-white/15 py-8 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-bold text-white">
                    15+
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Years across product, service design and
                    digital delivery
                  </p>
                </div>

                <div>
                  <p className="whitespace-nowrap text-2xl font-bold text-white sm:text-3xl">
                    End-to-end
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Strategy, research, design, development
                    and improvement
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-white">
                    Direct
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Senior involvement throughout the entire
                    engagement
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openBookingPopup}
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#FE5E04] px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E95404] hover:shadow-[0_16px_40px_rgba(254,94,4,0.25)]"
              >
                Book a discovery session
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}