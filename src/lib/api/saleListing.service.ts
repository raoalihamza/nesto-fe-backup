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
};
