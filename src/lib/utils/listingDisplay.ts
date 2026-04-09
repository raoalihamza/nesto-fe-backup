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
