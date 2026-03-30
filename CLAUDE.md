# Nesto — Claude Code Context

## Project
Real estate marketplace for Uzbekistan. Zillow-like platform.
Client: Timur Rakhmatov. Built by: Ali (Cherry Byte Technologies).

## Tech Stack
- Next.js 16.1.7, React 19, TypeScript (strict)
- Tailwind v4 + shadcn/ui (base-nova style)
- next-intl v4 (en default, uz, ru)
- Redux Toolkit — authSlice, uiSlice (listingFormSlice coming)
- TanStack Query (server state)
- react-hook-form + zod
- nuqs (URL filters)
- Mapbox (react-map-gl + mapbox-gl-draw)
- react-dropzone
- Port: 3001

## Brand
Primary color: #C02121 — available as `bg-brand`, `text-brand`, `border-brand`
Button shadow class: `btn-brand-shadow` (defined in globals.css)
Logo: Text "Nesto" in brand red until SVG provided

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
- Redux: authSlice, uiSlice only
- Types: types/property.ts (complete), types/user.ts, types/api.ts
- Data: src/lib/constants/dummyProperties.ts

## What's NOT built yet
- listingFormSlice
- draftMiddleware (sessionStorage)
- clearDraft utility
- Listing stepper form (9 steps, single URL /listings/create)

## Stepper Architecture (IMPORTANT)
- All 9 steps on single URL — URL never changes
- Navigation driven by Redux currentStep + currentSubStep
- Draft persistence: sessionStorage (tab refresh) NOT localStorage
- localStorage stores ONLY draftId string
- clearAllDraftData() called on: Save&Exit success, Publish success, tab close confirm
- Free navigation between steps — no validation blocking until Review step

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
```

---

## Faida Kya Hoga
```
Bina CLAUDE.md:
  → Har session mein tech stack, rules, current state batao
  → Claude Code bhool jaata hai previous context

Saath CLAUDE.md:
  → Automatic read on every session start
  → Tech stack, rules, what's built — sab pehle se pata
  → Tumhara prompt chota rehta hai
  → Mistakes kam hoti hain (jaise localStorage use karna)