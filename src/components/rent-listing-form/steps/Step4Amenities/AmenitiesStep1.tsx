"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setAmenities } from "@/store/slices/listingFormSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type {
  LaundryOption,
  CoolingOption,
  HeatingOption,
  ApplianceOption,
  FlooringOption,
  OtherAmenityOption,
} from "@/types/property";

const LAUNDRY_OPTIONS: LaundryOption[] = [
  "washer_dryer_included",
  "washer_dryer_hookups",
  "shared_or_in_building",
  "no_laundry",
];

const COOLING_OPTIONS: CoolingOption[] = ["central", "wall", "window"];
const HEATING_OPTIONS: HeatingOption[] = [
  "baseboard",
  "forced_air",
  "heat_pump",
  "wall",
];
const APPLIANCE_OPTIONS: ApplianceOption[] = [
  "dishwasher",
  "freezer",
  "microwave",
  "oven",
  "refrigerator",
];
const FLOORING_OPTIONS: FlooringOption[] = ["carpet", "hardwood", "tile"];
const OTHER_OPTIONS: OtherAmenityOption[] = ["furnished"];

export function AmenitiesStep1() {
  const t = useTranslations("listing.amenities");
  const dispatch = useAppDispatch();
  const amenities = useAppSelector((s) => s.listingForm.formData.amenities);

  function toggleArray<T>(arr: T[], value: T): T[] {
    return arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
  }

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-2xl font-bold text-foreground">
        {t("step1Heading")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("step1Subtitle")}</p>

      <div className="mt-8 grid grid-cols-2 gap-x-20 gap-y-8 sm:grid-cols-[repeat(3,auto)] sm:justify-start sm:gap-x-20">
        {/* Laundry — radio group */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("laundry")}
            <span className="text-brand">*</span>
          </h3>
          <RadioGroup
            value={amenities.laundry ?? undefined}
            onValueChange={(val: string) =>
              dispatch(setAmenities({ laundry: val as LaundryOption }))
            }
            className="mt-3 space-y-3"
          >
            {LAUNDRY_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <RadioGroupItem value={opt} id={`laundry-${opt}`} />
                <Label
                  htmlFor={`laundry-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`laundryOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Cooling */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("cooling")}
          </h3>
          <div className="mt-3 space-y-3">
            {COOLING_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`cooling-${opt}`}
                  checked={amenities.cooling.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        cooling: toggleArray(amenities.cooling, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`cooling-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`coolingOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Heating */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("heating")}
          </h3>
          <div className="mt-3 space-y-3">
            {HEATING_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`heating-${opt}`}
                  checked={amenities.heating.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        heating: toggleArray(amenities.heating, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`heating-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`heatingOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      
        {/* Appliances */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("appliances")}
          </h3>
          <div className="mt-3 space-y-3">
            {APPLIANCE_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`appliance-${opt}`}
                  checked={amenities.appliances.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        appliances: toggleArray(amenities.appliances, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`appliance-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`applianceOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Flooring */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("flooring")}
          </h3>
          <div className="mt-3 space-y-3">
            {FLOORING_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`flooring-${opt}`}
                  checked={amenities.flooring.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        flooring: toggleArray(amenities.flooring, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`flooring-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`flooringOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Other amenities */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("otherAmenities")}
          </h3>
          <div className="mt-3 space-y-3">
            {OTHER_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`other-${opt}`}
                  checked={amenities.other.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        other: toggleArray(amenities.other, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`other-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`otherOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
