import { apiClient } from "@/lib/api/client";
import type {
  RentDraftResponse,
  AmenitiesData,
  FinalDetailsData,
} from "@/store/slices/listingFormSlice";
import type {
  PropertyFee,
  FeeCategory,
  FeeFormat,
  FeeFrequency,
  FeeRequiredType,
  FeeRefundability,
} from "@/types/property";

export interface PresignMediaFile {
  mediaType: "PHOTO" | "VIDEO" | "TOUR_3D";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  sortOrder: number;
  metadata?: Record<string, string>;
}

export interface PresignMediaBody {
  files: PresignMediaFile[];
}

export interface PresignUploadItem {
  listingId: string;
  mediaId: string;
  uploadUrl: string;
  objectKey: string;
  bucket: string;
  method: string;
  headers: Record<string, string>;
  expiresInSeconds: number;
  publicUrl: string;
}

export interface PresignMediaResponse {
  listingId: string;
  uploads: PresignUploadItem[];
}

export interface ConfirmMediaBody {
  fileSizeBytes?: number | null;
  sortOrder?: number;
}

export interface CreateFeeBody {
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

export type UpdateFeeBody = Partial<CreateFeeBody>;

export const rentDraftService = {
  // Step 0 — first save (creates draft)
  createDraft(body: {
    squareFootage: number | null;
    totalBedrooms: number | null;
    totalBathrooms: number | null;
  }): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>("/listings/rent/drafts/property-info", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Step 0 — update existing draft
  savePropertyInfo(
    draftId: string,
    body: {
      squareFootage: number | null;
      totalBedrooms: number | null;
      totalBathrooms: number | null;
    }
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/property-info`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 1
  saveRentDetails(
    draftId: string,
    body: {
      monthlyRent: number | null;
      securityDeposit: number | null;
      specialOffer: {
        offerStartDate: string | null;
        offerEndDate: string | null;
        description: string | null;
      } | null;
    }
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/rent-details`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 2 — mark media step complete (empty body)
  saveMediaStep(draftId: string): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/media`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  },

  // Step 2 — presign batch of files
  presignMedia(
    draftId: string,
    body: PresignMediaBody
  ): Promise<PresignMediaResponse> {
    return apiClient<PresignMediaResponse>(
      `/listings/rent/drafts/${draftId}/media/presign`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 2 — confirm after S3 upload
  confirmMedia(
    draftId: string,
    mediaId: string,
    body: ConfirmMediaBody
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/media/${mediaId}/confirm`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 2 — delete a media item
  deleteMedia(draftId: string, mediaId: string): Promise<void> {
    return apiClient<void>(
      `/listings/rent/drafts/${draftId}/media/${mediaId}`,
      {
        method: "DELETE",
      }
    );
  },

  // Step 3 — amenities
  saveAmenities(
    draftId: string,
    body: AmenitiesData
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/amenities`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 4 — screening
  saveScreeningCriteria(
    draftId: string,
    body: {
      arePetsAllowed: boolean | null;
      petPolicyNegotiable: boolean | null;
      minimumIncomeToRentRatio: number | null;
      incomeToRentRatioNegotiable: boolean | null;
      minimumMonthlyPreTaxIncome: number | null;
      minimumCreditScore: number | null;
      creditScoreNegotiable: boolean | null;
    }
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/screening-criteria`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 5 — mark costs & fees step complete (empty body)
  saveCostsAndFeesStep(draftId: string): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/costs-and-fees`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  },

  // Step 5 — create fee (immediate)
  createFee(draftId: string, body: CreateFeeBody): Promise<PropertyFee> {
    return apiClient<PropertyFee>(
      `/listings/rent/drafts/${draftId}/fees`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 5 — update fee (immediate)
  updateFee(
    draftId: string,
    feeId: string,
    body: UpdateFeeBody
  ): Promise<PropertyFee> {
    return apiClient<PropertyFee>(
      `/listings/rent/drafts/${draftId}/fees/${feeId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 5 — delete fee (immediate)
  deleteFee(draftId: string, feeId: string): Promise<void> {
    return apiClient<void>(
      `/listings/rent/drafts/${draftId}/fees/${feeId}`,
      {
        method: "DELETE",
      }
    );
  },

  // Step 6 — final details
  saveFinalDetails(
    draftId: string,
    body: Omit<FinalDetailsData, never>
  ): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/final-details`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  },

  // Step 7 — review (GET on mount)
  getReview(draftId: string): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/review`,
      {
        method: "GET",
      }
    );
  },

  // Step 8 — publish
  publish(draftId: string): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}/publish`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );
  },

  // Resume — get draft by id
  getDraft(draftId: string): Promise<RentDraftResponse> {
    return apiClient<RentDraftResponse>(
      `/listings/rent/drafts/${draftId}`,
      {
        method: "GET",
      }
    );
  },
};
