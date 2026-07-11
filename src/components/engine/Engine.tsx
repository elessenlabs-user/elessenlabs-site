"use client";

import Image from "next/image";
import styles from "./Engine.module.css";

export default function Engine() {
  return (
    <div className={styles.engine}>
      <Image
        src="/graphics/glow.svg"
        alt=""
        aria-hidden="true"
        width={900}
        height={900}
        className={styles.glow}
      />

      <Image
        src="/graphics/circuit-line.svg"
        alt=""
        aria-hidden="true"
        width={1200}
        height={220}
        className={styles.circuitLeft}
      />

      <Image
        src="/graphics/circuit-line.svg"
        alt=""
        aria-hidden="true"
        width={1200}
        height={220}
        className={styles.circuitRight}
      />

      <Image
        src="/graphics/engine-core-light.svg"
        alt="Elessen transformation engine"
        width={700}
        height={700}
        priority
        className={styles.core}
      />
    </div>
  );
}