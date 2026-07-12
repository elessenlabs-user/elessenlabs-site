"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Project = {
  title: string;
  category: string;
  image: string;
  imageClass: string;
  tags: string[];
  summary: string;
  statLabel: string;
  statValue: string;
  challenge: string;
  approach: string;
  outcome: string;
};

const projects: Project[] = [
  {
    title: "Pawzy",
    category: "Pet Care Ecosystem",
    image: "/work/pawzy-dashboard.png",
    imageClass: "object-contain p-6 md:p-8",
    tags: ["Marketplace", "Mobile", "SaaS", "Ecosystem"],
    summary:
      "A live, scalable, multi-sided ecosystem connecting pet parents, verified service providers and local pet businesses.",
    statLabel: "Product status",
    statValue: "Live multi-sided ecosystem",
    challenge:
      "Pet parents needed a safer and simpler way to find trusted local care, while service providers needed practical tools to manage bookings and grow their businesses.",
    approach:
      "We designed and developed an interconnected platform spanning provider onboarding and verification, bookings, payments, messaging, business tools, Pawzy Treats, Pawzy Fund, Biscuit Market and Boost.",
    outcome:
      "A scalable product ecosystem supporting pet parents, service providers, local commerce, rewards and community initiatives within one connected platform.",
  },
  {
    title: "Simple Sequence",
    category: "Communication Automation Platform",
    image: "/work/simple-sequence.png",
    imageClass: "object-contain p-4 md:p-6",
    tags: ["Enterprise", "Automation", "SaaS", "Omnichannel"],
    summary:
      "A live enterprise platform that simplifies the creation and management of automated multi-channel communication sequences.",
    statLabel: "Measured result",
    statValue: "60% faster onboarding",
    challenge:
      "Existing communication automation tools were complex, time-consuming and difficult for enterprise teams to learn and operate.",
    approach:
      "We redesigned the platform around a guided three-step workflow for scheduling, audience selection and sequence creation across multiple communication channels.",
    outcome:
      "The simplified experience reduced onboarding time by more than 60%, lowered operational complexity and supported adoption beyond telecom.",
  },
  {
    title: "Revie Homes",
    category: "Home Renovation Platform",
    image: "/work/revie-homes.png",
    imageClass: "object-cover object-top",
    tags: ["Consumer", "Platform", "UX/UI", "Service Design"],
    summary:
      "A live digital renovation experience that makes complex home improvement planning clear, visual and approachable.",
    statLabel: "Business outcome",
    statValue: "$10M funding secured",
    challenge:
      "Customers needed a simpler way to explore, configure and begin renovation projects across several home improvement categories.",
    approach:
      "We designed an end-to-end digital journey combining project configuration, visual inspiration, transparent options and a mobile-first customer experience.",
    outcome:
      "The platform created a scalable foundation for growth and contributed to Revie Homes securing $10M in investment.",
  },
];

function ProjectDetails({ project }: { project: Project }) {
  return (
    <motion.div
      key="project-details"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="mt-8 space-y-7 border-t border-[#E8ECF1] pt-8">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE5E04]">
            Challenge
          </h4>

          <p className="mt-3 leading-7 text-[#4E5964]/70">
            {project.challenge}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE5E04]">
            Our approach
          </h4>

          <p className="mt-3 leading-7 text-[#4E5964]/70">
            {project.approach}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE5E04]">
            Outcome
          </h4>

          <p className="mt-3 leading-7 text-[#4E5964]/70">
            {project.outcome}
          </p>
        </div>

        <a
          href="#contact"
          className="inline-flex rounded-xl bg-[#FE5E04] px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#E95404]"
        >
          Discuss a similar project
        </a>
      </div>
    </motion.div>
  );
}

export default function Work() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const toggleProject = (title: string) => {
    setExpandedProject((current) => (current === title ? null : title));
  };

  const pawzy = projects[0];
  const supportingProjects = projects.slice(1);

  return (
    <section id="work" className="bg-[#F8F9FB] py-24">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section heading */}

        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
            SELECTED WORK
          </p>

          <h2 className="mt-4 text-5xl font-bold tracking-tight text-[#4E5964]">
            Products built for real-world use.
          </h2>

          <p className="mt-6 text-xl leading-9 text-[#4E5964]/70">
            Live, scalable products spanning marketplaces, enterprise
            automation and consumer services.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {/* Featured Pawzy project */}

          <motion.article
            layout
            className="group overflow-hidden rounded-3xl border border-[#E4E9EF] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[460px] overflow-hidden bg-[#F1F4F8]">
                <Image
                  src={pawzy.image}
                  alt="Pawzy marketplace dashboard"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className={`${pawzy.imageClass} transition-transform duration-700 group-hover:scale-[1.02]`}
                />
              </div>

              <div className="flex min-h-[460px] flex-col justify-center p-10 lg:p-12">
                <div className="h-1 w-10 rounded-full bg-[#FE5E04]" />

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                  {pawzy.category}
                </p>

                <h3 className="mt-3 text-4xl font-bold tracking-tight text-[#4E5964]">
                  {pawzy.title}
                </h3>

                <div className="mt-5 flex flex-wrap gap-2">
                  {pawzy.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-xs font-semibold text-[#4E5964]/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-7 text-lg leading-8 text-[#4E5964]/70">
                  {pawzy.summary}
                </p>

                <div className="mt-8 border-t border-[#E8ECF1] pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4E5964]/50">
                    {pawzy.statLabel}
                  </p>

                  <p className="mt-2 text-xl font-bold text-[#4E5964]">
                    {pawzy.statValue}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleProject(pawzy.title)}
                  aria-expanded={expandedProject === pawzy.title}
                  className="mt-8 flex w-fit items-center gap-2 font-semibold text-[#FE5E04] transition-all hover:gap-3"
                >
                  {expandedProject === pawzy.title
                    ? "Close project"
                    : "See how we solved it"}

                  <span
                    aria-hidden="true"
                    className={`transition-transform duration-300 ${
                      expandedProject === pawzy.title ? "rotate-90" : ""
                    }`}
                  >
                    →
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {expandedProject === pawzy.title && (
                    <ProjectDetails project={pawzy} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.article>

          {/* Supporting projects */}

          <div className="grid items-start gap-8 lg:grid-cols-2">
            {supportingProjects.map((project) => {
              const isExpanded = expandedProject === project.title;

              return (
                <motion.article
                  key={project.title}
                  layout
                  className="group overflow-hidden rounded-3xl border border-[#E4E9EF] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className="relative h-[320px] overflow-hidden bg-[#F1F4F8]">
                    <Image
                      src={project.image}
                      alt={`${project.title} product interface`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`${project.imageClass} transition-transform duration-700 group-hover:scale-[1.02]`}
                    />
                  </div>

                  <div className="p-8">
                    <div className="h-1 w-10 rounded-full bg-[#FE5E04]" />

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                      {project.category}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#4E5964]">
                      {project.title}
                    </h3>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-xs font-semibold text-[#4E5964]/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="mt-7 leading-8 text-[#4E5964]/70">
                      {project.summary}
                    </p>

                    <div className="mt-8 border-t border-[#E8ECF1] pt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4E5964]/50">
                        {project.statLabel}
                      </p>

                      <p className="mt-2 text-lg font-bold text-[#4E5964]">
                        {project.statValue}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProject(project.title)}
                      aria-expanded={isExpanded}
                      className="mt-8 flex items-center gap-2 font-semibold text-[#FE5E04] transition-all hover:gap-3"
                    >
                      {isExpanded ? "Close project" : "See how we solved it"}

                      <span
                        aria-hidden="true"
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        →
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && <ProjectDetails project={project} />}
                    </AnimatePresence>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}