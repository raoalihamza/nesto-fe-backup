"use client";

import Image from "next/image";
import { Pencil, Archive, Trash2, Loader2, MoreHorizontal, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { ListingStatusBadge } from "@/components/owner/ListingStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatListingPrice, formatListingLocation } from "@/lib/utils/listingDisplay";
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

interface ListingCardProps {
  listing: MyListingItem;
  onArchive?: (listing: MyListingItem) => void;
  onEditDraft?: (listing: MyListingItem) => void;
  onEditListing?: (listing: MyListingItem) => void;
  onDeleteDraft?: (listing: MyListingItem) => void;
  deletingDraftId?: string | null;
  archivingListingId?: string | null;
}

export function ListingCard({
  listing,
  onArchive,
  onEditDraft,
  onEditListing,
  onDeleteDraft,
  deletingDraftId,
  archivingListingId,
}: ListingCardProps) {
  const tProperty = useTranslations("property");
  const tDashboard = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const isBusy = deletingDraftId === listing.id || archivingListingId === listing.id;

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={listing.thumbnailUrl ?? "/images/property.jpg"}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <ListingStatusBadge statusLabel={listing.statusLabel} statusTone={listing.statusTone} className="mb-1" />
            <h3 className="truncate text-sm font-semibold text-foreground">
              {listing.title}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {formatListingLocation(listing.location)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isBusy}
                aria-label={tDashboard("action")}
              >
                {isBusy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-3.5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-36">
                <DropdownMenuItem>
                  <Eye className="size-4" />
                  {tDashboard("view")}
                </DropdownMenuItem>
                {isDraft(listing) ? (
                  <>
                    <DropdownMenuItem onClick={() => onEditDraft?.(listing)}>
                      <Pencil className="size-4" />
                      {tCommon("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteDraft?.(listing)}
                    >
                      <Trash2 className="size-4" />
                      {tCommon("delete")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {canEditPublishedListing(listing) && (
                      <DropdownMenuItem onClick={() => onEditListing?.(listing)}>
                        <Pencil className="size-4" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                    )}
                    {listing.actionFlags.canArchive ? (
                      <DropdownMenuItem onClick={() => onArchive?.(listing)}>
                        <Archive className="size-4" />
                        {tDashboard("archive")}
                      </DropdownMenuItem>
                    ) : isArchived(listing) || canEditPublishedListing(listing) ? null : (
                      <DropdownMenuItem disabled>
                        {tDashboard("action")}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {tProperty("forRent").split(" ").pop()}
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatListingPrice(listing.pricing)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {tProperty("leaseDuration")}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {listing.leaseDuration ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
