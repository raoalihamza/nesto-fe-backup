"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/store";
import { setCredentials, setLoading, setError } from "@/store/slices/authSlice";
import { loginApi, socialLoginApi } from "@/lib/api/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NestoLogo } from "./NestoLogo";
import { SocialLoginButtons } from "./SocialLoginButtons";

export function LoginForm() {
  const t = useTranslations("auth");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    dispatch(setLoading(true));
    try {
      const response = await loginApi(data.email, data.password);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      router.push("/dashboard");
    } catch {
      dispatch(setError("Login failed. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook" | "apple") => {
    setIsSubmitting(true);
    dispatch(setLoading(true));
    try {
      const response = await socialLoginApi(provider);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      router.push("/dashboard");
    } catch {
      dispatch(setError("Social login failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-6">
      <div className="flex justify-center">
        <NestoLogo size="lg" />
      </div>

      <h1 className="text-2xl font-bold text-foreground md:text-3xl">
        {t("signIn")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t("emailAddress")} <span className="text-brand">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("enterEmail")}
            className="h-12 rounded-lg"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </Label>
          <Input
            id="password"
            type="password"
            className="h-12 rounded-lg"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-brand hover:text-brand-dark"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-brand-shadow h-12 w-full rounded-lg bg-brand text-white hover:bg-brand-dark"
        >
          {isSubmitting ? "..." : t("continue")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("newToNesto")}{" "}
        <Link
          href="/register"
          className="font-medium text-brand hover:text-brand-dark"
        >
          {t("createAccountLink")}
        </Link>
      </p>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-muted-foreground">{t("or")}</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={isSubmitting} />
    </div>
  );
}
