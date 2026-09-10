"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { playClickSound } from "@/lib/sound";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const socialLinks = [
  {
    icon: InstagramIcon,
    href: "https://www.instagram.com/fossclubsrm",
    label: "Instagram",
    hoverStyle: "hover:text-[#c084fc] hover:border-[#c084fc]/60 hover:shadow-[0_0_24px_rgba(192,132,252,0.45)] hover:bg-[#c084fc]/10",
  },
  {
    icon: LinkedinIcon,
    href: "https://linkedin.com/company/foss-club-srm",
    label: "LinkedIn",
    hoverStyle: "hover:text-[#38bdf8] hover:border-[#38bdf8]/60 hover:shadow-[0_0_24px_rgba(56,189,248,0.45)] hover:bg-[#38bdf8]/10",
  },
  {
    icon: GithubIcon,
    href: "https://github.com/fossclubsrm",
    label: "GitHub",
    hoverStyle: "hover:text-white hover:border-white/60 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:bg-white/10",
  },
  {
    icon: Mail,
    href: "mailto:fossclubsrmktr@gmail.com",
    label: "Email",
    hoverStyle: "hover:text-[#22c55e] hover:border-[#22c55e]/60 hover:shadow-[0_0_24px_rgba(34,197,94,0.45)] hover:bg-[#22c55e]/10",
  },
];

export default function Footer({ forceShow }: { forceShow?: boolean }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/cms")) return null;

  return (
    <footer className="w-full border-t border-white/10 bg-black/90 backdrop-blur-xl mt-auto relative z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => { try { playClickSound(); } catch {} }}
              className="flex items-center gap-3 group w-fit"
            >
              <div className="relative flex items-center justify-center">
                <Image
                  src="/images/logo-transparent.png"
                  alt="FOSS Club SRM"
                  width={28}
                  height={28}
                  className="object-contain foss-png-shiny-border group-hover:scale-110"
                />
              </div>
              <span className="text-[#fafafa] font-semibold text-base group-hover:text-[#22c55e] transition-colors font-mono">
                FOSS Club SRM
              </span>
            </Link>
            <p className="text-[#a1a1aa] text-xs max-w-[320px] leading-relaxed">
              Official student club affiliated with FOSS United at SRMIST, Kattankulathur. Empowering students to build and contribute to free &amp; open-source software.
            </p>
          </div>

          {/* Nav & Connect Columns */}
          <div className="flex flex-wrap items-start gap-8 sm:gap-14 text-sm font-mono w-full sm:w-auto">
            {/* Explore Column */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[#71717a] text-[10px] tracking-[0.2em] uppercase font-mono mb-1">Explore</p>
              <Link
                href="/team"
                onClick={() => { try { playClickSound(); } catch {} }}
                className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                Team
              </Link>
              <Link
                href="/events"
                onClick={() => { try { playClickSound(); } catch {} }}
                className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                Events
              </Link>
              <Link
                href="/recruitments"
                onClick={() => { try { playClickSound(); } catch {} }}
                className="text-[#a1a1aa] hover:text-[#22c55e] transition-colors"
              >
                Join Us
              </Link>
            </div>

            {/* Connect Column */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[#71717a] text-[10px] tracking-[0.2em] uppercase font-mono mb-1">Connect</p>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      onClick={() => { try { playClickSound(); } catch {} }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-white/15 bg-white/[0.05] flex items-center justify-center text-[#d4d4d8] transition-all duration-200 backdrop-blur-md shadow-md active:scale-95 ${s.hoverStyle}`}
                      title={s.label}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
