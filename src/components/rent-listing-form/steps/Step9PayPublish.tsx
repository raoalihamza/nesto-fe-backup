"use client";

import { useTranslations } from "next-intl";
import { usePublishDraft } from "@/hooks/rentDraft";
import { useUpdateRentListing } from "@/hooks/rentEdit";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";

export function Step9PayPublish() {
  const t = useTranslations("listing.publish");
  const tRoot = useTranslations("listing");
  const { publish } = usePublishDraft();
  const { updateAndExit } = useUpdateRentListing();
  const isSaving = useAppSelector((s) => s.listingForm.isSaving);
  const mode = useAppSelector((s) => s.listingForm.mode);

  const isEditMode = mode === "edit";

  const label = isEditMode
    ? isSaving
      ? tRoot("updating")
      : tRoot("updateAndPublish")
    : isSaving
      ? t("publishing")
      : t("publishListing");

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-100 text-center px-4">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">
        {t("earlyAccessTitle")}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-120 leading-relaxed">
        {t("earlyAccessDescription")}
      </p>
      <Button
        onClick={isEditMode ? updateAndExit : publish}
        disabled={isSaving}
        className="mt-8 h-12 rounded-lg bg-brand px-8 text-base font-medium text-white btn-brand-shadow hover:bg-brand-dark"
      >
        {label}
      </Button>
    </div>
  );
}
