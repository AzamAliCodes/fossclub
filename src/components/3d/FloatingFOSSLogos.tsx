"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { playClickSound } from "@/lib/sound";
import iconsData from "./fossIconsData.json";

interface LogoConfig {
  id: string;
  name: string;
  category: string;
  top: string;
  left: string;
  depth: number; // 1 (far), 2 (mid), 3 (near)
  floatDelay: number;
  floatDuration: number;
  accentColor: string;
  size: number;
  mobileVisible?: boolean;
}

const LOGO_ITEMS: LogoConfig[] = [
  // Upper Left: Linux Tux
  {
    id: "linux",
    name: "Linux",
    category: "Kernel",
    top: "10%",
    left: "5%",
    depth: 3,
    floatDelay: 0,
    floatDuration: 8.5,
    accentColor: "#facc15",
    size: 24,
    mobileVisible: true,
  },
  // Upper Right: Ubuntu
  {
    id: "ubuntu",
    name: "Ubuntu",
    category: "Distro",
    top: "12%",
    left: "87%",
    depth: 3,
    floatDelay: 1.2,
    floatDuration: 9.2,
    accentColor: "#e95420",
    size: 24,
    mobileVisible: true,
  },
  // Hero Mid-Left: MySQL
  {
    id: "mysql",
    name: "MySQL",
    category: "Database",
    top: "28%",
    left: "4%",
    depth: 2,
    floatDelay: 0.8,
    floatDuration: 10.5,
    accentColor: "#00758f",
    size: 25,
    mobileVisible: true,
  },
  // Hero Mid-Right: Open Source Initiative (OSI)
  {
    id: "opensourceinitiative",
    name: "OSI",
    category: "FOSS Standard",
    top: "26%",
    left: "88%",
    depth: 2,
    floatDelay: 2.1,
    floatDuration: 8.8,
    accentColor: "#3da639",
    size: 25,
    mobileVisible: true,
  },
  // Kubernetes (Cloud Orchestration)
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Cloud Native",
    top: "18%",
    left: "17%",
    depth: 1,
    floatDelay: 1.6,
    floatDuration: 11.0,
    accentColor: "#326ce5",
    size: 22,
    mobileVisible: false,
  },
  // Redis (In-Memory Cache)
  {
    id: "redis",
    name: "Redis",
    category: "Cache Store",
    top: "20%",
    left: "79%",
    depth: 1,
    floatDelay: 2.7,
    floatDuration: 10.2,
    accentColor: "#dc382d",
    size: 22,
    mobileVisible: false,
  },
  // Upper Mid-Center Left: Rust
  {
    id: "rust",
    name: "Rust",
    category: "Systems Lang",
    top: "36%",
    left: "14%",
    depth: 2,
    floatDelay: 3.0,
    floatDuration: 11.2,
    accentColor: "#dea584",
    size: 23,
    mobileVisible: false,
  },
  // Upper Mid-Center Right: Git SCM
  {
    id: "git",
    name: "Git",
    category: "Version Control",
    top: "38%",
    left: "82%",
    depth: 2,
    floatDelay: 1.7,
    floatDuration: 9.8,
    accentColor: "#f05032",
    size: 23,
    mobileVisible: false,
  },
  // Mid-Lower Left: Docker
  {
    id: "docker",
    name: "Docker",
    category: "Containers",
    top: "48%",
    left: "6%",
    depth: 3,
    floatDelay: 2.5,
    floatDuration: 10.0,
    accentColor: "#2496ed",
    size: 25,
    mobileVisible: true,
  },
  // Mid-Lower Right: Python
  {
    id: "python",
    name: "Python",
    category: "Language",
    top: "50%",
    left: "89%",
    depth: 3,
    floatDelay: 0.4,
    floatDuration: 9.5,
    accentColor: "#3776ab",
    size: 25,
    mobileVisible: true,
  },
  // NGINX (Web Server)
  {
    id: "nginx",
    name: "NGINX",
    category: "Reverse Proxy",
    top: "56%",
    left: "18%",
    depth: 1,
    floatDelay: 2.2,
    floatDuration: 11.8,
    accentColor: "#009639",
    size: 21,
    mobileVisible: false,
  },
  // GraphQL (API Spec)
  {
    id: "graphql",
    name: "GraphQL",
    category: "Query Lang",
    top: "58%",
    left: "76%",
    depth: 1,
    floatDelay: 0.9,
    floatDuration: 10.6,
    accentColor: "#e10098",
    size: 21,
    mobileVisible: false,
  },
  // Lower Left: Debian
  {
    id: "debian",
    name: "Debian",
    category: "Universal OS",
    top: "66%",
    left: "4%",
    depth: 2,
    floatDelay: 1.5,
    floatDuration: 8.2,
    accentColor: "#a81d33",
    size: 24,
    mobileVisible: false,
  },
  // Lower Right: Arch Linux
  {
    id: "archlinux",
    name: "Arch Linux",
    category: "Rolling Distro",
    top: "68%",
    left: "86%",
    depth: 2,
    floatDelay: 2.8,
    floatDuration: 10.8,
    accentColor: "#1793d1",
    size: 24,
    mobileVisible: true,
  },
  // Node.js (JavaScript Runtime)
  {
    id: "nodedotjs",
    name: "Node.js",
    category: "Runtime",
    top: "76%",
    left: "15%",
    depth: 2,
    floatDelay: 3.1,
    floatDuration: 9.9,
    accentColor: "#5fa04e",
    size: 23,
    mobileVisible: false,
  },
  // Firefox (Open Web)
  {
    id: "firefox",
    name: "Firefox",
    category: "Open Web",
    top: "78%",
    left: "81%",
    depth: 2,
    floatDelay: 1.4,
    floatDuration: 10.4,
    accentColor: "#ff7139",
    size: 23,
    mobileVisible: false,
  },
  // Bottom Left: PostgreSQL
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    top: "88%",
    left: "8%",
    depth: 3,
    floatDelay: 0.9,
    floatDuration: 9.0,
    accentColor: "#4169e1",
    size: 24,
    mobileVisible: false,
  },
  // Bottom Right: GNU Bash
  {
    id: "gnubash",
    name: "Bash",
    category: "Shell",
    top: "90%",
    left: "84%",
    depth: 3,
    floatDelay: 3.4,
    floatDuration: 11.5,
    accentColor: "#4eaa25",
    size: 23,
    mobileVisible: false,
  },
  // Deep Background: Neovim
  {
    id: "neovim",
    name: "Neovim",
    category: "Hyperextensible Editor",
    top: "42%",
    left: "24%",
    depth: 1,
    floatDelay: 1.1,
    floatDuration: 12.0,
    accentColor: "#57a143",
    size: 20,
    mobileVisible: false,
  },
  // Deep Background: Go
  {
    id: "go",
    name: "Go",
    category: "Cloud Systems",
    top: "44%",
    left: "72%",
    depth: 1,
    floatDelay: 2.0,
    floatDuration: 11.0,
    accentColor: "#00add8",
    size: 20,
    mobileVisible: false,
  },
  // Blender (3D Creative FOSS)
  {
    id: "blender",
    name: "Blender",
    category: "3D Pipeline",
    top: "84%",
    left: "25%",
    depth: 1,
    floatDelay: 2.6,
    floatDuration: 12.2,
    accentColor: "#ea7600",
    size: 21,
    mobileVisible: false,
  },
  // VLC Media Player (Open Media)
  {
    id: "vlcmediaplayer",
    name: "VLC",
    category: "Open Media",
    top: "86%",
    left: "70%",
    depth: 1,
    floatDelay: 0.7,
    floatDuration: 10.9,
    accentColor: "#ff8800",
    size: 21,
    mobileVisible: false,
  },
];

const DRIFT_PATTERNS = [
  { x: [0, 18, -22, 14, -10, 0], y: [0, -26, 14, -20, 10, 0], rot: [0, 8, -6, 5, -4, 0] },
  { x: [0, -20, 16, -24, 12, 0], y: [0, 22, -28, 16, -18, 0], rot: [0, -8, 7, -5, 4, 0] },
  { x: [0, 24, -14, 20, -16, 0], y: [0, -18, 26, -16, 20, 0], rot: [0, 6, -9, 8, -5, 0] },
  { x: [0, -16, 22, -18, 26, 0], y: [0, 28, -22, 20, -14, 0], rot: [0, -7, 9, -6, 5, 0] },
  { x: [0, 22, -26, 18, -12, 0], y: [0, -16, 22, -26, 16, 0], rot: [0, 9, -5, 8, -6, 0] },
  { x: [0, -24, 18, -14, 20, 0], y: [0, -20, 24, -18, 12, 0], rot: [0, -6, 8, -7, 4, 0] },
  { x: [0, 16, -20, 24, -14, 0], y: [0, 24, -16, 22, -20, 0], rot: [0, 7, -6, 5, -8, 0] },
];

export default function FloatingFOSSLogos() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 60 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const plane1X = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
  const plane1Y = useTransform(smoothMouseY, [-1, 1], [-8, 8]);

  const plane2X = useTransform(smoothMouseX, [-1, 1], [-18, 18]);
  const plane2Y = useTransform(smoothMouseY, [-1, 1], [-18, 18]);

  const plane3X = useTransform(smoothMouseX, [-1, 1], [-32, 32]);
  const plane3Y = useTransform(smoothMouseY, [-1, 1], [-32, 32]);

  useEffect(() => {
    setIsClient(true);
    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < 16) return;
      lastTime = now;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isClient) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0"
      style={{ perspective: "1000px" }}
      aria-hidden="true"
    >
      {LOGO_ITEMS.map((item, idx) => {
        const pathData = (iconsData as Record<string, string>)[item.id];
        if (!pathData) return null;

        const pX = item.depth === 3 ? plane3X : item.depth === 2 ? plane2X : plane1X;
        const pY = item.depth === 3 ? plane3Y : item.depth === 2 ? plane2Y : plane1Y;

        const baseOpacity = item.depth === 3 ? 0.85 : item.depth === 2 ? 0.72 : 0.60;
        const baseScale = item.depth === 3 ? 1.05 : item.depth === 2 ? 0.95 : 0.85;

        const isHovered = activeHoverId === item.id;
        const drift = DRIFT_PATTERNS[idx % DRIFT_PATTERNS.length];

        return (
          <motion.div
            key={item.id}
            style={{
              top: item.top,
              left: item.left,
              x: pX,
              y: pY,
            }}
            className={`absolute ${
              item.mobileVisible ? "flex" : "hidden md:flex"
            } items-center justify-center`}
          >
            {/* Random multi-axis organic floating motion */}
            <motion.div
              animate={{
                x: drift.x,
                y: drift.y,
                rotateZ: drift.rot,
              }}
              transition={{
                duration: item.floatDuration * 1.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.floatDelay,
              }}
              whileHover={{
                scale: 1.25,
                rotateZ: 0,
                transition: { duration: 0.18 },
              }}
              onHoverStart={() => {
                setActiveHoverId(item.id);
                try {
                  playClickSound();
                } catch {}
              }}
              onHoverEnd={() => setActiveHoverId(null)}
              className="pointer-events-auto cursor-pointer relative group"
            >
              {/* Compact glass coin badge with crisp white border and shiny specular catch-light */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
                  isHovered
                    ? "bg-black/95 border-white/80 opacity-100 shadow-[0_0_16px_rgba(255,255,255,0.25),inset_0_1px_0_0_rgba(255,255,255,0.4)]"
                    : "bg-[#09090b]/80 border-white/20 hover:border-white/50 shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                }`}
                style={{
                  opacity: isHovered ? 1 : baseOpacity,
                  transform: `scale(${baseScale})`,
                }}
              >
                {/* Shiny specular catch-light along top edge */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

                {/* SVG Logo only (greyed out default, vibrant brand color on hover) */}
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  width={26}
                  height={26}
                  className="transition-colors duration-200 shrink-0"
                  style={{
                    fill: isHovered ? item.accentColor : "#a1a1aa",
                  }}
                >
                  <path d={pathData} />
                </svg>

                {/* Subtle micro tooltip on hover */}
                <span className="absolute -bottom-8 px-2 py-0.5 rounded-md bg-black/95 border border-white/20 text-[10px] font-mono text-white tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl z-50">
                  {item.name}
                </span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
