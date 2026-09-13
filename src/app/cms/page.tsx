"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CMSLogin } from "@/components/cms/CMSLogin";
import { CMSTeamManager } from "@/components/cms/CMSTeamManager";
import { CMSEventsManager } from "@/components/cms/CMSEventsManager";
import { CMSRecruitmentManager } from "@/components/cms/CMSRecruitmentManager";
import { 
  ShieldCheck, Users, Calendar, Sparkles, LogOut, ExternalLink, 
  Bell, ArrowLeft, Terminal 
} from "lucide-react";
import { playClickSound } from "@/lib/sound";

export default function CMSPage() {
  const [session, setSession] = useState<{ username: string; role: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"team" | "events" | "recruitment">("team");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "team" || tab === "events" || tab === "recruitment") {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("foss_cms_token") : null;

    // Client-side expiry check: decode JWT payload and verify exp claim
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && Date.now() / 1000 > payload.exp) {
          localStorage.removeItem("foss_cms_token");
          setCheckingAuth(false);
          return;
        }
      } catch {
        localStorage.removeItem("foss_cms_token");
        setCheckingAuth(false);
        return;
      }
    }

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/auth/me", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession(data.user);
        } else {
          // Server rejected token (e.g. expired) — clear it
          localStorage.removeItem("foss_cms_token");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogout = async () => {
    playClickSound();
    try {
      localStorage.removeItem("foss_cms_token");
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
    } catch {
      setSession(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="py-28 text-center text-gray-500 font-mono text-xs animate-pulse">
        Verifying CMS security authorization tokens...
      </div>
    );
  }

  if (!session) {
    return <CMSLogin onLoginSuccess={(user) => setSession(user)} />;
  }

  return (
    <div id="cms-layout-container" className="pt-6 sm:pt-10 pb-16 sm:pb-20 relative z-10 max-w-6xl mx-auto px-3 sm:px-6 min-h-[calc(100vh-80px)] flex flex-col">
      
      {/* Top Admin Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-6 border-b border-white/10 gap-3 sm:gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0c2317] border border-[#14532d] flex items-center justify-center text-[#22c55e] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
                FOSS SRM CMS
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#0c2317] text-[#22c55e] border border-[#14532d]">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Signed in as <span className="text-zinc-200 font-semibold">{session.username}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs self-end sm:self-auto">
          <Link
            href="/"
            onClick={playClickSound}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs with Fixed-Width Even Blocks */}
      <div className="w-full max-w-xl mx-auto grid grid-cols-3 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl mb-6 sm:mb-8 relative backdrop-blur-xl shadow-lg">
        {[
          { id: "team", label: "Team", icon: Users },
          { id: "events", label: "Events", icon: Calendar },
          { id: "recruitment", label: "Recruitments", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as any);
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", tab.id);
                  window.history.replaceState(null, "", url.toString());
                }
              }}
              className="relative w-full py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer select-none"
            >
              {/* Animated Sliding Active Block Pill */}
              {active && (
                <motion.div
                  layoutId="activeCmsTabPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/25 to-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(34,197,94,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-xl"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <span
                className={`relative z-10 flex items-center justify-center space-x-1.5 sm:space-x-2 transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    active ? "text-[#22c55e] drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" : ""
                  }`}
                />
                <span className="truncate">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels with Smooth Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="w-full flex-1 min-h-[480px]"
        >
          {activeTab === "team" && <CMSTeamManager />}
          {activeTab === "events" && <CMSEventsManager />}
          {activeTab === "recruitment" && <CMSRecruitmentManager />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
