"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setFinalDetails } from "@/store/slices/listingFormSlice";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function FinalStep1LeaseTerms() {
  const t = useTranslations("listing.finalDetails");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("leaseTermsHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("leaseTermsSubtitle")}
        </p>
      </div>

      {/* Lease terms textarea */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {t("leaseTermsLabel")}
        </Label>
        <Textarea
          value={finalDetails.leaseTerms}
          onChange={(e) =>
            dispatch(setFinalDetails({ leaseTerms: e.target.value }))
          }
          className="min-h-[120px] text-base"
        />
      </div>

      {/* Renters insurance radio */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          {t("requireInsuranceQuestion")}
        </p>

        <RadioGroup
          value={finalDetails.requireRentersInsurance ? "yes" : "no"}
          onValueChange={(val) =>
            dispatch(
              setFinalDetails({ requireRentersInsurance: val === "yes" })
            )
          }
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="yes" id="insurance-yes" />
            <Label
              htmlFor="insurance-yes"
              className="cursor-pointer text-sm text-foreground"
            >
              {t("yesRequireInsurance")}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="no" id="insurance-no" />
            <Label
              htmlFor="insurance-no"
              className="cursor-pointer text-sm text-foreground"
            >
              {t("noRequireInsurance")}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
