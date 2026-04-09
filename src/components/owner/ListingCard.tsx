"use client";

import Image from "next/image";
import { Pencil, Eye, Archive } from "lucide-react";
import { useTranslations } from "next-intl";

import { ListingStatusBadge } from "@/components/owner/ListingStatusBadge";
import { formatListingPrice, formatListingLocation } from "@/lib/utils/listingDisplay";
import type { MyListingItem } from "@/types/listings";

function isDraft(listing: MyListingItem) {
  return listing.status.toLowerCase() === "draft";
}

interface ListingCardProps {
  listing: MyListingItem;
  onArchive?: (id: string) => void;
  onEditDraft?: (listing: MyListingItem) => void;
}

export function ListingCard({ listing, onArchive, onEditDraft }: ListingCardProps) {
  const t = useTranslations("property");

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
            {isDraft(listing) ? (
              <button
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onEditDraft?.(listing)}
              >
                <Pencil className="size-3.5" />
              </button>
            ) : listing.actionFlags.canArchive ? (
              <button
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onArchive?.(listing.id)}
              >
                <Archive className="size-3.5" />
              </button>
            ) : (
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Pencil className="size-3.5" />
              </button>
            )}
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Eye className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("forRent").split(" ").pop()}
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatListingPrice(listing.pricing)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("leaseDuration")}
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
