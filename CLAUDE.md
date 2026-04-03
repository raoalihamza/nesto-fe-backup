# Nesto — Claude Code Context

## Project
Real estate marketplace for Uzbekistan. Zillow-like platform.
Client: Timur Rakhmatov. Built by: Ali (Cherry Byte Technologies).

## Tech Stack
- Next.js 16.1.7, React 19, TypeScript (strict)
- Tailwind v4 + shadcn/ui (base-nova style)
- next-intl v4 (en default, uz, ru)
- Redux Toolkit — authSlice, uiSlice, listingFormSlice, saleListingSlice (new)
- TanStack Query (server state)
- react-hook-form + zod
- nuqs (URL filters)
- Mapbox (react-map-gl + mapbox-gl-draw)
- react-dropzone
- Port: 3001

## Brand
Primary color: #C02121 — available as `bg-brand`, `text-brand`, `border-brand`
Button shadow class: `btn-brand-shadow` (defined in globals.css)
Logo: SVG at /icons/nesto-logo-navbar.svg (already in public)

## Key Rules
- Every string → `useTranslations()` from next-intl, no hardcoded text
- Paths → `@/` alias only
- "use client" → only on interactive components
- No bottom mobile nav bar
- No NextAuth — backend provides auth APIs directly
- API base: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"`

## i18n
- Locales: en (default), uz, ru
- Messages: src/messages/en.json, uz.json, ru.json
- Routing: src/i18n/routing.ts
- All routes are under src/app/[locale]/

## Route Groups
- (auth) — login, register, forgot-password, reset-password — no navbar
- (main) — buy, rent, sell, search, saved, messages, property/[slug]
- (owner) — dashboard, listings/create (rent), listings/[id]/edit
- (rent-listing) — listings/create (rent stepper, no navbar)

## Current State (what's built)
- Auth: LoginForm, RegisterForm, SocialLoginButtons, NestoLogo
- Layout: Navbar, LanguageSwitcher, Footer
- Home: HeroSection, PropertyGridSection, FeatureCardsSection
- Common: Providers, ListingTypeModal
- Owner: Dashboard, ListingTable, ListingCard, ListingStatusBadge
- Redux: authSlice, uiSlice, listingFormSlice (all 9 steps typed)
- Draft: draftMiddleware (sessionStorage), clearAllDraftData utility, useLocalDraft hook
- Rent listing stepper (ALL 9 STEPS DONE): components in src/components/rent-listing-form/

## What's NOT built yet
- saleListingSlice (new Redux slice for sale listing)
- Sale listing Screen 1: Address search with Mapbox map
- Sale listing Screen 2: Full sale listing form

## Sale Listing Architecture (CRITICAL)
- Screen 1 route: /listings/sale — map + address search, NO navbar from layout, show Navbar manually
- Screen 2 route: /listings/sale/create — long single form, Navbar visible
- NO draft, NO stepper, NO save & exit
- Single "Get to list it now" button at bottom submits everything
- beforeunload alert fires when isDirty=true (tab close, browser close, link navigation)
- On submit success: reset Redux saleListingSlice → redirect to /dashboard
- Address from Screen 1 passed to Screen 2 via Redux saleListingSlice

## Rent Listing Architecture (reference)
- All 9 steps on ONE page: (rent-listing)/listings/create — URL never changes
- Components in: src/components/rent-listing-form/
- Redux slice: listingFormSlice
- Draft: sessionStorage + localStorage draftId

## listingFormSlice (rent listing) — Key Info
- Location: src/store/slices/listingFormSlice.ts
- Step data interfaces: PropertyInfoData, RentDetailsData, MediaData,
  AmenitiesData, ScreeningData, CostsAndFeesData, FinalDetailsData

## Dummy Data
- src/lib/constants/dummyProperties.ts
- DUMMY_PROPERTIES (8 full objects), DUMMY_PROPERTY_PREVIEWS, DUMMY_MY_LISTINGS
- All images: /images/property.jpg, hero: /images/hero.png

## shadcn Components Available
button, input, textarea, card, badge, dialog, drawer, sheet,
dropdown-menu, select, checkbox, radio-group, switch, slider,
tabs, avatar, skeleton, toast, sonner, tooltip, popover,
calendar, progress, separator, label, form, table, command,
scroll-area, alert, breadcrumb