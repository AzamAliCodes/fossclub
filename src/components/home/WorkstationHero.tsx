"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Shield, ArrowRight, GitBranch, Cpu, Sparkles } from "lucide-react";
import Link from "next/link";
import { playClickSound } from "@/lib/sound";

export default function WorkstationHero() {
  const [typedTitle, setTypedTitle] = useState("");
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const fullTitle = "FOSS Club";

  useEffect(() => {
    let current = "";
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullTitle.length) {
        current += fullTitle[i];
        setTypedTitle(current);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 90);
    return () => clearInterval(timer);
  }, []);

  const handleKeyHover = (index: number) => {
    setActiveKey(index);
    try {
      playClickSound();
    } catch {}
  };

  // 4 rows of keyboard keys
  const row1 = Array.from({ length: 12 }, (_, i) => i);
  const row2 = Array.from({ length: 11 }, (_, i) => i + 12);
  const row3 = Array.from({ length: 10 }, (_, i) => i + 23);

  return (
    <div className="w-full flex flex-col items-center justify-center relative z-10 select-none">
      
      {/* ── WORKSTATION MONITOR ── */}
      <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-4">
        
        {/* Monitor Bezel Frame */}
        <div className="bg-[#0a0a0c] border-2 border-[#27272a] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black relative overflow-hidden">
          
          {/* Monitor Screen Glass */}
          <div className="bg-black border border-white/[0.08] rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[340px] sm:min-h-[440px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            
            {/* Specular Diagonal Screen Glare */}
            <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-white/[0.025] rotate-45 blur-2xl z-20" />

            {/* Screen Top Bar */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between border-b border-white/[0.06] pb-2 font-mono text-[10px] text-[#71717a] relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <span className="ml-2 hidden sm:inline text-[#a1a1aa]">foss-srm-node-01</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05C770]" />
                <span className="text-[#05C770]">SRMIST KTR · FOSS UNITED</span>
              </div>
            </div>

            {/* Screen Center Content */}
            <div className="flex flex-col items-center justify-center my-auto pt-6">
              
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0c2317] border border-[#14532d] text-xs font-mono text-[#05C770] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05C770] animate-pulse" />
                <span>Student Chapter · SRMIST Kattankulathur</span>
              </div>

              {/* Big Impact Headline with Typing Cursor */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center leading-none">
                  <h1 className="text-4xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#fafafa] font-mono">
                    {typedTitle}
                  </h1>
                  {typedTitle.length < fullTitle.length && (
                    <span className="w-3 sm:w-5 h-8 sm:h-16 bg-[#05C770] ml-1.5 animate-pulse inline-block" />
                  )}
                </div>

                <div className="flex items-center justify-center mt-2 leading-none">
                  <span className="text-4xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#05C770] font-mono">
                    SRM
                  </span>
                  {typedTitle.length >= fullTitle.length && (
                    <span className="w-3 sm:w-5 h-8 sm:h-16 bg-[#05C770] ml-2 animate-pulse inline-block" />
                  )}
                </div>
              </div>

              {/* Sub-headline */}
              <p className="text-[#a1a1aa] text-xs sm:text-base max-w-lg mx-auto mt-6 leading-relaxed font-sans">
                A community for builders, kernel hackers, and open-source maintainers at SRMIST.
              </p>

              {/* Action Buttons on Screen */}
              <div className="flex items-center gap-3.5 mt-8 flex-wrap justify-center font-mono">
                <Link
                  href="/recruitments"
                  className="px-6 py-2.5 rounded-lg bg-[#05C770] hover:bg-[#00c758] text-black text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <span>Join FOSS Club</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/team"
                  className="px-5 py-2.5 rounded-lg bg-[#0a0a0c] hover:bg-[#111114] border border-[#222226] hover:border-[#333339] text-[#fafafa] text-xs font-semibold transition-colors"
                >
                  Meet Our Team
                </Link>
              </div>

            </div>

            {/* Screen Bottom Status Ticker */}
            <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between border-t border-[#18181b] pt-2 font-mono text-[9px] sm:text-[10px] text-[#71717a]">
              <span>[KERNEL] Linux 6.10-lts · x86_64</span>
              <span>1,200+ Members · 180+ Upstream Merges</span>
            </div>

          </div>

          {/* Monitor Stand Connectors */}
          <div className="w-16 h-8 bg-[#18181b] border-x border-[#27272a] mx-auto" />
          <div className="w-48 h-3.5 bg-[#27272a] rounded-full mx-auto shadow-md" />

        </div>

      </div>

      {/* ── MECHANICAL KEYBOARD & MOUSE PERIPHERALS ── */}
      <div className="w-full max-w-2xl mx-auto flex items-start justify-center gap-6 mt-6 px-4">
        
        {/* Vector Keyboard Shell */}
        <div className="bg-[#0a0a0c] border border-[#222226] rounded-xl p-3 shadow-xl flex-1 max-w-md">
          <div className="flex flex-col gap-1.5">
            
            {/* Row 1 */}
            <div className="flex gap-1 justify-between">
              {row1.map((k) => (
                <div
                  key={k}
                  onMouseEnter={() => handleKeyHover(k)}
                  onClick={() => handleKeyHover(k)}
                  className={`h-4 sm:h-5 flex-1 rounded-[3px] border transition-colors cursor-pointer ${
                    activeKey === k
                      ? "bg-[#05C770] border-[#05C770]"
                      : "bg-[#111114] border-[#222226] hover:border-[#333339]"
                  }`}
                />
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex gap-1 justify-between">
              {row2.map((k) => (
                <div
                  key={k}
                  onMouseEnter={() => handleKeyHover(k)}
                  onClick={() => handleKeyHover(k)}
                  className={`h-4 sm:h-5 flex-1 rounded-[3px] border transition-colors cursor-pointer ${
                    activeKey === k
                      ? "bg-[#05C770] border-[#05C770]"
                      : "bg-[#111114] border-[#222226] hover:border-[#333339]"
                  }`}
                />
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex gap-1 justify-between">
              {row3.map((k) => (
                <div
                  key={k}
                  onMouseEnter={() => handleKeyHover(k)}
                  onClick={() => handleKeyHover(k)}
                  className={`h-4 sm:h-5 flex-1 rounded-[3px] border transition-colors cursor-pointer ${
                    activeKey === k
                      ? "bg-[#05C770] border-[#05C770]"
                      : "bg-[#111114] border-[#222226] hover:border-[#333339]"
                  }`}
                />
              ))}
            </div>

            {/* Row 4: Spacebar & Modifiers */}
            <div className="flex gap-1 justify-between items-center">
              <div className="h-4 sm:h-5 w-6 rounded-[3px] bg-[#111114] border border-[#222226]" />
              <div className="h-4 sm:h-5 w-6 rounded-[3px] bg-[#111114] border border-[#222226]" />
              <div
                onMouseEnter={() => handleKeyHover(999)}
                onClick={() => handleKeyHover(999)}
                className={`h-4 sm:h-5 flex-1 mx-2 rounded-[3px] border transition-colors cursor-pointer ${
                  activeKey === 999
                    ? "bg-[#05C770] border-[#05C770]"
                    : "bg-[#141418] border-[#222226] hover:border-[#333339]"
                }`}
              />
              <div className="h-4 sm:h-5 w-6 rounded-[3px] bg-[#111114] border border-[#222226]" />
              <div className="h-4 sm:h-5 w-6 rounded-[3px] bg-[#111114] border border-[#222226]" />
            </div>

          </div>
        </div>

        {/* Vector Wireless Mouse */}
        <div className="w-12 sm:w-14 h-20 sm:h-24 rounded-2xl bg-[#0a0a0c] border border-[#222226] p-1.5 flex flex-col items-center justify-between shadow-xl shrink-0 mt-1">
          {/* Scroll Wheel */}
          <div className="w-2 h-5 rounded-full bg-[#18181b] border border-[#27272a] mt-1 flex items-center justify-center">
            <div className="w-1 h-2 rounded-full bg-[#05C770]" />
          </div>
          {/* Subtle logo dot */}
          <div className="w-2 h-2 rounded-full bg-[#27272a] mb-2" />
        </div>

      </div>

    </div>
  );
}
