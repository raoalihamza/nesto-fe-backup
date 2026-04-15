import { apiClient } from "@/lib/api/client";
import type {
  SavedHomesResponse,
  MyListingsResponse,
  PublicListingsFeedResponse,
  PropertyCardItem,
  PublicListingFeedApiItem,
} from "@/types/listings";

export function mapPublicFeedItemToPropertyCard(
  item: PublicListingFeedApiItem
): PropertyCardItem {
  const listingTypeUpper = item.listingType.toUpperCase();
  const listingType: PropertyCardItem["listingType"] =
    listingTypeUpper === "SALE" ? "sale" : "rent";

  const city = item.location.city ?? "";
  const state = item.location.stateCode ?? "";
  const parts = [city, state].filter(Boolean);
  const displayAddress =
    item.location.summary?.trim() ||
    (parts.length ? parts.join(", ") : null);

  const suffix =
    item.pricing.billingPeriod === "month" ? "/mo" : undefined;

  const basicFacts = item.basicFacts
    ? {
        bedrooms: item.basicFacts.bedrooms ?? undefined,
        bathrooms: item.basicFacts.bathrooms ?? undefined,
        squareFootage: item.basicFacts.areaSqft ?? undefined,
      }
    : undefined;

  return {
    id: item.id,
    listingType,
    status: item.status,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    propertyType: item.propertyType?.trim() || null,
    location: {
      formattedAddress: item.location.formattedAddress?.trim() || null,
      city: city || null,
      state: state || null,
      displayAddress,
      countryCode: item.location.countryCode,
      stateCode: item.location.stateCode,
      summary: item.location.summary,
    },
    pricing: {
      amount: item.pricing.amount,
      currencyCode: item.pricing.currencyCode,
      suffix: suffix ?? null,
      billingPeriod: item.pricing.billingPeriod,
    },
    basicFacts,
    leaseDuration: item.leaseDuration ?? null,
    isSaved: item.isSaved,
    owner: {
      id: item.owner.id,
      name: item.owner.fullName,
    },
  };
}

export const listingsService = {
  async getPublicListingFeed(params?: {
    page?: number;
    limit?: number;
    locale?: string;
  }): Promise<PublicListingsFeedResponse> {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.append("page", String(params.page));
    if (params?.limit !== undefined)
      search.append("limit", String(params.limit));
    if (params?.locale !== undefined)
      search.append("locale", params.locale);
    const query = search.toString();
    return apiClient<PublicListingsFeedResponse>(
      `/listings/feed${query ? `?${query}` : ""}`
    );
  },

  async getSavedHomes(
    params?: { page?: number; limit?: number; locale?: string }
  ): Promise<SavedHomesResponse> {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.append("page", String(params.page));
    if (params?.limit !== undefined) search.append("limit", String(params.limit));
    if (params?.locale !== undefined) search.append("locale", params.locale);
    const query = search.toString();
    return apiClient<SavedHomesResponse>(
      `/listings/me/saved-homes${query ? `?${query}` : ""}`
    );
  },

  async saveListing(listingId: string): Promise<void> {
    return apiClient<void>(`/listings/${listingId}/save`, { method: "POST" });
  },

  async unsaveListing(listingId: string): Promise<void> {
    return apiClient<void>(`/listings/${listingId}/save`, { method: "DELETE" });
  },

  async archiveListing(listingId: string, locale?: string): Promise<unknown> {
    const query = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    return apiClient<unknown>(`/listings/${listingId}/archive${query}`, {
      method: "POST",
    });
  },

  async deleteRentDraft(
    rentListingId: string
  ): Promise<{ deleted: boolean }> {
    return apiClient<{ deleted: boolean }>(
      `/listings/rent/drafts/${rentListingId}`,
      {
        method: "DELETE",
      }
    );
  },

  async getMyListings(params?: {
    tab?:
      | "overview"
      | "my-listing"
      | "all"
      | "for-rent"
      | "for-sale"
      | "draft"
      | "archived"
      | "sold";
    page?: number;
    limit?: number;
    locale?: string;
  }): Promise<MyListingsResponse> {
    const search = new URLSearchParams();
    if (params?.tab !== undefined) search.append("tab", params.tab);
    if (params?.page !== undefined) search.append("page", String(params.page));
    if (params?.limit !== undefined) search.append("limit", String(params.limit));
    if (params?.locale !== undefined) search.append("locale", params.locale);
    const query = search.toString();
    return apiClient<MyListingsResponse>(
      `/listings/me${query ? `?${query}` : ""}`
    );
  },
};
