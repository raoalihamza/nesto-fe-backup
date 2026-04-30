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
import { useUpdateRentListing } from "@/hooks/rentEdit";
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
  const mode = useAppSelector((s) => s.listingForm.mode);
  const mediaUploadInFlight = useAppSelector(
    (s) => s.listingForm.mediaUploadInFlight
  );
  const addressLookupBusy = useAppSelector(
    (s) => s.listingForm.addressLookupBusy
  );
  const draftProgress = useAppSelector((s) => s.listingForm.draftProgress);
  const mediaUploadBusy = mediaUploadInFlight > 0;

  const { saveStep } = useSaveStep();
  const { publish } = usePublishDraft();
  const { updateAndExit } = useUpdateRentListing();
  const isEditMode = mode === "edit";
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const totalSubSteps = SUB_STEP_COUNTS[currentStep] ?? 1;
  // Review (step 7): block Pay & publish until server marks listing ready (same as Step8Review banner).
  const reviewBlocksNext =
    currentStep === 7 && draftProgress?.publishReady !== true;
  const nextDisabled =
    isSaving ||
    mediaUploadBusy ||
    (isFirstStep && !isEditMode && addressLookupBusy) ||
    reviewBlocksNext;

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
    // Last step behavior
    if (isLastStep) {
      if (isEditMode) {
        await updateAndExit();
      } else {
        await publish();
      }
      return;
    }

    // Edit mode: Back/Next are local-only, no per-step API calls.
    if (isEditMode) {
      if (currentSubStep < totalSubSteps - 1) {
        dispatch(goToSubStep(currentSubStep + 1));
      } else {
        dispatch(markStepComplete(currentStep));
        dispatch(goToStep(currentStep + 1));
        dispatch(goToSubStep(0));
      }
      return;
    }

    // Create (draft) mode: Review step navigates without save (already loaded)
    if (currentStep === 7) {
      dispatch(markStepComplete(7));
      dispatch(goToStep(8));
      return;
    }

    // Create (draft) mode: save then navigate
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

  function lastStepLabel() {
    if (isEditMode) {
      return isSaving ? t("updating") : t("updateAndPublish");
    }
    return isSaving ? t("publish.publishing") : t("publish.publishListing");
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      {!isFirstStep ? (
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isSaving || mediaUploadBusy}
          className="h-10 rounded-lg px-6 text-sm font-medium"
        >
          {t("back")}
        </Button>
      ) : (
        <div />
      )}

      <Button
        onClick={handleNext}
        disabled={nextDisabled}
        title={
          isFirstStep &&
          addressLookupBusy &&
          !isEditMode &&
          !isSaving &&
          !mediaUploadBusy
            ? t("addressSearchBusy")
            : mediaUploadBusy && !isSaving
              ? t("uploadingMedia")
              : reviewBlocksNext && !isSaving && !mediaUploadBusy
                ? t("review.publishNotReadyGeneric")
                : undefined
        }
        className="h-10 rounded-lg bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark"
      >
        {isSaving
          ? isEditMode
            ? t("updating")
            : t("saving")
          : mediaUploadBusy
            ? t("uploadingMedia")
            : isLastStep
              ? lastStepLabel()
              : t("next")}
      </Button>
    </div>
  );
}
