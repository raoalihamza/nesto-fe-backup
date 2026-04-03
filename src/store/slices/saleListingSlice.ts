import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SaleAddressData {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  coordinates: { lat: number; lng: number } | null;
}

export interface OpenHouseEntry {
  date: string;
  startTime: string;
  endTime: string;
}

export interface SaleFormData {
  // Pricing
  price: number | null;

  // Media
  photos: string[];
  virtualTourUrl: string;
  tourUrl3D: string;

  // Home facts
  homeType: string;
  hoaDues: string;
  beds: string;
  squareFootage: string;
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

  // Open house
  openHouseDates: OpenHouseEntry[];

  // Additional info
  realtorWebsite: string;
  additionalInfo: string;

  // Room details
  rooms: string[];
  totalRooms: string;

  // Appliances
  appliances: string[];

  // Floor coverings
  flooring: string[];

  // Utility details
  heating: string[];
  cooling: string[];
  electric: string[];
  water: string[];
  waterHeater: string[];

  // Building details
  conditionType: string;
  architectureStyle: string;
  construction: string[];

  // Exterior features
  exteriorFeatures: string[];

  // Building amenities
  buildingAmenities: string[];

  // Architecture style (radio)
  architectureType: string;

  // Style (radio)
  styleType: string;

  // Exterior material
  exteriorMaterial: string[];

  // Outdoor amenities
  outdoorAmenities: string[];
  stories: string;

  // Parking
  parking: string[];
  parkingSpaces: string;

  // Roof
  roof: string[];

  // Contact
  contactPhone: string;

  // Terms
  agreedToTerms: boolean;
}

export interface SaleListingState {
  address: SaleAddressData;
  formData: SaleFormData;
  isDirty: boolean;
}

const initialAddress: SaleAddressData = {
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  coordinates: null,
};

const initialFormData: SaleFormData = {
  price: null,
  photos: [],
  virtualTourUrl: "",
  tourUrl3D: "",
  homeType: "",
  hoaDues: "",
  beds: "",
  squareFootage: "",
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

const initialState: SaleListingState = {
  address: initialAddress,
  formData: initialFormData,
  isDirty: false,
};

const saleListingSlice = createSlice({
  name: "saleListing",
  initialState,
  reducers: {
    setAddress(state, action: PayloadAction<SaleAddressData>) {
      state.address = action.payload;
    },
    setSaleFormData(state, action: PayloadAction<Partial<SaleFormData>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setIsDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    resetSaleForm() {
      return initialState;
    },
  },
});

export const { setAddress, setSaleFormData, setIsDirty, resetSaleForm } =
  saleListingSlice.actions;

export default saleListingSlice.reducer;
