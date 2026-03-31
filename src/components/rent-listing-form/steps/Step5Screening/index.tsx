"use client";

import { useAppSelector } from "@/store";
import { ScreeningStep1 } from "./ScreeningStep1";
import { ScreeningStep2 } from "./ScreeningStep2";

export function Step5Screening() {
  const currentSubStep = useAppSelector((s) => s.listingForm.currentSubStep);

  if (currentSubStep === 1) {
    return <ScreeningStep2 />;
  }
  return <ScreeningStep1 />;
}
