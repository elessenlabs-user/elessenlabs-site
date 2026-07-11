"use client";

import Link from "next/link";
import Image from "next/image";
import EngineScene from "../engine/EngineScene";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F9FB]">
      <div className="mx-auto flex min-h-[90vh] max-w-[1600px] items-center px-8 py-20">

        {/* LEFT */}
        <div className="w-full max-w-[650px]">

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FE5E04]">
                Founder-led Digital Consultancy
            </p>

          <h1 className="mt-8 text-6xl font-bold leading-[1.02] tracking-tight text-[#4E5964] md:text-7xl">
            Bringing clarity
            <br />
            to complexity.
           
          </h1>

          <p className="mt-8 max-w-lg text-xl leading-9 text-[#4E5964]/75">
            Helping governments, enterprises and founders transform complexity into trusted digital services, products and experiences.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="#contact"
              className="rounded-xl bg-[#FE5E04] px-6 py-4 font-semibold text-white transition hover:bg-[#E95404]"
            >
              Let's Talk
            </Link>

            <Link
              href="/experience"
              className="rounded-xl border border-[#4E5964]/20 bg-white px-6 py-4 font-semibold text-[#4E5964]"
            >
              View Impact 
            </Link>
          </div>

          <div className="mt-12 text-sm text-[#4E5964]/55">
            Experience includes
          </div>

          <div className="mt-4 flex gap-8 text-lg font-semibold text-[#4E5964]">
            <span>PwC</span>
            <span>Oliver Wyman</span>
            <span>BDO</span>
            <span>ENMAX</span>
          </div>

        </div>
        {/* RIGHT */}

        <div className="flex flex-1 items-center justify-end">
        <div className="relative flex w-full justify-center">
        
    <div className="flex justify-center">
        <EngineScene />
    </div>
    
    </div>

</div>
        

       

      </div>
    </section>
  );
}