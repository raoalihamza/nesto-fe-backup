"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { DUMMY_PROPERTIES } from "@/lib/constants/dummyProperties";

// Exact SVG path from Figma's "Subtract" layer (viewBox 0 0 445 348)
const CARD_SHAPE_PATH =
  "M0 31.4569C0 14.0837 14.0837 0 31.4569 0H339.888C357.261 0 371.345 14.0837 371.345 31.4569V42.1983C371.345 59.1477 385.085 72.8879 402.034 72.8879H413.543C430.916 72.8879 445 86.9717 445 104.345V316.103C445 333.477 430.916 347.56 413.543 347.56H238.805C222.405 347.56 206.676 329.147 190.276 329.147H31.4569C14.0837 329.147 0 315.063 0 297.69V31.4569Z";

// mask-image with inline SVG — unlike clip-path, this works WITH backdrop-filter
const CARD_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 445 348'%3E%3Cpath d='M0 31.4569C0 14.0837 14.0837 0 31.4569 0H339.888C357.261 0 371.345 14.0837 371.345 31.4569V42.1983C371.345 59.1477 385.085 72.8879 402.034 72.8879H413.543C430.916 72.8879 445 86.9717 445 104.345V316.103C445 333.477 430.916 347.56 413.543 347.56H238.805C222.405 347.56 206.676 329.147 190.276 329.147H31.4569C14.0837 329.147 0 315.063 0 297.69V31.4569Z' fill='white'/%3E%3C/svg%3E")`;

const HERO_IMAGES = [
  "/images/hero.png",
  "/images/hero.png",
  "/images/hero.png",
];

export function HeroSection() {
  const t = useTranslations("home");
  const tLease = useTranslations("listing.finalDetails");
  const [activeSlide, setActiveSlide] = useState(0);
  const featured = DUMMY_PROPERTIES.find((p) => p.featured);

  return (
    <section className="relative mx-auto max-w-7xl px-0 pt-4 md:pt-6">
      <div className="relative">
        {/* ── Hero background image ── */}
        <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-gray-300 md:h-[470px]">
          <Image
            src={HERO_IMAGES[activeSlide]}
            alt="Hero"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />

          {/* ── Featured property promo card ── */}
          {featured && (
            <div className="absolute bottom-12 left-5 md:bottom-22 md:left-8">
              {/* Card wrapper — fixed aspect ratio matching Figma (445 × 348) */}
              <div className="relative w-[210px] h-[160px] md:w-[340px] md:h-[270px]">
                {/*
                  Layer 1: Glassmorphism background
                  Uses mask-image (NOT clip-path) because clip-path breaks
                  backdrop-filter in browsers. mask-image keeps blur working.
                */}
                <div
                  className="absolute inset-0 bg-black/25 shadow-2xl backdrop-blur-sm"
                  style={{
                    WebkitMaskImage: CARD_MASK,
                    maskImage: CARD_MASK,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />

                {/*
                  Layer 2: Border stroke
                  Separate SVG overlay using the original 445×348 path with a
                  white stroke at 29 % opacity — scales via viewBox.
                */}
                <svg
                  viewBox="0 0 445 348"
                  fill="none"
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <path
                    d={CARD_SHAPE_PATH}
                    stroke="rgba(255,255,255,0.29)"
                    strokeWidth="1.2"
                    fill="none"
                  />
                </svg>

                {/*
                  Layer 3: CTA arrow button
                  Positioned to sit inside the concave notch at top-right
                */}
                <button className="absolute -right-1 -top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg md:-right-1 md:-top-1 md:h-12 md:w-12">
                  <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>

                {/* Layer 4: Text content */}
                <div className="absolute left-[13%] top-[15%] right-[20%] z-[5]">
                  <p className="text-[10px] font-normal text-white/85 md:text-sm">
                    {t("featuredProperty.city")}
                  </p>
                  <h3 className="mt-1 text-base font-medium leading-tight text-white underline underline-offset-4 md:text-2xl">
                    {t("featuredProperty.title")}
                  </h3>
                  <p className="mt-2 max-w-[290px] text-[10px] font-medium leading-relaxed text-white/90 md:mt-4 md:text-sm md:leading-[24px]">
                    {t("featuredProperty.description")}
                  </p>
                </div>

                {/* Layer 5: Price badge — inside card, bottom-right */}
                <div className="absolute bottom-[5%] right-[6%] z-10 rounded-lg bg-brand px-2 py-1 shadow-[0px_10px_15px_-3px_rgba(192,33,33,0.2),0px_4px_6px_-4px_rgba(192,33,33,0.2)]">
                  <p className="text-[12px] font-medium text-white md:text-xs">
                    {featured.leaseDuration
                      ? t("featuredRentBadge", {
                          duration: tLease(
                            `leaseDurationOptions.${featured.leaseDuration}` as never,
                          ),
                        })
                      : null}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    £{featured.monthlyRent?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Thumbnail gallery (top-right) ── */}
        <div className="absolute right-3 top-3 w-[150px] rounded-xl bg-white/92 p-1.5 shadow-lg backdrop-blur-sm md:right-0 md:top-0 md:w-[260px]">
          <div className="grid grid-cols-3 gap-2">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className="overflow-hidden rounded-xl"
                aria-label={`slide-${i + 1}`}
              >
                <Image
                  src={img}
                  alt=""
                  width={150}
                  height={90}
                  className="h-[36px] w-full object-cover md:h-[60px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </button>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-4 px-1">
            {HERO_IMAGES.map((_, i) => (
              <span
                key={`bar-${i}`}
                className={`h-1 rounded-full ${
                  i === activeSlide ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="relative z-10 mx-auto -mt-9 max-w-6xl px-2 md:-mt-11">
        <div className="rounded-xl bg-white p-2.5 shadow-xl ring-1 ring-black/5 md:p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.6fr_1fr_1fr_1.4fr_auto]">
            <div className="rounded-md border border-gray-100 px-3 py-2">
              <p className="text-[11px] font-semibold">
                {t("searchPlaceholder")}
              </p>
              <p className="text-xs text-gray-400">{t("searchPlaceholder")}</p>
            </div>
            <div className="rounded-md border border-gray-100 px-3 py-2">
              <p className="text-[11px] font-semibold">{t("checkIn")}</p>
              <p className="text-xs text-gray-400">{t("selectDate")}</p>
            </div>
            <div className="rounded-md border border-gray-100 px-3 py-2">
              <p className="text-[11px] font-semibold">{t("checkOut")}</p>
              <p className="text-xs text-gray-400">{t("selectDate")}</p>
            </div>
            <div className="rounded-md border border-gray-100 px-3 py-2">
              <p className="text-[11px] font-semibold">{t("guests")}</p>
              <p className="text-xs text-gray-400">{t("selectNumber")}</p>
            </div>
            <button className="btn-brand-shadow rounded-md bg-brand px-6 py-2 text-sm font-semibold text-white">
              {t("search")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
