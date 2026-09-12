"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowUpRight, Zap, ArrowRight, Calendar, Code2, GitBranch, Terminal, Shield, GitPullRequest, Trophy, Globe, Users, BookOpen, Briefcase, Palette, UserPlus } from "lucide-react";
import RotatingText from "@/components/ui/RotatingText";
import DecryptedText from "@/components/ui/DecryptedText";
import SpotlightCard from "@/components/ui/SpotlightCard";
import MagneticButton from "@/components/ui/MagneticButton";
import TiltCard from "@/components/ui/TiltCard";
import AnimatedGrid from "@/components/3d/AnimatedGrid";
import FOSSTechnologyWheel from "@/components/home/FOSSTechnologyWheel";
import { playClickSound } from "@/lib/sound";

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const up: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export default function HomePage() {
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const indicatorOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  const tracks = [
    {
      num: "01",
      tag: "Development",
      title: "Open Source Development",
      body: "Build, contribute to, and maintain real-world open-source software and community projects.",
      accent: "#22c55e",
      icon: GitPullRequest,
    },
    {
      num: "02",
      tag: "Community",
      title: "Community & Collaboration",
      body: "Connect students, developers, and contributors through meetups, discussions, and collaborative projects.",
      accent: "#38bdf8",
      icon: Users,
    },
    {
      num: "03",
      tag: "Workshops",
      title: "Learning & Workshops",
      body: "Conduct hands-on workshops, tech sessions, and contributor-focused learning programs.",
      accent: "#a78bfa",
      icon: BookOpen,
    },
    {
      num: "04",
      tag: "Events",
      title: "Hackathons & Ideathons",
      body: "Organize hackathons, ideathons, and contribution drives that encourage students to build and collaborate.",
      accent: "#facc15",
      icon: Trophy,
    },
  ];

  const domains = [
    {
      title: "Technical",
      badge: "Development & Systems",
      desc: "Architect open-source software, maintain cloud infrastructure, and contribute to global upstream repositories.",
      color: "#22c55e",
      bg: "#0c2317",
      border: "#14532d",
      icon: Terminal,
      skills: ["Full-Stack Web/App", "Cyber Security", "AI/ML", "DevOps & Cloud"],
    },
    {
      title: "Corporate",
      badge: "Operations & Outreach",
      desc: "Organize nationwide hackathons, secure sponsorships, drive public relations, and lead community partnerships.",
      color: "#38bdf8",
      bg: "#082f49",
      border: "#0c4a6e",
      icon: Briefcase,
      skills: ["Event Management", "Public Relations", "Sponsorship & Outreach", "Content & Strategy"],
    },
    {
      title: "Creative",
      badge: "Design & Media",
      desc: "Shape the visual and interactive identity of the club through modern UI/UX design, visual effects, and media production.",
      color: "#fb7185",
      bg: "rgba(251, 113, 133, 0.12)",
      border: "rgba(251, 113, 133, 0.35)",
      icon: Palette,
      skills: ["UI/UX Design", "VFX & GFX", "Video Editing", "Graphic Design"],
    },
  ];

  return (
    <div className="w-full flex flex-col relative z-10 bg-transparent">
      
      {/* ── HERO SECTION: DEVELOPER HERO + 3D FLOATING FOSS LOGOS ── */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-3 sm:px-6 overflow-hidden pt-24 sm:pt-28 pb-16">
        
        {/* Perspective Grid Background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <AnimatedGrid />
        </div>

        {/* Developer Hero Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="w-full max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 will-change-transform pt-2 sm:pt-4"
        >
          {/* Eyebrow Badge */}
          <motion.div
            variants={up}
            className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-xl text-[9px] xs:text-[10px] sm:text-xs font-mono text-white font-extrabold mb-5 sm:mb-6 shadow-[0_0_24px_rgba(34,197,94,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] tracking-wider uppercase max-w-full text-center"
          >
            <span className="font-extrabold text-white">
              <span className="text-[#22c55e] font-black text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">F</span>REE AND{" "}
              <span className="text-[#22c55e] font-black text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">O</span>PEN{" "}
              <span className="text-[#22c55e] font-black text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">S</span>OURCE{" "}
              <span className="text-[#22c55e] font-black text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">S</span>OFTWARE
            </span>
          </motion.div>

          {/* Main Massive Title */}
          <motion.h1
            variants={up}
            className="text-[2.6rem] xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#fafafa] leading-[1.05] sm:leading-[0.95] select-none font-sans"
          >
            FOSS CLUB <span className="text-[#22c55e]">SRM</span>
          </motion.h1>

          {/* Dynamic Sub-headline with Rotating Text */}
          <motion.div
            variants={up}
            className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm sm:text-xl md:text-2xl font-mono text-[#a1a1aa] text-center"
          >
            <span>Building the future of</span>
            <span className="text-[#22c55e] font-semibold border-b border-[#22c55e]/30 pb-0.5">
              <RotatingText
                texts={[
                  "Free & Open Source Software",
                  "Linux Kernel Internals",
                  "Rust & High-Perf Tooling",
                  "Upstream Public Software",
                  "National Hackathon Sprints",
                ]}
                interval={2600}
              />
            </span>
          </motion.div>

          {/* Lead Paragraph */}
          <motion.p
            variants={up}
            className="mt-4 sm:mt-6 text-xs sm:text-base text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed font-sans px-2"
          >
            A student-driven open-source community at SRMIST, building real-world projects, contributing to global open-source, and creating spaces for students to learn, collaborate, and build across Technical, Corporate, and Creative domains.
          </motion.p>

          {/* Action Buttons: 1. Meet Our Team (Solid White), 2. Upcoming Events (Solid FOSS Green), 3. Explore Recruitments (Solid Obsidian Terminal) */}
          <motion.div
            variants={up}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 relative z-20 font-mono w-full sm:w-auto max-w-xs sm:max-w-none px-4 sm:px-0"
          >
            {/* 1. Meet Our Team (Solid White) */}
            <Link
              href="/team"
              onClick={() => { try { playClickSound(); } catch {} }}
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-[#fafafa] hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-98 group"
            >
              <Users className="w-4 h-4 text-zinc-700 group-hover:text-black transition-colors" />
              <span>Meet Our Team</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>

            {/* 2. Upcoming Events (Solid FOSS Green) */}
            <Link
              href="/events"
              onClick={() => { try { playClickSound(); } catch {} }}
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shadow-[0_4px_24px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-98 group"
            >
              <Calendar className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              <span>Upcoming Events</span>
            </Link>

            {/* 3. Explore Recruitments (Solid Obsidian / Terminal) */}
            <Link
              href="/recruitments"
              onClick={() => { try { playClickSound(); } catch {} }}
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-[#0e0e12] hover:bg-[#18181e] text-[#fafafa] hover:text-white font-semibold text-xs sm:text-sm border border-[#27272a] hover:border-[#22c55e]/60 transition-all duration-200 flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] active:scale-98 group"
            >
              <UserPlus className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform shrink-0" />
              <span>Explore Recruitments</span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#22c55e] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
        >
          <span className="text-[9px] text-[#71717a] font-mono tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-4 h-7 rounded-full border border-white/15 flex items-start justify-center pt-1">
            <div className="w-1 h-1.5 rounded-full bg-[#22c55e] animate-bounce" />
          </div>
        </motion.div>
      </div>

      {/* ── INTERACTIVE FOSS 3D OPTION WHEEL (React Bits OptionWheel) ── */}
      <FOSSTechnologyWheel />

      {/* ── TRACKS SECTION ── */}
      <div className="w-full px-6 py-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-[#a1a1aa] tracking-[0.25em] uppercase mb-3 font-mono font-bold">Club Vision</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#fafafa] tracking-tight">
              Core <span className="text-[#22c55e]">Initiatives</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {tracks.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="h-full flex"
              >
                <TiltCard maxTilt={5} scale={1.012} className="h-full w-full">
                  <div className="liquid-glass-card p-6 sm:p-7 h-full w-full flex flex-col justify-between relative group min-h-[190px] sm:min-h-[200px]">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-3.5">
                          <span
                            className="text-[11px] font-mono font-extrabold tracking-[0.22em] uppercase px-3 py-1 rounded-md border backdrop-blur-md"
                            style={{
                              color: card.accent,
                              backgroundColor: `${card.accent}15`,
                              borderColor: `${card.accent}35`,
                              boxShadow: `0 0 12px ${card.accent}20`,
                            }}
                          >
                            {card.tag}
                          </span>
                          <span className="text-[#71717a] text-xs font-mono font-bold">{card.num}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#fafafa] mb-2 tracking-tight group-hover:text-[#22c55e] transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-[#a1a1aa] text-sm leading-relaxed font-sans">{card.body}</p>
                      </div>

                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/15 bg-white/[0.05] backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                        <card.icon className="w-5 h-5 text-zinc-300 group-hover:scale-110 transition-transform relative z-10" />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── THREE DOMAINS SECTION (Before Join Us Card) ── */}
      <div className="w-full px-6 py-12 sm:py-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-[#fafafa] tracking-tight">
              Our <span className="text-[#22c55e]">Domains</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {domains.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="h-full flex"
              >
                <div className="liquid-glass-card p-6 sm:p-7 h-full w-full flex flex-col justify-between relative group rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  <div>
                    {/* Header: Icon & Domain Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                        style={{
                          color: d.color,
                          backgroundColor: d.bg,
                          borderColor: d.border,
                        }}
                      >
                        <d.icon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border"
                        style={{
                          color: d.color,
                          backgroundColor: d.bg,
                          borderColor: d.border,
                        }}
                      >
                        {d.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#fafafa] mb-2 tracking-tight group-hover:text-white transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-[#a1a1aa] text-xs sm:text-sm leading-relaxed font-sans mb-5">
                      {d.desc}
                    </p>
                  </div>

                  {/* Specialization Tags */}
                  <div className="pt-4 border-t border-white/[0.08]">
                    <p className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider mb-2">
                      Specializations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/10 text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── JOIN US / RECRUITMENT CTA ── */}
      <div className="w-full flex items-center justify-center px-6 py-20 pb-28">
        <div className="w-full max-w-2xl text-center">
          <div className="liquid-glass-card p-6 sm:p-10 md:p-14 relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[#a1a1aa] text-xs tracking-[0.25em] uppercase mb-3 sm:mb-4 font-mono">Join Us</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#fafafa] mb-3 sm:mb-4 tracking-tight">
                Be a Part of the <span className="text-[#22c55e]">Team</span>
              </h2>
              <p className="text-[#a1a1aa] text-xs sm:text-sm mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed font-sans">
                Join our technical, corporate, or creative domains. Build real software, organize hackathons, and become part of FOSS United.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 font-mono">
                <Link
                  href="/recruitments"
                  onClick={() => { try { playClickSound(); } catch {} }}
                  className="w-full sm:w-auto rounded-xl px-7 py-3 font-semibold text-xs sm:text-sm bg-[#22c55e] hover:bg-[#16a34a] text-black transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,197,94,0.3)] active:scale-98"
                >
                  <span>See Recruitment Status</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/team"
                  onClick={() => { try { playClickSound(); } catch {} }}
                  className="w-full sm:w-auto text-xs sm:text-sm text-[#fafafa] hover:text-[#22c55e] transition-all duration-200 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/40 active:scale-98"
                >
                  <span>Meet the team</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
