"use client";

export default function EngineDiagram() {
  return (
    <svg
      viewBox="0 0 1200 700"
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* LEFT */}

      <path
        d="M180 145 H470 C530 145 555 220 600 220"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M180 250 H470 C530 250 555 285 600 285"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M180 350 H470 C530 350 555 350 600 350"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M180 450 H470 C530 450 555 415 600 415"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M180 555 H470 C530 555 555 480 600 480"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* RIGHT */}

      <path
        d="M600 220 C645 220 670 145 1020 145"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M600 285 C645 285 670 250 1020 250"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M600 350 C645 350 670 350 1020 350"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M600 415 C645 415 670 450 1020 450"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M600 480 C645 480 670 555 1020 555"
        stroke="#D7DEE5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}