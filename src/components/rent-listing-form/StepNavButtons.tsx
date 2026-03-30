"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { goToStep, markStepComplete } from "@/store/slices/listingFormSlice";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 9;

export function StepNavButtons() {
  const t = useTranslations("listing");
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  function handleBack() {
    if (!isFirstStep) {
      dispatch(goToStep(currentStep - 1));
    }
  }

  function handleNext() {
    dispatch(markStepComplete(currentStep));
    if (!isLastStep) {
      dispatch(goToStep(currentStep + 1));
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      {!isFirstStep ? (
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-10 rounded-lg px-6 text-sm font-medium"
        >
          {t("back")}
        </Button>
      ) : (
        <div />
      )}

      <Button
        onClick={handleNext}
        className="h-10 rounded-lg bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark"
      >
        {isLastStep ? t("rentDetails.publish") : t("next")}
      </Button>
    </div>
  );
}
