"use client";

import { useTranslations } from "next-intl";
import { Home, DollarSign, Search } from "lucide-react";
import { Link } from "@/i18n/routing";

const FEATURES = [
  {
    titleKey: "buyHome" as const,
    descKey: "buyHomeDescription" as const,
    ctaKey: "browseHomes" as const,
    href: "/buy",
    icon: Home,
    bgColor: "bg-red-100",
    iconColor: "text-brand",
  },
  {
    titleKey: "sellHome" as const,
    descKey: "sellHomeDescription" as const,
    ctaKey: "seeYourOptions" as const,
    href: "/listings/sale",
    icon: DollarSign,
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    titleKey: "rentHome" as const,
    descKey: "rentHomeDescription" as const,
    ctaKey: "findRentals" as const,
    href: "/#",
    icon: Search,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
];

export function FeatureCardsSection() {
  const t = useTranslations("home");

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-stretch">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.titleKey}
                className="flex min-h-0 min-w-0 flex-col items-center rounded-xl border border-gray-100 bg-white px-4 py-10 text-center shadow-sm sm:px-6"
              >
                <div
                  className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${feature.bgColor}`}
                >
                  <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 w-full max-w-[280px] text-lg font-bold leading-snug text-foreground">
                  {t(feature.titleKey)}
                </h3>
                <p className="mb-6 w-full max-w-[280px] flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(feature.descKey)}
                </p>
                <Link
                  href={feature.href}
                  className="mt-auto shrink-0 rounded-lg border border-brand px-4 py-2 text-center text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white sm:px-5"
                >
                  {t(feature.ctaKey)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
