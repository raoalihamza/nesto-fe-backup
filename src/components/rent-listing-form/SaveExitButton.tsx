"use client";

import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsSaving, setLastSavedAt } from "@/store/slices/listingFormSlice";
import { clearAllDraftData } from "@/lib/utils/clearDraft";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function SaveExitButton() {
  const t = useTranslations("listing");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSaving = useAppSelector((s) => s.listingForm.isSaving);
  const formData = useAppSelector((s) => s.listingForm.formData);

  async function handleSaveAndExit() {
    dispatch(setIsSaving(true));
    try {
      await fetch(`${API_BASE}/api/listings/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      dispatch(setLastSavedAt(new Date().toISOString()));
      clearAllDraftData();
      router.push("/dashboard");
    } catch {
      // TODO: show error toast
    } finally {
      dispatch(setIsSaving(false));
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSaveAndExit}
      disabled={isSaving}
      className="h-9 rounded-lg px-4 text-sm font-medium"
    >
      {isSaving ? t("saving") : t("saveAndExit")}
    </Button>
  );
}
