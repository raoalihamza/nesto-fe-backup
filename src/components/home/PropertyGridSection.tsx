"use client";

import { useTranslations, useLocale } from "next-intl";
import { PropertyCard } from "@/components/property/PropertyCard";
import { mapPublicFeedItemToPropertyCard } from "@/lib/api/listings.service";
import { usePublicListingFeed } from "@/hooks/listings";

interface PropertyGridSectionProps {
  page: number;
  limit?: number;
  showHeading?: boolean;
}

export function PropertyGridSection({
  page,
  limit = 8,
  showHeading = false,
}: PropertyGridSectionProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const { data, isLoading, isError } = usePublicListingFeed({
    page,
    limit,
    locale,
  });

  const items =
    data?.items.map((raw) => mapPublicFeedItemToPropertyCard(raw)) ?? [];

  return (
    <section className="mx-auto max-w-7xl px-0 py-10 md:py-14">
      {showHeading && (
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
          {t("seeCoolPlaces")}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: limit }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            >
              <div className="aspect-4/3 animate-pulse bg-muted" />
              <div className="space-y-2 px-4 pb-4 pt-3">
                <div className="h-6 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        {!isLoading &&
          !isError &&
          items.map((property) => (
            <PropertyCard key={property.id} item={property} />
          ))}
      </div>
    </section>
  );
}
