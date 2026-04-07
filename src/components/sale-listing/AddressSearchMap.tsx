"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { useAppDispatch } from "@/store";
import { setAddress } from "@/store/slices/saleListingSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/map.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 }; // New York City
const DEFAULT_ZOOM = 12;

interface SearchResult {
  address: string;
  coordinates: { lat: number; lng: number };
}

export function AddressSearchMap() {
  const t = useTranslations("saleListing.addressSearch");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const [viewState, setViewState] = useState({
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
    zoom: DEFAULT_ZOOM,
  });

  const handleSearch = useCallback(async () => {
    if (!street && !city) return;

    const query = [street, city, state, zip].filter(Boolean).join(", ");
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center as [number, number];

        setSearchResult({
          address: feature.place_name as string,
          coordinates: { lat, lng },
        });

        setViewState({
          latitude: lat,
          longitude: lng,
          zoom: 16,
        });
      }
    } catch {
      // Geocoding failed silently — user can retry
    } finally {
      setIsSearching(false);
    }
  }, [street, city, state, zip]);

  const handleMapClick = useCallback(async (evt: { lngLat: { lat: number; lng: number } }) => {
    const { lat, lng } = evt.lngLat;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context: { id: string; text: string; short_code?: string }[] = feature.context ?? [];

        const streetNum = (feature.address as string) ?? "";
        const streetName = (feature.text as string) ?? "";
        const postcode = context.find((c) => c.id.startsWith("postcode"))?.text ?? "";
        const cityName = context.find((c) => c.id.startsWith("place"))?.text ?? "";
        const regionCode = context.find((c) => c.id.startsWith("region"))?.short_code ?? "";
        const stateCode = regionCode.replace("US-", "");

        setStreet(`${streetNum} ${streetName}`.trim());
        setCity(cityName);
        setState(stateCode);
        setZip(postcode);

        setSearchResult({
          address: feature.place_name as string,
          coordinates: { lat, lng },
        });

        setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng, zoom: 16 }));
      }
    } catch {
      // reverse geocoding failed silently
    }
  }, []);

  const handleConfirmLocation = useCallback(() => {
    if (!searchResult) return;

    dispatch(
      setAddress({
        street,
        unit,
        city,
        state,
        zip,
        coordinates: searchResult.coordinates,
      })
    );

    router.push(ROUTES.OWNER.SALE_CREATE);
  }, [dispatch, router, searchResult, street, unit, city, state, zip]);

  return (
    <div className="relative flex flex-col px-4 pt-2 md:px-8">
      {/* Map */}
      <div className="relative h-[65vh] overflow-hidden rounded-[10px]">
        <Map
          {...viewState}
          onMove={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          cooperativeGestures={true}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {searchResult && (
            <>
              <Marker
                latitude={searchResult.coordinates.lat}
                longitude={searchResult.coordinates.lng}
                anchor="bottom"
              >
                <MapPin className="size-8 fill-foreground text-foreground" />
              </Marker>

              <Popup
                latitude={searchResult.coordinates.lat}
                longitude={searchResult.coordinates.lng}
                offset={10}
                closeOnClick={false}
                closeButton={false}
                anchor="bottom"
              >
                <div className="p-4">
                  <p className="mb-3 text-base font-bold text-foreground">
                    {searchResult.address}
                  </p>
                  <Button
                    onClick={handleConfirmLocation}
                    className="btn-brand-shadow w-full bg-brand text-white hover:bg-brand/90"
                  >
                    {t("confirmLocation")}
                  </Button>
                </div>
              </Popup>
            </>
          )}
        </Map>
      </div>

      {/* Search Card */}
      <div className="relative z-10 -mt-10 px-4 pb-6 md:-mt-14 md:px-8">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-lg md:p-6">
          {/* Desktop: single row */}
          <div className="hidden items-end gap-3 md:flex">
            <div className="flex-1">
              <Input
                placeholder={t("streetAddress")}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
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
                onChange={(e) => setCity(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="w-28">
              <Select value={state} onValueChange={(v) => setState(v ?? "")}>
                <SelectTrigger className="h-12! w-full text-base">
                  <SelectValue placeholder={t("state")} />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <Input
                placeholder={t("zip")}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-brand-shadow h-12 bg-brand px-8 text-white hover:bg-brand/90"
            >
              {t("search")}
            </Button>
          </div>

          {/* Mobile: stacked layout */}
          <div className="flex flex-col gap-3 md:hidden">
            <Input
              placeholder={t("streetAddress")}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
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
                onChange={(e) => setCity(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={state} onValueChange={(v) => setState(v ?? "")}>
                <SelectTrigger className="h-12! w-full text-base">
                  <SelectValue placeholder={t("state")} />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={t("zip")}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-brand-shadow h-12 w-full bg-brand text-white hover:bg-brand/90"
            >
              {t("search")}
            </Button>
          </div>
        </div>
      </div>

      {/* Other posting options */}
      <div className="pb-8 text-center">
        <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("otherPostingOptions")}:{" "}
        </span>
        <button
          type="button"
          onClick={() => router.push(ROUTES.OWNER.CREATE)}
          className="text-sm font-semibold tracking-wide text-brand uppercase hover:underline cursor-pointer"
        >
          {t("rent")}
        </button>
      </div>
    </div>
  );
}
