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
  mobileTop?: string;
  mobileLeft?: string;
  depth: number; // 1 (far), 2 (mid), 3 (near)
  floatDelay: number;
  floatDuration: number;
  accentColor: string;
  size: number;
  mobileVisible?: boolean;
}

const LOGO_ITEMS: LogoConfig[] = [
  // ── TOP ZONE (Phone: 8% to 15%) ──
  // 1. Linux Tux (Kernel) — Top Left
  {
    id: "linux",
    name: "Linux",
    category: "Kernel",
    top: "8%",
    left: "6%",
    mobileTop: "8%",
    mobileLeft: "15%",
    depth: 3,
    floatDelay: 0,
    floatDuration: 8.5,
    accentColor: "#facc15",
    size: 24,
    mobileVisible: true,
  },
  // 2. Python (Language) — Top Right
  {
    id: "python",
    name: "Python",
    category: "Language",
    top: "12%",
    left: "86%",
    mobileTop: "8%",
    mobileLeft: "82%",
    depth: 3,
    floatDelay: 0.6,
    floatDuration: 9.0,
    accentColor: "#38bdf8",
    size: 25,
    mobileVisible: true,
  },
  // 3. Docker (Containers) — Sub-Top Left
  {
    id: "docker",
    name: "Docker",
    category: "Containers",
    top: "37%",
    left: "5%",
    mobileTop: "15%",
    mobileLeft: "26%",
    depth: 3,
    floatDelay: 2.2,
    floatDuration: 9.8,
    accentColor: "#2496ed",
    size: 25,
    mobileVisible: true,
  },
  // 4. Git (Version Control) — Sub-Top Right
  {
    id: "git",
    name: "Git",
    category: "Version Control",
    top: "25%",
    left: "82%",
    mobileTop: "15%",
    mobileLeft: "74%",
    depth: 2,
    floatDelay: 1.2,
    floatDuration: 9.5,
    accentColor: "#f05032",
    size: 23,
    mobileVisible: true,
  },

  // ── REVERTED MIDDLE ZONE (Hidden on phone to keep middle clean and uncluttered) ──
  // 5. Rust
  {
    id: "rust",
    name: "Rust",
    category: "Systems Lang",
    top: "22%",
    left: "12%",
    depth: 2,
    floatDelay: 1.8,
    floatDuration: 10.0,
    accentColor: "#f97316",
    size: 23,
    mobileVisible: false,
  },
  // 6. Kubernetes
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Cloud Native",
    top: "16%",
    left: "19%",
    depth: 1,
    floatDelay: 1.6,
    floatDuration: 11.0,
    accentColor: "#326ce5",
    size: 22,
    mobileVisible: false,
  },
  // 7. Ubuntu
  {
    id: "ubuntu",
    name: "Ubuntu",
    category: "Distro",
    top: "40%",
    left: "88%",
    depth: 3,
    floatDelay: 1.0,
    floatDuration: 8.8,
    accentColor: "#e95420",
    size: 24,
    mobileVisible: false,
  },
  // 8. Open Source Initiative (OSI)
  {
    id: "opensourceinitiative",
    name: "OSI",
    category: "FOSS Standard",
    top: "34%",
    left: "90%",
    depth: 2,
    floatDelay: 2.1,
    floatDuration: 8.8,
    accentColor: "#22c55e",
    size: 24,
    mobileVisible: false,
  },
  // 9. Arch Linux
  {
    id: "archlinux",
    name: "Arch Linux",
    category: "Rolling Distro",
    top: "56%",
    left: "85%",
    depth: 2,
    floatDelay: 1.5,
    floatDuration: 10.2,
    accentColor: "#1793d1",
    size: 24,
    mobileVisible: false,
  },
  // 10. Neovim
  {
    id: "neovim",
    name: "Neovim",
    category: "Editor",
    top: "52%",
    left: "11%",
    depth: 2,
    floatDelay: 2.5,
    floatDuration: 10.5,
    accentColor: "#4ade80",
    size: 22,
    mobileVisible: false,
  },
  // 11. Go
  {
    id: "go",
    name: "Go",
    category: "Cloud Systems",
    top: "68%",
    left: "6%",
    depth: 3,
    floatDelay: 2.8,
    floatDuration: 9.4,
    accentColor: "#00add8",
    size: 23,
    mobileVisible: false,
  },
  // 12. Node.js
  {
    id: "nodedotjs",
    name: "Node.js",
    category: "Runtime",
    top: "72%",
    left: "86%",
    depth: 2,
    floatDelay: 0.8,
    floatDuration: 9.6,
    accentColor: "#5fa04e",
    size: 23,
    mobileVisible: false,
  },
  // 13. Redis
  {
    id: "redis",
    name: "Redis",
    category: "Cache Store",
    top: "19%",
    left: "76%",
    depth: 1,
    floatDelay: 2.7,
    floatDuration: 10.2,
    accentColor: "#ef4444",
    size: 22,
    mobileVisible: false,
  },
  // 14. GraphQL
  {
    id: "graphql",
    name: "GraphQL",
    category: "Query Lang",
    top: "63%",
    left: "74%",
    depth: 1,
    floatDelay: 0.9,
    floatDuration: 10.6,
    accentColor: "#e10098",
    size: 21,
    mobileVisible: false,
  },
  // 15. NGINX
  {
    id: "nginx",
    name: "NGINX",
    category: "Reverse Proxy",
    top: "60%",
    left: "17%",
    depth: 1,
    floatDelay: 2.2,
    floatDuration: 11.8,
    accentColor: "#00b846",
    size: 21,
    mobileVisible: false,
  },

  // ── BOTTOM ZONE (Phone: 80% to 89%) ──
  // 16. PostgreSQL (Database) — Bottom Left
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    top: "84%",
    left: "9%",
    mobileTop: "80%",
    mobileLeft: "18%",
    depth: 3,
    floatDelay: 1.4,
    floatDuration: 9.0,
    accentColor: "#4169e1",
    size: 24,
    mobileVisible: true,
  },
  // 17. MySQL — Bottom Right
  {
    id: "mysql",
    name: "MySQL",
    category: "Database",
    top: "32%",
    left: "4%",
    mobileTop: "80%",
    mobileLeft: "80%",
    depth: 2,
    floatDelay: 0.8,
    floatDuration: 10.5,
    accentColor: "#00a3c4",
    size: 24,
    mobileVisible: true,
  },
  // 18. GNU Bash (Shell) — Bottom Mid-Left
  {
    id: "gnubash",
    name: "Bash",
    category: "Shell",
    top: "88%",
    left: "83%",
    mobileTop: "88%",
    mobileLeft: "26%",
    depth: 3,
    floatDelay: 3.0,
    floatDuration: 10.8,
    accentColor: "#4eaa25",
    size: 23,
    mobileVisible: true,
  },
  // 19. Debian — Bottom Mid-Right
  {
    id: "debian",
    name: "Debian",
    category: "Universal OS",
    top: "47%",
    left: "16%",
    mobileTop: "88%",
    mobileLeft: "74%",
    depth: 2,
    floatDelay: 1.5,
    floatDuration: 8.2,
    accentColor: "#d70a53",
    size: 23,
    mobileVisible: true,
  },
  // 20. Firefox
  {
    id: "firefox",
    name: "Firefox",
    category: "Open Web",
    top: "79%",
    left: "79%",
    depth: 2,
    floatDelay: 1.4,
    floatDuration: 10.4,
    accentColor: "#ff7139",
    size: 23,
    mobileVisible: false,
  },
  // 21. Blender
  {
    id: "blender",
    name: "Blender",
    category: "3D Pipeline",
    top: "85%",
    left: "22%",
    depth: 1,
    floatDelay: 2.6,
    floatDuration: 12.2,
    accentColor: "#ea7600",
    size: 21,
    mobileVisible: false,
  },
  // 22. VLC Media Player
  {
    id: "vlcmediaplayer",
    name: "VLC",
    category: "Open Media",
    top: "87%",
    left: "69%",
    depth: 1,
    floatDelay: 0.7,
    floatDuration: 10.9,
    accentColor: "#ff8800",
    size: 21,
    mobileVisible: false,
  },
];

// Wide, organic, zero-gravity 3D floating loops with continuous breathing scale
const DRIFT_PATTERNS = [
  {
    x: [0, 36, -42, 28, -22, 0],
    y: [0, -48, 32, -40, 24, 0],
    rot: [0, 14, -12, 9, -7, 0],
    scale: [1, 1.08, 0.94, 1.05, 0.96, 1],
  },
  {
    x: [0, -40, 30, -36, 25, 0],
    y: [0, 44, -50, 30, -34, 0],
    rot: [0, -13, 11, -9, 8, 0],
    scale: [1, 0.95, 1.07, 0.96, 1.04, 1],
  },
  {
    x: [0, 44, -28, 38, -32, 0],
    y: [0, -36, 46, -28, 36, 0],
    rot: [0, 12, -14, 10, -8, 0],
    scale: [1, 1.06, 0.95, 1.04, 0.97, 1],
  },
  {
    x: [0, -34, 40, -30, 42, 0],
    y: [0, 48, -38, 38, -26, 0],
    rot: [0, -12, 14, -10, 7, 0],
    scale: [1, 0.94, 1.06, 0.97, 1.03, 1],
  },
  {
    x: [0, 38, -44, 32, -26, 0],
    y: [0, -32, 42, -46, 28, 0],
    rot: [0, 15, -10, 12, -9, 0],
    scale: [1, 1.07, 0.96, 1.05, 0.95, 1],
  },
  {
    x: [0, -42, 34, -28, 36, 0],
    y: [0, -38, 44, -34, 24, 0],
    rot: [0, -11, 13, -11, 7, 0],
    scale: [1, 0.96, 1.05, 0.94, 1.06, 1],
  },
  {
    x: [0, 32, -38, 42, -30, 0],
    y: [0, 44, -32, 40, -34, 0],
    rot: [0, 13, -12, 10, -12, 0],
    scale: [1, 1.05, 0.95, 1.06, 0.97, 1],
  },
];

export default function FloatingFOSSLogos() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 55 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const plane1X = useTransform(smoothMouseX, [-1, 1], [-10, 10]);
  const plane1Y = useTransform(smoothMouseY, [-1, 1], [-10, 10]);

  const plane2X = useTransform(smoothMouseX, [-1, 1], [-22, 22]);
  const plane2Y = useTransform(smoothMouseY, [-1, 1], [-22, 22]);

  const plane3X = useTransform(smoothMouseX, [-1, 1], [-38, 38]);
  const plane3Y = useTransform(smoothMouseY, [-1, 1], [-38, 38]);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

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

    // Scroll parallax reaction on both desktop and phone
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = (scrollY / maxScroll) * 2 - 1;
      mouseY.set(progress * 0.85);
    };

    // Device gyroscope reaction for mobile phones
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma != null && e.beta != null) {
        const x = Math.min(Math.max(e.gamma / 25, -1), 1);
        const y = Math.min(Math.max((e.beta - 45) / 25, -1), 1);
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, [mouseX, mouseY]);

  if (!isClient) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-[1]"
      style={{ perspective: "1000px" }}
      aria-hidden="true"
    >
      {LOGO_ITEMS.map((item, idx) => {
        const pathData = (iconsData as Record<string, string>)[item.id];
        if (!pathData) return null;

        const pX = item.depth === 3 ? plane3X : item.depth === 2 ? plane2X : plane1X;
        const pY = item.depth === 3 ? plane3Y : item.depth === 2 ? plane2Y : plane1Y;

        const baseOpacity = isMobile
          ? (item.depth === 3 ? 0.85 : 0.75)
          : (item.depth === 3 ? 0.88 : item.depth === 2 ? 0.76 : 0.65);
        const baseScale = isMobile
          ? (item.depth === 3 ? 0.95 : 0.88)
          : (item.depth === 3 ? 1.05 : item.depth === 2 ? 0.95 : 0.85);

        const isHovered = activeHoverId === item.id;
        const drift = DRIFT_PATTERNS[idx % DRIFT_PATTERNS.length];

        const top = isMobile && item.mobileTop ? item.mobileTop : item.top;
        const left = isMobile && item.mobileLeft ? item.mobileLeft : item.left;
        const isBottomLogo = isMobile && item.mobileTop && parseFloat(item.mobileTop) > 50;

        return (
          <motion.div
            key={item.id}
            style={{
              top,
              left,
              x: pX,
              y: pY,
            }}
            className={`absolute ${
              isMobile ? "-translate-x-1/2 -translate-y-1/2" : ""
            } ${
              item.mobileVisible ? "flex" : "hidden md:flex"
            } items-center justify-center`}
          >
            {/* Dynamic, gentle organic zero-g floating motion tuned for free spaces */}
            <motion.div
              animate={{
                x: isMobile ? drift.x.map((v) => Math.round(v * 0.4)) : drift.x,
                y: isMobile ? drift.y.map((v) => Math.round(v * 0.32)) : drift.y,
                rotateZ: isMobile ? drift.rot.map((v) => Math.round(v * 0.6)) : drift.rot,
                scale: drift.scale,
              }}
              transition={{
                duration: item.floatDuration * (isMobile ? 1.05 : 1.25),
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.floatDelay,
              }}
              whileHover={{
                scale: 1.25,
                rotateZ: 0,
                transition: { duration: 0.18 },
              }}
              whileTap={{
                scale: 1.2,
                rotateZ: 0,
                transition: { duration: 0.15 },
              }}
              onHoverStart={() => {
                setActiveHoverId(item.id);
                try {
                  playClickSound();
                } catch {}
              }}
              onHoverEnd={() => setActiveHoverId(null)}
              onClick={() => {
                setActiveHoverId(item.id);
                try {
                  playClickSound();
                } catch {}
                setTimeout(() => setActiveHoverId((cur) => (cur === item.id ? null : cur)), 1500);
              }}
              className="pointer-events-auto cursor-pointer relative group touch-manipulation"
            >
              {/* Vibrant glass coin badge with ambient brand glow and shiny specular catch-light */}
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border backdrop-blur-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  opacity: isHovered ? 1 : baseOpacity,
                  transform: `scale(${baseScale})`,
                  backgroundColor: isHovered ? "rgba(9, 9, 11, 0.95)" : "rgba(10, 10, 14, 0.85)",
                  borderColor: isHovered ? item.accentColor : "rgba(255, 255, 255, 0.28)",
                  boxShadow: isHovered
                    ? `0 0 28px ${item.accentColor}80, 0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.6)`
                    : `0 8px 24px rgba(0,0,0,0.7), 0 0 16px ${item.accentColor}38, inset 0 1px 0 0 rgba(255,255,255,0.22)`,
                }}
              >
                {/* Ambient brand color halo inside badge */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                  style={{
                    background: isHovered
                      ? `radial-gradient(circle at center, ${item.accentColor}45 0%, ${item.accentColor}10 65%, transparent 80%)`
                      : `radial-gradient(circle at center, ${item.accentColor}28 0%, ${item.accentColor}06 60%, transparent 75%)`,
                  }}
                />

                {/* Shiny specular catch-light along top edge */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                {/* SVG Logo (always vibrant brand color with luminous drop shadow) */}
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  width={26}
                  height={26}
                  className="sm:w-[32px] sm:h-[32px] transition-all duration-300 shrink-0"
                  style={{
                    fill: item.accentColor,
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${item.accentColor}) drop-shadow(0 0 3px #ffffff)`
                      : `drop-shadow(0 0 7px ${item.accentColor}99)`,
                  }}
                >
                  <path d={pathData} />
                </svg>

                {/* Subtle micro tooltip on hover / mobile tap (adaptive placement above or below) */}
                <div
                  className={`absolute ${
                    isBottomLogo ? "-top-8" : "-bottom-8"
                  } px-2.5 py-0.5 rounded-md bg-zinc-950/95 border text-[11px] font-mono tracking-wide whitespace-nowrap pointer-events-none shadow-2xl z-50 transition-all duration-200 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                  style={{
                    borderColor: `${item.accentColor}80`,
                    color: "#f4f4f5",
                    boxShadow: `0 4px 16px rgba(0,0,0,0.9), 0 0 10px ${item.accentColor}40`,
                  }}
                >
                  <span style={{ color: item.accentColor }} className="font-bold mr-1">•</span>
                  {item.name}
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
