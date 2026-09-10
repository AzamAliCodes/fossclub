"use client";

import React, { useState, useEffect } from "react";
import { TeamMember, DomainType, StatusHistoryEntry } from "@/types";
import {
  Plus, Edit2, Trash2, Save, X, Check, AlertCircle,
  Award, Github, Linkedin, Instagram, Search,
} from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";

const DOMAINS: DomainType[] = ["Technical", "Corporate", "Creative"];
const POSITIONS = ["Head of Club", "Maintainer", "Volunteer"];

const DOMAIN_META: Record<string, { color: string; bg: string; border: string }> = {
  Technical: { color: "#22c55e", bg: "#0c2317", border: "#14532d" },
  Corporate: { color: "#38bdf8", bg: "#082f49", border: "#0c4a6e" },
  Creative:  { color: "#a78bfa", bg: "#2e1065", border: "#4c1d95" },
};

const INPUT_CLS = "w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-xs placeholder-zinc-500 transition-colors";
const LABEL_CLS = "block text-[11px] font-mono text-gray-400 mb-1 uppercase tracking-wider";

export function CMSTeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (data.data) setMembers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const blankMember = (): TeamMember => ({
    _id: "",
    name: "",
    imageUrl: "",
    domain: "Technical",
    github: "",
    linkedin: "",
    instagram: "",
    statusHistory: [{ position: "Volunteer", year: new Date().getFullYear().toString().slice(-2) === "25" ? "2025-26" : "2024-25" }],
    featured: false,
  });

  const handleAddNew = () => {
    playClickSound();
    setIsNew(true);
    setEditingMember(blankMember());
    setSaveStatus("idle");
  };

  const handleEdit = (member: TeamMember) => {
    playClickSound();
    setIsNew(false);
    setEditingMember(JSON.parse(JSON.stringify(member)));
    setSaveStatus("idle");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the roster?`)) return;
    playClickSound();
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setMembers((prev) => prev.filter((m) => m._id !== id));
      }
    } catch {
      alert("Failed to delete member");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaveStatus("saving");
    setSaveMsg("Saving...");
    try {
      const url = isNew ? "/api/team" : `/api/team/${editingMember._id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setSaveStatus("ok");
        setSaveMsg(isNew ? "Member created!" : "Saved successfully!");
        setTimeout(() => {
          setEditingMember(null);
          setSaveStatus("idle");
          fetchMembers();
        }, 900);
      } else {
        setSaveStatus("err");
        setSaveMsg(data.error || "Save failed");
      }
    } catch {
      setSaveStatus("err");
      setSaveMsg("Server error");
    }
  };

  const handleAddStatusRow = () => {
    if (!editingMember) return;
    setEditingMember({
      ...editingMember,
      statusHistory: [...(editingMember.statusHistory || []), { position: "Volunteer", year: "2025-26" }],
    });
  };

  const handleRemoveStatusRow = (idx: number) => {
    if (!editingMember) return;
    const updated = [...(editingMember.statusHistory || [])];
    updated.splice(idx, 1);
    setEditingMember({ ...editingMember, statusHistory: updated });
  };

  const handleStatusChange = (idx: number, field: keyof StatusHistoryEntry, value: string) => {
    if (!editingMember) return;
    const updated = [...(editingMember.statusHistory || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingMember({ ...editingMember, statusHistory: updated });
  };

  const field = (key: keyof TeamMember) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditingMember((prev) => prev ? { ...prev, [key]: e.target.value } : prev);

  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = member.name.toLowerCase().includes(q);
    const matchDomain = member.domain.toLowerCase().includes(q);
    const matchCaption = member.caption?.toLowerCase().includes(q);
    const matchStatus = member.statusHistory?.some(
      (h) => h.position.toLowerCase().includes(q) || h.year.toLowerCase().includes(q)
    );
    return matchName || matchDomain || matchCaption || matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Roster</h2>
          <p className="text-xs text-gray-400">
            Add members via ImageKit URL. Track positions across academic years.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center space-x-1.5 self-start sm:self-auto transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members by name, domain, position, or year (e.g. Technical, Maintainer, 2024-25)..."
            className="w-full pl-9 pr-8 py-2 bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-xl text-[#fafafa] text-xs font-mono focus:outline-none focus:border-[#22c55e] placeholder-zinc-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between sm:justify-end gap-3 px-2">
          <span>
            Showing <strong className="text-white">{filteredMembers.length}</strong> of {members.length} members
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#22c55e] hover:underline font-bold"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-mono text-xs animate-pulse">Loading roster...</div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <p className="text-gray-400 text-xs font-mono">No members yet. Add one above.</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-300 text-xs font-mono font-semibold">No members match &quot;{searchQuery}&quot;</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs text-[#22c55e] font-mono underline"
          >
            Reset search query
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#080C14] border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b101c] text-gray-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Domain</th>
                  <th className="p-4">Position History</th>
                  <th className="p-4">Socials</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => {
                  const dm = DOMAIN_META[member.domain] || DOMAIN_META.Technical;
                  return (
                    <tr key={member._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-base font-bold font-mono">{member.name[0]}</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm font-sans truncate">{member.name}</p>
                            {member.caption && (
                              <p className="text-[11px] text-gray-400 truncate max-w-xs">{member.caption}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md"
                          style={{ color: dm.color, background: dm.bg, borderColor: dm.border }}
                        >
                          {member.domain}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">
                        <div className="flex flex-wrap gap-1.5">
                          {member.statusHistory?.map((h, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-zinc-300 font-mono">
                              {h.position} <span className="text-zinc-500">({h.year})</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5 text-zinc-400">
                          {member.github && (
                            <a href={member.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="GitHub">
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors" title="LinkedIn">
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {member.instagram && (
                            <a href={member.instagram} target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors" title="Instagram">
                              <Instagram className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                          title="Edit member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id, member.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {editingMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setEditingMember(null)}
        >
          <div
            className="w-full max-w-xl bg-[#080C14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-bold text-white font-mono">
                {isNew ? "+ New Member" : `Edit: ${editingMember.name}`}
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-5 space-y-4">

              {/* Name */}
              <div>
                <label className={LABEL_CLS}>Full Name *</label>
                <input type="text" required value={editingMember.name} onChange={field("name")}
                  className={INPUT_CLS} placeholder="e.g. Mohamed Azam" />
              </div>

              {/* ImageKit URL */}
              <div>
                <label className={LABEL_CLS}>Profile Image URL (from ImageKit)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#111114] border border-[#1a1a1e] shrink-0">
                    {editingMember.imageUrl ? (
                      <img src={editingMember.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#3f3f46] text-xs font-mono">IMG</div>
                    )}
                  </div>
                  <input type="url" value={editingMember.imageUrl} onChange={field("imageUrl")}
                    className={INPUT_CLS} placeholder="https://ik.imagekit.io/fossclubsrm/..." />
                </div>
                <p className="text-[10px] text-[#3f3f46] mt-1 font-mono">Upload the image to ImageKit first, then paste the URL here.</p>
              </div>

              {/* Socials */}
              <div className="space-y-2">
                <p className={LABEL_CLS}>Social Links</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                    <input type="url" value={editingMember.linkedin || ""} onChange={field("linkedin")}
                      className={INPUT_CLS} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />
                    <input type="url" value={editingMember.instagram || ""} onChange={field("instagram")}
                      className={INPUT_CLS} placeholder="https://instagram.com/username" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
                    <input type="url" value={editingMember.github || ""} onChange={field("github")}
                      className={INPUT_CLS} placeholder="https://github.com/username" />
                  </div>
                </div>
              </div>

              {/* Domain */}
              <div>
                <label className={LABEL_CLS}>Domain *</label>
                <select
                  value={editingMember.domain}
                  onChange={(e) => setEditingMember({ ...editingMember, domain: e.target.value as DomainType })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-xl text-[#fafafa] text-xs font-mono focus:outline-none focus:border-[#22c55e] cursor-pointer transition-colors shadow-inner"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d} className="bg-[#0c0c0e] text-[#fafafa]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position History */}
              <div className="space-y-2 pt-3 border-t border-[#1a1a1e]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-[#22c55e] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> Position by Academic Year
                  </label>
                  <button type="button" onClick={handleAddStatusRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0c2317] border border-[#14532d] text-[#22c55e] text-[10px] font-mono hover:bg-[#112b1c] transition-colors">
                    <Plus className="w-3 h-3" /> Add Year
                  </button>
                </div>
                <div className="space-y-1.5">
                  {editingMember.statusHistory?.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#060608] border border-[#1a1a1e] rounded-lg px-3 py-2">
                      <div className="flex-1">
                        <p className="text-[9px] text-[#71717a] mb-0.5 uppercase tracking-wider">Position</p>
                        <select
                          value={row.position}
                          onChange={(e) => handleStatusChange(idx, "position", e.target.value)}
                          className="w-full bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-lg px-2.5 py-1.5 text-[#fafafa] text-xs font-mono focus:outline-none focus:border-[#22c55e] cursor-pointer"
                        >
                          {POSITIONS.map((p) => (
                            <option key={p} value={p} className="bg-[#0c0c0e] text-[#fafafa]">
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-28">
                        <p className="text-[9px] text-[#3f3f46] mb-0.5 uppercase tracking-wider">Year</p>
                        <input type="text" value={row.year} onChange={(e) => handleStatusChange(idx, "year", e.target.value)}
                          className="w-full bg-transparent text-[#22c55e] text-xs font-mono font-bold text-center focus:outline-none"
                          placeholder="2024-25" />
                      </div>
                      <button type="button" onClick={() => handleRemoveStatusRow(idx)}
                        className="text-[#3f1515] hover:text-[#f87171] transition-colors mt-1" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!editingMember.statusHistory || editingMember.statusHistory.length === 0) && (
                    <p className="text-[10px] text-[#3f3f46] font-mono text-center py-2">No year entries. Click &quot;Add Year&quot; above.</p>
                  )}
                </div>
              </div>

              {/* Status message */}
              {saveStatus !== "idle" && (
                <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-mono border ${
                  saveStatus === "ok"  ? "bg-[#0c2317] border-[#14532d] text-[#22c55e]" :
                  saveStatus === "err" ? "bg-[#200a0a] border-[#3f1515] text-[#f87171]" :
                  "bg-[#0f0f12] border-[#1a1a1e] text-[#71717a]"
                }`}>
                  {saveStatus === "ok" ? <Check className="w-3.5 h-3.5 shrink-0" /> : saveStatus === "err" ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : null}
                  {saveMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a1e]">
                <button type="button" onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg bg-[#111114] hover:bg-[#1a1a1e] text-[#a1a1aa] text-xs font-mono transition-colors border border-[#1a1a1e]">
                  Cancel
                </button>
                <button type="submit" disabled={saveStatus === "saving"}
                  className="px-5 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-mono font-bold flex items-center gap-2 transition-colors disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" />
                  {isNew ? "Create Member" : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
