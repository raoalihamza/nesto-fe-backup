/** Sale listing form values (RHF + zod). Not stored in Redux. */

export interface OpenHouseEntry {
  date: string;
  startTime: string;
  endTime: string;
}

export interface SaleListingPhoto {
  id: string;
  url: string;
  fileName: string;
  fileSizeBytes?: number;
}

export interface SaleFormData {
  price: number | null;
  photos: SaleListingPhoto[];
  virtualTourUrl: string;
  tourUrl3D: string;
  homeType: string;
  hoaDues: string;
  beds: string;
  squareFootage: string;
  garageSqFt: string;
  fullBaths: string;
  threeFourthBaths: string;
  halfBaths: string;
  quarterBaths: string;
  description: string;
  finishedSqFt: string;
  lotSize: string;
  lotSizeUnit: string;
  yearBuilt: string;
  structuralRemodelYear: string;
  openHouseDates: OpenHouseEntry[];
  realtorWebsite: string;
  additionalInfo: string;
  rooms: string[];
  totalRooms: string;
  basement: string;
  appliances: string[];
  flooring: string[];
  heating: string[];
  cooling: string[];
  electric: string[];
  water: string[];
  waterHeater: string[];
  conditionType: string;
  architectureStyle: string;
  construction: string[];
  exteriorFeatures: string[];
  buildingAmenities: string[];
  architectureType: string;
  styleType: string;
  exteriorMaterial: string[];
  outdoorAmenities: string[];
  stories: string;
  parking: string[];
  parkingSpaces: string;
  roof: string[];
  contactPhone: string;
  agreedToTerms: boolean;
}

export function createEmptySaleFormData(): SaleFormData {
  return {
    price: null,
    photos: [],
    virtualTourUrl: "",
    tourUrl3D: "",
    homeType: "",
    hoaDues: "",
    beds: "",
    squareFootage: "",
    garageSqFt: "",
    fullBaths: "",
    threeFourthBaths: "",
    halfBaths: "",
    quarterBaths: "",
    description: "",
    finishedSqFt: "",
    lotSize: "",
    lotSizeUnit: "sqft",
    yearBuilt: "",
    structuralRemodelYear: "",
    openHouseDates: [],
    realtorWebsite: "",
    additionalInfo: "",
    rooms: [],
    totalRooms: "",
    basement: "",
    appliances: [],
    flooring: [],
    heating: [],
    cooling: [],
    electric: [],
    water: [],
    waterHeater: [],
    conditionType: "",
    architectureStyle: "",
    construction: [],
    exteriorFeatures: [],
    buildingAmenities: [],
    architectureType: "",
    styleType: "",
    exteriorMaterial: [],
    outdoorAmenities: [],
    stories: "",
    parking: [],
    parkingSpaces: "",
    roof: [],
    contactPhone: "",
    agreedToTerms: false,
  };
}
