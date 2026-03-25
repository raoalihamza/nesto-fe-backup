export const mapsConfig = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  defaultCenter: {
    latitude: 41.2995,
    longitude: 69.2401,
  },
  defaultZoom: 12,
  style: "mapbox://styles/mapbox/streets-v12",
  maxZoom: 18,
  minZoom: 3,
} as const;
