"use client";

import React from "react";
import PillNav, { PillNavItem } from "@/components/ui/PillNav";

const navItems: PillNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Team", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Join Us", href: "/recruitments" },
];

export default function Navbar() {
  return (
    <PillNav
      logo="/images/logo-transparent.png"
      logoAlt="FOSS Club SRM"
      brandText="FOSS Club SRM"
      items={navItems}
    />
  );
}

