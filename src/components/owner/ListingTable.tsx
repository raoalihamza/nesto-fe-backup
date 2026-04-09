"use client";

import Image from "next/image";
import { Pencil, Eye, Archive, Home } from "lucide-react";

import { ListingStatusBadge } from "@/components/owner/ListingStatusBadge";
import { formatListingPrice, formatListingLocation } from "@/lib/utils/listingDisplay";
import type { MyListingItem } from "@/types/listings";

function isDraft(listing: MyListingItem) {
  return listing.status.toLowerCase() === "draft";
}

interface ListingTableProps {
  listings: MyListingItem[];
  onArchive?: (id: string) => void;
  onEditDraft?: (listing: MyListingItem) => void;
}

export function ListingTable({ listings, onArchive, onEditDraft }: ListingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="bg-muted/50 px-4 py-3 font-semibold">Property Information</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Status</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Lease</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Published</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Price</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {listings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Home className="size-10 opacity-30" />
                  <p className="text-sm font-medium">No listings to show</p>
                </div>
              </td>
            </tr>
          )}
          {listings.map((listing) => (
            <tr key={listing.id} className="group">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={listing.thumbnailUrl ?? "/images/property.jpg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {listing.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatListingLocation(listing.location)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <ListingStatusBadge statusLabel={listing.statusLabel} statusTone={listing.statusTone} />
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">{listing.leaseDuration ? listing.leaseDuration.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—"}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">
                  {listing.publishedAt
                    ? new Date(listing.publishedAt).toLocaleDateString()
                    : "—"}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">
                  {formatListingPrice(listing.pricing)}
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  {isDraft(listing) ? (
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      onClick={() => onEditDraft?.(listing)}
                    >
                      <Pencil className="size-4" />
                    </button>
                  ) : listing.actionFlags.canArchive ? (
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      onClick={() => onArchive?.(listing.id)}
                    >
                      <Archive className="size-4" />
                    </button>
                  ) : (
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                      <Pencil className="size-4" />
                    </button>
                  )}
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                    <Eye className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
