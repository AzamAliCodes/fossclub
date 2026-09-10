"use client";

import { motion } from "framer-motion";

const reduceMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 z-[-5] overflow-hidden pointer-events-none">
      {/* Deep nebula glow - top left green */}
      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.05 }
            : { scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04], x: [0, 60, 0], y: [0, -60, 0] }
        }
        transition={reduceMotion ? { duration: 0 } : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0, 234, 100, 0.35) 0%, transparent 70%)", willChange: "transform" }}
      />
      {/* Bottom right cyan accent */}
      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.04 }
            : { scale: [1, 1.4, 1], opacity: [0.03, 0.07, 0.03], x: [0, -80, 0], y: [0, 60, 0] }
        }
        transition={reduceMotion ? { duration: 0 } : { duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)", willChange: "transform" }}
      />
      {/* Center subtle teal */}
      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.03 }
            : { scale: [1, 1.3, 1], opacity: [0.02, 0.05, 0.02] }
        }
        transition={reduceMotion ? { duration: 0 } : { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-[30%] left-[25%] w-[35vw] h-[35vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)", willChange: "transform" }}
      />
    </div>
  );
}
