export type ListingType = "rent" | "sale";
export type PropertyType = "house" | "apartment" | "condo" | "townhouse" | "land";
export type PropertyStatus = "active" | "pending" | "rented" | "sold" | "archived" | "draft";
export type ListedBy = "owner" | "management" | "tenant";

export type LaundryOption =
  | "washer_dryer_included"
  | "washer_dryer_hookups"
  | "shared_or_in_building"
  | "no_laundry";

export type CoolingOption = "central" | "wall" | "window";
export type HeatingOption = "baseboard" | "forced_air" | "heat_pump" | "wall";
export type ApplianceOption = "dishwasher" | "freezer" | "microwave" | "oven" | "refrigerator";
export type FlooringOption = "carpet" | "hardwood" | "tile";
export type ParkingOption = "attached_garage" | "detached_garage" | "off_street";
export type OutdoorOption = "balcony_or_deck" | "pool";
export type AccessibilityOption = "disabled_access";
export type OtherAmenityOption = "furnished";

export interface PropertyAmenities {
  laundry: LaundryOption | null;
  cooling: CoolingOption[];
  heating: HeatingOption[];
  appliances: ApplianceOption[];
  flooring: FlooringOption[];
  parking: ParkingOption[];
  outdoor: OutdoorOption[];
  accessibility: AccessibilityOption[];
  other: OtherAmenityOption[];
}

export type FeeCategory = "administrative" | "parking" | "utilities" | "other";
export type FeeRequirement = "included_in_base" | "required" | "optional" | "situational";
export type FeeFrequency = "monthly" | "annually" | "one_time";
export type FeeFormat = "fixed" | "percentage";

export interface PropertyFee {
  id: string;
  category: FeeCategory;
  name: string;
  paymentFrequency: FeeFrequency;
  format: FeeFormat;
  amount: number;
  isRequired: FeeRequirement;
  isRefundable: boolean;
  description?: string;
}

export interface SpecialOffer {
  startDate: string;
  endDate: string;
  description: string;
}

export interface ScreeningCriteria {
  petsAllowed: boolean;
  petPolicyNegotiable: boolean;
  minIncomeToRentRatio: string | null;
  incomeNegotiable: boolean;
  minCreditScore: string | null;
  creditNegotiable: boolean;
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
  specialOffer: SpecialOffer | null;
  showTotalMonthlyPrice: boolean;
  fees: PropertyFee[];
  salePrice: number | null;
  dateAvailable: string;
  leaseDuration: string;
  leaseTerms: string;
  requireRentersInsurance: boolean;
  media: PropertyMedia;
  amenities: PropertyAmenities;
  screening: ScreeningCriteria;
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
  specialOffer: SpecialOffer | null;
  savedCount: number;
  contactName: string;
  tag?: string;
  featured?: boolean;
  featuredDescription?: string;
}
