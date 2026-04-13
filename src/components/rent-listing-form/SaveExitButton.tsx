"use client";

import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSaveStep } from "@/hooks/rentDraft";

export function SaveExitButton() {
  const t = useTranslations("listing");
  const router = useRouter();
  const isSaving = useAppSelector((s) => s.listingForm.isSaving);
  const mediaUploadBusy =
    useAppSelector((s) => s.listingForm.mediaUploadInFlight) > 0;
  const currentStep = useAppSelector((s) => s.listingForm.currentStep);

  const { saveStep } = useSaveStep();

  async function handleSaveAndExit() {
    // Steps 7 (Review) and 8 (Pay & Publish) don't need save — just navigate
    if (currentStep >= 7) {
      router.push("/dashboard");
      return;
    }

    const success = await saveStep(currentStep);
    if (success) {
      router.push("/dashboard");
      toast.success("Draft saved!");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSaveAndExit}
      disabled={isSaving || mediaUploadBusy}
      className="h-9 rounded-lg px-4 text-sm font-medium"
    >
      {isSaving
        ? t("saving")
        : mediaUploadBusy
          ? t("uploadingMedia")
          : t("saveAndExit")}
    </Button>
  );
}
