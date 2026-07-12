"use client";

import Hero from "../components/home/Hero";
import Approach from "../components/home/Approach";
import Solutions from "../components/home/Solutions";
import Work from "../components/home/Work";
import Founder from "../components/home/Founder";
import Contact from "../components/home/Contact";
import Trusted from "../components/home/Trusted";
import EngineSection from "../components/engine/EngineSection";

export default function Home() {
  return (
    <>
  <Hero />
  <Trusted />
  <EngineSection />
  <Solutions />
  <Work />
  <Founder />
  <Contact />
</>
  );
}