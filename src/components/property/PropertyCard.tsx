"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { toast } from "sonner";
// import { Link } from "@/i18n/routing";
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

/** Static fallbacks when the feed omits facts — keeps the specs row visually complete. */
const FALLBACK_BEDS = "1";
const FALLBACK_BATHS = "1";

function formatBathDisplay(raw: string | undefined | null): string {
  if (raw == null || raw === "") return FALLBACK_BATHS;
  const n = Number.parseFloat(raw);
  if (!Number.isNaN(n) && Number.isInteger(n)) return String(n);
  return raw;
}

/** API values like `house`, `town_house` → display label. */
function formatPropertyTypeLabel(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  return s
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function PropertyCard({ item, className }: PropertyCardProps) {
  const t = useTranslations("property");
  const [isSaved, setIsSaved] = useState(item.isSaved ?? false);
  const [prevId, setPrevId] = useState(item.id);
  const [prevIsSaved, setPrevIsSaved] = useState(item.isSaved);
  if (prevId !== item.id || prevIsSaved !== item.isSaved) {
    setPrevId(item.id);
    setPrevIsSaved(item.isSaved);
    setIsSaved(item.isSaved ?? false);
  }
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const saveMutation = useSaveListing();
  const unsaveMutation = useUnsaveListing();

  const priceNum = parseFloat(item.pricing.amount);
  const priceDisplay = isNaN(priceNum)
    ? "—"
    : `${formatPrice(priceNum)}${item.pricing.suffix ?? ""}`;

  const cityState = [
    item.location.city,
    item.location.stateCode ?? item.location.state,
  ]
    .filter((x) => x != null && String(x).trim() !== "")
    .join(", ");
  const addressLine =
    item.location.formattedAddress?.trim() ||
    item.location.displayAddress?.trim() ||
    cityState ||
    "245 E 90th St APT 4D, New York, NY 10128";

  const statusForSpecs =
    item.listingType === "rent" ? t("forRentSpecs") : t("forSaleSpecs");

  const bedsDisplay =
    item.basicFacts?.bedrooms != null
      ? String(item.basicFacts.bedrooms)
      : FALLBACK_BEDS;

  const bathsDisplay = formatBathDisplay(item.basicFacts?.bathrooms);

  const sqftDisplay =
    item.basicFacts?.squareFootage != null
      ? item.basicFacts.squareFootage.toLocaleString()
      : "--";

  const propertyTypeDisplay = item.propertyType?.trim()
    ? formatPropertyTypeLabel(item.propertyType)
    : t("defaultPropertyType");

  const specsLine = `${bedsDisplay} ${t("bdAbbr")} | ${bathsDisplay} ${t("baAbbr")} | ${sqftDisplay} ${t("sqft")} | ${propertyTypeDisplay} ${statusForSpecs}`;

  const ownerName = item.owner?.name?.trim() ?? "";

  return (
    // TODO: uncomment <Link> and remove <div> wrapper when property detail page is ready
    // <Link href={`/property/${item.id}`} className={cn("group block", className)}>
    <div className={cn("group block", className)}>
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
            type="button"
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
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
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

        </div>

        {/* Details */}
        <div className="px-4 pb-4 pt-3">
          {/* Price */}
          <p className="text-lg font-bold leading-tight text-[#1a1a2e]">
            {priceDisplay}
          </p>

          {/* Specs + Address with tooltip */}
          <Tooltip>
            <TooltipTrigger className="mt-1.5 block w-full text-left">
              <p className="truncate text-[13px] leading-normal text-[#6b7280]">
                {specsLine}
              </p>
              <p className="mt-0.5 truncate text-[13px] leading-normal text-[#374151]">
                {addressLine}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>{specsLine}</p>
              <p>{addressLine}</p>
            </TooltipContent>
          </Tooltip>

          {/* LISTING BY: Name */}
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
            {t("listingByLabel")}
            {ownerName ? (
              <span> {ownerName}</span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
    // </Link>
  );
}
