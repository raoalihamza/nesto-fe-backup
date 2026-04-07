"use client";

import Image from "next/image";
import { Pencil, Eye } from "lucide-react";

import { ListingStatusBadge } from "@/components/owner/ListingStatusBadge";

interface Listing {
  id: string;
  title: string;
  address: string;
  status: "active" | "pending" | "rented" | "archived" | "sold" | "drafted";
  listingType?: "rent" | "sale";
  rent: number | null;
  salePrice?: number | null;
  leaseDuration: string;
  image: string;
}

interface ListingTableProps {
  listings: Listing[];
}

export function ListingTable({ listings }: ListingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="bg-muted/50 px-4 py-3 font-semibold">Property Information</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Status</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Lease</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Lease</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Lease</th>
            <th className="bg-muted/50 px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {listings.map((listing) => (
            <tr key={listing.id} className="group">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={listing.image}
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
                      {listing.address}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <ListingStatusBadge status={listing.status} />
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">{listing.leaseDuration}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">{listing.leaseDuration}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">{listing.leaseDuration}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                    <Pencil className="size-4" />
                  </button>
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
