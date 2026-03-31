"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { useAppSelector, useAppDispatch } from "@/store";
import { setMedia } from "@/store/slices/listingFormSlice";
import { CloudUpload, LayoutGrid, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Step3Media() {
  const t = useTranslations("listing.media");
  const dispatch = useAppDispatch();
  const media = useAppSelector((s) => s.listingForm.formData.media);

  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourUrlInput, setTourUrlInput] = useState(media.tourUrl);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
      dispatch(setMedia({ photos: [...media.photos, ...newUrls] }));
    },
    [dispatch, media.photos],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  function removePhoto(index: number) {
    const updated = media.photos.filter((_, i) => i !== index);
    const newCoverIndex =
      media.coverPhotoIndex >= updated.length
        ? Math.max(0, updated.length - 1)
        : media.coverPhotoIndex;
    dispatch(setMedia({ photos: updated, coverPhotoIndex: newCoverIndex }));
  }

  function handleSaveTourUrl() {
    dispatch(setMedia({ tourUrl: tourUrlInput }));
    setTourModalOpen(false);
  }

  function removeTourUrl() {
    dispatch(setMedia({ tourUrl: "" }));
    setTourUrlInput("");
  }

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
          {media.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.photos.map((url, index) => (
                <div key={index} className="group relative aspect-square">
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="size-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
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

          {media.tourUrl ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <span className="flex-1 truncate text-sm">{media.tourUrl}</span>
              <button
                type="button"
                onClick={removeTourUrl}
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
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
