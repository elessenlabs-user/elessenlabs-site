"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import EngineDisplay from "./EngineDisplay";

export type EngineStatus =
  | "idle"
  | "configured"
  | "dragging"
  | "accepted"
  | "ready"
  | "building"
  | "complete";

type EngineCoreProps = {
  status: EngineStatus;
  title?: string;
  message?: string;
  score?: number;
};

export default function EngineCore({
  status,
  title,
  message,
  score = 0,
}: EngineCoreProps) {
  const animation =
    status === "building"
      ? {
          scale: [1, 1.04, 1],
          filter: [
            "drop-shadow(0 0 14px rgba(254,94,4,.2))",
            "drop-shadow(0 0 38px rgba(254,94,4,.5))",
            "drop-shadow(0 0 14px rgba(254,94,4,.2))",
          ],
        }
      : status === "accepted"
        ? {
            scale: [1, 1.035, 1],
            filter: [
              "drop-shadow(0 0 10px rgba(254,94,4,.12))",
              "drop-shadow(0 0 30px rgba(254,94,4,.42))",
              "drop-shadow(0 0 10px rgba(254,94,4,.12))",
            ],
          }
        : status === "complete"
          ? {
              scale: [1, 1.025, 1],
              filter: [
                "drop-shadow(0 0 12px rgba(254,94,4,.16))",
                "drop-shadow(0 0 34px rgba(254,94,4,.44))",
                "drop-shadow(0 0 12px rgba(254,94,4,.16))",
              ],
            }
          : status === "dragging"
            ? {
                scale: 1.02,
                filter:
                  "drop-shadow(0 0 28px rgba(254,94,4,.34))",
              }
            : {
                scale: [1, 1.008, 1],
                filter: [
                  "drop-shadow(0 0 0px rgba(254,94,4,0))",
                  "drop-shadow(0 0 14px rgba(254,94,4,.16))",
                  "drop-shadow(0 0 0px rgba(254,94,4,0))",
                ],
              };

  const shouldRepeat =
    status === "idle" ||
    status === "configured" ||
    status === "ready" ||
    status === "building";

  return (
    <motion.div
      className="relative w-full"
      animate={animation}
      transition={{
        duration:
          status === "accepted"
            ? 0.55
            : status === "complete"
              ? 0.7
              : status === "building"
                ? 0.9
                : 3.8,
        repeat: shouldRepeat ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      <Image
        src="/graphics/engine-core-light.svg"
        alt="Interactive Elessen processor"
        width={520}
        height={520}
        priority
        className="block h-auto w-full"
      />

      <EngineDisplay
        status={status}
        title={title}
        message={message}
        score={score}
      />
    </motion.div>
  );
}