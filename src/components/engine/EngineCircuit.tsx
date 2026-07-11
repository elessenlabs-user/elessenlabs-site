"use client";

import styles from "./EngineScene.module.css";


const inputParticles = [
  { pathId: "input-1", radius: 4, begin: "0s" },
  { pathId: "input-2", radius: 4, begin: "0.12s" },
  { pathId: "input-3", radius: 5, begin: "0.24s" },
  { pathId: "input-4", radius: 4, begin: "0.36s" },
  { pathId: "input-5", radius: 4, begin: "0.48s" },
];

const outputParticles = [
  { pathId: "output-1", radius: 4, begin: "0s" },
  { pathId: "output-2", radius: 4, begin: "0.12s" },
  { pathId: "output-3", radius: 5, begin: "0.24s" },
  { pathId: "output-4", radius: 4, begin: "0.36s" },
  { pathId: "output-5", radius: 4, begin: "0.48s" },
];

export default function EngineCircuit() {    
  
  return (
    <svg
      className={styles.circuit}
      viewBox="0 0 1200 700"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Input traces */}
        <path
          id="input-1"
          d="M120 260 H310 C360 260 390 300 500 300"
        />
        <path
          id="input-2"
          d="M120 320 H330 C385 320 410 330 500 330"
        />
        <path id="input-3" d="M120 350 H500" />
        <path
          id="input-4"
          d="M120 380 H330 C385 380 410 370 500 370"
        />
        <path
          id="input-5"
          d="M120 440 H310 C360 440 390 400 500 400"
        />

        {/* Output traces */}
        <path
          id="output-1"
          d="M700 300 C810 300 840 260 900 260 H1080"
        />
        <path
          id="output-2"
          d="M700 330 C810 330 840 320 900 320 H1080"
        />
        <path id="output-3" d="M700 350 H1080" />
        <path
          id="output-4"
          d="M700 370 C810 370 840 380 900 380 H1080"
        />
        <path
          id="output-5"
          d="M700 400 C810 400 840 440 900 440 H1080"
        />

        <filter
          id="particle-glow"
          x="-200%"
          y="-200%"
          width="400%"
          height="400%"
        >
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Visible traces remain visible throughout the cycle */}
      <g
        fill="none"
        stroke="#D5DBE2"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <use href="#input-1" />
        <use href="#input-2" />
        <use href="#input-3" />
        <use href="#input-4" />
        <use href="#input-5" />

        <use href="#output-1" />
        <use href="#output-2" />
        <use href="#output-3" />
        <use href="#output-4" />
        <use href="#output-5" />
      </g>

      {/* Input particles */}
{inputParticles.map((particle) => (
  <circle
    key={`input-${particle.pathId}`}
    r={particle.radius}
    fill="#FE5E04"
    filter="url(#particle-glow)"
  >
    <animateMotion
      begin={particle.begin}
      dur="3.8s"
      repeatCount="indefinite"
    >
      <mpath href={`#${particle.pathId}`} />
    </animateMotion>
  </circle>
))}{/* Output particles */}
{outputParticles.map((particle) => (
  <circle
    key={`output-${particle.pathId}`}
    r={particle.radius}
    fill="#FE5E04"
    filter="url(#particle-glow)"
  >
    <animateMotion
      begin={particle.begin}
      dur="3.8s"
      repeatCount="indefinite"
    >
      <mpath href={`#${particle.pathId}`} />
    </animateMotion>
  </circle>
))}
    </svg>
  );
}