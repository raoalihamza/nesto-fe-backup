// Display-time interfaces — matches backend feed/card API response shape

export interface PropertyCardLocation {
  /** Full single-line address from API when available (preferred for display). */
  formattedAddress?: string | null;
  displayAddress?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  // API also returns these fields
  addressLine1?: string | null;
  stateCode?: string | null;
  countryCode?: string | null;
  summary?: string | null;
}

export interface PropertyCardPricing {
  amount: string;       // decimal string e.g. "5400.00"
  currency?: string;     // e.g. "USD"
  currencyCode?: string; // API returns this instead of currency
  suffix?: string | null; // e.g. "/mo" for rent
  billingPeriod?: string | null; // API returns this e.g. "month"
}

export interface PropertyCardBasicFacts {
  bedrooms?: number | null;
  bathrooms?: string | null; // backend returns as decimal string
  totalHalfBathrooms?: number | null;
  squareFootage?: number | null;
}

export interface PropertyCardItem {
  id: string;
  listingType: "rent" | "sale";
  status: string;
  title: string;
  thumbnailUrl: string | null;
  location: PropertyCardLocation;
  pricing: PropertyCardPricing;
  leaseDuration?: string | null;
  basicFacts?: PropertyCardBasicFacts;
  /** When omitted, PropertyCard uses a static placeholder (e.g. Condo) until the API sends it. */
  propertyType?: string | null;
  isSaved?: boolean;
  savedAt?: string | null;
  tag?: string | null;
  owner?: {
    id?: string;
    name?: string;
  };
}

// API response wrappers

export interface ListingsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface SavedHomesResponse {
  pagination: ListingsPagination;
  items: PropertyCardItem[];
}

/** Feed `basicFacts` shape (API uses `areaSqft`; we map to `PropertyCardBasicFacts.squareFootage`). */
export interface PublicListingFeedBasicFacts {
  bedrooms?: number | null;
  bathrooms?: string | null;
  totalHalfBathrooms?: number | null;
  areaSqft?: number | null;
}

/** Raw item from `GET /listings/feed` (optional `isSaved` when Bearer token is sent). */
export interface PublicListingFeedApiItem {
  id: string;
  listingType: string;
  status: string;
  propertyType?: string | null;
  title: string;
  thumbnailUrl: string | null;
  location: {
    formattedAddress?: string | null;
    summary?: string | null;
    city?: string | null;
    stateCode?: string | null;
    countryCode?: string | null;
  };
  pricing: {
    amount: string;
    currencyCode: string;
    billingPeriod?: string | null;
  };
  basicFacts?: PublicListingFeedBasicFacts | null;
  leaseDuration?: string | null;
  owner: {
    id: string;
    fullName: string;
  };
  publishedAt?: string;
  isSaved?: boolean;
}

export interface PublicListingsFeedResponse {
  pagination: ListingsPagination;
  items: PublicListingFeedApiItem[];
}

export interface MyListingActionFlags {
  canArchive: boolean;
}

export interface MyListingsCounts {
  all: number;
  forRent: number;
  forSale: number;
  draft: number;
  archived: number;
  sold: number;
}

/** Owner `/listings/me` display labels — optional on older payloads. */
export interface MyListingDisplay {
  propertyTypeLabel?: string | null;
  listingTypeLabel?: string | null;
  cardTitleLabel?: string | null;
}

export interface MyListingItem {
  id: string;
  listingType: "rent" | "sale";
  status: string;
  statusLabel: string;
  statusTone: string;
  title: string;
  display?: MyListingDisplay | null;
  thumbnailUrl: string | null;
  actionFlags: MyListingActionFlags;
  location: PropertyCardLocation;
  pricing: PropertyCardPricing;
  leaseDuration: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyListingsResponse {
  tab: string;
  counts: MyListingsCounts;
  pagination: ListingsPagination;
  items: MyListingItem[];
}
