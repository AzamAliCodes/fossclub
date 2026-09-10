"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import React, { useRef } from "react";

export default function MagneticButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.2);
    y.set(distanceY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={`relative inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
