export type ListingType = "rent" | "sale";
export type PropertyType = "house" | "apartment" | "condo" | "townhouse" | "land";
export type PropertyStatus = "active" | "pending" | "rented" | "sold" | "archived" | "draft";
export type ListedBy = "property_owner" | "management_company" | "tenant";

export type LaundryOption =
  | "washer_dryer_included"
  | "washer_dryer_hookups"
  | "shared_in_building"
  | "no_laundry";

export type CoolingOption = "central" | "wall" | "window";
export type HeatingOption = "baseboard" | "forced_air" | "heat_pump" | "wall";
export type ApplianceOption = "dishwasher" | "freezer" | "microwave" | "oven" | "refrigerator";
export type FlooringOption = "carpet" | "hardwood" | "tile";
export type ParkingOption = "attached_garage" | "detached_garage" | "off_street_parking";
export type OutdoorOption = "balcony_or_deck" | "pool";
export type AccessibilityOption = "disabled_access";

export interface PropertyAmenities {
  laundry: LaundryOption[];
  cooling: CoolingOption[];
  heating: HeatingOption[];
  appliances: ApplianceOption[];
  flooring: FlooringOption[];
  furnished: string[];
  parking: ParkingOption[];
  outdoorAmenities: OutdoorOption[];
  accessibility: AccessibilityOption[];
  otherAmenities: string[];
}

export type FeeCategory = "administrative" | "parking" | "utilities" | "other";
export type FeeFrequency =
  | "one_time"
  | "monthly"
  | "weekly"
  | "yearly"
  | "per_lease"
  | "per_occurrence"
  | "other";
export type FeeFormat = "fixed" | "percentage";
export type FeeRequiredType = "required" | "optional" | "situational";
export type FeeRefundability = "non_refundable" | "refundable" | null;

export interface PropertyFee {
  feeId: string;
  category: FeeCategory;
  feeName: string;
  paymentFrequency: FeeFrequency;
  feeFormat: FeeFormat;
  feeAmount: number;
  includedInRent?: boolean;
  feeRequiredType: FeeRequiredType;
  refundability?: FeeRefundability;
  description?: string;
  sortOrder?: number;
}

export interface PropertyContact {
  listedBy: ListedBy;
  name: string;
  email: string;
  phone: string | null;
  allowPhoneContact: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
}

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  hideAddress: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertyMedia {
  photos: string[];
  coverPhotoIndex: number;
  tourUrl: string | null;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  squareFootage: number | null;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number | null;
  securityDeposit: number | null;
  showTotalMonthlyPrice: boolean;
  fees: PropertyFee[];
  salePrice: number | null;
  dateAvailable: string;
  leaseDuration: string;
  leaseTerms: string;
  requireRentersInsurance: boolean;
  media: PropertyMedia;
  amenities: PropertyAmenities;
  contact: PropertyContact;
  acceptOnlineApplications: boolean;
  bookToursInstantly: boolean;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  savedCount: number;
  viewCount: number;
  tag?: string;
  featured?: boolean;
  featuredDescription?: string;
}

export interface PropertyPreview {
  id: string;
  slug: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: Pick<PropertyAddress, "street" | "city" | "state" | "zip" | "hideAddress">;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
  monthlyRent: number | null;
  salePrice: number | null;
  leaseDuration: string;
  coverPhoto: string;
  savedCount: number;
  contactName: string;
  tag?: string;
  featured?: boolean;
  featuredDescription?: string;
}
