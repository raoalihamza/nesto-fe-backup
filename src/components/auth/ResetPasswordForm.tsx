"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NestoLogo } from "@/components/auth/NestoLogo";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) return;
    mutation.mutate({ token, newPassword: data.password });
  };

  if (!token) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <p className="text-sm text-destructive">{t("invalidResetLink")}</p>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand hover:text-brand-dark underline"
          >
            {t("sendResetLink")}
          </Link>
        </div>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-foreground">
            {t("passwordResetSuccess")}
          </h2>
          <Link
            href="/login"
            className="text-sm font-medium text-brand hover:text-brand-dark underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] space-y-6">
      <div className="flex justify-center pb-2">
        <NestoLogo size="lg" />
      </div>

      <h1 className="text-2xl font-bold text-foreground md:text-3xl">
        {t("resetPassword")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t("newPassword")} <span className="text-brand">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-12 rounded-lg pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            {t("confirmNewPassword")} <span className="text-brand">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="h-12 rounded-lg pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error?.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="btn-brand-shadow h-12 w-full rounded-lg bg-brand text-white hover:opacity-90"
        >
          {mutation.isPending ? "..." : t("setNewPassword")}
        </Button>
      </form>
    </div>
  );
}
