# Nesto — Claude Code Context

## Project
Real estate marketplace (Zillow-like), with multilingual support and owner workflows for rent/sale listing creation and editing.

## Tech Stack
- Next.js 16.1.7, React 19, TypeScript (strict)
- Tailwind v4 + shadcn/ui
- next-intl v4 (en default, uz, ru)
- Redux Toolkit — `authSlice`, `uiSlice`, `listingFormSlice`, `saleListingSlice`
- TanStack Query (server state)
- react-hook-form + zod
- nuqs (URL filters)
- Mapbox (react-map-gl + mapbox-gl-draw)
- react-dropzone

## Brand
- Primary color: `#C02121` (`bg-brand`, `text-brand`, `border-brand`)
- Button shadow class: `btn-brand-shadow` (globals.css)
- Logo: `/icons/nesto-logo-navbar.svg`

## Core Rules
- Every user-facing string uses `useTranslations()` (`next-intl`)
- Use `@/` path alias imports
- `"use client"` only where interaction/hooks are needed
- No NextAuth; backend auth APIs directly
- API base from `NEXT_PUBLIC_API_URL`

## i18n
- Locales: `en` (default), `uz`, `ru`
- Messages: `src/messages/en.json`, `src/messages/uz.json`, `src/messages/ru.json`
- Routing: `src/i18n/routing.ts`
- App routes under `src/app/[locale]/`

## Route Groups
- `(auth)` — login/register/forgot/reset password (no navbar)
- `(main)` — buy/rent/sell/search/saved/messages/property pages
- `(owner)` — dashboard, owner listing flows
- `(rent-listing)` — rent stepper flow (no navbar)

## Current State (important)
- Rent listing stepper flow: implemented and editable via `listings/create/[draftId]`
- Sale listing flow:
  - Address confirm/map step: implemented
  - Create form step: implemented
  - Edit form route: implemented at `listings/sale/[listingId]/edit`
- Sale edit API integration implemented with:
  - GET edit preload + GET media preload
  - listing-scoped media upload/confirm/delete
  - PUT full update body (no `address`, no `consent`, no `media.uploadIds`)
- Dashboard:
  - Overview + My Listings + Saved Homes working with API-backed data and infinite scroll
  - Edit action (pencil) wired for published sale and rent listings
- Owner listing UI components:
  - `ListingTable`, `ListingCard`, `ListingStatusBadge`
  - Archive action + delete draft flow dialogs

## Sale Listing — Implementation Notes
- `SaleListingForm` supports both create and edit mode via optional `listingId`
- Edit mode behavior:
  - hydrate form from GET edit + media
  - keep address non-editable on form page
  - phone verification required when changed
  - media handled through listing-specific media endpoints
- Create mode behavior remains on original flow (global sale media endpoints + POST create)

## Payload/Contract Caveats
- Backend PUT sale edit currently rejects unknown keys strictly
- `address` must NOT be sent in sale edit PUT body
- `consent` is create-only and not sent on sale edit PUT
- `electric`/`water` UI fields are now mapped to backend utility keys:
  - `electricType` (array)
  - `waterType` (array)
  - mapping handles UI/API key differences (`other_electric -> other`, `none_water -> none`)

## Key Files to Know
- Sale form: `src/components/sale-listing/SaleListingForm.tsx`
- Sale form sections/footer: `src/components/sale-listing/SaleListingFormSections.tsx`
- Sale API services: `src/lib/api/saleListing.service.ts`, `src/lib/api/saleListingMedia.service.ts`
- Sale payload builders: `src/lib/saleListing/buildSaleListingPayload.ts`
- Sale edit mappers: `src/lib/saleListing/mapSaleEditResponseToForm.ts`
- Dashboard: `src/app/[locale]/(owner)/dashboard/page.tsx`
- Owner row/card actions: `src/components/owner/ListingTable.tsx`, `src/components/owner/ListingCard.tsx`

## Known TODO / Follow-up
- Keep frontend utility field mapping aligned with backend enums for `electricType` and `waterType`
- If backend changes strict schemas, re-check create/edit payload builders accordingly