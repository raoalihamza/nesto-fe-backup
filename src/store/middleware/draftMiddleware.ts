import type { Middleware } from "@reduxjs/toolkit";
import type { ListingFormData } from "@/store/slices/listingFormSlice";

const DRAFT_KEY = "nesto_stepper_draft";

interface StoreWithListingForm {
  listingForm: {
    formData: ListingFormData;
    currentStep: number;
    currentSubStep: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const draftMiddleware: Middleware<any, any, any> = (store) => (next) => (action) => {
  const result = next(action);

  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof (action as { type: unknown }).type === "string" &&
    ((action as { type: string }).type).startsWith("listingForm/")
  ) {
    try {
      const state = store.getState() as StoreWithListingForm;
      const { formData, currentStep, currentSubStep } = state.listingForm;
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ formData, currentStep, currentSubStep })
      );
    } catch {
      // sessionStorage unavailable or quota exceeded — silently ignore
    }
  }

  return result;
};
