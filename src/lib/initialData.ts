import { TeamMember, ClubEvent, RecruitmentConfig, DomainType } from "@/types";

export const initialTeamMembers: TeamMember[] = [];

export const initialEvents: ClubEvent[] = [];

export interface RecruitmentDomainInfo {
  domain: DomainType;
  roles: string[];
  perks: string[];
  description: string;
}

export interface RecruitmentFaqInfo {
  question: string;
  answer: string;
}

export const RECRUITMENT_DOMAINS: RecruitmentDomainInfo[] = [
  {
    domain: "Technical",
    roles: ["Full-Stack Web/App", "Cyber Security", "AI/ML", "DevOps & Cloud"],
    perks: [
      "Commit access to club repos and upstream projects",
      "Mentorship from GSoC scholars and core maintainers",
      "Dedicated cloud infrastructure for hosting student projects",
      "Direct access to FOSS United grants and project bounties",
    ],
    description: "You'll build open-source utilities, maintain club infra, mentor junior developers, and drive code sprints.",
  },
  {
    domain: "Corporate",
    roles: ["Sponsorship & Partnerships", "Event Operations", "PR & Outreach", "Finance & Logistics"],
    perks: [
      "Network directly with founders, CTOs, and tech recruiters",
      "Manage five-figure budgets and large-scale hackathons",
      "Official FOSS United chapter coordination credential",
      "Public speaking and stage management opportunities",
    ],
    description: "You'll represent FOSS Club SRM to tech companies, manage sponsors, organize flagship hackathons, and spearhead outreach.",
  },
  {
    domain: "Creative",
    roles: ["UI/UX Design", "VFX", "GFX", "Video Editing", "Graphic Design"],
    perks: [
      "Design production-grade interfaces seen by thousands",
      "Build a high-impact design portfolio with real launched products",
      "Open source design credits and showcase on FOSS channels",
      "Access to collaborative licenses and creative tools",
    ],
    description: "You'll craft our visual soul—from hacker-chic cyberpunk design systems to event trailers, sticker packs, and web aesthetics.",
  },
];

export const RECRUITMENT_FAQS: RecruitmentFaqInfo[] = [
  {
    question: "Who is eligible to apply for FOSS Club SRM?",
    answer: "All students enrolled at SRMIST (1st and 2nd years only, from any branch or campus) with a passion for free and open source software are welcome to apply. No prior club experience is required!",
  },
  {
    question: "Do I need to be an expert programmer to join the Technical domain?",
    answer: "Not at all! We look for curiosity, grit, problem-solving mindset, and eagerness to learn. If you're willing to tinker with Linux, build projects, and read documentation, you belong here.",
  },
  {
    question: "What is the recruitment selection process?",
    answer: "The process has 3 phases: 1) Online Application with your background and interests, 2) Domain Task / Mini-Project (designed to be fun and educational), and 3) An informal in-person or online interview conversation.",
  },
  {
    question: "What is the relation between FOSS Club SRM and FOSS United?",
    answer: "FOSS United is a registered non-profit organization dedicated to promoting free and open-source software in India, founded by Kailash Nadh (CTO, Zerodha) and Rushabh Mehta (Founder, Frappe).",
  },
  {
    question: "Can I apply for multiple domains?",
    answer: "Yes, you can mention your primary domain and secondary interest on the application form. We frequently have members who cross-collaborate between Technical and Creative or Corporate.",
  },
];

export const initialRecruitmentConfig: RecruitmentConfig = {
  _id: "recruitment_config",
  enabled: true,
  subtitle: "Join the premier open source initiative at SRMIST. Build real public software, organize India's top hackathons, and become part of the FOSS United network.",
  posterUrl: "",
  applyUrl: "https://fossunited.org/c/srm-ktr",
};

