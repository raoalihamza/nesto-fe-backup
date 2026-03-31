# Nesto — Claude Code Context

## Project
Real estate marketplace for Uzbekistan. Zillow-like platform.
Client: Timur Rakhmatov. Built by: Ali (Cherry Byte Technologies).

## Tech Stack
- Next.js 16.1.7, React 19, TypeScript (strict)
- Tailwind v4 + shadcn/ui (base-nova style)
- next-intl v4 (en default, uz, ru)
- Redux Toolkit — authSlice, uiSlice, listingFormSlice
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
- (owner) — dashboard, listings/create, listings/[id]/edit

## Current State (what's built)
- Auth: LoginForm, RegisterForm, SocialLoginButtons, NestoLogo
- Layout: Navbar, LanguageSwitcher, Footer
- Home: HeroSection, PropertyGridSection, FeatureCardsSection
- Common: Providers, ListingTypeModal
- Owner: Dashboard, ListingTable, ListingCard, ListingStatusBadge
- Redux: authSlice, uiSlice, listingFormSlice (all 9 steps typed)
- Draft: draftMiddleware (sessionStorage), clearAllDraftData utility, useLocalDraft hook
- Stepper shell: StepperLayout, StepProgressBar, StepSubHeader, SaveExitButton, StepNavButtons
- Step 1 (Property Info): DONE
- Step 2 (Rent Details + SpecialOfferModal): DONE
- Step 3 (Media): DONE
- Step 4 (Amenities — 2 sub-steps): DONE
- Step 5 (Screening Criteria — 2 sub-steps): DONE
- Step 6 (Costs & Fees + AdminFeeModal): DONE

## What's NOT built yet
- Step 7: Final Details (6 sub-steps)
- Step 8: Review
- Step 9: Pay & Publish

## Stepper Architecture (CRITICAL)
- All 9 steps live on ONE page: /listings/create — URL NEVER changes between steps
- StepperLayout renders the correct step component based on Redux currentStep + currentSubStep
- No routing, no query params — pure Redux-driven navigation
- User can navigate freely forward/backward — NO validation blocking between steps
- Validation only triggers on Review step (step 7) when attempting to publish

## Draft Persistence (CRITICAL)
- Redux = source of truth while form is active (in-memory)
- sessionStorage key "nesto_stepper_draft" = tab refresh safety (written by draftMiddleware)
- localStorage key "nesto_draft_id" = ONLY stores draftId string after Save & Exit
- Full formData NEVER goes in localStorage
- clearAllDraftData() called on: Save & Exit success, Publish success, beforeunload confirm

## listingFormSlice — Key Info
- Location: src/store/slices/listingFormSlice.ts
- Step data interfaces: PropertyInfoData, RentDetailsData, MediaData,
  AmenitiesData, ScreeningData, CostsAndFeesData, FinalDetailsData
- Reducers: goToStep, goToSubStep, markStepComplete, setPropertyInfo, setRentDetails,
  setMedia, setAmenities, setScreening, setCostsAndFees, setFinalDetails,
  setDraftId, setIsDirty, setIsSaving, setLastSavedAt, restoreFromSession, resetListingForm

## 9 Steps (0-indexed)
- 0: Property Info (1 sub-step)
- 1: Rent Details (1 sub-step)
- 2: Media (1 sub-step)
- 3: Amenities (2 sub-steps)
- 4: Screening Criteria (2 sub-steps)
- 5: Costs & Fees (1 sub-step)
- 6: Final Details (6 sub-steps)
- 7: Review (1 sub-step)
- 8: Pay & Publish (1 sub-step)

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