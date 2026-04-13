import { apiClient } from "@/lib/api/client";

export interface RentAddressSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

export interface RentAddressSearchResponse {
  suggestions: RentAddressSuggestion[];
  allowedCountries: string[];
}

export interface RentAddressDetailsResponse {
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateCode: string;
  postalCode: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
  placeId: string;
  allowedCountries: string[];
}

export const rentAddressService = {
  searchAddresses(
    query: string,
    signal?: AbortSignal
  ): Promise<RentAddressSearchResponse> {
    return apiClient<RentAddressSearchResponse>(
      "/listings/rent/address-search",
      {
        method: "POST",
        body: JSON.stringify({ query }),
        skipAuth: true,
        signal,
      }
    );
  },

  getAddressDetails(
    placeId: string,
    signal?: AbortSignal
  ): Promise<RentAddressDetailsResponse> {
    return apiClient<RentAddressDetailsResponse>(
      "/listings/rent/address-details",
      {
        method: "POST",
        body: JSON.stringify({ placeId }),
        skipAuth: true,
        signal,
      }
    );
  },
};
