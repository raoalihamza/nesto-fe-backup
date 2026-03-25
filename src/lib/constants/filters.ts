export const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "studio", label: "Studio" },
  { value: "loft", label: "Loft" },
  { value: "villa", label: "Villa" },
] as const;

export const BED_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
] as const;

export const BATH_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "sqft-asc", label: "Size: Small to Large" },
  { value: "sqft-desc", label: "Size: Large to Small" },
] as const;

export const PRICE_RANGES = {
  buy: {
    min: 0,
    max: 5000000,
    step: 50000,
  },
  rent: {
    min: 0,
    max: 20000,
    step: 100,
  },
} as const;
