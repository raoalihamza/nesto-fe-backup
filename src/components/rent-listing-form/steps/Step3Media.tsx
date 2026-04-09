"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { useAppSelector, useAppDispatch } from "@/store";
import { setMedia, restoreFromDraft } from "@/store/slices/listingFormSlice";
import type { DraftMediaItem } from "@/store/slices/listingFormSlice";
import { rentDraftService } from "@/lib/api/rentDraft.service";
import { toast } from "sonner";
import { CloudUpload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface UploadingFile {
  id: string;
  name: string;
  previewUrl: string;
}

export function Step3Media() {
  const t = useTranslations("listing.media");
  const dispatch = useAppDispatch();
  const media = useAppSelector((s) => s.listingForm.formData.media);
  const draftId = useAppSelector((s) => s.listingForm.draftId);

  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourUrlInput, setTourUrlInput] = useState(media.tours3d[0]?.url ?? "");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!draftId) {
        toast.error("Please save Property Info first before uploading photos.");
        return;
      }

      // Filter out duplicates (same name + size as already uploaded photos)
      const uniqueFiles = acceptedFiles.filter((file) => {
        const isDuplicate = media.photos.some(
          (p) => p.fileName === file.name && p.fileSizeBytes === file.size
        );
        if (isDuplicate) {
          toast.error(t("duplicatePhoto", { name: file.name }));
        }
        return !isDuplicate;
      });

      if (uniqueFiles.length === 0) return;

      // Create local previews with loading state
      const previews: UploadingFile[] = uniqueFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
      setUploadingFiles((prev) => [...prev, ...previews]);

      try {
        // Step 1: Batch presign all files
        const presignResult = await rentDraftService.presignMedia(draftId, {
          files: uniqueFiles.map((file, i) => ({
            mediaType: "PHOTO" as const,
            fileName: file.name,
            contentType: file.type,
            fileSizeBytes: file.size,
            sortOrder: media.photos.length + i,
          })),
        });

        // Step 2: Upload all files to S3 in parallel
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

        // Step 3: Confirm only successfully uploaded files
        for (const result of uploadResults) {
          if (result.status === "rejected") {
            toast.error("Failed to upload a photo.");
            continue;
          }
          const { upload, file, index } = result.value;

          const confirmed = await rentDraftService.confirmMedia(
            draftId,
            upload.mediaId,
            {
              fileSizeBytes: file.size,
              sortOrder: media.photos.length + index,
            }
          );

          // Remove preview BEFORE restoring draft to avoid duplicates
          setUploadingFiles((prev) =>
            prev.filter((f) => f.id !== previews[index].id)
          );
          URL.revokeObjectURL(previews[index].previewUrl);

          dispatch(restoreFromDraft(confirmed));
        }
      } catch {
        toast.error("Failed to upload photos.");
      } finally {
        // Clean up any remaining previews (e.g. from errors)
        setUploadingFiles((prev) => {
          const remaining = prev.filter((f) => previews.some((p) => p.id === f.id));
          remaining.forEach((f) => URL.revokeObjectURL(f.previewUrl));
          return prev.filter((f) => !previews.some((p) => p.id === f.id));
        });
      }
    },
    [draftId, dispatch, media.photos, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  async function removePhoto(item: DraftMediaItem) {
    if (!draftId || deletingIds.has(item.id)) return;
    setDeletingIds((prev) => new Set(prev).add(item.id));
    try {
      await rentDraftService.deleteMedia(draftId, item.id);
      dispatch(
        setMedia({
          photos: media.photos.filter((p) => p.id !== item.id),
          items: media.items.filter((i) => i.id !== item.id),
        })
      );
    } catch {
      toast.error("Failed to delete photo.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  function handleSaveTourUrl() {
    const tempTour: DraftMediaItem = {
      id: crypto.randomUUID(),
      url: tourUrlInput,
      status: "PENDING",
      mediaType: "TOUR_3D",
      fileName: "",
      contentType: "",
      fileSizeBytes: 0,
      sortOrder: 0,
      objectKey: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(setMedia({ tours3d: [tempTour], items: [...media.items.filter((i) => i.mediaType !== "TOUR_3D"), tempTour] }));
    setTourModalOpen(false);
  }

  function removeTourUrl() {
    dispatch(
      setMedia({
        tours3d: [],
        items: media.items.filter((i) => i.mediaType !== "TOUR_3D"),
      })
    );
    setTourUrlInput("");
  }

  const tourUrl = media.tours3d[0]?.url ?? "";

  return (
    <div className="flex flex-1 flex-col">
      <div className="max-w-lg space-y-8">
        {/* Section 1 — Add photos */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("addPhotosHeading")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("addPhotosSubtitle")}
          </p>

          <div
            {...getRootProps()}
            className={`mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 transition-colors ${
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

          {/* Photo thumbnails */}
          {(media.photos.length > 0 || uploadingFiles.length > 0) && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.photos.map((item) => {
                const isDeleting = deletingIds.has(item.id);
                return (
                  <div key={item.id} className="group relative aspect-square">
                    <div className="size-full overflow-hidden rounded-lg">
                      <img
                        src={item.url}
                        alt={item.fileName}
                        className={`size-full object-cover${isDeleting ? " opacity-40" : ""}`}
                      />
                    </div>
                    {isDeleting ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-200/60">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePhoto(item)}
                        className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
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
        </div>

        {/* Section 2 — 3D Tour */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("tourHeading")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("tourSubtitle")}
          </p>

          {tourUrl ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <span className="flex-1 truncate text-sm">{tourUrl}</span>
              <button
                type="button"
                onClick={removeTourUrl}
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setTourModalOpen(true)}
              className="mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 transition-colors hover:border-brand hover:bg-brand/10"
            >
              <Image
                src="/icons/video-frame.svg"
                alt="Video Frame"
                width={32}
                height={32}
              />
              <p className="mt-2 text-sm font-medium text-brand">
                {t("addTour")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tour URL Dialog */}
      <Dialog open={tourModalOpen} onOpenChange={setTourModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tourUrlDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={tourUrlInput}
              onChange={(e) => setTourUrlInput(e.target.value)}
              placeholder={t("tourUrlPlaceholder")}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTourModalOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSaveTourUrl}
                disabled={!tourUrlInput.trim()}
                className="bg-brand text-white hover:bg-brand-dark"
              >
                {t("saveTour")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
