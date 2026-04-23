export const ROUTES = {
  HOME: "/",
  BUY: "/buy",
  GET_MORTGAGE: "/get-a-mortgage",
  FIND_AGENT: "/find-an-agent",
  ADVERTISE: "/advertise",
  RENT: "/rent",
  SELL: "/sell",
  SEARCH: "/search",
  SAVED: "/saved",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  PROPERTY: (slug: string) => `/property/${slug}`,
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  OWNER: {
    DASHBOARD: "/dashboard",
    /**
     * Dashboard deep-links used after rent/sale listing form exits.
     * Keep query keys in sync with DashboardPage's param reader.
     */
    DASHBOARD_MY_LISTINGS_DRAFTS: "/dashboard?tab=myListings&filter=drafted",
    DASHBOARD_MY_LISTINGS_FOR_RENT: "/dashboard?tab=myListings&filter=forRent",
    DASHBOARD_MY_LISTINGS_FOR_SALE: "/dashboard?tab=myListings&filter=forSale",
    LISTINGS: "/listings",
    CREATE: "/listings/create",
    EDIT: (id: string) => `/listings/${id}/edit`,
    PREVIEW: (id: string) => `/listings/${id}/preview`,
    SALE: "/listings/sale",
    SALE_CREATE: "/listings/sale/create",
    SALE_EDIT: (id: string) => `/listings/sale/${id}/edit`,
    APPLICANTS: "/applicants",
    ANALYTICS: "/analytics",
  },
} as const;
