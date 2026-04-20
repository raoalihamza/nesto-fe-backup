"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  restoreFromDraft,
  setFinalDetails,
} from "@/store/slices/listingFormSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRentPhoneVerification } from "@/hooks/useRentPhoneVerification";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

type PhoneCountry = {
  code: CountryCode;
  dialCode: string;
};

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

export function FinalStep3PhoneVerify() {
  const t = useTranslations("listing.finalDetails");
  const dispatch = useAppDispatch();
  const draftId = useAppSelector((s) => s.listingForm.draftId);
  const mode = useAppSelector((s) => s.listingForm.mode);
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  const initialPhoneParts = deriveInitialPhoneParts(finalDetails.phoneNumber);
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
  } = useRentPhoneVerification({
    draftId,
    recaptchaContainerId: "rent-phone-recaptcha",
    initialPhone: finalDetails.phoneNumber,
    initialVerified: Boolean(finalDetails.phoneVerified && finalDetails.phoneNumber),
    mode,
  });

  const isOtpPhase =
    phase === "otpSent" ||
    phase === "verifyingOtp" ||
    phase === "submittingBackend";

  const errorMessageMap = {
    missing_draft_id: t("phoneVerifyErrorMissingDraft"),
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
    const parsed = parsePhoneNumberFromString(nationalNumberInput, countryCode);
    if (!parsed || !parsed.isValid()) {
      return null;
    }
    return parsed.number;
  }, [countryCode, nationalNumberInput]);

  const handleSendOtp = useCallback(async () => {
    const e164Phone = buildE164FromCurrentInput();
    if (!e164Phone) {
      setLocalPhoneError(
        t("phoneVerifyErrorInvalidPhoneForCountry", {
          country: selectedCountry.code,
        })
      );
      return;
    }

    setLocalPhoneError(null);
    const ok = await sendCode(e164Phone);
    if (!ok) return;

    setOtpValues(Array(6).fill(""));
    dispatch(
      setFinalDetails({
        phoneNumber: e164Phone,
        phoneVerified: false,
      })
    );
  }, [buildE164FromCurrentInput, dispatch, selectedCountry.code, sendCode, t]);

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const digit = value.slice(-1);
      const next = [...otpValues];
      next[index] = digit;
      setOtpValues(next);

      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otpValues]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otpValues]
  );

  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (!pasted) return;

      const next = Array(6).fill("");
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }

      setOtpValues(next);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    },
    []
  );

  const handleVerifyOtp = useCallback(async () => {
    if (otpValues.some((digit) => !digit)) return;
    const response = await verifyCode(otpValues.join(""));
    if (!response) return;

    const verifiedPhoneFromResponse = response.finalDetails?.phoneNumber ?? null;
    const fallbackVerifiedPhone = phone || finalDetails.phoneNumber || null;

    // Draft and edit responses share the same shape; reuse the same hydrator.
    dispatch(restoreFromDraft(response));

    // Defensive fallback: some verify-phone responses may not include finalDetails.phoneNumber.
    // Keep the just-verified phone in Redux for UI; final-details PUT omits phone (backend-owned).
    if (!verifiedPhoneFromResponse && fallbackVerifiedPhone) {
      dispatch(
        setFinalDetails({
          phoneNumber: fallbackVerifiedPhone,
          phoneVerified: true,
        })
      );
    }
  }, [dispatch, finalDetails.phoneNumber, otpValues, phone, verifyCode]);

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
    dispatch(setFinalDetails({ phoneVerified: false }));
  }, [changePhoneNumber, dispatch]);

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("phoneVerifyHeading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("phoneVerifySubtitle")}
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          {t("phoneNumberLabel")}
          <span className="text-brand">*</span>
        </Label>

        {!isOtpPhase && phase !== "verified" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-[200px]">
                <label className="sr-only" htmlFor="rent-phone-country">
                  {t("phoneCountryLabel")}
                </label>
                <select
                  id="rent-phone-country"
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value as CountryCode);
                    setLocalPhoneError(null);
                  }}
                  disabled={isBusy}
                  className="h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {PHONE_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code} className="cursor-pointer">
                      ({country.dialCode}) {country.code}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="tel"
                value={nationalNumberInput}
                onChange={(e) => {
                  setNationalNumberInput(e.target.value);
                  setLocalPhoneError(null);
                }}
                placeholder={t("phoneNationalPlaceholder")}
                className="h-12 text-base"
                autoFocus={Boolean(!finalDetails.phoneVerified)}
                disabled={isBusy}
              />
              <Button
                onClick={handleSendOtp}
                disabled={!nationalNumberInput.trim() || isBusy || !draftId}
                className="h-12! shrink-0 bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark cursor-pointer"
              >
                {phase === "sendingOtp" ? t("sendingCode") : t("sendOtp")}
              </Button>
            </div>
            {!draftId ? (
              <p className="text-sm text-destructive">
                {t("phoneVerifyErrorMissingDraft")}
              </p>
            ) : null}
            {localPhoneError ? (
              <p className="text-sm text-destructive">{localPhoneError}</p>
            ) : null}
          </div>
        )}

        {isOtpPhase && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("verifyCode", {
                phone: phone || finalDetails.phoneNumber || "",
              })}
            </p>

            <div className="flex gap-2">
              {otpValues.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className="h-12 w-12 rounded-lg border border-border text-center text-lg font-semibold text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand"
                  autoFocus={i === 0}
                  disabled={isBusy}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpValues.some((digit) => !digit) || isBusy}
                className="h-11 bg-brand px-5 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark cursor-pointer"
              >
                {phase === "verifyingOtp"
                  ? t("verifyingCode")
                  : phase === "submittingBackend"
                    ? t("submittingPhoneVerification")
                    : t("verifyOtp")}
              </Button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isBusy}
                className="text-sm font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("resendCode")}
              </button>
              <button
                type="button"
                onClick={handleChangeNumber}
                disabled={isBusy}
                className="text-sm font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("changeNumber")}
              </button>
            </div>
          </div>
        )}

        {phase === "verified" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-green-600" />
              <span className="text-sm font-medium text-foreground">
                {finalDetails.phoneNumber ?? phone}
              </span>
              <span className="text-xs font-medium text-green-600">
                {t("verified")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-sm font-medium text-brand hover:underline"
            >
              {t("changeNumber")}
            </button>
          </div>
        )}

        {errorKey ? (
          <p className="text-sm text-destructive">
            {errorMessageMap[errorKey] ?? t("phoneVerifyErrorUnexpected")}
          </p>
        ) : null}

        <div id="rent-phone-recaptcha" className="hidden" />
      </div>
    </div>
  );
}
