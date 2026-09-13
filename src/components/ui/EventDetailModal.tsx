"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Archive,
  X,
  ExternalLink,
} from "lucide-react";
import { ClubEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { playClickSound } from "@/lib/sound";

export default function EventDetailModal({
  event,
  onClose,
}: {
  event: ClubEvent;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  if (!mounted) return null;

  const isPast = !event.active;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-none sm:backdrop-blur-md overflow-hidden overscroll-none select-none"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 26, stiffness: 380 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#090d16]/95 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col md:flex-row text-[#fafafa] transform-gpu select-text"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            try {
              playClickSound();
            } catch {}
            onClose();
          }}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left / Top: Event Poster in Full Resolution (Uncropped) */}
        <div className="relative w-full md:w-1/2 bg-[#05080f] p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 shrink-0">
          <div className="relative w-full flex items-center justify-center max-h-[42vh] md:max-h-[76vh]">
            <img
              src={
                event.posterUrl ||
                "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png"
              }
              alt={event.title}
              className="w-auto h-auto max-h-[42vh] md:max-h-[76vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/15"
            />
          </div>
        </div>

        {/* Right / Bottom: Event Details & Actions */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[48vh] md:max-h-[90vh] space-y-4">
          <div className="space-y-4">
            {/* Status & Title */}
            <div className="space-y-2 pr-7 md:pr-0">
              <div className="flex items-center gap-2">
                {isPast ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-zinc-300 text-xs font-mono">
                    <Archive className="w-3.5 h-3.5 text-zinc-400" />
                    Past Event
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c2317] border border-[#14532d] text-[#22c55e] text-xs font-mono font-bold shadow-md shadow-emerald-500/10">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    Upcoming Event
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {event.title}
              </h2>
            </div>

            {/* Quick Metadata Grid (Date, Time, Venue) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{event.time || "TBA"}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">{event.venue || "SRMIST Kattankulathur"}</span>
              </div>
            </div>

            {/* Event Description / Overview */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Event Overview
              </h3>
              <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  try {
                    playClickSound();
                  } catch {}
                }}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  isPast
                    ? "bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-white"
                    : "bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-emerald-500/20"
                }`}
              >
                <span>{isPast ? "View Event Page" : "Register on FOSS United"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => {
                try {
                  playClickSound();
                } catch {}
                onClose();
              }}
              className="py-2.5 sm:py-3 px-5 rounded-xl font-mono text-xs font-semibold text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
