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
import TiltCard from "@/components/ui/TiltCard";
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


/* ─── Uniform 3-in-a-Row Event Card (Core Initiatives Glass Style) ────────── */
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
      <TiltCard maxTilt={5} scale={1.012} className="h-full w-full">
        <div
          className="liquid-glass-card p-5 sm:p-6 h-full w-full flex flex-col justify-between relative group rounded-2xl border border-white/15 hover:border-white/35 transition-all duration-300 cursor-pointer select-none min-h-[360px]"
          onClick={() => {
            try { playClickSound(); } catch {}
            onSelect(event);
          }}
        >
          {/* Specular Catch Light */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

          {/* Top Row: Pill Tag & Corner Icon Badge (Core Initiatives Style) */}
          <div className="flex items-center justify-between gap-2.5 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-mono font-extrabold tracking-[0.22em] uppercase px-3 py-1 rounded-md border backdrop-blur-md"
                style={{
                  color: isPast ? "#fafafa" : "#22c55e",
                  backgroundColor: isPast ? "rgba(255, 255, 255, 0.08)" : "rgba(34, 197, 94, 0.12)",
                  borderColor: isPast ? "rgba(255, 255, 255, 0.22)" : "rgba(34, 197, 94, 0.35)",
                  boxShadow: isPast ? "0 0 12px rgba(255, 255, 255, 0.12)" : "0 0 12px rgba(34, 197, 94, 0.25)",
                }}
              >
                {isPast ? "PAST EVENT" : "UPCOMING"}
              </span>
              <span className="text-xs font-mono text-[#a1a1aa] font-bold">
                {formatDate(event.date)}
              </span>
            </div>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/15 bg-white/[0.05] backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] group-hover:border-white/35 transition-colors">
              {isPast ? (
                <Archive className="w-4 h-4 text-zinc-300 group-hover:scale-110 transition-transform relative z-10" />
              ) : (
                <Calendar className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform relative z-10" />
              )}
            </div>
          </div>

          {/* Poster Media (Glass Transparent Container) */}
          {event.posterUrl && (
            <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden border border-white/15 bg-white/[0.03] backdrop-blur-md mb-4 shrink-0 group/poster shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
              <img
                src={event.posterUrl}
                alt={event.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 border border-white/15 text-[10px] font-mono text-zinc-300 backdrop-blur-md">
                Click for details
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div className="flex-1 mb-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#fafafa] mb-2 tracking-tight leading-snug group-hover:text-[#22c55e] transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="text-[#a1a1aa] text-xs sm:text-sm leading-relaxed font-sans line-clamp-3">
              {event.description}
            </p>
          </div>

          {/* Footer Info & Actions */}
          <div className="space-y-3 pt-3 border-t border-white/10 mt-auto relative z-10">
            <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" /> {event.time}
              </span>
              <span className="flex items-center gap-1.5 max-w-[55%] truncate">
                <MapPin className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                <span className="truncate">{event.venue}</span>
              </span>
            </div>

            {isPast ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  try { playClickSound(); } catch {}
                  onSelect(event);
                }}
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all duration-200 border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-[#fafafa] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-px active:translate-y-0 cursor-pointer"
              >
                <span>View Event Details</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#a1a1aa] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
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
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
                  title="View full event details"
                >
                  Details
                </button>
              </div>
            )}
          </div>
        </div>
      </TiltCard>
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
