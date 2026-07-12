"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { EngineStatus } from "./EngineCore";

type EngineDisplayProps = {
  status: EngineStatus;
  title?: string;
  message?: string;
  score?: number;
};

export default function EngineDisplay({
  status,
  title,
  message,
  score = 0,
}: EngineDisplayProps) {
  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Elessen Engine™
            </p>

            <p className="mt-3 text-base font-bold text-white">
              Ready
            </p>

            <p className="mt-2 text-[10px] text-[#98A3AF]">
              Add your first ingredient
            </p>
          </>
        );

      case "configured":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Inputs loaded
            </p>

            <p className="mt-3 text-sm font-semibold text-white">
              {title}
            </p>

            <p className="mt-2 text-[10px] text-[#98A3AF]">
              {message}
            </p>
          </>
        );

      case "dragging":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Input bay active
            </p>

            <p className="mt-3 text-base font-bold text-white">
              Drop input
            </p>

            <p className="mt-2 text-[10px] text-[#98A3AF]">
              Release to add ingredient
            </p>
          </>
        );

      case "accepted":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Input accepted
            </p>

            <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">
              {title}
            </p>

            <div className="mt-3 flex items-end justify-center gap-1">
              <span className="text-xl font-bold text-white">
                {score}
              </span>

              <span className="pb-0.5 text-[9px] text-[#98A3AF]">
                /100
              </span>
            </div>
          </>
        );

      case "ready":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Engine ready
            </p>

            <p className="mt-3 text-xl font-bold text-white">
              {score}
              <span className="ml-1 text-[9px] text-[#98A3AF]">
                /100
              </span>
            </p>

            <p className="mt-2 text-[10px] text-[#98A3AF]">
              Press Build Solution
            </p>
          </>
        );

      case "building":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Analysing
            </p>

            <div className="mx-auto mt-4 h-1.5 w-28 overflow-hidden rounded-full bg-[#313943]">
              <motion.div
                className="h-full rounded-full bg-[#FE5E04]"
                initial={{ width: "8%" }}
                animate={{
                  width: ["8%", "48%", "78%", "94%"],
                }}
                transition={{
                  duration: 1.1,
                  ease: "easeInOut",
                }}
              />
            </div>

            <p className="mt-3 text-[10px] text-[#98A3AF]">
              Building your solution
            </p>
          </>
        );

      case "complete":
        return (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
              Solution generated
            </p>

            <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">
              {title}
            </p>

            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-[#B8C1CB]">
              {message}
            </p>
          </>
        );
    }
  };

  return (
    <div className="absolute left-1/2 top-1/2 z-30 flex h-[27%] w-[46%] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[18px] border border-white/5 bg-[#4E5964] text-center shadow-[0_12px_36px_rgba(0,0,0,.42)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${status}-${title ?? ""}-${score}`}
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -4,
          }}
          transition={{
            duration: 0.2,
          }}
          className="relative w-full px-4"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}