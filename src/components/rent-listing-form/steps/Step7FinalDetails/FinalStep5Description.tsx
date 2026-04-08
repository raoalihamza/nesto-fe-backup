"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setFinalDetails } from "@/store/slices/listingFormSlice";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function FinalStep5Description() {
  const t = useTranslations("listing.finalDetails");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("descriptionHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("descriptionSubtitle")}
        </p>
      </div>

      {/* Property description textarea */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {t("descriptionLabel")}
        </Label>
        <Textarea
          value={finalDetails.propertyDescription ?? ""}
          onChange={(e) =>
            dispatch(setFinalDetails({ propertyDescription: e.target.value }))
          }
          className="min-h-[160px] text-base"
        />
      </div>
    </div>
  );
}
