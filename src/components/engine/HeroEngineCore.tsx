"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroEngineCore() {
  return (
    <motion.div
      whileHover={{
        scale: 1.025,
        y: -3,
        filter: "drop-shadow(0 0 26px rgba(254,94,4,.42))",
      }}
      animate={{
        scale: [1, 1.01, 1],
        y: [0, -1, 0],
        filter: [
          "drop-shadow(0 0 0px rgba(254,94,4,0))",
          "drop-shadow(0 0 12px rgba(254,94,4,.18))",
          "drop-shadow(0 0 0px rgba(254,94,4,0))",
        ],
      }}
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative"
    >
      <Image
        src="/graphics/engine-core-light.svg"
        alt="Elessen Engine"
        width={520}
        height={520}
        priority
        className="block h-auto w-full"
      />
    </motion.div>
  );
}