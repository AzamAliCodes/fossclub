"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OptionWheel } from "@/components/ui/OptionWheel";
import TiltCard from "@/components/ui/TiltCard";
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
        
        {/* Left Column: Pure 3D Event Name Scroll (No window / card) */}
        <div className="lg:col-span-5 xl:col-span-5 h-[190px] xs:h-[210px] sm:h-[330px] md:h-[340px] lg:h-[350px] xl:h-[360px] relative flex items-center justify-center overflow-hidden select-none">
          {/* Subtle dynamic ambient green glow behind active selection */}
          <div
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-44 sm:w-60 h-14 sm:h-18 rounded-full blur-2xl pointer-events-none transition-colors duration-500 bg-[#22c55e]/15"
          />

          <OptionWheel
            items={wheelItems}
            defaultSelected={0}
            onChange={handleEventChange}
            textColor="#71717a"
            activeColor="#ffffff"
            side="left"
            fontSize={isMobile ? 1.25 : 1.6}
            spacing={isMobile ? 1.35 : 1.45}
            curve={1.15}
            tilt={isMobile ? 2.5 : 5}
            blur={isMobile ? 0 : 1.2}
            fade={0.25}
            minOpacity={0.15}
            smoothing={160}
            inset={isMobile ? 12 : 20}
            activeGlass={true}
          />
        </div>

        {/* Right Column: Dynamic Event Card & Square Poster Preview (Liquid Glass Transparent Card) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <TiltCard maxTilt={4} scale={1.012} className="h-full w-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvent?._id || activeEvent?.title}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="liquid-glass-card p-3.5 sm:p-4 md:p-5 rounded-2xl border border-white/20 relative overflow-hidden shadow-2xl flex flex-col justify-center flex-1 h-full group"
              >
                {/* Specular Catch-light */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

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
                    className="relative w-[200px] h-[200px] xs:w-[220px] xs:h-[220px] sm:w-[240px] sm:h-[240px] md:w-[260px] md:h-[260px] lg:w-[265px] lg:h-[265px] xl:w-[285px] xl:h-[285px] aspect-square shrink-0 self-center rounded-xl sm:rounded-2xl overflow-hidden bg-white/[0.04] border border-white/20 hover:border-[#22c55e]/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group/poster cursor-pointer transition-all duration-300 block select-none backdrop-blur-md"
                    title="View all events on the Events page"
                  >
                    {/* Blurred ambient glow backdrop from image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-lg opacity-35 scale-110 pointer-events-none"
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
                      className="relative z-10 w-full h-full object-cover object-center group-hover/poster:scale-105 transition-transform duration-500 opacity-95 group-hover/poster:opacity-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-20" />

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-30">
                      <span className="px-3 py-1.5 rounded-xl bg-black/90 border border-[#22c55e]/50 text-xs font-mono text-white flex items-center gap-1.5 shadow-2xl backdrop-blur-md font-semibold group-hover/poster:scale-105 transition-transform">
                        <span>Explore Events</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#22c55e]" />
                      </span>
                    </div>

                    {/* Poster Bottom Badge: Venue */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center text-[10px] font-mono text-zinc-300 pointer-events-none z-30">
                      <span className="flex items-center gap-1 truncate max-w-full bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 shadow-md">
                        <MapPin className="w-2.5 h-2.5 text-[#22c55e] shrink-0" />
                        <span className="truncate">{activeEvent?.venue || "SRMIST Kattankulathur"}</span>
                      </span>
                    </div>
                  </Link>

                  {/* Right / Beside: Event Info & About Description */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2 py-0.5">
                    <div className="space-y-1.5 sm:space-y-2">
                      {/* Header: Core Initiatives styled Status Pill & Archive Tag */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono font-extrabold tracking-[0.2em] uppercase border backdrop-blur-md"
                          style={{
                            color: "#22c55e",
                            backgroundColor: "rgba(34, 197, 94, 0.12)",
                            borderColor: "rgba(34, 197, 94, 0.35)",
                            boxShadow: "0 0 12px rgba(34, 197, 94, 0.18)",
                          }}
                        >
                          <Archive className="w-3 h-3 text-[#22c55e]" />
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
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#a1a1aa] pb-1 border-b border-white/[0.08]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/15 backdrop-blur-md text-zinc-200">
                          <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                          {formatDate(activeEvent?.date || "")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/15 backdrop-blur-md text-zinc-200">
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

                      {/* Action Button */}
                      <div className="pt-1.5">
                        <Link
                          href="/events"
                          onClick={() => {
                            try {
                              playClickSound();
                            } catch {}
                          }}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-bold text-[#fafafa] transition-all hover:border-[#22c55e]/50 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                        >
                          <span>View Full Details</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#22c55e] group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TiltCard>
        </div>

      </div>
    </section>
  );
}
