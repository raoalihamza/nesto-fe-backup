"use client";

import Image from "next/image";
import { Pencil, Archive, Home, Trash2, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ListingStatusBadge } from "@/components/owner/ListingStatusBadge";
import { formatListingPrice, formatListingLocation } from "@/lib/utils/listingDisplay";
import { LISTING_NO_THUMBNAIL_PLACEHOLDER } from "@/lib/constants/listingPlaceholders";
import type { MyListingItem } from "@/types/listings";

function isDraft(listing: MyListingItem) {
  return listing.status.toLowerCase() === "draft";
}

function isArchived(listing: MyListingItem) {
  return listing.status.toLowerCase() === "archived";
}

/** Published sale/rent listings are editable (excluding draft/archived/sold). */
function canEditPublishedListing(listing: MyListingItem) {
  const status = (listing.status ?? "").toLowerCase();
  if (status === "draft" || status === "archived" || status === "sold") {
    return false;
  }
  const type = (listing.listingType ?? "").toString().toLowerCase();
  return type === "sale" || type === "rent";
}

interface ListingTableProps {
  listings: MyListingItem[];
  onArchive?: (listing: MyListingItem) => void;
  onEditDraft?: (listing: MyListingItem) => void;
  onEditListing?: (listing: MyListingItem) => void;
  onDeleteDraft?: (listing: MyListingItem) => void;
  deletingDraftId?: string | null;
  archivingListingId?: string | null;
}

export function ListingTable({
  listings,
  onArchive,
  onEditDraft,
  onEditListing,
  onDeleteDraft,
  deletingDraftId,
  archivingListingId,
}: ListingTableProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-0 table-fixed border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {/* % width uses remaining table space; max-width caps so truncate + tooltip stay meaningful */}
            <th className="min-w-0 w-[30%] max-w-[320px] overflow-hidden bg-muted/50 px-4 py-3 font-semibold">
              {t("propertyInformation")}
            </th>
            <th className="w-[82px] whitespace-nowrap bg-muted/50 px-2 py-3 font-semibold">
              {t("status")}
            </th>
            <th className="w-[88px] whitespace-nowrap bg-muted/50 px-2 py-3 font-semibold">
              {t("lease")}
            </th>
            <th className="w-[86px] whitespace-nowrap bg-muted/50 px-2 py-3 font-semibold">
              {t("published")}
            </th>
            <th className="w-[104px] whitespace-nowrap bg-muted/50 px-2 py-3 font-semibold">
              {t("price")}
            </th>
            <th className="w-[80px] whitespace-nowrap bg-muted/50 px-2 py-3 font-semibold">
              {t("action")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {listings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Home className="size-10 opacity-30" />
                  <p className="text-sm font-medium">{t("noListings")}</p>
                </div>
              </td>
            </tr>
          )}
          {listings.map((listing) => {
            const addressLine = formatListingLocation(listing.location);
            return (
            <tr key={listing.id} className="group">
              <td className="min-w-0 w-[24%] max-w-[280px] overflow-hidden px-4 py-4 align-middle">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={
                        listing.thumbnailUrl ??
                        LISTING_NO_THUMBNAIL_PLACEHOLDER
                      }
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="min-w-0 w-full flex-1 cursor-default overflow-hidden text-left">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {listing.title}
                      </p>
                      <p className="truncate text-xs text-[#0A0A0A]">
                        {addressLine}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-sm whitespace-normal text-xs">
                      <p className="font-semibold text-background">{listing.title}</p>
                      <p className="mt-1 text-background/90">{addressLine}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className="px-2 py-4 align-middle">
                <ListingStatusBadge
                  statusLabel={listing.statusLabel}
                  statusTone={listing.statusTone}
                  statusValue={listing.status}
                />
              </td>
              <td className="whitespace-nowrap px-2 py-4 align-middle">
                <p className="text-sm text-foreground">
                  {listing.leaseDuration
                    ? listing.leaseDuration
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : "—"}
                </p>
              </td>
              <td className="whitespace-nowrap px-2 py-4 align-middle">
                <p className="text-sm text-foreground">
                  {listing.publishedAt
                    ? new Date(listing.publishedAt).toLocaleDateString(locale)
                    : "—"}
                </p>
              </td>
              <td className="whitespace-nowrap px-2 py-4 align-middle">
                <p className="text-sm text-foreground">
                  {formatListingPrice(listing.pricing)}
                </p>
              </td>
              <td className="whitespace-nowrap px-2 py-4 align-middle">
                <div className="flex gap-1">
                  {isDraft(listing) ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger
                          type="button"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                          onClick={() => onEditDraft?.(listing)}
                        >
                          <Pencil className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent side="top">{tCommon("edit")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          type="button"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => onDeleteDraft?.(listing)}
                          disabled={deletingDraftId === listing.id}
                          aria-label={t("deleteDraft")}
                        >
                          {deletingDraftId === listing.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="top">{t("deleteDraft")}</TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      {canEditPublishedListing(listing) && (
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                            onClick={() => onEditListing?.(listing)}
                            aria-label={tCommon("edit")}
                          >
                            <Pencil className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent side="top">{tCommon("edit")}</TooltipContent>
                        </Tooltip>
                      )}
                      {listing.actionFlags.canArchive ? (
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => onArchive?.(listing)}
                            disabled={archivingListingId === listing.id}
                            aria-label={t("archive")}
                          >
                            {archivingListingId === listing.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Archive className="size-4" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="top">{t("archive")}</TooltipContent>
                        </Tooltip>
                      ) : isArchived(listing) || canEditPublishedListing(listing) ? null : (
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                            aria-label={tCommon("edit")}
                          >
                            <Pencil className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent side="top">{tCommon("edit")}</TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  )}
                  {/* View (Eye): not wired yet — import Eye; mirror other actions with Tooltip + TooltipContent {t("view")}
                  <Tooltip>
                    <TooltipTrigger type="button" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                      <Eye className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent side="top">{t("view")}</TooltipContent>
                  </Tooltip>
                  */}
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
