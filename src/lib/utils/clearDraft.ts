import { store } from "@/store";
import { resetListingForm } from "@/store/slices/listingFormSlice";

const SESSION_KEY = "nesto_stepper_draft";
const LOCAL_KEY = "nesto_draft_id";

export function clearAllDraftData(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage unavailable
  }

  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // localStorage unavailable
  }

  store.dispatch(resetListingForm());
}
