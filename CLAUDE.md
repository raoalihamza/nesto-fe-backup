# Nesto — Claude Code Context

## Project
Real estate marketplace for Uzbekistan. Zillow-like platform.
Client: Timur Rakhmatov. Built by: Ali (Cherry Byte Technologies).

## Tech Stack
- Next.js 16.1.7, React 19, TypeScript (strict)
- Tailwind v4 + shadcn/ui (base-nova style)
- next-intl v4 (en default, uz, ru)
- Redux Toolkit — authSlice, uiSlice, listingFormSlice, saleListingSlice
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
- (owner) — dashboard, listings/create (rent), listings/sale, listings/sale/create
- (rent-listing) — rent stepper, no navbar

## Current State (what's built)
- Auth: LoginForm, RegisterForm, SocialLoginButtons, NestoLogo
- Layout: Navbar, LanguageSwitcher, Footer
- Home: HeroSection, PropertyGridSection, FeatureCardsSection
- Common: Providers, ListingTypeModal
- Owner: Dashboard (Overview tab fully built), ListingTable, ListingCard, ListingStatusBadge
- Redux: authSlice, uiSlice, listingFormSlice, saleListingSlice
- Draft: draftMiddleware, clearAllDraftData, useLocalDraft
- Rent listing stepper: ALL 9 STEPS DONE in src/components/rent-listing-form/
- Sale listing: Screen 1 (map + address) + Screen 2 (full form) DONE

## Dashboard Tabs — Current vs Expected
- Overview tab: DONE (property management table + messages panel)
- Favorites tab: placeholder only — needs full implementation
- My Listings tab: placeholder only — needs full implementation
- Messages tab: placeholder only
- Settings tab: placeholder only

## What's NOT built yet (this session)
- Dashboard "My Listings" tab — full table with correct filters + Upload Sheet button
- Dashboard "Favorites" tab — property grid with sub-tabs (Favorites / Hidden Homes)
- propertySlice — savedIds[], hiddenIds[] arrays for favorites/hidden state

## PropertyCard location
- src/components/property/PropertyCard.tsx
- Takes `property: PropertyPreview` prop
- Heart button exists but has no onClick logic yet

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