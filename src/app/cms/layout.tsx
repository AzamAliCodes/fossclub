import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS Dashboard",
  description: "FOSS Club SRM Content Management Portal",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
