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
  OtherAmenityOption,
  PropertyFee,
} from "@/types/property";

// ── Step form data types ────────────────────────────────────

export interface PropertyInfoData {
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
}

export interface RentDetailsData {
  monthlyRent: number | null;
  securityDeposit: number | null;
  specialOfferStart: string;
  specialOfferEnd: string;
  specialOfferDescription: string;
}

export interface MediaData {
  photos: string[];
  coverPhotoIndex: number;
  tourUrl: string;
}

export interface AmenitiesData {
  laundry: LaundryOption | null;
  cooling: CoolingOption[];
  heating: HeatingOption[];
  appliances: ApplianceOption[];
  flooring: FlooringOption[];
  parking: ParkingOption[];
  outdoor: OutdoorOption[];
  accessibility: AccessibilityOption[];
  other: OtherAmenityOption[];
}

export interface ScreeningData {
  petsAllowed: boolean;
  petPolicyNegotiable: boolean;
  minIncomeToRentRatio: string;
  incomeNegotiable: boolean;
  minCreditScore: string;
  creditNegotiable: boolean;
}

export interface CostsAndFeesData {
  fees: PropertyFee[];
  showTotalMonthlyPrice: boolean;
}

export interface FinalDetailsData {
  listedBy: ListedBy | null;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  hideAddress: boolean;
  coordinates: { lat: number; lng: number } | null;
  dateAvailable: string;
  leaseDuration: string;
  leaseTerms: string;
  requireRentersInsurance: boolean;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  allowPhoneContact: boolean;
  acceptOnlineApplications: boolean;
  bookToursInstantly: boolean;
}

export interface ListingFormData {
  propertyInfo: PropertyInfoData;
  rentDetails: RentDetailsData;
  media: MediaData;
  amenities: AmenitiesData;
  screening: ScreeningData;
  costsAndFees: CostsAndFeesData;
  finalDetails: FinalDetailsData;
}

export interface CompletionStatus {
  requiredComplete: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  qualityScore: number;
}

// ── Initial values ──────────────────────────────────────────

const initialPropertyInfo: PropertyInfoData = {
  bedrooms: 0,
  bathrooms: 0,
  squareFootage: null,
};

const initialRentDetails: RentDetailsData = {
  monthlyRent: null,
  securityDeposit: null,
  specialOfferStart: "",
  specialOfferEnd: "",
  specialOfferDescription: "",
};

const initialMedia: MediaData = {
  photos: [],
  coverPhotoIndex: 0,
  tourUrl: "",
};

const initialAmenities: AmenitiesData = {
  laundry: null,
  cooling: [],
  heating: [],
  appliances: [],
  flooring: [],
  parking: [],
  outdoor: [],
  accessibility: [],
  other: [],
};

const initialScreening: ScreeningData = {
  petsAllowed: false,
  petPolicyNegotiable: false,
  minIncomeToRentRatio: "",
  incomeNegotiable: false,
  minCreditScore: "",
  creditNegotiable: false,
};

const initialCostsAndFees: CostsAndFeesData = {
  fees: [],
  showTotalMonthlyPrice: false,
};

const initialFinalDetails: FinalDetailsData = {
  listedBy: null,
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  hideAddress: false,
  coordinates: null,
  dateAvailable: "",
  leaseDuration: "",
  leaseTerms: "",
  requireRentersInsurance: false,
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  allowPhoneContact: false,
  acceptOnlineApplications: false,
  bookToursInstantly: false,
};

const initialFormData: ListingFormData = {
  propertyInfo: initialPropertyInfo,
  rentDetails: initialRentDetails,
  media: initialMedia,
  amenities: initialAmenities,
  screening: initialScreening,
  costsAndFees: initialCostsAndFees,
  finalDetails: initialFinalDetails,
};

const initialCompletionStatus: CompletionStatus = {
  requiredComplete: false,
  missingRequired: [],
  missingRecommended: [],
  qualityScore: 0,
};

// ── Slice state ─────────────────────────────────────────────

interface ListingFormState {
  currentStep: number;
  currentSubStep: number;
  completedSteps: number[];
  formData: ListingFormData;
  draftId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  completionStatus: CompletionStatus;
}

const initialState: ListingFormState = {
  currentStep: 0,
  currentSubStep: 0,
  completedSteps: [],
  formData: initialFormData,
  draftId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  completionStatus: initialCompletionStatus,
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
    setPropertyInfo(state, action: PayloadAction<Partial<PropertyInfoData>>) {
      state.formData.propertyInfo = { ...state.formData.propertyInfo, ...action.payload };
      state.isDirty = true;
    },
    setRentDetails(state, action: PayloadAction<Partial<RentDetailsData>>) {
      state.formData.rentDetails = { ...state.formData.rentDetails, ...action.payload };
      state.isDirty = true;
    },
    setMedia(state, action: PayloadAction<Partial<MediaData>>) {
      state.formData.media = { ...state.formData.media, ...action.payload };
      state.isDirty = true;
    },
    setAmenities(state, action: PayloadAction<Partial<AmenitiesData>>) {
      state.formData.amenities = { ...state.formData.amenities, ...action.payload };
      state.isDirty = true;
    },
    setScreening(state, action: PayloadAction<Partial<ScreeningData>>) {
      state.formData.screening = { ...state.formData.screening, ...action.payload };
      state.isDirty = true;
    },
    setCostsAndFees(state, action: PayloadAction<Partial<CostsAndFeesData>>) {
      state.formData.costsAndFees = { ...state.formData.costsAndFees, ...action.payload };
      state.isDirty = true;
    },
    setFinalDetails(state, action: PayloadAction<Partial<FinalDetailsData>>) {
      state.formData.finalDetails = { ...state.formData.finalDetails, ...action.payload };
      state.isDirty = true;
    },

    // Draft management
    setDraftId(state, action: PayloadAction<string | null>) {
      state.draftId = action.payload;
    },
    setIsDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    setLastSavedAt(state, action: PayloadAction<string | null>) {
      state.lastSavedAt = action.payload;
    },

    // Restore from sessionStorage — only formData + navigation
    restoreFromSession(
      state,
      action: PayloadAction<{
        formData: ListingFormData;
        currentStep: number;
        currentSubStep: number;
      }>
    ) {
      state.formData = action.payload.formData;
      state.currentStep = action.payload.currentStep;
      state.currentSubStep = action.payload.currentSubStep;
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
  setPropertyInfo,
  setRentDetails,
  setMedia,
  setAmenities,
  setScreening,
  setCostsAndFees,
  setFinalDetails,
  setDraftId,
  setIsDirty,
  setIsSaving,
  setLastSavedAt,
  restoreFromSession,
  resetListingForm,
} = listingFormSlice.actions;

export default listingFormSlice.reducer;
