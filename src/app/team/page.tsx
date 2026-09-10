"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Users, ChevronDown, Award, Check } from "lucide-react";
import { TeamMember, DomainType } from "@/types";
import { playClickSound } from "@/lib/sound";

/* ─── Social SVGs (LinkedIn, Instagram, GitHub ONLY) ─────────────────────── */
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

/* ─── Domain & Position Config ────────────────────────────────────────────── */
const DOMAIN_META: Record<string, { color: string; bg: string; border: string }> = {
  Technical: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.35)" },
  Corporate: { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.35)" },
  Creative:  { color: "#c084fc", bg: "rgba(192, 132, 252, 0.15)", border: "rgba(192, 132, 252, 0.35)" },
};

const POSITION_ORDER = ["Head of Club", "Maintainer", "Volunteer"];

const POSITION_BADGE: Record<string, { color: string; bg: string; border: string }> = {
  "Head of Club": { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" },
  "Maintainer":   { color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.28)" },
  "Volunteer":    { color: "#a1a1aa", bg: "rgba(255, 255, 255, 0.05)", border: "rgba(255, 255, 255, 0.1)" },
};

/* ─── Motion Variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:  { opacity: 0, transition: { duration: 0.15 } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

/* ─── Member Card (Clean, Sharp, Zero Blur on Hover/Click) ─────────────────── */
function LiquidGlassMemberCard({
  member,
  position,
  activeYear,
}: {
  member: TeamMember;
  position: string;
  activeYear: string;
}) {
  const dm = DOMAIN_META[member.domain] || DOMAIN_META.Technical;
  const pb = POSITION_BADGE[position] || POSITION_BADGE.Volunteer;

  // Resolve academic year to display below the photo
  const displayYear =
    activeYear !== "All"
      ? activeYear
      : (member.statusHistory?.[0]?.year || null);

  return (
    <motion.div variants={fadeUp} layout className="group h-full">
      <div className="bg-[#0c0c0e] rounded-2xl p-3 sm:p-3.5 h-full relative flex flex-col justify-between border border-white/10 hover:border-white/30 transition-colors shadow-lg overflow-hidden">
        {/* Specular Catch-light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div>
          {/* Square Image Container with Rounded Corners - Clean without overlays */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#060608] shrink-0 border border-white/10 shadow-inner mb-3">
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold font-mono text-[#22c55e]/40">
                {member.name[0] || "?"}
              </div>
            )}

            {/* Ambient Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-xl" />
          </div>

          {/* Content Body */}
          <div>
            <h3 className="text-[#fafafa] font-extrabold text-sm group-hover:text-[#22c55e] transition-colors truncate tracking-tight">
              {member.name}
            </h3>

            {member.caption && (
              <p className="text-[#71717a] text-[11px] font-sans mt-0.5 truncate leading-tight">
                {member.caption}
              </p>
            )}

            {/* Separate Badges: Position, Domain, and Academic Year */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {/* Box 1: Position */}
              <span
                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider"
                style={{ color: pb.color, background: pb.bg, borderColor: pb.border }}
              >
                {position === "Head of Club" && <Award className="w-2.5 h-2.5 shrink-0" />}
                <span>{position}</span>
              </span>

              {/* Box 2: Domain */}
              <span
                className="inline-flex items-center text-[9px] sm:text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider"
                style={{ color: dm.color, background: dm.bg, borderColor: dm.border }}
              >
                <span>{member.domain}</span>
              </span>

              {/* Box 3: Academic Year */}
              {displayYear && (
                <span className="inline-flex items-center text-[9px] sm:text-[10px] font-mono font-bold text-zinc-300 px-2 py-0.5 rounded border border-white/10 bg-white/[0.04] tracking-wider">
                  <span>{displayYear}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Social Links (LinkedIn, Instagram, GitHub ONLY) with prominent glowing buttons */}
        {(member.github || member.linkedin || member.instagram) && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08] mt-3">
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                onClick={() => { try { playClickSound(); } catch {} }}
                className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/10 hover:shadow-[0_0_18px_rgba(255,255,255,0.45)] transition-all duration-200 active:scale-95"
                title="GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={() => { try { playClickSound(); } catch {} }}
                className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-[#38bdf8] hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/10 hover:shadow-[0_0_18px_rgba(56,189,248,0.5)] transition-all duration-200 active:scale-95"
                title="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noreferrer"
                onClick={() => { try { playClickSound(); } catch {} }}
                className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-[#c084fc] hover:border-[#c084fc]/50 hover:bg-[#c084fc]/10 hover:shadow-[0_0_18px_rgba(192,132,252,0.5)] transition-all duration-200 active:scale-95"
                title="Instagram Profile"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Global In-Memory Cache for 0ms Instant Navigation ─────────────────── */
let cachedTeamMembers: TeamMember[] | null = null;
let cachedLatestYear: string = "2024-25";

/* ─── Main Team Page ──────────────────────────────────────────────────────── */
export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(() => cachedTeamMembers || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedTeamMembers);
  const [filterDomain, setFilterDomain] = useState<string>("All");
  const [filterYear, setFilterYear] = useState<string>(() => cachedLatestYear);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
        setIsYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data && Array.isArray(d.data)) {
          cachedTeamMembers = d.data;
          setMembers(d.data);
          // Auto-select latest academic year from available records
          const s = new Set<string>();
          d.data.forEach((m: TeamMember) => m.statusHistory?.forEach((h) => s.add(h.year)));
          const sorted = Array.from(s).sort().reverse();
          if (sorted.length > 0) {
            cachedLatestYear = sorted[0];
            setFilterYear((prev) => (prev === "2024-25" || !s.has(prev) ? sorted[0] : prev));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* Extract unique years dynamically from team members' history (latest first) */
  const availableYears = useMemo(() => {
    const s = new Set<string>();
    members.forEach((m) => m.statusHistory?.forEach((h) => s.add(h.year)));
    const sorted = Array.from(s).sort().reverse();
    if (sorted.length === 0) return ["2024-25", "All"];
    return [...sorted, "All"];
  }, [members]);

  /* Filter by domain and academic year, and resolve exact position */
  const displayList = useMemo(() => {
    return members
      .filter((m) => {
        // Domain filter
        if (filterDomain !== "All" && m.domain !== filterDomain) return false;

        // Year filter: if a specific year is selected, MUST have an entry for that year
        if (filterYear !== "All") {
          return m.statusHistory?.some((h) => h.year === filterYear);
        }
        return true;
      })
      .map((m) => {
        // Position resolution
        const resolvedPosition =
          filterYear === "All"
            ? (m.statusHistory?.[0]?.position || "Volunteer")
            : (m.statusHistory?.find((h) => h.year === filterYear)?.position || "Volunteer");
        return { member: m, position: resolvedPosition };
      })
      .sort((a, b) => {
        const orderA = POSITION_ORDER.indexOf(a.position);
        const orderB = POSITION_ORDER.indexOf(b.position);
        return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
      });
  }, [members, filterDomain, filterYear]);

  /* Group by hierarchy: Head of Club -> Maintainer -> Volunteer */
  const groupedHierarchy = useMemo(() => {
    const groups: Record<string, { member: TeamMember; position: string }[]> = {};
    POSITION_ORDER.forEach((pos) => {
      const matching = displayList.filter((item) => item.position === pos);
      if (matching.length > 0) groups[pos] = matching;
    });

    // Handle any custom positions
    const other = displayList.filter((item) => !POSITION_ORDER.includes(item.position));
    if (other.length > 0) groups["Other Members"] = other;

    return groups;
  }, [displayList]);

  const DOMAINS = ["All", "Technical", "Corporate", "Creative"];

  return (
    <div className="min-h-screen bg-transparent text-[#fafafa] relative overflow-hidden">

      {/* Hero Header */}
      <section ref={headerRef} className="pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="text-4xl xs:text-5xl md:text-7xl font-black text-[#fafafa] leading-[0.96] tracking-tight">
            Meet Our <br />
            <span style={{ color: "#22c55e" }}>Team</span>
          </h1>
        </motion.div>
      </section>

      {/* Filter Toolbar (Translucent Liquid Glass) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-6 sm:pb-8 relative z-10">
        <div className="p-2 sm:p-2.5 rounded-2xl border border-white/20 backdrop-blur-2xl bg-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.28),0_16px_36px_-8px_rgba(0,0,0,0.7)]">
          
          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {DOMAINS.map((d) => {
              const dm = d !== "All" ? DOMAIN_META[d] : null;
              const active = filterDomain === d;
              return (
                <button
                  key={d}
                  onClick={() => setFilterDomain(d)}
                  className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-semibold transition-all duration-200 cursor-pointer"
                  style={
                    active
                      ? {
                          color: dm?.color ?? "#fafafa",
                          background: dm?.bg ?? "rgba(255, 255, 255, 0.14)",
                          border: `1px solid ${dm?.border ?? "rgba(255, 255, 255, 0.3)"}`,
                          boxShadow: "0 0 16px -4px rgba(34, 197, 94, 0.25)",
                        }
                      : {
                          color: "#71717a",
                          background: "transparent",
                          border: "1px solid transparent",
                        }
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Academic Year Glass Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider hidden md:inline">
              Academic Year:
            </span>
            <div className="relative w-full sm:w-auto" ref={yearDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsYearOpen(!isYearOpen);
                }}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/20 hover:border-white/35 text-[#fafafa] text-xs font-mono transition-all shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] cursor-pointer"
              >
                <span>{filterYear === "All" ? "All Academic Years" : filterYear}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    isYearOpen ? "rotate-180 text-[#22c55e]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isYearOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-full sm:w-48 rounded-2xl bg-[#080c14]/95 backdrop-blur-3xl border border-white/20 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] z-50 overflow-hidden"
                  >
                    {availableYears.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setFilterYear(y);
                          setIsYearOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition-all ${
                          filterYear === y
                            ? "bg-[#0c2317] text-[#22c55e] border border-[#14532d] font-bold shadow-sm"
                            : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <span>{y === "All" ? "All Academic Years" : y}</span>
                        {filterYear === y && <Check className="w-3.5 h-3.5 text-[#22c55e]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Hierarchy Breadcrumb Banner */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] font-mono text-zinc-500">
          <span className="text-zinc-400">Hierarchy:</span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 bg-amber-500/10">Head of Club</span>
          <span className="text-zinc-600">›</span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Maintainer</span>
          <span className="text-zinc-600">›</span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded border border-white/10 text-zinc-400 bg-white/5">Volunteer</span>
          {filterYear !== "All" && (
            <span className="w-full sm:w-auto sm:ml-auto text-emerald-400 font-bold mt-1 sm:mt-0">
              Showing roster for {filterYear}
            </span>
          )}
        </div>
      </section>

      {/* Main Roster Grid */}
      <main className="px-4 sm:px-6 max-w-6xl mx-auto pb-28 relative z-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              />
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl backdrop-blur-xl bg-white/[0.02]">
            <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-mono">
              {filterYear !== "All"
                ? `No members recorded for academic year ${filterYear}.`
                : "No members match these filters."}
            </p>
          </div>
        ) : (
          /* Render grouped by hierarchy */
          <div className="space-y-12">
            {Object.entries(groupedHierarchy).map(([pos, items]) => {
              const pb = POSITION_BADGE[pos] || POSITION_BADGE.Volunteer;
              return (
                <section key={pos}>
                  {/* Position Header with translucent badge & divider */}
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-lg border uppercase tracking-wider backdrop-blur-md"
                      style={{ color: pb.color, background: pb.bg, borderColor: pb.border }}
                    >
                      {pos === "Head of Club" && <Award className="w-3 h-3" />}
                      {pos}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  {/* Cards Grid */}
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-30px" }}
                  >
                    <AnimatePresence mode="popLayout">
                      {items.map(({ member, position }) => (
                        <LiquidGlassMemberCard
                          key={member._id}
                          member={member}
                          position={position}
                          activeYear={filterYear}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </section>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
