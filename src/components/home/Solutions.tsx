"use client";

const services = [
  {
    title: "Product Strategy",
    description:
      "Define the right product, align stakeholders and create a clear roadmap before investing in delivery.",
  },
  {
    title: "Service Design",
    description:
      "Design end-to-end customer and employee experiences across digital and physical touchpoints.",
  },
  {
    title: "UX/UI Design",
    description:
      "Create intuitive interfaces that balance user needs with measurable business outcomes.",
  },
  {
    title: "Product Management",
    description:
      "Lead product discovery, prioritisation and cross-functional delivery from concept to launch.",
  },
  {
    title: "Digital Product Development",
    description:
      "Partner with engineering teams to design and deliver production-ready digital products.",
  },
  {
    title: "Design Systems",
    description:
      "Build scalable design systems that improve consistency, speed and long-term product quality.",
  },
];

export default function Solutions() {
  return (

    <section
  id="services"
  className="scroll-mt-32 bg-[#F8F9FB] py-24"
>
    
      <div className="mx-auto max-w-7xl px-8">

        <div className="max-w-3xl">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
            SERVICES
          </p>

          <h2 className="mt-4 text-5xl font-bold tracking-tight text-[#4E5964]">
            From strategy to delivery.
          </h2>

          <p className="mt-6 text-xl leading-9 text-[#4E5964]/70">
            Whether you're launching a new product, improving an existing
            service or modernising complex systems, Elessen partners with
            organisations to design and deliver experiences people trust.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {services.map((service) => (

            <div
              key={service.title}
              className="group rounded-3xl border border-[#E6EBF1] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#FE5E04]/30 hover:shadow-xl"
            >

              <div className="mb-6 h-3 w-12 rounded-full bg-[#FE5E04]" />

              <h3 className="text-2xl font-bold text-[#4E5964]">
                {service.title}
              </h3>

              <p className="mt-5 leading-8 text-[#4E5964]/70">
                {service.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}