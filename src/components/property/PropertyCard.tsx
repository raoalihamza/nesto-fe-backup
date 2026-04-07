"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { PropertyPreview } from "@/types/property";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PropertyCardProps {
  property: PropertyPreview;
  className?: string;
  isFavorite?: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({ property, className, isFavorite }: PropertyCardProps) {
  const t = useTranslations("property");

  const price =
    property.listingType === "rent"
      ? property.monthlyRent
      : property.salePrice;

  const typeLabel =
    property.propertyType.charAt(0).toUpperCase() +
    property.propertyType.slice(1);

  const statusLabel =
    property.listingType === "rent" ? t("forRent") : t("forSale");

  const addressLine = property.address.hideAddress
    ? `${property.address.city}, ${property.address.state}`
    : `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`;

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn("group block", className)}
    >
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl bg-gray-200">
          <Image
            src={property.coverPhoto}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Tag pill — top left */}
          {property.tag && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              {property.tag}
            </span>
          )}

          {/* Heart — top right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center"
          >
            <Heart
              className={cn(
                "h-6 w-5 stroke-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "fill-transparent text-white"
              )}
            />
          </button>

          {/* Image pager dots */}
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === 0 ? "bg-white" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1 px-4 pb-4 pt-3">
          {/* Price */}
          <p className="text-xl leading-none font-bold text-[#2d2d3a]">
            {price ? formatPrice(price) : "—"}
          </p>

          {/* Beds · Baths · Sqft */}
          <Tooltip>
            <TooltipTrigger>
              <p className="truncate text-xs text-[#2d2d3a]/90 cursor-pointer">
                {property.bedrooms} {t("beds").toLowerCase()} |{" "}
                {property.bathrooms} {t("baths").toLowerCase()} |{" "}
                {property.squareFootage
                  ? `${property.squareFootage.toLocaleString()} ${t("sqft")}`
                  : `-- ${t("sqft")}`}{" "}
                | {typeLabel} {statusLabel.toLowerCase()}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>
                {property.bedrooms} {t("beds").toLowerCase()} |{" "}
                {property.bathrooms} {t("baths").toLowerCase()} |{" "}
                {property.squareFootage
                  ? `${property.squareFootage.toLocaleString()} ${t("sqft")}`
                  : `-- ${t("sqft")}`}{" "}
                | {typeLabel} {statusLabel.toLowerCase()}
              </p>
              <p>{addressLine}</p>
            </TooltipContent>
          </Tooltip>

          {/* Address */}
          <p className="truncate text-xs text-[#2d2d3a]/90">{addressLine}</p>

          {/* Listing by */}
          <p className="pt-0.5 text-[11px] font-medium tracking-wide text-[#5f6d87] uppercase">
            {t("listingBy", { name: property.contactName })}
          </p>
        </div>
      </div>
    </Link>
  );
}
