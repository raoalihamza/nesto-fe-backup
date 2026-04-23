"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setAmenities } from "@/store/slices/listingFormSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type {
  ParkingOption,
  OutdoorOption,
  AccessibilityOption,
  ApplianceOption,
} from "@/types/property";

const PARKING_OPTIONS: ParkingOption[] = [
  "attached_garage",
  "detached_garage",
  "off_street_parking",
];
const OUTDOOR_OPTIONS: OutdoorOption[] = ["balcony_or_deck", "pool"];
const ACCESSIBILITY_OPTIONS: AccessibilityOption[] = ["disabled_access"];
const APPLIANCE_OPTIONS: ApplianceOption[] = [
  "dishwasher",
  "freezer",
  "microwave",
  "oven",
  "refrigerator",
];

export function AmenitiesStep2() {
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
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        {t("step2Heading")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("step2Subtitle")}</p>

      <div className="mt-8 grid grid-cols-2 gap-x-20 gap-y-8 sm:grid-cols-[repeat(3,auto)] sm:justify-start sm:gap-x-20">
        {/* Parking */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("parking")}
          </h3>
          <div className="mt-3 space-y-3">
            {PARKING_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`parking-${opt}`}
                  checked={amenities.parking.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        parking: toggleArray(amenities.parking, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`parking-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`parkingOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Outdoor amenities */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("outdoorAmenities")}
          </h3>
          <div className="mt-3 space-y-3">
            {OUTDOOR_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`outdoor-${opt}`}
                  checked={amenities.outdoorAmenities.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        outdoorAmenities: toggleArray(amenities.outdoorAmenities, opt),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`outdoor-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`outdoorOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("accessibility")}
          </h3>
          <div className="mt-3 space-y-3">
            {ACCESSIBILITY_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <Checkbox
                  id={`accessibility-${opt}`}
                  checked={amenities.accessibility.includes(opt)}
                  onCheckedChange={() =>
                    dispatch(
                      setAmenities({
                        accessibility: toggleArray(
                          amenities.accessibility,
                          opt,
                        ),
                      }),
                    )
                  }
                />
                <Label
                  htmlFor={`accessibility-${opt}`}
                  className="text-sm font-normal text-foreground"
                >
                  {t(`accessibilityOptions.${opt}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Other amenities — below the grid */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground">
          {t("otherAmenities")}
        </h3>
        <div className="mt-3 space-y-3">
          {APPLIANCE_OPTIONS.map((opt) => (
            <div key={opt} className="flex items-center gap-3">
              <Checkbox
                id={`step2-appliance-${opt}`}
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
                htmlFor={`step2-appliance-${opt}`}
                className="text-sm font-normal text-foreground"
              >
                {t(`applianceOptions.${opt}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
