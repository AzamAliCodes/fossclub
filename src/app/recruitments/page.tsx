"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, ChevronDown, Terminal, Globe, Palette, Github, Instagram, Linkedin, Mail, ExternalLink } from "lucide-react";
import { RecruitmentConfig } from "@/types";
import { RECRUITMENT_DOMAINS, RECRUITMENT_FAQS } from "@/lib/initialData";
import { siteConfig } from "@/lib/siteConfig";
import SpotlightCard from "@/components/ui/SpotlightCard";
import MagneticButton from "@/components/ui/MagneticButton";
import TerminalApplyModal from "@/components/ui/TerminalApplyModal";
import { playClickSound } from "@/lib/sound";

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9" />
    <path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

let cachedRecruitmentConfig: RecruitmentConfig | null = null;

export default function RecruitmentsPage() {
  const [config, setConfig] = useState<RecruitmentConfig | null>(() => cachedRecruitmentConfig);
  const [loading, setLoading] = useState<boolean>(() => !cachedRecruitmentConfig);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const socials = [
    { icon: Instagram, label: "Instagram", handle: "@fossclubsrm", href: siteConfig.social.instagram },
    { icon: Linkedin, label: "LinkedIn", handle: "FOSS Club SRM", href: siteConfig.social.linkedin },
    { icon: Github, label: "GitHub", handle: "fossclubsrm", href: siteConfig.social.github },
    { icon: WhatsappIcon, label: "WhatsApp", handle: "FOSS Club SRM", href: siteConfig.social.whatsapp },
    { icon: Mail, label: "Email", handle: siteConfig.email, href: `mailto:${siteConfig.email}` },
  ];

  useEffect(() => {
    fetch("/api/recruitment")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          cachedRecruitmentConfig = data.data;
          setConfig(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !config) {
    return (
      <div className="relative min-h-screen flex flex-col items-center px-4 pt-28 pb-20 overflow-hidden w-full max-w-5xl mx-auto z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-20 animate-pulse">
          <div className="w-full max-w-md mx-auto aspect-[4/5] rounded-2xl bg-white/[0.03] border border-white/[0.08]" />
          <div className="w-full max-w-lg mx-auto space-y-6">
            <div className="h-6 w-36 rounded-md bg-white/[0.05]" />
            <div className="h-12 w-3/4 rounded-lg bg-white/[0.05]" />
            <div className="h-20 w-full rounded-lg bg-white/[0.03]" />
            <div className="h-12 w-48 rounded-xl bg-white/[0.05]" />
          </div>
        </div>
      </div>
    );
  }

  const isOpen = config.enabled;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden w-full max-w-5xl mx-auto z-10">
      
      {/* Top 2-Column Hero: Poster + [Join Our Team + Socials] */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-20">
        
        {/* POSTER SLOT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
        >
          <div className="liquid-glass-card rounded-2xl overflow-hidden relative aspect-[4/5] !border-[#22c55e]/30 hover:!border-[#22c55e]/60 shadow-[0_0_16px_rgba(34,197,94,0.15)] hover:shadow-[0_0_24px_rgba(34,197,94,0.28)] transition-all duration-300 group">
            {/* Top Subtle Specular Green Edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent pointer-events-none z-20" />

            {config.posterUrl ? (
              <img
                src={config.posterUrl}
                alt="Recruitment Poster"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 relative z-10">
                <div className="w-16 h-16 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center justify-center mb-2">
                  <Terminal className="w-8 h-8 text-[#22c55e]" />
                </div>
                <p className="text-[#fafafa] text-sm tracking-widest uppercase font-bold font-mono">
                  Recruitment Poster
                </p>
                <p className="text-[#71717a] text-xs font-mono">Configure via CMS Portal</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Join Our Team + Socials cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-lg mx-auto lg:mx-0 lg:mr-auto flex flex-col gap-6"
        >
          <div className="liquid-glass-card p-4 sm:p-5 md:p-6 h-full flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col gap-3">
                {/* Status Pill */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase w-fit border font-mono ${
                    isOpen
                      ? "bg-[#0c2317] border-[#14532d] text-[#22c55e]"
                      : "bg-[#2a1215] border-[#7f1d1d] text-[#f87171]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOpen
                        ? "bg-[#22c55e]"
                        : "bg-[#f87171]"
                    }`}
                  />
                  {isOpen ? "Currently Open" : "Applications Closed"}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#fafafa] tracking-tight leading-tight mb-2">
                    Join Our <span className="text-[#22c55e]">Team</span>
                  </h1>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed">
                    {isOpen
                      ? config.subtitle ||
                        "Recruitments are currently open! We are looking for passionate developers, designers, and organizers to join FOSS Club SRM."
                      : "Our recruitment cycle is currently paused. Submit your details below to get priority early access when the next cohort opens."}
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-[#222226] my-0.5" />

              {/* Action area */}
              <div>
                {isOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      try { playClickSound(); } catch {}
                      setApplyOpen(true);
                    }}
                    className="w-full py-3 px-6 rounded-xl text-sm font-bold tracking-wide transition-all bg-[#22c55e] hover:bg-[#16a34a] text-black flex items-center justify-center space-x-2 font-mono shadow-lg shadow-[#22c55e]/20 active:scale-[0.98]"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-xl text-sm font-mono font-bold tracking-wide bg-[#111114] border border-[#222226] text-[#71717a] cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Applications Closed</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FOSS Socials Card (below Join Our Team in the right column) */}
          <div className="liquid-glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-[10px] text-[#a1a1aa] tracking-[0.25em] uppercase font-mono">FOSS Socials</p>
              <Terminal className="w-4 h-4 text-[#22c55e]/60" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { try { playClickSound(); } catch {} }}
                    title={s.label}
className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3.5 sm:py-4 transition-all duration-300 hover:border-[#22c55e]/60 hover:bg-[#22c55e]/5 hover:shadow-[0_0_24px_rgba(34,197,94,0.15)] active:scale-[0.97]"
                  >
                    <Icon className="w-5 h-5 text-[#a1a1aa] group-hover:text-[#22c55e] transition-colors" />
                    <span className="text-xs font-semibold text-[#fafafa]">{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>

      {/* 3 Domain Tracks Breakdown */}
      <div className="w-full mb-20">
        <div className="text-center mb-10">
          <p className="text-xs text-[#a1a1aa] tracking-[0.25em] uppercase mb-2 font-mono">Tracks</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] tracking-tight">
            Domains &amp; Specializations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {((config.domains && config.domains.length > 0) ? config.domains : RECRUITMENT_DOMAINS).map((d, idx) => {
            const isCorp = d.domain === "Corporate";
            const isCreat = d.domain === "Creative";
            const color = isCorp ? "#38bdf8" : isCreat ? "#fb7185" : "#22c55e";
            const bg = isCorp ? "rgba(56, 189, 248, 0.12)" : isCreat ? "rgba(251, 113, 133, 0.12)" : "rgba(34, 197, 94, 0.12)";
            const border = isCorp ? "rgba(56, 189, 248, 0.35)" : isCreat ? "rgba(251, 113, 133, 0.35)" : "rgba(34, 197, 94, 0.35)";
            const DomainIcon = isCorp ? Globe : isCreat ? Palette : Terminal;

            return (
              <div
                key={idx}
                className="liquid-glass-card p-5 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-white/30 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase tracking-[0.2em] border backdrop-blur-md shadow-sm flex items-center gap-1.5"
                      style={{ color, background: bg, borderColor: border }}
                    >
                      <DomainIcon className="w-3.5 h-3.5" />
                      <span>{d.domain}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#71717a]">Track 0{idx + 1}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#fafafa] tracking-tight font-sans mt-2 group-hover:text-white transition-colors">
                    {d.domain} <span style={{ color }}>Division</span>
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#a1a1aa] leading-relaxed font-sans">
                    {d.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase font-bold tracking-wider">Specializations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {d.roles?.map((role, rIdx) => (
                        <span key={rIdx} className="px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-[11px] font-mono font-medium text-[#fafafa]">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider" style={{ color }}>
                      Perks &amp; Gains
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#a1a1aa]">
                      {d.perks?.map((perk, pIdx) => (
                        <li key={pIdx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      {(() => {
        const faqsList = (config.faqs && config.faqs.length > 0) ? config.faqs : RECRUITMENT_FAQS;
        if (!faqsList || faqsList.length === 0) return null;
        return (
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
              <p className="text-xs text-[#a1a1aa] tracking-[0.25em] uppercase mb-2 font-mono">Clarifications</p>
              <h3 className="text-2xl font-bold text-[#fafafa] tracking-tight">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-3">
              {faqsList.map((faq, idx) => {
                const isFaqOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#0a0a0c] border border-[#222226] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => {
                        try { playClickSound(); } catch {}
                        setActiveFaq(isFaqOpen ? null : idx);
                      }}
                      className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#fafafa] hover:text-[#22c55e] transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#71717a] transition-transform duration-200 flex-shrink-0 ml-2 ${
                          isFaqOpen ? "rotate-180 text-[#22c55e]" : ""
                        }`}
                      />
                    </button>
                    {isFaqOpen && (
                      <div className="px-4 pb-4 text-xs text-[#a1a1aa] leading-relaxed font-sans border-t border-[#222226] pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Terminal Styled Application Modal */}
      <TerminalApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        applyUrl={config.applyUrl || "https://fossunited.org/c/srm-ktr"}
      />

    </div>
  );
}
