import type { Middleware } from "@reduxjs/toolkit";

interface StoreWithListingForm {
  listingForm: {
    draftId: string | null;
    currentStep: number;
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
      const { draftId, currentStep } = state.listingForm;

      if (draftId !== null) {
        sessionStorage.setItem("nesto_rent_draft_id", draftId);
      }
      sessionStorage.setItem("nesto_rent_draft_step", currentStep.toString());
    } catch {
      // sessionStorage unavailable or quota exceeded — silently ignore
    }
  }

  return result;
};
