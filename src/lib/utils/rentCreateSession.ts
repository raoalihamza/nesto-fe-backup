const RENT_CREATE_INTENT_KEY = "nesto_rent_create_intent";

/** Set when navigating to /listings/create from RentListingModal or post-login pending listing (SPA guard). */
export function setRentCreateIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RENT_CREATE_INTENT_KEY, "1");
  } catch {
    /* quota / private mode */
  }
}

export function clearRentCreateIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RENT_CREATE_INTENT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasRentCreateIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(RENT_CREATE_INTENT_KEY) === "1";
  } catch {
    return false;
  }
}
