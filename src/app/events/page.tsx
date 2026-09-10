"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowUpRight,
  Archive,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { ClubEvent } from "@/types";
import { initialEvents } from "@/lib/initialData";
import { formatDate } from "@/lib/utils";
import { playClickSound } from "@/lib/sound";
import SpotlightCard from "@/components/ui/SpotlightCard";

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
function EventCard({ event, isPast }: { event: ClubEvent; isPast?: boolean }) {
  return (
    <motion.div variants={fadeUp} className="group h-full">
      <SpotlightCard
        spotlightColor={isPast ? "rgba(255, 255, 255, 0.12)" : "rgba(34, 197, 94, 0.16)"}
        className="liquid-glass-card overflow-hidden flex flex-col h-full hover:-translate-y-1 relative group rounded-2xl border border-white/15"
      >
        {/* Specular Catch Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

        {/* Poster Media */}
        <div className={`relative overflow-hidden bg-[#111114] shrink-0 ${
          isPast ? "h-32 xs:h-36 sm:h-44 md:h-48" : "h-40 xs:h-44 sm:h-48"
        }`}>
          <img
            src={event.posterUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80"}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-14 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />

          {/* Date & Status Pill Badges */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-start justify-between gap-2">
            <span className="bg-black/75 text-[#fafafa] text-[9px] sm:text-[10px] font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-white/20 backdrop-blur-md">
              {formatDate(event.date)}
            </span>
            {isPast ? (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-black/80 border border-white/20 text-[#a1a1aa] text-[9px] sm:text-[10px] font-mono backdrop-blur-md">
                <Archive className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#a1a1aa]" />
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
        <div className={`flex flex-col flex-1 justify-between ${
          isPast ? "p-3 sm:p-5 gap-2.5 sm:gap-4" : "p-4 sm:p-5 gap-3 sm:gap-4"
        }`}>
          <div>
            <h3 className={`font-bold text-[#fafafa] leading-snug mb-1 sm:mb-1.5 group-hover:text-[#22c55e] transition-colors ${
              isPast ? "text-sm sm:text-base line-clamp-1 sm:line-clamp-2" : "text-base line-clamp-2"
            }`}>
              {event.title}
            </h3>
            <p className={`text-xs text-[#a1a1aa] leading-relaxed ${
              isPast ? "line-clamp-2" : "line-clamp-3"
            }`}>{event.description}</p>
          </div>

          <div className="space-y-2.5 sm:space-y-3 pt-2.5 sm:pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#71717a] font-mono">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Clock className="w-3 h-3 text-[#38bdf8]" /> {event.time}
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 max-w-[55%] truncate">
                <MapPin className="w-3 h-3 text-[#22c55e] shrink-0" />
                <span className="truncate">{event.venue}</span>
              </span>
            </div>

            {isPast ? (
              <div className="flex items-center justify-between gap-2 pt-0.5 sm:pt-1">
                {event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => { try { playClickSound(); } catch {} }}
                    className="w-full py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono font-bold transition-all duration-200 border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-[#fafafa] hover:-translate-y-px active:translate-y-0"
                  >
                    Event Recap
                    <ArrowUpRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#a1a1aa]" />
                  </a>
                ) : (
                  <span className="w-full py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-mono text-[#71717a] border border-white/[0.06] rounded-xl bg-white/[0.02]">
                    Past Event
                  </span>
                )}
              </div>
            ) : (
              event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => { try { playClickSound(); } catch {} }}
                  className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all duration-200 bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-lg shadow-[#22c55e]/20 hover:-translate-y-px active:translate-y-0"
                >
                  Register Now <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )
            )}
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ─── Past Event Row (archive list style) ────────────────────────────────── */
function PastEventRow({ event, index }: { event: ClubEvent; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group flex items-center gap-3 sm:gap-4 py-2.5 sm:py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.03] px-2.5 sm:px-4 rounded-xl transition-colors"
    >
      <span className="text-zinc-500 font-mono text-[10px] sm:text-xs w-5 sm:w-6 shrink-0 text-right select-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-[#111114] shrink-0 border border-white/10">
        <img
          src={event.posterUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=60"}
          alt={event.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-[#e4e4e7] group-hover:text-[#22c55e] transition-colors truncate leading-tight">
          {event.title}
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono text-[#71717a] mt-0.5 truncate">
          {formatDate(event.date)}&nbsp;·&nbsp;{event.venue}
        </p>
      </div>

      {event.registrationUrl && (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => { try { playClickSound(); } catch {} }}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-[#fafafa] shrink-0 transition-colors"
        >
          <span>Recap</span>
          <ArrowUpRight className="w-3 h-3 text-[#a1a1aa]" />
        </a>
      )}

      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
    </motion.div>
  );
}

/* ─── Global In-Memory Cache for 0ms Instant Navigation ─────────────────── */
let cachedEventsData: ClubEvent[] | null = null;

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>(() => cachedEventsData || initialEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [mainTab, setMainTab] = useState<"upcoming" | "past">(() => {
    const list = cachedEventsData || initialEvents;
    const hasUpcoming = list.some((e) => e.active);
    return hasUpcoming ? "upcoming" : "past";
  });
  const [pastViewMode, setPastViewMode] = useState<"grid" | "list">("grid");
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  useEffect(() => {
    fetch("/api/events")
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

  const upcoming = events.filter((e) => e.active);
  const past     = events.filter((e) => !e.active);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-white/[0.08]">
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

          {/* Past Events View Mode Switcher (Grid vs List) */}
          {mainTab === "past" && past.length > 0 && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-inner self-end sm:self-auto">
              <button
                onClick={() => {
                  try { playClickSound(); } catch {}
                  setPastViewMode("grid");
                }}
                title="Grid view (3 in a row)"
                className={`p-2 rounded-lg transition-all ${
                  pastViewMode === "grid"
                    ? "bg-white/[0.16] text-white shadow-sm"
                    : "text-[#71717a] hover:text-[#fafafa]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  try { playClickSound(); } catch {}
                  setPastViewMode("list");
                }}
                title="Archive list view"
                className={`p-2 rounded-lg transition-all ${
                  pastViewMode === "list"
                    ? "bg-white/[0.16] text-white shadow-sm"
                    : "text-[#71717a] hover:text-[#fafafa]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
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
                  <EventCard key={evt._id} event={evt} />
                ))}
              </motion.div>
            )}
          </motion.section>
        )}

        {/* ── TAB 2: PAST EVENTS (3-IN-A-ROW GRID OR LIST) ── */}
        {mainTab === "past" && (
          <motion.section
            key="past-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-[#a1a1aa]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">Past Events</h2>
                <span className="text-[10px] sm:text-xs font-mono text-[#a1a1aa] bg-white/[0.05] border border-white/10 px-2 sm:px-2.5 py-0.5 rounded-full">
                  {past.length} recorded
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 sm:hidden">
                Swipe to scroll
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
            ) : pastViewMode === "list" ? (
              <div className="liquid-glass-card rounded-2xl border border-white/15 p-2 sm:p-4 shadow-2xl divide-y divide-white/[0.08] max-h-[420px] sm:max-h-none overflow-y-auto overscroll-contain">
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1">
                  {past.map((evt, i) => (
                    <PastEventRow key={evt._id} event={evt} index={i} />
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="relative">
                <div className="max-h-[480px] sm:max-h-none overflow-y-auto overscroll-contain pr-1 sm:pr-0 -mr-1 sm:mr-0 rounded-2xl">
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 pb-6 sm:pb-0"
                  >
                    {past.map((evt) => (
                      <EventCard key={evt._id} event={evt} isPast={true} />
                    ))}
                  </motion.div>
                </div>
                {/* Mobile subtle fade hint at bottom */}
                <div className="sm:hidden pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl" />
              </div>
            )}
          </motion.section>
        )}

      </main>
    </div>
  );
}
