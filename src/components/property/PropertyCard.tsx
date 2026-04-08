"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import type { PropertyCardItem } from "@/types/listings";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/store";
import { useSaveListing, useUnsaveListing } from "@/hooks/listings";

interface PropertyCardProps {
  item: PropertyCardItem;
  className?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({ item, className }: PropertyCardProps) {
  const t = useTranslations("property");
  const [isSaved, setIsSaved] = useState(item.isSaved ?? false);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const saveMutation = useSaveListing();
  const unsaveMutation = useUnsaveListing();

  const priceNum = parseFloat(item.pricing.amount);
  const priceDisplay = isNaN(priceNum)
    ? "—"
    : `${formatPrice(priceNum)}${item.pricing.suffix ?? ""}`;

  const addressLine =
    item.location.displayAddress ??
    `${item.location.city}, ${item.location.state}`;

  const statusLabel =
    item.listingType === "rent" ? t("forRent") : t("forSale");

  const beds = item.basicFacts?.bedrooms ?? "--";
  const baths = item.basicFacts?.bathrooms ?? "--";
  const sqft = item.basicFacts?.squareFootage;

  return (
    <Link
      href={`/property/${item.id}`}
      className={cn("group block", className)}
    >
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl bg-gray-200">
          <Image
            src={item.thumbnailUrl ?? "/images/property.jpg"}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Tag pill — top left */}
          {item.tag && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              {item.tag}
            </span>
          )}

          {/* Heart — top right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                toast.info("Sign in to save homes");
                return;
              }
              if (isSaved) {
                setIsSaved(false);
                unsaveMutation.mutate(item.id, {
                  onError: () => setIsSaved(true),
                });
              } else {
                setIsSaved(true);
                saveMutation.mutate(item.id, {
                  onError: () => setIsSaved(false),
                });
              }
            }}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center"
          >
            <Heart
              className={cn(
                "h-6 w-5 stroke-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
                isSaved
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
            {priceDisplay}
          </p>

          {/* Beds · Baths · Sqft */}
          <Tooltip>
            <TooltipTrigger>
              <p className="truncate text-xs text-[#2d2d3a]/90 cursor-pointer">
                {beds} {t("beds").toLowerCase()} |{" "}
                {baths} {t("baths").toLowerCase()} |{" "}
                {sqft
                  ? `${sqft.toLocaleString()} ${t("sqft")}`
                  : `-- ${t("sqft")}`}{" "}
                | {statusLabel.toLowerCase()}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>
                {beds} {t("beds").toLowerCase()} |{" "}
                {baths} {t("baths").toLowerCase()} |{" "}
                {sqft
                  ? `${sqft.toLocaleString()} ${t("sqft")}`
                  : `-- ${t("sqft")}`}{" "}
                | {statusLabel.toLowerCase()}
              </p>
              <p>{addressLine}</p>
            </TooltipContent>
          </Tooltip>

          {/* Address */}
          <p className="truncate text-xs text-[#2d2d3a]/90">{addressLine}</p>

          {/* Listing by */}
          <p className="pt-0.5 text-[11px] font-medium tracking-wide text-[#5f6d87] uppercase">
            {t("listingBy", { name: item.owner?.name ?? "" })}
          </p>
        </div>
      </div>
    </Link>
  );
}
