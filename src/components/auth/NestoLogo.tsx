"use client";

import { Link } from "@/i18n/routing";

export function NestoLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
        <span className="text-lg font-bold text-white">N</span>
      </div>
      <span className={`font-bold text-brand ${sizeClasses[size]}`}>Nesto</span>
    </Link>
  );
}
