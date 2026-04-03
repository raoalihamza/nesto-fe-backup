"use client";

import { useTranslations } from "next-intl";
import { PropertyCard } from "@/components/property/PropertyCard";
import { DUMMY_PROPERTY_PREVIEWS } from "@/lib/constants/dummyProperties";

interface PropertyGridSectionProps {
  startIndex: number;
  count: number;
  showHeading?: boolean;
}

export function PropertyGridSection({
  startIndex,
  count,
  showHeading = false,
}: PropertyGridSectionProps) {
  const t = useTranslations("home");

  const items = DUMMY_PROPERTY_PREVIEWS.slice(startIndex, startIndex + count);
  const displayItems =
    items.length < count
      ? [...items, ...DUMMY_PROPERTY_PREVIEWS.slice(0, count - items.length)]
      : items;

  return (
    <section className="mx-auto max-w-7xl px-0 py-10 md:py-14">
      {showHeading && (
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
          {t("seeCoolPlaces")}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {displayItems.map((property, i) => (
          <PropertyCard key={`${property.id}-${i}`} property={property} />
        ))}
      </div>
    </section>
  );
}
