"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ClubEvent } from "@/types";
import { 
  Plus, Edit2, Trash2, Save, X, Upload, Calendar, Clock, 
  MapPin, ExternalLink, Check, ToggleLeft, ToggleRight 
} from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";
import { formatDate } from "@/lib/utils";

export function CMSEventsManager() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
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
      posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM - 4:00 PM",
      venue: "TP Ganesan Auditorium, SRMIST",
      registrationUrl: "https://fossunited.org/c/srm-ktr",
      active: true,
      tags: ["FOSS", "SRMIST"],
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
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, active: !event.active }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((e) => (e._id === event._id ? { ...e, active: !e.active } : e))
        );
      }
    } catch {
      alert("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    playClickSound();

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setEvents((prev) => prev.filter((e) => e._id !== id));
      }
    } catch {
      alert("Failed to delete event");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSaveStatus("Saving event...");

    try {
      const url = isNew ? "/api/events" : `/api/events/${editingEvent._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent),
      });

      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        setSaveStatus("Event saved successfully!");
        setTimeout(() => {
          setEditingEvent(null);
          setSaveStatus(null);
          fetchEvents();
        }, 800);
      } else {
        setSaveStatus(data.error || "Save failed");
      }
    } catch {
      setSaveStatus("Server error during save");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setEditingEvent({ ...editingEvent, posterUrl: data.url });
      } else {
        alert("Upload failed: " + (data.error || "Unknown"));
      }
    } catch {
      alert("Upload failed");
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
      ) : (
        <div className="rounded-2xl bg-[#080C14] border border-white/10 overflow-hidden shadow-xl">
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
      )}

      {/* Edit / Add Event Modal */}
      {editingEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setEditingEvent(null)}
        >
          <div 
            className="w-full max-w-2xl bg-[#090D15] border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-[#0c121e] border-b border-gray-800">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>{isNew ? "+ Create Event" : "✎ Edit Event: " + editingEvent.title}</span>
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4 text-xs font-mono">
              
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
                <label className="block text-[#71717a] text-[10px] uppercase font-mono tracking-wider">Poster Image URL (from ImageKit)</label>
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
                  <label className="block text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Time Range</label>
                  <input
                    type="text"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    placeholder="10:00 AM - 4:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Venue Location</label>
                  <input
                    type="text"
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
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Active Status (Upcoming vs Past)</div>
                  <div className="text-gray-400 text-[11px]">
                    Active events surface in Upcoming; unchecking moves them to Past Events archive.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingEvent({ ...editingEvent, active: !editingEvent.active })}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 ${
                    editingEvent.active 
                      ? "bg-emerald-500 text-black shadow" 
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  <span>{editingEvent.active ? "Upcoming (Active)" : "Past Archive"}</span>
                </button>
              </div>

              {/* Feedback & Actions */}
              {saveStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {saveStatus}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isNew ? "Publish Event" : "Save Event"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
