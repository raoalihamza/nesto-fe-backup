"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  useForm,
  Controller,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector, useAppDispatch } from "@/store";
import { resetSaleForm } from "@/store/slices/saleListingSlice";
import type { SaleFormData, SaleListingPhoto } from "@/lib/saleListing/saleListingFormTypes";
import { createEmptySaleFormData } from "@/lib/saleListing/saleListingFormTypes";
import { saleListingFormSchema } from "@/lib/saleListing/saleListingFormSchema";
import { saleListingMediaService } from "@/lib/api/saleListingMedia.service";
import { saleListingService } from "@/lib/api/saleListing.service";
import { buildCreateSaleListingBody } from "@/lib/saleListing/buildSaleListingPayload";
import type { ApiError } from "@/types/user";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants/routes";
import { sanitizeDecimalChars } from "@/lib/input/numericSanitize";
import { SectionHeading } from "@/components/sale-listing/SaleListingFormUi";
import {
  SaleListingPhotosBlock,
  SaleListingVirtualTourHomeFactsBlock,
  SaleListingOpenHouseBlock,
  SaleListingAdditionalInfoBlock,
  SaleListingRoomUtilityBlock,
  SaleListingBuildingBlock,
  SaleListingContactFooterBlock,
} from "@/components/sale-listing/SaleListingFormSections";

function firstZodIssueMessage(errors: FieldErrors<SaleFormData>): string | null {
  const walk = (o: unknown): string | null => {
    if (o == null || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message) return rec.message;
    for (const v of Object.values(rec)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const item of v) {
          const m = walk(item);
          if (m) return m;
        }
      } else {
        const m = walk(v);
        if (m) return m;
      }
    }
    return null;
  };
  return walk(errors);
}

interface SalePhotoUploadPreview {
  id: string;
  name: string;
  previewUrl: string;
}

// ─── Main component ─────────────────────────────────────────────────
export function SaleListingForm() {
  const t = useTranslations("saleListing.form");
  const tOpt = useTranslations("saleListing.options");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const address = useAppSelector((s) => s.saleListing.address);
  const validatedAddress = useAppSelector((s) => s.saleListing.validatedAddress);
  const salePhoneVerified = useAppSelector((s) => s.saleListing.salePhoneVerified);
  const verifiedSalePhone = useAppSelector((s) => s.saleListing.verifiedSalePhone);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<SaleFormData>({
    resolver: zodResolver(
      saleListingFormSchema
    ) as Resolver<SaleFormData>,
    defaultValues: createEmptySaleFormData(),
    mode: "onTouched",
  });

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => String(current - i));
  }, []);

  const patch = useCallback(
    (p: Partial<SaleFormData>) => {
      for (const [key, val] of Object.entries(p)) {
        setValue(key as keyof SaleFormData, val as never, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    },
    [setValue]
  );

  const [roomDetailsOpen, setRoomDetailsOpen] = useState(true);
  const [utilityDetailsOpen, setUtilityDetailsOpen] = useState(true);
  const [buildingDetailsOpen, setBuildingDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<SalePhotoUploadPreview[]>(
    []
  );
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const currentPhotos = getValues("photos");
      const uniqueFiles = acceptedFiles.filter((file) => {
        const isDuplicate = currentPhotos.some(
          (p) =>
            p.fileName === file.name && p.fileSizeBytes === file.size
        );
        if (isDuplicate) {
          toast.error(t("duplicatePhoto", { name: file.name }));
        }
        return !isDuplicate;
      });

      if (uniqueFiles.length === 0) return;

      const previews: SalePhotoUploadPreview[] = uniqueFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
      setUploadingFiles((prev) => [...prev, ...previews]);

      try {
        const photosLen = getValues("photos").length;
        const presignResult = await saleListingMediaService.presignMedia({
          files: uniqueFiles.map((file, i) => ({
            listingType: "SALE" as const,
            mediaType: "PHOTO" as const,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            fileSizeBytes: file.size,
            sortOrder: photosLen + i,
            metadata: { source: "sale-listing-form" },
          })),
        });

        const uploadResults = await Promise.allSettled(
          presignResult.uploads.map(async (upload, i) => {
            const file = uniqueFiles[i];
            const response = await fetch(upload.uploadUrl, {
              method: upload.method,
              body: file,
              headers: upload.headers,
            });
            if (!response.ok) throw new Error(`Upload failed: ${file.name}`);
            return { upload, file, index: i };
          })
        );

        const successfulUploads = uploadResults
          .filter(
            (
              r
            ): r is PromiseFulfilledResult<{
              upload: (typeof presignResult.uploads)[number];
              file: File;
              index: number;
            }> => r.status === "fulfilled"
          )
          .map((r) => r.value);

        const failedCount = uploadResults.length - successfulUploads.length;
        if (failedCount > 0) {
          toast.error(t("photoPartialFailure", { count: failedCount }));
        }

        if (successfulUploads.length > 0) {
          const baseLen = getValues("photos").length;
          const confirmed = await saleListingMediaService.confirmMedia({
            uploads: successfulUploads.map(({ upload, file, index }) => ({
              uploadId: upload.uploadId,
              fileSizeBytes: file.size,
              sortOrder: baseLen + index,
              metadata: { confirmedBy: "sale-listing-form" },
            })),
          });

          const byId = new Map(
            confirmed.photos.map((item) => [item.id, item] as [string, typeof item])
          );
          for (const item of confirmed.items) {
            if (!byId.has(item.id)) {
              byId.set(item.id, item);
            }
          }

          const newPhotos: SaleListingPhoto[] = successfulUploads
            .map(({ upload }) => byId.get(upload.uploadId))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .map((item) => ({
              id: item.id,
              url: item.url,
              fileName: item.fileName,
              fileSizeBytes: item.fileSizeBytes,
            }));

          setValue("photos", [...getValues("photos"), ...newPhotos], {
            shouldDirty: true,
            shouldValidate: false,
          });
        }
      } catch {
        toast.error(t("photoUploadError"));
      } finally {
        setUploadingFiles((prev) => {
          previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
          return prev.filter((f) => !previews.some((pr) => pr.id === f.id));
        });
      }
    },
    [getValues, setValue, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  const removePhoto = async (index: number) => {
    const photos = getValues("photos");
    const photo = photos[index];
    if (!photo || deletingIds.has(photo.id)) return;
    setDeletingIds((prev) => new Set(prev).add(photo.id));
    try {
      await saleListingMediaService.deleteMedia(photo.id);
      setValue(
        "photos",
        photos.filter((_, i) => i !== index),
        { shouldDirty: true, shouldValidate: false }
      );
    } catch {
      toast.error(t("photoDeleteError"));
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(photo.id);
        return next;
      });
    }
  };

  const addOpenHouse = () => {
    setValue(
      "openHouseDates",
      [...getValues("openHouseDates"), { date: "", startTime: "", endTime: "" }],
      { shouldDirty: true }
    );
  };

  const updateOpenHouse = (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string
  ) => {
    const updated = getValues("openHouseDates").map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setValue("openHouseDates", updated, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const removeOpenHouse = (index: number) => {
    setValue(
      "openHouseDates",
      getValues("openHouseDates").filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: false }
    );
  };

  const onValidSubmit = async (data: SaleFormData) => {
    if (!validatedAddress) {
      toast.error(t("submitMissingValidatedAddress"));
      return;
    }
    if (!salePhoneVerified || !verifiedSalePhone) {
      toast.error(t("submitPhoneNotVerified"));
      return;
    }
    const contact = data.contactPhone.trim();
    if (contact !== verifiedSalePhone.trim()) {
      toast.error(t("submitPhoneMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const body = buildCreateSaleListingBody(validatedAddress, data);
      await saleListingService.createListing(body);
      dispatch(resetSaleForm());
      reset(createEmptySaleFormData());
      router.push(ROUTES.OWNER.DASHBOARD);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        toast.error((error as ApiError).message || t("submitError"));
      } else {
        toast.error(t("submitError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = (fieldErrors: FieldErrors<SaleFormData>) => {
    const msg = firstZodIssueMessage(fieldErrors);
    toast.error(msg || t("submitError"));
  };

  const addressText = [
    address.street,
    address.city,
    address.state,
    address.zip,
  ]
    .filter(Boolean)
    .join(", ");
  const displayAddress =
    validatedAddress?.formattedAddress?.trim() || addressText;

  return (
    <div className="max-w-4xl px-6 py-8 lg:px-10">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-base font-medium text-foreground">{displayAddress}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("addressLockedHint")}</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="mb-8 border-b border-border pb-6">
        <SectionHeading>{t("setYourPrice")}</SectionHeading>
        <div className="relative max-w-xs">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="decimal"
                value={
                  field.value === null || field.value === undefined
                    ? ""
                    : String(field.value)
                }
                onChange={(e) => {
                  const sanitized = sanitizeDecimalChars(e.target.value);
                  if (sanitized === "" || sanitized === ".") {
                    field.onChange(null);
                    return;
                  }
                  const n = Number(sanitized);
                  field.onChange(Number.isFinite(n) ? n : null);
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className="h-12 pl-7"
                placeholder="0"
              />
            )}
          />
          {errors.price ? (
            <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mb-8 border-b border-border pb-8">
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
        <SaleListingPhotosBlock
          control={control}
          t={t}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          uploadingFiles={uploadingFiles}
          deletingIds={deletingIds}
          removePhoto={removePhoto}
        />
        <SaleListingVirtualTourHomeFactsBlock
          control={control}
          patch={patch}
          t={t}
          tOpt={tOpt}
          yearOptions={yearOptions}
        />
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <SaleListingOpenHouseBlock
          control={control}
          t={t}
          addOpenHouse={addOpenHouse}
          updateOpenHouse={updateOpenHouse}
          removeOpenHouse={removeOpenHouse}
        />
      </div>

      <div className="mb-8 pb-8">
        <SaleListingAdditionalInfoBlock control={control} patch={patch} t={t} />
      </div>

      <SaleListingRoomUtilityBlock
        control={control}
        patch={patch}
        t={t}
        tOpt={tOpt}
        roomDetailsOpen={roomDetailsOpen}
        setRoomDetailsOpen={setRoomDetailsOpen}
        utilityDetailsOpen={utilityDetailsOpen}
        setUtilityDetailsOpen={setUtilityDetailsOpen}
      />

      <SaleListingBuildingBlock
        control={control}
        patch={patch}
        t={t}
        tOpt={tOpt}
        buildingDetailsOpen={buildingDetailsOpen}
        setBuildingDetailsOpen={setBuildingDetailsOpen}
      />

      <SaleListingContactFooterBlock
        control={control}
        patch={patch}
        setValue={setValue}
        t={t}
        handleSubmit={handleSubmit}
        onValidSubmit={onValidSubmit}
        onInvalidSubmit={onInvalidSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
