"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface CursorGlowProps {
  color?: string;
  secondaryColor?: string;
  size?: number;
  blur?: number;
  opacity?: number;
}

export default function CursorGlow({
  color = "rgba(34, 197, 94, 0.10)", // Emerald aura
  secondaryColor = "rgba(56, 189, 248, 0.06)", // Sky accent
  size = 500,
  blur = 60,
  opacity = 1,
}: CursorGlowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const isTouchDevice = useRef(false);

  // Smooth spring physics for fluid cursor lag
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 28, stiffness: 220, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check for touch-only devices to avoid unneeded GPU overhead
    if (typeof window !== "undefined") {
      isTouchDevice.current =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
    }

    if (isTouchDevice.current) return;

    const isVisibleRef = { current: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      // Expose mouse coordinates to CSS custom properties for ambient lighting
      document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`);
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-700 ease-out"
      style={{
        opacity: isVisible ? opacity : 0,
      }}
    >
      {/* Primary Ambient Cursor Spotlight (100% GPU-accelerated gradient without costly blur filters) */}
      <motion.div
        className="absolute rounded-full will-change-transform"
        style={{
          x: smoothX,
          y: smoothY,
          width: size,
          height: size,
          translateX: "-50%",
          translateY: "-50%",
          background: `radial-gradient(circle at center, ${color} 0%, rgba(34, 197, 94, 0.05) 30%, ${secondaryColor} 50%, transparent 70%)`,
          transform: isClicking ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.15s ease-out",
        }}
      />

      {/* Subtle Inner Specular Catch-light Core */}
      <motion.div
        className="absolute rounded-full will-change-transform opacity-70"
        style={{
          x: smoothX,
          y: smoothY,
          width: size * 0.28,
          height: size * 0.28,
          translateX: "-50%",
          translateY: "-50%",
          background: `radial-gradient(circle at center, rgba(34, 197, 94, 0.20) 0%, rgba(255, 255, 255, 0.06) 35%, transparent 70%)`,
          transform: isClicking ? "scale(1.25)" : "scale(1)",
          transition: "transform 0.15s ease-out",
        }}
      />
    </div>
  );
}
