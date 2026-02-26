"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Start() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    const { error } = await supabase.from("leads").insert([
      {
        email,
        company,
        message,
      },
    ]);

    if (error) {
      setStatus("Something went wrong.");
      console.error(error);
    } else {
      setStatus("You're in — we will contact you shortly.");
      setEmail("");
      setCompany("");
      setMessage("");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-6">Start your product</h1>

      <form onSubmit={submitLead} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />

        <input
          type="text"
          placeholder="Company / Startup name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />

        <textarea
          placeholder="What are you trying to build?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 h-32"
        />

        <button
          type="submit"
          className="w-full bg-black text-white rounded-lg py-3 font-semibold hover:opacity-90"
        >
          Request a consult
        </button>

        {status && <p className="text-sm opacity-70">{status}</p>}
      </form>
    </div>
  );
}