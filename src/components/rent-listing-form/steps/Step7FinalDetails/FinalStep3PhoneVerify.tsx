"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store";
import { setFinalDetails } from "@/store/slices/listingFormSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

type PhoneStep = "idle" | "input" | "otp" | "verified";

export function FinalStep3PhoneVerify() {
  const t = useTranslations("listing.finalDetails");
  const dispatch = useAppDispatch();
  const finalDetails = useAppSelector(
    (s) => s.listingForm.formData.finalDetails
  );

  const [phoneStep, setPhoneStep] = useState<PhoneStep>(
    finalDetails.phoneNumber ? "verified" : "idle"
  );
  const [phoneInput, setPhoneInput] = useState(finalDetails.phoneNumber ?? "");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = useCallback(() => {
    if (!phoneInput.trim()) return;
    dispatch(setFinalDetails({ phoneNumber: phoneInput.trim() }));
    setOtpValues(Array(6).fill(""));
    setPhoneStep("otp");
  }, [phoneInput, dispatch]);

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

      // Auto-verify when all 6 digits entered
      if (next.every((d) => d !== "")) {
        setPhoneStep("verified");
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

      if (next.every((d) => d !== "")) {
        setPhoneStep("verified");
      }
    },
    []
  );

  const handleChangeNumber = useCallback(() => {
    setPhoneStep("input");
    setOtpValues(Array(6).fill(""));
  }, []);

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

      {/* Phone number */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          {t("phoneNumberLabel")}
          <span className="text-brand">*</span>
        </Label>

        {/* Idle — show "Add phone number" button */}
        {phoneStep === "idle" && (
          <Button
            variant="outline"
            onClick={() => setPhoneStep("input")}
            className="text-sm font-medium cursor-pointer"
          >
            {t("addPhoneNumber")}
          </Button>
        )}

        {/* Input — phone field + Send OTP button */}
        {phoneStep === "input" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+998 90 123 4567"
                className="h-12 text-base"
                autoFocus
              />
              <Button
                onClick={handleSendOtp}
                disabled={!phoneInput.trim()}
                className="h-12! shrink-0 bg-brand px-6 text-sm font-medium text-white btn-brand-shadow hover:bg-brand-dark cursor-pointer"
              >
                {t("sendOtp")}
              </Button>
            </div>
          </div>
        )}

        {/* OTP — 6 digit boxes */}
        {phoneStep === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("verifyCode", { phone: finalDetails.phoneNumber ?? "" })}
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
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              className="text-sm font-medium text-brand hover:underline"
            >
              {t("resendCode")}
            </button>
          </div>
        )}

        {/* Verified — show number with checkmark and change option */}
        {phoneStep === "verified" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-green-600" />
              <span className="text-sm font-medium text-foreground">
                {finalDetails.phoneNumber}
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
      </div>
    </div>
  );
}
