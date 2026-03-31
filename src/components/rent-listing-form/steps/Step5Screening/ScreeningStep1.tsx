"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setScreening } from "@/store/slices/listingFormSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

export function ScreeningStep1() {
  const t = useTranslations("listing.screening");
  const dispatch = useAppDispatch();
  const screening = useAppSelector((s) => s.listingForm.formData.screening);

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        {t("petPolicyHeading")}
      </h1>

      {/* Are pets allowed? */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">
          {t("arePetsAllowed")}
          <span className="text-brand">*</span>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dispatch(setScreening({ petsAllowed: true }))}
            className={`rounded-full border px-6 py-2 text-sm font-medium transition-colors ${
              screening.petsAllowed === true
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-foreground hover:border-muted-foreground"
            }`}
          >
            {t("yes")}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setScreening({ petsAllowed: false }))}
            className={`rounded-full border px-6 py-2 text-sm font-medium transition-colors ${
              screening.petsAllowed === false
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-foreground hover:border-muted-foreground"
            }`}
          >
            {t("no")}
          </button>
        </div>

        {/* Info alert when No is selected */}
        {screening.petsAllowed === false && (
          <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-foreground">
              {t("petNotRequiredInfo")}
            </p>
          </div>
        )}

        {/* Pet policy negotiable checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="petPolicyNegotiable"
            checked={screening.petPolicyNegotiable}
            onCheckedChange={(checked) =>
              dispatch(setScreening({ petPolicyNegotiable: checked === true }))
            }
          />
          <Label
            htmlFor="petPolicyNegotiable"
            className="text-sm text-foreground cursor-pointer"
          >
            {t("petPolicyNegotiable")}
          </Label>
        </div>
      </div>
    </div>
  );
}
