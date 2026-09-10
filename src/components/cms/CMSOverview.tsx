"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Calendar, Bell, Database, RefreshCw, Sparkles, 
  CheckCircle2, ArrowUpRight, ShieldCheck, HardDrive, Terminal 
} from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";

export function CMSOverview({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const [stats, setStats] = useState({
    membersCount: 0,
    activeEventsCount: 0,
    pastEventsCount: 0,
    recruitmentEnabled: false,
    subscribersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const [teamRes, eventRes, recRes, subRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/events"),
        fetch("/api/recruitment"),
        fetch("/api/recruitment/notify"),
      ]);

      const team = await teamRes.json();
      const events = await eventRes.json();
      const rec = await recRes.json();
      const subs = await subRes.json();

      const allEvents = events.data || [];
      setStats({
        membersCount: team.data?.length || 0,
        activeEventsCount: allEvents.filter((e: any) => e.active).length,
        pastEventsCount: allEvents.filter((e: any) => !e.active).length,
        recruitmentEnabled: rec.data?.enabled ?? true,
        subscribersCount: subs.data?.length || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetData = async () => {
    if (!confirm("Reset database to initial realistic FOSS SRM sample data? Any recent manual additions will be reset.")) return;
    setResetting(true);
    setResetMessage(null);
    playClickSound();

    try {
      const res = await fetch("/api/cms/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setResetMessage("Database reset to factory seed data!");
        fetchStats();
        setTimeout(() => setResetMessage(null), 3000);
      }
    } catch {
      alert("Failed to reset database");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Cluster Command Overview</h2>
        <p className="text-xs text-gray-400">
          Telemetry, active database status, and quick shortcuts to manage FOSS Club SRM content.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Members Metric */}
        <div 
          onClick={() => onSwitchTab("team")}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer hover:border-white/35 transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold tracking-wider">Team Roster</span>
            <Users className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.membersCount}</div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>Maintainers &amp; volunteers</span>
            <span className="text-[#22c55e] group-hover:underline">Manage →</span>
          </p>
        </div>

        {/* Active Events Metric */}
        <div 
          onClick={() => onSwitchTab("events")}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer hover:border-white/35 transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold tracking-wider">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.activeEventsCount}</div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>+{stats.pastEventsCount} archived</span>
            <span className="text-[#38bdf8] group-hover:underline">Manage →</span>
          </p>
        </div>

        {/* Recruitment Status Metric */}
        <div 
          onClick={() => onSwitchTab("recruitment")}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer hover:border-white/35 transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold tracking-wider">Recruitment Mode</span>
            <span className={`w-2.5 h-2.5 rounded-full ${stats.recruitmentEnabled ? "bg-[#22c55e] animate-ping" : "bg-red-400"}`} />
          </div>
          <div className={`text-xl font-black font-mono ${stats.recruitmentEnabled ? "text-[#22c55e]" : "text-red-400"}`}>
            {stats.recruitmentEnabled ? "ACTIVE (OPEN)" : "PAUSED (CLOSED)"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>{stats.subscribersCount} on waitlist</span>
            <span className="text-purple-400 group-hover:underline">Configure →</span>
          </p>
        </div>

        {/* Database Engine Status */}
        <div className="liquid-glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold tracking-wider">Data Engine</span>
            <Database className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span>Dual-Mode Store</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            MongoDB + Disk
          </p>
        </div>

      </div>

      {/* System Utilities & Seed Reset Card */}
      <div className="liquid-glass-card p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#22c55e]" />
              <span>Database Operations &amp; Seed Restoration</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Reset database to clean, rich, realistic FOSS SRM seed data anytime with one click.
            </p>
          </div>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-200 hover:text-white font-mono text-xs flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#22c55e] ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Restoring Seed..." : "Reset to Initial Seed"}</span>
          </button>
        </div>

        {resetMessage && (
          <div className="p-3 rounded-lg bg-[#0c2317] border border-[#14532d] text-[#22c55e] text-xs font-mono">
            ✓ {resetMessage}
          </div>
        )}
      </div>

    </div>
  );
}
