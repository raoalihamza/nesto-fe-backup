"use client";

import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSaveStep } from "@/hooks/rentDraft";
import { useUpdateRentListing } from "@/hooks/rentEdit";
import { useRentStepperUiOptional } from "@/components/rent-listing-form/RentStepperUiContext";

/**
 * Dual-purpose action in the stepper sub-header.
 *
 * - Create (draft) mode: saves the current step and exits to dashboard.
 * - Edit mode: submits a single full PUT and exits to dashboard.
 */
export function SaveExitButton() {
  const t = useTranslations("listing");
  const router = useRouter();
  const stepperUi = useRentStepperUiOptional();
  const isSaving = useAppSelector((s) => s.listingForm.isSaving);
  const mediaUploadBusy =
    useAppSelector((s) => s.listingForm.mediaUploadInFlight) > 0;
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);
  const mode = useAppSelector((s) => s.listingForm.mode);

  const { saveStep } = useSaveStep();
  const { updateAndExit } = useUpdateRentListing();

  const isEditMode = mode === "edit";
  const rentDetailsBlocksSave =
    currentStep === 1 && (stepperUi?.rentDetailsNextBlocked ?? false);

  async function handleClick() {
    if (isEditMode) {
      await updateAndExit();
      return;
    }

    // Draft mode: Review (7) and Pay & Publish (8) don't need save — just navigate
    if (currentStep >= 7) {
      router.push("/dashboard");
      return;
    }

    // Avoid flashing Property Info address fields: save sets draftId in Redux before navigate.
    const onPropertyInfoStep = currentStep === 0;
    if (onPropertyInfoStep) {
      stepperUi?.setSuppressPropertyInfoAddress(true);
    }
    let success = false;
    try {
      success = await saveStep(currentStep);
      if (success) {
        router.push("/dashboard");
        toast.success("Draft saved!");
      }
    } finally {
      if (!success && onPropertyInfoStep) {
        stepperUi?.setSuppressPropertyInfoAddress(false);
      }
    }
  }

  const label = isEditMode
    ? isSaving
      ? t("updating")
      : t("updateAndExit")
    : isSaving
      ? t("saving")
      : mediaUploadBusy
        ? t("uploadingMedia")
        : t("saveAndExit");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isSaving || mediaUploadBusy || rentDetailsBlocksSave}
      className="h-9 rounded-lg px-4 text-sm font-medium"
    >
      {label}
    </Button>
  );
}
