"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Terminal, 
  GitBranch, 
  Cpu, 
  Code2, 
  Server, 
  Globe, 
  Layers, 
  Zap, 
  Database, 
  Flame 
} from "lucide-react";

interface FloatingItem {
  icon: React.ReactNode;
  label: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  color: string;
}

const items: FloatingItem[] = [
  { icon: <Terminal className="w-5 h-5" />, label: "bash", top: "14%", left: "3.5%", color: "#00ea64" },
  { icon: <GitBranch className="w-5 h-5" />, label: "git", top: "54%", right: "3%", color: "#38bdf8" },
  { icon: <Code2 className="w-5 h-5" />, label: "foss", bottom: "10%", left: "42%", color: "#00ea64" },
  { icon: <Cpu className="w-5 h-5" />, label: "kernel", top: "22%", right: "9%", color: "#a78bfa" },
  { icon: <Server className="w-5 h-5" />, label: "linux", bottom: "24%", left: "8%", color: "#38bdf8" },
  { icon: <Globe className="w-5 h-5" />, label: "web", top: "72%", left: "4%", color: "#00ea64" },
  { icon: <Layers className="w-5 h-5" />, label: "stack", bottom: "34%", right: "6%", color: "#38bdf8" },
  { icon: <Zap className="w-5 h-5" />, label: "fast", top: "36%", left: "2%", color: "#facc15" },
  { icon: <Database className="w-5 h-5" />, label: "data", top: "8%", right: "28%", color: "#00ea64" },
  { icon: <Flame className="w-5 h-5" />, label: "rust", bottom: "14%", right: "18%", color: "#fb923c" },
];

export default function FloatingLogos() {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setReduceMotion(
        typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block"
          style={{
            top: item.top,
            bottom: item.bottom,
            left: item.left,
            right: item.right,
          }}
          animate={
            reduceMotion
              ? {}
              : {
                  y: [0, i % 2 === 0 ? -28 : -18, 0],
                  x: [0, i % 3 === 0 ? 14 : i % 3 === 1 ? -14 : 8, 0],
                  rotate: [0, i % 2 === 0 ? 8 : -8, 0],
                }
          }
          transition={{
            duration: 10 + i * 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl p-2.5 border border-white/[0.08] flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)] group"
            style={{
              opacity: i < 3 ? 0.5 : 0.28,
              boxShadow: `0 0 24px ${item.color}15`,
            }}
          >
            <div style={{ color: item.color }}>{item.icon}</div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 mt-0.5">
              {item.label}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
