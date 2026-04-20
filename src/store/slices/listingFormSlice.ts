import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ListedBy,
  LaundryOption,
  CoolingOption,
  HeatingOption,
  ApplianceOption,
  FlooringOption,
  ParkingOption,
  OutdoorOption,
  AccessibilityOption,
  PropertyFee,
  FeeCategory,
  FeeFormat,
  FeeFrequency,
  FeeRequiredType,
  FeeRefundability,
} from "@/types/property";

// Re-export for use in components
export type {
  FeeCategory,
  FeeFormat,
  FeeFrequency,
  FeeRequiredType,
  FeeRefundability,
  PropertyFee,
};

// ── Step form data types ────────────────────────────────────

export interface ListingContextData {
  title: string | null;
  propertyType: string | null;
  placeId: string | null;
  formattedAddress: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
}

/** Address block sent with rent draft property-info APIs */
export interface RentDraftAddress {
  placeId: string | null;
  formattedAddress: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ListingEntryFormData {
  propertyType: string | null;
  unitNumber: string | null;
  numberOfUnits: number | null;
  isSharedLivingSpace: boolean;
}

export interface PropertyInfoData {
  address: RentDraftAddress;
  listingEntry: ListingEntryFormData;
  squareFootage: number | null;
  totalBedrooms: number | null;
  totalBathrooms: string | null;
}

export interface SpecialOfferData {
  offerStartDate: string | null;
  offerEndDate: string | null;
  description: string | null;
}

export interface RentDetailsData {
  monthlyRent: number | null;
  securityDeposit: number | null;
  specialOffer: SpecialOfferData | null;
}

export interface DraftMediaItem {
  id: string;
  mediaType: "PHOTO" | "VIDEO" | "TOUR_3D";
  status: "PENDING" | "READY";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  sortOrder: number;
  objectKey: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

/** 3D / virtual tour link saved with the listing (API: tours3d). */
export interface Tour3dEntry {
  tourName: string;
  tourUrl: string;
  sortOrder: number;
}

export interface MediaData {
  items: DraftMediaItem[];
  photos: DraftMediaItem[];
  tours3d: Tour3dEntry[];
}

/** Normalize tours from API (new shape or legacy TOUR_3D media items). */
export function normalizeTours3d(raw: unknown): Tour3dEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index): Tour3dEntry | null => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      if (typeof o.tourUrl === "string" && typeof o.tourName === "string") {
        return {
          tourName: o.tourName,
          tourUrl: o.tourUrl,
          sortOrder: typeof o.sortOrder === "number" ? o.sortOrder : index,
        };
      }
      if (typeof o.url === "string" && o.url.trim()) {
        const name =
          typeof o.fileName === "string" && o.fileName.trim()
            ? o.fileName.trim()
            : "3D tour";
        return {
          tourName: name,
          tourUrl: o.url,
          sortOrder: typeof o.sortOrder === "number" ? o.sortOrder : index,
        };
      }
      return null;
    })
    .filter((x): x is Tour3dEntry => x !== null);
}

export interface AmenitiesData {
  laundry: LaundryOption[];
  cooling: CoolingOption[];
  heating: HeatingOption[];
  appliances: ApplianceOption[];
  flooring: FlooringOption[];
  furnished: string[];
  parking: ParkingOption[];
  outdoorAmenities: OutdoorOption[];
  accessibility: AccessibilityOption[];
  otherAmenities: string[];
}

export interface ScreeningCriteriaData {
  arePetsAllowed: boolean | null;
  petPolicyNegotiable: boolean | null;
  minimumIncomeToRentRatio: string | null;
  incomeToRentRatioNegotiable: boolean | null;
  minimumMonthlyPreTaxIncome: string | null;
  minimumCreditScore: number | null;
  creditScoreNegotiable: boolean | null;
}

export interface CostsAndFeesData {
  fees: PropertyFee[];
}

export interface FinalDetailsData {
  leaseTerms: string | null;
  requiresRentersInsurance: boolean | null;
  listedBy: ListedBy | null;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified?: boolean;
  bookingToursInstantly: boolean | null;
  propertyDescription: string | null;
  hidePropertyAddress: boolean;
  dateAvailable: string | null;
  leaseDuration: string | null;
  allowRentersToContactByPhone: boolean;
  acceptOnlineApplications: boolean;
}

export interface DraftValidationIssue {
  section: string;
  field: string;
  message: string;
}

export interface DraftProgressData {
  currentStep: string;
  lastCompletedStep: string | null;
  completedSteps: string[];
  publishReady: boolean;
  validationIssues: DraftValidationIssue[];
}

export interface ListingFormData {
  listingContext: ListingContextData;
  propertyInfo: PropertyInfoData;
  rentDetails: RentDetailsData;
  media: MediaData;
  amenities: AmenitiesData;
  screeningCriteria: ScreeningCriteriaData;
  costsAndFees: CostsAndFeesData;
  finalDetails: FinalDetailsData;
}

export interface RentDraftResponse {
  id: string;
  ownerId: string;
  listingType: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  listingContext: ListingContextData;
  progress: DraftProgressData;
  propertyInfo: PropertyInfoData;
  rentDetails: RentDetailsData;
  media: MediaData;
  amenities: AmenitiesData;
  screeningCriteria: ScreeningCriteriaData;
  costsAndFees: CostsAndFeesData;
  finalDetails: FinalDetailsData;
}

// ── Initial values ──────────────────────────────────────────

const initialListingContext: ListingContextData = {
  title: null,
  propertyType: null,
  placeId: null,
  formattedAddress: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  stateCode: null,
  postalCode: null,
  countryCode: "US",
  latitude: null,
  longitude: null,
};

export const emptyRentDraftAddress: RentDraftAddress = {
  placeId: null,
  formattedAddress: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  stateCode: null,
  postalCode: null,
  countryCode: null,
  latitude: null,
  longitude: null,
};

export const initialListingEntryForm: ListingEntryFormData = {
  propertyType: null,
  unitNumber: null,
  numberOfUnits: null,
  isSharedLivingSpace: false,
};

const initialPropertyInfo: PropertyInfoData = {
  address: { ...emptyRentDraftAddress },
  listingEntry: { ...initialListingEntryForm },
  squareFootage: null,
  totalBedrooms: null,
  totalBathrooms: null,
};

/** Merge API / partial propertyInfo into full shape (supports older drafts). */
export function normalizePropertyInfo(
  pi: Partial<PropertyInfoData> | undefined
): PropertyInfoData {
  if (!pi) {
    return {
      address: { ...emptyRentDraftAddress },
      listingEntry: { ...initialListingEntryForm },
      squareFootage: null,
      totalBedrooms: null,
      totalBathrooms: null,
    };
  }
  const address = pi.address
    ? { ...emptyRentDraftAddress, ...pi.address }
    : { ...emptyRentDraftAddress };
  const listingEntry = pi.listingEntry
    ? { ...initialListingEntryForm, ...pi.listingEntry }
    : { ...initialListingEntryForm };
  return {
    address,
    listingEntry,
    squareFootage: pi.squareFootage ?? null,
    totalBedrooms: pi.totalBedrooms ?? null,
    totalBathrooms: pi.totalBathrooms ?? null,
  };
}

const initialRentDetails: RentDetailsData = {
  monthlyRent: null,
  securityDeposit: null,
  specialOffer: null,
};

const initialMedia: MediaData = {
  items: [],
  photos: [],
  tours3d: [],
};

const initialAmenities: AmenitiesData = {
  laundry: [],
  cooling: [],
  heating: [],
  appliances: [],
  flooring: [],
  furnished: [],
  parking: [],
  outdoorAmenities: [],
  accessibility: [],
  otherAmenities: [],
};

const initialScreeningCriteria: ScreeningCriteriaData = {
  arePetsAllowed: null,
  petPolicyNegotiable: null,
  minimumIncomeToRentRatio: null,
  incomeToRentRatioNegotiable: null,
  minimumMonthlyPreTaxIncome: null,
  minimumCreditScore: null,
  creditScoreNegotiable: null,
};

const initialCostsAndFees: CostsAndFeesData = {
  fees: [],
};

const initialFinalDetails: FinalDetailsData = {
  leaseTerms: null,
  requiresRentersInsurance: null,
  listedBy: null,
  name: null,
  email: null,
  phoneNumber: null,
  phoneVerified: false,
  bookingToursInstantly: null,
  propertyDescription: null,
  hidePropertyAddress: false,
  dateAvailable: null,
  leaseDuration: null,
  allowRentersToContactByPhone: false,
  acceptOnlineApplications: false,
};

const initialFormData: ListingFormData = {
  listingContext: initialListingContext,
  propertyInfo: initialPropertyInfo,
  rentDetails: initialRentDetails,
  media: initialMedia,
  amenities: initialAmenities,
  screeningCriteria: initialScreeningCriteria,
  costsAndFees: initialCostsAndFees,
  finalDetails: initialFinalDetails,
};

// ── Slice state ─────────────────────────────────────────────

/**
 * Rent stepper mode.
 *
 * - `create` — the original draft flow: each Next saves to draft step endpoints.
 * - `edit`   — published rent listing edit flow: Next is local-only, a single
 *   full PUT is sent on Update & Exit / Update & Publish. See
 *   `RENT_LISTING_EDIT_FRONTEND_GUIDE.md`.
 */
export type ListingFormMode = "create" | "edit";

interface ListingFormState {
  currentStep: number;
  currentSubStep: number;
  completedSteps: number[];
  formData: ListingFormData;
  draftId: string | null;
  isSaving: boolean;
  /** Incremented during rent photo flow: presign → PUT → confirmMedia (Step 3). */
  mediaUploadInFlight: number;
  /** True while rent address-search or address-details requests are in flight (modal or step 0). */
  addressLookupBusy: boolean;
  lastSavedAt: string | null;
  draftProgress: DraftProgressData | null;
  mode: ListingFormMode;
}

const initialState: ListingFormState = {
  currentStep: 0,
  currentSubStep: 0,
  completedSteps: [],
  formData: initialFormData,
  draftId: null,
  isSaving: false,
  mediaUploadInFlight: 0,
  addressLookupBusy: false,
  lastSavedAt: null,
  draftProgress: null,
  mode: "create",
};

// ── Slice ───────────────────────────────────────────────────

const listingFormSlice = createSlice({
  name: "listingForm",
  initialState,
  reducers: {
    // Navigation
    goToStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
      state.currentSubStep = 0;
    },
    goToSubStep(state, action: PayloadAction<number>) {
      state.currentSubStep = action.payload;
    },
    markStepComplete(state, action: PayloadAction<number>) {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
    },

    // Step setters
    setListingContext(state, action: PayloadAction<Partial<ListingContextData>>) {
      state.formData.listingContext = { ...state.formData.listingContext, ...action.payload };
    },
    setPropertyInfo(state, action: PayloadAction<Partial<PropertyInfoData>>) {
      state.formData.propertyInfo = { ...state.formData.propertyInfo, ...action.payload };
    },
    setRentDetails(state, action: PayloadAction<Partial<RentDetailsData>>) {
      state.formData.rentDetails = { ...state.formData.rentDetails, ...action.payload };
    },
    setMedia(state, action: PayloadAction<Partial<MediaData>>) {
      state.formData.media = { ...state.formData.media, ...action.payload };
    },
    setAmenities(state, action: PayloadAction<Partial<AmenitiesData>>) {
      state.formData.amenities = { ...state.formData.amenities, ...action.payload };
    },
    setScreeningCriteria(state, action: PayloadAction<Partial<ScreeningCriteriaData>>) {
      state.formData.screeningCriteria = { ...state.formData.screeningCriteria, ...action.payload };
    },
    setCostsAndFees(state, action: PayloadAction<Partial<CostsAndFeesData>>) {
      state.formData.costsAndFees = { ...state.formData.costsAndFees, ...action.payload };
    },
    setFinalDetails(state, action: PayloadAction<Partial<FinalDetailsData>>) {
      state.formData.finalDetails = { ...state.formData.finalDetails, ...action.payload };
    },

    // Draft management
    setDraftId(state, action: PayloadAction<string | null>) {
      state.draftId = action.payload;
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    beginMediaUpload(state) {
      state.mediaUploadInFlight += 1;
    },
    endMediaUpload(state) {
      state.mediaUploadInFlight = Math.max(0, state.mediaUploadInFlight - 1);
    },
    setAddressLookupBusy(state, action: PayloadAction<boolean>) {
      state.addressLookupBusy = action.payload;
    },
    setLastSavedAt(state, action: PayloadAction<string | null>) {
      state.lastSavedAt = action.payload;
    },

    // Hydrates full Redux state from API response
    restoreFromDraft(state, action: PayloadAction<RentDraftResponse>) {
      state.addressLookupBusy = false;
      state.mediaUploadInFlight = 0;
      state.draftId = action.payload.id;
      state.formData.listingContext = {
        ...initialListingContext,
        ...action.payload.listingContext,
      };
      state.formData.propertyInfo = normalizePropertyInfo(
        action.payload.propertyInfo
      );
      state.formData.rentDetails = action.payload.rentDetails;
      {
        const m = action.payload.media;
        state.formData.media = {
          items: m?.items ?? [],
          photos: m?.photos ?? [],
          tours3d: normalizeTours3d(m?.tours3d),
        };
      }
      state.formData.amenities = action.payload.amenities;
      state.formData.screeningCriteria = action.payload.screeningCriteria;
      state.formData.costsAndFees = action.payload.costsAndFees;
      state.formData.finalDetails = action.payload.finalDetails;
      state.draftProgress = action.payload.progress;
    },

    setListingFormMode(state, action: PayloadAction<ListingFormMode>) {
      state.mode = action.payload;
    },

    // Full reset
    resetListingForm() {
      return initialState;
    },
  },
});

export const {
  goToStep,
  goToSubStep,
  markStepComplete,
  setListingContext,
  setPropertyInfo,
  setRentDetails,
  setMedia,
  setAmenities,
  setScreeningCriteria,
  setCostsAndFees,
  setFinalDetails,
  setDraftId,
  setIsSaving,
  beginMediaUpload,
  endMediaUpload,
  setAddressLookupBusy,
  setLastSavedAt,
  restoreFromDraft,
  setListingFormMode,
  resetListingForm,
} = listingFormSlice.actions;

export default listingFormSlice.reducer;
