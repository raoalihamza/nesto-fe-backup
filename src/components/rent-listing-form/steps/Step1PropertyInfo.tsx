"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setPropertyInfo } from "@/store/slices/listingFormSlice";
import { RentAddressAndListingEntryFields } from "@/components/rent-listing-form/shared/RentAddressAndListingEntryFields";
import { useRentStepperUiOptional } from "@/components/rent-listing-form/RentStepperUiContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8+"];
const BATHROOM_OPTIONS = ["0", "1", "1.5", "2", "2.5", "3", "3.5", "4+"];
const HALF_BATHROOM_OPTIONS = ["0", "1", "2", "3", "4+"];

export function Step1PropertyInfo() {
  const t = useTranslations("listing.propertyInfo");
  const dispatch = useAppDispatch();
  const stepperUi = useRentStepperUiOptional();
  const draftId = useAppSelector((s) => s.listingForm.draftId);
  const data = useAppSelector((s) => s.listingForm.formData.propertyInfo);
  const showAddressEditor =
    draftId !== null && !stepperUi?.suppressPropertyInfoAddress;

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {t("heading")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8 space-y-6">
        {showAddressEditor && (
          <RentAddressAndListingEntryFields variant="step" enabled />
        )}

        {/* Property size */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("squareFootage")}
          </label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              value={data.squareFootage ?? ""}
              onChange={(e) =>
                dispatch(
                  setPropertyInfo({
                    squareFootage: e.target.value ? Number(e.target.value) : null,
                  })
                )
              }
              className="h-12 pr-16 text-base"
              placeholder=""
            />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
              {t("sqFt")}
            </span>
          </div>
        </div>

        {/* Total bedrooms */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("bedrooms")}
          </label>
          <Select
            value={data.totalBedrooms ?? ""}
            onValueChange={(val) =>
              dispatch(setPropertyInfo({ totalBedrooms: val }))
            }
          >
            <SelectTrigger className="h-12! w-full text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BEDROOM_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total bathrooms + Half bathrooms */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("bathrooms")}
            </label>
            <Select
              value={data.totalBathrooms ?? ""}
              onValueChange={(val) =>
                dispatch(setPropertyInfo({ totalBathrooms: val }))
              }
            >
              <SelectTrigger className="h-12! w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATHROOM_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("halfBathrooms")}
            </label>
            <Select
              value={data.totalHalfBathrooms ?? ""}
              onValueChange={(val) =>
                dispatch(setPropertyInfo({ totalHalfBathrooms: val }))
              }
            >
              <SelectTrigger className="h-12! w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HALF_BATHROOM_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
