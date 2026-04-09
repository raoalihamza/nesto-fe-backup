"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setSaleFormData,
  setIsDirty,
  resetSaleForm,
  type SaleFormData,
} from "@/store/slices/saleListingSlice";
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
import { CloudUpload, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants/routes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Option constants ───────────────────────────────────────────────
const HOME_TYPES = [
  "single_family",
  "condo",
  "townhouse",
  "multi_family",
  "land",
] as const;

const LOT_SIZE_UNITS = ["sqft", "acres"] as const;

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00",
] as const;

// Room Details > Appliance
const APPLIANCE_OPTIONS = [
  "dishwasher", "range_oven", "central_ac", "clothes",
  "dryer", "refrigerator", "carpeting", "solar",
  "freezer", "trash_compactor", "geothermal", "other_appliance",
  "garbage_disposal", "washer",
] as const;

// Room Details > Floor covering
const FLOORING_OPTIONS = [
  "carpet", "other_floor", "softwood",
  "concrete", "tile",
  "hardwood", "electric_floor",
  "laminate", "oil",
  "linoleum_vinyl", "propane_butane",
] as const;

// Room Details > Rooms
const ROOM_OPTIONS = [
  "breakfast_nook", "office", "dining_room", "pantry",
  "family_room", "recreation_room", "laundry_room", "bedroom_extra",
  "library", "sun_room", "master_bath", "walk_in_closet",
  "main_room", "exercise_room",
] as const;

// Indoor features
const INDOOR_FEATURES = [
  "attic", "mother_in_law_apartment",
  "cable_ready", "security_system",
  "ceiling_fans", "skylight",
  "double_pane_windows", "vaulted_ceiling",
  "fireplace", "whirlpool",
  "intercom_system", "wired",
  "loft_sub",
] as const;

// Utility Details > Cooling
const COOLING_OPTIONS = [
  "central_cool", "evaporative",
  "geothermal_cool", "refrigeration_cool",
  "heat_pump_cool", "solar_cool",
  "none_cool", "wall_cool",
] as const;

// Utility Details > Heating
const HEATING_OPTIONS = [
  "baseboard", "radiant", "blower",
  "forced_air", "electric_heat", "stove",
  "geothermal_heat", "coal", "other_heat",
  "heat_pump",
] as const;

const ELECTRIC_OPTIONS = [
  "110_volt", "220_volt", "circuit_breakers", "other_electric",
] as const;

const WATER_OPTIONS = ["city_water", "well", "none_water"] as const;

const WATER_HEATER_OPTIONS = [
  "gas_heater", "electric_heater", "solar_heater", "none_heater",
] as const;

// Building Details
const BUILDING_AMENITY_OPTIONS = [
  "assisted_living_community", "concierge",
  "basketball_court", "near_transportation",
  "controlled_access", "over_55_active_community",
  "disabled_access", "sports_court",
  "doorman", "storage",
  "elevator", "tennis_court",
  "fitness_center",
] as const;

const ARCHITECTURE_TYPE_OPTIONS = [
  "bungalow", "modern", "ranch_rambler",
  "cape_cod", "queen_anne_victorian",
  "colonial", "santa_fe_pueblo_style",
  "contemporary", "spanish",
  "craftsman", "split_level",
  "french", "tudor",
  "georgian", "loft_arch",
  "other_arch",
] as const;

const EXTERIOR_MATERIAL_OPTIONS = [
  "brick", "stucco",
  "cement_concrete", "vinyl",
  "composition", "wood",
  "metal", "wood_products",
  "shingle", "other_exterior",
  "stone",
] as const;

const OUTDOOR_AMENITY_OPTIONS = [
  "balcony_patio", "lawn",
  "barbecue_area", "pond",
  "deck", "pool",
  "dock", "rv_parking",
  "fenced_yard", "sauna",
  "garden", "sprinkler_system",
  "greenhouse", "waterfront",
  "hot_surface",
] as const;

const PARKING_OPTIONS = [
  "carport", "off_street",
  "built_in_area", "on_street",
  "deck_parking", "none_parking",
  "dock_parking", "rv_parking_lot",
] as const;

const ROOF_OPTIONS = [
  "asphalt", "shake_shingle",
  "roll_up", "slate",
  "composition", "tile_roof",
  "metal_roof", "other_roof",
  "gravel",
] as const;

const STYLE_TYPE_OPTIONS = [
  "city", "territorial",
  "mountain", "none_style",
  "field",
] as const;

// ─── Checkbox group (vertical list, Amenities-step style) ───────────
function CheckboxGroup({
  options,
  selected,
  onChange,
  t,
  columns = 2,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (updated: string[]) => void;
  t: (key: string) => string;
  columns?: number;
}) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div
      className={`mt-3 grid gap-x-16 gap-y-3 ${
        columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "grid-cols-3"
            : "grid-cols-1"
      }`}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-3">
          <Checkbox
            id={`cb-${option}`}
            checked={selected.includes(option)}
            onCheckedChange={() => toggle(option)}
          />
          <Label
            htmlFor={`cb-${option}`}
            className="text-sm font-normal text-foreground"
          >
            {t(option)}
          </Label>
        </div>
      ))}
    </div>
  );
}

// ─── Radio group (vertical list, Amenities-step style) ──────────────
function RadioOptionGroup({
  name,
  options,
  selected,
  onChange,
  t,
  columns = 2,
}: {
  name: string;
  options: readonly string[];
  selected: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
  columns?: number;
}) {
  return (
    <div
      className={`mt-3 grid gap-x-16 gap-y-3 ${
        columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "grid-cols-3"
            : "grid-cols-1"
      }`}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-3">
          <input
            type="radio"
            name={name}
            id={`radio-${name}-${option}`}
            checked={selected === option}
            onChange={() => onChange(option)}
            className="size-4 accent-brand"
          />
          <Label
            htmlFor={`radio-${name}-${option}`}
            className="text-sm font-normal text-foreground"
          >
            {t(option)}
          </Label>
        </div>
      ))}
    </div>
  );
}

// ─── Collapsible section ────────────────────────────────────────────
function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between py-2"
      >
        <h2 className="text-xs font-bold tracking-wider text-foreground uppercase">
          {title}
        </h2>
        {open ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="mt-2 pb-4">{children}</div>}
    </div>
  );
}

// ─── Sub-section heading (small, light) ─────────────────────────────
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 mb-1 text-xs font-medium text-muted-foreground first:mt-0">
      {children}
    </h3>
  );
}

// ─── Section divider heading ────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 text-lg font-bold text-foreground">{children}</h2>
  );
}

// ─── Main component ─────────────────────────────────────────────────
export function SaleListingForm() {
  const t = useTranslations("saleListing.form");
  const tOpt = useTranslations("saleListing.options");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const address = useAppSelector((s) => s.saleListing.address);
  const formData = useAppSelector((s) => s.saleListing.formData);
  const isDirty = useAppSelector((s) => s.saleListing.isDirty);

  const [roomDetailsOpen, setRoomDetailsOpen] = useState(true);
  const [utilityDetailsOpen, setUtilityDetailsOpen] = useState(true);
  const [buildingDetailsOpen, setBuildingDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Field update helper
  const update = useCallback(
    (data: Partial<SaleFormData>) => {
      dispatch(setSaleFormData(data));
      dispatch(setIsDirty(true));
    },
    [dispatch]
  );

  // Photo upload
  const onDrop = useCallback(
    (files: File[]) => {
      const urls = files.map((f) => URL.createObjectURL(f));
      update({ photos: [...formData.photos, ...urls] });
    },
    [formData.photos, update]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  const removePhoto = (index: number) => {
    update({ photos: formData.photos.filter((_, i) => i !== index) });
  };

  // Open house management
  const addOpenHouse = () => {
    update({
      openHouseDates: [
        ...formData.openHouseDates,
        { date: "", startTime: "", endTime: "" },
      ],
    });
  };

  const updateOpenHouse = (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string
  ) => {
    const updated = formData.openHouseDates.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    update({ openHouseDates: updated });
  };

  const removeOpenHouse = (index: number) => {
    update({
      openHouseDates: formData.openHouseDates.filter((_, i) => i !== index),
    });
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.agreedToTerms) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/listings/sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, formData }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? t("submitError"));
      }

      dispatch(resetSaleForm());
      router.push(ROUTES.OWNER.DASHBOARD);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("submitError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addressText = [
    address.street,
    address.city,
    address.state,
    address.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl px-6 py-8 lg:px-10">
      {/* ── Header ── */}
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-base font-medium text-foreground">
        {addressText}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {t("subtitle")}
      </p>

      {/* ── Set your price ── */}
      <SectionHeading>{t("setYourPrice")}</SectionHeading>
      <div className="relative max-w-xs">
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          value={formData.price ?? ""}
          onChange={(e) =>
            update({ price: e.target.value ? Number(e.target.value) : null })
          }
          className="h-12 pl-7"
          placeholder="0"
        />
      </div>

      {/* ── 3D Home ── */}
      <SectionHeading>{t("home3D")}</SectionHeading>
      <p className="text-sm text-muted-foreground">
        {t("home3DDescription")}{" "}
        <button
          type="button"
          className="font-medium text-brand hover:underline"
        >
          {t("tryItFree")}
        </button>
      </p>

      {/* ── Photos ── */}
      <SectionHeading>{t("photos")}</SectionHeading>
      <p className="mb-3 text-sm text-muted-foreground">
        {t("photosDescription")}
      </p>
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
      {formData.photos.length > 0 && (
        <div className="mt-4 grid max-w-lg grid-cols-3 gap-3 sm:grid-cols-4">
          {formData.photos.map((url, i) => (
            <div key={i} className="group relative aspect-square">
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="size-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Virtual tour URL ── */}
      <div className="mt-6 max-w-sm">
        <Label className="mb-1 block text-sm font-medium">
          {t("virtualTourUrl")}
        </Label>
        <Input
          placeholder="www.sample.com"
          value={formData.virtualTourUrl}
          onChange={(e) => update({ virtualTourUrl: e.target.value })}
          className="h-12"
        />
      </div>

      {/* ── Home facts ── */}
      <SectionHeading>{t("homeFacts")}</SectionHeading>

      {/* Row 1: Home type | HOA dues */}
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-sm">{t("homeType")}</Label>
          <Select
            value={formData.homeType}
            onValueChange={(v) => update({ homeType: v ?? "" })}
          >
            <SelectTrigger className="h-12! w-full text-base">
              <SelectValue placeholder={t("homeTypePlaceholder")}>
                {(value: string) => value ? tOpt(`homeType.${value}`) : null}
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
            placeholder="www.sample.com"
            value={formData.hoaDues}
            onChange={(e) => update({ hoaDues: e.target.value })}
            className="h-12"
          />
        </div>
      </div>

      {/* Row 2: Beds | Basement sq ft | Garage sq ft */}
      <div className="mt-4 grid max-w-2xl grid-cols-3 gap-4">
        <div>
          <Label className="mb-1 block text-sm">{t("beds")}</Label>
          <Input
            value={formData.beds}
            onChange={(e) => update({ beds: e.target.value })}
            className="h-12"
          />
        </div>
        <div>
          <Label className="mb-1 block text-sm">{t("basementSqFt")}</Label>
          <Input
            value={formData.squareFootage}
            onChange={(e) => update({ squareFootage: e.target.value })}
            className="h-12"
          />
        </div>
        <div>
          <Label className="mb-1 block text-sm">{t("garageSqFt")}</Label>
          <Input
            value={formData.finishedSqFt}
            onChange={(e) => update({ finishedSqFt: e.target.value })}
            className="h-12"
          />
        </div>
      </div>

      {/* Row 3–4: Bath fields (left 2 cols) | Describe your home textarea (right) */}
      <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-[1fr_1fr_1.5fr]">
        {/* Left bath columns — 2 rows */}
        <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-4 sm:col-span-2">
          <div>
            <Label className="mb-1 block text-sm">{t("fullBaths")}</Label>
            <Input
              value={formData.fullBaths}
              onChange={(e) => update({ fullBaths: e.target.value })}
              className="h-12"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm">{t("threeFourthBaths")}</Label>
            <Input
              value={formData.threeFourthBaths}
              onChange={(e) => update({ threeFourthBaths: e.target.value })}
              className="h-12"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm">{t("halfBaths")}</Label>
            <Input
              value={formData.halfBaths}
              onChange={(e) => update({ halfBaths: e.target.value })}
              className="h-12"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm">{t("quarterBaths")}</Label>
            <Input
              value={formData.quarterBaths}
              onChange={(e) => update({ quarterBaths: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        {/* Right: Describe your home (spans full height) */}
        <div className="row-span-1 flex flex-col sm:row-span-1">
          <Label className="mb-1 block text-sm">{t("describeHome")}</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => update({ description: e.target.value })}
            className="min-h-[140px] flex-1 resize-y"
          />
        </div>
      </div>

      {/* Finished sq ft */}
      <div className="mt-4 max-w-sm">
        <Label className="mb-1 block text-sm">{t("finishedSqFt")}</Label>
        <Input
          placeholder="www.sample.com"
          value={formData.finishedSqFt}
          onChange={(e) => update({ finishedSqFt: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Lot size */}
      <div className="mt-4 max-w-sm">
        <Label className="mb-1 block text-sm">{t("lotSize")}</Label>
        <div className="flex gap-2">
          <Input
            value={formData.lotSize}
            onChange={(e) => update({ lotSize: e.target.value })}
            className="h-12 flex-1"
          />
          <Select
            value={formData.lotSizeUnit}
            onValueChange={(v) => update({ lotSizeUnit: v ?? "" })}
          >
            <SelectTrigger className="h-12! w-28 text-base">
              <SelectValue>
                {(value: string) => value ? tOpt(`lotSizeUnit.${value}`) : null}
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

      {/* Year built */}
      <div className="mt-4 max-w-sm">
        <Label className="mb-1 block text-sm">{t("yearBuilt")}</Label>
        <Input
          value={formData.yearBuilt}
          onChange={(e) => update({ yearBuilt: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Structural remodel year */}
      <div className="mt-4 max-w-sm">
        <Label className="mb-1 block text-sm">
          {t("structuralRemodelYear")}
        </Label>
        <Input
          value={formData.structuralRemodelYear}
          onChange={(e) => update({ structuralRemodelYear: e.target.value })}
          className="h-12"
        />
      </div>

      {/* ── Open house ── */}
      <SectionHeading>{t("openHouse")}</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        {t("openHouseDescription")}
      </p>
      {formData.openHouseDates.map((entry, i) => (
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
              onValueChange={(v) =>
                updateOpenHouse(i, "startTime", v ?? "")
              }
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
              onValueChange={(v) =>
                updateOpenHouse(i, "endTime", v ?? "")
              }
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

      {/* ── Additional information ── */}
      <SectionHeading>{t("additionalInfo")}</SectionHeading>
      <div className="max-w-sm">
        <Label className="mb-1 block text-sm">{t("realtorWebsite")}</Label>
        <Input
          placeholder="www.sample.com"
          value={formData.realtorWebsite}
          onChange={(e) => update({ realtorWebsite: e.target.value })}
          className="h-12"
        />
      </div>
      <div className="mt-4 max-w-sm">
        <Label className="mb-1 block text-sm">{t("whatYouLove")}</Label>
        <Textarea
          value={formData.additionalInfo}
          onChange={(e) => update({ additionalInfo: e.target.value })}
          rows={4}
          placeholder={t("whatYouLovePlaceholder")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t("whatYouLoveHelper")}
        </p>
      </div>

      {/* ── ROOM DETAILS & UTILITY DETAILS — side by side ── */}
      <div className="mt-10 border-t border-border pt-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: Room Details */}
          <CollapsibleSection
            title={t("roomDetails")}
            open={roomDetailsOpen}
            onToggle={() => setRoomDetailsOpen(!roomDetailsOpen)}
          >
            <SubHeading>{t("appliances")}</SubHeading>
            <CheckboxGroup
              options={APPLIANCE_OPTIONS}
              selected={formData.appliances}
              onChange={(v) => update({ appliances: v })}
              t={(k) => tOpt(`appliances.${k}`)}
            />

            <SubHeading>{t("floorCoverings")}</SubHeading>
            <CheckboxGroup
              options={FLOORING_OPTIONS}
              selected={formData.flooring}
              onChange={(v) => update({ flooring: v })}
              t={(k) => tOpt(`flooring.${k}`)}
            />

            <SubHeading>{t("rooms")}</SubHeading>
            <CheckboxGroup
              options={ROOM_OPTIONS}
              selected={formData.rooms}
              onChange={(v) => update({ rooms: v })}
              t={(k) => tOpt(`rooms.${k}`)}
            />

            <div className="mt-4">
              <Label className="mb-1 block text-sm font-medium">
                {t("totalRooms")}
              </Label>
              <Input
                type="number"
                value={formData.totalRooms}
                onChange={(e) => update({ totalRooms: e.target.value })}
                className="h-12 w-full"
              />
            </div>

            <SubHeading>{t("indoorFeatures")}</SubHeading>
            <CheckboxGroup
              options={INDOOR_FEATURES}
              selected={formData.exteriorFeatures}
              onChange={(v) => update({ exteriorFeatures: v })}
              t={(k) => tOpt(`indoorFeatures.${k}`)}
            />
          </CollapsibleSection>

          {/* RIGHT: Utility Details */}
          <CollapsibleSection
            title={t("utilityDetails")}
            open={utilityDetailsOpen}
            onToggle={() => setUtilityDetailsOpen(!utilityDetailsOpen)}
          >
            <SubHeading>{t("cooling")}</SubHeading>
            <CheckboxGroup
              options={COOLING_OPTIONS}
              selected={formData.cooling}
              onChange={(v) => update({ cooling: v })}
              t={(k) => tOpt(`cooling.${k}`)}
            />

            <SubHeading>{t("heating")}</SubHeading>
            <CheckboxGroup
              options={HEATING_OPTIONS}
              selected={formData.heating}
              onChange={(v) => update({ heating: v })}
              t={(k) => tOpt(`heating.${k}`)}
            />

            <SubHeading>{t("electric")}</SubHeading>
            <CheckboxGroup
              options={ELECTRIC_OPTIONS}
              selected={formData.electric}
              onChange={(v) => update({ electric: v })}
              t={(k) => tOpt(`electric.${k}`)}
            />

            <SubHeading>{t("water")}</SubHeading>
            <CheckboxGroup
              options={WATER_OPTIONS}
              selected={formData.water}
              onChange={(v) => update({ water: v })}
              t={(k) => tOpt(`water.${k}`)}
            />

            <SubHeading>{t("waterHeater")}</SubHeading>
            <CheckboxGroup
              options={WATER_HEATER_OPTIONS}
              selected={formData.waterHeater}
              onChange={(v) => update({ waterHeater: v })}
              t={(k) => tOpt(`waterHeater.${k}`)}
            />
          </CollapsibleSection>
        </div>
      </div>

      {/* ── BUILDING DETAILS (collapsible) ── */}
      <div className="mt-6 border-t border-border pt-6">
        <CollapsibleSection
          title={t("buildingDetails")}
          open={buildingDetailsOpen}
          onToggle={() => setBuildingDetailsOpen(!buildingDetailsOpen)}
        >
          <SubHeading>{t("buildingAmenities")}</SubHeading>
          <CheckboxGroup
            options={BUILDING_AMENITY_OPTIONS}
            selected={formData.buildingAmenities}
            onChange={(v) => update({ buildingAmenities: v })}
            t={(k) => tOpt(`buildingAmenities.${k}`)}
          />

          <SubHeading>{t("architectureStyle")}</SubHeading>
          <RadioOptionGroup
            name="architectureType"
            options={ARCHITECTURE_TYPE_OPTIONS}
            selected={formData.architectureType}
            onChange={(v) => update({ architectureType: v })}
            t={(k) => tOpt(`architectureType.${k}`)}
          />

          <SubHeading>{t("exteriorMaterial")}</SubHeading>
          <CheckboxGroup
            options={EXTERIOR_MATERIAL_OPTIONS}
            selected={formData.exteriorMaterial}
            onChange={(v) => update({ exteriorMaterial: v })}
            t={(k) => tOpt(`exteriorMaterial.${k}`)}
          />

          <SubHeading>{t("outdoorAmenities")}</SubHeading>
          <CheckboxGroup
            options={OUTDOOR_AMENITY_OPTIONS}
            selected={formData.outdoorAmenities}
            onChange={(v) => update({ outdoorAmenities: v })}
            t={(k) => tOpt(`outdoorAmenities.${k}`)}
          />

          <div className="mt-4">
            <Label className="mb-1 block text-sm font-medium">
              {t("numberOfStories")}
            </Label>
            <Input
              type="number"
              value={formData.stories}
              onChange={(e) => update({ stories: e.target.value })}
              className="h-12 w-48"
            />
          </div>

          <SubHeading>{t("parking")}</SubHeading>
          <CheckboxGroup
            options={PARKING_OPTIONS}
            selected={formData.parking}
            onChange={(v) => update({ parking: v })}
            t={(k) => tOpt(`parking.${k}`)}
          />

          <div className="mt-4">
            <Label className="mb-1 block text-sm font-medium">
              {t("parkingSpaces")}
            </Label>
            <Input
              type="number"
              value={formData.parkingSpaces}
              onChange={(e) => update({ parkingSpaces: e.target.value })}
              className="h-12 w-48"
            />
          </div>

          <SubHeading>{t("roof")}</SubHeading>
          <CheckboxGroup
            options={ROOF_OPTIONS}
            selected={formData.roof}
            onChange={(v) => update({ roof: v })}
            t={(k) => tOpt(`roof.${k}`)}
          />

          <SubHeading>{t("style")}</SubHeading>
          <RadioOptionGroup
            name="styleType"
            options={STYLE_TYPE_OPTIONS}
            selected={formData.styleType}
            onChange={(v) => update({ styleType: v })}
            t={(k) => tOpt(`styleType.${k}`)}
          />
        </CollapsibleSection>
      </div>

      {/* ── Contact Information ── */}
      <SectionHeading>{t("contactInformation")}</SectionHeading>
      <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
        {t("contactDescription")}
      </p>
      <div className="max-w-sm">
        <Label className="mb-1 block text-sm">{t("phoneNumber")}</Label>
        <Input
          type="tel"
          value={formData.contactPhone}
          onChange={(e) => update({ contactPhone: e.target.value })}
          className="h-12"
          placeholder={t("phoneNumberPlaceholder")}
        />
      </div>

      {/* ── Terms + Submit ── */}
      <div className="mt-10 border-t border-border pt-8">
        <label className="flex max-w-2xl cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <Checkbox
            checked={formData.agreedToTerms}
            onCheckedChange={(checked) =>
              update({ agreedToTerms: checked === true })
            }
            className="mt-0.5"
          />
          <span>{t("termsText")}</span>
        </label>

        <Button
          onClick={handleSubmit}
          disabled={!formData.agreedToTerms || isSubmitting}
          className="btn-brand-shadow mt-6 h-12 bg-brand px-10 text-white hover:bg-brand/90"
        >
          {isSubmitting ? t("submitting") : t("submitButton")}
        </Button>
      </div>
    </div>
  );
}
