import type { Metadata } from "next";
import { GlassToastProvider } from "@/components/ui/GlassToast";

export const metadata: Metadata = {
  title: "FOSS Club SRM",
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
  return <GlassToastProvider>{children}</GlassToastProvider>;
}
