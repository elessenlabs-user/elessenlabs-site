"use client";

import Hero from "../components/home/Hero";
import Approach from "../components/home/Approach";
import Solutions from "../components/home/Solutions";
import Work from "../components/home/Work";
import Founder from "../components/home/Founder";
import Contact from "../components/home/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Approach />
      <Solutions />
      <Work />
      <Founder />
      <Contact />
    </>
  );
}