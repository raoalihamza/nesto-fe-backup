"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Menu, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { RentListingModal } from "@/components/common/RentListingModal";
import { useAppSelector } from "@/store";
import { ROUTES } from "@/lib/constants/routes";
import { useLogout } from "@/hooks/auth/useLogout";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "buy", href: ROUTES.BUY },
  { key: "rent", href: "/listings/create" },
  { key: "sell", href: "/listings/sale" },
  { key: "getMortgage", href: ROUTES.GET_MORTGAGE },
  { key: "findAgent", href: ROUTES.FIND_AGENT },
] as const;

const RIGHT_LINKS = [
  { key: "manageRentals", href: "/dashboard" },
  { key: "advertise", href: ROUTES.ADVERTISE },
] as const;

function ProfileAccountControl({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();

  if (!isAuthenticated) {
    return (
      <Link href={ROUTES.LOGIN} className={cn("shrink-0", className)}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 outline-none hover:bg-gray-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          className
        )}
        aria-label={t("accountMenu")}
      >
        <User className="h-4 w-4 text-gray-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)} className="cursor-pointer">
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onClick={() => logoutMutate()}
          className="cursor-pointer"
        >
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [rentModalOpen, setRentModalOpen] = useState(false);
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
                  {NAV_LINKS.map((link) =>
                    link.key === "rent" ? (
                      <button
                        key={link.key}
                        onClick={() => {
                          setOpen(false);
                          setRentModalOpen(true);
                        }}
                        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-gray-100"
                      >
                        {t(link.key)}
                      </button>
                    ) : (
                      <Link
                        key={link.key}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gray-100"
                      >
                        {t(link.key)}
                      </Link>
                    )
                  )}
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
            {NAV_LINKS.map((link) =>
              link.key === "rent" ? (
                <button
                  key={link.key}
                  onClick={() => setRentModalOpen(true)}
                  className="shrink-0 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:text-brand xl:px-3"
                >
                  {t(link.key)}
                </button>
              ) : (
                <Link
                  key={link.key}
                  href={link.href}
                  className="shrink-0 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:text-brand xl:px-3"
                >
                  {t(link.key)}
                </Link>
              )
            )}
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
            <ProfileAccountControl className="shrink-0" />
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <LanguageSwitcher />
            <ProfileAccountControl />
          </div>
        </div>
      </div>

      <RentListingModal
        open={rentModalOpen}
        onOpenChange={setRentModalOpen}
      />
    </header>
  );
}
