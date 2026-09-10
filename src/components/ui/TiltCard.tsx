"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
  maxTilt?: number;
  scale?: number;
}

export default function TiltCard({
  children,
  className = "",
  glareColor = "rgba(255, 255, 255, 0.04)",
  maxTilt = 8,
  scale = 1.015,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [0, 1], [-maxTilt, maxTilt]);

  const glareX = useTransform(mouseXSpring, [0, 1], [0, 100]);
  const glareY = useTransform(mouseYSpring, [0, 1], [0, 100]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale }}
      className={`relative ${className}`}
    >
      {/* Glare effect */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, ${glareColor}, transparent 60%)`,
        }}
      />
      <div className="relative z-10 h-full" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
