"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowUpRight,
  Archive,
  X,
  ExternalLink,
} from "lucide-react";
import { ClubEvent } from "@/types";
import { initialEvents } from "@/lib/initialData";
import { formatDate } from "@/lib/utils";
import { playClickSound } from "@/lib/sound";
import SpotlightCard from "@/components/ui/SpotlightCard";
import EventDetailModal from "@/components/ui/EventDetailModal";

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 180, damping: 22 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};


/* ─── Uniform 3-in-a-Row Event Card ───────────────────────────────────────── */
function EventCard({
  event,
  isPast,
  onSelect,
}: {
  event: ClubEvent;
  isPast?: boolean;
  onSelect: (event: ClubEvent) => void;
}) {
  return (
    <motion.div variants={fadeUp} className="group h-full">
      <SpotlightCard
        spotlightColor={isPast ? "rgba(255, 255, 255, 0.12)" : "rgba(34, 197, 94, 0.16)"}
        className="liquid-glass-card overflow-hidden flex flex-col h-full hover:-translate-y-1 relative group rounded-2xl border border-white/15 cursor-pointer"
        onClick={() => {
          try { playClickSound(); } catch {}
          onSelect(event);
        }}
      >
        {/* Specular Catch Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

        {/* Poster Media */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-[#111114] shrink-0">
          <img
            src={event.posterUrl || "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png"}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />

          {/* Date & Status Pill Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <span className="bg-black/75 text-[#fafafa] text-[10px] font-mono px-2.5 py-1 rounded-lg border border-white/20 backdrop-blur-md">
              {formatDate(event.date)}
            </span>
            {isPast ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 text-[#a1a1aa] text-[10px] font-mono backdrop-blur-md">
                <Archive className="w-3 h-3 text-[#a1a1aa]" />
                Past Event
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c2317]/90 border border-[#14532d] text-[#22c55e] text-[10px] font-mono font-bold backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                Upcoming
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 gap-3 sm:gap-4">
          <div>
            <h3 className="font-bold text-[#fafafa] leading-snug mb-1.5 group-hover:text-[#22c55e] transition-colors text-base line-clamp-2">
              {event.title}
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2 sm:line-clamp-3">
              {event.description}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#38bdf8]" /> {event.time}
              </span>
              <span className="flex items-center gap-1.5 max-w-[55%] truncate">
                <MapPin className="w-3 h-3 text-[#22c55e] shrink-0" />
                <span className="truncate">{event.venue}</span>
              </span>
            </div>

            {isPast ? (
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    try { playClickSound(); } catch {}
                    onSelect(event);
                  }}
                  className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all duration-200 border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-[#fafafa] hover:-translate-y-px active:translate-y-0 cursor-pointer"
                >
                  More Info
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#a1a1aa]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      try { playClickSound(); } catch {}
                    }}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all duration-200 bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-lg shadow-[#22c55e]/20 hover:-translate-y-px active:translate-y-0"
                  >
                    Register Now <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    try { playClickSound(); } catch {}
                    onSelect(event);
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
                  title="View full event details"
                >
                  Details
                </button>
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ─── Global In-Memory Cache for 0ms Instant Navigation ─────────────────── */
let cachedEventsData: ClubEvent[] | null = null;

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>(() => cachedEventsData || initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mainTab, setMainTab] = useState<"upcoming" | "past">(() => {
    const list = cachedEventsData || initialEvents;
    const hasUpcoming = list.some((e) => e.active);
    return hasUpcoming ? "upcoming" : "past";
  });
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  useEffect(() => {
    fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          cachedEventsData = data.data;
          setEvents(data.data);
          const hasUpcoming = data.data.some((e: ClubEvent) => e.active);
          setMainTab(hasUpcoming ? "upcoming" : "past");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Upcoming events: soonest date first
  const upcoming = useMemo(() => {
    return [...events]
      .filter((e) => e.active)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  // Past events: newest date first, older events at the end
  const past = useMemo(() => {
    return [...events]
      .filter((e) => !e.active)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  return (
    <div className="min-h-screen bg-transparent text-[#fafafa]">

      {/* PAGE HEADER */}
      <section ref={headerRef} className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="text-4xl xs:text-5xl md:text-7xl font-black text-[#fafafa] leading-[0.96] tracking-tight">
            Where Open Source<br />
            <span style={{ color: "#22c55e" }}>Meets</span> Community
          </h1>
        </motion.div>
      </section>

      {/* MAIN CONTENT */}
      <main className="px-4 sm:px-6 max-w-6xl mx-auto pb-28 pt-4 sm:pt-8 space-y-8 sm:space-y-10">

        {/* PRIMARY EVENT TABS: UPCOMING EVENTS vs PAST EVENTS */}
        <div className="flex items-center justify-start pb-5 sm:pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-white/[0.07] border border-white/20 backdrop-blur-2xl w-full sm:w-auto shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.28)]">
            <button
              onClick={() => {
                try { playClickSound(); } catch {}
                setMainTab("upcoming");
              }}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === "upcoming"
                  ? "bg-[#0c2317]/90 text-[#22c55e] border border-[#14532d] shadow-[0_0_20px_rgba(34,197,94,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                  : "text-[#a1a1aa] hover:text-[#fafafa]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span>Upcoming</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-black/50 text-[10px] text-[#22c55e] border border-[#14532d]">
                {upcoming.length}
              </span>
            </button>

            <button
              onClick={() => {
                try { playClickSound(); } catch {}
                setMainTab("past");
              }}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === "past"
                  ? "bg-white/[0.14] text-white border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.25),inset_0_1px_1px_0_rgba(255,255,255,0.35)]"
                  : "text-[#a1a1aa] hover:text-[#fafafa]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#a1a1aa]" />
              <span>Past Events</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-black/50 text-[10px] text-[#fafafa] border border-white/10">
                {past.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: UPCOMING EVENTS (3-IN-A-ROW GRID) ── */}
        {mainTab === "upcoming" && (
          <motion.section
            key="upcoming-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">Upcoming Events</h2>
              <span className="text-xs font-mono text-[#22c55e] bg-[#0c2317] border border-[#14532d] px-2.5 py-0.5 rounded-full">
                {upcoming.length} active
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] h-80" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="border border-dashed border-white/15 rounded-2xl p-16 text-center backdrop-blur-md bg-white/[0.01]">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-5 h-5 text-[#71717a]" />
                </div>
                <p className="text-[#fafafa] font-semibold mb-1">
                  No upcoming events scheduled right now
                </p>
                <p className="text-[#71717a] text-xs font-mono">Check out our past events or follow our channels to get notified.</p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {upcoming.map((evt) => (
                  <EventCard key={evt._id} event={evt} onSelect={setSelectedEvent} />
                ))}
              </motion.div>
            )}
          </motion.section>
        )}

        {/* ── TAB 2: PAST EVENTS (3-IN-A-ROW GRID) ── */}
        {mainTab === "past" && (
          <motion.section
            key="past-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-[#a1a1aa]" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">Past Events</h2>
              <span className="text-[10px] sm:text-xs font-mono text-[#a1a1aa] bg-white/[0.05] border border-white/10 px-2 sm:px-2.5 py-0.5 rounded-full">
                {past.length} recorded
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] h-64 sm:h-80" />
                ))}
              </div>
            ) : past.length === 0 ? (
              <div className="border border-dashed border-white/15 rounded-2xl p-16 text-center backdrop-blur-md bg-white/[0.01]">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-5 h-5 text-[#71717a]" />
                </div>
                <p className="text-[#fafafa] font-semibold mb-1">
                  No past events recorded yet
                </p>
                <p className="text-[#71717a] text-xs font-mono">Past workshops, hackathons, and meetups will appear here.</p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {past.map((evt) => (
                  <EventCard key={evt._id} event={evt} isPast={true} onSelect={setSelectedEvent} />
                ))}
              </motion.div>
            )}
          </motion.section>
        )}

      </main>

      {/* Detail Pop-up Modal (Smoothly Animated) */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
