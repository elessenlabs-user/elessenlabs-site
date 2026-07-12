"use client";

import styles from "./EngineScene.module.css";
import EngineCircuit from "./EngineCircuit";
import HeroEngineCore from "./HeroEngineCore";

export default function EngineScene() {
  return (
    <div className={styles.scene}>
      <div className={styles.canvas}>
        {/* Ambient glow */}
        <div className={styles.glow} aria-hidden="true" />

        {/* Animated hero circuitry */}
        <EngineCircuit />

        {/* Original hero processor with EL logo */}
        <div className={styles.core}>
          <HeroEngineCore />
        </div>
      </div>
    </div>
  );
}