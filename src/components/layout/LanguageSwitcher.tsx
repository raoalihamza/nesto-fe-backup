"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_LABELS, type Locale } from "@/lib/constants/locales";
import { FLAG_COMPONENTS } from "@/components/icons/Flags";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-accent">
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {(() => { const Flag = FLAG_COMPONENTS[loc]; return <Flag className="size-5 rounded-sm" />; })()}
              {LOCALE_LABELS[loc]}
            </span>
            {loc === locale && <Check className="h-4 w-4 text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
