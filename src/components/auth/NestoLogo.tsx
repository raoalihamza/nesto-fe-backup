"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";

export function NestoLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const widths = { sm: 120, md: 150, lg: 180 };

  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/icons/nesto-logo-navbar.svg"
        alt="Nesto"
        width={widths[size]}
        height={50}
        priority
      />
    </Link>
  );
}
