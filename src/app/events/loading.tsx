import React from "react";
import { Calendar } from "lucide-react";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-transparent text-[#fafafa]">
      {/* PAGE HEADER */}
      <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl xs:text-5xl md:text-7xl font-black text-[#fafafa] leading-[0.96] tracking-tight">
          Where Open Source<br />
          <span style={{ color: "#22c55e" }}>Meets</span> Community
        </h1>
      </section>

      {/* MAIN CONTENT */}
      <main className="px-4 sm:px-6 max-w-6xl mx-auto pb-28 pt-4 sm:pt-8 space-y-8 sm:space-y-10">
        {/* TABS */}
        <div className="flex items-center justify-start pb-5 sm:pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-white/[0.07] border border-white/20 backdrop-blur-2xl w-full sm:w-auto">
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold bg-[#0c2317]/90 text-[#22c55e] border border-[#14532d] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span>Upcoming</span>
            </div>
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold text-[#a1a1aa] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#a1a1aa]" />
              <span>Past Events</span>
            </div>
          </div>
        </div>

        {/* SKELETON CARDS */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
            <h2 className="text-2xl font-bold tracking-tight text-white font-mono">Upcoming Events</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] h-80" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
