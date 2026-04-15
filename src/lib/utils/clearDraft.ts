import { store } from "@/store";
import { resetListingForm } from "@/store/slices/listingFormSlice";
import { clearRentCreateIntent } from "@/lib/utils/rentCreateSession";

export function clearAllDraftData(): void {
  store.dispatch(resetListingForm());
  clearRentCreateIntent();

  try {
    sessionStorage.removeItem("nesto_rent_draft_id");
    sessionStorage.removeItem("nesto_rent_draft_step");
  } catch {
    // sessionStorage unavailable
  }
}
