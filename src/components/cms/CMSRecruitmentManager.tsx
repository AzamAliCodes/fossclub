"use client";

import React, { useState, useEffect } from "react";
import { RecruitmentConfig } from "@/types";
import {
  Save,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Eye,
  Terminal,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound, playSuccessSound } from "@/lib/sound";
import { useGlassToast } from "@/components/ui/GlassToast";
import { notifySessionExpired } from "@/lib/authClient";

export function CMSRecruitmentManager() {
  const toast = useGlassToast();
  const [config, setConfig] = useState<RecruitmentConfig | null>(null);
  const [initialConfig, setInitialConfig] = useState<RecruitmentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/recruitment?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.data) {
        setConfig(data.data);
        setInitialConfig(data.data);
      }
    } catch (err) {
      console.error("Failed to load recruitment config", err);
      toast.error("Fetch Error", "Could not load recruitment settings from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!config || saving) return;

    setSaving(true);
    setSaveStatus("Saving changes...");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("foss_cms_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/recruitment", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          enabled: config.enabled,
          subtitle: config.subtitle,
          applyUrl: config.applyUrl,
          posterUrl: config.posterUrl,
        }),
      });

      if (res.status === 401) {
        notifySessionExpired();
        return;
      }

      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setInitialConfig({ ...config });
        setSaveStatus("Saved successfully!");
        toast.success("Recruitment Updated", "Live recruitment settings have been published.");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus(data.error || "Save failed");
        toast.error("Save Failed", data.error || "Could not update recruitment configuration.");
      }
    } catch {
      setSaveStatus("Server error");
      toast.error("Save Failed", "Network or server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    Boolean(config && initialConfig) &&
    (config?.enabled !== initialConfig?.enabled ||
      config?.subtitle !== initialConfig?.subtitle ||
      config?.applyUrl !== initialConfig?.applyUrl ||
      config?.posterUrl !== initialConfig?.posterUrl);

  if (loading || !config) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#22c55e]/30 border-t-[#22c55e] animate-spin mb-4" />
        <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase">
          Loading recruitment settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Recruitment Portal Settings</h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Manage the public admission cycle switch, registration link, and featured poster asset.
          </p>
        </div>

        {/* Quick Actions / Save State */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={() => {
                if (initialConfig) {
                  playClickSound();
                  setConfig({ ...initialConfig });
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isDirty
                ? "bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[#22c55e]/20"
                : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1]"
            }`}
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
            ) : isDirty ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#22c55e]" />
            )}
            <span>{saving ? "Saving..." : isDirty ? "Publish Changes" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid: Left Editor + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Admission Switch Card */}
          <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                  Admission State
                </label>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Determines whether the public &quot;Apply Now&quot; button is clickable on the website.
                </p>
              </div>

              {/* Segmented Liquid Glass Pill Switch */}
              <div className="p-1 rounded-xl bg-black/40 border border-white/[0.08] flex items-center gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (!config.enabled) {
                      playClickSound();
                      setConfig({ ...config, enabled: true });
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    config.enabled
                      ? "bg-[#0c2317] text-[#22c55e] border border-[#14532d] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (config.enabled) {
                      playClickSound();
                      setConfig({ ...config, enabled: false });
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    !config.enabled
                      ? "bg-[#2a1215] text-[#f87171] border border-[#7f1d1d] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Closed</span>
                </button>
              </div>
            </div>

            {/* Current status explanation callout */}
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 transition-colors ${
                config.enabled
                  ? "bg-[#0c2317]/50 border-[#14532d]/60 text-emerald-300"
                  : "bg-[#2a1215]/50 border-[#7f1d1d]/60 text-rose-300"
              }`}
            >
              {config.enabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Applications are currently OPEN.</span> Students can click &quot;Apply Now&quot; and will be directed to your application URL.
                  </div>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Applications are currently CLOSED.</span> The button on the recruitment page will show &quot;Applications Closed&quot; and cannot be clicked.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Recruitment Poster Asset Card (Moved to 2nd position) */}
          <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Recruitment Poster Asset (ImageKit URL)</span>
              </label>

              {config.posterUrl && (
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, posterUrl: "" })}
                  className="text-[10px] font-mono text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  Clear Image
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              Recommended aspect ratio: 4:5 portrait (e.g. 1080x1350 px). Upload to ImageKit CDN and paste the URL below.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="url"
                value={config.posterUrl}
                onChange={(e) => setConfig({ ...config, posterUrl: e.target.value })}
                placeholder="https://ik.imagekit.io/fossclubsrm/recruitment/poster.jpg"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-[#38bdf8]/60 focus:bg-white/[0.05] transition-all placeholder:text-zinc-600"
              />

              {config.posterUrl && (
                <a
                  href={config.posterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-zinc-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-all flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Asset</span>
                </a>
              )}
            </div>
          </div>

          {/* 3. Application URL Card */}
          <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Application Form URL</span>
              </label>
              
              {config.applyUrl && (
                <a
                  href={config.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-[#22c55e] hover:underline flex items-center gap-1 transition-colors"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              Where students will be redirected when clicking the Apply button (e.g., Google Forms, Tally, or chapter portal).
            </p>

            <div className="relative">
              <input
                type="url"
                required
                value={config.applyUrl}
                onChange={(e) => setConfig({ ...config, applyUrl: e.target.value })}
                placeholder="https://forms.gle/... or https://fossunited.org/c/srm-ktr"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-[#22c55e]/60 focus:bg-white/[0.05] transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* 4. Campaign Blurb / Subtitle Card */}
          <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                Campaign Subtitle &amp; Pitch
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                {config.subtitle ? config.subtitle.length : 0} chars
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Displayed directly beneath &quot;Join Our Team&quot; on the public recruitment page when applications are active.
            </p>

            <textarea
              rows={3}
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              placeholder="Join the premier open source initiative at SRMIST. Build real public software, organize India's top hackathons, and become part of the FOSS United network."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-sans text-xs leading-relaxed focus:outline-none focus:border-[#22c55e]/60 focus:bg-white/[0.05] transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Feedback & Bottom Save Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-zinc-400">
              {saveStatus ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{saveStatus}</span>
                </span>
              ) : (
                <span>Changes will update immediately on the student portal.</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#22c55e]/25 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Recruitment Settings"}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Student Preview (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Live Student Preview
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              Simulated /recruitments
            </span>
          </div>

          {/* Mini Mock Card of Hero Section */}
          <div className="liquid-glass-card rounded-2xl p-5 border-white/[0.1] relative overflow-hidden shadow-2xl space-y-5">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Poster Slot Preview */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-black/60 border border-[#22c55e]/30 shadow-inner group">
              {config.posterUrl ? (
                <img
                  src={config.posterUrl}
                  alt="Poster Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center justify-center mb-3">
                    <Terminal className="w-6 h-6 text-[#22c55e]" />
                  </div>
                  <p className="text-zinc-200 text-xs font-mono font-bold tracking-wider uppercase">
                    Recruitment Poster
                  </p>
                  <p className="text-zinc-500 text-[10px] font-mono mt-1">
                    No image URL configured
                  </p>
                </div>
              )}

              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono text-zinc-400 border border-white/10">
                4:5 Portrait
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-3.5">
              {/* Status Pill Preview */}
              <div
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase border font-mono ${
                  config.enabled
                    ? "bg-[#0c2317] border-[#14532d] text-[#22c55e]"
                    : "bg-[#2a1215] border-[#7f1d1d] text-[#f87171]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    config.enabled ? "bg-[#22c55e]" : "bg-[#f87171]"
                  }`}
                />
                {config.enabled ? "Currently Open" : "Applications Closed"}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#fafafa] tracking-tight">
                  Join Our <span className="text-[#22c55e]">Team</span>
                </h3>
                <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-sans line-clamp-3">
                  {config.enabled
                    ? config.subtitle ||
                      "Recruitments are currently open! We are looking for passionate developers, designers, and organizers to join FOSS Club SRM."
                    : "Our recruitment cycle is currently paused. Submit your details below to get priority early access when the next cohort opens."}
                </p>
              </div>

              {/* Action Button Preview */}
              <div className="pt-1">
                {config.enabled ? (
                  <div className="w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide bg-[#22c55e] text-black flex items-center justify-center space-x-2 font-mono shadow-md shadow-[#22c55e]/20 cursor-default">
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wide bg-[#111114] border border-[#222226] text-[#71717a] flex items-center justify-center space-x-2 cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Applications Closed</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 text-center px-4">
            Changes saved here update `/recruitments` instantaneously.
          </p>
        </div>

      </div>
    </div>
  );
}

