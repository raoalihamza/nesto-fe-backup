import { apiClient } from "@/lib/api/client";

/** Request body for POST /listings/sale/address-validate */
export interface SaleAddressValidateRequest {
  streetAddress: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
}

/** Success payload from address-validate; reuse for final sale `address`. */
export interface SaleValidatedAddress {
  formattedAddress: string;
  addressLine1: string;
  unit?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  isValid: boolean;
}

export interface SaleVerifyPhoneRequest {
  firebaseIdToken: string;
}

/** Minimal typing for final create; extend as backend schema grows. */
export interface CreateSaleListingRequest {
  address: SaleValidatedAddress;
  pricing: {
    askingPrice: number;
    currencyCode?: string;
  };
  media: {
    uploadIds: string[];
    virtualTourUrl?: string;
  };
  homeFacts: Record<string, unknown>;
  openHouses: Array<{ date: string; startTime: string; endTime: string }>;
  additionalInformation: Record<string, unknown>;
  roomDetails: Record<string, unknown>;
  utilityDetails: Record<string, unknown>;
  buildingDetails: Record<string, unknown>;
  contactInformation: { phoneNumber: string };
  consent: { listingTermsAccepted: boolean };
}

/**
 * Body for PUT /listings/sale/:listingId. Matches create request shape except:
 * - `address` is NOT sent (backend rejects unknown `address` key on edit).
 * - `media` must not include `uploadIds` (photos are managed via media APIs).
 * - `consent` is not sent on edit.
 */
export interface UpdateSaleListingRequest {
  pricing: {
    askingPrice: number;
    currencyCode?: string;
  };
  media: {
    virtualTourUrl?: string;
  };
  homeFacts: Record<string, unknown>;
  openHouses: Array<{ date: string; startTime: string; endTime: string }>;
  additionalInformation: Record<string, unknown>;
  roomDetails: Record<string, unknown>;
  utilityDetails: Record<string, unknown>;
  buildingDetails: Record<string, unknown>;
  contactInformation: { phoneNumber: string };
}

/** Shape returned by GET /listings/sale/:listingId/edit. Only fields the edit form reads are typed. */
export interface SaleListingEditResponse {
  id: string;
  location: {
    formattedAddress?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    unit?: string | null;
    city?: string | null;
    state?: string | null;
    stateCode?: string | null;
    postalCode?: string | null;
    countryCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  pricingMedia: {
    askingPrice?: number | string | null;
    currencyCode?: string | null;
    virtualTourUrl?: string | null;
  };
  homeFacts: {
    homeType?: string | null;
    hoaDues?: number | string | null;
    beds?: number | string | null;
    fullBaths?: number | string | null;
    threeQuarterBaths?: number | string | null;
    halfBaths?: number | string | null;
    quarterBaths?: number | string | null;
    basementSqFt?: number | string | null;
    garageSqFt?: number | string | null;
    finishedSquareFeet?: number | string | null;
    lotSize?: number | string | null;
    lotSizeUnit?: string | null;
    yearBuilt?: number | string | null;
    structuralRemodelYear?: number | string | null;
    homeDescription?: string | null;
  };
  openHouses?: Array<{
    date?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }> | null;
  additionalInformation?: {
    relatedWebsiteUrl?: string | null;
    whatILoveAboutThisHome?: string | null;
  } | null;
  roomDetails?: {
    appliances?: string[] | null;
    basement?: string[] | null;
    floorCovering?: string[] | null;
    rooms?: string[] | null;
    totalRooms?: number | string | null;
    indoorFeatures?: string[] | null;
  } | null;
  utilityDetails?: {
    coolingType?: string[] | null;
    heatingType?: string[] | null;
    heatingFuel?: string[] | null;
    electricType?: string[] | null;
    waterType?: string[] | null;
  } | null;
  buildingDetails?: {
    buildingAmenities?: string[] | null;
    architecturalStyle?: string | null;
    exterior?: string[] | null;
    outdoorAmenities?: string[] | null;
    numberOfStories?: number | string | null;
    parking?: string[] | null;
    parkingSpaces?: number | string | null;
    roof?: string[] | null;
    view?: string[] | null;
  } | null;
  contactInformation?: {
    phoneNumber?: string | null;
  } | null;
}

export const saleListingService = {
  validateAddress(body: SaleAddressValidateRequest): Promise<SaleValidatedAddress> {
    return apiClient<SaleValidatedAddress>("/listings/sale/address-validate", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  verifyPhone(body: SaleVerifyPhoneRequest): Promise<void> {
    return apiClient<void>("/listings/sale/verify-phone", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  createListing(body: CreateSaleListingRequest): Promise<unknown> {
    return apiClient<unknown>("/listings/sale", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getListingForEdit(listingId: string): Promise<SaleListingEditResponse> {
    return apiClient<SaleListingEditResponse>(
      `/listings/sale/${listingId}/edit`,
      { method: "GET" }
    );
  },

  updateListing(
    listingId: string,
    body: UpdateSaleListingRequest
  ): Promise<unknown> {
    return apiClient<unknown>(`/listings/sale/${listingId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};
