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
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PropertyInfoData {
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

export interface MediaData {
  items: DraftMediaItem[];
  photos: DraftMediaItem[];
  tours3d: DraftMediaItem[];
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
  addressLine1: null,
  addressLine2: null,
  city: null,
  stateCode: null,
  postalCode: null,
  countryCode: "US",
  latitude: null,
  longitude: null,
};

const initialPropertyInfo: PropertyInfoData = {
  squareFootage: null,
  totalBedrooms: null,
  totalBathrooms: null,
};

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

interface ListingFormState {
  currentStep: number;
  currentSubStep: number;
  completedSteps: number[];
  formData: ListingFormData;
  draftId: string | null;
  isSaving: boolean;
  lastSavedAt: string | null;
  draftProgress: DraftProgressData | null;
}

const initialState: ListingFormState = {
  currentStep: 0,
  currentSubStep: 0,
  completedSteps: [],
  formData: initialFormData,
  draftId: null,
  isSaving: false,
  lastSavedAt: null,
  draftProgress: null,
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
    setLastSavedAt(state, action: PayloadAction<string | null>) {
      state.lastSavedAt = action.payload;
    },

    // Hydrates full Redux state from API response
    restoreFromDraft(state, action: PayloadAction<RentDraftResponse>) {
      state.draftId = action.payload.id;
      state.formData.listingContext = action.payload.listingContext;
      state.formData.propertyInfo = action.payload.propertyInfo;
      state.formData.rentDetails = action.payload.rentDetails;
      state.formData.media = action.payload.media;
      state.formData.amenities = action.payload.amenities;
      state.formData.screeningCriteria = action.payload.screeningCriteria;
      state.formData.costsAndFees = action.payload.costsAndFees;
      state.formData.finalDetails = action.payload.finalDetails;
      state.draftProgress = action.payload.progress;
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
  setLastSavedAt,
  restoreFromDraft,
  resetListingForm,
} = listingFormSlice.actions;

export default listingFormSlice.reducer;
