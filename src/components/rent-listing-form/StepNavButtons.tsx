"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  goToStep,
  goToSubStep,
  markStepComplete,
} from "@/store/slices/listingFormSlice";
import { Button } from "@/components/ui/button";
import { useSaveStep, usePublishDraft } from "@/hooks/rentDraft";

const TOTAL_STEPS = 9;

const SUB_STEP_COUNTS: Record<number, number> = {
  3: 2,
  4: 2,
  6: 6,
};

export function StepNavButtons() {
  const t = useTranslations("listing");
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);
  const currentSubStep = useAppSelector((s) => s.listingForm.currentSubStep);
  const isSaving = useAppSelector((s) => s.listingForm.isSaving);

  const { saveStep } = useSaveStep();
  const { publish } = usePublishDraft();

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

  async function handleNext() {
    if (isLastStep) {
      await publish();
      return;
    }

    // Step 7 (Review) navigates without save — review already loaded on mount
    if (currentStep === 7) {
      dispatch(markStepComplete(7));
      dispatch(goToStep(8));
      return;
    }

    // All other steps: save then navigate
    const success = await saveStep(currentStep);
    if (!success) return;

    if (currentSubStep < totalSubSteps - 1) {
      dispatch(goToSubStep(currentSubStep + 1));
    } else {
      dispatch(markStepComplete(currentStep));
      dispatch(goToStep(currentStep + 1));
      dispatch(goToSubStep(0));
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      {!isFirstStep ? (
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isSaving}
          className="h-10 rounded-lg px-6 text-sm font-medium"
        >
          {t("back")}
        </Button>
      ) : (
        <div />
      )}

      <Button
        onClick={handleNext}
        disabled={isSaving}
        className="h-10 rounded-lg bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark"
      >
        {isSaving
          ? t("saving")
          : isLastStep
            ? t("publish.publishListing")
            : t("next")}
      </Button>
    </div>
  );
}
