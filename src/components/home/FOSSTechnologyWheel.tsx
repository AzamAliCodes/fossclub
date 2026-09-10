"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OptionWheel } from "@/components/ui/OptionWheel";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ArrowRight,
  Archive,
} from "lucide-react";
import { ClubEvent } from "@/types";
import { initialEvents } from "@/lib/initialData";
import { formatDate } from "@/lib/utils";
import { playClickSound } from "@/lib/sound";

/* ─── Short Display Titles for Wheel ─────────────────────────────────────── */
function getShortTitle(title: string): string {
  if (title.includes("FOSS Meetup") || title.includes("Chennai")) return "Chennai FOSS Guild";
  if (title.includes("Git") || title.includes("First PR")) return "Git & First PR Sprint";
  if (title.includes("CTF") || title.includes("Capture The Flag")) return "FOSS CTF 2025";
  return title.length > 25 ? title.slice(0, 22) + "..." : title;
}

export default function FOSSTechnologyWheel() {
  const [eventsList, setEventsList] = useState<ClubEvent[]>(initialEvents);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch real-time CMS events in background
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setEventsList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter strictly past events (no upcoming flagship hackathons in past events)
  const pastEvents = useMemo(() => {
    const filtered = eventsList.filter((e) => !e.active);
    return filtered.length > 0 ? filtered : eventsList;
  }, [eventsList]);

  const wheelItems = useMemo(
    () => pastEvents.map((e) => getShortTitle(e.title)),
    [pastEvents]
  );

  const activeEvent = pastEvents[selectedIndex] || pastEvents[0];

  const handleEventChange = (index: number) => {
    try {
      playClickSound();
    } catch {}
    setSelectedIndex(index);
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-10 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4 border-b border-white/[0.08] pb-5 sm:pb-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
            Past <span className="text-[#22c55e]">Events</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-xl">
            Scroll, drag, or tap the 3D wheel to explore the hackathons, kernel deep-dives, installfests, and workshops organized at SRMIST.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#fafafa] transition-all hover:border-[#22c55e]/50 group"
          >
            <span>Browse All Events</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#22c55e] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Wheel + Event Poster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch">
        
        {/* Left Column: 3D OptionWheel */}
        <div className="lg:col-span-5 xl:col-span-5 h-[195px] xs:h-[215px] sm:h-auto sm:min-h-[460px] relative rounded-2xl border border-white/[0.08] bg-[#060608]/90 backdrop-blur-xl overflow-hidden shadow-2xl p-2 flex items-center justify-center">
          {/* Dynamic ambient glow behind active selection */}
          <div
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-36 sm:w-48 h-14 sm:h-20 rounded-full blur-2xl pointer-events-none transition-colors duration-500 bg-[#22c55e]/15"
          />

          {/* Center active indicator highlight frame without overlapping text */}
          <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-11 sm:h-14 rounded-xl border border-white/20 bg-white/[0.04] pointer-events-none z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />

          <OptionWheel
            items={wheelItems}
            defaultSelected={0}
            onChange={handleEventChange}
            textColor="#52525b"
            activeColor="#fafafa"
            side="left"
            fontSize={isMobile ? 1.15 : 1.65}
            spacing={isMobile ? 1.22 : 1.3}
            curve={1.2}
            tilt={isMobile ? 3 : 7}
            blur={1.6}
            fade={0.25}
            minOpacity={0.15}
            smoothing={200}
            inset={isMobile ? 10 : 20}
          />
        </div>

        {/* Right Column: Dynamic Event Card & Poster Preview */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent?._id || activeEvent?.title}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="liquid-glass-card p-5 sm:p-7 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col justify-between flex-1"
            >
              {/* Specular Catch-light */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-20" />

              <div>
                {/* Header: Status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/15 text-zinc-300 text-[10px] font-mono font-semibold">
                    <Archive className="w-3 h-3 text-zinc-400" />
                    PAST EVENT
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    FOSS Club SRM Archive
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-xl sm:text-2xl font-black text-[#fafafa] tracking-tight leading-tight mb-4">
                  {activeEvent?.title}
                </h3>

                {/* Event Poster Showcase */}
                <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-[#111114] border border-white/10 mb-4 group shrink-0">
                  <img
                    src={
                      activeEvent?.posterUrl ||
                      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80"
                    }
                    alt={activeEvent?.title || "Event Poster"}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300 pointer-events-none">
                    <span className="flex items-center gap-1.5 truncate max-w-[80%]">
                      <MapPin className="w-3 h-3 text-[#22c55e] shrink-0" />
                      <span className="truncate">{activeEvent?.venue || "SRMIST Kattankulathur"}</span>
                    </span>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-4 text-xs text-[#a1a1aa] font-mono mb-4 pb-3 border-b border-white/[0.06]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                    {formatDate(activeEvent?.date || "")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                    {activeEvent?.time || "TBA"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                  {activeEvent?.description}
                </p>

                {/* Tags */}
                {activeEvent?.tags && activeEvent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {activeEvent.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[10px] font-mono text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 pt-3 border-t border-white/[0.08] mt-auto">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-black text-xs font-mono font-bold transition-all duration-200 bg-[#22c55e] hover:bg-[#16a34a] active:scale-95 shadow-lg shadow-[#22c55e]/20 text-center"
                >
                  <span>View Event Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {activeEvent?.registrationUrl && (
                  <a
                    href={activeEvent.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-colors text-center"
                  >
                    <span>FOSS United Page</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
