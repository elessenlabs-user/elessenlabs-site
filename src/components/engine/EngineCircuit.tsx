"use client";

import styles from "./EngineScene.module.css";


const inputParticles = [
  {
    pathId: "input-1",
    radius: 4,
    begin: "0s",
    duration: "3.1s",
    opacity: 0.95,
  },
  {
    pathId: "input-2",
    radius: 5,
    begin: "0.85s",
    duration: "4.7s",
    opacity: 0.78,
  },
  {
    pathId: "input-3",
    radius: 4,
    begin: "1.9s",
    duration: "3.8s",
    opacity: 1,
  },
  {
    pathId: "input-4",
    radius: 6,
    begin: "0.35s",
    duration: "5.4s",
    opacity: 0.82,
  },
  {
    pathId: "input-5",
    radius: 4,
    begin: "2.3s",
    duration: "4.1s",
    opacity: 0.7,
  },
];

const outputParticles = [
  {
    pathId: "output-1",
    radius: 4,
    begin: "0.45s",
    duration: "3.4s",
    opacity: 0.92,
  },
  {
    pathId: "output-2",
    radius: 5,
    begin: "2.1s",
    duration: "4.9s",
    opacity: 0.78,
  },
  {
    pathId: "output-3",
    radius: 4,
    begin: "0.8s",
    duration: "3.6s",
    opacity: 1,
  },
  {
    pathId: "output-4",
    radius: 6,
    begin: "1.6s",
    duration: "5.2s",
    opacity: 0.84,
  },
  {
    pathId: "output-5",
    radius: 4,
    begin: "2.8s",
    duration: "4.3s",
    opacity: 0.7,
  },
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
  opacity={particle.opacity}
  filter="url(#particle-glow)"
>
  <animateMotion
    begin={particle.begin}
    dur={particle.duration}
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
    opacity={particle.opacity}
    filter="url(#particle-glow)"
  >
    <animateMotion
      begin={particle.begin}
      dur={particle.duration}
      repeatCount="indefinite"
    >
      <mpath href={`#${particle.pathId}`} />
    </animateMotion>
  </circle>
))}
    </svg>
  );
}