type ParsedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  label: string;
};

function getComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): google.maps.GeocoderAddressComponent | undefined {
  return components.find((c) => c.types.includes(type));
}

function parseStreet(components: google.maps.GeocoderAddressComponent[]): string {
  const route = getComponent(components, "route")?.long_name?.trim() ?? "";
  const number = getComponent(components, "street_number")?.long_name?.trim() ?? "";
  if (!route) return "";
  return `${number} ${route}`.trim();
}

function parseCity(components: google.maps.GeocoderAddressComponent[]): string {
  return (
    getComponent(components, "locality")?.long_name ??
    getComponent(components, "sublocality_level_1")?.long_name ??
    getComponent(components, "administrative_area_level_2")?.long_name ??
    ""
  );
}

function parseState(components: google.maps.GeocoderAddressComponent[]): string {
  return getComponent(components, "administrative_area_level_1")?.long_name ?? "";
}

function parseZip(components: google.maps.GeocoderAddressComponent[]): string {
  return getComponent(components, "postal_code")?.long_name ?? "";
}

/**
 * Reverse geocode lat/lng via Google Geocoder and extract best-effort fields.
 */
export async function reverseGeocodeToAddressFieldsGoogle(
  geocoder: google.maps.Geocoder,
  lat: number,
  lng: number
): Promise<ParsedAddress | null> {
  const response = await geocoder.geocode({ location: { lat, lng } });
  const results = response.results ?? [];
  if (results.length === 0) return null;

  const best =
    results.find((r) => r.types.includes("street_address")) ??
    results.find((r) => r.types.includes("premise")) ??
    results.find((r) => r.types.includes("route")) ??
    results[0];

  const components = best.address_components ?? [];
  const street = parseStreet(components).trim();
  const city = parseCity(components).trim();
  const state = parseState(components).trim();
  const zip = parseZip(components).trim();
  const label = best.formatted_address?.trim() ?? "";

  return { street, city, state, zip, label };
}

