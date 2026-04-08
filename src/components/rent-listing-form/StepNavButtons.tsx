"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  goToStep,
  goToSubStep,
  markStepComplete,
} from "@/store/slices/listingFormSlice";
import { clearAllDraftData } from "@/lib/utils/clearDraft";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TOTAL_STEPS = 9;

// Steps that have multiple sub-steps: stepIndex → total sub-steps
const SUB_STEP_COUNTS: Record<number, number> = {
  3: 2, // Amenities
  4: 2, // Screening
  6: 6, // Final details
};

export function StepNavButtons() {
  const t = useTranslations("listing");
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);
  const currentSubStep = useAppSelector((s) => s.listingForm.currentSubStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const totalSubSteps = SUB_STEP_COUNTS[currentStep] ?? 1;

  function handleBack() {
    if (currentSubStep > 0) {
      dispatch(goToSubStep(currentSubStep - 1));
    } else if (!isFirstStep) {
      const prevStep = currentStep - 1;
      const prevSubSteps = SUB_STEP_COUNTS[prevStep] ?? 1;
      dispatch(goToStep(prevStep));
      if (prevSubSteps > 1) {
        dispatch(goToSubStep(prevSubSteps - 1));
      }
    }
  }

  async function handlePublish() {
    // TODO: next prompt will implement publish API call
    toast.info("Publish coming soon");
  }

  function handleNext() {
    if (isLastStep) {
      handlePublish();
      return;
    }

    if (currentSubStep < totalSubSteps - 1) {
      dispatch(goToSubStep(currentSubStep + 1));
    } else {
      dispatch(markStepComplete(currentStep));
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
        {isLastStep ? t("publish.publishListing") : t("next")}
      </Button>
    </div>
  );
}
