import type { AppDispatch } from "@/store";
import {
  setPropertyInfo,
  setListingContext,
  emptyRentDraftAddress,
  initialListingEntryForm,
  type RentDraftAddress,
  type ListingEntryFormData,
} from "@/store/slices/listingFormSlice";
import { getSafeReturnUrl } from "@/lib/auth/safeReturnUrl";
import { ROUTES } from "@/lib/constants/routes";
import { clearAllDraftData } from "@/lib/utils/clearDraft";

const STORAGE_KEY = "nesto_pending_rent_listing";

export interface PendingRentListingV1 {
  v: 1;
  /** Optional post-auth destination (allowlisted when consumed). */
  returnUrl?: string;
  address: RentDraftAddress;
  listingEntry: ListingEntryFormData;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isValidAddress(a: unknown): a is RentDraftAddress {
  if (!isRecord(a)) return false;
  return (
    typeof a.placeId === "string" &&
    a.placeId.length > 0 &&
    typeof a.formattedAddress === "string" &&
    a.formattedAddress.length > 0 &&
    typeof a.latitude === "number" &&
    !Number.isNaN(a.latitude) &&
    typeof a.longitude === "number" &&
    !Number.isNaN(a.longitude)
  );
}

function isValidListingEntry(e: unknown): e is ListingEntryFormData {
  if (!isRecord(e)) return false;
  return (
    typeof e.propertyType === "string" &&
    e.propertyType.length > 0 &&
    typeof e.isSharedLivingSpace === "boolean" &&
    (e.unitNumber === null || typeof e.unitNumber === "string") &&
    (e.numberOfUnits === null || typeof e.numberOfUnits === "number")
  );
}

function parseStored(json: string): PendingRentListingV1 | null {
  try {
    const data = JSON.parse(json) as unknown;
    if (!isRecord(data) || data.v !== 1) return null;
    if (!isValidAddress(data.address) || !isValidListingEntry(data.listingEntry)) {
      return null;
    }
    const returnUrl =
      typeof data.returnUrl === "string"
        ? getSafeReturnUrl(data.returnUrl) ?? undefined
        : undefined;
    return {
      v: 1,
      returnUrl,
      address: { ...emptyRentDraftAddress, ...data.address },
      listingEntry: {
        ...initialListingEntryForm,
        ...data.listingEntry,
      },
    };
  } catch {
    return null;
  }
}

export function savePendingRentListing(payload: {
  address: RentDraftAddress;
  listingEntry: ListingEntryFormData;
  returnUrl?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const returnUrl =
    payload.returnUrl != null
      ? getSafeReturnUrl(payload.returnUrl) ?? undefined
      : undefined;
  const body: PendingRentListingV1 = {
    v: 1,
    returnUrl,
    address: payload.address,
    listingEntry: payload.listingEntry,
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(body));
  } catch {
    /* quota / private mode */
  }
}

export function readPendingRentListing(): PendingRentListingV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseStored(raw);
    if (!parsed) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingRentListing(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function listingContextFromAddress(
  addr: RentDraftAddress,
  propertyType: string | null
) {
  return {
    propertyType,
    placeId: addr.placeId,
    formattedAddress: addr.formattedAddress,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    stateCode: addr.stateCode,
    postalCode: addr.postalCode,
    countryCode: addr.countryCode ?? "US",
    latitude: addr.latitude,
    longitude: addr.longitude,
  };
}

/**
 * Applies pending address + listingEntry from sessionStorage into the rent draft Redux slice.
 * @returns true if data was applied and storage cleared.
 */
export function hydratePendingRentListingFromStorage(
  dispatch: AppDispatch
): boolean {
  const pending = readPendingRentListing();
  if (!pending) return false;
  // Starting from modal intent should always create a fresh draft context.
  clearAllDraftData();
  dispatch(
    setPropertyInfo({
      address: pending.address,
      listingEntry: pending.listingEntry,
    })
  );
  dispatch(
    setListingContext(
      listingContextFromAddress(
        pending.address,
        pending.listingEntry.propertyType
      )
    )
  );
  clearPendingRentListing();
  return true;
}

/** Default return path when a pending rent listing exists (e.g. verify-email success). */
export function getDefaultReturnUrlWhenPendingListing(): string | null {
  const p = readPendingRentListing();
  if (!p) return null;
  return p.returnUrl ?? ROUTES.OWNER.CREATE;
}

/**
 * Prefer allowlisted `returnUrl` from the URL; if missing, use pending listing intent from sessionStorage.
 */
export function resolvePendingAwareReturnUrl(
  rawFromQuery: string | null | undefined
): string | null {
  return getSafeReturnUrl(rawFromQuery ?? null) ?? getDefaultReturnUrlWhenPendingListing();
}

export function buildLoginHrefWithReturnContext(
  rawFromQuery: string | null | undefined
): string {
  const resolved = resolvePendingAwareReturnUrl(rawFromQuery);
  if (!resolved) return ROUTES.LOGIN;
  return `${ROUTES.LOGIN}?${new URLSearchParams({ returnUrl: resolved }).toString()}`;
}
