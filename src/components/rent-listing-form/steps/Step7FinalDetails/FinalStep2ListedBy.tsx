"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setFinalDetails } from "@/store/slices/listingFormSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ListedBy } from "@/types/property";

export function FinalStep2ListedBy() {
  const t = useTranslations("listing.finalDetails");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

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
          value={finalDetails.listedBy ?? "owner"}
          onValueChange={(val) =>
            dispatch(setFinalDetails({ listedBy: val as ListedBy }))
          }
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="owner" id="listed-owner" />
            <Label
              htmlFor="listed-owner"
              className="cursor-pointer text-sm text-foreground"
            >
              {t("propertyOwner")}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="management" id="listed-management" />
            <Label
              htmlFor="listed-management"
              className="cursor-pointer text-sm text-foreground"
            >
              {t("managementCompany")}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="tenant" id="listed-tenant" />
            <Label
              htmlFor="listed-tenant"
              className="cursor-pointer text-sm text-foreground"
            >
              {t("tenant")}
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          {t("nameLabel")}
          <span className="text-brand">*</span>
        </Label>
        <Input
          value={finalDetails.contactName || "Kurtesan"}
          onChange={(e) =>
            dispatch(setFinalDetails({ contactName: e.target.value }))
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
            value={finalDetails.contactEmail || "hey@kurtesan.com"}
            onChange={(e) =>
              dispatch(setFinalDetails({ contactEmail: e.target.value }))
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
