"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OptionWheel } from "@/components/ui/OptionWheel";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Archive,
} from "lucide-react";
import { ClubEvent } from "@/types";
import { initialEvents } from "@/lib/initialData";
import { formatDate } from "@/lib/utils";
import { playClickSound } from "@/lib/sound";

let cachedWheelEvents: ClubEvent[] | null = null;

export default function FOSSTechnologyWheel() {
  const [eventsList, setEventsList] = useState<ClubEvent[]>(() => cachedWheelEvents || initialEvents);
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
    fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          cachedWheelEvents = data.data;
          setEventsList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter strictly past events (newest first, older events at the end)
  const pastEvents = useMemo(() => {
    const filtered = eventsList
      .filter((e) => !e.active)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return filtered.length > 0 ? filtered : eventsList;
  }, [eventsList]);

  // Strictly real event names — no random hardcoded titles or template text
  const wheelItems = useMemo(
    () => pastEvents.map((e) => e.title.trim()),
    [pastEvents]
  );

  const activeEvent = pastEvents[selectedIndex] || pastEvents[0];

  const handleEventChange = (index: number) => {
    try {
      playClickSound();
    } catch {}
    setSelectedIndex(index);
  };

  if (pastEvents.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-3 border-b border-white/[0.08] pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#fafafa] tracking-tight">
            Past <span className="text-[#22c55e]">Events</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-xl">
            Scroll, drag, or tap the 3D wheel to explore the hackathons, kernel deep-dives, installfests, and workshops organized at SRMIST.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/events"
            onClick={() => {
              try {
                playClickSound();
              } catch {}
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#fafafa] transition-all hover:border-[#22c55e]/50 group"
          >
            <span>Browse All Events</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#22c55e] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Wheel + Event Poster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
        
        {/* Left Column: 3D OptionWheel (Sole scroll source) */}
        <div className="lg:col-span-5 xl:col-span-5 h-[175px] xs:h-[190px] sm:h-[330px] md:h-[340px] lg:h-[340px] xl:h-[350px] relative rounded-2xl border border-white/[0.08] bg-[#060608]/90 backdrop-blur-xl overflow-hidden shadow-2xl p-2 flex items-center justify-center">
          {/* Dynamic ambient glow behind active selection */}
          <div
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-32 sm:w-40 h-12 sm:h-16 rounded-full blur-2xl pointer-events-none transition-colors duration-500 bg-[#22c55e]/15"
          />

          {/* Center active indicator highlight frame without overlapping text */}
          <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-10 sm:h-12 rounded-xl border border-white/20 bg-white/[0.04] pointer-events-none z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />

          <OptionWheel
            items={wheelItems}
            defaultSelected={0}
            onChange={handleEventChange}
            textColor="#52525b"
            activeColor="#fafafa"
            side="left"
            fontSize={isMobile ? 0.95 : 1.1}
            spacing={isMobile ? 1.2 : 1.25}
            curve={1.15}
            tilt={isMobile ? 2.5 : 5}
            blur={1.6}
            fade={0.25}
            minOpacity={0.15}
            smoothing={200}
            inset={isMobile ? 10 : 16}
          />
        </div>

        {/* Right Column: Dynamic Event Card & Square Poster Preview */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent?._id || activeEvent?.title}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="liquid-glass-card p-3 sm:p-4 md:p-4.5 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col justify-center flex-1"
            >
              {/* Specular Catch-light */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-20" />

              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 flex-1">
                {/* Left: Pure 1:1 Square Poster Preview linking to /events */}
                <Link
                  href="/events"
                  onClick={() => {
                    try {
                      playClickSound();
                    } catch {}
                  }}
                  style={{ aspectRatio: "1 / 1" }}
                  className="relative w-[200px] h-[200px] xs:w-[220px] xs:h-[220px] sm:w-[240px] sm:h-[240px] md:w-[260px] md:h-[260px] lg:w-[265px] lg:h-[265px] xl:w-[285px] xl:h-[285px] aspect-square shrink-0 self-center rounded-xl sm:rounded-2xl overflow-hidden bg-[#070a14] border border-white/15 hover:border-[#22c55e]/50 shadow-2xl group cursor-pointer transition-all duration-300 block select-none"
                  title="View all events on the Events page"
                >
                  {/* Blurred ambient glow backdrop from image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110 pointer-events-none"
                    style={{
                      backgroundImage: `url(${
                        activeEvent?.posterUrl ||
                        "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png"
                      })`,
                    }}
                  />

                  {/* High-res Square Poster Preview */}
                  <img
                    src={
                      activeEvent?.posterUrl ||
                      "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png"
                    }
                    alt={activeEvent?.title || "Event Poster"}
                    loading="lazy"
                    decoding="async"
                    className="relative z-10 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-20" />

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-30">
                    <span className="px-3 py-1.5 rounded-xl bg-black/90 border border-[#22c55e]/40 text-xs font-mono text-white flex items-center gap-1.5 shadow-2xl backdrop-blur-md font-semibold group-hover:scale-105 transition-transform">
                      <span>Explore Events</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#22c55e]" />
                    </span>
                  </div>

                  {/* Poster Bottom Badge: Venue */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center text-[10px] font-mono text-zinc-300 pointer-events-none z-30">
                    <span className="flex items-center gap-1 truncate max-w-full bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 shadow-md">
                      <MapPin className="w-2.5 h-2.5 text-[#22c55e] shrink-0" />
                      <span className="truncate">{activeEvent?.venue || "SRMIST Kattankulathur"}</span>
                    </span>
                  </div>
                </Link>

                {/* Right / Beside: Event Info & About Description */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2 py-0.5">
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Header: Status Pill & Archive Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/15 text-zinc-300 text-[10px] font-mono font-semibold">
                        <Archive className="w-3 h-3 text-zinc-400" />
                        PAST EVENT
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 truncate">
                        FOSS SRM Archive
                      </span>
                    </div>

                    {/* Event Title linking to /events */}
                    <Link
                      href="/events"
                      onClick={() => {
                        try {
                          playClickSound();
                        } catch {}
                      }}
                      className="group/title block"
                      title="View all events"
                    >
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-[#fafafa] group-hover/title:text-[#22c55e] transition-colors tracking-tight leading-snug line-clamp-2">
                        {activeEvent?.title}
                      </h3>
                    </Link>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#a1a1aa] pb-1 border-b border-white/[0.06]">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10">
                        <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                        {formatDate(activeEvent?.date || "")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                        {activeEvent?.time || "TBA"}
                      </span>
                    </div>

                    {/* About Section */}
                    <div>
                      <div className="text-[9.5px] font-mono font-semibold uppercase tracking-wider text-[#22c55e] mb-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        About Event
                      </div>
                      <p className="text-zinc-300 text-xs sm:text-[13px] leading-relaxed line-clamp-3 sm:line-clamp-4">
                        {activeEvent?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
