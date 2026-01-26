// components/public-header-gate.tsx
"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export default function PublicHeaderGate() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  return <SiteHeader />;
}
