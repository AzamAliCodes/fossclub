"use client";

import React, { useState, useEffect } from "react";
import { RecruitmentConfig } from "@/types";
import { Save, AlertCircle, ExternalLink } from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";

export function CMSRecruitmentManager() {
  const [config, setConfig] = useState<RecruitmentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/recruitment");
      const data = await res.json();
      if (data.data) setConfig(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaveStatus("Updating recruitment configuration...");

    try {
      const res = await fetch("/api/recruitment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setSaveStatus("Recruitment settings successfully updated!");
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        setSaveStatus(data.error || "Save failed");
      }
    } catch {
      setSaveStatus("Server communication error");
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-gray-500 font-mono text-xs animate-pulse">
        Loading recruitment configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Recruitment Drive Settings</h2>
        <p className="text-xs text-gray-400">
          Control the public recruitment status toggle, poster asset, and application URL.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl bg-[#080C14] border border-white/10 p-6 sm:p-8 space-y-6 text-xs font-mono shadow-xl">
        {/* Global Recruitment Toggle Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${config.enabled ? "bg-emerald-400 animate-ping" : "bg-red-400"}`} />
              <span className="text-sm font-bold text-white">Public Recruitment State</span>
            </div>
            <p className="text-[11px] text-gray-400">
              When toggled ON, students can click Apply. When toggled OFF, the Apply button is disabled.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setConfig({ ...config, enabled: !config.enabled });
            }}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition-all flex items-center space-x-2 ${
              config.enabled
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                : "bg-gray-800 text-gray-400 border border-gray-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.enabled ? "bg-black" : "bg-red-400"}`} />
            <span>{config.enabled ? "ENABLED (OPEN)" : "DISABLED (CLOSED)"}</span>
          </button>
        </div>

        {/* Campaign Title & Subtitle */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-gray-400 mb-1">Campaign Headline Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
              placeholder="e.g. FOSS Club SRM Recruitment Drive 2025-26"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Campaign Blurb / Subtitle</label>
            <textarea
              rows={2}
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
              placeholder="Join the premier open source initiative at SRMIST..."
            />
          </div>
        </div>

        {/* Application Link */}
        <div>
          <label className="block text-gray-400 mb-1 flex items-center justify-between">
            <span>External Application URL (Google Form / Tally / Portal)</span>
            {config.applyUrl && (
              <a
                href={config.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </label>
          <input
            type="url"
            required
            value={config.applyUrl}
            onChange={(e) => setConfig({ ...config, applyUrl: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
            placeholder="https://forms.gle/... or https://fossunited.org/c/srm-ktr"
          />
        </div>

        {/* Poster Image URL */}
        <div className="space-y-2">
          <label className="block text-gray-400">Recruitment Poster Image URL (from ImageKit)</label>
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
              {config.posterUrl ? (
                <img
                  src={config.posterUrl}
                  alt="Poster Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-mono">POSTER</div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <input
                type="url"
                value={config.posterUrl}
                onChange={(e) => setConfig({ ...config, posterUrl: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                placeholder="https://ik.imagekit.io/fossclubsrm/recruitment/poster.jpg"
              />
              <p className="text-[10px] text-gray-500 font-mono">Upload to ImageKit first, then paste the URL here.</p>
            </div>
          </div>
        </div>

        {/* Save feedback & button */}
        {saveStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            {saveStatus}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Recruitment Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
