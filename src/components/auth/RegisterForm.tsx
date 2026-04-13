"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NestoLogo } from "@/components/auth/NestoLogo";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useRegister } from "@/hooks/auth/useRegister";
import { toast } from "sonner";
import { getSafeReturnUrl } from "@/lib/auth/safeReturnUrl";
import { ROUTES } from "@/lib/constants/routes";

export function RegisterForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const returnUrl = useMemo(
    () => getSafeReturnUrl(searchParams.get("returnUrl")),
    [searchParams]
  );

  const loginHref = useMemo(() => {
    if (!returnUrl) return ROUTES.LOGIN;
    const q = new URLSearchParams({ returnUrl });
    return `${ROUTES.LOGIN}?${q.toString()}`;
  }, [returnUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      {
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (registerMutation.isSuccess) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <Mail className="h-12 w-12 text-brand" />
          <h2 className="text-xl font-bold text-foreground">
            {t("registrationSuccess")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("registrationSuccessSubtitle", { email: getValues("email") })}
          </p>
          <Link href={loginHref}>
            <Button className="btn-brand-shadow bg-brand text-white hover:opacity-90">
              {t("goToLogin")}
            </Button>
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
        {t("createAccount")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              {t("firstName")} <span className="text-brand">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder={t("enterFirstName")}
              className="h-12 rounded-lg"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              {t("lastName")} <span className="text-brand">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder={t("enterLastName")}
              className="h-12 rounded-lg"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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
            {t("confirmPassword")}
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

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="btn-brand-shadow h-12 w-full rounded-lg bg-brand text-white hover:opacity-90"
        >
          {registerMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            t("continue")
          )}
        </Button>
      </form>

      <p className="text-left text-sm text-accent-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href={loginHref}
          className="font-medium text-brand hover:text-brand-dark underline"
        >
          {t("signInLink")}
        </Link>
      </p>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-400" />
        <span className="text-sm text-accent-foreground">{t("or")}</span>
        <div className="h-px flex-1 bg-gray-400" />
      </div>

      <SocialLoginButtons
        isLoading={registerMutation.isPending}
        returnUrl={returnUrl}
      />
    </div>
  );
}
