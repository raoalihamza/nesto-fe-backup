import { apiClient } from "@/lib/api/client";
import type {
  PresignMediaBody,
  PresignMediaResponse,
  ConfirmMediaBody,
} from "@/lib/api/rentDraft.service";
import type {
  RentDraftResponse,
  Tour3dEntry,
  AmenitiesData,
  FeeCategory,
  FeeFormat,
  FeeFrequency,
  FeeRequiredType,
  FeeRefundability,
} from "@/store/slices/listingFormSlice";

/** Address block for published rent edit PUT body (same shape as draft address). */
export interface RentEditAddressPayload {
  placeId: string;
  formattedAddress: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export interface RentEditListingEntryPayload {
  propertyType: string;
  unitNumber: string | null;
  numberOfUnits: number | null;
  isSharedLivingSpace: boolean;
}

export interface RentEditPropertyInfoBody {
  address: RentEditAddressPayload;
  listingEntry: RentEditListingEntryPayload;
  squareFootage: number | null;
  totalBedrooms: number | null;
  totalBathrooms: number | null;
  totalHalfBathrooms: number | null;
}

export interface RentEditSpecialOfferBody {
  offerStartDate: string | null;
  offerEndDate: string | null;
  description: string | null;
}

export interface RentEditRentDetailsBody {
  monthlyRent: number | null;
  securityDeposit: number | null;
  specialOffer: RentEditSpecialOfferBody | null;
}

export interface RentEditMediaBody {
  tours3d: Tour3dEntry[];
}

export interface RentEditScreeningCriteriaBody {
  arePetsAllowed: boolean | null;
  petPolicyNegotiable: boolean | null;
  minimumIncomeToRentRatio: number | null;
  incomeToRentRatioNegotiable: boolean | null;
  minimumMonthlyPreTaxIncome: number | null;
  minimumCreditScore: number | null;
  creditScoreNegotiable: boolean | null;
}

export interface RentEditFeeBody {
  category: FeeCategory;
  feeName: string;
  paymentFrequency: FeeFrequency;
  feeFormat: FeeFormat;
  feeAmount: number;
  includedInRent?: boolean;
  feeRequiredType: FeeRequiredType;
  refundability?: FeeRefundability;
  description?: string;
  sortOrder?: number;
}

export interface RentEditCostsAndFeesBody {
  fees: RentEditFeeBody[];
}

export interface RentEditFinalDetailsBody {
  leaseTerms: string | null;
  requiresRentersInsurance: boolean | null;
  listedBy: string | null;
  name: string | null;
  email: string | null;
  bookingToursInstantly: boolean | null;
  propertyDescription: string | null;
  hidePropertyAddress: boolean;
  dateAvailable: string | null;
  leaseDuration: string | null;
  allowRentersToContactByPhone: boolean;
  acceptOnlineApplications: boolean;
}

/**
 * Body for PUT /listings/rent/:listingId. Published rent edit uses a full update:
 * frontend must send the complete body even when only one field changed.
 *
 * Notes per RENT_LISTING_EDIT_FRONTEND_GUIDE.md:
 * - `finalDetails.phoneNumber` / `phoneVerified` are NOT sent (managed via verify-phone endpoint).
 * - `media` only carries `tours3d`; photos are managed via listing-scoped media endpoints.
 * - `progress` is read-only and never sent back.
 */
export interface RentListingUpdateBody {
  propertyInfo: RentEditPropertyInfoBody;
  rentDetails: RentEditRentDetailsBody;
  media: RentEditMediaBody;
  amenities: AmenitiesData;
  screeningCriteria: RentEditScreeningCriteriaBody;
  costsAndFees: RentEditCostsAndFeesBody;
  finalDetails: RentEditFinalDetailsBody;
}

export interface RentListingMediaListResponse {
  items?: RentDraftResponse["media"]["items"];
  photos?: RentDraftResponse["media"]["photos"];
}

export interface RentListingMediaConfirmResponse
  extends RentListingMediaListResponse {
  tours3d?: RentDraftResponse["media"]["tours3d"];
}

export const rentListingEditService = {
  /** GET /listings/rent/:listingId/edit — preload full owner-oriented rent payload. */
  getListingForEdit(listingId: string): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/${listingId}/edit`,
      { method: "GET" }
    );
  },

  /** PUT /listings/rent/:listingId — full update. */
  updateListing(
    listingId: string,
    body: RentListingUpdateBody
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/${listingId}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  },

  /** POST /listings/rent/:listingId/verify-phone — attach verified phone to listing. */
  verifyPhone(
    listingId: string,
    body: { firebaseIdToken: string }
  ): Promise<RentDraftResponse | Record<string, never>> {
    return apiClient<RentDraftResponse | Record<string, never>>(
      `/listings/rent/${listingId}/verify-phone`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * GET /listings/rent/:listingId/media — not required when GET /edit already returns
   * usable media URLs, but exposed here as a fallback if a screen needs a refresh.
   */
  getListingMedia(listingId: string): Promise<RentListingMediaListResponse> {
    return apiClient<RentListingMediaListResponse>(
      `/listings/rent/${listingId}/media`,
      { method: "GET" }
    );
  },

  /** POST /listings/rent/:listingId/media/presign — batch presign for new uploads. */
  presignMedia(
    listingId: string,
    body: PresignMediaBody
  ): Promise<PresignMediaResponse> {
    return apiClient<PresignMediaResponse>(
      `/listings/rent/${listingId}/media/presign`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  /** POST /listings/rent/:listingId/media/confirm — batch confirm after storage upload. */
  confirmMedia(
    listingId: string,
    body: ConfirmMediaBody
  ): Promise<RentDraftResponse | RentListingMediaConfirmResponse> {
    return apiClient<RentDraftResponse | RentListingMediaConfirmResponse>(
      `/listings/rent/${listingId}/media/confirm`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * DELETE /listings/rent/:listingId/media/:mediaId.
   *
   * Backend blocks deletion of the last confirmed photo; frontend should either
   * guard client-side (when a single photo remains) or surface the backend error.
   */
  deleteMedia(listingId: string, mediaId: string): Promise<void> {
    return apiClient<void>(
      `/listings/rent/${listingId}/media/${mediaId}`,
      { method: "DELETE" }
    );
  },
};
