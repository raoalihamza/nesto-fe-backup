"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setFinalDetails } from "@/store/slices/listingFormSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ListedBy } from "@/types/property";

const LISTED_BY_OPTIONS: ListedBy[] = [
  "property_owner",
  "management_company",
  "tenant",
];

export function FinalStep2ListedBy() {
  const t = useTranslations("listing.finalDetails");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  // Persist default value to Redux on mount so it gets saved to the API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!finalDetails.listedBy) {
      dispatch(setFinalDetails({ listedBy: "property_owner" }));
    }
  }, []);

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("listedByHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("listedBySubtitle")}
        </p>
      </div>

      {/* Listed by radio group */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          {t("listedByLabel")}
          <span className="text-brand">*</span>
        </p>

        <RadioGroup
          value={finalDetails.listedBy ?? "property_owner"}
          onValueChange={(val) =>
            dispatch(setFinalDetails({ listedBy: val as ListedBy }))
          }
          className="space-y-3"
        >
          {LISTED_BY_OPTIONS.map((opt) => (
            <div key={opt} className="flex items-center gap-3">
              <RadioGroupItem value={opt} id={`listed-${opt}`} />
              <Label
                htmlFor={`listed-${opt}`}
                className="cursor-pointer text-sm text-foreground"
              >
                {t(
                  opt === "property_owner"
                    ? "propertyOwner"
                    : opt === "management_company"
                      ? "managementCompany"
                      : "tenant"
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          {t("nameLabel")}
          <span className="text-brand">*</span>
        </Label>
        <Input
          value={finalDetails.name || "Kurtesan"}
          onChange={(e) =>
            dispatch(setFinalDetails({ name: e.target.value }))
          }
          className="h-12 text-base"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          {t("emailLabel")}
          <span className="text-brand">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <Input
            value={finalDetails.email || "hey@kurtesan.com"}
            onChange={(e) =>
              dispatch(setFinalDetails({ email: e.target.value }))
            }
            className="h-12 text-base bg-brand/5 border-brand/30"
            readOnly
          />
          <Button variant="outline" size="sm" className="shrink-0 !h-12 px-6 cursor-pointer">
            {tCommon("edit")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("verifiedOn", { date: "March 6, 2026" })}
        </p>
      </div>
    </div>
  );
}
