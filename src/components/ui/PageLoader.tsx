"use client";

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleText from "./ParticleText";

const isMobile =
  typeof window !== "undefined" && window.innerWidth <= 640;

const EMBERS = Array.from({ length: isMobile ? 12 : 22 }).map((_, i) => ({
  left: (i * 37 + 13) % 100,
  delay: (i % 6) * 0.7,
  duration: 4.2 + (i % 5) * 1.1,
  size: 3 + (i % 3) * 2,
  emerald: i % 3 !== 0,
}));

export default function PageLoader() {
  const [phase, setPhase] = useState<"gathering" | "holding" | "fading">("gathering");
  const doneRef = useRef(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (typeof window !== "undefined") {
      (window as { __loaderFinished?: boolean }).__loaderFinished = true;
      window.dispatchEvent(new CustomEvent("loader-finished"));
    }
  }, []);

  // Called by ParticleText once all particles have assembled
  const handleGatherComplete = useCallback(() => {
    setPhase("holding");
    setTimeout(() => {
      setPhase("fading");
    }, 500);
    setTimeout(() => {
      finish();
    }, 1100);
  }, [finish]);

  // Reduced-motion fallback or emergency timeout
  useEffect(() => {
    if (prefersReducedMotion) {
      finish();
      return;
    }
    // Safety max timer in case user tab was backgrounded during initial load
    const timer = setTimeout(() => {
      handleGatherComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion, finish, handleGatherComplete]);

  if (!mounted || prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {phase !== "fading" ? (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, y: -16, filter: "blur(6px)" }}
          transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080c1a] overflow-hidden select-none pointer-events-none"
        >
          {/* CRT scanlines */}
          <div className="loader-scanlines absolute inset-0 pointer-events-none opacity-50 z-10" />
          {/* Radial vignette */}
          <div className="loader-vignette absolute inset-0 pointer-events-none z-10" />

          {/* Rising embers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {EMBERS.map((e, i) => (
              <span
                key={i}
                className="loader-ember absolute"
                style={{
                  left: `${e.left}%`,
                  bottom: 0,
                  width: e.size,
                  height: e.size,
                  opacity: 0,
                  background: e.emerald
                    ? "radial-gradient(circle, #00ea64 0%, rgba(0,234,100,0) 70%)"
                    : "radial-gradient(circle, #38bdf8 0%, rgba(56,189,248,0) 70%)",
                  animation: `ember-rise ${e.duration}s ease-in ${e.delay}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Particle Text - full screen canvas */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto">
            <ParticleText
              text="FOSS SRM"
              color="#f0f0f0"
              highlightColor="#00ea64"
              fontSize={isMobile ? "clamp(2.4rem,14vw,3.8rem)" : "clamp(4rem,9vw,7.5rem)"}
              fontWeight={800}
              fontFamily="monospace, system-ui, sans-serif"
              particleSize={isMobile ? 1.8 : 2.2}
              density={isMobile ? 4 : 3}
              scatter={isMobile ? 260 : 450}
              gatherDuration={1200}
              stagger={250}
              pointerRepel={40}
              repelRadius={isMobile ? 90 : 130}
              idleDrift={0.8}
              glow={true}
              trigger="mount"
              onComplete={handleGatherComplete}
              className="w-full h-full"
            />
          </div>

          {/* Bottom status + progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase === "holding" ? 0.9 : 0.6, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="absolute bottom-10 w-full flex flex-col items-center gap-3 px-6 z-20 pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
              <p className="text-[10px] sm:text-xs text-[#a1a1aa] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-mono text-center">
                INITIALIZING <span className="text-[#22c55e] font-semibold">FREE & OPEN SOURCE</span> · SRMIST
              </p>
            </div>
            <div className="w-48 sm:w-64 h-[2px] rounded-full bg-[#222226] overflow-hidden">
              <div
                className="h-full w-1/3 rounded-full bg-[#22c55e]"
                style={{
                  animation: "loader-progress 1.4s ease-in-out infinite",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
