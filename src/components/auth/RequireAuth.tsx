"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { usePathname, useRouter } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants/routes";
import { getSafeReturnUrl } from "@/lib/auth/safeReturnUrl";

export function RequireAuth({ children }: { children: ReactNode }) {
  const t = useTranslations("auth");
  const sessionStatus = useAppSelector((s) => s.auth.sessionStatus);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus !== "unauthenticated") return;
    const safe = getSafeReturnUrl(pathname);
    if (safe) {
      router.replace(
        `${ROUTES.LOGIN}?${new URLSearchParams({ returnUrl: safe }).toString()}`
      );
    } else {
      router.replace(ROUTES.LOGIN);
    }
  }, [sessionStatus, pathname, router]);

  if (sessionStatus !== "authenticated") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
        <p className="text-sm">{t("sessionChecking")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
