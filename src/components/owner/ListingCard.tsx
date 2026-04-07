"use client";

import Image from "next/image";
import { Pencil, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { ListingStatusBadge } from "@/components/owner/ListingStatusBadge";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    address: string;
    status: "active" | "pending" | "rented" | "archived" | "sold" | "drafted";
    listingType?: "rent" | "sale";
    rent: number | null;
    salePrice?: number | null;
    leaseDuration: string;
    image: string;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations("property");

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <ListingStatusBadge status={listing.status} className="mb-1" />
            <h3 className="truncate text-sm font-semibold text-foreground">
              {listing.title}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {listing.address}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Pencil className="size-3.5" />
            </button>
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
            {listing.listingType === "sale" && listing.salePrice ? (
              <p className="text-sm font-bold text-foreground">
                ${listing.salePrice.toLocaleString()}
              </p>
            ) : listing.rent ? (
              <p className="text-sm font-bold text-foreground">
                ${listing.rent.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("perMonth")}
                </span>
              </p>
            ) : (
              <p className="text-sm font-bold text-foreground">—</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("leaseDuration")}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {listing.leaseDuration}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
