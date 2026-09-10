"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// @ts-ignore
import { gsap } from "gsap";
import { playClickSound } from "@/lib/sound";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  brandText?: string;
  items: PillNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

export default function PillNav({
  logo = "/images/logo-transparent.png",
  logoAlt = "FOSS Club SRM",
  brandText = "FOSS Club SRM",
  items,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#000000",
  pillColor = "#0c0c0e",
  hoveredPillTextColor = "#22c55e",
  pillTextColor = "#fafafa",
  onMobileMenuClick,
  initialLoadAnimation = true,
}: PillNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<any>>([]);
  const activeTweenRefs = useRef<Array<any>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<any>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, i) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const hoverLabel = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 10, opacity: 0 });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });

        // Expand bubble from bottom
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);

        // Slide default label upward
        if (label) {
          tl.to(label, { y: -(h + 6), duration: 2, ease, overwrite: "auto" }, 0);
        }

        // Slide green hover label in from below
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[i] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 0.95, y: -10 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0.8, opacity: 0 });
        gsap.to(logo, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        });
      }

      if (navItems) {
        gsap.set(navItems, { opacity: 0, y: -10 });
        gsap.to(navItems, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease,
          delay: 0.1,
        });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    if (pathname === items[i]?.href) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.28,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.22,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.25, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.25, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.25, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.25, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: -10, scaleY: 0.95 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.25,
            ease,
            transformOrigin: "top center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          scaleY: 0.95,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  // Spin FOSS logo on route transitions through navbar
  const isInitialPathname = useRef(true);
  useEffect(() => {
    if (isInitialPathname.current) {
      isInitialPathname.current = false;
      return;
    }
    handleLogoEnter();
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        toggleMobileMenu();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={`fixed top-3 sm:top-4 left-0 right-0 z-[100] flex justify-center px-3 sm:px-4 pointer-events-none ${className}`}>
      <nav
        className="pointer-events-auto flex items-center justify-between gap-3 box-border w-full max-w-5xl md:w-auto md:max-w-none"
        aria-label="Primary"
      >
        {/* Logo Brand Pill */}
        <Link
          href="/"
          ref={logoRef}
          onMouseEnter={handleLogoEnter}
          onClick={() => {
            try { playClickSound(); } catch {}
          }}
          className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.32)] hover:border-white/40 hover:bg-white/[0.12] transition-all duration-300"
          style={{ height: "46px" }}
        >
          {/* Specular Catch-light */}
          <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* FOSS Club SRM Logo with Optimized Contour-Tracing Border */}
          <div className="relative flex items-center justify-center shrink-0">
            <Image
              src={logo}
              alt={logoAlt}
              width={26}
              height={26}
              ref={logoImgRef}
              className="object-contain foss-png-shiny-border"
            />
          </div>

          <span className="font-mono font-bold text-xs sm:text-sm text-white tracking-wider group-hover:text-[#22c55e] transition-colors whitespace-nowrap">
            {brandText}
          </span>
        </Link>

        {/* Desktop Nav Items Pill Container */}
        <div
          ref={navItemsRef}
          className="relative hidden md:flex items-center rounded-full p-[4px] border border-white/20 bg-white/[0.07] backdrop-blur-2xl shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.28)]"
          style={{ height: "46px" }}
        >
          {/* Specular Catch-light */}
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <ul role="menubar" className="list-none flex items-stretch m-0 p-0 h-full gap-1">
            {items.map((item, i) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href} role="none" className="flex h-full">
                  <Link
                    role="menuitem"
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      handleLeave(i);
                      handleLogoEnter();
                      try { playClickSound(); } catch {}
                    }}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    aria-label={item.ariaLabel || item.label}
                    className={`relative overflow-hidden inline-flex items-center justify-center h-full rounded-full px-4 text-xs font-mono font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer select-none ${
                      isActive
                        ? "bg-[#0c2317]/90 border border-[#22c55e]/50 text-[#22c55e] shadow-[0_0_16px_rgba(34,197,94,0.25),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                        : "bg-white/[0.04] hover:bg-white/[0.10] text-zinc-300 hover:text-white border border-transparent"
                    }`}
                  >
                    {/* Expanding Hover Circle Bubble */}
                    <span
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none bg-white/[0.14] border border-white/20"
                      aria-hidden="true"
                    />

                    {/* Dual Rolling Label Stack (active renders clean single label with zero overlap) */}
                    {isActive ? (
                      <span className="relative z-[2] inline-block leading-none text-[#22c55e] font-semibold whitespace-nowrap">
                        {item.label}
                      </span>
                    ) : (
                      <span className="label-stack relative inline-flex items-center justify-center overflow-hidden leading-none z-[2] whitespace-nowrap">
                        {/* Default Label (rolls up) */}
                        <span className="pill-label relative z-[2] inline-block leading-none text-zinc-300 font-semibold whitespace-nowrap">
                          {item.label}
                        </span>

                        {/* Hover Label (rolls in from bottom) */}
                        <span
                          className="pill-label-hover absolute left-0 top-0 z-[3] inline-block font-semibold text-[#22c55e] opacity-0 pointer-events-none whitespace-nowrap"
                          aria-hidden="true"
                        >
                          {item.label}
                        </span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Hamburger Pill Button */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer p-0 relative hover:border-white/40 hover:bg-white/[0.12] transition-all"
          style={{ width: "46px", height: "46px" }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded-full bg-white transition-all duration-200"
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded-full bg-white transition-all duration-200"
          />
        </button>
      </nav>

      {/* Mobile Menu Dropdown Pill Capsule */}
      <div
        ref={mobileMenuRef}
        style={{ visibility: "hidden" }}
        className="md:hidden pointer-events-auto absolute top-16 left-3 right-3 sm:left-4 sm:right-4 rounded-3xl border border-white/20 bg-black/95 backdrop-blur-3xl shadow-[0_20px_45px_rgba(0,0,0,0.9),inset_0_1px_1px_0_rgba(255,255,255,0.25)] p-2.5 sm:p-3 z-[99]"
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-1.5 font-mono">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    toggleMobileMenu();
                    handleLogoEnter();
                    try { playClickSound(); } catch {}
                  }}
                  className={`block py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#0c2317] border border-[#14532d] text-[#22c55e]"
                      : "bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
