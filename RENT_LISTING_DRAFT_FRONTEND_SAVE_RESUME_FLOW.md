# Rent Listing Draft: Frontend Save and Resume Flow

This document explains how the current rent draft backend should be used by frontend for the Figma flow.

It focuses on:
- when to call `POST` vs `PUT`
- what `Next` should do
- what `Save & exit` should do
- how media is actually persisted
- how multi-sub-screen sections should be handled
- how resume logic should work when the user reopens a draft

## 1. Core Rule

The backend supports creating a rent draft from any major step.

That is why Postman has create-first-draft endpoints like:
- `POST /v1/listings/rent/drafts/property-info`
- `POST /v1/listings/rent/drafts/rent-details`
- `POST /v1/listings/rent/drafts/media`
- `POST /v1/listings/rent/drafts/amenities`
- `POST /v1/listings/rent/drafts/screening-criteria`
- `POST /v1/listings/rent/drafts/costs-and-fees`
- `POST /v1/listings/rent/drafts/final-details`

But for the current frontend flow, the intended usage is simpler:

- first save on page 1: call `POST /v1/listings/rent/drafts/property-info`
- after that draft exists and frontend has `listingId`
- every later save uses the `PUT` endpoint for that step

So for this UI, most create-first-draft `POST` endpoints are backend flexibility, not normal frontend path.

## 2. Frontend Behavior Rule

Use this rule consistently:

- `Next` = save current screen/section to DB, then navigate forward
- `Save & exit` = save current screen/section to DB, then leave flow
- `Back` = navigate backward without saving unless product explicitly wants auto-save on back

This means draft persistence happens on every `Next` and every `Save & exit`.

## 3. First Save vs Update

### 3.1 First time on Property Info

If no draft exists yet:
- `Next` or `Save & exit` calls `POST /v1/listings/rent/drafts/property-info`

Backend:
- creates root `Listing`
- creates linked `RentListing`
- stores property info
- returns the new draft with `id`

Frontend:
- stores returned `listingId`
- all later saves use `listingId`

### 3.2 Returning to Property Info later

If draft already exists:
- `Next` or `Save & exit` calls `PUT /v1/listings/rent/drafts/{listingId}/property-info`

### 3.3 All later major steps

If draft already exists:
- `Rent Details` -> `PUT /drafts/{listingId}/rent-details`
- `Media` -> `PUT /drafts/{listingId}/media`
- `Amenities` -> `PUT /drafts/{listingId}/amenities`
- `Screening Criteria` -> `PUT /drafts/{listingId}/screening-criteria`
- `Costs & Fees` -> `PUT /drafts/{listingId}/costs-and-fees`
- `Final Details` -> `PUT /drafts/{listingId}/final-details`

## 4. Screen-by-Screen Flow

### 4.1 Property Info

Fields:
- square footage
- total bedrooms
- total bathrooms

On first `Next` or first `Save & exit`:
- call `POST /v1/listings/rent/drafts/property-info`

On later saves:
- call `PUT /v1/listings/rent/drafts/{listingId}/property-info`

This is the only step that should normally create the draft in the current UI.

### 4.2 Rent Details

Fields:
- monthly rent
- security deposit
- optional special offer

On `Next` or `Save & exit`:
- call `PUT /v1/listings/rent/drafts/{listingId}/rent-details`

### 4.3 Media

This step is different from normal form steps.

There are two separate concerns:
- saving individual uploaded files
- marking the media step as completed

#### Uploading a file

For each file:
1. call `POST /v1/listings/rent/drafts/{listingId}/media/presign`
2. upload the file directly to storage using the returned presigned URL
3. call `POST /v1/listings/rent/drafts/{listingId}/media/{mediaId}/confirm`

Important:
- the file is considered saved to the draft after `confirm`
- `confirm` also touches the `MEDIA` step in backend

#### Leaving the media screen

On `Next` or `Save & exit`:
- call `PUT /v1/listings/rent/drafts/{listingId}/media`

This final `PUT` is mainly a step-exit/step-complete call.

#### If browser closes during media

Cases:
- if file was only presigned: there may be a `PENDING` media row and no real upload
- if file was uploaded but not confirmed: object may exist, DB row may still be `PENDING`
- if file was confirmed: it is already saved to the draft

Frontend rule:
- confirm every file immediately after upload
- do not wait for `Next` to confirm media

Resume rule:
- if user uploaded/confirmed media but never intentionally left the step, reopen on `Media`
- show already confirmed media from the draft detail response

### 4.4 Amenities

Figma has 2 UI sub-screens, but backend has only 1 step:
- `PUT /v1/listings/rent/drafts/{listingId}/amenities`

Backend behavior:
- it replaces the whole amenities set for the draft
- it does not patch one half independently

Frontend rule:
- keep one combined amenities state object across both sub-screens
- on screen 1 `Next`, call `PUT /amenities` with current combined state
- on screen 2 `Next` or `Save & exit`, call `PUT /amenities` again with the updated combined state

Important:
- always send the full amenities state known so far
- do not send only one sub-screen fragment if you want previously entered values preserved

### 4.5 Screening Criteria

Figma has 2 UI sub-screens, but backend has only 1 step:
- `PUT /v1/listings/rent/drafts/{listingId}/screening-criteria`

Frontend rule:
- keep one combined screening-criteria state object across both sub-screens
- on screen 1 `Next`, call `PUT /screening-criteria`
- on screen 2 `Next` or `Save & exit`, call the same endpoint again with the updated combined state

Again:
- save incrementally
- always send the full combined screening state known so far

### 4.6 Costs & Fees

This step has two different API behaviors.

#### Fee CRUD

When user adds a fee:
- `POST /v1/listings/rent/drafts/{listingId}/fees`

When user edits a fee:
- `PATCH /v1/listings/rent/drafts/{listingId}/fees/{feeId}`

When user deletes a fee:
- `DELETE /v1/listings/rent/drafts/{listingId}/fees/{feeId}`

These calls persist fee rows immediately.

#### Leaving the step

On `Next` or `Save & exit`:
- call `PUT /v1/listings/rent/drafts/{listingId}/costs-and-fees`

This marks the step itself complete.

### 4.7 Final Details

This is the most important multi-sub-screen section.

Figma shows multiple internal screens, but backend has only one step:
- `PUT /v1/listings/rent/drafts/{listingId}/final-details`

Typical final-detail sub-screens include:
- lease terms
- listed by / contact name / email
- phone number
- booking tours instantly
- property description
- confirm final detail

Frontend rule:
- keep one combined final-details state object across all final-detail sub-screens
- on every `Next` inside Final Details, call `PUT /final-details`
- on every `Save & exit` inside Final Details, call `PUT /final-details`

Important:
- always send the full combined final-details state known so far
- backend does not know which internal final-detail sub-screen user is on
- backend only knows the major step: `FINAL_DETAILS`

### 4.8 Review

When user reaches review:
- call `GET /v1/listings/rent/drafts/{listingId}/review`

This returns:
- all saved draft data
- progress state
- validation issues
- publish readiness

No special save API is required here if all prior steps were already saved on each `Next`.

### 4.9 Pay & Publish

When user clicks `Publish`:
- call `POST /v1/listings/rent/drafts/{listingId}/publish`

Backend:
- validates the draft
- returns validation issues if incomplete
- otherwise marks listing as `PUBLISHED`

## 5. Which Sections Have Sub-Screens But Only One Backend Step

These UI sections have multiple frontend screens but only one backend step:

- `Amenities`
- `Screening Criteria`
- `Final Details`

That means backend cannot track internal sub-screen position for them.

## 6. What Backend Tracks vs What Frontend Must Track

Backend tracks only major flow step, for example:
- `PROPERTY_INFO`
- `RENT_DETAILS`
- `MEDIA`
- `AMENITIES`
- `SCREENING_CRITERIA`
- `COSTS_AND_FEES`
- `FINAL_DETAILS`
- `PAY_AND_PUBLISH`

Backend does not track:
- amenities screen 1 vs screen 2
- screening screen 1 vs screen 2
- final-details screen 1 vs screen 2 vs screen 3, etc.

So if exact resume within a major section is required, frontend must track sub-screen position itself.

Recommended frontend ways to track sub-screen:
- local storage keyed by `listingId`
- route path or query param
- frontend draft-progress store

## 7. Resume Logic

### 7.1 Reopening from Drafts tab

Draft list:
- `GET /v1/listings/me?tab=draft&page=1&limit=20`

Draft detail:
- `GET /v1/listings/rent/drafts/{listingId}`

Use draft detail response to get:
- full saved data
- `progress.currentStep`
- `progress.lastCompletedStep`

### 7.2 How to reopen major steps

If backend says:
- `PROPERTY_INFO` -> reopen Property Info
- `RENT_DETAILS` -> reopen Rent Details
- `MEDIA` -> reopen Media
- `AMENITIES` -> reopen Amenities section
- `SCREENING_CRITERIA` -> reopen Screening Criteria section
- `COSTS_AND_FEES` -> reopen Costs & Fees
- `FINAL_DETAILS` -> reopen Final Details section

### 7.3 How to reopen sub-screens

Backend cannot tell exact sub-screen inside:
- Amenities
- Screening Criteria
- Final Details

If frontend wants perfect resume:
- reopen using frontend-stored sub-screen position

If frontend does not store sub-screen position:
- reopen at the first sub-screen of that major section

That is acceptable, but less precise.

### 7.4 Media-specific resume

If user uploaded and confirmed media but never intentionally left the Media step:
- reopen on `Media`
- show already confirmed media items

This is correct because media files are persisted individually, while step completion is separate.

## 8. Recommended Frontend Simplification

Use this as the actual product rule:

- only use `POST /drafts/property-info` to create the draft
- after draft exists, only use `PUT` step endpoints
- confirm media immediately after each upload
- save combined state on each `Next` and `Save & exit` for multi-sub-screen sections
- use `GET /drafts/{listingId}` to reopen a draft
- use frontend state to remember exact sub-screen inside shared-step sections

## 9. Short Version for Frontend Dev

- First page first save creates the draft.
- After that, every `Next` and every `Save & exit` saves the current major step into the existing draft.
- Media files are saved per file through `presign -> upload -> confirm`.
- Amenities, Screening Criteria, and Final Details each have multiple UI screens but only one backend save endpoint.
- For those shared-step sections, frontend must keep a combined state object and send it on every `Next` / `Save & exit`.
- Backend only tracks major step, not exact internal sub-screen.
- If exact resume inside a major section is needed, frontend must store sub-screen position itself.
