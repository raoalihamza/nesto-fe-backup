// Display-time interfaces — matches backend feed/card API response shape

export interface PropertyCardLocation {
  displayAddress?: string | null;
  street?: string | null;
  city: string;
  state: string;
  country?: string | null;
}

export interface PropertyCardPricing {
  amount: string;       // decimal string e.g. "5400.00"
  currency: string;     // e.g. "USD"
  suffix?: string | null; // e.g. "/mo" for rent
}

export interface PropertyCardBasicFacts {
  bedrooms?: number | null;
  bathrooms?: string | null; // backend returns as decimal string
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

export interface MyListingActionFlags {
  canArchive: boolean;
}

export interface MyListingsCounts {
  all: number;
  forRent: number;
  archived: number;
  sold: number;
}

export interface MyListingItem {
  id: string;
  listingType: "rent" | "sale";
  status: string;
  statusLabel: string;
  statusTone: string;
  title: string;
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
