"use client";

import { useTranslations } from "next-intl";

export function Step9PayPublish() {
  const t = useTranslations("listing.publish");

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-100 text-center px-4">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">
        {t("earlyAccessTitle")}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-120 leading-relaxed">
        {t("earlyAccessDescription")}
      </p>
    </div>
  );
}
