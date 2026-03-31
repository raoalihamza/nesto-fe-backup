"use client";

import { useAppSelector } from "@/store";
import { AmenitiesStep1 } from "./AmenitiesStep1";
import { AmenitiesStep2 } from "./AmenitiesStep2";

export function Step4Amenities() {
  const currentSubStep = useAppSelector((s) => s.listingForm.currentSubStep);

  if (currentSubStep === 1) {
    return <AmenitiesStep2 />;
  }
  return <AmenitiesStep1 />;
}
