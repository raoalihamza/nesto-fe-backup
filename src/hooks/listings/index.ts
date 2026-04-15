import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { listingsService } from "@/lib/api/listings.service";
import { toast } from "sonner";
import type { MyListingsResponse } from "@/types/listings";
import { useAppSelector } from "@/store";

export const SAVED_HOMES_QUERY_KEY = ["saved-homes"] as const;
export const MY_LISTINGS_QUERY_KEY = ["my-listings"] as const;
export const LISTINGS_FEED_QUERY_KEY = ["listings-feed"] as const;

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

export function usePublicListingFeed(
  params?: { page?: number; limit?: number; locale?: string },
  options?: { enabled?: boolean }
) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: [...LISTINGS_FEED_QUERY_KEY, params, isAuthenticated],
    queryFn: () => listingsService.getPublicListingFeed(params),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard");
  return useMutation({
    mutationFn: (listingId: string) => listingsService.saveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_HOMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LISTINGS_FEED_QUERY_KEY });
    },
    onError: () => {
      toast.error(t("saveFailed"));
    },
  });
}

export function useUnsaveListing() {
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard");
  return useMutation({
    mutationFn: (listingId: string) => listingsService.unsaveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_HOMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LISTINGS_FEED_QUERY_KEY });
    },
    onError: () => {
      toast.error(t("unsaveFailed"));
    },
  });
}

export function useMyListings(
  params?: {
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

export function useInfiniteMyListings(
  params?: {
    tab?:
      | "overview"
      | "my-listing"
      | "all"
      | "for-rent"
      | "for-sale"
      | "draft"
      | "archived"
      | "sold";
    limit?: number;
    locale?: string;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery<MyListingsResponse>({
    queryKey: [...MY_LISTINGS_QUERY_KEY, "infinite", params],
    queryFn: ({ pageParam }) =>
      listingsService.getMyListings({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useArchiveListing() {
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard");
  return useMutation({
    mutationFn: ({
      listingId,
      locale,
    }: {
      listingId: string;
      locale?: string;
    }) => listingsService.archiveListing(listingId, locale),
    onSuccess: () => {
      toast.success(t("listingArchived"));
      queryClient.invalidateQueries({ queryKey: MY_LISTINGS_QUERY_KEY });
    },
    onError: () => {
      toast.error(t("archiveFailed"));
    },
  });
}

export function useDeleteRentDraftListing() {
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard");
  return useMutation({
    mutationFn: ({ listingId }: { listingId: string }) =>
      listingsService.deleteRentDraft(listingId),
    onSuccess: () => {
      toast.success(t("draftDeleted"));
      queryClient.invalidateQueries({ queryKey: MY_LISTINGS_QUERY_KEY });
    },
    onError: () => {
      toast.error(t("draftDeleteFailed"));
    },
  });
}
