"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSalePhoneVerification } from "@/store/slices/saleListingSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronDown } from "lucide-react";
import { useSalePhoneVerification } from "@/hooks/useSalePhoneVerification";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

type PhoneCountry = {
  code: CountryCode;
  dialCode: string;
};

/** Same order as rent listing `FinalStep3PhoneVerify` for consistency. */
const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "US", dialCode: "+1" },
  { code: "PK", dialCode: "+92" },
  { code: "UZ", dialCode: "+998" },
  { code: "RU", dialCode: "+7" },
];

function deriveInitialPhoneParts(phoneE164: string | null | undefined): {
  countryCode: CountryCode;
  nationalNumber: string;
} {
  if (!phoneE164) {
    return { countryCode: "US", nationalNumber: "" };
  }

  const parsed = parsePhoneNumberFromString(phoneE164);
  if (!parsed || !parsed.country) {
    return { countryCode: "US", nationalNumber: "" };
  }

  const supported = PHONE_COUNTRIES.some((c) => c.code === parsed.country);
  if (!supported) {
    return { countryCode: "US", nationalNumber: "" };
  }

  return {
    countryCode: parsed.country,
    nationalNumber: parsed.nationalNumber,
  };
}

/** Human-readable international format so country code is visible (same idea as rent flow). */
function formatPhoneForDisplay(e164: string | null | undefined): string {
  if (!e164?.trim()) return "";
  const parsed = parsePhoneNumberFromString(e164);
  return parsed?.formatInternational() ?? e164;
}

export type SalePhoneVerificationBlockProps = {
  contactPhone: string;
  onContactPhoneChange: (phoneE164: string) => void;
};

export function SalePhoneVerificationBlock({
  contactPhone,
  onContactPhoneChange,
}: SalePhoneVerificationBlockProps) {
  const t = useTranslations("saleListing.form");
  const dispatch = useAppDispatch();
  const salePhoneVerified = useAppSelector((s) => s.saleListing.salePhoneVerified);
  const verifiedSalePhone = useAppSelector((s) => s.saleListing.verifiedSalePhone);

  const initialPhoneParts = deriveInitialPhoneParts(
    verifiedSalePhone ?? contactPhone
  );
  const [countryCode, setCountryCode] = useState<CountryCode>(
    initialPhoneParts.countryCode
  );
  const [nationalNumberInput, setNationalNumberInput] = useState(
    initialPhoneParts.nationalNumber
  );
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [localPhoneError, setLocalPhoneError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    phase,
    phone,
    errorKey,
    isBusy,
    sendCode,
    resendCode,
    verifyCode,
    changePhoneNumber,
  } = useSalePhoneVerification({
    recaptchaContainerId: "sale-phone-recaptcha",
    initialPhone: contactPhone || undefined,
    initialVerified: Boolean(salePhoneVerified && verifiedSalePhone),
  });

  const isOtpPhase =
    phase === "otpSent" ||
    phase === "verifyingOtp" ||
    phase === "submittingBackend";

  const errorMessageMap = {
    invalid_phone_number: t("phoneVerifyErrorInvalidPhone"),
    missing_otp: t("phoneVerifyErrorMissingOtp"),
    invalid_otp: t("phoneVerifyErrorInvalidOtp"),
    otp_expired: t("phoneVerifyErrorCodeExpired"),
    too_many_requests: t("phoneVerifyErrorTooManyRequests"),
    captcha_failed: t("phoneVerifyErrorCaptchaFailed"),
    network_error: t("phoneVerifyErrorNetwork"),
    unexpected_error: t("phoneVerifyErrorUnexpected"),
  } as const;

  const selectedCountry =
    PHONE_COUNTRIES.find((country) => country.code === countryCode) ??
    PHONE_COUNTRIES[0];

  const buildE164FromCurrentInput = useCallback(() => {
    const parsed = parsePhoneNumberFromString(
      nationalNumberInput,
      countryCode
    );
    if (!parsed || !parsed.isValid()) {
      return null;
    }
    return parsed.number;
  }, [countryCode, nationalNumberInput]);

  const handleSendOtp = useCallback(async () => {
    const e164Phone = buildE164FromCurrentInput();
    if (!e164Phone) {
      setLocalPhoneError(t("phoneVerifyErrorInvalidPhone"));
      return;
    }
    setLocalPhoneError(null);
    onContactPhoneChange(e164Phone);
    const ok = await sendCode(e164Phone);
    if (ok) {
      setOtpValues(Array(6).fill(""));
      requestAnimationFrame(() => inputRefs.current[0]?.focus());
    }
  }, [buildE164FromCurrentInput, onContactPhoneChange, sendCode, t]);

  const handleVerifyOtp = useCallback(async () => {
    if (otpValues.some((digit) => !digit)) return;
    const ok = await verifyCode(otpValues.join(""));
    if (!ok) return;
    const verified = buildE164FromCurrentInput() ?? phone;
    dispatch(
      setSalePhoneVerification({ verified: true, phoneE164: verified })
    );
    onContactPhoneChange(verified);
    const parts = deriveInitialPhoneParts(verified);
    setCountryCode(parts.countryCode);
    setNationalNumberInput(parts.nationalNumber);
  }, [buildE164FromCurrentInput, dispatch, otpValues, phone, verifyCode, onContactPhoneChange]);

  const handleResendCode = useCallback(async () => {
    const ok = await resendCode();
    if (!ok) return;
    setOtpValues(Array(6).fill(""));
    inputRefs.current[0]?.focus();
  }, [resendCode]);

  const handleChangeNumber = useCallback(() => {
    changePhoneNumber();
    setOtpValues(Array(6).fill(""));
    setLocalPhoneError(null);
    dispatch(setSalePhoneVerification({ verified: false, phoneE164: null }));
  }, [changePhoneNumber, dispatch]);

  /** Keep inputs aligned with Redux when already verified (e.g. late hydration). Avoid sync setState in effect (React 19). */
  useEffect(() => {
    if (phase !== "verified" || !verifiedSalePhone) return;
    const parts = deriveInitialPhoneParts(verifiedSalePhone);
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCountryCode(parts.countryCode);
      setNationalNumberInput(parts.nationalNumber);
    });
    return () => {
      cancelled = true;
    };
  }, [phase, verifiedSalePhone]);

  return (
    <div className="mt-4 max-w-md space-y-4">
      <div id="sale-phone-recaptcha" />

      {phase === "verified" ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            <CheckCircle className="size-4 shrink-0 text-green-600" />
            <span className="font-medium text-foreground">
              {formatPhoneForDisplay(verifiedSalePhone ?? phone)}
            </span>
            <span className="text-xs font-medium text-green-600">
              {t("phoneVerifiedStatus")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-8"
              onClick={handleChangeNumber}
            >
              {t("phoneChangeNumber")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-stretch gap-3">
            {/* Country ~30%, number input ~70% */}
            <div className="relative w-[25%] shrink-0">
              <label className="sr-only" htmlFor="sale-phone-country">
                {t("phoneCountry")}
              </label>
              <select
                id="sale-phone-country"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value as CountryCode);
                  setLocalPhoneError(null);
                }}
                disabled={isBusy}
                aria-label={t("phoneCountry")}
                className="h-12 w-full cursor-pointer appearance-none rounded-md border border-input bg-transparent pl-3 pr-10 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {PHONE_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    ({country.dialCode}) {country.code}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </div>
            <Input
              type="tel"
              value={nationalNumberInput}
              onChange={(e) => {
                setNationalNumberInput(e.target.value);
                setLocalPhoneError(null);
              }}
              placeholder={t("phoneNationalPlaceholder")}
              className="h-12 min-w-0 flex-1 text-base"
              disabled={isBusy}
            />
          </div>
          {localPhoneError ? (
            <p className="text-sm text-destructive">{localPhoneError}</p>
          ) : null}
          {errorKey && phase === "error" ? (
            <p className="text-sm text-destructive">
              {errorMessageMap[errorKey]}
            </p>
          ) : null}

          {!isOtpPhase ? (
            <Button
              type="button"
              className="h-11 bg-brand text-white hover:bg-brand/90"
              disabled={isBusy}
              onClick={() => void handleSendOtp()}
            >
              {isBusy ? t("phoneSendingCode") : t("phoneSendCode")}
            </Button>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm">{t("phoneEnterCode")}</Label>
              <div className="flex gap-2">
                {otpValues.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-10 text-center text-lg"
                    value={digit}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otpValues];
                      next[i] = v;
                      setOtpValues(next);
                      if (v && i < 5) inputRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValues[i] && i > 0) {
                        inputRefs.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="bg-brand text-white hover:bg-brand/90"
                  disabled={isBusy}
                  onClick={() => void handleVerifyOtp()}
                >
                  {isBusy ? t("phoneVerifying") : t("phoneVerify")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => void handleResendCode()}
                >
                  {t("phoneResend")}
                </Button>
                <Button type="button" variant="ghost" onClick={handleChangeNumber}>
                  {t("phoneChangeNumber")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        {t("phoneVerifyHint", { dial: selectedCountry.dialCode })}
      </p>
    </div>
  );
}
