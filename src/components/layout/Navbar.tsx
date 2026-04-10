"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Menu, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAppSelector } from "@/store";

const NAV_LINKS = [
  { key: "buy", href: "/buy" },
  { key: "rent", href: "/listings/create" },
  { key: "sell", href: "/listings/sale" },
  { key: "getMortgage", href: "#" },
  { key: "findAgent", href: "#" },
] as const;

const RIGHT_LINKS = [
  { key: "manageRentals", href: "/dashboard" },
  { key: "advertise", href: "#" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      {/* Grid keeps the logo centered; flex + justify-between shifts it when L/R widths differ (long translations). */}
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-x-2 px-4 lg:h-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-4">
        {/* Left: sheet (mobile) + primary nav (desktop) */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mb-6 flex items-center gap-2">
                  <Image
                    src={"/icons/nesto-logo-navbar.svg"}
                    alt="Nesto Logo"
                    width={100}
                    height={30}
                  />
                </div>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gray-100"
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-gray-200" />
                  {RIGHT_LINKS.filter((link) => link.key !== "manageRentals" || isAuthenticated).map((link) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gray-100"
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <nav className="hidden min-w-0 flex-wrap items-center gap-x-1 gap-y-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="shrink-0 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:text-brand xl:px-3"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: logo (true viewport center on lg via equal 1fr side columns) */}
        <Link href="/" className="flex shrink-0 justify-self-center">
          <Image
            src={"/icons/nesto-logo-navbar.svg"}
            alt="Nesto Logo"
            width={110}
            height={30}
          />
        </Link>

        {/* Right: secondary links + locale + profile */}
        <div className="flex min-w-0 items-center justify-end gap-x-1">
          <div className="hidden flex-wrap items-center justify-end gap-x-1 gap-y-1 lg:flex">
            {RIGHT_LINKS.filter((link) => link.key !== "manageRentals" || isAuthenticated).map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="shrink-0 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:text-brand xl:px-3"
              >
                {t(link.key)}
              </Link>
            ))}
            <LanguageSwitcher />
            <Link href={isAuthenticated ? "/profile" : "/login"} className="shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <LanguageSwitcher />
            <Link href={isAuthenticated ? "/profile" : "/login"}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
