"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, GitBranch, Terminal, Shield, Play, Check, Copy, Layers, ExternalLink } from "lucide-react";
import Link from "next/link";
import { playClickSound } from "@/lib/sound";

interface TrackTab {
  id: string;
  filename: string;
  lang: string;
  tag: string;
  title: string;
  description: string;
  actionText: string;
  actionOutput: string[];
  codeLines: { num: number; content: string; highlight?: boolean }[];
  tags: string[];
}

const TABS: TrackTab[] = [
  {
    id: "systems",
    filename: "systems_kernel.rs",
    lang: "Rust",
    tag: "Track 01",
    title: "Kernel & Systems Engineering",
    description: "Deep dive into Linux internals, eBPF telemetry, memory safety, and high-performance concurrent systems programming.",
    actionText: "cargo run --release",
    actionOutput: [
      "[INFO] Compiling foss-kernel-telemetry v0.4.2",
      "[INFO] Attaching eBPF kprobe to sys_clone: OK",
      "[SYS] Ring buffer memory mapped at 0x7fff4000",
      "[PERF] 0.002ms kernel latency recorded · Zero leaks",
    ],
    tags: ["Rust", "eBPF", "Linux Kernel", "Memory Safety", "Go"],
    codeLines: [
      { num: 1, content: "use redbpf_probes::kprobe::prelude::*;" },
      { num: 2, content: "program!(0xFFFFFFFE, \"GPL\");" },
      { num: 3, content: "" },
      { num: 4, content: "#[kprobe(\"sys_enter_clone\")]", highlight: true },
      { num: 5, content: "pub fn monitor_process_fork(regs: Registers) {" },
      { num: 6, content: "    let pid = bpf_get_current_pid_tgid();" },
      { num: 7, content: "    bpf_trace_printk(b\"fork() intercepted\\n\");" },
      { num: 8, content: "}" },
    ],
  },
  {
    id: "upstream",
    filename: "upstream_prs.git",
    lang: "Git",
    tag: "Track 02",
    title: "Upstream Contributions",
    description: "We review PRs, mentor first-time contributors, and ship production patches directly to global open-source codebases.",
    actionText: "git log --oneline -n 4",
    actionOutput: [
      "d82f104 merge pull request #4912 from foss-srm/fix-tcp-backlog",
      "91ca766 torvalds/linux: optimize memory compaction in buddy allocator",
      "3a4b910 rust-lang/rust: fix LLVM backend codegen assertion",
      "7e01b22 postgresql: enhance parallel query scan index scan",
    ],
    tags: ["Linux Kernel", "Rust Upstream", "PostgreSQL", "First PR Mentorship", "GSoC"],
    codeLines: [
      { num: 1, content: "commit d82f1048b299e19d (HEAD -> master)" },
      { num: 2, content: "Author: FOSS Club SRM <maintainers@srmist.edu.in>" },
      { num: 3, content: "Date:   Sat Aug 24 18:22:04 2024 +0530" },
      { num: 4, content: "    upstream: fix socket reuse port race condition", highlight: true },
      { num: 5, content: "    Signed-off-by: Linus Torvalds <torvalds@linux.org>" },
    ],
  },
  {
    id: "hackathons",
    filename: "foss_hack_2024.yaml",
    lang: "YAML",
    tag: "Track 03",
    title: "FOSS Hack & National Sprints",
    description: "Organizers of India's flagship 36-hour national hackathon. Win project bounties, get GSoC mentorship, and deploy public tools.",
    actionText: "hackctl verify --cohort 2024",
    actionOutput: [
      "[HACK] FOSS Hack SRM 2024 · 36-Hour National Sprint",
      "[STATS] 1,800+ Hacker Applicants · 92 Projects Shipped",
      "[GRANTS] ₹5,00,000+ Distributed in Open Source Bounties",
      "[MENTORS] Engineers from FOSS United, Red Hat & Zerodha",
    ],
    tags: ["36-Hour Sprint", "₹5L+ Bounties", "National Hackathon", "Public Tools"],
    codeLines: [
      { num: 1, content: "hackathon:" },
      { num: 2, content: "  name: \"FOSS Hack SRM 2024\"" },
      { num: 3, content: "  format: \"36-Hour National Sprint\"" },
      { num: 4, content: "  license_requirement: \"MIT | Apache-2.0 | GPLv3\"", highlight: true },
      { num: 5, content: "  prize_pool_inr: 500000" },
      { num: 6, content: "  upstream_eval: true" },
    ],
  },
  {
    id: "community",
    filename: "foss_united.network",
    lang: "Network",
    tag: "Track 04",
    title: "FOSS United Chapter",
    description: "The official SRMIST chapter affiliated with the FOSS United Foundation. Community grants, lightning talks, and national meetup access.",
    actionText: "networkctl status --chapter srm-ktr",
    actionOutput: [
      "● fossunited.org/c/srm-ktr - FOSS United Student Chapter",
      "  Status: Active (1,200+ Members, SRMIST KTR)",
      "  Grants: Active Project Grants Open for Maintainers",
      "  Meetups: Monthly FOSS Meetups & Lightning Talks",
    ],
    tags: ["FOSS United", "Community Grants", "Lightning Talks", "SRMIST Chapter"],
    codeLines: [
      { num: 1, content: "NODE_NAME=\"FOSS Club SRMIST\"" },
      { num: 2, content: "AFFILIATION=\"FOSS United Foundation\"" },
      { num: 3, content: "CHAPTER_ID=\"srm-ktr\"" },
      { num: 4, content: "export RECRUITMENT_STATUS=\"open\"", highlight: true },
      { num: 5, content: "curl -s https://fossunited.org/api/chapter/srm-ktr | jq ." },
    ],
  },
];

export default function DomainIDEInspector() {
  const [activeTabId, setActiveTabId] = useState("systems");
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const currentTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const handleRun = () => {
    try {
      playClickSound();
    } catch {}
    setRunning(true);
    setShowOutput(false);
    setTimeout(() => {
      setRunning(false);
      setShowOutput(true);
    }, 450);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 font-mono">
      <div className="liquid-glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Specular Catch-light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        
        {/* IDE Tab Bar */}
        <div className="flex items-center justify-between bg-black/40 border-b border-white/[0.08] px-3 pt-2.5 overflow-x-auto">
          <div className="flex items-center space-x-1">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    try {
                      playClickSound();
                    } catch {}
                    setActiveTabId(tab.id);
                    setShowOutput(false);
                  }}
                  className={`px-3.5 py-2 rounded-t-lg text-xs font-mono flex items-center gap-2 border-t-2 transition-colors ${
                    isActive
                      ? "bg-black/60 text-[#fafafa] border-[#22c55e]"
                      : "text-[#71717a] hover:text-[#fafafa] border-transparent bg-transparent"
                  }`}
                >
                  <Code2 className={`w-3.5 h-3.5 ${isActive ? "text-[#22c55e]" : "text-[#71717a]"}`} />
                  <span>{tab.filename}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pr-2 pb-2">
            <button
              onClick={handleRun}
              disabled={running}
              className="px-3 py-1.5 rounded bg-[#0c2317] hover:bg-[#14532d] text-[#22c55e] border border-[#14532d] text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-[0_0_12px_rgba(34,197,94,0.15)]"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{running ? "Executing..." : "Run"}</span>
            </button>
          </div>
        </div>

        {/* IDE Split View: Code Editor (Left) & Domain Card Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/[0.08]">
          
          {/* Code View (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-black/80 flex flex-col justify-between text-xs leading-relaxed border-b lg:border-b-0 lg:border-r border-white/[0.08] overflow-x-auto">
            <div className="space-y-1">
              {currentTab.codeLines.map((line) => (
                <div
                  key={line.num}
                  className={`flex items-center gap-4 ${
                    line.highlight ? "bg-[#22c55e]/15 text-[#fafafa] px-2 -mx-2 rounded" : "text-[#a1a1aa]"
                  }`}
                >
                  <span className="text-[#3f3f46] select-none w-5 text-right shrink-0">{line.num}</span>
                  <span className="font-mono whitespace-pre">{line.content}</span>
                </div>
              ))}
            </div>

            {/* Run Console Output Drawer */}
            <AnimatePresence>
              {showOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2 text-[#22c55e] mb-2 font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>$ {currentTab.actionText}</span>
                  </div>
                  <div className="space-y-1 text-[#a1a1aa] bg-black/90 p-3 rounded-lg border border-white/[0.08]">
                    {currentTab.actionOutput.map((out, i) => (
                      <p key={i}>{out}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Domain Detail Card (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-white/[0.015] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-[#0c2317] text-[#22c55e] border border-[#14532d] font-bold">
                  {currentTab.tag}
                </span>
                <span className="text-xs font-mono text-[#71717a]">{currentTab.lang} Track</span>
              </div>

              <h3 className="text-xl font-bold text-[#fafafa] tracking-tight">
                {currentTab.title}
              </h3>

              <p className="text-xs text-[#a1a1aa] leading-relaxed font-sans">
                {currentTab.description}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">Specializations</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentTab.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-black border border-[#222226] text-[10px] font-mono text-[#fafafa]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <Link
                href="/recruitments"
                className="text-xs font-mono text-[#22c55e] hover:underline flex items-center gap-1"
              >
                <span>Join this domain</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] text-[#71717a] font-mono">FOSS Club SRM</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
