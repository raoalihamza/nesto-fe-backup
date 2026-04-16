import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SaleValidatedAddress } from "@/lib/api/saleListing.service";

export type { SaleValidatedAddress };
/** @deprecated Import from `@/lib/saleListing/saleListingFormTypes` — form state is RHF, not Redux. */
export type {
  SaleFormData,
  SaleListingPhoto,
  OpenHouseEntry,
} from "@/lib/saleListing/saleListingFormTypes";

export interface SaleAddressData {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  coordinates: { lat: number; lng: number } | null;
}

export interface SaleListingState {
  address: SaleAddressData;
  /** Set only after successful “Yes, this is my location” + address-validate. */
  validatedAddress: SaleValidatedAddress | null;
  /** Firebase + POST /listings/sale/verify-phone succeeded for `verifiedSalePhone`. */
  salePhoneVerified: boolean;
  /** E.164 phone that passed sale verify-phone (must match contact at publish). */
  verifiedSalePhone: string | null;
}

const initialAddress: SaleAddressData = {
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  coordinates: null,
};

const initialState: SaleListingState = {
  address: initialAddress,
  validatedAddress: null,
  salePhoneVerified: false,
  verifiedSalePhone: null,
};

const saleListingSlice = createSlice({
  name: "saleListing",
  initialState,
  reducers: {
    setAddress(state, action: PayloadAction<SaleAddressData>) {
      state.address = action.payload;
    },
    /** After confirm: canonical backend address + editable mirror for display. */
    setSaleAddressFromConfirm(
      state,
      action: PayloadAction<{ validated: SaleValidatedAddress }>
    ) {
      const v = action.payload.validated;
      state.validatedAddress = v;
      state.address = {
        street: v.addressLine1,
        unit: v.unit ?? "",
        city: v.city,
        state: v.state,
        zip: v.postalCode,
        coordinates: { lat: v.latitude, lng: v.longitude },
      };
    },
    clearSaleValidatedAddress(state) {
      state.validatedAddress = null;
    },
    setSalePhoneVerification(
      state,
      action: PayloadAction<{ verified: boolean; phoneE164: string | null }>
    ) {
      state.salePhoneVerified = action.payload.verified;
      state.verifiedSalePhone = action.payload.phoneE164;
    },
    resetSaleForm() {
      return initialState;
    },
  },
});

export const {
  setAddress,
  setSaleAddressFromConfirm,
  clearSaleValidatedAddress,
  setSalePhoneVerification,
  resetSaleForm,
} = saleListingSlice.actions;

export default saleListingSlice.reducer;
