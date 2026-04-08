import { store } from "@/store";
import { resetListingForm } from "@/store/slices/listingFormSlice";

export function clearAllDraftData(): void {
  store.dispatch(resetListingForm());

  try {
    sessionStorage.removeItem("nesto_rent_draft_id");
    sessionStorage.removeItem("nesto_rent_draft_step");
  } catch {
    // sessionStorage unavailable
  }
}
