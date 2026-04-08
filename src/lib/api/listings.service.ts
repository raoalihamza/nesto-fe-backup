import { apiClient } from "@/lib/api/client";
import type { SavedHomesResponse, MyListingsResponse } from "@/types/listings";

export const listingsService = {
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

  async getMyListings(params?: {
    tab?: "all" | "for-rent" | "for-sale" | "draft" | "archived" | "sold";
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
