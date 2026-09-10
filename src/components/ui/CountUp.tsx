"use client";

import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  separator?: string;
  suffix?: string;
  className?: string;
}

export default function CountUp({
  to,
  from = 0,
  duration = 2,
  separator = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);
  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(to);
    }
  }, [isInView, motionValue, to]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        let val = Math.round(latest).toLocaleString("en-US");
        if (separator) val = val.replace(/,/g, separator);
        ref.current.textContent = val + suffix;
      }
    });
  }, [springValue, separator, suffix]);

  return <span ref={ref} className={className}>{from + suffix}</span>;
}
