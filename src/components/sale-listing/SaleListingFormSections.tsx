"use client";

import { memo } from "react";
import type {
  Control,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormSetValue,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { OpenHouseEntry, SaleFormData } from "@/lib/saleListing/saleListingFormTypes";
import {
  HOME_TYPES,
  LOT_SIZE_UNITS,
  YEAR_SELECT_SENTINEL,
  TIME_OPTIONS,
  APPLIANCE_OPTIONS,
  FLOORING_OPTIONS,
  ROOM_OPTIONS,
  BASEMENT_OPTIONS,
  INDOOR_FEATURES,
  COOLING_OPTIONS,
  HEATING_OPTIONS,
  ELECTRIC_OPTIONS,
  WATER_OPTIONS,
  WATER_HEATER_OPTIONS,
  BUILDING_AMENITY_OPTIONS,
  ARCHITECTURE_TYPE_OPTIONS,
  EXTERIOR_MATERIAL_OPTIONS,
  OUTDOOR_AMENITY_OPTIONS,
  PARKING_OPTIONS,
  ROOF_OPTIONS,
  STYLE_TYPE_OPTIONS,
  SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS,
  SALE_LISTING_DESCRIPTION_MAX_CHARS,
} from "@/lib/saleListing/saleListingFormConstants";
import {
  sanitizeDecimalChars,
  sanitizeIntegerDigits,
} from "@/lib/input/numericSanitize";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudUpload, Loader2, Plus, X } from "lucide-react";
import { SalePhoneVerificationBlock } from "@/components/sale-listing/SalePhoneVerificationBlock";
import {
  CheckboxGroup,
  RadioOptionGroup,
  CollapsibleSection,
  SubHeading,
  SectionHeading,
} from "@/components/sale-listing/SaleListingFormUi";

export type SaleFormPatch = (p: Partial<SaleFormData>) => void;

interface SalePhotoUploadPreview {
  id: string;
  name: string;
  previewUrl: string;
}

export const SaleListingPhotosBlock = memo(function SaleListingPhotosBlock({
  control,
  t,
  getRootProps,
  getInputProps,
  isDragActive,
  uploadingFiles,
  deletingIds,
  removePhoto,
}: {
  control: Control<SaleFormData>;
  t: (key: string) => string;
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  uploadingFiles: SalePhotoUploadPreview[];
  deletingIds: Set<string>;
  removePhoto: (index: number) => void;
}) {
  const photos = useWatch({ control, name: "photos" }) ?? [];

  return (
    <>
      <SectionHeading>{t("photos")}</SectionHeading>
      <p className="mb-3 text-sm text-muted-foreground">{t("photosDescription")}</p>
      <div
        {...getRootProps()}
        className={`flex min-h-40 max-w-lg cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 transition-colors ${
          isDragActive ? "border-brand bg-brand/10" : ""
        }`}
      >
        <input {...getInputProps()} />
        <CloudUpload className="size-8 text-brand" />
        <p className="mt-2 text-sm text-muted-foreground">
          {t("dragOrBrowse")}{" "}
          <span className="font-medium text-brand">{t("browse")}</span>
        </p>
      </div>
      {(photos.length > 0 || uploadingFiles.length > 0) && (
        <div className="mt-4 grid max-w-lg grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, i) => {
            const isDeleting = deletingIds.has(photo.id);
            return (
              <div key={photo.id} className="group relative aspect-square">
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className={`size-full rounded-lg object-cover${isDeleting ? " opacity-40" : ""}`}
                />
                {isDeleting ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/60">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={file.previewUrl}
                alt={file.name}
                className="size-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-brand" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
});

export const SaleListingVirtualTourHomeFactsBlock = memo(
  function SaleListingVirtualTourHomeFactsBlock({
    control,
    patch,
    t,
    tOpt,
    yearOptions,
  }: {
    control: Control<SaleFormData>;
    patch: SaleFormPatch;
    t: (key: string) => string;
    tOpt: (key: string) => string;
    yearOptions: string[];
  }) {
    const virtualTourUrl = useWatch({ control, name: "virtualTourUrl" }) ?? "";
    const homeType = useWatch({ control, name: "homeType" }) ?? "";
    const hoaDues = useWatch({ control, name: "hoaDues" }) ?? "";
    const beds = useWatch({ control, name: "beds" }) ?? "";
    const squareFootage = useWatch({ control, name: "squareFootage" }) ?? "";
    const garageSqFt = useWatch({ control, name: "garageSqFt" }) ?? "";
    const fullBaths = useWatch({ control, name: "fullBaths" }) ?? "";
    const threeFourthBaths = useWatch({ control, name: "threeFourthBaths" }) ?? "";
    const halfBaths = useWatch({ control, name: "halfBaths" }) ?? "";
    const quarterBaths = useWatch({ control, name: "quarterBaths" }) ?? "";
    const description = useWatch({ control, name: "description" }) ?? "";
    const finishedSqFt = useWatch({ control, name: "finishedSqFt" }) ?? "";
    const lotSize = useWatch({ control, name: "lotSize" }) ?? "";
    const lotSizeUnit = useWatch({ control, name: "lotSizeUnit" }) ?? "";
    const yearBuilt = useWatch({ control, name: "yearBuilt" }) ?? "";
    const structuralRemodelYear =
      useWatch({ control, name: "structuralRemodelYear" }) ?? "";

    return (
      <>
        <div className="mt-6 max-w-sm">
          <Label className="mb-1 block text-sm font-medium">
            {t("virtualTourUrl")}
          </Label>
          <Input
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder={t("virtualTourUrlPlaceholder")}
            value={virtualTourUrl}
            onChange={(e) => patch({ virtualTourUrl: e.target.value })}
            className="h-12"
          />
        </div>

        <SectionHeading>{t("homeFacts")}</SectionHeading>

        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-sm">{t("homeType")}</Label>
            <Select
              value={homeType}
              onValueChange={(v) => patch({ homeType: v ?? "" })}
            >
              <SelectTrigger className="h-12! w-full text-base">
                <SelectValue placeholder={t("homeTypePlaceholder")}>
                  {(value: string) => (value ? tOpt(`homeType.${value}`) : null)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {HOME_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tOpt(`homeType.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-sm">{t("hoaDues")}</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("hoaDuesPlaceholder")}
              value={hoaDues}
              onChange={(e) =>
                patch({ hoaDues: sanitizeDecimalChars(e.target.value) })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-12"
            />
          </div>
        </div>

        <div className="mt-4 grid max-w-2xl grid-cols-3 gap-4">
          <div>
            <Label className="mb-1 block text-sm">{t("beds")}</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("bedsPlaceholder")}
              value={beds}
              onChange={(e) =>
                patch({ beds: sanitizeIntegerDigits(e.target.value) })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-12"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm">{t("basementSqFt")}</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("basementSqFtPlaceholder")}
              value={squareFootage}
              onChange={(e) =>
                patch({
                  squareFootage: sanitizeDecimalChars(e.target.value),
                })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-12"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm">{t("garageSqFt")}</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("garageSqFtPlaceholder")}
              value={garageSqFt}
              onChange={(e) =>
                patch({ garageSqFt: sanitizeDecimalChars(e.target.value) })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-12"
            />
          </div>
        </div>

        <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-[1fr_1fr_1.5fr]">
          <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-4 sm:col-span-2">
            <div>
              <Label className="mb-1 block text-sm">{t("fullBaths")}</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t("bathCountPlaceholder")}
                value={fullBaths}
                onChange={(e) =>
                  patch({ fullBaths: sanitizeDecimalChars(e.target.value) })
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="h-12"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t("threeFourthBaths")}</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t("bathCountPlaceholder")}
                value={threeFourthBaths}
                onChange={(e) =>
                  patch({
                    threeFourthBaths: sanitizeDecimalChars(e.target.value),
                  })
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="h-12"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t("halfBaths")}</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t("bathCountPlaceholder")}
                value={halfBaths}
                onChange={(e) =>
                  patch({ halfBaths: sanitizeDecimalChars(e.target.value) })
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="h-12"
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">{t("quarterBaths")}</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t("bathCountPlaceholder")}
                value={quarterBaths}
                onChange={(e) =>
                  patch({
                    quarterBaths: sanitizeDecimalChars(e.target.value),
                  })
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="h-12"
              />
            </div>
          </div>

          <div className="row-span-1 flex min-h-0 w-full min-w-0 flex-col sm:row-span-1">
            <Label className="mb-1 block text-sm" htmlFor="sale-listing-description">
              {t("describeHome")}
            </Label>
            <div className="relative w-full max-w-full">
              <Textarea
                id="sale-listing-description"
                value={description}
                maxLength={SALE_LISTING_DESCRIPTION_MAX_CHARS}
                style={{ fieldSizing: "fixed" }}
                onChange={(e) =>
                  patch({
                    description: e.target.value.slice(
                      0,
                      SALE_LISTING_DESCRIPTION_MAX_CHARS
                    ),
                  })
                }
                className="h-[140px] min-h-[140px] max-h-[140px] w-full max-w-full resize-none overflow-y-auto py-2 pr-16 pb-7"
              />
              <span
                className="pointer-events-none absolute bottom-2 right-2.5 text-xs tabular-nums text-muted-foreground"
                aria-live="polite"
              >
                {description.length}/{SALE_LISTING_DESCRIPTION_MAX_CHARS}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 max-w-sm">
          <Label className="mb-1 block text-sm">{t("finishedSqFt")}</Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder={t("finishedSqFtPlaceholder")}
            value={finishedSqFt}
            onChange={(e) =>
              patch({ finishedSqFt: sanitizeDecimalChars(e.target.value) })
            }
            onWheel={(e) => e.currentTarget.blur()}
            className="h-12"
          />
        </div>

        <div className="mt-4 max-w-sm">
          <Label className="mb-1 block text-sm">{t("lotSize")}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("lotSizePlaceholder")}
              value={lotSize}
              onChange={(e) =>
                patch({ lotSize: sanitizeDecimalChars(e.target.value) })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-12 flex-1"
            />
            <Select
              value={lotSizeUnit.trim() ? lotSizeUnit : undefined}
              onValueChange={(v) => patch({ lotSizeUnit: v ?? "" })}
            >
              <SelectTrigger className="h-12! min-w-[8.5rem] text-base">
                <SelectValue>
                  {(value: string) =>
                    value ? tOpt(`lotSizeUnit.${value}`) : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LOT_SIZE_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {tOpt(`lotSizeUnit.${u}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 max-w-sm">
          <Label className="mb-1 block text-sm">{t("yearBuilt")}</Label>
          <Select
            value={
              yearBuilt.trim() ? yearBuilt.trim() : YEAR_SELECT_SENTINEL
            }
            onValueChange={(v) =>
              patch({
                yearBuilt:
                  v == null || v === YEAR_SELECT_SENTINEL ? "" : v,
              })
            }
          >
            <SelectTrigger className="h-12! w-full text-base">
              <SelectValue placeholder={t("yearSelectPlaceholder")}>
                {(value: string) =>
                  value && value !== YEAR_SELECT_SENTINEL ? value : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={YEAR_SELECT_SENTINEL}>
                {t("yearSelectPlaceholder")}
              </SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 max-w-sm">
          <Label className="mb-1 block text-sm">
            {t("structuralRemodelYear")}
          </Label>
          <Select
            value={
              structuralRemodelYear.trim()
                ? structuralRemodelYear.trim()
                : YEAR_SELECT_SENTINEL
            }
            onValueChange={(v) =>
              patch({
                structuralRemodelYear:
                  v == null || v === YEAR_SELECT_SENTINEL ? "" : v,
              })
            }
          >
            <SelectTrigger className="h-12! w-full text-base">
              <SelectValue placeholder={t("yearSelectPlaceholder")}>
                {(value: string) =>
                  value && value !== YEAR_SELECT_SENTINEL ? value : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={YEAR_SELECT_SENTINEL}>
                {t("yearSelectPlaceholder")}
              </SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={`sr-${y}`} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </>
    );
  }
);

export const SaleListingOpenHouseBlock = memo(function SaleListingOpenHouseBlock({
  control,
  t,
  addOpenHouse,
  updateOpenHouse,
  removeOpenHouse,
}: {
  control: Control<SaleFormData>;
  t: (key: string) => string;
  addOpenHouse: () => void;
  updateOpenHouse: (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string
  ) => void;
  removeOpenHouse: (index: number) => void;
}) {
  const openHouseDates =
    (useWatch({ control, name: "openHouseDates" }) as OpenHouseEntry[] | undefined) ??
    [];

  return (
    <>
      <SectionHeading>{t("openHouse")}</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        {t("openHouseDescription")}
      </p>
      {openHouseDates.map((entry, i) => (
        <div key={i} className="mb-3 flex items-end gap-3">
          <div className="flex-1">
            <Label className="mb-1 block text-sm">{t("date")}</Label>
            <Input
              type="date"
              value={entry.date}
              onChange={(e) => updateOpenHouse(i, "date", e.target.value)}
              className="h-12"
            />
          </div>
          <div className="w-36">
            <Label className="mb-1 block text-sm">{t("startTime")}</Label>
            <Select
              value={entry.startTime}
              onValueChange={(v) => updateOpenHouse(i, "startTime", v ?? "")}
            >
              <SelectTrigger className="h-12! w-full text-base">
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Label className="mb-1 block text-sm">{t("endTime")}</Label>
            <Select
              value={entry.endTime}
              onValueChange={(v) => updateOpenHouse(i, "endTime", v ?? "")}
            >
              <SelectTrigger className="h-12! w-full text-base">
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={`e-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeOpenHouse(i)}
            className="h-12 text-destructive"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOpenHouse}
        className="mt-1 flex cursor-pointer items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <Plus className="size-4" /> {t("addOpenHouse")}
      </button>
    </>
  );
});

export const SaleListingAdditionalInfoBlock = memo(
  function SaleListingAdditionalInfoBlock({
    control,
    patch,
    t,
  }: {
    control: Control<SaleFormData>;
    patch: SaleFormPatch;
    t: (key: string) => string;
  }) {
    const realtorWebsite = useWatch({ control, name: "realtorWebsite" }) ?? "";
    const additionalInfo = useWatch({ control, name: "additionalInfo" }) ?? "";

    return (
      <>
        <SectionHeading>{t("additionalInfo")}</SectionHeading>
        <div className="max-w-sm">
          <Label className="mb-1 block text-sm">{t("realtorWebsite")}</Label>
          <Input
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder={t("realtorWebsitePlaceholder")}
            value={realtorWebsite}
            onChange={(e) => patch({ realtorWebsite: e.target.value })}
            className="h-12"
          />
        </div>
        <div className="relative mt-4 max-w-sm">
          <Label className="mb-1 block text-sm" htmlFor="sale-listing-additional-info">
            {t("whatYouLove")}
          </Label>
          <div className="relative w-full">
            <Textarea
              id="sale-listing-additional-info"
              value={additionalInfo}
              maxLength={SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS}
              style={{ fieldSizing: "fixed" }}
              onChange={(e) =>
                patch({
                  additionalInfo: e.target.value.slice(
                    0,
                    SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS
                  ),
                })
              }
              placeholder={t("whatYouLovePlaceholder")}
              className="h-[104px] min-h-[104px] max-h-[104px] w-full resize-none overflow-y-auto py-2 pr-16 pb-7"
            />
            <span
              className="pointer-events-none absolute bottom-2 right-2.5 text-xs tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {additionalInfo.length}/{SALE_LISTING_ADDITIONAL_INFO_MAX_CHARS}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("whatYouLoveHelper")}
          </p>
        </div>
      </>
    );
  }
);

export const SaleListingRoomUtilityBlock = memo(function SaleListingRoomUtilityBlock({
  control,
  patch,
  t,
  tOpt,
  roomDetailsOpen,
  setRoomDetailsOpen,
  utilityDetailsOpen,
  setUtilityDetailsOpen,
}: {
  control: Control<SaleFormData>;
  patch: SaleFormPatch;
  t: (key: string) => string;
  tOpt: (key: string) => string;
  roomDetailsOpen: boolean;
  setRoomDetailsOpen: (v: boolean) => void;
  utilityDetailsOpen: boolean;
  setUtilityDetailsOpen: (v: boolean) => void;
}) {
  const appliances = useWatch({ control, name: "appliances" }) ?? [];
  const flooring = useWatch({ control, name: "flooring" }) ?? [];
  const rooms = useWatch({ control, name: "rooms" }) ?? [];
  const basement = useWatch({ control, name: "basement" }) ?? "";
  const totalRooms = useWatch({ control, name: "totalRooms" }) ?? "";
  const exteriorFeatures = useWatch({ control, name: "exteriorFeatures" }) ?? [];
  const cooling = useWatch({ control, name: "cooling" }) ?? [];
  const heating = useWatch({ control, name: "heating" }) ?? [];
  const electric = useWatch({ control, name: "electric" }) ?? [];
  const water = useWatch({ control, name: "water" }) ?? [];
  const waterHeater = useWatch({ control, name: "waterHeater" }) ?? [];

  return (
    <div className="mt-2">
      <div className="grid gap-6 lg:grid-cols-2">
        <CollapsibleSection
          title={t("roomDetails")}
          open={roomDetailsOpen}
          onToggle={() => setRoomDetailsOpen(!roomDetailsOpen)}
        >
          <SubHeading>{t("appliances")}</SubHeading>
          <CheckboxGroup
            groupId="appliances"
            options={APPLIANCE_OPTIONS}
            selected={appliances}
            onChange={(v) => patch({ appliances: v })}
            t={(k) => tOpt(`appliances.${k}`)}
          />

          <SubHeading>{t("floorCoverings")}</SubHeading>
          <CheckboxGroup
            groupId="flooring"
            options={FLOORING_OPTIONS}
            selected={flooring}
            onChange={(v) => patch({ flooring: v })}
            t={(k) => tOpt(`flooring.${k}`)}
          />

          <SubHeading>{t("rooms")}</SubHeading>
          <CheckboxGroup
            groupId="rooms"
            options={ROOM_OPTIONS}
            selected={rooms}
            onChange={(v) => patch({ rooms: v })}
            t={(k) => tOpt(`rooms.${k}`)}
          />

          <SubHeading>{t("basement")}</SubHeading>
          <RadioOptionGroup
            name="basement"
            options={BASEMENT_OPTIONS}
            selected={basement}
            onChange={(v) => patch({ basement: v })}
            t={(k) => tOpt(`basement.${k}`)}
          />

          <div className="mt-4">
            <Label className="mb-1 block text-sm font-medium">
              {t("totalRooms")}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("totalRoomsPlaceholder")}
              value={totalRooms}
              onChange={(e) =>
                patch({
                  totalRooms: sanitizeIntegerDigits(e.target.value),
                })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-10 w-full"
            />
          </div>

          <SubHeading>{t("indoorFeatures")}</SubHeading>
          <CheckboxGroup
            groupId="exteriorFeatures"
            options={INDOOR_FEATURES}
            selected={exteriorFeatures}
            onChange={(v) => patch({ exteriorFeatures: v })}
            t={(k) => tOpt(`indoorFeatures.${k}`)}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title={t("utilityDetails")}
          open={utilityDetailsOpen}
          onToggle={() => setUtilityDetailsOpen(!utilityDetailsOpen)}
        >
          <SubHeading>{t("cooling")}</SubHeading>
          <CheckboxGroup
            groupId="cooling"
            options={COOLING_OPTIONS}
            selected={cooling}
            onChange={(v) => patch({ cooling: v })}
            t={(k) => tOpt(`cooling.${k}`)}
          />

          <SubHeading>{t("heating")}</SubHeading>
          <CheckboxGroup
            groupId="heating"
            options={HEATING_OPTIONS}
            selected={heating}
            onChange={(v) => patch({ heating: v })}
            t={(k) => tOpt(`heating.${k}`)}
          />

          <SubHeading>{t("electric")}</SubHeading>
          <CheckboxGroup
            groupId="electric"
            options={ELECTRIC_OPTIONS}
            selected={electric}
            onChange={(v) => patch({ electric: v })}
            t={(k) => tOpt(`electric.${k}`)}
          />

          <SubHeading>{t("water")}</SubHeading>
          <CheckboxGroup
            groupId="water"
            options={WATER_OPTIONS}
            selected={water}
            onChange={(v) => patch({ water: v })}
            t={(k) => tOpt(`water.${k}`)}
          />

          <SubHeading>{t("waterHeater")}</SubHeading>
          <CheckboxGroup
            groupId="waterHeater"
            options={WATER_HEATER_OPTIONS}
            selected={waterHeater}
            onChange={(v) => patch({ waterHeater: v })}
            t={(k) => tOpt(`waterHeater.${k}`)}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
});

export const SaleListingBuildingBlock = memo(function SaleListingBuildingBlock({
  control,
  patch,
  t,
  tOpt,
  buildingDetailsOpen,
  setBuildingDetailsOpen,
}: {
  control: Control<SaleFormData>;
  patch: SaleFormPatch;
  t: (key: string) => string;
  tOpt: (key: string) => string;
  buildingDetailsOpen: boolean;
  setBuildingDetailsOpen: (v: boolean) => void;
}) {
  const buildingAmenities = useWatch({ control, name: "buildingAmenities" }) ?? [];
  const architectureType = useWatch({ control, name: "architectureType" }) ?? "";
  const exteriorMaterial = useWatch({ control, name: "exteriorMaterial" }) ?? [];
  const outdoorAmenities = useWatch({ control, name: "outdoorAmenities" }) ?? [];
  const stories = useWatch({ control, name: "stories" }) ?? "";
  const parking = useWatch({ control, name: "parking" }) ?? [];
  const parkingSpaces = useWatch({ control, name: "parkingSpaces" }) ?? "";
  const roof = useWatch({ control, name: "roof" }) ?? [];
  const styleType = useWatch({ control, name: "styleType" }) ?? "";

  return (
    <div className="mt-6 border-t border-border pt-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <CollapsibleSection
          title={t("buildingDetails")}
          open={buildingDetailsOpen}
          onToggle={() => setBuildingDetailsOpen(!buildingDetailsOpen)}
        >
          <SubHeading>{t("buildingAmenities")}</SubHeading>
          <CheckboxGroup
            groupId="buildingAmenities"
            options={BUILDING_AMENITY_OPTIONS}
            selected={buildingAmenities}
            onChange={(v) => patch({ buildingAmenities: v })}
            t={(k) => tOpt(`buildingAmenities.${k}`)}
          />

          <SubHeading>{t("architectureStyle")}</SubHeading>
          <RadioOptionGroup
            name="architectureType"
            options={ARCHITECTURE_TYPE_OPTIONS}
            selected={architectureType}
            onChange={(v) => patch({ architectureType: v })}
            t={(k) => tOpt(`architectureType.${k}`)}
          />

          <SubHeading>{t("exteriorMaterial")}</SubHeading>
          <CheckboxGroup
            groupId="exteriorMaterial"
            options={EXTERIOR_MATERIAL_OPTIONS}
            selected={exteriorMaterial}
            onChange={(v) => patch({ exteriorMaterial: v })}
            t={(k) => tOpt(`exteriorMaterial.${k}`)}
          />

          <SubHeading>{t("outdoorAmenities")}</SubHeading>
          <CheckboxGroup
            groupId="outdoorAmenities"
            options={OUTDOOR_AMENITY_OPTIONS}
            selected={outdoorAmenities}
            onChange={(v) => patch({ outdoorAmenities: v })}
            t={(k) => tOpt(`outdoorAmenities.${k}`)}
          />

          <div className="mt-4">
            <Label className="mb-1 block text-sm font-medium">
              {t("numberOfStories")}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("storiesPlaceholder")}
              value={stories}
              onChange={(e) =>
                patch({ stories: sanitizeDecimalChars(e.target.value) })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-10 max-w-sm"
            />
          </div>

          <SubHeading>{t("parking")}</SubHeading>
          <CheckboxGroup
            groupId="parking"
            options={PARKING_OPTIONS}
            selected={parking}
            onChange={(v) => patch({ parking: v })}
            t={(k) => tOpt(`parking.${k}`)}
          />

          <div className="mt-4">
            <Label className="mb-1 block text-sm font-medium">
              {t("parkingSpaces")}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("parkingSpacesPlaceholder")}
              value={parkingSpaces}
              onChange={(e) =>
                patch({
                  parkingSpaces: sanitizeIntegerDigits(e.target.value),
                })
              }
              onWheel={(e) => e.currentTarget.blur()}
              className="h-10 max-w-sm"
            />
          </div>

          <SubHeading>{t("roof")}</SubHeading>
          <CheckboxGroup
            groupId="roof"
            options={ROOF_OPTIONS}
            selected={roof}
            onChange={(v) => patch({ roof: v })}
            t={(k) => tOpt(`roof.${k}`)}
          />

          <SubHeading>{t("style")}</SubHeading>
          <RadioOptionGroup
            name="styleType"
            options={STYLE_TYPE_OPTIONS}
            selected={styleType}
            onChange={(v) => patch({ styleType: v })}
            t={(k) => tOpt(`styleType.${k}`)}
          />
        </CollapsibleSection>
        <div>{/* Right column intentionally empty */}</div>
      </div>
    </div>
  );
});

export const SaleListingContactFooterBlock = memo(
  function SaleListingContactFooterBlock({
    control,
    patch,
    setValue,
    t,
    handleSubmit,
    onValidSubmit,
    onInvalidSubmit,
    isSubmitting,
    isEditMode = false,
  }: {
    control: Control<SaleFormData>;
    patch: SaleFormPatch;
    setValue: UseFormSetValue<SaleFormData>;
    t: (key: string) => string;
    handleSubmit: UseFormHandleSubmit<SaleFormData, SaleFormData>;
    onValidSubmit: SubmitHandler<SaleFormData>;
    onInvalidSubmit: SubmitErrorHandler<SaleFormData>;
    isSubmitting: boolean;
    isEditMode?: boolean;
  }) {
    const contactPhone = useWatch({ control, name: "contactPhone" }) ?? "";
    const agreedToTerms = useWatch({ control, name: "agreedToTerms" }) ?? false;

    const submitDisabled =
      isSubmitting || (!isEditMode && !agreedToTerms);
    const submitLabel = isSubmitting
      ? isEditMode
        ? t("editSaving")
        : t("submitting")
      : isEditMode
        ? t("editSaveButton")
        : t("submitButton");

    return (
      <>
        <div className="mt-8 border-t border-border">
          <SectionHeading>{t("contactInformation")}</SectionHeading>
          <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
            {t("contactDescription")}
          </p>
          <div className="max-w-md">
            <Label className="mb-1 block text-sm font-medium">
              {t("phoneNumber")}
            </Label>
            <SalePhoneVerificationBlock
              contactPhone={contactPhone}
              onContactPhoneChange={(phoneE164) =>
                setValue("contactPhone", phoneE164, {
                  shouldDirty: true,
                  shouldValidate: false,
                })
              }
            />
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-8">
          {!isEditMode && (
            <label className="flex max-w-2xl cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  patch({ agreedToTerms: checked === true })
                }
                className="mt-0.5"
              />
              <span>{t("termsText")}</span>
            </label>
          )}

          <Button
            type="button"
            onClick={() =>
              void handleSubmit(onValidSubmit, onInvalidSubmit)()
            }
            disabled={submitDisabled}
            className="btn-brand-shadow mt-6 h-12 bg-brand px-10 text-white hover:bg-brand/90"
          >
            {submitLabel}
          </Button>
        </div>
      </>
    );
  }
);
