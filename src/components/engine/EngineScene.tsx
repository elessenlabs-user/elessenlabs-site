"use client";

import styles from "./EngineScene.module.css";
import EngineCircuit from "./EngineCircuit";
import EngineCore from "./EngineCore";

export default function EngineScene() {
  return (
    <div className={styles.scene}>
      <div className={styles.canvas}>
        {/* Ambient glow */}
        <div className={styles.glow} aria-hidden="true" />

        {/* Circuit */}
        <EngineCircuit />

        {/* Engine */}
        <div className={styles.core}>
          <EngineCore />
        </div>
      </div>
    </div>
  );
}