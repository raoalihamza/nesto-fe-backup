import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsService } from "@/lib/api/listings.service";
import { toast } from "sonner";

export const SAVED_HOMES_QUERY_KEY = ["saved-homes"] as const;
export const MY_LISTINGS_QUERY_KEY = ["my-listings"] as const;

export function useSavedHomes(
  params?: { page?: number; limit?: number; locale?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...SAVED_HOMES_QUERY_KEY, params],
    queryFn: () => listingsService.getSavedHomes(params),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => listingsService.saveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_HOMES_QUERY_KEY });
    },
    onError: () => {
      toast.error("Failed to save listing");
    },
  });
}

export function useUnsaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => listingsService.unsaveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_HOMES_QUERY_KEY });
    },
    onError: () => {
      toast.error("Failed to unsave listing");
    },
  });
}

export function useMyListings(
  params?: {
    tab?: "all" | "for-rent" | "for-sale" | "draft" | "archived" | "sold";
    page?: number;
    limit?: number;
    locale?: string;
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...MY_LISTINGS_QUERY_KEY, params],
    queryFn: () => listingsService.getMyListings(params),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useArchiveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      locale,
    }: {
      listingId: string;
      locale?: string;
    }) => listingsService.archiveListing(listingId, locale),
    onSuccess: () => {
      toast.success("Listing archived");
      queryClient.invalidateQueries({ queryKey: MY_LISTINGS_QUERY_KEY });
    },
    onError: () => {
      toast.error("Failed to archive listing");
    },
  });
}
