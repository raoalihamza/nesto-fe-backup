import type { PropertyCardPricing, PropertyCardLocation } from "@/types/listings";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  UZS: "soʻm",
  RUB: "₽",
};

const BILLING_SUFFIXES: Record<string, string> = {
  month: "/mo",
  year: "/yr",
  week: "/wk",
  day: "/day",
};

export function getCurrencySymbol(pricing: PropertyCardPricing): string {
  const code = pricing.currencyCode ?? pricing.currency;
  if (!code) return "";
  return CURRENCY_SYMBOLS[code] ?? code;
}

export function getBillingSuffix(pricing: PropertyCardPricing): string {
  if (pricing.suffix) return pricing.suffix;
  if (pricing.billingPeriod) return BILLING_SUFFIXES[pricing.billingPeriod] ?? "";
  return "";
}

export function formatListingPrice(pricing: PropertyCardPricing): string {
  if (!pricing.amount || isNaN(parseFloat(pricing.amount))) return "—";
  const symbol = getCurrencySymbol(pricing);
  const amount = parseFloat(pricing.amount).toLocaleString();
  const suffix = getBillingSuffix(pricing);
  return `${symbol} ${amount}${suffix}`;
}

export function formatListingLocation(location: PropertyCardLocation): string {
  if (location.displayAddress) return location.displayAddress;
  if (location.summary) return location.summary;
  const parts = [
    location.city,
    location.state ?? location.stateCode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

/** Title-case each word for dashboard subtitle fragments. */
function capitalizeDashboardLabel(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  return t
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Owner dashboard line under address `title`:
 * `{PropertyType} {ListingType} in {formatListingLocation}` — labels space-separated (no comma), then lowercase "in".
 */
export function formatMyListingSubtitle(
  display:
    | { propertyTypeLabel?: string | null; listingTypeLabel?: string | null }
    | null
    | undefined,
  location: PropertyCardLocation,
): string {
  const loc = formatListingLocation(location);
  const parts = [
    capitalizeDashboardLabel(display?.propertyTypeLabel),
    capitalizeDashboardLabel(display?.listingTypeLabel),
  ].filter(Boolean) as string[];
  const labelPart = parts.join(" ");
  if (!labelPart) return loc;
  return `${labelPart} in ${loc}`;
}
