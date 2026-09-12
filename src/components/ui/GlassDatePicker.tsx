"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import { playClickSound } from "@/lib/sound";

const MONTHS = [
  { name: "January", short: "Jan" },
  { name: "February", short: "Feb" },
  { name: "March", short: "Mar" },
  { name: "April", short: "Apr" },
  { name: "May", short: "May" },
  { name: "June", short: "Jun" },
  { name: "July", short: "Jul" },
  { name: "August", short: "Aug" },
  { name: "September", short: "Sep" },
  { name: "October", short: "Oct" },
  { name: "November", short: "Nov" },
  { name: "December", short: "Dec" },
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export interface GlassDatePickerProps {
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

export function GlassDatePicker({
  value,
  onChange,
  label = "Event Date",
  required = false,
  className = "",
  minYear,
  maxYear,
}: GlassDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value into year, month (0-11), day
  const parsedDate = useMemo(() => {
    if (!value || typeof value !== "string") {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        isValid: false,
      };
    }
    const parts = value.split("-").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return {
        year: parts[0],
        month: Math.max(0, Math.min(11, parts[1] - 1)),
        day: Math.max(1, Math.min(31, parts[2])),
        isValid: true,
      };
    }
    const fallback = new Date();
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth(),
      day: fallback.getDate(),
      isValid: false,
    };
  }, [value]);

  // Popover calendar view state (which month/year is currently being viewed)
  const [viewYear, setViewYear] = useState<number>(parsedDate.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedDate.month);
  const [yearInputValue, setYearInputValue] = useState<string>(String(parsedDate.year));
  const [selectorMode, setSelectorMode] = useState<"calendar" | "year" | "month">("calendar");

  // Sync view state when value changes from outside
  useEffect(() => {
    if (parsedDate.isValid) {
      setViewYear(parsedDate.year);
      setViewMonth(parsedDate.month);
      setYearInputValue(String(parsedDate.year));
    }
  }, [value, parsedDate]);

  // Sync year input when viewYear changes
  useEffect(() => {
    setYearInputValue(String(viewYear));
  }, [viewYear]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectorMode("calendar");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectorMode("calendar");
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Dynamic Decade calculation for unlimited year selection
  const decadeStart = Math.floor(viewYear / 10) * 10;
  const decadeYears = useMemo(() => {
    const list: number[] = [];
    for (let y = decadeStart - 1; y <= decadeStart + 10; y++) {
      if (minYear !== undefined && y < minYear) continue;
      if (maxYear !== undefined && y > maxYear) continue;
      list.push(y);
    }
    return list;
  }, [decadeStart, minYear, maxYear]);

  // Calculate calendar grid for viewYear & viewMonth
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // Previous month overflow days
    const prevDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      prevDays.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    // Current month days
    const currentDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      currentDays.push({
        day: d,
        isCurrentMonth: true,
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    // Next month overflow days to complete 35 or 42 grid cells
    const totalCells = prevDays.length + currentDays.length <= 35 ? 35 : 42;
    const nextDaysNeeded = totalCells - (prevDays.length + currentDays.length);
    const nextDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      nextDays.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [viewYear, viewMonth]);

  const selectDate = (dateStr: string) => {
    try {
      playClickSound();
    } catch {}
    onChange(dateStr);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      playClickSound();
    } catch {}
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => (minYear !== undefined ? Math.max(minYear, prev - 1) : prev - 1));
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      playClickSound();
    } catch {}
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => (maxYear !== undefined ? Math.min(maxYear, prev + 1) : prev + 1));
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleQuickPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setViewYear(y);
    setViewMonth(d.getMonth());
    selectDate(`${y}-${m}-${day}`);
  };

  const handleSetYearFromInput = () => {
    const yr = parseInt(yearInputValue, 10);
    if (!isNaN(yr) && yr >= 1000 && yr <= 9999) {
      try {
        playClickSound();
      } catch {}
      let finalYear = yr;
      if (minYear !== undefined) finalYear = Math.max(minYear, finalYear);
      if (maxYear !== undefined) finalYear = Math.min(maxYear, finalYear);
      setViewYear(finalYear);
      setSelectorMode("calendar");
    }
  };

  // Format readable display text
  const formattedDisplay = useMemo(() => {
    if (!parsedDate.isValid) return "Select date";
    const d = new Date(parsedDate.year, parsedDate.month, parsedDate.day);
    if (isNaN(d.getTime())) return value || "Select date";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [parsedDate, value]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-gray-400 mb-1 text-[11px] font-mono uppercase tracking-wider flex items-center justify-between">
          <span>
            {label} {required && "*"}
          </span>
          {value && (
            <span className="text-[10px] text-emerald-400/80 font-mono">{value}</span>
          )}
        </label>
      )}

      {/* Main Trigger Field */}
      <button
        type="button"
        onClick={() => {
          try {
            playClickSound();
          } catch {}
          setIsOpen(!isOpen);
          setSelectorMode("calendar");
        }}
        className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs font-mono font-bold transition-all text-left select-none cursor-pointer border backdrop-blur-2xl ${
          isOpen
            ? "bg-white/[0.12] border-[#22c55e]/60 shadow-[0_0_20px_rgba(34,197,94,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)] text-white"
            : "bg-white/[0.05] hover:bg-white/[0.09] border-white/15 hover:border-white/30 text-zinc-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div
            className={`p-1 rounded-lg ${
              isOpen ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-white/10 text-zinc-400"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="truncate">{formattedDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-[10px] text-emerald-400 font-mono">
            {parsedDate.isValid ? value : "YYYY-MM-DD"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
          />
        </div>
      </button>

      {/* Liquid Glass Date Picker Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 sm:left-auto right-0 sm:right-auto sm:w-[340px] top-full mt-2 z-[110] rounded-2xl overflow-hidden p-4 bg-[#090e18]/95 border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-2xl text-xs font-mono select-none"
          >
            {/* Top Specular Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Popover Header: Month & Year Quick Jumps */}
            <div className="flex items-center justify-between gap-1 pb-3 mb-3 border-b border-white/10">
              {/* Prev Month Button */}
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month & Year Selectors with Instant Jump Dropdowns */}
              <div className="flex items-center gap-1.5">
                {/* Month Button / Trigger */}
                <button
                  type="button"
                  onClick={() => setSelectorMode(selectorMode === "month" ? "calendar" : "month")}
                  className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectorMode === "month"
                      ? "bg-[#22c55e] text-black shadow-sm"
                      : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white"
                  }`}
                >
                  <span>{MONTHS[viewMonth].name}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {/* Year Button / Trigger - Unlimited Selector */}
                <button
                  type="button"
                  onClick={() => setSelectorMode(selectorMode === "year" ? "calendar" : "year")}
                  className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectorMode === "year"
                      ? "bg-[#22c55e] text-black shadow-sm"
                      : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white"
                  }`}
                >
                  <span>{viewYear}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              </div>

              {/* Next Month Button */}
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode 1: Month Quick Jump Grid */}
            {selectorMode === "month" && (
              <div className="py-1">
                <div className="text-[10px] text-zinc-400 font-mono mb-2 flex items-center justify-between">
                  <span>Select Month:</span>
                  <button
                    type="button"
                    onClick={() => setSelectorMode("calendar")}
                    className="text-emerald-400 hover:underline cursor-pointer"
                  >
                    Back to Calendar
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS.map((m, idx) => {
                    const isCurrent = idx === viewMonth;
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => {
                          try {
                            playClickSound();
                          } catch {}
                          setViewMonth(idx);
                          setSelectorMode("calendar");
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                          isCurrent
                            ? "bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/30 font-black"
                            : "bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/5"
                        }`}
                      >
                        {m.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Mode 2: Unlimited Year Selector (Decade Navigation + Direct Type Input) */}
            {selectorMode === "year" && (
              <div className="py-1">
                {/* Decade Navigation Header */}
                <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        playClickSound();
                      } catch {}
                      setViewYear((prev) =>
                        minYear !== undefined ? Math.max(minYear, prev - 10) : prev - 10
                      );
                    }}
                    className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Previous 10 Years"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>-10y</span>
                  </button>

                  <span className="font-bold text-white text-xs tracking-wider">
                    {decadeStart} – {decadeStart + 9}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        playClickSound();
                      } catch {}
                      setViewYear((prev) =>
                        maxYear !== undefined ? Math.min(maxYear, prev + 10) : prev + 10
                      );
                    }}
                    className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Next 10 Years"
                  >
                    <span>+10y</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 12-Year Grid (Decade + Boundary Years) */}
                <div className="grid grid-cols-3 gap-1.5 py-1">
                  {decadeYears.map((yr) => {
                    const isCurrent = yr === viewYear;
                    const isTodayYear = yr === new Date().getFullYear();
                    const isOutsideDecade = yr < decadeStart || yr > decadeStart + 9;

                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          try {
                            playClickSound();
                          } catch {}
                          setViewYear(yr);
                          setSelectorMode("calendar");
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer relative ${
                          isCurrent
                            ? "bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/30 font-black"
                            : isOutsideDecade
                            ? "bg-white/[0.02] hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300 border border-white/5"
                            : "bg-white/[0.05] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/10"
                        }`}
                      >
                        <span>{yr}</span>
                        {isTodayYear && !isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] absolute bottom-1 left-1/2 -translate-x-1/2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Unlimited Year Input (Type ANY year e.g. 2018, 2026, 2045) */}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-[10px] text-zinc-400 font-mono mb-1.5 flex items-center justify-between">
                    <span>Type any year:</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          playClickSound();
                        } catch {}
                        setViewYear(new Date().getFullYear());
                        setSelectorMode("calendar");
                      }}
                      className="text-emerald-400 hover:underline cursor-pointer"
                    >
                      Current ({new Date().getFullYear()})
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="e.g. 2026"
                      value={yearInputValue}
                      onChange={(e) => setYearInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSetYearFromInput();
                        }
                      }}
                      className="flex-1 bg-white/[0.06] border border-white/15 focus:border-[#22c55e] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleSetYearFromInput}
                      className="px-3 py-1.5 rounded-lg bg-[#22c55e] text-black font-bold text-xs hover:bg-[#1ea750] transition-colors cursor-pointer"
                    >
                      Set
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectorMode("calendar")}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 3: Standard Calendar Days View */}
            {selectorMode === "calendar" && (
              <div>
                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <span key={d} className="text-[10px] font-bold text-zinc-500 py-1">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((cell, idx) => {
                    const isSelected = value === cell.dateStr;
                    const isToday = todayStr === cell.dateStr;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectDate(cell.dateStr)}
                        className={`h-8 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-[#22c55e] text-black font-black shadow-md shadow-[#22c55e]/40 z-10"
                            : isToday
                            ? "bg-[#0c2317] border border-[#14532d] text-emerald-400 font-bold hover:bg-[#14532d]"
                            : cell.isCurrentMonth
                            ? "text-zinc-200 hover:bg-white/[0.10] hover:text-white font-medium"
                            : "text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-400"
                        }`}
                      >
                        <span>{cell.day}</span>
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-[#22c55e] absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Section: Quick Presets & Done Action */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickPreset(0)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                title="Jump to today's date"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    playClickSound();
                  } catch {}
                  setIsOpen(false);
                  setSelectorMode("calendar");
                }}
                className="px-4 py-1.5 rounded-xl bg-[#22c55e] text-black font-bold text-xs hover:bg-[#1ea750] shadow-md shadow-[#22c55e]/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
