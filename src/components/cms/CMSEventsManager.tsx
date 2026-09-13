"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ClubEvent } from "@/types";
import { 
  Plus, Edit2, Trash2, Save, X, Upload, Calendar, Clock, 
  MapPin, ExternalLink, Check, ToggleLeft, ToggleRight 
} from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";
import { formatDate } from "@/lib/utils";
import { useGlassToast } from "@/components/ui/GlassToast";
import { GlassDatePicker } from "@/components/ui/GlassDatePicker";
import { notifySessionExpired } from "@/lib/authClient";

export function CMSEventsManager() {
  const toast = useGlassToast();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingEvent) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [editingEvent]);

  const getAuthHeaders = (extraHeaders?: Record<string, string>) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("foss_cms_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json", ...extraHeaders };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.data) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddNew = () => {
    playClickSound();
    setIsNew(true);
    setEditingEvent({
      _id: "",
      title: "",
      slug: "",
      description: "",
      posterUrl: "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM - 4:00 PM",
      venue: "TP Ganesan Auditorium, SRMIST",
      registrationUrl: "https://fossunited.org/c/srm-ktr",
      active: true,
    });
  };

  const handleEdit = (event: ClubEvent) => {
    playClickSound();
    setIsNew(false);
    setEditingEvent(JSON.parse(JSON.stringify(event)));
  };

  const handleQuickToggleActive = async (event: ClubEvent) => {
    playClickSound();
    try {
      const nextActive = !event.active;
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...event, active: nextActive }),
      });
      if (res.status === 401) {
        notifySessionExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((e) => (e._id === event._id ? { ...e, active: nextActive } : e))
        );
        toast.info("Status Changed", `"${event.title}" marked as ${nextActive ? "Upcoming" : "Past"}.`);
      } else {
        toast.error("Update Failed", data.error || "Failed to toggle status");
      }
    } catch {
      toast.error("Update Failed", "Failed to toggle status");
    }
  };

  const handleDelete = (id: string, title: string) => {
    toast.confirmDelete({
      title: "Delete Event?",
      message: `Are you sure you want to permanently delete "${title}"? This cannot be undone.`,
      confirmLabel: "Delete Event",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/events/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          if (res.status === 401) {
            notifySessionExpired();
            return;
          }
          const data = await res.json();
          if (data.success) {
            setEvents((prev) => prev.filter((e) => e._id !== id));
            toast.deleted("Event Deleted", `"${title}" has been permanently removed.`);
          } else {
            toast.error("Delete Failed", data.error || "Failed to delete event");
          }
        } catch {
          toast.error("Delete Failed", "Network error while deleting event");
        }
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSaveStatus("Saving event...");

    try {
      const url = isNew ? "/api/events" : `/api/events/${editingEvent._id}`;
      const method = isNew ? "POST" : "PUT";

      // Sanitize fields before sending
      const payload = {
        ...editingEvent,
        title: editingEvent.title.trim(),
        posterUrl: editingEvent.posterUrl ? editingEvent.posterUrl.trim() : "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png",
        registrationUrl: editingEvent.registrationUrl ? editingEvent.registrationUrl.trim() : "",
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setSaveStatus("Session expired. Please re-login.");
        toast.error("Session Expired", "Please log in again to save changes.");
        notifySessionExpired();
        return;
      }

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        playSuccessSound();
        setSaveStatus("Event saved successfully!");
        toast.success(isNew ? "Event Created" : "Event Updated", `"${editingEvent.title}" saved successfully.`);
        setTimeout(() => {
          setEditingEvent(null);
          setSaveStatus(null);
          fetchEvents();
        }, 800);
      } else {
        const errorMsg = data?.error || `Server responded with status ${res.status}`;
        setSaveStatus(errorMsg);
        toast.error("Save Failed", errorMsg);
      }
    } catch (err: any) {
      console.error("Event save error:", err);
      setSaveStatus(err?.message || "Server connection error during save");
      toast.error("Save Failed", err?.message || "Server connection error during save");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = typeof window !== "undefined" ? localStorage.getItem("foss_cms_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });
      if (res.status === 401) {
        notifySessionExpired();
        return;
      }
      const data = await res.json();
      if (data.success && data.url) {
        setEditingEvent({ ...editingEvent, posterUrl: data.url });
        toast.success("Poster Uploaded", "Event poster uploaded successfully.");
      } else {
        toast.error("Upload Failed", data.error || "Could not upload image");
      }
    } catch {
      toast.error("Upload Failed", "Network error while uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Events &amp; Sprints Manager</h2>
          <p className="text-xs text-gray-400">
            Publish hackathons, workshops, and manage the active vs. past event sections.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center space-x-1.5 self-start sm:self-auto transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-mono text-xs animate-pulse">
          Loading events pipeline...
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <p className="text-gray-400 text-xs font-mono">No events yet. Click &quot;+ Add New Event&quot; above to publish one.</p>
        </div>
      ) : (
        <>
          {/* Mobile Events List (< sm) */}
          <div className="block sm:hidden space-y-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-3 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                    <Image
                      src={event.posterUrl || "/images/logo-transparent.png"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm font-sans truncate">{event.title}</h4>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {formatDate(event.date)} · {event.time}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickToggleActive(event)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase transition-all flex items-center gap-1.5 ${
                      event.active
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${event.active ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                    <span>{event.active ? "Upcoming" : "Past"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event._id, event.title)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs text-red-400 font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= sm) */}
          <div className="hidden sm:block rounded-2xl bg-[#080C14] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b101c] text-gray-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Event</th>
                    <th className="p-4">Date &amp; Venue</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-black border border-white/10 flex-shrink-0">
                          <Image
                            src={event.posterUrl || "/images/logo-transparent.png"}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm font-sans">{event.title}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span>{event.registrationUrl}</span>
                            <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                              ↗
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-gray-300">
                        <div>{formatDate(event.date)} ({event.time})</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{event.venue}</div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleQuickToggleActive(event)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                            event.active
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                          }`}
                          title="Click to toggle between Upcoming and Past"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${event.active ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                          <span>{event.active ? "Upcoming" : "Past"}</span>
                        </button>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                          title="Edit event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id, event.title)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit / Add Event Modal */}
      {mounted && editingEvent && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full sm:max-w-2xl bg-[#080C14] border border-white/20 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>{isNew ? "+ Create Event" : "✎ Edit Event: " + editingEvent.title}</span>
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono flex-1 overscroll-contain">
                {/* Title */}
                <div>
                  <label className="block text-gray-400 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                    placeholder="e.g. FOSS Hack 2025 SRM Edition"
                  />
                </div>

                {/* Poster URL (ImageKit) */}
                <div className="space-y-1.5">
                  <label className="block text-[#71717a] text-[10px] uppercase font-mono tracking-wider">Poster Image URL (from ImageKit) *</label>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-[#111114] border border-[#222226] flex-shrink-0">
                      {editingEvent.posterUrl ? (
                        <img
                          src={editingEvent.posterUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#3f3f46] text-xs font-mono">IMG</div>
                      )}
                    </div>
                    <input
                      type="url"
                      required
                      value={editingEvent.posterUrl}
                      onChange={(e) => setEditingEvent({ ...editingEvent, posterUrl: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#060608] border border-[#222226] rounded-lg text-[#fafafa] text-xs font-mono focus:outline-none focus:border-[#22c55e]"
                      placeholder="https://ik.imagekit.io/fossclubsrm/events/poster.jpg"
                    />
                  </div>
                  <p className="text-[10px] text-[#3f3f46] font-mono">Upload to ImageKit first, then paste the URL here.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                    placeholder="Comprehensive event details, agenda, cash prize pools, prerequisites..."
                  />
                </div>

                {/* Date, Time, Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <GlassDatePicker
                      label="Event Date"
                      required
                      value={editingEvent.date}
                      onChange={(newDate) => setEditingEvent({ ...editingEvent, date: newDate })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Time Range *</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.time}
                      onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="10:00 AM - 4:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Venue Location *</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.venue}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                      placeholder="TP Ganesan Auditorium"
                    />
                  </div>
                </div>

                {/* Registration Link (FOSS United) */}
                <div>
                  <label className="block text-gray-400 mb-1">
                    Registration URL (FOSS United Event Page) *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingEvent.registrationUrl}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registrationUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-emerald-400 focus:outline-none focus:border-emerald-500"
                    placeholder="https://fossunited.org/c/srm-ktr"
                  />
                </div>

                {/* Active Toggle */}
                <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-white font-semibold">Active Status (Upcoming vs Past)</div>
                    <div className="text-gray-400 text-[11px]">
                      Active events surface in Upcoming; unchecking moves them to Past Events archive.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingEvent({ ...editingEvent, active: !editingEvent.active })}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                      editingEvent.active 
                        ? "bg-emerald-500 text-black shadow" 
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    <span>{editingEvent.active ? "Upcoming (Active)" : "Past Archive"}</span>
                  </button>
                </div>

                {/* Feedback */}
                {saveStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                    {saveStatus}
                  </div>
                )}
              </div>

              {/* Sticky bottom footer actions */}
              <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-white/10 bg-[#080C14]/95 backdrop-blur-md shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono transition-colors border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isNew ? "Publish Event" : "Save Event"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
