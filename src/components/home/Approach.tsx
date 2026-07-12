"use client";

export default function Approach() {
  return (
    <section className="bg-[#F8F9FB] py-20">
      <div className="mx-auto max-w-7xl px-8">

        {/* Header */}

        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
            THE ELESSEN ENGINE™
          </div>

          <h2 className="mt-4 text-5xl font-bold tracking-tight text-[#4E5964]">
            A repeatable framework for
            <br />
            transforming complexity into clarity.
          </h2>

          <p className="mt-6 max-w-2xl text-xl leading-9 text-[#4E5964]/70">
            Every engagement follows a repeatable framework that transforms
            complexity into clear strategy, intuitive experiences and measurable
            outcomes.
          </p>
        </div>

        {/* Timeline */}

        <div className="mt-14">
          <div className="flex flex-col gap-12">

            {/* STEP 1 */}

            <div className="flex items-center gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FE5E04] text-2xl font-bold text-white">
                1
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#4E5964]">
                  Understand
                </h3>

                <p className="mt-2 max-w-xl text-lg leading-8 text-[#4E5964]/70">
                  We understand your users, business goals, constraints and
                  opportunities before making recommendations.
                </p>
              </div>
            </div>

            <div className="ml-8 h-14 w-px bg-[#FE5E04]/20" />

            {/* STEP 2 */}

            <div className="flex items-center gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FE5E04] text-2xl font-bold text-white">
                2
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#4E5964]">
                  Align
                </h3>

                <p className="mt-2 max-w-xl text-lg leading-8 text-[#4E5964]/70">
                  We align stakeholders around priorities, outcomes and a shared
                  product vision before execution begins.
                </p>
              </div>
            </div>

            <div className="ml-8 h-14 w-px bg-[#FE5E04]/20" />

            {/* STEP 3 */}

            <div className="flex items-center gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FE5E04] text-2xl font-bold text-white">
                3
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#4E5964]">
                  Design
                </h3>

                <p className="mt-2 max-w-xl text-lg leading-8 text-[#4E5964]/70">
                  We design products, services and systems that simplify
                  complexity and create intuitive user experiences.
                </p>
              </div>
            </div>

            <div className="ml-8 h-14 w-px bg-[#FE5E04]/20" />

            {/* STEP 4 */}

            <div className="flex items-center gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FE5E04] text-2xl font-bold text-white">
                4
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#4E5964]">
                  Deliver
                </h3>

                <p className="mt-2 max-w-xl text-lg leading-8 text-[#4E5964]/70">
                  We lead delivery from concept to implementation, partnering
                  closely with engineering teams to ensure quality.
                </p>
              </div>
            </div>

            <div className="ml-8 h-14 w-px bg-[#FE5E04]/20" />

            {/* STEP 5 */}

            <div className="flex items-center gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FE5E04] text-2xl font-bold text-white">
                5
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#4E5964]">
                  Improve
                </h3>

                <p className="mt-2 max-w-xl text-lg leading-8 text-[#4E5964]/70">
                  We measure outcomes, iterate continuously and help products
                  evolve through evidence, learning and ongoing optimisation.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}