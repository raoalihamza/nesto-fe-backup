"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useAppDispatch } from "@/store";
import {
  resetSaleForm,
  setSaleAddressFromConfirm,
} from "@/store/slices/saleListingSlice";
import { saleListingService } from "@/lib/api/saleListing.service";
import type { ApiError } from "@/types/user";
import { reverseGeocodeToAddressFieldsGoogle } from "@/lib/googleMaps/reverseGeocodeAddress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { toast } from "sonner";
import "@/styles/map.css";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

/** Default map center (Lahore) — PK/UZ sale markets. */
const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 };
const DEFAULT_ZOOM = 12;

/** Marker + popover only after successful address-validate (backend lat/lng). */
interface ValidatedPin {
  address: string;
  coordinates: { lat: number; lng: number };
}

function firstVisibleInputByField(field: "street" | "zip"): HTMLInputElement | null {
  if (typeof document === "undefined") return null;
  const candidates = Array.from(
    document.querySelectorAll<HTMLInputElement>(`input[data-address-field="${field}"]`)
  );
  return (
    candidates.find(
      (el) =>
        el.offsetParent !== null &&
        window.getComputedStyle(el).visibility !== "hidden"
    ) ?? null
  );
}

function hasRequiredAddressFields(
  street: string,
  city: string,
  state: string,
  zip: string
): boolean {
  return (
    street.trim().length > 0 &&
    city.trim().length > 0 &&
    state.trim().length > 0 &&
    zip.trim().length > 0
  );
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return (error as ApiError).message;
  }
  return fallback;
}

export function AddressSearchMap() {
  const t = useTranslations("saleListing.addressSearch");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const reverseReqIdRef = useRef(0);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded: isGoogleLoaded } = useJsApiLoader({
    id: "sale-address-google-map",
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [validatedPin, setValidatedPin] = useState<ValidatedPin | null>(null);
  const [selectedPointLabel, setSelectedPointLabel] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [viewState, setViewState] = useState({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    zoom: DEFAULT_ZOOM,
  });

  /** Clear marker/popover when address fields change (unit excluded). */
  const clearValidatedPin = useCallback(() => {
    setValidatedPin(null);
    setSelectedPoint(null);
    setSelectedPointLabel("");
  }, []);

  const runValidateAddress = useCallback(async () => {
    return saleListingService.validateAddress({
      streetAddress: street.trim(),
      unit: unit.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
    });
  }, [street, unit, city, state, zip]);

  const handleSearch = useCallback(async () => {
    if (!hasRequiredAddressFields(street, city, state, zip)) {
      toast.error(t("addressRequiredFields"));
      return;
    }

    setIsSearching(true);
    try {
      const validated = await runValidateAddress();
      setValidatedPin({
        address: validated.formattedAddress,
        coordinates: {
          lat: validated.latitude,
          lng: validated.longitude,
        },
      });
      setSelectedPoint({
        lat: validated.latitude,
        lng: validated.longitude,
      });
      setSelectedPointLabel(validated.formattedAddress);
      setViewState({
        lat: validated.latitude,
        lng: validated.longitude,
        zoom: 16,
      });
      mapRef.current?.panTo({
        lat: validated.latitude,
        lng: validated.longitude,
      });
      mapRef.current?.setZoom(16);
    } catch (e) {
      toast.error(apiErrorMessage(e, t("addressValidateError")));
    } finally {
      setIsSearching(false);
    }
  }, [street, city, state, zip, runValidateAddress, t]);

  const handleMapClick = useCallback(
    async (evt: google.maps.MapMouseEvent) => {
      const clickLat = evt.latLng?.lat();
      const clickLng = evt.latLng?.lng();
      if (clickLat == null || clickLng == null) return;
      if (!GOOGLE_MAPS_KEY) {
        toast.error(t("googleMapsKeyMissing"));
        return;
      }
      if (!isGoogleLoaded) return;

      // First map click while a popover is open: dismiss only (so user can pan / pick elsewhere).
      // Second click: run normal pick + reverse geocode.
      const popoverOpen = validatedPin !== null || selectedPoint !== null;
      if (popoverOpen) {
        clearValidatedPin();
        return;
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }
      const geocoder = geocoderRef.current;

      // Show immediate visual feedback for click selection.
      setSelectedPoint({ lat: clickLat, lng: clickLng });
      setValidatedPin(null);
      setSelectedPointLabel("");

      reverseReqIdRef.current += 1;
      const requestId = reverseReqIdRef.current;
      try {
        const parsed = await reverseGeocodeToAddressFieldsGoogle(
          geocoder,
          clickLat,
          clickLng
        );
        if (requestId !== reverseReqIdRef.current) return;
        if (!parsed) {
          toast.error(t("mapReverseGeocodeFailed"));
          return;
        }

        setStreet(parsed.street);
        setCity(parsed.city);
        setState(parsed.state);
        setZip(parsed.zip);
        setSelectedPointLabel(parsed.label);

        if (!parsed.street) {
          const streetInput = firstVisibleInputByField("street");
          streetInput?.focus();
        } else if (!parsed.zip) {
          const zipInput = firstVisibleInputByField("zip");
          zipInput?.focus();
        }

        const filled = [parsed.street, parsed.city, parsed.state, parsed.zip].filter(
          Boolean
        ).length;
        if (filled < 2) {
          toast.message(t("mapPartialFillHint"), {
            description: parsed.label || t("mapCompleteFieldsHint"),
          });
        }
      } catch {
        if (requestId !== reverseReqIdRef.current) return;
        toast.error(t("mapReverseGeocodeFailed"));
      }
    },
    [t, isGoogleLoaded, validatedPin, selectedPoint, clearValidatedPin]
  );

  const handleConfirmLocation = useCallback(async () => {
    if (!hasRequiredAddressFields(street, city, state, zip)) {
      toast.error(t("addressRequiredFields"));
      return;
    }

    setIsConfirming(true);
    try {
      dispatch(resetSaleForm());
      const validated = await runValidateAddress();
      dispatch(setSaleAddressFromConfirm({ validated }));
      router.push(ROUTES.OWNER.SALE_CREATE);
    } catch (e) {
      toast.error(apiErrorMessage(e, t("addressValidateError")));
    } finally {
      setIsConfirming(false);
    }
  }, [dispatch, router, runValidateAddress, street, city, state, zip, t]);

  const onStreetChange = (v: string) => {
    setStreet(v);
    clearValidatedPin();
  };
  const onCityChange = (v: string) => {
    setCity(v);
    clearValidatedPin();
  };
  const onStateChange = (v: string) => {
    setState(v);
    clearValidatedPin();
  };
  const onZipChange = (v: string) => {
    setZip(v);
    clearValidatedPin();
  };

  return (
    <div className="relative flex flex-col px-4 pt-2 md:px-8">
      <div className="relative h-[65vh] overflow-hidden rounded-[10px]">
        {!GOOGLE_MAPS_KEY ? (
          <div className="flex h-full items-center justify-center bg-muted/20 px-4 text-center text-sm text-muted-foreground">
            {t("googleMapsKeyMissing")}
          </div>
        ) : isGoogleLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={viewState}
            zoom={viewState.zoom}
            onClick={(evt) => void handleMapClick(evt)}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onUnmount={() => {
              mapRef.current = null;
            }}
            options={{
              gestureHandling: "cooperative",
              disableDefaultUI: false,
              clickableIcons: false,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
            }}
          >
            {!validatedPin && selectedPoint && (
              <MarkerF
                position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                opacity={0.8}
              />
            )}

            {validatedPin && (
              <>
                <MarkerF
                  position={{
                    lat: validatedPin.coordinates.lat,
                    lng: validatedPin.coordinates.lng,
                  }}
                />
                <InfoWindowF
                  position={{
                    lat: validatedPin.coordinates.lat,
                    lng: validatedPin.coordinates.lng,
                  }}
                  options={{
                    disableAutoPan: true,
                    // Remove default Google header/close affordance for compact custom card UI.
                    headerDisabled: true,
                  }}
                >
                  <div className="w-[260px] p-2 sm:w-[300px]">
                    <p className="mb-3 text-sm font-semibold leading-5 text-foreground sm:text-base">
                      {validatedPin.address}
                    </p>
                    <Button
                      type="button"
                      onClick={() => void handleConfirmLocation()}
                      disabled={isConfirming}
                      className="shadow-none! mx-auto block h-10 min-w-[200px] bg-brand px-5 text-white hover:bg-brand/90"
                    >
                      {t("confirmLocation")}
                    </Button>
                  </div>
                </InfoWindowF>
              </>
            )}

            {!validatedPin && selectedPoint && (
              <InfoWindowF
                position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                options={{
                  disableAutoPan: true,
                  headerDisabled: true,
                }}
              >
                <div className="w-[260px] p-2 sm:w-[300px]">
                  <p className="mb-3 text-sm font-semibold leading-5 text-foreground sm:text-base">
                    {selectedPointLabel || [street, city, state, zip].filter(Boolean).join(", ")}
                  </p>
                  <Button
                    type="button"
                    onClick={() => void handleConfirmLocation()}
                    disabled={isConfirming}
                    className="btn-brand-shadow mx-auto block h-10 min-w-[180px] bg-brand px-5 text-white hover:bg-brand/90"
                  >
                    {t("confirmLocation")}
                  </Button>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="flex h-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
            {t("mapLoading")}
          </div>
        )}
      </div>

      <div className="relative z-10 -mt-10 px-4 pb-6 md:-mt-14 md:px-8">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-lg md:p-6">
          <div className="hidden items-end gap-3 md:flex">
            <div className="flex-1">
              <Input
                data-address-field="street"
                placeholder={t("streetAddress")}
                value={street}
                onChange={(e) => onStreetChange(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="w-36">
              <Input
                placeholder={t("unit")}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="w-36">
              <Input
                placeholder={t("city")}
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="min-w-28 flex-1">
              <Input
                placeholder={t("state")}
                value={state}
                onChange={(e) => onStateChange(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="w-28">
              <Input
                data-address-field="zip"
                placeholder={t("zip")}
                value={zip}
                onChange={(e) => onZipChange(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleSearch()}
              disabled={isSearching || isConfirming}
              className="btn-brand-shadow h-12 bg-brand px-8 text-white hover:bg-brand/90"
            >
              {t("search")}
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <Input
              data-address-field="street"
              placeholder={t("streetAddress")}
              value={street}
              onChange={(e) => onStreetChange(e.target.value)}
              className="h-12"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder={t("unit")}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-12"
              />
              <Input
                placeholder={t("city")}
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder={t("state")}
                value={state}
                onChange={(e) => onStateChange(e.target.value)}
                className="h-12"
              />
              <Input
                data-address-field="zip"
                placeholder={t("zip")}
                value={zip}
                onChange={(e) => onZipChange(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleSearch()}
              disabled={isSearching || isConfirming}
              className="btn-brand-shadow h-12 w-full bg-brand text-white hover:bg-brand/90"
            >
              {t("search")}
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-8 text-center">
        <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("otherPostingOptions")}:{" "}
        </span>
        <button
          type="button"
          onClick={() => router.push(ROUTES.OWNER.CREATE)}
          className="cursor-pointer text-sm font-semibold tracking-wide text-brand uppercase hover:underline"
        >
          {t("rent")}
        </button>
      </div>
    </div>
  );
}
