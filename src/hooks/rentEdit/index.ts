import { useAppDispatch, useAppSelector } from "@/store";
import {
  goToStep,
  restoreFromDraft,
  setIsSaving,
  setListingFormMode,
  resetListingForm,
} from "@/store/slices/listingFormSlice";
import { rentListingEditService } from "@/lib/api/rentListingEdit.service";
import { buildRentEditUpdateBody } from "@/lib/rentListing/buildRentEditPayload";
import { clearAllDraftData } from "@/lib/utils/clearDraft";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

/**
 * Fetches GET /v1/listings/rent/:listingId/edit and hydrates Redux for the
 * published rent edit flow. The GET response shares the same shape as the
 * draft detail response, so we reuse `restoreFromDraft` for hydration and
 * set `mode === "edit"` separately.
 */
export function useRestoreEditListing() {
  const dispatch = useAppDispatch();

  async function restoreEditListing(listingId: string): Promise<boolean> {
    try {
      const response =
        await rentListingEditService.getListingForEdit(listingId);
      dispatch(restoreFromDraft(response));
      dispatch(setListingFormMode("edit"));
      dispatch(goToStep(0));
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load listing for editing.";
      toast.error(message);
      return false;
    }
  }

  return { restoreEditListing };
}

/**
 * Submits the full PUT /v1/listings/rent/:listingId body and navigates to the
 * dashboard on success.
 *
 * Policy (see RENT_LISTING_EDIT_FRONTEND_GUIDE.md):
 * - Full body every time (not a partial patch).
 * - Required-field validation is backend-owned; any
 *   `RENT_LISTING_EDIT_VALIDATION_FAILED` / `REQUEST_VALIDATION_FAILED`
 *   response is surfaced to the user via toast (same pattern as draft saves).
 * - `finalDetails.phoneNumber` is never sent here.
 * - Photos are managed via the listing-scoped media endpoints.
 */
export function useUpdateRentListing() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { draftId, formData, mode } = useAppSelector((s) => s.listingForm);

  async function updateAndExit(): Promise<boolean> {
    if (mode !== "edit") return false;
    if (!draftId) {
      toast.error("Listing is not ready to update.");
      return false;
    }
    dispatch(setIsSaving(true));
    try {
      const body = buildRentEditUpdateBody(formData);
      await rentListingEditService.updateListing(draftId, body);
      clearAllDraftData();
      dispatch(resetListingForm());
      router.push("/dashboard");
      toast.success("Listing updated successfully!");
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update listing. Please try again.";
      toast.error(message);
      return false;
    } finally {
      dispatch(setIsSaving(false));
    }
  }

  return { updateAndExit };
}
